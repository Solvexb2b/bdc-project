import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { blink } from '@/blink/client'
import { DashboardLayout } from '@/components/DashboardLayout'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Search, ShieldCheck, Mail, Check, X, Bell, Loader2, ExternalLink } from 'lucide-react'

const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SERIF = '"Playfair Display", Georgia, serif'
const GOLD = '#D4AF37'
const MUTED = '#6B7280'
const BORDER = '#1A2235'
const PANEL = '#0A0F1A'
const BG = '#05080F'
const GREEN = '#22C55E'
const AMBER = '#F59E0B'
const BLUE = '#64B4FF'

type MessageStatus = 'draft' | 'approved' | 'sent' | 'replied' | 'denied' | 'failed'
interface Run { id: string; userId: string; objective: string; sector: string; region: string; status: string; findings: string; createdAt: string; updatedAt: string }
interface Message { id: string; runId: string; userId: string; companyName: string; contactName: string | null; contactEmail: string | null; painPoint: string; estimatedImpact: string; evidence: string; subject: string; body: string; status: MessageStatus; providerMessageId: string | null; lastError: string | null; createdAt: string; updatedAt: string }

const runTable = blink.db.table<Run>('outreach_runs')
const messageTable = blink.db.table<Message>('outreach_messages')

function now() { return new Date().toISOString() }
function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Unexpected outreach error' }

