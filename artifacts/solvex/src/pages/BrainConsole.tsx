import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { DaisyAvatar } from "../components/DaisyAvatar";
import { PARADOXES } from "../data/brainData";

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Playfair Display', serif";
const GOLD = "#D4AF37";
const NAVY = "#05080F";
const NAVY2 = "#07091A";
const DIM = "#3D4560";
const MID = "#5B6480";
const BLUE = "#60A5FA";
const PURPLE = "#A78BFA";
const GREEN = "#34D399";
const AMBER = "#F59E0B";

interface ChatMessage { role: "user" | "daisy"; content: string; ts: number; }

const INITIAL_MSG: ChatMessage = {
  role: "daisy",
  content: "dAIsy haMINJA Sovereign Core initialized.\n\nU.A.R.E.F.A.K.E. ENGINE CONSOLE — ACTIVE\nHomeostasis Index: 98.4% | Active Tethers: 14 | Pipeline: 420.69 ops/sec\nIRS EFTPS: SECURED & REMITTING | Lamport Clock: ORDERED\n\nAwaiting enterprise operator directives.",
  ts: Date.now(),
};

interface Prospect {
  id: string;
  company: string;
  inefficiency: string;
  strategy: string;
  compliance: string;
  roiSavings: number;
  price: number;
  status: "PENDING OPERATOR SIGN-OFF" | "AUTHORIZED — ENGAGING" | "NEGOTIATING SLA" | "CONTRACT SIGNED & SECURED";
  prob: number;
}

const INIT_PROSPECTS: Prospect[] = [
  {
    id: "p1", company: "NovaTech Solutions",
    inefficiency: "Manual tax reconciliation lag and lack of high-integrity audit logs.",
    strategy: "Deploy SolveX IRS Compliance Wrapper to automate 21% Tax Sequestration with real-time EFTPS remittance queuing.",
    compliance: "NIST SP 800-53 / SOC 2 Type II controls.",
    roiSavings: 330000, price: 72600, status: "PENDING OPERATOR SIGN-OFF", prob: 89.4,
  },
  {
    id: "p2", company: "Apex Logistics Corp",
    inefficiency: "Sub-optimal multi-layered contract execution and temporal race conditions.",
    strategy: "Integrate SolveX Lamport Clock Engine + Sovereign Core Module to enforce chronological event causal ordering.",
    compliance: "ISO 27001 & NIST 800-53 certified security architecture.",
    roiSavings: 250000, price: 55000, status: "PENDING OPERATOR SIGN-OFF", prob: 94.1,
  },
  {
    id: "p3", company: "Centrum BioGate",
    inefficiency: "High-volume B2B bio-fiduciary transactions without edge filtration, risking non-compliance.",
    strategy: "Deploy COPPA Enterprise Firewall and Sovereign Core Module to establish isolated verification tunnels.",
    compliance: "COPPA & SOC 2 validated isolation.",
    roiSavings: 450000, price: 99000, status: "PENDING OPERATOR SIGN-OFF", prob: 72.8,
  },
];

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusColor(s: Prospect["status"]) {
  if (s === "CONTRACT SIGNED & SECURED") return GREEN;
  if (s === "NEGOTIATING SLA") return BLUE;
  if (s === "AUTHORIZED — ENGAGING") return AMBER;
  return MID;
}

