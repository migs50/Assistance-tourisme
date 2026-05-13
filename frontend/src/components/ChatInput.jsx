/**
 * ChatInput.jsx — Barre de saisie avec sélecteur de langue et envoi
 */
import { useState, useRef } from "react";

const SUGGESTIONS = [
  "Recommande-moi un hôtel vue mer",
  "Meilleur restaurant marocain ?",
  "Comment aller à l'aéroport ?",
  "Numéro d'urgence médical ?",
  "Activités à faire à Tanger ?",
];

export default function ChatInput({ onSend, loading }) {
  const [text, setText]       = useState("");
  const [lang, setLang]       = useState("fr");
  const [showSugg, setShowSugg] = useState(false);
  const ref = useRef();

  const submit = () => {
    if (!text.trim() || loading) return;
    onSend(text.trim(), lang);
    setText("");
    setShowSugg(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div style={{ padding: "12px 16px", background: "#0f172a", borderTop: "1px solid #1e293b" }}>

      {/* Suggestions rapides */}
      {showSugg && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px",
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => { setText(s); setShowSugg(false); ref.current?.focus(); }}
              style={{
                background: "#1e293b", border: "1px solid #334155",
                borderRadius: "999px", color: "#94a3b8",
                fontSize: "12px", padding: "4px 12px", cursor: "pointer",
              }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>

        {/* Bouton suggestions */}
        <button onClick={() => setShowSugg(!showSugg)} title="Suggestions"
          style={{
            background: showSugg ? "#334155" : "transparent",
            border: "1px solid #334155", borderRadius: "10px",
            color: "#94a3b8", padding: "10px", cursor: "pointer", fontSize: "16px",
          }}>
          💡
        </button>

        {/* Zone de texte */}
        <textarea ref={ref} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={onKey} rows={1} placeholder="Posez votre question sur Tanger…"
          style={{
            flex: 1, background: "#1e293b", border: "1px solid #334155",
            borderRadius: "12px", color: "#f1f5f9", fontSize: "14px",
            padding: "10px 14px", resize: "none", outline: "none",
            lineHeight: 1.5, maxHeight: "120px", overflowY: "auto",
            fontFamily: "inherit",
          }}
        />

        {/* Sélecteur langue */}
        <select value={lang} onChange={e => setLang(e.target.value)}
          style={{
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "10px", color: "#94a3b8",
            fontSize: "13px", padding: "10px 8px", cursor: "pointer",
            outline: "none",
          }}>
          <option value="fr">🇫🇷 FR</option>
          <option value="en">🇬🇧 EN</option>
          <option value="ar">🇲🇦 AR</option>
        </select>

        {/* Bouton envoi */}
        <button onClick={submit} disabled={loading || !text.trim()}
          style={{
            background: loading || !text.trim()
              ? "#1e293b"
              : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none", borderRadius: "12px",
            color: loading || !text.trim() ? "#475569" : "#fff",
            fontSize: "18px", padding: "10px 16px",
            cursor: loading || !text.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}>
          {loading ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}