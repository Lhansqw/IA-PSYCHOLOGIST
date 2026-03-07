"use client";

import { useState, useEffect } from "react";

interface AIAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
}

export default function AIAvatar({ isSpeaking, isThinking }: AIAvatarProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!isSpeaking) return;
    const interval = setInterval(() => setPulse((p) => (p + 1) % 100), 80);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const ringScale = isSpeaking ? 1 + Math.sin(pulse * 0.2) * 0.06 : 1;

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Ambient glow rings */}
      {[1.35, 1.2, 1.08].map((scale, i) => (
        <div key={i} style={{
          position: "absolute",
          width: "180px", height: "180px",
          borderRadius: "50%",
          border: `1px solid rgba(127,255,212,${isSpeaking ? (0.15 - i * 0.04) : 0.05})`,
          transform: `scale(${isSpeaking ? scale * ringScale : scale * 0.98})`,
          transition: "all 0.3s ease",
          animationName: isSpeaking ? "ringPulse" : "none",
          animationDuration: `${1.5 + i * 0.4}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationDirection: "alternate",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}

      {/* Main avatar circle */}
      <div style={{
        width: "160px", height: "160px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #1a3a4a 0%, #0d1f2d 60%, #060e14 100%)",
        border: `2px solid ${isSpeaking ? "#7FFFD4" : isThinking ? "#a78bfa" : "rgba(127,255,212,0.2)"}`,
        boxShadow: isSpeaking
          ? "0 0 40px rgba(127,255,212,0.3), 0 0 80px rgba(127,255,212,0.1)"
          : isThinking
          ? "0 0 40px rgba(167,139,250,0.2)"
          : "0 0 20px rgba(0,0,0,0.5)",
        transition: "all 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "8px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Face SVG */}
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
          <ellipse cx="35" cy="32" rx="22" ry="26" fill="rgba(127,255,212,0.08)" stroke="rgba(127,255,212,0.2)" strokeWidth="1" />
          {/* Eyes */}
          <ellipse cx="26" cy="28" rx="3.5" ry={isSpeaking ? 4 : 3} fill="#7FFFD4" style={{ transition: "all 0.2s" }} />
          <ellipse cx="44" cy="28" rx="3.5" ry={isSpeaking ? 4 : 3} fill="#7FFFD4" style={{ transition: "all 0.2s" }} />
          <ellipse cx="26" cy="28" rx="6" ry="6" fill="rgba(127,255,212,0.12)" />
          <ellipse cx="44" cy="28" rx="6" ry="6" fill="rgba(127,255,212,0.12)" />
          {/* Mouth */}
          {isSpeaking ? (
            <ellipse
              cx="35" cy="42"
              rx={3 + Math.sin(pulse * 0.3) * 3}
              ry={2 + Math.sin(pulse * 0.3) * 2}
              fill="rgba(127,255,212,0.6)"
              style={{ transition: "all 0.1s" }}
            />
          ) : (
            <path d="M 28 42 Q 35 46 42 42" stroke="rgba(127,255,212,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
        </svg>

        {/* Thinking dots */}
        {isThinking && (
          <div style={{ display: "flex", gap: "4px", position: "absolute", bottom: "28px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: "#a78bfa",
                animation: "thinkDot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ringPulse {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
        @keyframes thinkDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}