// ── COMM-LINK ─────────────────────────────────────────────────────────────────
function CommLink() {
  const [history, setHistory] = useState<ChatMessage[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  async function send(msg?: string, action?: string) {
    const text = msg ?? input.trim();
    if (!text && !action) return;
    if (!action) {
      setHistory(h => [...h, { role: "user", content: text, ts: Date.now() }]);
      setInput("");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/brain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action ? { action } : { message: text }),
      });
      const data = await res.json() as { response: string };
      setHistory(h => [...h, { role: "daisy", content: data.response, ts: Date.now() }]);
    } catch {
      setHistory(h => [...h, { role: "daisy", content: "Sovereign Core Error: Connection severed. Re-establishing encrypted quantum tunnel.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  const directives = [
    { label: "TAX AUDIT", action: "TAX_AUDIT", icon: "⚖" },
    { label: "PARADOX SCAN", action: "PARADOX", icon: "◈" },
    { label: "NIST GATE", action: "NIST", icon: "⬡" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      {/* Quick Directives */}
      <div style={{ padding: "10px 14px", border: "1px solid #1A2035", background: NAVY2, flexShrink: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", color: DIM, marginBottom: 8 }}>IMMEDIATE FIDUCIARY DIRECTIVES</div>
        <div style={{ display: "flex", gap: 8 }}>
          {directives.map(d => (
            <button key={d.action} onClick={() => send(undefined, d.action)} disabled={loading}
              style={{
                flex: 1, padding: "8px 0", background: "transparent",
                border: "1px solid rgba(212,175,55,0.25)", color: loading ? DIM : GOLD,
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                cursor: loading ? "not-allowed" : "pointer", transition: "all 0.15s",
              }}>
              {d.icon} {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "0 2px" }}>
        {history.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px",
              background: m.role === "user" ? "rgba(212,175,55,0.12)" : NAVY2,
              border: "1px solid " + (m.role === "user" ? "rgba(212,175,55,0.25)" : "#1A2035"),
            }}>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.15em", color: m.role === "user" ? GOLD : BLUE, marginBottom: 5, fontWeight: 700 }}>
                {m.role === "user" ? "OPERATOR" : "dAIsy haMINJA"}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: m.role === "user" ? "#C8CAD8" : "#9BA5C0", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", border: "1px solid #1A2035", background: NAVY2, maxWidth: 320 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, animation: "brain-pulse 1s ease infinite" }} />
            <div style={{ fontFamily: MONO, fontSize: 9, color: MID, letterSpacing: "0.1em" }}>Engaging autonomous neural fiduciaries...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && send()}
          placeholder="Enter command / system query..."
          disabled={loading}
          style={{
            flex: 1, padding: "10px 14px", background: NAVY2,
            border: "1px solid #1A2035", color: "#C8CAD8",
            fontFamily: MONO, fontSize: 10, outline: "none",
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{
            padding: "10px 18px", background: input.trim() && !loading ? "linear-gradient(135deg,#D4AF37,#B8860B)" : "#1A2035",
            color: input.trim() && !loading ? NAVY : DIM,
            fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
            border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", flexShrink: 0,
          }}>
          SEND →
        </button>
      </div>
    </div>
  );
}

// ── SANDBOX UI ────────────────────────────────────────────────────────────────
function SandboxUI() {
  const [metrics, setMetrics] = useState({
    pipeline: 420.69, nodes: 14, drift: 0.00,
    eftps: "SECURED & REMITTING", leads: 1842, closeRate: 89.2,
  });
  const [syncing, setSyncing] = useState(false);

  function sync() {
    setSyncing(true);
    setTimeout(() => {
      setMetrics(m => ({
        ...m,
        pipeline: +(m.pipeline + (Math.random() - 0.5) * 10).toFixed(2),
        nodes: Math.floor(Math.random() * 7) + 11,
        leads: m.leads + Math.floor(Math.random() * 8) + 1,
        closeRate: +((Math.random() * 4.5) + 87).toFixed(1),
      }));
      setSyncing(false);
    }, 900);
  }

  const MetCard = ({ label, value, sub, color = GOLD }: { label: string; value: string; sub: string; color?: string }) => (
    <div style={{ flex: 1, padding: "14px", border: "1px solid #1A2035", background: NAVY2 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.15em", color: DIM, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 8, color: MID }}>{sub}</div>
    </div>
  );

  const leads = [
    { co: "NovaTech Solutions", status: "Negotiating SLA Clause", prob: 89.4, comp: "SOC 2 Checked" },
    { co: "Apex Logistics Corp", status: "Drafting Fiduciary NDA", prob: 94.1, comp: "ISO 27001 Checked" },
    { co: "Centrum BioGate", status: "Calculating ROI Pricing", prob: 72.8, comp: "NIST 800 Checked" },
    { co: "Zeta Retail Systems", status: "Closed (Tax Reserved)", prob: 100, comp: "IRS Verified" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #1A2035", background: NAVY2, flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: GOLD }}>EMPIRICAL PERFORMANCE SANDBOX</div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: MID, marginTop: 3 }}>Anonymized real-time partner system simulation</div>
        </div>
        <button onClick={sync} disabled={syncing}
          style={{ padding: "7px 14px", background: "linear-gradient(135deg,#D4AF37,#B8860B)", color: NAVY, fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", border: "none", cursor: "pointer" }}>
          {syncing ? "SYNCING..." : "↻ SYNC"}
        </button>
      </div>

      {/* Metrics Row 1 */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <MetCard label="PIPELINE FREQUENCY" value={metrics.pipeline + " ops/sec"} sub="Realtime network traffic" color={GOLD} />
        <MetCard label="ACTIVE AUTONOMOUS NODES" value={metrics.nodes + " Fiduciaries"} sub="Isolated VM execution tunnels" color={BLUE} />
      </div>

      {/* Metrics Row 2 */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <MetCard label="SECURITY DRIFT STATUS" value={metrics.drift.toFixed(2) + "% DRIFT"} sub="SOC 2 Trust Principles Verified" color={GREEN} />
        <MetCard label="IRS EFTPS STATUS" value={metrics.eftps} sub="Continuous remittance sync" color={AMBER} />
        <MetCard label="OUTBOUND LEADS" value={metrics.leads.toLocaleString()} sub="Active pipeline targets" color={PURPLE} />
      </div>

      {/* Sales Pipeline */}
      <div style={{ border: "1px solid #1A2035", background: NAVY2, flexShrink: 0 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1A2035", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: GOLD }}>OUTBOUND SALES PIPELINE</div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: MID }}>{metrics.leads.toLocaleString()} TARGETS REACHED</div>
        </div>
        {leads.map((l, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: i < leads.length - 1 ? "1px solid #0F1424" : "none" }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: "#C8CAD0", marginBottom: 2 }}>{l.co}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: GOLD }}>{l.status}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: l.prob === 100 ? GREEN : BLUE }}>{l.prob}%</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: MID }}>{l.comp}</div>
            </div>
          </div>
        ))}
        <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: MID }}>NEGOTIATION CLOSE RATE</div>
          <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, color: GREEN }}>{metrics.closeRate}%</div>
        </div>
      </div>
    </div>
  );
}

// ── ROI ANALYTICS ─────────────────────────────────────────────────────────────
function RoiAnalytics() {
  const [spend, setSpend] = useState(1500000);

  const savings = spend * 0.22;
  const irs = savings * 0.21;
  const net = savings - irs;

  function fmtLarge(n: number) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", height: "100%" }}>
      {/* Calculator */}
      <div style={{ padding: 20, border: "1px solid #1A2035", background: NAVY2 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: GOLD, marginBottom: 6 }}>ROI ANALYTICS ENGINE (calculateROI)</div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: MID, lineHeight: 1.6, marginBottom: 16 }}>
          Estimate immediate cost-reductions and IRS compliance distributions by adjusting your annual B2B procurement spend.
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: DIM, letterSpacing: "0.15em", marginBottom: 6 }}>ANNUAL B2B SPEND</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: GOLD }}>$</div>
            <input
              type="number"
              value={spend}
              onChange={e => setSpend(Math.max(100000, Math.min(10000000, Number(e.target.value))))}
              style={{
                flex: 1, padding: "8px 12px", background: NAVY, border: "1px solid rgba(212,175,55,0.2)",
                color: "#C8CAD8", fontFamily: MONO, fontSize: 12, fontWeight: 700, outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 8, color: DIM, marginBottom: 4 }}>
            <span>MIN $100K</span>
            <span style={{ color: GOLD }}>{fmtLarge(spend)}</span>
            <span>MAX $10M</span>
          </div>
          <input type="range" min={100000} max={10000000} step={50000} value={spend}
            onChange={e => setSpend(Number(e.target.value))}
            style={{ width: "100%", accentColor: GOLD }} />
        </div>
      </div>

      {/* Forecast */}
      <div style={{ padding: 20, border: "1px solid rgba(212,175,55,0.2)", background: "linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02))" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: GOLD, marginBottom: 16 }}>U.A.R.E.F.A.K.E. SPLIT-LOGIC FORECAST</div>

        {[
          { label: "Estimated Gross Savings (22% Avg):", value: fmtLarge(savings), color: GOLD, big: true },
          { label: "IRS-First Sequestration (21% CIT) → EFTPS:", value: fmtLarge(irs), color: "#F87171", tag: "EFTPS" },
          { label: "Net Capital Optimized (Released to Operations):", value: fmtLarge(net), color: GREEN, big: true },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < 2 ? 14 : 0, marginBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? "1px solid #1A2035" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: MID }}>{row.label}</div>
              {row.tag && (
                <div style={{ fontFamily: MONO, fontSize: 7, color: "#F87171", border: "1px solid #F8717133", padding: "1px 5px" }}>{row.tag}</div>
              )}
            </div>
            <div style={{ fontFamily: MONO, fontSize: row.big ? 14 : 12, fontWeight: 800, color: row.color, flexShrink: 0, marginLeft: 16 }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* IRS Note */}
      <div style={{ padding: "12px 16px", border: "1px solid rgba(248,113,113,0.15)", background: "rgba(248,113,113,0.04)" }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", color: "#F87171", marginBottom: 4 }}>IRS-FIRST RULE — SOVEREIGN MANDATE</div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: MID, lineHeight: 1.7 }}>
          No revenue event is classified as operating capital until the 21% Corporate Income Tax is sequestered into tax reserve and remitted to IRS EFTPS gateway. This is a non-negotiable sovereign constraint enforced by U.A.R.E.F.A.K.E.
        </div>
      </div>
    </div>
  );
}

