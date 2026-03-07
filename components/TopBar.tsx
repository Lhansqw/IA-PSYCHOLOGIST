"use client";

interface TopBarProps {
  sessionTime: string;
  showTranscript: boolean;
  onToggleTranscript: () => void;
}

export default function TopBar({ sessionTime, showTranscript, onToggleTranscript }: TopBarProps) {
  return (
    <div style={{
      height: "56px", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 24px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(6,11,18,0.95)",
      backdropFilter: "blur(20px)",
      flexShrink: 0,
    }}>
      {/* Left: session status */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#7FFFD4", boxShadow: "0 0 8px #7FFFD4",
          animation: "blink 2s ease-in-out infinite",
        }} />
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
          Sesión activa
        </span>
        <span style={{ color: "rgba(127,255,212,0.6)", fontSize: "13px", fontVariantNumeric: "tabular-nums", fontFamily: "'DM Sans', sans-serif" }}>
          {sessionTime}
        </span>
      </div>

      {/* Center: name */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        color: "rgba(255,255,255,0.6)", fontSize: "15px", fontStyle: "italic",
      }}>
        Aria
      </div>

      {/* Right: transcript toggle */}
      <button
        onClick={onToggleTranscript}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          color: showTranscript ? "rgba(127,255,212,0.7)" : "rgba(255,255,255,0.4)",
          padding: "5px 12px", borderRadius: "6px",
          cursor: "pointer", fontSize: "12px",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.2s",
        }}
      >
        {showTranscript ? "Ocultar chat" : "Ver transcripción"}
      </button>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}