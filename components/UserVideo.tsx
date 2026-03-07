"use client";

import { useEffect, useRef } from "react";

interface UserVideoProps {
  stream: MediaStream | null;
  isMuted: boolean;
  isCamOff: boolean;
}

export default function UserVideo({ stream, isMuted, isCamOff }: UserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a14 100%)",
      borderRadius: "16px", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      {stream && !isCamOff ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
        />
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
          <div style={{ fontSize: "32px", marginBottom: "4px" }}>👤</div>
          <div style={{ fontSize: "11px", fontFamily: "'DM Sans', sans-serif" }}>Cámara apagada</div>
        </div>
      )}

      {isMuted && (
        <div style={{
          position: "absolute", bottom: "8px", left: "8px",
          background: "rgba(239,68,68,0.9)", borderRadius: "6px",
          padding: "2px 6px", fontSize: "10px", color: "white",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          🔇 Silenciado
        </div>
      )}
    </div>
  );
}