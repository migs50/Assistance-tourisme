/**
 * ChatInput.jsx — REDESIGN PREMIUM TEAL
 * Barre de saisie élégante, style cohérent MoroccoGuide AI
 */
import { useState, useRef } from "react";

const T = {
  primary:   "#0f766e",
  secondary: "#14b8a6",
  light:     "#ccfbf1",
  bg:        "#f7fbfb",
  text:      "#0f172a",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  border:    "#e2e8f0",
  tealDark:  "#0B5D5F",
};

const SUGGESTIONS = [
  "Recommande-moi un hôtel vue mer",
  "Meilleur restaurant marocain ?",
  "Comment aller à l'aéroport ?",
  "Numéro d'urgence médical ?",
  "Activités à faire à Tanger ?",
];

export default function ChatInput({ onSend, loading }) {
  const [text,     setText]     = useState("");
  const [lang,     setLang]     = useState("fr");
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

  const canSend = text.trim().length > 0 && !loading;

  return (
    <div style={{ padding: "14px 0 16px", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Suggestions rapides ── */}
      {showSugg && (
        <div style={{
          display:      "flex",
          flexWrap:     "wrap",
          gap:          "7px",
          marginBottom: "12px",
          animation:    "cp-fadeUp 0.25s ease",
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i}
              onClick={() => {
                setText(s);
                setShowSugg(false);
                ref.current?.focus();
              }}
              style={{
                background:    T.light,
                border:        `1px solid ${T.secondary}50`,
                borderRadius:  "99px",
                color:         T.primary,
                fontSize:      "12px",
                fontWeight:    500,
                padding:       "5px 14px",
                cursor:        "pointer",
                fontFamily:    "'DM Sans', sans-serif",
                transition:    "all 0.18s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = T.primary;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = T.light;
                e.currentTarget.style.color = T.primary;
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Barre principale ── */}
      <div style={{
        display:       "flex",
        gap:           "10px",
        alignItems:    "flex-end",
        background:    "#ffffff",
        border:        `1.5px solid ${showSugg ? T.secondary : T.border}`,
        borderRadius:  "16px",
        padding:       "8px 10px 8px 14px",
        boxShadow:     "0 4px 20px rgba(15,118,110,0.08)",
        transition:    "border-color 0.25s, box-shadow 0.25s",
      }}
        onFocus={() => {}}
        onClick={() => ref.current?.focus()}
      >

        {/* Bouton suggestions */}
        <button
          onClick={() => setShowSugg(!showSugg)}
          title="Suggestions rapides"
          style={{
            background:    showSugg ? T.light : "transparent",
            border:        "none",
            borderRadius:  "8px",
            color:         showSugg ? T.primary : T.textLight,
            padding:       "7px 8px",
            cursor:        "pointer",
            fontSize:      "15px",
            flexShrink:    0,
            transition:    "all 0.18s",
            lineHeight:    1,
          }}
        >
          {/* Icône ampoule SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18h6M10 22h4"/>
            <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 18H9l-.7-3C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/>
          </svg>
        </button>

        {/* Zone de texte */}
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder="Posez votre question sur Tanger…"
          style={{
            flex:       1,
            background: "transparent",
            border:     "none",
            color:      T.text,
            fontSize:   "14px",
            padding:    "7px 0",
            resize:     "none",
            outline:    "none",
            lineHeight: 1.6,
            maxHeight:  "120px",
            overflowY:  "auto",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />

        {/* Sélecteur langue */}
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={{
            background:  "transparent",
            border:      `1px solid ${T.border}`,
            borderRadius:"8px",
            color:       T.textMuted,
            fontSize:    "12px",
            padding:     "7px 6px",
            cursor:      "pointer",
            outline:     "none",
            fontFamily:  "'DM Sans', sans-serif",
            flexShrink:  0,
          }}
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="ar">AR</option>
        </select>

        {/* Bouton envoi */}
        <button
          onClick={submit}
          disabled={!canSend}
          style={{
            background:    canSend
              ? `linear-gradient(135deg, ${T.primary}, ${T.tealDark})`
              : T.border,
            border:        "none",
            borderRadius:  "10px",
            color:         canSend ? "#fff" : T.textLight,
            padding:       "9px 14px",
            cursor:        canSend ? "pointer" : "not-allowed",
            flexShrink:    0,
            transition:    "all 0.2s",
            boxShadow:     canSend ? "0 4px 14px rgba(15,118,110,0.30)" : "none",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"center",
          }}
          onMouseEnter={e => { if (canSend) e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {loading ? (
            /* Spinner */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: "cp-spin 0.8s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : (
            /* Flèche envoi */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Hint raccourci clavier */}
      <p style={{
        fontSize:   "11px",
        color:      T.textLight,
        margin:     "6px 0 0 4px",
        textAlign:  "right",
      }}>
        Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
      </p>

      <style>{`
        @keyframes cp-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}