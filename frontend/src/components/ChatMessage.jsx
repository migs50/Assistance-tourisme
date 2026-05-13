/**
 * ChatMessage.jsx — Bulle de message (user ou assistant)
 */
import AgentBadge   from "./AgentBadge";
import SourcesPanel from "./SourcesPanel";

export default function ChatMessage({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div style={{
      display:       "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom:  "16px",
      gap:           "10px",
      alignItems:    "flex-start",
    }}>
      {/* Avatar assistant */}
      {!isUser && (
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", flexShrink: 0,
        }}>🤖</div>
      )}

      <div style={{ maxWidth: "75%", minWidth: "60px" }}>
        {/* Badge agent */}
        {!isUser && msg.agent && <AgentBadge agent={msg.agent} />}

        {/* Bulle */}
        <div style={{
          background:   isUser
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
            : "#1e293b",
          color:        "#f1f5f9",
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          padding:      "12px 16px",
          fontSize:     "14px",
          lineHeight:   1.6,
          boxShadow:    "0 2px 8px rgba(0,0,0,0.3)",
          whiteSpace:   "pre-wrap",
          wordBreak:    "break-word",
        }}>
          {msg.content}
        </div>

        {/* Sources RAG dépliables */}
        {!isUser && <SourcesPanel sources={msg.sources} />}
      </div>

      {/* Avatar user */}
      {isUser && (
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: "#334155",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", flexShrink: 0,
        }}>👤</div>
      )}
    </div>
  );
}