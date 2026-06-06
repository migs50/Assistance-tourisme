/**
 * AgentBadge.jsx — Badge coloré indiquant quel agent a répondu
 */
import { Trees, Bus, AlertTriangle, MessageCircle } from "lucide-react";

const AGENTS = {
  leisure:   { label: "Loisirs",    Icon: Trees, color: "#22c55e" },
  logistics: { label: "Transport",  Icon: Bus, color: "#3b82f6" },
  emergency: { label: "Urgences",   Icon: AlertTriangle, color: "#ef4444" },
  general:   { label: "Général",    Icon: MessageCircle, color: "#a855f7" },
};

export default function AgentBadge({ agent }) {
  const cfg = AGENTS[agent] ?? AGENTS.general;
  const Icon = cfg.Icon;
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
      <Icon size={12} strokeWidth={2} /> {cfg.label}
    </span>
  );
}