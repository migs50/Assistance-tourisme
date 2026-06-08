/**
 * AgentBadge.jsx — Badge coloré indiquant quel agent a répondu
 */
const AGENTS = {
  leisure:   { label: "Loisirs",    icon: "🌴", color: "#22c55e" },
  logistics: { label: "Transport",  icon: "🚌", color: "#3b82f6" },
  emergency: { label: "Urgences",   icon: "🚨", color: "#ef4444" },
  general:   { label: "Général",    icon: "💬", color: "#a855f7" },
};

export default function AgentBadge({ agent }) {
  const cfg = AGENTS[agent] ?? AGENTS.general;
  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          "4px",
      padding:      "2px 10px",
      borderRadius: "999px",
      fontSize:     "11px",
      fontWeight:   600,
      color:        cfg.color,
      border:       `1px solid ${cfg.color}40`,
      background:   `${cfg.color}15`,
      marginBottom: "6px",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}