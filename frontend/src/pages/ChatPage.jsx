/**
 * ChatPage.jsx
 * lang = source de vérité unique, passé à ChatInput
 */
import { useEffect, useRef, useState } from "react";
import { useChat }   from "../hooks/useChat";
import ChatMessage   from "../components/ChatMessage";
import ChatInput     from "../components/ChatInput";
import AgentLogo     from "../assets/logo ai.jpeg";   // ✅ AJOUT

const SUGGESTIONS = {
  fr: [
    "Meilleur hôtel à Tanger ?",
    "Restaurant traditionnel marocain ?",
    "Comment aller à l'aéroport ?",
    "Les plus belles plages ?",
    "Numéro d'urgence médical ?",
    "Visiter la Kasbah ?",
  ],
  en: [
    "Best hotel in Tangier?",
    "Traditional Moroccan restaurant?",
    "How to get to the airport?",
    "Most beautiful beaches?",
    "Medical emergency number?",
    "Visit the Kasbah?",
  ],
  ar: [
    "أفضل فندق في طنجة؟",
    "مطعم مغربي تقليدي؟",
    "كيف أصل إلى المطار؟",
    "أجمل الشواطئ؟",
    "رقم الطوارئ الطبية؟",
    "زيارة القصبة؟",
  ],
};

const LABELS = {
  fr: {
    title: "Conversation en cours", subtitle: "Nouvelle session · Démarrez en posant une question",
    newChat: "+ Nouveau chat", back: "← Tanger",
    welcome: "Comment puis-je vous aider ?",
    sub: "Sélectionnez une suggestion ou saisissez votre question.",
    suggest: "SUGGESTIONS", online: "En ligne · Tanger",
    lieux: "LIEUX", satisf: "SATISFACTION",
  },
  en: {
    title: "Ongoing conversation", subtitle: "New session · Start by asking a question",
    newChat: "+ New chat", back: "← Tangier",
    welcome: "How can I help you?",
    sub: "Select a suggestion or type your question below.",
    suggest: "SUGGESTIONS", online: "Online · Tangier",
    lieux: "PLACES", satisf: "SATISFACTION",
  },
  ar: {
    title: "محادثة جارية", subtitle: "جلسة جديدة · ابدأ بطرح سؤال",
    newChat: "+ محادثة جديدة", back: "طنجة ←",
    welcome: "كيف يمكنني مساعدتك؟",
    sub: "اختر اقتراحاً أو اكتب سؤالك أدناه.",
    suggest: "اقتراحات", online: "متصل · طنجة",
    lieux: "أماكن", satisf: "رضا",
  },
};

const SIDEBAR_BG  = "#00a294";
const SIDEBAR_BTN = "rgba(255,255,255,0.12)";
const SIDEBAR_HOV = "rgba(255,255,255,0.25)";
const SIDEBAR_BRD = "rgba(255,255,255,0.2)";
const TEAL        = "#00a294";
const WHITE       = "#ffffff";
const GRAY_200    = "#e2e8f0";
const GRAY_400    = "#94a3b8";
const GRAY_700    = "#334155";
const GRAY_900    = "#0f172a";
const GRAY_50     = "#f8fafc";

