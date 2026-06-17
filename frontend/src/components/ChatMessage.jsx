/**
 * ChatMessage.jsx — REDESIGN PREMIUM TEAL
 * Bulles user/assistant avec style cohérent MoroccoGuide AI
 */
import AgentBadge from "./AgentBadge";
import AgentLogo  from "../assets/logo ai.jpeg";   // ✅ AJOUT

const T = {
  primary:   "#0f766e",
  secondary: "#14b8a6",
  light:     "#ccfbf1",
  bg:        "#f7fbfb",
  text:      "#0f172a",
  textMuted: "#64748b",
  border:    "#e2e8f0",
  tealDark:  "#0B5D5F",
};

export default function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display:        "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom:   "20px",
      gap:            "12px",
      alignItems:     "flex-start",
      animation:      "cp-fadeUp 0.35s ease both",
    }}>

      {/* ── Avatar assistant ── */}
      {/* ✅ MODIFICATION : logo image remplace le div avec SVG chat */}
      {!isUser && (
        <img
          src={AgentLogo}
          alt="Agent"
          style={{
            width:        "38px",
            height:       "38px",
            borderRadius: "12px",
            objectFit:    "cover",
            flexShrink:   0,
            boxShadow:    "0 4px 12px rgba(15,118,110,0.25)",
          }}
        />
      )}

      <div style={{ maxWidth: "72%", minWidth: "60px" }}>
        {/* Badge agent */}
        {!isUser && msg.agent && <AgentBadge agent={msg.agent} />}
        {/* ── Bulle ── */}
        <div style={{
          background:   isUser
            ? `linear-gradient(135deg, ${T.primary}, ${T.tealDark})`
            : "#ffffff",
          color:        isUser ? "#ffffff" : T.text,
          borderRadius: isUser
            ? "18px 4px 18px 18px"
            : "4px 18px 18px 18px",
          padding:      "13px 18px",
          fontSize:     "14px",
          lineHeight:   1.7,
          boxShadow:    isUser
            ? "0 4px 18px rgba(15,118,110,0.30)"
            : `0 2px 10px rgba(15,118,110,0.07), 0 0 0 1px ${T.border}`,
          whiteSpace:   "pre-wrap",
          wordBreak:    "break-word",
          fontFamily:   "'DM Sans', sans-serif",
        }}>
          {msg.content}
        </div>
      </div>

      {/* ── Avatar user ── */}
      {isUser && (
        <div style={{
          width:          "38px",
          height:         "38px",
          borderRadius:   "12px",
          background:     T.light,
          border:         `1.5px solid ${T.secondary}40`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={T.primary} strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}
    </div>
  );
}
