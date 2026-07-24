import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { BRAIN_PRODUCTS } from '@/data/brainData'

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const G = '#D4AF37'; const BG = '#05080F'; const PANEL = '#0A0F1A'
const FG = '#E0E0E0'; const MUTED = '#6B7280'; const BORDER = '#1A2235'
const ACCENT = '#162040'; const GREEN = '#22C55E'; const RED = '#EF4444'
const MONO = '"IBM Plex Mono","Courier New",monospace'
const SERIF = '"Playfair Display","Georgia",serif'

/* ── Seed boot sequence ────────────────────────────────────────────────────── */
const BOOT_LINES: { time: string; msg: string; accent?: boolean }[] = [
  { time: '00:00:00.000', msg: 'KERNEL SOVEREIGNTY AXIOM · boot attestation · HSM nonce validated', accent: true },
  { time: '00:00:00.412', msg: 'Chassis Controller v3.8 · bare-metal register mapping · DMA ring-buffer armed' },
  { time: '00:00:00.871', msg: 'Memory Controller · 256 MiB non-pageable sovereign partition allocated' },
  { time: '00:00:01.204', msg: 'Deterministic Clock Synchronizer · monotonic nanosecond pin · epoch drift ±0.0014σ' },
  { time: '00:00:01.659', msg: 'Consensus Engine · fractal consensus protocol · quorum threshold 67%' },
  { time: '00:00:02.103', msg: 'Zero-Sandbox Hardware Access · eBPF verifier · system-call sanitizer ONLINE' },
  { time: '00:00:02.448', msg: 'Compliance-as-a-Service Enclave · NIST SP 800-53 · SOC 2 · ISO 27001 VERIFIED' },
  { time: '00:00:03.001', msg: 'dAIsy haMINJA SENTINEL INTELLIGENCE PROTOCOL · U.A.R.E.F.A.K.E. convergence proof ACTIVE', accent: true },
  { time: '00:00:03.314', msg: 'Solvex Black Box Vault · military-grade enclave · ephemeral key zeroization ARMED' },
  { time: '00:00:03.781', msg: 'Solvex Envoy Protocol · outbound pitch security suite · end-to-end encrypted READY' },
  { time: '00:00:04.092', msg: 'Autonomous Consensus Engine Middleware · cross-shard atomicity · split-brain guard ONLINE' },
  { time: '00:00:04.510', msg: 'System health: ALL 13 BRAIN PRODUCTS OPERATIONAL · 7 SOLUTION LAYERS VERIFIED', accent: true },
  { time: '00:00:04.887', msg: 'BRAIN CONSOLE READY. dAIsy haMINJA awaiting directive.', accent: true },
]

/* ── Category badge config ─────────────────────────────────────────────────── */
const CAT_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  fundamental: { label: 'FUNDAMENTAL', bg: 'rgba(212,175,55,0.10)', text: G, border: '1px solid rgba(212,175,55,0.35)' },
  operational: { label: 'OPERATIONAL', bg: 'rgba(100,180,255,0.10)', text: '#64B4FF', border: '1px solid rgba(100,180,255,0.35)' },
  ai:           { label: 'AI SENTINEL',  bg: 'rgba(168,85,247,0.10)', text: '#A855F7', border: '1px solid rgba(168,85,247,0.35)' },
}

/* ── Keyframes ─────────────────────────────────────────────────────────────── */
const KF = `
@keyframes blink-cursor { 0%,100% { opacity:1 } 50% { opacity:0 } }
@keyframes pulse-dot { 0%,100% { opacity:1; box-shadow:0 0 6px ${G} } 50% { opacity:0.35; box-shadow:0 0 14px ${G} } }
@keyframes fade-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
@media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:0.01ms!important; animation-delay:0ms!important } }
`

