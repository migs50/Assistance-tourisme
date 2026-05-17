/**
 * FloatingChat.jsx
 * Bouton flottant IA visible sur toutes les pages.
 * Usage : <FloatingChat accentColor="#6366f1" />
 */
import { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import ChatMessage from "./ChatMessage";
import ChatInput   from "./ChatInput";

export default function FloatingChat({ accentColor = "#6366f1" }) {
  const [open, setOpen]   = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef         = useRef();
  const { messages, loading, error, send, clear } = useChat();

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <>
      {open && (
        <div style={{
          position:      "fixed",
          bottom:        "90px",
          right:         "24px",
          width:         "380px",
          height:        "520px",
          background:    "#0f172a",
          border:        `1px solid ${accentColor}40`,
          borderRadius:  "20px",
          boxShadow:     `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}20`,
          display:       "flex",
          flexDirection: "column",
          zIndex:        1000,
          overflow:      "hidden",
          fontFamily:    "'Segoe UI', sans-serif",
          animation:     "slideUp 0.25s ease",
        }}>

          {/* Header */}
          <div style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "space-between",
            padding:         "14px 16px",
            background:      `linear-gradient(135deg, ${accentColor}22, #0f172a)`,
            borderBottom:    `1px solid ${accentColor}30`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
              }}>🤖</div>
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "13px" }}>
                  Assistant Tanger
                </div>
                <div style={{ color: accentColor, fontSize: "11px" }}>
                  ● En ligne · RAG + Llama 3
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={clear}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "16px" }}>
                ↺
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px",
            scrollbarWidth: "thin", scrollbarColor: "#334155 transparent",
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: "30px" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🕌</div>
                <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
                  Bonjour ! Posez-moi vos questions sur Tanger.
                </p>
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    "Meilleur hotel a Tanger ?",
                    "Comment aller a l'aeroport ?",
                    "Numero d'urgence medical ?",
                  ].map((s, i) => (
                    <button key={i} onClick={() => send(s)} style={{
                      background: "#1e293b", border: `1px solid ${accentColor}40`,
                      borderRadius: "20px", color: "#94a3b8",
                      fontSize: "12px", padding: "6px 14px", cursor: "pointer", textAlign: "left",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px",
                }}>🤖</div>
                <div style={{
                  background: "#1e293b", borderRadius: "4px 14px 14px 14px",
                  padding: "10px 14px", display: "flex", gap: "4px",
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: "5px", height: "5px", borderRadius: "50%",
                      background: accentColor,
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}/>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: "#450a0a", border: "1px solid #7f1d1d",
                borderRadius: "8px", padding: "10px 12px",
                color: "#fca5a5", fontSize: "12px",
              }}>
                ⚠️ {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={send} loading={loading} />
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => { setOpen(!open); setPulse(false); }}
        style={{
          position:     "fixed",
          bottom:       "24px",
          right:        "24px",
          width:        "56px",
          height:       "56px",
          borderRadius: "50%",
          background:   `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
          border:       "none",
          cursor:       "pointer",
          fontSize:     "24px",
          boxShadow:    `0 4px 20px ${accentColor}60`,
          zIndex:       1001,
          transition:   "transform 0.2s",
          animation:    pulse ? "pulseBtn 2s infinite" : "none",
        }}
        onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.target.style.transform = "scale(1)"}
      >
        {open ? "✕" : "🤖"}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        @keyframes pulseBtn {
          0%,100% { box-shadow: 0 4px 20px ${accentColor}60; }
          50%     { box-shadow: 0 4px 30px ${accentColor}99, 0 0 0 8px ${accentColor}20; }
        }
      `}</style>
    </>
  );
}
