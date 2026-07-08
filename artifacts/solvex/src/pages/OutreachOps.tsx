import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

const MONO = "'IBM Plex Mono', monospace";
const GOLD = "#D4AF37";
const GREEN = "#34D399";
const PURPLE = "#A78BFA";
const BLUE = "#60A5FA";
const RED = "#F87171";

interface Stats {
  total: number;
  active: number;
  won: number;
  lost: number;
  pipelineEth: string;
  closedEth: string;
}

interface Prospect {
  id: number;
  company: string;
  sector: string;
  region: string;
  contactRole: string;
  stage: string;
  productName: string | null;
  listPriceEth: string | null;
  proposedPriceEth: string | null;
  negotiationRounds: number;
  fitScore: number;
  lastAction: string | null;
  updatedAt: string;
}

interface OutreachEvent {
  id: number;
  prospectId: number;
  company: string;
  type: string;
  message: string;
  createdAt: string;
}

const STAGE_META: Record<string, { label: string; color: string }> = {
  discovered: { label: "DISCOVERED", color: BLUE },
  contacted: { label: "CONTACTED", color: "#9CA3AF" },
  pitched: { label: "PITCHED", color: GOLD },
  negotiating: { label: "NEGOTIATING", color: PURPLE },
  closed_won: { label: "CLOSED — WON", color: GREEN },
  closed_lost: { label: "DEFERRED", color: RED },
};

