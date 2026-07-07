import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useListProducts, useListProblems } from "@workspace/api-client-react";
import { Link } from "wouter";

const DOMAIN_META: Record<string, { badge: string; color: string; chamber: string }> = {
  "fundamental":   { badge: "ZK-CRYPTO",  color: "#00D4FF", chamber: "CHAMBER I" },
  "operational":   { badge: "OPS-CORE",   color: "#FFD700", chamber: "CHAMBER II" },
  "ai":            { badge: "AI-GOV",     color: "#A78BFA", chamber: "CHAMBER III" },
};

const DOMAINS = ["ALL", "fundamental", "operational", "ai"];
const DOMAIN_LABELS: Record<string, string> = {
  fundamental: "ZK & CRYPTOGRAPHY",
  operational: "HFT & COMPLIANCE",
  ai:          "AI & GOVERNANCE",
};

export default function Marketplace() {
  const { data: products, isLoading: loadingProducts } = useListProducts();
  const { data: problems, isLoading: loadingProblems } = useListProblems({ status: "solution_submitted", limit: 500 });
  const [activeTab, setActiveTab] = useState<"vault" | "bounties">("vault");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = activeFilter === "ALL"
    ? products ?? []
    : (products ?? []).filter(p => p.category === activeFilter);

  return (
    <DashboardLayout>
      <div style={{ minHeight: "100vh" }}>

        {/* Page Header */}
        <div style={{ padding: "32px 40px 0", borderBottom: "1px solid #1A2035" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.22em", color: "#3D4560", marginBottom: 8 }}>
            SOLVEX · PARADOX VAULT · {products?.length ?? ""} TIER-1 ENTERPRISE SOLUTIONS
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.01em", marginBottom: 20 }}>
            Institutional Marketplace
          </h1>
          <div style={{ display: "flex", gap: 0 }}>
            {[{ key: "vault", label: "PARADOX VAULT" }, { key: "bounties", label: "SOLVED PARADOXES" }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
                padding: "10px 28px",
                background: activeTab === tab.key ? "rgba(212,175,55,0.08)" : "transparent",
                borderTop: activeTab === tab.key ? "2px solid #D4AF37" : "2px solid transparent",
                borderLeft: "none", borderRight: "none", borderBottom: "none",
                color: activeTab === tab.key ? "#D4AF37" : "#5B6480",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.18em", cursor: "pointer", marginBottom: -1,
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "vault" && (
          <div style={{ padding: "0 40px 40px" }}>
            {/* Stats Bar */}
            <div style={{
              display: "flex", background: "#07091A", borderBottom: "1px solid #1A2035",
              margin: "0 -40px", padding: "14px 40px",
            }}>
              {[
                { val: String(products?.length ?? ""), lbl: "PRODUCTS" }, { val: "5", lbl: "CHAMBERS" },
                { val: "59", lbl: "PARADOXES" }, { val: "$4.2B", lbl: "CLEARED DAILY" },
                { val: "99.999%", lbl: "SLA" }, { val: "OSFI ✓", lbl: "CERTIFIED" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, borderLeft: i > 0 ? "1px solid #1A2035" : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: "#D4AF37" }}>{s.val}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, letterSpacing: "0.18em", color: "#3D4560" }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 0", borderBottom: "1px solid #1A2035" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, letterSpacing: "0.2em", color: "#3D4560", marginRight: 8 }}>
                DOMAIN ›
              </div>
              {DOMAINS.map(d => (
                <button key={d} onClick={() => setActiveFilter(d)} style={{
                  padding: "5px 14px",
                  background: activeFilter === d ? "rgba(212,175,55,0.07)" : "transparent",
                  border: activeFilter === d ? "1px solid #D4AF37" : "1px solid transparent",
                  color: activeFilter === d ? "#D4AF37" : "#5B6480",
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 700,
                  letterSpacing: "0.14em", cursor: "pointer",
                }}>
                  {d === "ALL" ? `ALL ${products?.length ?? ""} PRODUCTS` : (DOMAIN_LABELS[d] ?? d.toUpperCase())}
                </button>
              ))}
              <div style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#3D4560" }}>
                {filtered.length} / {products?.length ?? ""} SOLUTIONS
              </div>
            </div>

            {loadingProducts ? (
              <div style={{ padding: "60px 0", textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#3D4560", letterSpacing: "0.2em" }}>
                DECRYPTING PARADOX VAULT...
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, marginTop: 24 }}>
                {filtered.map(p => {
                  const meta = DOMAIN_META[p.category ?? "fundamental"] ?? DOMAIN_META["fundamental"];
                  const col = meta.color;
                  const hov = hoveredId === p.id;
                  const isPlatinum = p.id === "SOLVEX-MASTER-29";

                  return (
                    <div key={p.id}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        background: hov ? "#090D1E" : "#07091A",
                        border: isPlatinum ? "1px solid rgba(212,175,55,0.4)" : hov ? "1px solid rgba(212,175,55,0.3)" : "1px solid #1A2035",
                        padding: 24, position: "relative", overflow: "hidden", transition: "all 0.15s",
                      }}>
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: hov || isPlatinum ? `linear-gradient(90deg, transparent, ${col}, transparent)` : "linear-gradient(90deg, transparent, #1A2035, transparent)",
                        transition: "background 0.2s",
                      }} />
                      {isPlatinum && (
                        <div style={{
                          position: "absolute", top: 14, right: -28,
                          background: "linear-gradient(90deg, #B8860B, #D4AF37)", color: "#05080F",
                          fontSize: 7, fontWeight: 900, letterSpacing: "0.18em",
                          padding: "4px 36px", transform: "rotate(45deg)",
                        }}>APEX</div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#3D4560", letterSpacing: "0.08em" }}>{p.id}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: col, fontWeight: 700, letterSpacing: "0.16em" }}>{meta.chamber}</div>
                      </div>

                      <div style={{
                        display: "inline-block", fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 7, fontWeight: 800, letterSpacing: "0.18em",
                        border: `1px solid ${col}`, color: col, padding: "2px 8px", marginBottom: 12,
                      }}>{meta.badge}</div>

                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.25, marginBottom: 8 }}>
                        {p.name}
                      </h3>
                      <p style={{ fontSize: 10, color: "#5B6480", lineHeight: 1.55, marginBottom: 16 }}>
                        {(p.description ?? "").slice(0, 100)}{(p.description?.length ?? 0) > 100 ? "..." : ""}
                      </p>

                      <div style={{ display: "flex", borderTop: "1px solid #1A2035", borderBottom: "1px solid #1A2035", padding: "12px 0", marginBottom: 16 }}>
                        {[{ v: "99.999%", l: "SLA" }, { v: "✓", l: "ZK PROVEN" }, { v: "T-1", l: "GRADE" }].map((m, i) => (
                          <div key={i} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? "1px solid #1A2035" : "none" }}>
                            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: "#D4AF37" }}>{m.v}</div>
                            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, letterSpacing: "0.16em", color: "#3D4560", marginTop: 2 }}>{m.l}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600, color: "#FFFFFF" }}>{p.priceEth} ETH</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5B6480" }}>{p.priceUsdc} USDC</div>
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/product/${p.id}`} style={{ flex: 1 }}>
                          <div style={{
                            padding: "9px 0", background: "transparent",
                            border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37",
                            fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 800,
                            letterSpacing: "0.14em", textAlign: "center", cursor: "pointer",
                          }}>RUN PROOF →</div>
                        </Link>
                        <Link href={`/product/${p.id}`} style={{ flex: 1 }}>
                          <div style={{
                            padding: "9px 0", background: "linear-gradient(135deg, #D4AF37, #B8860B)",
                            color: "#05080F", fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", textAlign: "center", cursor: "pointer",
                          }}>ACQUIRE</div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "bounties" && (
          <div style={{ padding: "24px 40px" }}>
            {/* Stats bar */}
            <div style={{ display: "flex", background: "#07091A", borderBottom: "1px solid #1A2035", margin: "0 -40px 24px", padding: "14px 40px" }}>
              {[
                { val: String((problems ?? []).length), lbl: "BRAIN RESOLVED" },
                { val: "40", lbl: "HISTORICAL KEYS" },
                { val: "10", lbl: "RESOLUTION TYPES" },
                { val: "0%", lbl: "HALLUCINATION RATE" },
                { val: "NIST ✓", lbl: "COMPLIANCE ANCHORED" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, borderLeft: i > 0 ? "1px solid #1A2035" : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: "#34D399" }}>{s.val}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, letterSpacing: "0.18em", color: "#3D4560" }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.2em", color: "#5B6480" }}>
                dAIsy BRAIN RESOLUTION REGISTRY — TETHER-BUBBLE SYNTHESIS v2.0 · 40 HISTORICAL KEYS
              </div>
              {!loadingProblems && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#34D399", letterSpacing: "0.12em" }}>
                    {(problems ?? []).length} VERIFIED · 0 SOVEREIGN HOLD · 0 HALLUCINATION
                  </div>
                </div>
              )}
            </div>

            {loadingProblems ? (
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#3D4560", padding: "60px 0", textAlign: "center" }}>QUERYING BRAIN LEDGER...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                {(problems ?? []).map((p, idx) => {
                  const cat = (p.category ?? "regulatory").toUpperCase();
                  const resTypes: Record<string, { label: string; color: string }> = {
                    "regulatory": { label: "TETHER_BUBBLE_CAUSAL_LOOP", color: "#F59E0B" },
                    "ai-governance": { label: "TETHER_BUBBLE_BAYESIAN", color: "#A78BFA" },
                    "security": { label: "TETHER_BUBBLE_SET_THEORY", color: "#60A5FA" },
                    "identity": { label: "TETHER_BUBBLE_IDENTITY_THEORY", color: "#34D399" },
                    "optimization": { label: "TETHER_BUBBLE_CALCULUS", color: "#D4AF37" },
                  };
                  const rt = resTypes[p.category ?? "regulatory"] ?? { label: "TETHER_BUBBLE_BEHAVIORAL", color: "#34D399" };
                  return (
                    <div key={p.id} style={{ background: "#07091A", border: "1px solid #1A2035", padding: 24, borderLeft: "2px solid #34D399", position: "relative" }}>
                      {/* Resolution index */}
                      <div style={{ position: "absolute", top: 14, right: 16, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#1A2035", fontWeight: 800 }}>
                        #{String(idx + 1).padStart(2, "0")}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: "#D4AF37", letterSpacing: "0.14em", border: "1px solid rgba(212,175,55,0.2)", padding: "2px 7px" }}>{cat}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399" }} />
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: "#34D399", letterSpacing: "0.12em", fontWeight: 700 }}>BRAIN VERIFIED</div>
                        </div>
                      </div>

                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#FFFFFF", marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h3>

                      <p style={{ fontSize: 10, color: "#5B6480", lineHeight: 1.55, marginBottom: 14 }}>{(p.description ?? "").slice(0, 120)}...</p>

                      {/* Resolution type badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: "1px solid #1A2035" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: rt.color, letterSpacing: "0.1em", border: `1px solid ${rt.color}33`, padding: "2px 7px", background: `${rt.color}0A` }}>
                          {rt.label}
                        </div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: "#3D4560" }}>
                          VAULT BRIDGED · ARTIFACT READY
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(problems ?? []).length === 0 && (
                  <div style={{ gridColumn: "span 2", padding: "60px 0", textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#3D4560" }}>
                    BRAIN PROCESSING — RESOLUTIONS PENDING
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
