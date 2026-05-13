/**
 * SourcesPanel.jsx — Affiche les sources RAG de façon compacte et dépliable
 */
import { useState } from "react";

const CAT_COLORS = {
  hotel:            "#f59e0b",
  restaurant:       "#ec4899",
  activite:         "#10b981",
  plage:            "#06b6d4",
  musee:            "#8b5cf6",
  lieu_touristique: "#f97316",
  transport:        "#3b82f6",
  service_urgence:  "#ef4444",
  faq:              "#6b7280",
  general:          "#6b7280",
};

export default function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border:     "1px solid #334155",
          borderRadius: "6px",
          color:      "#94a3b8",
          fontSize:   "11px",
          padding:    "3px 10px",
          cursor:     "pointer",
          display:    "flex",
          alignItems: "center",
          gap:        "4px",
        }}
      >
        {open ? "▲" : "▼"} {sources.length} source{sources.length > 1 ? "s" : ""} RAG
      </button>

      {open && (
        <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {sources.map((s, i) => {
            const col = CAT_COLORS[s.category] ?? "#6b7280";
            return (
              <div key={i} style={{
                background:   "#1e293b",
                border:       `1px solid ${col}40`,
                borderLeft:   `3px solid ${col}`,
                borderRadius: "6px",
                padding:      "6px 10px",
                fontSize:     "11px",
                color:        "#cbd5e1",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span style={{ color: col, fontWeight: 600, textTransform: "uppercase" }}>
                    {s.category}
                  </span>
                  <span style={{ color: "#475569" }}>score: {s.score}</span>
                </div>
                <div style={{ lineHeight: 1.4 }}>{s.text.slice(0, 120)}…</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}