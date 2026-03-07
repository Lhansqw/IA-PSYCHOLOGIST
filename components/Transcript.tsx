"use client";

import { useEffect, useRef } from "react";
import { Message } from "./AIVideocall";

interface TranscriptProps {
  messages: Message[];
}

export default function Transcript({ messages }: TranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{
      height: "100%", overflowY: "auto",
      padding: "16px",
      display: "flex", flexDirection: "column", gap: "12px",
      scrollbarWidth: "none",
    }}>
      {messages.length === 0 && (
        <div style={{
          textAlign: "center", color: "rgba(255,255,255,0.2)",
          fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
          marginTop: "40px", lineHeight: "1.6",
        }}>
          La transcripción aparecerá<br />aquí durante la sesión
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} style={{
          display: "flex", flexDirection: "column", gap: "2px",
          alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
        }}>
          <div style={{
            fontSize: "10px", color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            paddingLeft: msg.sender === "user" ? "0" : "4px",
            paddingRight: msg.sender === "user" ? "4px" : "0",
          }}>
            {msg.sender === "user" ? "Tú" : "Dr. Aria"}
          </div>
          <div style={{
            maxWidth: "85%",
            background: msg.sender === "user"
              ? "rgba(127,255,212,0.12)"
              : "rgba(167,139,250,0.12)",
            border: `1px solid ${msg.sender === "user" ? "rgba(127,255,212,0.2)" : "rgba(167,139,250,0.2)"}`,
            borderRadius: msg.sender === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            padding: "8px 12px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.85)",
            lineHeight: "1.5",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {msg.text}
          </div>
        </div>
      ))}

      <div ref={endRef} />
    </div>
  );
}