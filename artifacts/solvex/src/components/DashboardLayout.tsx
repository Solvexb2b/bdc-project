import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/marketplace", label: "PARADOX VAULT", icon: "◈" },
  { href: "/library", label: "SOLUTION LIBRARY", icon: "▣" },
  { href: "/portal", label: "CLIENT PORTAL", icon: "◉" },
  { href: "/post-problem", label: "POST BOUNTY", icon: "◆" },
];

const ADMIN_ITEMS = [
  { href: "/owner", label: "COMMAND CENTER", icon: "⬡" },
  { href: "/solver", label: "SOLVER DASHBOARD", icon: "◈" },
  { href: "/analytics", label: "ANALYTICS", icon: "▲" },
];

const TICKER = [
  "ZK-KYC ▲+12.4%", "KYBER-QKD ▲+8.1%", "FHE-VAULT ▼-2.3%",
  "HFT-FABRIC ▲+19.7%", "DARK-POOL ▲+5.6%", "RTGS-OPT ▲+11.2%",
  "OSFI-B13 ▲+3.9%", "ANOMALY-GCN ▲+22.8%", "PAM-BROKER ▲+9.3%",
  "XAI-SHAPLEY ▲+14.5%", "APEX-MASTER ▲+31.2%", "SOLVEX INDEX ▲+8.74%",
];

function GlassBoxLight() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-[#D4AF37]/20 bg-[#D4AF37]/5">
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "#D4AF37",
        boxShadow: pulse ? "0 0 12px 4px #D4AF3766" : "0 0 4px 1px #D4AF3733",
        transition: "box-shadow 1.2s ease",
      }} />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37", fontWeight: 600 }}>
        GLASS BOX ACTIVE
      </span>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetMe();
  const logoutParams = useLogout();
  const [location] = useLocation();
  const [tickerPos, setTickerPos] = useState(0);
  const tickerText = [...TICKER, ...TICKER].join("   ·   ");

  useEffect(() => {
    const t = setInterval(() => setTickerPos(p => (p + 1) % (tickerText.length / 2 * 8)), 40);
    return () => clearInterval(t);
  }, [tickerText]);

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#05080F", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#D4AF37", fontSize: 12, letterSpacing: "0.2em" }}>
        INITIALIZING 53-PARADOX ENGINE...
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#05080F", color: "#E8EAF0", overflow: "hidden" }}>

      {/* Top Ticker Bar */}
      <div style={{
        background: "#0B0E1A", borderBottom: "1px solid #1A2035",
        height: 32, display: "flex", alignItems: "center", overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.2em", color: "#D4AF37", background: "#0B0E1A",
          borderRight: "1px solid #D4AF37", padding: "0 14px", whiteSpace: "nowrap",
          height: "100%", display: "flex", alignItems: "center", flexShrink: 0,
        }}>LIVE</div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5B6480",
            whiteSpace: "nowrap",
            animation: "ticker-scroll 50s linear infinite",
          }}>
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} style={{ marginRight: 48, color: item.includes("▼") ? "#F87171" : "#34D399" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#3D4560",
          padding: "0 14px", borderLeft: "1px solid #1A2035", flexShrink: 0,
        }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} EST
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, background: "#07091A", borderRight: "1px solid #1A2035",
          display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1A2035" }}>
            <Link href="/">
              <div style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 36, height: 36, background: "linear-gradient(135deg, #D4AF37, #B8860B)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 900, color: "#05080F",
                  }}>SX</div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 900, color: "#D4AF37", letterSpacing: "0.06em" }}>SOLVEX</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, letterSpacing: "0.2em", color: "#3D4560" }}>INSTITUTIONAL</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Glass Box Indicator */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1A2035" }}>
            <GlassBoxLight />
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#3D4560", letterSpacing: "0.12em" }}>
              53-PARADOX ENGINE v3.1
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#3D4560", letterSpacing: "0.12em" }}>
              dAIsy haMINJA · SOVEREIGN AI
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
            {NAV_ITEMS.map(item => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 20px",
                    background: active ? "rgba(212,175,55,0.08)" : "transparent",
                    borderLeft: active ? "2px solid #D4AF37" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    <span style={{ color: active ? "#D4AF37" : "#3D4560", fontSize: 12 }}>{item.icon}</span>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600,
                      letterSpacing: "0.15em", color: active ? "#D4AF37" : "#5B6480",
                    }}>{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {user?.role === "admin" && (
              <>
                <div style={{ padding: "16px 20px 8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, letterSpacing: "0.2em", color: "#2A3050" }}>
                  ARCHITECT ACCESS
                </div>
                {ADMIN_ITEMS.map(item => {
                  const active = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 20px",
                        background: active ? "rgba(212,175,55,0.05)" : "transparent",
                        borderLeft: active ? "2px solid #D4AF37" : "2px solid transparent",
                        cursor: "pointer",
                      }}>
                        <span style={{ color: active ? "#D4AF37" : "#3D4560", fontSize: 12 }}>{item.icon}</span>
                        <span style={{
                          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600,
                          letterSpacing: "0.15em", color: active ? "#D4AF37" : "#3D4560",
                        }}>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User / OSFI Strip */}
          <div style={{ borderTop: "1px solid #1A2035", padding: "14px 16px" }}>
            {user ? (
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5B6480", marginBottom: 8, letterSpacing: "0.1em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </div>
                <button
                  onClick={() => logoutParams.mutate()}
                  disabled={logoutParams.isPending}
                  style={{
                    width: "100%", padding: "7px", background: "transparent",
                    border: "1px solid #1A2035", color: "#5B6480",
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.15em",
                    cursor: "pointer",
                  }}>
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link href="/login">
                <div style={{
                  padding: "8px 12px", background: "linear-gradient(135deg, #D4AF37, #B8860B)",
                  color: "#05080F", fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
                  textAlign: "center", cursor: "pointer",
                }}>
                  AUTHENTICATE →
                </div>
              </Link>
            )}
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["OSFI", "FINTRAC", "SOC2", "PIPEDA"].map(b => (
                <div key={b} style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: "#D4AF37",
                  border: "1px solid rgba(212,175,55,0.2)", padding: "2px 6px",
                  letterSpacing: "0.12em",
                }}>✓ {b}</div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#05080F" }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
