/**
 * ChatPage.jsx — Page principale de conversation
 */
import { useEffect, useRef } from "react";
import { useChat }      from "../hooks/useChat";
import ChatMessage      from "../components/ChatMessage";
import ChatInput        from "../components/ChatInput";

const WELCOME = [
  { icon: "🌴", text: "Hôtels & restaurants" },
  { icon: "🚌", text: "Transports & itinéraires" },
  { icon: "🏛️", text: "Sites touristiques" },
  { icon: "🚨", text: "Urgences & sécurité" },
];

export default function ChatPage() {
  const { messages, loading, error, send, clear } = useChat();
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", background: "#0f172a", color: "#f1f5f9",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        background: "linear-gradient(90deg,#0f172a,#1e1b4b)",
        borderBottom: "1px solid #1e293b",
        boxShadow: "0 2px 12px rgba(99,102,241,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px",
          }}>🕌</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>
              Tanger Tourist Assistant
            </div>
            <div style={{ fontSize: "11px", color: "#6366f1" }}>
              Système multi-agents · RAG + Llama 3
            </div>
          </div>
        </div>
        <button onClick={clear} title="Nouvelle conversation"
          style={{
            background: "transparent", border: "1px solid #334155",
            borderRadius: "8px", color: "#94a3b8",
            padding: "6px 12px", fontSize: "12px", cursor: "pointer",
          }}>
          ✦ Nouveau chat
        </button>
      </header>

      {/* ── Zone messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

        {/* Écran d'accueil */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🇲🇦</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
              Bienvenue à Tanger
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px" }}>
              Posez-moi n'importe quelle question sur votre séjour
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "10px", maxWidth: "360px", margin: "0 auto",
            }}>
              {WELCOME.map((w, i) => (
                <div key={i} style={{
                  background: "#1e293b", border: "1px solid #334155",
                  borderRadius: "12px", padding: "14px",
                  fontSize: "13px", color: "#94a3b8",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{w.icon}</div>
                  {w.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}

        {/* Indicateur de chargement */}
        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>🤖</div>
            <div style={{
              background: "#1e293b", borderRadius: "4px 18px 18px 18px",
              padding: "12px 16px", display: "flex", gap: "4px", alignItems: "center",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#6366f1",
                  animation: "bounce 1.2s infinite",
                  animationDelay: `${i * 0.2}s`,
                }}/>
              ))}
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{
            background: "#450a0a", border: "1px solid #7f1d1d",
            borderRadius: "10px", padding: "12px 16px",
            color: "#fca5a5", fontSize: "13px", marginBottom: "16px",
          }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <ChatInput onSend={send} loading={loading} />

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
      `}</style>
    </div>
  );
}