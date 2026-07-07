import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams } from "wouter";
import { useGetProduct, useCreateOrder } from "@workspace/api-client-react";
import { ValidationSandbox } from "@/components/ValidationSandbox";
import { Link } from "wouter";

const CATEGORY_META: Record<string, { badge: string; color: string; chamber: string; symbol: string }> = {
  fundamental: { badge: "ZK-CRYPTOGRAPHY",  color: "#00D4FF", chamber: "CHAMBER I — FOUNDATIONS",    symbol: "ᚱ" },
  operational: { badge: "OPERATIONAL-CORE", color: "#FFD700", chamber: "CHAMBER II — MOTION & TIME",  symbol: "☸" },
  ai:          { badge: "AI GOVERNANCE",    color: "#A78BFA", chamber: "CHAMBER III — CHOICE & SELF", symbol: "☥" },
};

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const SERIF: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };

const CURRENCIES = [
  { key: "eth",  label: "ETH",  icon: "Ξ" },
  { key: "usdc", label: "USDC", icon: "$" },
  { key: "btc",  label: "BTC",  icon: "₿" },
] as const;

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useGetProduct(id);
  const createOrder = useCreateOrder();
  const [currency, setCurrency] = useState<"eth" | "usdc" | "btc">("eth");
  const [ordered, setOrdered] = useState(false);
  const [ordering, setOrdering] = useState(false);

  if (isLoading) return (
    <DashboardLayout>
      <div style={{ padding: "80px 40px", ...MONO, color: "#3D4560", letterSpacing: "0.2em" }}>
        DECRYPTING VAULT ENTRY...
      </div>
    </DashboardLayout>
  );

  if (!product) return (
    <DashboardLayout>
      <div style={{ padding: "80px 40px", ...MONO, color: "#F87171", letterSpacing: "0.2em" }}>
        PRODUCT NOT FOUND IN VAULT
      </div>
    </DashboardLayout>
  );

  const meta = CATEGORY_META[product.category ?? "fundamental"] ?? CATEGORY_META["fundamental"];
  const col = meta.color;

  const priceMap: Record<string, string | undefined> = {
    eth:  product.priceEth  ? product.priceEth  + " ETH"  : undefined,
    usdc: product.priceUsdc ? product.priceUsdc + " USDC" : undefined,
    btc:  product.priceBtc  ? product.priceBtc  + " BTC"  : undefined,
  };

  async function handleOrder() {
    setOrdering(true);
    try { await (createOrder as any).mutateAsync({ paymentMethod: currency, productId: product!.id }); setOrdered(true); }
    catch { /* silently ignore */ }
    setOrdering(false);
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ padding: "20px 40px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/marketplace">
            <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.16em", color: "#5B6480", cursor: "pointer" }}>PARADOX VAULT</span>
          </Link>
          <span style={{ ...MONO, fontSize: 9, color: "#3D4560" }}>›</span>
          <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.16em", color: "#D4AF37" }}>{product.id}</span>
        </div>

        {/* Hero Bar */}
        <div style={{ padding: "28px 40px 0", borderBottom: "1px solid #1A2035", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: col + "08" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <div style={{ ...MONO, fontSize: 20, color: col }}>{meta.symbol}</div>
              <div style={{ ...MONO, fontSize: 7, fontWeight: 800, letterSpacing: "0.2em", border: "1px solid " + col, color: col, padding: "3px 10px" }}>
                {meta.badge}
              </div>
              <div style={{ ...MONO, fontSize: 7, letterSpacing: "0.18em", color: "#3D4560" }}>
                {meta.chamber}
              </div>
              <div style={{ marginLeft: "auto", ...MONO, fontSize: 8, color: "#3D4560" }}>{product.id}</div>
            </div>
            <h1 style={{ ...SERIF, fontSize: 34, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.15, marginBottom: 10, letterSpacing: "-0.01em" }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 24, flexWrap: "wrap" }}>
              {["TIER-1 CERTIFIED", "OSFI B-13", "ZK PROVEN", "FINTRAC", "72H ESCROW"].map(b => (
                <div key={b} style={{ ...MONO, fontSize: 7, letterSpacing: "0.14em", color: "#5B6480", padding: "3px 8px", border: "1px solid #1A2035" }}>✓ {b}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 32, padding: "32px 40px", alignItems: "flex-start" }}>

          {/* Left Column */}
          <div style={{ flex: 1 }}>

            {/* Description */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ ...MONO, fontSize: 9, letterSpacing: "0.2em", color: col, marginBottom: 10, borderBottom: "1px solid #1A2035", paddingBottom: 8 }}>
                TECHNICAL ABSTRACT
              </div>
              <p style={{ fontSize: 14, color: "#9BA3B5", lineHeight: 1.7 }}>{product.description}</p>
            </div>

            {/* Impact */}
            {product.impact && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ ...MONO, fontSize: 9, letterSpacing: "0.2em", color: col, marginBottom: 10, borderBottom: "1px solid #1A2035", paddingBottom: 8 }}>
                  EXPECTED INSTITUTIONAL IMPACT
                </div>
                <p style={{ fontSize: 13, color: "#7B869A", lineHeight: 1.65 }}>{product.impact}</p>
              </div>
            )}

            {/* Validation Sandbox */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: col, fontSize: 14 }}>▶</div>
                <div style={{ ...MONO, fontSize: 9, letterSpacing: "0.2em", color: "#FFFFFF" }}>MATHEMATICAL PROOF VALIDATOR</div>
                <div style={{ ...MONO, fontSize: 8, color: "#3D4560" }}>— CRYSTAL CLEAR BLACK BOX PROTOCOL</div>
              </div>
              <div style={{ marginBottom: 12, ...MONO, fontSize: 9, color: "#5B6480" }}>
                Run the cryptographic verification engine before purchase. Every assertion is deterministic and auditable. Pure mathematical proof — no approximations.
              </div>
              <ValidationSandbox
                productId={product.id}
                productName={product.name}
                category={product.category ?? "fundamental"}
                zkHash={(product as any).zkProofHash ?? undefined}
              />
            </div>

            {/* Solution Material (locked) */}
            <div>
              <div style={{ ...MONO, fontSize: 9, letterSpacing: "0.2em", color: col, marginBottom: 10, borderBottom: "1px solid #1A2035", paddingBottom: 8 }}>
                SOLUTION MATERIAL
              </div>
              <div style={{ background: "#07091A", border: "1px solid #1A2035", position: "relative", overflow: "hidden", minHeight: 100 }}>
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(5,8,15,0.85)",
                  backdropFilter: "blur(6px)", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", zIndex: 10, gap: 10,
                }}>
                  <div style={{ fontSize: 28 }}>🔐</div>
                  <div style={{ ...MONO, fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37" }}>ACCESS RESTRICTED</div>
                  <div style={{ ...MONO, fontSize: 9, color: "#5B6480" }}>Acquire clearance to decrypt</div>
                </div>
                <div style={{ padding: 20, ...MONO, fontSize: 11, color: "#1A2035", lineHeight: 1.8, filter: "blur(3px)" }}>
                  {(product as any).zkProofHash ?? "0x7f82e1b4c9a0d8e23b11488c99a3411b_ENCRYPTED_SOLUTION_PAYLOAD"}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column — Acquisition Panel */}
          <div style={{ width: 280, flexShrink: 0 }}>

            {/* Price Card */}
            <div style={{ background: "#07091A", border: "1px solid " + col + "40", marginBottom: 12, position: "relative", overflow: "hidden" }}>
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent, " + col + ", transparent)" }} />
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A2035" }}>
                <div style={{ ...MONO, fontSize: 8, letterSpacing: "0.2em", color: "#3D4560", marginBottom: 4 }}>ACQUISITION PROTOCOL</div>
                <div style={{ ...SERIF, fontSize: 13, color: "#FFFFFF" }}>72-Hour Escrow · Vault Hold Model</div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {/* Currency selector */}
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {CURRENCIES.map(c => (
                    <button key={c.key} onClick={() => setCurrency(c.key)} style={{
                      flex: 1, padding: "7px 4px",
                      background: currency === c.key ? col + "15" : "transparent",
                      border: currency === c.key ? "1px solid " + col : "1px solid #1A2035",
                      color: currency === c.key ? col : "#5B6480",
                      ...MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer",
                    }}>{c.icon} {c.label}</button>
                  ))}
                </div>

                {/* Price display */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ ...MONO, fontSize: 28, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>
                    {priceMap[currency] ?? "—"}
                  </div>
                  <div style={{ ...MONO, fontSize: 9, color: "#5B6480" }}>
                    {currency === "eth"  && product.priceUsdc && "≈ " + product.priceUsdc + " USDC"}
                    {currency === "usdc" && product.priceEth  && "≈ " + product.priceEth  + " ETH"}
                    {currency === "btc"  && product.priceUsdc && "≈ " + product.priceUsdc + " USDC"}
                  </div>
                </div>

                {/* Acquire button */}
                {ordered ? (
                  <div style={{
                    padding: "12px", textAlign: "center",
                    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.4)",
                    ...MONO, fontSize: 10, color: "#34D399", letterSpacing: "0.16em",
                  }}>
                    ✓ ORDER PLACED — 72H ESCROW ACTIVE
                  </div>
                ) : (
                  <button onClick={handleOrder} disabled={ordering} style={{
                    width: "100%", padding: "12px",
                    background: ordering ? "#3D4560" : "linear-gradient(135deg, #D4AF37, #B8860B)",
                    border: "none", color: "#05080F",
                    ...MONO, fontSize: 10, fontWeight: 900, letterSpacing: "0.18em",
                    cursor: ordering ? "not-allowed" : "pointer",
                  }}>
                    {ordering ? "PROCESSING..." : "INITIATE ACQUISITION →"}
                  </button>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div style={{ background: "#07091A", border: "1px solid #1A2035", padding: "16px 20px", marginBottom: 12 }}>
              <div style={{ ...MONO, fontSize: 8, letterSpacing: "0.2em", color: "#3D4560", marginBottom: 12 }}>VAULT METADATA</div>
              {[
                { k: "Product ID", v: product.id },
                { k: "Chamber",    v: meta.chamber.split("—")[0].trim() },
                { k: "Grade",      v: "TIER-1 INSTITUTIONAL" },
                { k: "Delivery",   v: "IMMEDIATE · POST-ESCROW" },
                { k: "SLA",        v: "99.999% UPTIME" },
                { k: "ZK Proven",  v: "YES — GROTH16" },
                { k: "OSFI",       v: "B-13 COMPLIANT" },
              ].map(row => (
                <div key={row.k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0A0D18" }}>
                  <span style={{ ...MONO, fontSize: 9, color: "#5B6480" }}>{row.k}</span>
                  <span style={{ ...MONO, fontSize: 9, color: "#D4AF37" }}>{row.v}</span>
                </div>
              ))}
            </div>

            {/* Glass Box Note */}
            <div style={{ border: "1px solid rgba(212,175,55,0.2)", padding: "14px 16px", background: "rgba(212,175,55,0.03)" }}>
              <div style={{ ...MONO, fontSize: 8, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 8 }}>
                ◈ GLASS BOX PROTOCOL
              </div>
              <div style={{ fontSize: 10, color: "#5B6480", lineHeight: 1.6 }}>
                Every action taken by the dAIsy haMINJA brain is logged, verified, and immutable. You receive not just a result — a transparent audit trail of a perfectly executed, paradox-based outcome.
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