export default function ChatPage({ onBack }) {
  const { messages, loading, error, send, clear } = useChat();

  // ✅ Source de vérité unique pour la langue
  const [lang, setLang] = useState("fr");

  const bottomRef = useRef();
  const L     = LABELS[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={{
      display:    "flex",
      height:     "100vh",
      fontFamily: isRtl ? "'Segoe UI','Arabic Typesetting',sans-serif" : "'Segoe UI',sans-serif",
      direction:  isRtl ? "rtl" : "ltr",
      overflow:   "hidden",
    }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{
        width:         "270px",
        flexShrink:    0,
        background:    SIDEBAR_BG,
        display:       "flex",
        flexDirection: "column",
        padding:       "28px 16px 24px",
        overflowY:     "auto",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "4px" }}>

          {/* ✅ MODIFICATION : logo image remplace le div "212" */}
          <img
            src={AgentLogo}
            alt="Logo Agent"
            style={{
              width:        "68px",
              height:       "68px",
              borderRadius: "16px",
              objectFit:    "cover",
              margin:       "0 auto 13px",
              display:      "block",
              border:       "1px solid rgba(255,255,255,0.4)",
              boxShadow:    "0 4px 16px rgba(0,0,0,0.15)",
            }}
          />

          <div style={{ fontWeight: 700, fontSize: "16px", color: WHITE }}>EXPLORE212</div>
          <div style={{ fontSize: "12px", color: "#e0f2fe", fontStyle: "italic", margin: "3px 0 11px", opacity: 0.8 }}>
            Assistant IA
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "20px", padding: "4px 13px", fontSize: "12px",
            color: WHITE, fontWeight: 500,
          }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }}/>
            {L.online}
          </div>
        </div>

        <div style={{ borderTop: "1px solid " + SIDEBAR_BRD, margin: "20px 0 13px" }}/>

        <div style={{
          fontSize: "10px", letterSpacing: "1.4px", color: "#e0f2fe",
          fontWeight: 600, marginBottom: "9px", textTransform: "uppercase", opacity: 0.8,
        }}>{L.suggest}</div>

        {/* Suggestions — ✅ passent lang à send() */}
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {SUGGESTIONS[lang].map((s, i) => (
            <button key={i} onClick={() => send(s, lang)} style={{
              background: SIDEBAR_BTN, border: "1px solid " + SIDEBAR_BRD,
              borderRadius: "9px", color: WHITE, padding: "10px 13px",
              cursor: "pointer", fontSize: "13px",
              textAlign: isRtl ? "right" : "left",
              lineHeight: "1.4", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = SIDEBAR_HOV; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = SIDEBAR_BTN; e.currentTarget.style.borderColor = SIDEBAR_BRD; }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "space-around",
          borderTop: "1px solid " + SIDEBAR_BRD, paddingTop: "16px", marginTop: "16px",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: WHITE }}>500+</div>
            <div style={{ fontSize: "10px", color: "#e0f2fe", letterSpacing: "0.8px", opacity: 0.8 }}>{L.lieux}</div>
          </div>
          <div style={{ width: "1px", background: SIDEBAR_BRD }}/>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: WHITE }}>98%</div>
            <div style={{ fontSize: "10px", color: "#e0f2fe", letterSpacing: "0.8px", opacity: 0.8 }}>{L.satisf}</div>
          </div>
        </div>
      </aside>

      {/* ══ ZONE CHAT ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: WHITE }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", height: "58px",
          background: WHITE, borderBottom: "1px solid " + GRAY_200, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: GRAY_900 }}>{L.title}</div>
            <div style={{ fontSize: "12px", color: GRAY_400 }}>{L.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={onBack} style={{
              background: WHITE, border: "1px solid " + GRAY_200, borderRadius: "8px",
              color: GRAY_700, padding: "6px 16px", cursor: "pointer", fontSize: "13px",
            }}>{L.back}</button>
            <button onClick={clear} style={{
              background: TEAL, border: "none", borderRadius: "8px",
              color: WHITE, padding: "7px 18px", cursor: "pointer",
              fontSize: "13px", fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,162,148,0.3)",
            }}>{L.newChat}</button>
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 10%" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: "70px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: "#ccfbf1", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "30px", margin: "0 auto 22px",
              }}>💬</div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: GRAY_900, margin: "0 0 10px" }}>
                {L.welcome}
              </h2>
              <p style={{ color: GRAY_400, fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                {L.sub}
              </p>
            </div>
          )}

          {messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />)}

          {loading && (
            <div style={{
              display: "flex", gap: "12px", alignItems: "flex-start",
              marginBottom: "20px", flexDirection: isRtl ? "row-reverse" : "row",
            }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px", overflow: "hidden",
                flexShrink: 0,
              }}>
                {/* ✅ MODIFICATION : logo dans le loading avatar aussi */}
                <img src={AgentLogo} alt="Agent" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{
                background: GRAY_50,
                borderRadius: isRtl ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                padding: "12px 16px", display: "flex", gap: "5px", alignItems: "center",
                border: "1px solid " + GRAY_200,
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: "7px", height: "7px", borderRadius: "50%", background: TEAL,
                    animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s`,
                  }}/>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "10px", padding: "12px 16px",
              color: "#dc2626", fontSize: "13px", marginBottom: "16px",
            }}>⚠️ {error}</div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input — ✅ plus de sélecteur langue ici, géré dans ChatInput */}
        <div style={{
          background: WHITE, borderTop: "1px solid " + GRAY_200,
          flexShrink: 0, padding: "10px 10% 6px",
        }}>
          <ChatInput
            onSend={send}
            loading={loading}
            lang={lang}
            onLangChange={setLang}
          />
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