const EVENT_META: Record<string, { tag: string; color: string }> = {
  discovery: { tag: "SCAN", color: BLUE },
  contact: { tag: "CONTACT", color: "#9CA3AF" },
  pitch: { tag: "PITCH", color: GOLD },
  negotiation: { tag: "NEGOTIATE", color: PURPLE },
  close_won: { tag: "DEAL WON", color: GREEN },
  close_lost: { tag: "DEFERRED", color: RED },
};

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function OutreachOps() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [events, setEvents] = useState<OutreachEvent[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [s, p, e] = await Promise.all([
          fetch("/api/outreach/stats").then(r => r.json()),
          fetch("/api/outreach/prospects").then(r => r.json()),
          fetch("/api/outreach/events?limit=50").then(r => r.json()),
        ]);
        if (!alive) return;
        setStats(s);
        setProspects(p);
        setEvents(e);
        setLoadError(false);
      } catch {
        if (alive) setLoadError(true);
      }
    };
    void load();
    const iv = setInterval(() => void load(), 5000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const activeDeals = prospects.filter(p => !p.stage.startsWith("closed"));
  const closedDeals = prospects.filter(p => p.stage.startsWith("closed"));

  return (
    <DashboardLayout>
      <div style={{ fontFamily: MONO, padding: "28px 32px", maxWidth: 1400 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, color: "#5B6480", letterSpacing: "0.22em", marginBottom: 8 }}>
            AUTONOMOUS OPERATIONS · NO OPERATOR INPUT REQUIRED
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#E8E9F0", letterSpacing: "0.02em", margin: 0 }}>
            Outreach Ops — <span style={{ color: GOLD }}>dAIsy is selling.</span>
          </h1>
          <div style={{ fontSize: 10, color: "#7B869A", marginTop: 10, lineHeight: 1.7, maxWidth: 760 }}>
            dAIsy haMINJA autonomously scans the institutional market, initiates contact, pitches matched
            instruments, defends the pricing floor through negotiation, and closes deals — around the clock,
            with zero human interaction. Every action below was executed by the engine itself.
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, padding: "6px 12px", border: `1px solid ${GREEN}44`, background: `${GREEN}0D` }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, boxShadow: `0 0 8px ${GREEN}`, display: "inline-block" }} />
            <span style={{ fontSize: 8, color: GREEN, letterSpacing: "0.16em", fontWeight: 700 }}>ENGINE LIVE — NEXT AUTONOMOUS ACTION &lt; 40s</span>
          </div>
        </div>

        {loadError && (
          <div style={{ marginBottom: 18, padding: "10px 14px", border: `1px solid ${RED}55`, background: `${RED}0D`, fontSize: 9, color: RED, letterSpacing: "0.08em" }}>
            ⚠ TELEMETRY LINK INTERRUPTED — retrying automatically…
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2, marginBottom: 26 }}>
          {[
            { l: "PROSPECTS ENGAGED", v: stats ? String(stats.total) : "—", c: "#E8E9F0" },
            { l: "ACTIVE PURSUITS", v: stats ? String(stats.active) : "—", c: GOLD },
            { l: "DEALS CLOSED", v: stats ? String(stats.won) : "—", c: GREEN },
            { l: "DEFERRED", v: stats ? String(stats.lost) : "—", c: RED },
            { l: "PIPELINE VALUE", v: stats ? `${parseFloat(stats.pipelineEth).toFixed(4)} ETH` : "—", c: PURPLE },
            { l: "CLOSED REVENUE", v: stats ? `${parseFloat(stats.closedEth).toFixed(4)} ETH` : "—", c: GREEN },
          ].map(s => (
            <div key={s.l} style={{ border: "1px solid #141A2E", background: "rgba(7,9,26,0.7)", padding: "16px 18px" }}>
              <div style={{ fontSize: 7, color: "#3D4560", letterSpacing: "0.18em", marginBottom: 8 }}>{s.l}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.c, letterSpacing: "0.02em" }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {/* Left: live activity feed */}
          <div style={{ flex: 1.2, border: "1px solid #141A2E", background: "rgba(5,8,15,0.85)", minWidth: 0 }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #141A2E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: GOLD, letterSpacing: "0.18em", fontWeight: 700 }}>LIVE TRANSMISSION LOG</span>
              <span style={{ fontSize: 7.5, color: "#3D4560", letterSpacing: "0.1em" }}>AUTO-REFRESH 5s</span>
            </div>
            <div style={{ maxHeight: 640, overflowY: "auto" }}>
              {events.length === 0 && (
                <div style={{ padding: 24, fontSize: 9, color: "#5B6480", letterSpacing: "0.1em" }}>
                  Engine warming up — first autonomous transmission lands within one cycle…
                </div>
              )}
              {events.map(ev => {
                const meta = EVENT_META[ev.type] ?? { tag: ev.type.toUpperCase(), color: "#9CA3AF" };
                return (
                  <div key={ev.id} style={{ padding: "14px 20px", borderBottom: "1px solid #0D1222" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                      <span style={{
                        fontSize: 7, fontWeight: 800, letterSpacing: "0.14em", color: meta.color,
                        border: `1px solid ${meta.color}55`, padding: "2px 8px", background: `${meta.color}0D`,
                      }}>{meta.tag}</span>
                      <span style={{ fontSize: 9, color: "#C8C9D0", fontWeight: 700 }}>{ev.company}</span>
                      <span style={{ fontSize: 7.5, color: "#3D4560", marginLeft: "auto" }}>{timeAgo(ev.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 9.5, color: "#8B94A8", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{ev.message}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: deal pipeline */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ border: "1px solid #141A2E", background: "rgba(7,9,26,0.7)", marginBottom: 2 }}>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #141A2E" }}>
                <span style={{ fontSize: 9, color: PURPLE, letterSpacing: "0.18em", fontWeight: 700 }}>ACTIVE PURSUITS ({activeDeals.length})</span>
              </div>
              <div style={{ maxHeight: 380, overflowY: "auto" }}>
                {activeDeals.length === 0 && (
                  <div style={{ padding: 20, fontSize: 9, color: "#5B6480" }}>Scanning market for institutional fits…</div>
                )}
                {activeDeals.map(p => {
                  const meta = STAGE_META[p.stage] ?? { label: p.stage.toUpperCase(), color: "#9CA3AF" };
                  return (
                    <div key={p.id} style={{ padding: "13px 20px", borderBottom: "1px solid #0D1222" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                        <span style={{ fontSize: 10, color: "#E8E9F0", fontWeight: 700 }}>{p.company}</span>
                        <span style={{ fontSize: 7, color: meta.color, letterSpacing: "0.12em", fontWeight: 800, marginLeft: "auto" }}>{meta.label}</span>
                      </div>
                      <div style={{ fontSize: 8, color: "#5B6480", marginBottom: 5 }}>
                        {p.sector} · {p.region} · {p.contactRole} · FIT {p.fitScore}/100
                      </div>
                      {p.productName && (
                        <div style={{ fontSize: 8.5, color: GOLD }}>
                          {p.productName} — {p.proposedPriceEth ?? p.listPriceEth} ETH
                          {p.negotiationRounds > 0 && <span style={{ color: PURPLE }}> · ROUND {p.negotiationRounds}</span>}
                        </div>
                      )}
                      {p.lastAction && <div style={{ fontSize: 8, color: "#7B869A", marginTop: 4 }}>↳ {p.lastAction}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ border: "1px solid #141A2E", background: "rgba(7,9,26,0.7)" }}>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #141A2E" }}>
                <span style={{ fontSize: 9, color: GREEN, letterSpacing: "0.18em", fontWeight: 700 }}>CLOSED BOOK ({closedDeals.length})</span>
              </div>
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                {closedDeals.length === 0 && (
                  <div style={{ padding: 20, fontSize: 9, color: "#5B6480" }}>First close pending — negotiation cycles in progress…</div>
                )}
                {closedDeals.map(p => {
                  const won = p.stage === "closed_won";
                  return (
                    <div key={p.id} style={{ padding: "11px 20px", borderBottom: "1px solid #0D1222", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: won ? GREEN : RED }}>{won ? "✓" : "◌"}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 9, color: "#C8C9D0", fontWeight: 700 }}>{p.company}</div>
                        <div style={{ fontSize: 7.5, color: "#5B6480", marginTop: 2 }}>
                          {won ? `${p.productName} @ ${p.proposedPriceEth} ETH` : "Deferred — re-engagement scheduled"}
                        </div>
                      </div>
                      <span style={{ fontSize: 7, color: "#3D4560" }}>{timeAgo(p.updatedAt)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
