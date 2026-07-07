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

function useAnimationStyles() {
  useEffect(() => {
    const id = "daisy-float-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @keyframes daisy-head-float {
        0%,100% { transform: translateY(0px) rotate(0deg); }
        30%      { transform: translateY(-10px) rotate(1.5deg); }
        70%      { transform: translateY(5px) rotate(-1deg); }
      }
      @keyframes daisy-hand-l-idle {
        0%,100% { transform: translateY(0px) rotate(-6deg); }
        35%     { transform: translateY(-14px) rotate(-10deg); }
        70%     { transform: translateY(7px) rotate(-4deg); }
      }
      @keyframes daisy-hand-r-idle {
        0%,100% { transform: translateY(0px) rotate(6deg); }
        40%     { transform: translateY(-12px) rotate(10deg); }
        75%     { transform: translateY(6px) rotate(4deg); }
      }
      @keyframes daisy-hand-l-speak {
        0%,100% { transform: translateY(0px) rotate(-6deg) translateX(0); }
        20%     { transform: translateY(-22px) rotate(-18deg) translateX(-12px); }
        50%     { transform: translateY(-10px) rotate(-10deg) translateX(6px); }
        80%     { transform: translateY(-20px) rotate(-15deg) translateX(-8px); }
      }
      @keyframes daisy-hand-r-speak {
        0%,100% { transform: translateY(0px) rotate(6deg) translateX(0); }
        20%     { transform: translateY(-20px) rotate(18deg) translateX(12px); }
        50%     { transform: translateY(-12px) rotate(10deg) translateX(-6px); }
        80%     { transform: translateY(-22px) rotate(15deg) translateX(8px); }
      }
      @keyframes daisy-glow-idle {
        0%,100% { box-shadow: 0 0 14px 5px #D4AF3755; }
        50%     { box-shadow: 0 0 28px 12px #D4AF3788; }
      }
      @keyframes daisy-glow-listen {
        0%,100% { box-shadow: 0 0 18px 7px #34D39966; }
        50%     { box-shadow: 0 0 36px 16px #34D399aa; }
      }
      @keyframes daisy-glow-speak {
        0%,100% { box-shadow: 0 0 18px 7px #A78BFA66; }
        50%     { box-shadow: 0 0 40px 18px #A78BFAaa; }
      }
      @keyframes daisy-mic-pulse {
        0%,100% { transform: scale(1); opacity: 1; }
        50%     { transform: scale(1.35); opacity: 0.6; }
      }
      @keyframes daisy-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes daisy-bubble-in {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes daisy-hand-listen-l {
        0%,100% { transform: translateY(0px) rotate(-6deg); }
        50%     { transform: translateY(-8px) rotate(-12deg); }
      }
      @keyframes daisy-hand-listen-r {
        0%,100% { transform: translateY(0px) rotate(6deg); }
        50%     { transform: translateY(-8px) rotate(12deg); }
      }
    `;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
}

function HandSVG({ flipped, state }: { flipped: boolean; state: VoiceState }) {
  const col =
    state === "speaking" ? "#A78BFA" :
    state === "listening" ? "#34D399" :
    "#D4AF37";
  const glow = state !== "idle" ? 10 : 4;

  return (
    <svg
      width="54" height="74" viewBox="0 0 54 74" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: flipped ? "scaleX(-1)" : undefined,
        filter: `drop-shadow(0 0 ${glow}px ${col}99)`,
        transition: "filter 0.5s ease",
      }}
    >
      {/* Pinky */}
      <rect x="2"  y="20" width="7"  height="22" rx="3.5" stroke={col} strokeWidth="1.4" fill="none" opacity="0.85"/>
      {/* Ring */}
      <rect x="11" y="12" width="8"  height="28" rx="4"   stroke={col} strokeWidth="1.4" fill="none" opacity="0.85"/>
      {/* Middle (tallest) */}
      <rect x="21" y="4"  width="8"  height="34" rx="4"   stroke={col} strokeWidth="1.4" fill="none" opacity="0.85"/>
      {/* Index */}
      <rect x="31" y="10" width="8"  height="30" rx="4"   stroke={col} strokeWidth="1.4" fill="none" opacity="0.85"/>
      {/* Thumb — angled outward */}
      <rect x="41" y="26" width="8"  height="20" rx="4"   stroke={col} strokeWidth="1.4" fill="none" opacity="0.85"
        transform="rotate(-22 45 36)"/>
      {/* Palm */}
      <rect x="2"  y="40" width="48" height="30" rx="8"   stroke={col} strokeWidth="1.4" fill={col} fillOpacity="0.05" opacity="0.9"/>
      {/* Circuit detail lines */}
      <line x1="10" y1="50" x2="40" y2="50" stroke={col} strokeWidth="0.5" opacity="0.28"/>
      <line x1="14" y1="57" x2="36" y2="57" stroke={col} strokeWidth="0.5" opacity="0.22"/>
      <circle cx="26" cy="57" r="2" fill={col} opacity="0.2"/>
    </svg>
  );
}

function truncate(text: string, max = 320) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export function DaisyFloat() {
  useAnimationStyles();

  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript]   = useState("");
  const [response, setResponse]       = useState("");
  const [bubble, setBubble]           = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef        = useRef<any>(null);
  const bubbleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef      = useRef<VoiceState>("idle");

  useEffect(() => { stateRef.current = state; }, [state]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = 0.92;
    utter.pitch  = 1.08;
    utter.volume = 0.9;
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const pick =
        voices.find(v => /samantha|karen|victoria/i.test(v.name)) ||
        voices.find(v => /google.*us.*female|zira/i.test(v.name)) ||
        voices.find(v => v.lang === "en-US" && !v.name.includes("Male"));
      if (pick) utter.voice = pick;
    };
    loadVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoice, { once: true });
    }
    utter.onend = () => {
      setState("idle");
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setBubble(false), 4000);
    };
    setState("speaking");
    window.speechSynthesis.speak(utter);
  }, []);

  const handleClick = useCallback(() => {
    const cur = stateRef.current;
    if (cur === "speaking") {
      window.speechSynthesis?.cancel();
      setState("idle");
      return;
    }
    if (cur === "listening") {
      recRef.current?.stop();
      setState("idle");
      return;
    }
    if (cur === "processing") return;

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setResponse("Voice recognition is not supported in this browser. Try Chrome or Edge.");
      setBubble(true);
      return;
    }

    const rec = new SR();
    rec.continuous      = false;
    rec.interimResults  = false;
    rec.lang            = "en-US";
    recRef.current      = rec;

    rec.onstart = () => setState("listening");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript.trim();
      setTranscript(text);
      setState("processing");
      setBubble(true);

      try {
        const res = await fetch("/api/brain/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const data = (await res.json()) as { response: string };
        setResponse(data.response);
        speak(data.response);
      } catch {
        const err = "Sovereign Core: encrypted tunnel severed. Retry directive.";
        setResponse(err);
        speak(err);
      }
    };

    rec.onerror = () => setState("idle");
    rec.onend   = () => {
      if (stateRef.current === "listening") setState("idle");
    };

    rec.start();
  }, [speak]);

  const headGlow =
    state === "listening" ? "daisy-glow-listen 1.2s ease-in-out infinite" :
    state === "speaking"  ? "daisy-glow-speak 1.4s ease-in-out infinite"  :
    "daisy-glow-idle 2.4s ease-in-out infinite";

  const borderColor =
    state === "listening" ? "#34D399" :
    state === "speaking"  ? "#A78BFA" :
    "#D4AF37";

  const lHandAnim =
    state === "speaking"  ? "daisy-hand-l-speak 1.7s ease-in-out infinite" :
    state === "listening" ? "daisy-hand-listen-l 1.2s ease-in-out infinite" :
    "daisy-hand-l-idle 5.4s ease-in-out infinite";

  const rHandAnim =
    state === "speaking"  ? "daisy-hand-r-speak 2.0s ease-in-out infinite" :
    state === "listening" ? "daisy-hand-listen-r 1.4s ease-in-out infinite" :
    "daisy-hand-r-idle 4.9s ease-in-out infinite";

  const label =
    state === "listening"  ? "LISTENING…" :
    state === "processing" ? "PROCESSING" :
    state === "speaking"   ? "SPEAKING — click to stop" :
    "SPEAK WITH dAIsy";

  return (
    <>
      {/* ── Speech bubble ─────────────────────────────── */}
      {bubble && (
        <div style={{
          position: "fixed",
          bottom: 290,
          right: 16,
          width: 296,
          background: "rgba(5, 8, 15, 0.96)",
          border: `1px solid ${borderColor}44`,
          padding: "14px 16px 12px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: "#C8C9D0",
          lineHeight: 1.65,
          zIndex: 9998,
          animation: "daisy-bubble-in 0.28s ease-out",
          maxHeight: 220,
          overflowY: "auto",
          boxShadow: `0 0 24px ${borderColor}22`,
        }}>
          {/* Close */}
          <div
            onClick={() => { setBubble(false); window.speechSynthesis?.cancel(); setState("idle"); }}
            style={{ position: "absolute", top: 6, right: 9, color: "#3D4560", cursor: "pointer", fontSize: 13, lineHeight: 1 }}
          >✕</div>

          {/* Operator line */}
          {transcript && (
            <div style={{ color: "#3D4560", marginBottom: 8, fontSize: 9, letterSpacing: "0.12em" }}>
              OPERATOR: {transcript}
            </div>
          )}

          {/* Response */}
          {state === "processing" ? (
            <span style={{ color: "#D4AF37", letterSpacing: "0.12em", fontSize: 10 }}>
              Processing directive…
            </span>
          ) : (
            <div style={{ color: "#B0B4C4", whiteSpace: "pre-wrap" }}>
              {truncate(response)}
            </div>
          )}
        </div>
      )}

      {/* ── Left hand ─────────────────────────────────── */}
      <div style={{
        position: "fixed",
        bottom: 138,
        right: 208,
        zIndex: 9997,
        animation: lHandAnim,
        pointerEvents: "none",
        opacity: 0.88,
      }}>
        <HandSVG flipped={false} state={state} />
      </div>

      {/* ── Right hand ────────────────────────────────── */}
      <div style={{
        position: "fixed",
        bottom: 148,
        right: 16,
        zIndex: 9997,
        animation: rHandAnim,
        pointerEvents: "none",
        opacity: 0.88,
      }}>
        <HandSVG flipped={true} state={state} />
      </div>

      {/* ── dAIsy head ────────────────────────────────── */}
      <div
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: 22,
          right: 88,
          zIndex: 9999,
          cursor: "pointer",
          animation: "daisy-head-float 4.2s ease-in-out infinite",
          userSelect: "none",
        }}
      >
        {/* Avatar circle */}
        <div style={{
          width: 82,
          height: 82,
          borderRadius: "50%",
          overflow: "hidden",
          border: `2px solid ${borderColor}`,
          animation: headGlow,
          transition: "border-color 0.5s ease",
          position: "relative",
        }}>
          <img
            src="/daisy-avatar.png"
            alt="dAIsy haMINJA"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* State overlay */}
          {state !== "idle" && (
            <div style={{
              position: "absolute", inset: 0,
              background:
                state === "speaking"  ? "rgba(167,139,250,0.18)" :
                state === "listening" ? "rgba(52,211,153,0.18)"  :
                "rgba(212,175,55,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {state === "listening" && (
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#34D399",
                  animation: "daisy-mic-pulse 0.75s ease-in-out infinite",
                }}/>
              )}
              {state === "processing" && (
                <div style={{
                  width: 14, height: 14,
                  border: "2.5px solid #D4AF37",
                  borderRadius: "50%",
                  borderTopColor: "transparent",
                  animation: "daisy-spin 0.7s linear infinite",
                }}/>
              )}
              {state === "speaking" && (
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2,
                      background: "#A78BFA",
                      height: `${8 + i * 4}px`,
                      animation: `daisy-mic-pulse ${0.5 + i * 0.15}s ease-in-out infinite`,
                    }}/>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Label */}
        <div style={{
          textAlign: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 7,
          letterSpacing: "0.12em",
          color: borderColor + "99",
          marginTop: 5,
          transition: "color 0.5s ease",
          whiteSpace: "nowrap",
        }}>
          {label}
        </div>
      </div>
    </>
  );
}
