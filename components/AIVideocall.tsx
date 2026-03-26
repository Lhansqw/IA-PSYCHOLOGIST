"use client";

import { useState, useEffect, useRef } from "react";
import AIAvatar from "./AIAvatar";
import UserVideo from "./UserVideo";
import Transcript from "./Transcript";
import ControlBar from "./ControlBar";
import TopBar from "./TopBar";

export type AIState = "idle" | "thinking" | "speaking";
export type Message = { sender: "user" | "ai"; text: string };

export default function AIVideocall() {
  const [sessionState, setSessionState] = useState<"idle" | "active" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiState, setAiState] = useState<AIState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // ── Session timer ──
  useEffect(() => {
    if (sessionState === "active") {
      timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionState === "idle") setSessionTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionState]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Start session ──
  const startSession = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setSessionState("active");

      setTimeout(() => {
        setAiState("speaking");
        setMessages([{
          sender: "ai",
          text: "Hola, soy Aria. Estoy aquí para escucharte con total atención. ¿Cómo te has sentido últimamente?",
        }]);
        setTimeout(() => setAiState("idle"), 4000);
      }, 800);
    } catch {
      alert("Necesitamos acceso a tu cámara y micrófono para iniciar la sesión.");
    }
  };

  // ── End session ──
  const endSession = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setSessionState("ended");
    setAiState("idle");
  };

  // ── Toggle recording ──
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        audioChunksRef.current = [];

        // Pedir un stream de SOLO AUDIO separado al navegador
        // Esto evita el error NotSupportedError con el stream de video+audio
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
          video: false,
        });

        // Detectar el formato soportado por el navegador
        const mimeType = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
        ].find((type) => MediaRecorder.isTypeSupported(type));

        const recorder = mimeType
          ? new MediaRecorder(audioStream, { mimeType })
          : new MediaRecorder(audioStream);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          // Detener el stream de audio temporal
          audioStream.getTracks().forEach((t) => t.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType ?? "audio/webm" });
          await sendAudioToBackend(audioBlob);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error("Error al acceder al micrófono:", err);
        alert("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
      }
    }
  };

  // ── Send audio to backend ──
  const sendAudioToBackend = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setAiState("thinking");

    try {
      // 1. Crear sesión si no existe
      if (!sessionIdRef.current) {
        const sessionRes = await fetch("http://localhost:8080/api/session/start", {
          method: "POST",
        });
        const sessionData = await sessionRes.json();
        sessionIdRef.current = sessionData.sessionId;
      }

      // 2. Enviar audio al backend
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("sessionId", sessionIdRef.current!);

      const res = await fetch("http://localhost:8080/api/chat/audio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

      const data = await res.json();
      const { transcription, aiResponse, audioBase64, hasAudio } = data;

      // 3. Mostrar transcripción del usuario
      setMessages((prev) => [...prev, { sender: "user", text: transcription }]);

      // 4. Reproducir audio de la IA
      if (hasAudio && audioBase64) {
        const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
        const aiAudioBlob = new Blob([audioBytes], { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(aiAudioBlob);
        const audio = new Audio(audioUrl);
        setAiState("speaking");
        audio.play();
        audio.onended = () => {
          setAiState("idle");
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        setAiState("speaking");
        setTimeout(() => setAiState("idle"), 4000);
      }

      // 5. Mostrar respuesta en el chat
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);

    } catch (err) {
      console.error("Error al procesar audio:", err);
      setAiState("idle");
      setMessages((prev) => [...prev, {
        sender: "ai",
        text: "Hubo un problema de conexión. ¿Puedes repetir lo que dijiste?",
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMute = () => {
    stream?.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
    setIsMuted(!isMuted);
  };

  const toggleCam = () => {
    stream?.getVideoTracks().forEach((t) => { t.enabled = isCamOff; });
    setIsCamOff(!isCamOff);
  };

  // ── IDLE SCREEN ──
  if (sessionState === "idle") return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #0d2137 0%, #060b12 60%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", overflow: "hidden", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(127,255,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(127,255,212,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ width: "120px", height: "120px", margin: "0 auto 32px" }}>
          <AIAvatar isSpeaking={false} isThinking={false} />
        </div>
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: "rgba(127,255,212,0.5)", textTransform: "uppercase", marginBottom: "12px" }}>
          Sesión de bienestar
        </div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontFamily: "'Playfair Display', serif", color: "white", fontWeight: 400, margin: "0 0 8px", lineHeight: 1.2 }}>
          Habla con <em style={{ color: "#7FFFD4" }}>Aria</em>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", margin: "0 0 40px", lineHeight: 1.6 }}>
          Tu psicóloga IA — disponible cuando la necesites
        </p>
        <button onClick={startSession} style={{
          background: "linear-gradient(135deg, rgba(127,255,212,0.15), rgba(127,255,212,0.08))",
          border: "1px solid rgba(127,255,212,0.4)", color: "#7FFFD4",
          padding: "14px 40px", borderRadius: "50px", fontSize: "15px",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer",
        }}>
          Iniciar sesión
        </button>
        <div style={{ marginTop: "20px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          🔒 Sesión cifrada y confidencial
        </div>
      </div>
    </div>
  );

  // ── ENDED SCREEN ──
  if (sessionState === "ended") return (
    <div style={{
      width: "100vw", height: "100vh", background: "#060b12",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌿</div>
        <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: "0 0 8px" }}>
          Sesión completada
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "32px" }}>
          Duración: {formatTime(sessionTime)}
        </p>
        <button onClick={() => { setSessionState("idle"); setMessages([]); }} style={{
          background: "transparent", border: "1px solid rgba(127,255,212,0.3)",
          color: "#7FFFD4", padding: "10px 28px", borderRadius: "50px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
        }}>
          Nueva sesión
        </button>
      </div>
    </div>
  );

  // ── ACTIVE CALL SCREEN ──
  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#060b12",
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />

      <TopBar
        sessionTime={formatTime(sessionTime)}
        showTranscript={showTranscript}
        onToggleTranscript={() => setShowTranscript((s) => !s)}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", gap: "1px", background: "rgba(255,255,255,0.04)" }}>
        {/* AI Panel */}
        <div style={{
          flex: 1,
          background: "radial-gradient(ellipse at 50% 40%, #0d2137 0%, #060b12 70%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden", minWidth: 0,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(127,255,212,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(127,255,212,0.02) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
          <div style={{ width: "240px", height: "240px", position: "relative", zIndex: 1 }}>
            <AIAvatar isSpeaking={aiState === "speaking"} isThinking={aiState === "thinking"} />
          </div>
          <div style={{ marginTop: "24px", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "20px" }}>Dr. Aria</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              {aiState === "speaking" ? "🟢 Hablando..." : aiState === "thinking" ? "🟣 Procesando..." : "⚪ Escuchando"}
            </div>
          </div>

          {/* PiP user video */}
          <div style={{
            position: "absolute", bottom: "20px", right: "20px",
            width: "140px", height: "100px", borderRadius: "12px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 2,
          }}>
            <UserVideo stream={stream} isMuted={isMuted} isCamOff={isCamOff} />
          </div>
        </div>

        {/* Transcript panel */}
        {showTranscript && (
          <div style={{
            width: "280px", flexShrink: 0,
            background: "rgba(6,11,18,0.98)",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontSize: "11px", letterSpacing: "2px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
            }}>
              Transcripción
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Transcript messages={messages} />
            </div>
          </div>
        )}
      </div>

      <ControlBar
        isMuted={isMuted}
        isCamOff={isCamOff}
        isRecording={isRecording}
        isProcessing={isProcessing}
        onToggleMute={toggleMute}
        onToggleCam={toggleCam}
        onToggleRecord={toggleRecording}
        onToggleTranscript={() => setShowTranscript((s) => !s)}
        onEndSession={endSession}
        showTranscript={showTranscript}
      />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}