// ── OUTBOUND AUTH ─────────────────────────────────────────────────────────────
function OutboundAuth({ chat }: { chat: (msg: string) => void }) {
  const [prospects, setProspects] = useState<Prospect[]>(INIT_PROSPECTS);
  const [engaging, setEngaging] = useState<string | null>(null);

  function authorize(id: string) {
    const p = prospects.find(x => x.id === id);
    if (!p || p.status !== "PENDING OPERATOR SIGN-OFF") return;
    setEngaging(id);

    setTimeout(() => {
      setProspects(ps => ps.map(x => x.id === id ? { ...x, status: "AUTHORIZED — ENGAGING" } : x));
      chat("Operator authorized outbound engagement with " + p.company + ". Initiating autonomous handshake sequence...");
    }, 400);

    setTimeout(() => {
      setProspects(ps => ps.map(x => x.id === id ? { ...x, status: "NEGOTIATING SLA", prob: 98.5 } : x));
      chat("dAIsy haMINJA Outbound Fiduciary Loop activated:\n• Secured handshake with " + p.company + "\n• Dynamic ROI-based pricing: " + fmt(p.price) + "\n• Drafted NIST/SOC 2 compliant B2B SLA clauses\n• Proposing terms to target leadership...");
    }, 2200);

    setTimeout(() => {
      const tax = p.price * 0.21;
      const net = p.price - tax;
      setProspects(ps => ps.map(x => x.id === id ? { ...x, status: "CONTRACT SIGNED & SECURED", prob: 100 } : x));
      setEngaging(null);
      chat("CONTRACT SIGNED & CLOSED: " + p.company + "\n\nIRS-First Rule Triggered:\n• Gross Revenue: " + fmt(p.price) + "\n• CIT Sequestration (21%): " + fmt(tax) + " → EFTPS\n• Net Operating Capital: " + fmt(net) + "\n\nSystemMilestone logged. Regulatory compliance verified.");
    }, 4200);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", height: "100%" }}>
      <div style={{ padding: "12px 16px", border: "1px solid #1A2035", background: NAVY2, flexShrink: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: GOLD, marginBottom: 3 }}>AUTONOMOUS OUTBOUND SALES ENGINE</div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: MID }}>dAIsy haMINJA identifies enterprise inefficiencies, calculates ROI-based pricing, and executes B2B contracts autonomously. Authorize each engagement to initiate the fiduciary loop.</div>
      </div>

      {prospects.map(p => (
        <div key={p.id} style={{ border: "1px solid " + (p.status === "CONTRACT SIGNED & SECURED" ? "rgba(52,211,153,0.2)" : "#1A2035"), background: NAVY2 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #0F1424" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#D8DAE0", marginBottom: 3 }}>{p.company}</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: statusColor(p.status), letterSpacing: "0.12em", fontWeight: 700 }}>{p.status}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: p.prob === 100 ? GREEN : GOLD }}>{p.prob}%</div>
                <div style={{ fontFamily: MONO, fontSize: 7, color: DIM }}>CLOSE PROB</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {[
                { label: "INEFFICIENCY DETECTED", val: p.inefficiency },
                { label: "PROPOSED STRATEGY", val: p.strategy },
                { label: "COMPLIANCE CHECKED", val: p.compliance },
                { label: "ESTIMATED ROI SAVINGS", val: fmt(p.roiSavings) },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.12em", color: DIM, marginBottom: 3 }}>{row.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: MID, lineHeight: 1.5 }}>{row.val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: NAVY, border: "1px solid rgba(212,175,55,0.1)" }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 7, color: DIM, marginBottom: 2 }}>DYNAMIC CALCULATED PRICE (22% ROI)</div>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: GOLD }}>{fmt(p.price)}</div>
              </div>
              {p.status === "PENDING OPERATOR SIGN-OFF" && (
                <button
                  onClick={() => authorize(p.id)}
                  disabled={engaging === p.id}
                  style={{
                    padding: "10px 20px",
                    background: engaging === p.id ? "#1A2035" : "linear-gradient(135deg,#D4AF37,#B8860B)",
                    color: engaging === p.id ? DIM : NAVY,
                    fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                    border: "none", cursor: engaging === p.id ? "not-allowed" : "pointer",
                  }}>
                  {engaging === p.id ? "ENGAGING..." : "AUTHORIZE ENGAGEMENT →"}
                </button>
              )}
              {p.status !== "PENDING OPERATOR SIGN-OFF" && (
                <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: statusColor(p.status), letterSpacing: "0.1em" }}>
                  {p.status === "CONTRACT SIGNED & SECURED" ? "✓ CLOSED" : "⟳ IN PROGRESS"}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const TABS = ["AVATAR", "COMM-LINK", "SANDBOX UI", "ROI ANALYTICS", "OUTBOUND AUTH"] as const;

export default function BrainConsole() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("AVATAR");
  const [pulse, setPulse] = useState(false);
  const [homeostasis] = useState(98.4);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1400);
    return () => clearInterval(t);
  }, []);

  // shared chat injector for OUTBOUND AUTH → COMM-LINK
  const chatRef = useRef<((m: string) => void) | null>(null);

  return (
    <DashboardLayout>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>

        {/* Header Banner */}
        <div style={{ marginBottom: 20, padding: "18px 24px", border: "1px solid rgba(212,175,55,0.25)", background: "linear-gradient(135deg,#07091A,#090D1E)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(212,175,55,0.02) 39px,rgba(212,175,55,0.02) 40px)" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.25em", color: "#3D4560", marginBottom: 4 }}>U.A.R.E.F.A.K.E. ENGINE CONSOLE</div>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#D8DAE8", letterSpacing: "0.04em", marginBottom: 4 }}>dAIsy haMINJA Brain Console</div>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.15em", color: MID }}>Unmanned Autonomous Recursive Economic Fiduciary Asset Kinetic Engine</div>
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 800, color: GREEN }}>{homeostasis}%</div>
                <div style={{ fontFamily: MONO, fontSize: 7, color: DIM, letterSpacing: "0.15em" }}>HOMEOSTASIS</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, boxShadow: pulse ? "0 0 10px 3px rgba(52,211,153,0.5)" : "0 0 3px 1px rgba(52,211,153,0.2)", transition: "box-shadow 0.7s ease" }} />
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: GREEN, letterSpacing: "0.15em" }}>AUTONOMOUS</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: MID }}>59 PARADOXES · 105 SOLUTIONS</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: MID }}>5 CHAMBERS · NIST ✓ SOC2 ✓</div>
              </div>
            </div>
          </div>

          {/* System status row */}
          <div style={{ position: "relative", zIndex: 1, marginTop: 14, paddingTop: 14, borderTop: "1px solid #1A2035", display: "flex", gap: 24 }}>
            {[
              { label: "NIST GATE", val: "SOC 2 BASING" },
              { label: "EFTPS TRANSFER", val: "SECURED & REALTIME" },
              { label: "CLOCK STATUS", val: "LAMPORT ORDERED" },
              { label: "PIPELINE", val: "420.69 ops/sec" },
              { label: "ACTIVE NODES", val: "14 Fiduciaries" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.15em", color: DIM, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: "#8B95B0" }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid #1A2035", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: "10px 20px", background: "transparent",
                borderTop: "none", borderLeft: "none", borderRight: "none",
                borderBottom: tab === t ? "2px solid #D4AF37" : "2px solid transparent",
                color: tab === t ? GOLD : MID,
                fontFamily: MONO, fontSize: 9, fontWeight: tab === t ? 700 : 400, letterSpacing: "0.15em",
                cursor: "pointer",
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === "AVATAR" && (
            <div style={{ flex: 1, border: "1px solid rgba(56,189,248,0.2)", overflow: "hidden", position: "relative" }}>
              <DaisyAvatar />
            </div>
          )}
          {tab === "COMM-LINK" && <CommLink />}
          {tab === "SANDBOX UI" && <SandboxUI />}
          {tab === "ROI ANALYTICS" && <RoiAnalytics />}
          {tab === "OUTBOUND AUTH" && (
            <OutboundAuth chat={msg => {
              setTab("COMM-LINK");
              setTimeout(() => chatRef.current?.(msg), 100);
            }} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes brain-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </DashboardLayout>
  );
}
