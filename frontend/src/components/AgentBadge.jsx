/**
 * AgentBadge.jsx
 * Badge affiché sous l'avatar assistant quand msg.agent est défini
 */
import AgentLogo from "../assets/logo ai.jpeg";   // ✅ AJOUT

export default function AgentBadge({ agent }) {
  if (!agent) return null;
  return (
    <div style={{
      display:     "flex",
      alignItems:  "center",
      gap:         "6px",
      marginBottom: "5px",
    }}>
      <img
        src={AgentLogo}
        alt={agent?.name}
        style={{
          width:        "14px",
          height:       "14px",
          borderRadius: "4px",
          objectFit:    "cover",
        }}
      />
      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
        {agent?.name}
      </span>
    </div>
  );
}