function StatusPill({ status }: { status: string }) {
  const color = status === 'sent' || status === 'replied' || status === 'approved' ? GREEN : status === 'failed' || status === 'denied' ? '#EF4444' : AMBER
  return <span style={{ color, border: `1px solid ${color}55`, background: `${color}12`, padding: '3px 7px', fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{status}</span>
}

function OperatorGate({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => blink.auth.onAuthStateChanged(state => { setSignedIn(Boolean(state.user)); if (!state.isLoading) setLoading(false) }), [])
  if (loading) return <div style={{ minHeight: '100vh', background: BG, color: GOLD, display: 'grid', placeItems: 'center', fontFamily: MONO }}>CHECKING OPERATOR SESSION…</div>
  if (!signedIn) return <div style={{ minHeight: '100vh', background: BG, color: '#E0E0E0', display: 'grid', placeItems: 'center', padding: 24 }}><div style={{ maxWidth: 520, textAlign: 'center' }}><div style={{ color: GOLD, fontFamily: SERIF, fontSize: 30, marginBottom: 12 }}>Operator approval required</div><p style={{ color: MUTED, fontFamily: MONO, fontSize: 12, lineHeight: 1.7 }}>Scanning and outbound communication are restricted to an authenticated operator. Sign in to review drafts and authorize each message.</p><Button onClick={() => blink.auth.login(window.location.href)} style={{ marginTop: 18, background: GOLD, color: BG, fontFamily: MONO }}>SIGN IN TO CONTROL ROOM</Button></div></div>
  return <>{children}</>
}

function OutreachControl() {
  const [objective, setObjective] = useState('Find enterprise infrastructure and compliance inefficiencies where SolveX can reduce cost, risk, or operational delay.')
  const [sector, setSector] = useState('Financial infrastructure')
  const [region, setRegion] = useState('United States and Canada')
  const [runs, setRuns] = useState<Run[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Message | null>(null)
  const [scanning, setScanning] = useState(false)
  const [sending, setSending] = useState(false)
  const [noticeEmail, setNoticeEmail] = useState('')

  const load = useCallback(async () => {
    try {
      const [runRows, messageRows] = await Promise.all([
        runTable.list({ orderBy: { createdAt: 'desc' }, limit: 12 }),
        messageTable.list({ orderBy: { createdAt: 'desc' }, limit: 50 }),
      ])
      setRuns(runRows); setMessages(messageRows)
      setSelected(current => current ? messageRows.find(row => row.id === current.id) ?? current : messageRows.find(row => row.status === 'draft') ?? messageRows[0] ?? null)
    } catch (error) { toast.error(errorMessage(error)) }
  }, [])

  useEffect(() => {
    let active = true
    load().catch(() => { if (active) toast.error('Unable to load outreach records') })
    return () => { active = false }
  }, [load])

  const draftCount = useMemo(() => messages.filter(message => message.status === 'draft').length, [messages])
  const sentCount = useMemo(() => messages.filter(message => message.status === 'sent' || message.status === 'replied').length, [messages])

  const scan = async () => {
    if (!objective.trim() || scanning) return
    setScanning(true)
    try {
      const runId = `run_${Date.now()}`
      await runTable.create({ id: runId, userId: 'admin', objective, sector, region, status: 'scanning', findings: '', createdAt: now(), updatedAt: now() })
      const { text } = await blink.ai.generateText({
        model: 'google/gemini-3-flash', search: true, maxTokens: 1300,
        prompt: `You are the research analyst inside SolveX Paradox Box. Research public, current information about ${sector} in ${region} for this objective: ${objective}\n\nIdentify up to three real organizations with public evidence of costly infrastructure, operations, or compliance pain points. Do not invent companies, contacts, savings, certifications, or URLs. Only use public business information. For each result provide: organization, specific pain point, estimated impact as a clearly labeled hypothesis, why SolveX may fit, public evidence URLs, and a publicly listed business contact route if available. State that findings require human verification before outreach. Use concise markdown.`
      })
      await runTable.update(runId, { status: 'complete', findings: text, updatedAt: now() })
      toast.success('Research scan complete. Findings are saved for operator review.')
      await load()
    } catch (error) { toast.error(errorMessage(error)) } finally { setScanning(false) }
  }

  const approve = async () => {
    if (!selected) return
    try { await messageTable.update(selected.id, { status: 'approved', updatedAt: now() }); toast.success('Draft approved. It is ready for explicit send authorization.'); await load() } catch (error) { toast.error(errorMessage(error)) }
  }
  const deny = async () => {
    if (!selected) return
    try { await messageTable.update(selected.id, { status: 'denied', updatedAt: now() }); toast.success('Draft denied and retained in the audit trail.'); await load() } catch (error) { toast.error(errorMessage(error)) }
  }
  const send = async () => {
    if (!selected?.contactEmail || selected.status !== 'approved' || sending) return
    setSending(true)
    try {
      const result = await blink.notifications.email({ to: selected.contactEmail, replyTo: noticeEmail || undefined, subject: selected.subject, text: selected.body, html: `<div style="font-family:Arial,sans-serif;white-space:pre-line">${selected.body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div><p style="font-size:12px;color:#666">If this is not relevant, reply and we will not contact you again.</p>` })
      await messageTable.update(selected.id, { status: 'sent', providerMessageId: result.messageId ?? null, updatedAt: now() })
      toast.success('Message sent. Replies should be directed to the reply-to address you provided.')
      await load()
    } catch (error) { await messageTable.update(selected.id, { status: 'failed', lastError: errorMessage(error), updatedAt: now() }).catch(() => {}); toast.error(errorMessage(error)) } finally { setSending(false) }
  }

  return <DashboardLayout><div style={{ minHeight: '100%', background: BG, color: '#E0E0E0', fontFamily: MONO }}>
    <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '30px 28px 22px' }}><div style={{ color: GOLD, fontFamily: SERIF, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700 }}>OUTREACH CONTROL</div><p style={{ color: MUTED, fontSize: 10, letterSpacing: '0.1em', margin: '8px 0 0' }}>EVIDENCE → HUMAN REVIEW → APPROVAL → OUTBOUND CONTACT → REPLY NOTIFICATION</p></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', borderBottom: `1px solid ${BORDER}`, background: PANEL }}>{[['SCANS', runs.length, BLUE], ['DRAFTS', draftCount, AMBER], ['SENT / REPLIED', sentCount, GREEN], ['REPLIES', 'INBOX SETUP', GOLD]].map(([label, value, color]) => <div key={String(label)} style={{ padding: '14px 20px', borderRight: `1px solid ${BORDER}` }}><div style={{ color: MUTED, fontSize: 9, letterSpacing: '0.1em' }}>{label}</div><div style={{ color: color as string, fontFamily: SERIF, fontSize: 22, marginTop: 6 }}>{value}</div></div>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,0.9fr) minmax(360px,1.4fr)', gap: 1, background: BORDER }}>
      <section style={{ background: PANEL, padding: 22 }}><h2 style={{ color: GOLD, fontFamily: SERIF, fontSize: 20, margin: '0 0 16px' }}>1. SCAN THE MARKET</h2><label style={{ color: MUTED, fontSize: 10 }}>OBJECTIVE</label><textarea value={objective} onChange={event => setObjective(event.target.value)} style={{ minHeight: 110, marginTop: 7, width: '100%', background: BG, color: '#E0E0E0', borderColor: BORDER, fontFamily: MONO, fontSize: 11, padding: 10 }} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}><div><label style={{ color: MUTED, fontSize: 10 }}>SECTOR</label><Input value={sector} onChange={event => setSector(event.target.value)} style={{ marginTop: 7, background: BG, color: '#E0E0E0', borderColor: BORDER, fontFamily: MONO }} /></div><div><label style={{ color: MUTED, fontSize: 10 }}>REGION</label><Input value={region} onChange={event => setRegion(event.target.value)} style={{ marginTop: 7, background: BG, color: '#E0E0E0', borderColor: BORDER, fontFamily: MONO }} /></div></div><Button onClick={scan} disabled={scanning} style={{ marginTop: 16, width: '100%', background: GOLD, color: BG, fontFamily: MONO }}>{scanning ? <><Loader2 size={15} className="animate-spin" /> RESEARCHING PUBLIC SOURCES…</> : <><Search size={15} /> RUN VERIFIED-SOURCE SCAN</>}</Button><div style={{ marginTop: 18, padding: 12, border: `1px solid ${BORDER}`, color: MUTED, fontSize: 10, lineHeight: 1.7 }}><ShieldCheck size={15} color={GREEN} style={{ verticalAlign: 'middle', marginRight: 6 }} />Public evidence only. Contacts and impact estimates must be verified by a human before outreach.</div></section>
      <section style={{ background: BG, padding: 22 }}><h2 style={{ color: GOLD, fontFamily: SERIF, fontSize: 20, margin: '0 0 16px' }}>RESEARCH LOG</h2>{runs.length === 0 && <div style={{ color: MUTED, fontSize: 11, padding: '28px 0' }}>No scans yet. Run a focused scan to create an auditable research record.</div>}{runs.map(run => <article key={run.id} style={{ border: `1px solid ${BORDER}`, marginBottom: 10, padding: 14, background: PANEL }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}><strong style={{ color: '#E0E0E0', fontSize: 11 }}>{run.sector} · {run.region}</strong><StatusPill status={run.status} /></div><p style={{ color: MUTED, fontSize: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 170, overflow: 'auto', marginBottom: 0 }}>{run.findings || 'Research in progress…'}</p></article>)}</section>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px,0.7fr) minmax(400px,1.5fr)', gap: 1, background: BORDER }}><section style={{ background: PANEL, padding: 22 }}><h2 style={{ color: GOLD, fontFamily: SERIF, fontSize: 20, margin: '0 0 16px' }}>2. DRAFT QUEUE</h2>{messages.length === 0 && <div style={{ color: MUTED, fontSize: 11 }}>Drafts created from verified findings will appear here.</div>}{messages.map(message => <button key={message.id} onClick={() => setSelected(message)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: 12, marginBottom: 8, background: selected?.id === message.id ? '#162040' : BG, color: '#E0E0E0', border: `1px solid ${selected?.id === message.id ? GOLD : BORDER}` }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11 }}><strong>{message.companyName}</strong><StatusPill status={message.status} /></div><div style={{ color: MUTED, fontSize: 9, marginTop: 5 }}>{message.contactEmail || 'Contact needs verification'} · {message.painPoint}</div></button>)}</section><section style={{ background: BG, padding: 22 }}>{selected ? <><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}><div><h2 style={{ color: GOLD, fontFamily: SERIF, fontSize: 20, margin: 0 }}>3. REVIEW & AUTHORIZE</h2><p style={{ color: MUTED, fontSize: 10, marginTop: 6 }}>{selected.companyName} · {selected.contactName || 'Contact name not recorded'} · {selected.contactEmail || 'No email verified'}</p></div><StatusPill status={selected.status} /></div><div style={{ border: `1px solid ${BORDER}`, padding: 14, marginTop: 14, background: PANEL }}><div style={{ color: AMBER, fontSize: 10, letterSpacing: '0.1em' }}>PAIN POINT</div><p style={{ fontSize: 11, lineHeight: 1.6, marginTop: 6 }}>{selected.painPoint}</p><div style={{ color: GREEN, fontSize: 10, letterSpacing: '0.1em' }}>EVIDENCE / IMPACT</div><p style={{ color: MUTED, fontSize: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.evidence} · {selected.estimatedImpact}</p></div><h3 style={{ color: '#E0E0E0', fontSize: 12, margin: '18px 0 7px' }}>SUBJECT: {selected.subject}</h3><div style={{ border: `1px solid ${BORDER}`, background: PANEL, padding: 14, color: '#D8DCE6', fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.body}</div><div style={{ marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}><label style={{ color: MUTED, fontSize: 10 }}>REPLY-TO / RESPONSE NOTIFICATION EMAIL</label><Input value={noticeEmail} onChange={event => setNoticeEmail(event.target.value)} placeholder="you@your-domain.com" style={{ marginTop: 7, background: PANEL, color: '#E0E0E0', borderColor: BORDER, fontFamily: MONO }} /><p style={{ color: MUTED, fontSize: 9, lineHeight: 1.6, marginTop: 7 }}><Bell size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />The current email service sends outbound messages and routes replies to this address. Automatic mailbox polling/webhook ingestion requires a connected mailbox/provider.</p></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>{selected.status === 'draft' && <><Button onClick={approve} style={{ background: GREEN, color: BG, fontFamily: MONO }}><Check size={15} /> APPROVE DRAFT</Button><Button onClick={deny} variant="outline" style={{ color: '#EF4444', borderColor: '#EF4444', fontFamily: MONO }}><X size={15} /> DENY</Button></>}{selected.status === 'approved' && <Button onClick={send} disabled={sending || !selected.contactEmail} style={{ background: GOLD, color: BG, fontFamily: MONO }}>{sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} SEND AUTHORIZED EMAIL</Button>}{selected.evidence && <Button variant="ghost" onClick={() => window.open(selected.evidence.split(/\s+/).find(value => value.startsWith('http')), '_blank')} style={{ color: BLUE, fontFamily: MONO }}><ExternalLink size={15} /> OPEN EVIDENCE</Button>}</div></> : <div style={{ color: MUTED, fontSize: 11 }}>Select a message to review. The system never sends directly from the scan step.</div>}</section></div>
  </div></DashboardLayout>
}

export const Route = createFileRoute('/outreach')({ head: () => ({ meta: [{ title: 'Outreach Control · SolveX' }] }), component: () => <BlinkClientBoundary fallback={<div style={{ minHeight: '100vh', background: BG }} />}><OperatorGate><OutreachControl /></OperatorGate></BlinkClientBoundary> })