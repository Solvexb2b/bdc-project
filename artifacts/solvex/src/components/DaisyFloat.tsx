import { useCallback, useEffect, useRef, useState } from "react";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: new () => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: new () => any;
  }
}

function useStyles() {
  useEffect(() => {
    const id = "daisy-float-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @keyframes df-head  { 0%,100%{transform:translateY(0) rotate(0deg)} 30%{transform:translateY(-10px) rotate(1.5deg)} 70%{transform:translateY(5px) rotate(-1deg)} }
      @keyframes df-hl    { 0%,100%{transform:translateY(0) rotate(-6deg)} 35%{transform:translateY(-14px) rotate(-10deg)} 70%{transform:translateY(7px) rotate(-4deg)} }
      @keyframes df-hr    { 0%,100%{transform:translateY(0) rotate(6deg)}  40%{transform:translateY(-12px) rotate(10deg)}  75%{transform:translateY(6px) rotate(4deg)} }
      @keyframes df-hls   { 0%,100%{transform:translateY(0) rotate(-6deg) translateX(0)} 20%{transform:translateY(-22px) rotate(-18deg) translateX(-12px)} 50%{transform:translateY(-10px) rotate(-10deg) translateX(6px)} 80%{transform:translateY(-20px) rotate(-15deg) translateX(-8px)} }
      @keyframes df-hrs   { 0%,100%{transform:translateY(0) rotate(6deg) translateX(0)}  20%{transform:translateY(-20px) rotate(18deg) translateX(12px)}  50%{transform:translateY(-12px) rotate(10deg) translateX(-6px)} 80%{transform:translateY(-22px) rotate(15deg) translateX(8px)} }
      @keyframes df-hll   { 0%,100%{transform:translateY(0) rotate(-6deg)} 50%{transform:translateY(-8px) rotate(-12deg)} }
      @keyndef df-hrl     { 0%,100%{transform:translateY(0) rotate(6deg)}  50%{transform:translateY(-8px) rotate(12deg)} }
      @keyframes df-gi    { 0%,100%{box-shadow:0 0 14px 5px #D4AF3755} 50%{box-shadow:0 0 28px 12px #D4AF3788} }
      @keyframes df-gl    { 0%,100%{box-shadow:0 0 18px 7px #34D39966} 50%{box-shadow:0 0 36px 16px #34D399aa} }
      @keyframes df-gs    { 0%,100%{box-shadow:0 0 18px 7px #A78BFA66} 50%{box-shadow:0 0 40px 18px #A78BFAaa} }
      @keyframes df-mic   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.35);opacity:0.6} }
      @keyframes df-spin  { to{transform:rotate(360deg)} }
      @keyframes df-in    { from{opacity:0;transform:translateY(10px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes df-bar   { 0%,100%{height:4px} 50%{height:18px} }
    `;
    document.head.appendChild(el);
    return () => document.getElementById(id)?.remove();
  }, []);
}

function HandSVG({ flipped, state }: { flipped: boolean; state: VoiceState }) {
  const col = state === "speaking" ? "#A78BFA" : state === "listening" ? "#34D399" : "#D4AF37";
  return (
    <svg width="52" height="72" viewBox="0 0 52 72" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flipped ? "scaleX(-1)" : undefined, filter: `drop-shadow(0 0 ${state !== "idle" ? 10 : 3}px ${col}99)`, transition: "filter 0.5s ease" }}>
      <rect x="1"  y="18" width="7"  height="21" rx="3.5" stroke={col} strokeWidth="1.3" fill="none" opacity="0.85"/>
      <rect x="10" y="10" width="8"  height="27" rx="4"   stroke={col} strokeWidth="1.3" fill="none" opacity="0.85"/>
      <rect x="20" y="3"  width="8"  height="33" rx="4"   stroke={col} strokeWidth="1.3" fill="none" opacity="0.85"/>
      <rect x="30" y="9"  width="8"  height="29" rx="4"   stroke={col} strokeWidth="1.3" fill="none" opacity="0.85"/>
      <rect x="40" y="24" width="8"  height="19" rx="4"   stroke={col} strokeWidth="1.3" fill="none" opacity="0.85" transform="rotate(-22 44 34)"/>
      <rect x="1"  y="38" width="47" height="29" rx="8"   stroke={col} strokeWidth="1.3" fill={col} fillOpacity="0.05"/>
      <line x1="9"  y1="48" x2="38" y2="48" stroke={col} strokeWidth="0.5" opacity="0.25"/>
      <line x1="12" y1="55" x2="34" y2="55" stroke={col} strokeWidth="0.5" opacity="0.2"/>
      <circle cx="24" cy="55" r="2" fill={col} opacity="0.18"/>
    </svg>
  );
}

async function createConversation(): Promise<number> {
  const r = await fetch("/api/openai/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "dAIsy Float Session" }),
  });
  const d = await r.json() as { id: number };
  return d.id;
}

async function* streamText(convId: number, userMsg: string): AsyncGenerator<string> {
  const resp = await fetch(`/api/openai/conversations/${convId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: userMsg }),
  });
  if (!resp.body) return;
  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.replace(/^data: /, "").trim();
      if (!line) continue;
      try {
        const ev = JSON.parse(line) as { content?: string; done?: boolean };
        if (ev.content) yield ev.content;
      } catch { /* skip */ }
    }
  }
}

async function speakText(text: string, convId: number, onChunk: () => void, onDone: () => void): Promise<() => void> {
  let stopped = false;
  const stop = () => { stopped = true; };

  (async () => {
    try {
      const resp = await fetch(`/api/openai/conversations/${convId}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!resp.body || stopped) { onDone(); return; }

      const audioCtx = new AudioContext();
      const reader = resp.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (stopped) { onDone(); return; }
        if (done) break;
        if (value) chunks.push(value);
      }

      const total = chunks.reduce((a, c) => a + c.length, 0);
      const merged = new Uint8Array(total);
      let off = 0;
      for (const c of chunks) { merged.set(c, off); off += c.length; }

      if (stopped) { onDone(); return; }
      const audioBuf = await audioCtx.decodeAudioData(merged.buffer);
      const src = audioCtx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(audioCtx.destination);
      onChunk();
      src.onended = () => { audioCtx.close(); onDone(); };
      src.start();
    } catch {
      onDone();
    }
  })();

  return stop;
}

export function DaisyFloat() {
  useStyles();

  const [state, setState]       = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [bubble, setBubble]     = useState(false);
  const [convId, setConvId]     = useState<number | null>(null);
  const [welcomed, setWelcomed] = useState(false);

  const stateRef    = useRef<VoiceState>("idle");
  const recRef      = useRef<unknown>(null);
  const stopTtsRef  = useRef<(() => void) | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { stateRef.current = state; }, [state]);

  const clearBubbleTimer = () => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current); };

  const scheduleBubbleClose = useCallback((ms = 8000) => {
    clearBubbleTimer();
    bubbleTimer.current = setTimeout(() => setBubble(false), ms);
  }, []);

  const stopSpeaking = useCallback(() => {
    stopTtsRef.current?.();
    stopTtsRef.current = null;
    setState("idle");
  }, []);

  const deliverResponse = useCallback(async (fullText: string, cid: number) => {
    setResponse(fullText);
    setState("processing");

    const stopFn = await speakText(
      fullText,
      cid ?? 0,
      () => { setState("speaking"); },
      () => {
        setState("idle");
        scheduleBubbleClose(6000);
      }
    );
    stopTtsRef.current = stopFn;
  }, [scheduleBubbleClose]);

  const sendMessage = useCallback(async (userMsg: string, cid: number) => {
    setTranscript(userMsg);
    setBubble(true);
    setResponse("");
    setState("processing");

    let full = "";
    for await (const chunk of streamText(cid, userMsg)) {
      full += chunk;
      setResponse(full);
    }
    await deliverResponse(full, cid);
  }, [deliverResponse]);

  const welcome = useCallback(async (cid: number) => {
    setBubble(true);
    setTranscript("");
    setResponse("");
    setState("processing");

    let full = "";
    for await (const chunk of streamText(cid, "__WELCOME__")) {
      full += chunk;
      setResponse(full);
    }
    setWelcomed(true);
    await deliverResponse(full, cid);
  }, [deliverResponse]);

  useEffect(() => {
    if (welcomed) return;
    let cancelled = false;
    createConversation().then(cid => {
      if (cancelled) return;
      setConvId(cid);
      welcome(cid);
    });
    return () => { cancelled = true; };
  }, [welcome, welcomed]);

  const handleClick = useCallback(async () => {
    const cur = stateRef.current;

    if (cur === "speaking") { stopSpeaking(); return; }
    if (cur === "processing") return;
    if (cur === "listening") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recRef.current as any)?.stop();
      return;
    }

    let cid: number;
    if (convId !== null) {
      cid = convId;
    } else {
      cid = await createConversation();
      setConvId(cid);
    }

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setResponse("Voice recognition requires Chrome or Edge. You can also type in the Brain Console Comm-Link tab.");
      setBubble(true);
      scheduleBubbleClose(8000);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.continuous     = false;
    rec.interimResults = false;
    rec.lang           = "en-US";
    recRef.current     = rec;

    rec.onstart  = () => setState("listening");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = async (e: any) => {
      const text = (e.results[0][0].transcript as string).trim();
      await sendMessage(text, cid);
    };
    rec.onerror  = () => setState("idle");
    rec.onend    = () => { if (stateRef.current === "listening") setState("idle"); };
    rec.start();
  }, [convId, sendMessage, stopSpeaking, scheduleBubbleClose]);

  const borderColor = state === "listening" ? "#34D399" : state === "speaking" ? "#A78BFA" : "#D4AF37";
  const headGlow    = state === "listening" ? "df-gl 1.2s ease-in-out infinite" : state === "speaking" ? "df-gs 1.4s ease-in-out infinite" : "df-gi 2.4s ease-in-out infinite";
  const lAnim       = state === "speaking" ? "df-hls 1.7s ease-in-out infinite" : state === "listening" ? "df-hll 1.2s ease-in-out infinite" : "df-hl 5.4s ease-in-out infinite";
  const rAnim       = state === "speaking" ? "df-hrs 2.0s ease-in-out infinite" : state === "listening" ? "df-hll 1.4s ease-in-out infinite" : "df-hr 4.9s ease-in-out infinite";
  const label       = state === "listening" ? "LISTENING…" : state === "processing" ? "PROCESSING…" : state === "speaking" ? "SPEAKING — tap to stop" : "SPEAK WITH dAIsy";

  return (
    <>
      {/* Speech bubble */}
      {bubble && (
        <div style={{
          position: "fixed", bottom: 300, right: 16, width: 300, zIndex: 9998,
          background: "rgba(5,8,15,0.97)", border: `1px solid ${borderColor}44`,
          padding: "14px 16px 12px", fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "#C8C9D0", lineHeight: 1.65,
          animation: "df-in 0.28s ease-out", maxHeight: 240, overflowY: "auto",
          boxShadow: `0 0 24px ${borderColor}22`,
        }}>
          <div onClick={() => { clearBubbleTimer(); setBubble(false); stopSpeaking(); }}
            style={{ position: "absolute", top: 6, right: 9, color: "#3D4560", cursor: "pointer", fontSize: 13 }}>✕</div>

          {transcript && (
            <div style={{ color: "#3D4560", marginBottom: 8, fontSize: 9, letterSpacing: "0.12em" }}>
              OPERATOR: {transcript}
            </div>
          )}

          {state === "processing" && !response ? (
            <span style={{ color: "#D4AF37", letterSpacing: "0.12em", fontSize: 10 }}>Initializing Sovereign Core…</span>
          ) : (
            <div style={{ color: "#B0B4C4", whiteSpace: "pre-wrap" }}>
              {response.length > 400 ? response.slice(0, 400) + "…" : response}
            </div>
          )}
        </div>
      )}

      {/* Left hand */}
      <div style={{ position: "fixed", bottom: 142, right: 214, zIndex: 9997, animation: lAnim, pointerEvents: "none", opacity: 0.88 }}>
        <HandSVG flipped={false} state={state} />
      </div>

      {/* Right hand */}
      <div style={{ position: "fixed", bottom: 150, right: 18, zIndex: 9997, animation: rAnim, pointerEvents: "none", opacity: 0.88 }}>
        <HandSVG flipped={true} state={state} />
      </div>

      {/* Head */}
      <div onClick={handleClick} style={{
        position: "fixed", bottom: 24, right: 90, zIndex: 9999,
        cursor: "pointer", animation: "df-head 4.2s ease-in-out infinite", userSelect: "none",
      }}>
        <div style={{
          width: 82, height: 82, borderRadius: "50%", overflow: "hidden",
          border: `2px solid ${borderColor}`, animation: headGlow,
          transition: "border-color 0.5s ease", position: "relative",
        }}>
          <img src="/daisy-avatar.png" alt="dAIsy haMINJA"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

          {state !== "idle" && (
            <div style={{
              position: "absolute", inset: 0,
              background: state === "speaking" ? "rgba(167,139,250,0.18)" : state === "listening" ? "rgba(52,211,153,0.18)" : "rgba(212,175,55,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {state === "listening" && (
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#34D399", animation: "df-mic 0.75s ease-in-out infinite" }} />
              )}
              {state === "processing" && (
                <div style={{ width: 14, height: 14, border: "2.5px solid #D4AF37", borderRadius: "50%", borderTopColor: "transparent", animation: "df-spin 0.7s linear infinite" }} />
              )}
              {state === "speaking" && (
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  {[0.5, 0.7, 0.9, 0.7, 0.5].map((d, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2, background: "#A78BFA",
                      animation: `df-bar ${d}s ease-in-out infinite`, animationDelay: `${i * 0.1}s`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{
          textAlign: "center", fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 7, letterSpacing: "0.12em", color: `${borderColor}99`,
          marginTop: 5, transition: "color 0.5s ease", whiteSpace: "nowrap",
        }}>{label}</div>
      </div>
    </>
  );
}