/* ── Terminal sub-component ────────────────────────────────────────────────── */
function Terminal() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')

  const submit = () => {
    const v = input.trim()
    if (!v) return
    setMessages(prev => [...prev, `> ${v}`])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, `dAIsy: Directive "${v.slice(0, 42)}${v.length > 42 ? '…' : ''}" acknowledged. Sovereignty maintained.`])
    }, 600)
  }

  const allLines = [
    ...BOOT_LINES.map(l => ({ ...l, source: 'boot' as const })),
    ...messages.map(m => ({ time: '', msg: m, accent: m.startsWith('dAIsy:'), source: 'chat' as const })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Terminal output */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', fontFamily: MONO, fontSize: 10, lineHeight: 1.8, color: MUTED }}>
        {allLines.map((l, i) => (
          <div key={i} style={{
            color: l.accent ? G : l.source === 'chat' && !l.accent ? FG : MUTED,
            opacity: l.source === 'chat' ? 1 : 0.72,
            animation: `fade-up 0.25s ease-out both`,
            animationDelay: `${i < BOOT_LINES.length ? i * 50 : 0}ms`,
            paddingLeft: l.source === 'chat' ? 16 : 0,
            borderLeft: l.source === 'chat' ? `2px solid ${BORDER}` : 'none',
          }}>
            {l.time && <span style={{ color: MUTED, marginRight: 10 }}>[{l.time}]</span>}
            {l.msg}
          </div>
        ))}
        {/* Blinking cursor */}
        <span style={{ display: 'inline-block', width: 8, height: 14, background: G, marginLeft: 4, verticalAlign: 'middle', animation: 'blink-cursor 1s step-end infinite' }} />
      </div>

      {/* Terminal input */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '12px 24px', background: PANEL }}>
        <form
          onSubmit={e => { e.preventDefault(); submit() }}
          style={{ display: 'flex', gap: 10 }}
        >
          <span style={{ fontFamily: MONO, fontSize: 10, color: G, lineHeight: '36px', flexShrink: 0 }}>dAIsy:~$</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter directive…"
            style={{
              flex: 1, fontFamily: MONO, fontSize: 10, color: FG,
              background: 'transparent', border: `1px solid ${BORDER}`,
              padding: '8px 12px', outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = G }}
            onBlur={e => { e.target.style.borderColor = BORDER }}
          />
          <button
            type="submit"
            style={{
              fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              padding: '8px 18px', color: BG, background: G, border: 'none',
              cursor: 'pointer', textTransform: 'uppercase', flexShrink: 0,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            TRANSMIT DIRECTIVE →
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Knowledge Base sub-component ──────────────────────────────────────────── */
function KnowledgeBase() {
  const groups = useMemo(() => {
    const order = ['fundamental', 'operational', 'ai']
    const labels: Record<string, string> = { fundamental: 'FUNDAMENTAL CORE', operational: 'OPERATIONAL LAYER', ai: 'AI SENTINEL INTELLIGENCE' }
    return order.map(cat => ({ cat, label: labels[cat], products: BRAIN_PRODUCTS.filter(p => p.category === cat) }))
  }, [])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      {groups.map((g, gi) => (
        <div key={g.cat} style={{ marginBottom: gi < groups.length - 1 ? 32 : 0 }}>
          {/* Group header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            paddingBottom: 8, borderBottom: `1px solid ${BORDER}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_BADGE[g.cat].text }} />
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: CAT_BADGE[g.cat].text, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {g.label}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: MUTED }}>({g.products.length})</span>
          </div>

          {/* Product cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {g.products.map((p, pi) => {
              const badge = CAT_BADGE[p.category]
              return (
                <div
                  key={p.id}
                  style={{
                    background: PANEL, border: `1px solid ${BORDER}`,
                    padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
                    animation: `fade-up 0.3s ease-out both`,
                    animationDelay: `${(gi * g.products.length + pi) * 40}ms`,
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.35)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = BORDER
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{
                      fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: '0.12em',
                      padding: '2px 8px', background: badge.bg, color: badge.text, border: badge.border,
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: MUTED, flexShrink: 0 }}>
                      {p.id.replace('SOLVEX-BRAIN-', '#')}
                    </span>
                  </div>
                  <h4 style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: G, lineHeight: 1.35, margin: 0 }}>
                    {p.name}
                  </h4>
                  <p style={{ fontFamily: MONO, fontSize: 10, lineHeight: 1.65, color: 'rgba(200,210,225,0.6)', margin: 0, flex: 1 }}>
                    {p.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Page Component ────────────────────────────────────────────────────────── */
export const Route = createFileRoute('/brain')({
  head: () => ({ meta: [{ title: 'Brain Console · SolveX' }] }),
  component: BrainConsole,
})

function BrainConsole() {
  const [tab, setTab] = useState<'TERMINAL' | 'KNOWLEDGE BASE'>('TERMINAL')

  return (
    <DashboardLayout>
      <style>{KF}</style>

      {/* ── Page marquee ── */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{
          whiteSpace: 'nowrap', animation: 'marquee 28s linear infinite',
          padding: '8px 0', fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em',
          color: 'rgba(212,175,55,0.4)', textTransform: 'uppercase',
        }}>
          {'dAIsy haMINJA · SOVEREIGN BRAIN CONSOLE · 13 PRODUCTS · 7 SOLUTION LAYERS · U.A.R.E.F.A.K.E. CONVERGENCE PROOF ACTIVE · '}
          {'dAIsy haMINJA · SOVEREIGN BRAIN CONSOLE · 13 PRODUCTS · 7 SOLUTION LAYERS · U.A.R.E.F.A.K.E. CONVERGENCE PROOF ACTIVE · '}
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{ padding: '28px 32px 20px', borderBottom: `1px solid ${BORDER}`, background: PANEL }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: MUTED, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>
              BRAIN CONSOLE
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 700, color: G, lineHeight: 1.15, margin: 0 }}>
              dAIsy haMINJA — SOVEREIGN CORE
            </h1>
          </div>

          {/* Status indicators */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'U.A.R.E.F.A.K.E. PROOF', ok: true },
              { label: '59/59 PARADOXES', ok: true },
              { label: '13 PRODUCTS', ok: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                  background: s.ok ? GREEN : RED,
                  animation: s.ok ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
                }} />
                <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: s.ok ? GREEN : RED, letterSpacing: '0.08em' }}>
                  {s.label} {s.ok ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, padding: '0 32px' }}>
        {(['TERMINAL', 'KNOWLEDGE BASE'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              padding: '12px 24px', textTransform: 'uppercase',
              color: tab === t ? G : MUTED, background: 'transparent', border: 'none',
              borderBottom: tab === t ? `2px solid ${G}` : '2px solid transparent',
              cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { if (tab !== t) (e.currentTarget as HTMLElement).style.color = G }}
            onMouseLeave={e => { if (tab !== t) (e.currentTarget as HTMLElement).style.color = MUTED }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content (fills remaining height) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {tab === 'TERMINAL' ? <Terminal /> : <KnowledgeBase />}
      </div>
    </DashboardLayout>
  )
}
