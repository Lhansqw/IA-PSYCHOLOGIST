"use client";

interface ControlBarProps {
  isMuted: boolean;
  isCamOff: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  showTranscript: boolean;
  onToggleMute: () => void;
  onToggleCam: () => void;
  onToggleRecord: () => void;
  onToggleTranscript: () => void;
  onEndSession: () => void;
}

function CtrlBtn({
  onClick,
  active,
  danger,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      style={{
        width: "48px", height: "48px", borderRadius: "50%",
        border: `1px solid ${danger ? "rgba(239,68,68,0.4)" : active ? "rgba(127,255,212,0.4)" : "rgba(255,255,255,0.15)"}`,
        background: danger
          ? "rgba(239,68,68,0.2)"
          : active
          ? "rgba(127,255,212,0.15)"
          : "rgba(255,255,255,0.05)",
        color: danger ? "#ef4444" : active ? "#7FFFD4" : "rgba(255,255,255,0.6)",
        fontSize: "18px", cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s ease",
        backdropFilter: "blur(10px)",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(1.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

export default function ControlBar({
  isMuted, isCamOff, isRecording, isProcessing, showTranscript,
  onToggleMute, onToggleCam, onToggleRecord, onToggleTranscript, onEndSession,
}: ControlBarProps) {
  return (
    <div style={{
      height: "80px", display: "flex", alignItems: "center",
      justifyContent: "center", gap: "16px",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(6,11,18,0.98)",
      backdropFilter: "blur(20px)",
      flexShrink: 0,
    }}>
      {/* Mute */}
      <CtrlBtn onClick={onToggleMute} active={!isMuted} label={isMuted ? "Activar micrófono" : "Silenciar"}>
        {isMuted ? "🔇" : "🎤"}
      </CtrlBtn>

      {/* Camera */}
      <CtrlBtn onClick={onToggleCam} active={!isCamOff} label={isCamOff ? "Activar cámara" : "Apagar cámara"}>
        {isCamOff ? "📵" : "📷"}
      </CtrlBtn>

      {/* Record - main button */}
      <button
        onClick={onToggleRecord}
        disabled={isProcessing}
        title={isRecording ? "Detener grabación" : "Hablar con Aria"}
        style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: isRecording
            ? "rgba(239,68,68,0.25)"
            : "linear-gradient(135deg, rgba(127,255,212,0.2), rgba(127,255,212,0.1))",
          border: `2px solid ${isRecording ? "#ef4444" : "#7FFFD4"}`,
          color: isRecording ? "#ef4444" : "#7FFFD4",
          fontSize: "24px", cursor: isProcessing ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isRecording ? "0 0 20px rgba(239,68,68,0.3)" : "0 0 20px rgba(127,255,212,0.15)",
          transition: "all 0.2s ease",
          animation: isRecording ? "recordPulse 1.5s ease-in-out infinite" : "none",
          opacity: isProcessing ? 0.5 : 1,
        }}
      >
        {isProcessing ? "⏳" : isRecording ? "⏹" : "🎙"}
      </button>

      {/* Transcript */}
      <CtrlBtn onClick={onToggleTranscript} active={showTranscript} label="Transcripción">
        💬
      </CtrlBtn>

      {/* End call */}
      <CtrlBtn onClick={onEndSession} danger label="Terminar sesión">
        📵
      </CtrlBtn>

      <style>{`
        @keyframes recordPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 35px rgba(239,68,68,0.5); }
        }
      `}</style>
    </div>
  );
}