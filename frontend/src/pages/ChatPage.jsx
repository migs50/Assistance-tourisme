/**
 * ChatPage.jsx — GRANDE PAGE COMPLÈTE
 * Même style que la plateforme (fond sombre, orange)
 * Props : onBack() -> retour HomeTanger
 */
import { useEffect, useRef } from "react";
import { useChat }      from "../hooks/useChat";
import ChatMessage      from "../components/ChatMessage";
import ChatInput        from "../components/ChatInput";

const SUGGESTIONS = [
  { text: "Meilleur hôtel à Tanger ?" },
  { text: "Restaurant traditionnel marocain ?" },
  { text: "Comment aller à l'aéroport ?" },
  { text: "Les plus belles plages ?" },
  { text: "Numéro d'urgence médical ?" },
  { text: "Visiter la Kasbah ?" },
];

export default function ChatPage({ onBack }) {
  const { messages, loading, error, send, clear } = useChat();
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "100vh",
      background:    "#0d1b2a",
      color:         "#f1f5f9",
      fontFamily:    "'Segoe UI', sans-serif",
    }}>

      {/* ── Header ── */}
      <header style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 32px",
        height:         "64px",
        background:     "#0d1b2a",
        borderBottom:   "1px solid #1e3a5f",
        flexShrink:     0,
      }}>
        {/* Gauche : retour + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={onBack} style={{
            background:   "transparent",
            border:       "1px solid #1e3a5f",
            borderRadius: "8px",
            color:        "#94a3b8",
            padding:      "6px 14px",
            cursor:       "pointer",
            fontSize:     "13px",
          }}>← Tanger</button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#f1f5f9" }}>
                Assistant Tanger
              </div>
              <div style={{ fontSize: "11px", color: "#f97316" }}>
                ● En ligne · RAG + Llama 3
              </div>
            </div>
          </div>
        </div>

        {/* Droite : logo plateforme + nouvelle conv */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontWeight: 800, fontSize: "16px", color: "#f1f5f9" }}>
            Maroc <span style={{ color: "#f97316" }}>Tourisme</span>
          </span>
          <button onClick={clear} style={{
            background:   "transparent",
            border:       "1px solid #1e3a5f",
            borderRadius: "8px",
            color:        "#94a3b8",
            padding:      "6px 14px",
            cursor:       "pointer",
            fontSize:     "12px",
          }}>✦ Nouveau chat</button>
        </div>
      </header>

      {/* ── Zone messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 10%" }}>

        {/* Écran d'accueil */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "40px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "20px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "36px", margin: "0 auto 20px",
              boxShadow: "0 8px 30px rgba(249,115,22,0.3)",
            }}>🤖</div>

            <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px" }}>
              Bonjour, je suis votre guide à Tanger !
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 40px" }}>
              Posez-moi n'importe quelle question sur votre séjour
            </p>

            {/* Suggestions */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap:                 "12px",
              maxWidth:            "700px",
              margin:              "0 auto",
            }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s.text)}
                  style={{
                    background:   "#112240",
                    border:       "1px solid #1e3a5f",
                    borderRadius: "12px",
                    color:        "#94a3b8",
                    padding:      "14px 12px",
                    cursor:       "pointer",
                    fontSize:     "13px",
                    textAlign:    "left",
                    transition:   "all 0.2s",
                    display:      "flex",
                    gap:          "8px",
                    alignItems:   "flex-start",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#f97316";
                    e.currentTarget.style.color = "#f1f5f9";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#1e3a5f";
                    e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}

        {/* Chargement */}
        {loading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "20px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>🤖</div>
            <div style={{
              background: "#112240", borderRadius: "4px 16px 16px 16px",
              padding: "14px 18px", display: "flex", gap: "5px", alignItems: "center",
              border: "1px solid #1e3a5f",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "#f97316",
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
      <div style={{
        borderTop: "1px solid #1e3a5f",
        background: "#0d1b2a",
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: "80%", margin: "0 auto" }}>
          <ChatInput onSend={send} loading={loading} />
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}