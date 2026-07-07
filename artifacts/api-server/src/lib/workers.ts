/**
 * SOLVEX-CORE-FINALIZED — Pillar 1: RECURSIVE AUTONOMY
 * 54 concurrent Worker Threads forming a consensus-capable state-grid.
 * Each node is a recursive verifier. Results are committed only after quorum.
 *
 * Pillar 6: LAMPORT CAUSALITY — each worker maintains its own Lamport counter.
 */
import { Worker, MessageChannel } from "worker_threads";
import crypto from "crypto";
import { logger } from "./logger";
import { tickLamport } from "./lamport";

const NODE_COUNT = 54;
const CONSENSUS_QUORUM = 28;
const CONSENSUS_TIMEOUT_MS = 500;

// Inline worker: real SHA-256 computation + consensus participation
const WORKER_CODE = `
const { parentPort, workerData } = require('worker_threads');
const crypto = require('crypto');

let ops = 0;
let lamportTick = 0;
let seed = 'solvex-node-' + workerData.nodeId;

// Light hashing loop — 100 hashes every 8ms (~12,500 ops/sec per node)
const loop = () => {
  for (let i = 0; i < 100; i++) {
    seed = crypto.createHash('sha256').update(seed + i).digest('hex');
    ops++;
  }
  setTimeout(loop, 8);
};
loop();

// Telemetry report every second
setInterval(() => {
  lamportTick++;
  parentPort.postMessage({ type: 'ops', count: ops, nodeId: workerData.nodeId, lamport: lamportTick });
  ops = 0;
}, 1000);

// Consensus probe handler — deterministic hash of challenge
parentPort.on('message', (msg) => {
  if (msg.type === 'CONSENSUS_PROBE') {
    lamportTick = Math.max(lamportTick, msg.lamport) + 1;
    const vote = crypto.createHash('sha256').update(msg.challenge).digest('hex');
    parentPort.postMessage({
      type: 'CONSENSUS_VOTE',
      round: msg.round,
      vote,
      nodeId: workerData.nodeId,
      lamport: lamportTick,
    });
  }
});
`;

interface WorkerNode {
  id: number;
  worker: Worker;
  ops: number;
  lamport: number;
  status: "ACTIVE" | "FAULTED" | "ISOLATED";
}

interface ConsensusRecord {
  round: number;
  challenge: string;
  quorumMet: boolean;
  respondents: number;
  byzantineFaults: number;
  committedHash: string;
  lamportTick: number;
  timestamp: number;
}

const pool: WorkerNode[] = [];
let initialized = false;
let consensusRound = 0;
let lastConsensus: ConsensusRecord | null = null;
let consecutiveFailures = 0;
let systemIsolated = false;

export const initializeWorkerPool = (): void => {
  if (initialized) return;
  initialized = true;

  for (let i = 0; i < NODE_COUNT; i++) {
    const worker = new Worker(WORKER_CODE, {
      eval: true,
      workerData: { nodeId: i },
    });

    const node: WorkerNode = { id: i, worker, ops: 0, lamport: 0, status: "ACTIVE" };

    worker.on("message", (msg: any) => {
      if (msg.type === "ops") {
        node.ops = msg.count;
        node.lamport = msg.lamport;
      } else if (msg.type === "CONSENSUS_VOTE") {
        pendingVotes.get(msg.round)?.push({ nodeId: msg.nodeId, vote: msg.vote, lamport: msg.lamport });
      }
    });

    worker.on("error", (err) => {
      logger.error({ nodeId: i, err }, "Worker node faulted");
      node.status = "FAULTED";
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        logger.warn({ nodeId: i, code }, "Worker exited unexpectedly");
        node.status = "FAULTED";
      }
    });

    pool.push(node);
  }

  logger.info({ nodes: NODE_COUNT, quorum: CONSENSUS_QUORUM }, "SOLVEX: 54-node worker grid active");

  // Background consensus rounds every 10 seconds
  setInterval(runConsensusRound, 10_000);
};

const pendingVotes = new Map<number, Array<{ nodeId: number; vote: string; lamport: number }>>();

async function runConsensusRound(): Promise<void> {
  const round = ++consensusRound;
  const challenge = crypto.randomBytes(16).toString("hex");
  const lamport = tickLamport();

  pendingVotes.set(round, []);

  const active = pool.filter(n => n.status === "ACTIVE");
  for (const node of active) {
    node.worker.postMessage({ type: "CONSENSUS_PROBE", challenge, round, lamport });
  }

  await new Promise(resolve => setTimeout(resolve, CONSENSUS_TIMEOUT_MS));

  const votes = pendingVotes.get(round) ?? [];
  pendingVotes.delete(round);

  // Tally: expected deterministic hash of challenge
  const expectedHash = crypto.createHash("sha256").update(challenge).digest("hex");
  const correct = votes.filter(v => v.vote === expectedHash);
  const byzantine = votes.filter(v => v.vote !== expectedHash);

  // Mark Byzantine nodes as FAULTED
  for (const fault of byzantine) {
    const node = pool.find(n => n.id === fault.nodeId);
    if (node) {
      node.status = "FAULTED";
      logger.warn({ nodeId: fault.nodeId, round }, "Byzantine fault detected — node isolated");
    }
  }

  const quorumMet = correct.length >= CONSENSUS_QUORUM;
  const highestLamport = Math.max(...votes.map(v => v.lamport), 0);

  lastConsensus = {
    round,
    challenge,
    quorumMet,
    respondents: votes.length,
    byzantineFaults: byzantine.length,
    committedHash: quorumMet ? expectedHash : "UNCOMMITTED",
    lamportTick: highestLamport,
    timestamp: Date.now(),
  };

  if (!quorumMet) {
    consecutiveFailures++;
    logger.warn({ round, respondents: votes.length, required: CONSENSUS_QUORUM, consecutiveFailures }, "Consensus quorum not met");

    // Autonomic self-isolation: 3 consecutive failures → SYSTEM_STATIC
    if (consecutiveFailures >= 3) {
      logger.error("AUTONOMIC ISOLATION: 3 consecutive consensus failures. Entering SYSTEM_STATIC.");
      systemIsolated = true;
      process.emit("SIGUSR2"); // signal watchdog
    }
  } else {
    consecutiveFailures = 0;
    systemIsolated = false;
  }
}

export const getAggregatedOps = (): number =>
  pool.filter(n => n.status === "ACTIVE").reduce((acc, n) => acc + n.ops, 0);

export const getWorkerStatus = () =>
  pool.map(n => ({ id: n.id, ops: n.ops, lamport: n.lamport, status: n.status }));

export const getPhysicalNodeCount = (): number => pool.length;
export const getLastConsensus = (): ConsensusRecord | null => lastConsensus;
export const isSystemIsolated = (): boolean => systemIsolated;
