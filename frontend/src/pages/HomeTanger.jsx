/**
 * HomeTanger.jsx — VERSION API CONNECTÉE
 * Activités, Événements et Lieux touristiques chargés depuis le backend
 * (comme la section Recommandation)
 */
import { useState, useEffect, useRef, useMemo } from "react";
import NavbarTanger from "../components/NavbarTanger";
import Footer       from "../components/Footer";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE API — helper générique
// ─────────────────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  return res.json();
}

// ── Recommandation ────────────────────────────────────────────────────────────
const BASE_RECO = "/api/recommandation";
const recoApi = {
  getQuestions:       (cat)  => apiFetch(`${BASE_RECO}/questions/${cat}`),
  getRecommandations: (body) => apiFetch(`${BASE_RECO}/recommandations`, {
    method: "POST", body: JSON.stringify(body),
  }),
};

// ── Activités ────────────────────────────────────────────────────────────────
const BASE_ACT = "/api/activites";
const activitesApi = {
  getAll:    (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "tous"))
    ).toString();
    return apiFetch(`${BASE_ACT}${qs ? `?${qs}` : ""}`);
  },
};

// ── Événements ────────────────────────────────────────────────────────────────
const BASE_EVT = "/api/evenements";
const evenementsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "tous"))
    ).toString();
    return apiFetch(`${BASE_EVT}${qs ? `?${qs}` : ""}`);
  },
};

// ── Lieux touristiques ────────────────────────────────────────────────────────
const BASE_LIEUX = "/api/lieux";
const lieuxApi = {
  getAll: () => apiFetch(BASE_LIEUX),
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK GÉNÉRIQUE — chargement API avec état loading / error / data
// ─────────────────────────────────────────────────────────────────────────────
function useApiData(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then(d  => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES LOCALES CATÉGORIES recommandation (pas besoin d'appel GET)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "hotels",      label: "Hôtels",      emoji: "🏨", color: "#f97316",
    description: "Hébergement selon votre budget, style et envies.", questions: 5 },
  { id: "restaurants", label: "Restaurants", emoji: "🍽️", color: "#06b6d4",
    description: "Cuisine marocaine, internationale, terrasses vue mer.", questions: 4 },
  { id: "plages",      label: "Plages",      emoji: "🏖️", color: "#10b981",
    description: "Calme, animée, coucher de soleil — votre plage idéale.", questions: 3 },
  { id: "activites",   label: "Activités",   emoji: "🎭", color: "#a855f7",
    description: "Aventure, culture, histoire, famille.", questions: 3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLES PARTAGÉS
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  surface:  { background: "#112240", border: "1.5px solid #1e3a5f", borderRadius: "16px" },
  surface2: { background: "#0d2137" },
  orange:   "#f97316",
  muted:    "#64748b",
  ivory:    "#f1f5f9",
  gold:     "#f5c842",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PARTAGÉ — état vide / erreur / loading
// ─────────────────────────────────────────────────────────────────────────────
function LoadingGrid({ color = S.orange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: "18px" }}>
      <div style={{
        width: 48, height: 48,
        border: `3px solid #1e3a5f`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: S.muted, fontSize: "13px" }}>Chargement en cours…</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry, color = "#ef4444" }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: "12px", padding: "24px", textAlign: "center", margin: "40px 0",
    }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>⚠️</div>
      <p style={{ color: "#fca5a5", fontWeight: 700, margin: "0 0 4px" }}>Erreur de chargement</p>
      <p style={{ color: S.muted, fontSize: "12px", margin: "0 0 16px" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: "100px", color: "#fca5a5",
          fontSize: "13px", fontWeight: 700, padding: "8px 20px", cursor: "pointer",
        }}>
          🔄 Réessayer
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — CategorySelector (Recommandation)
// ─────────────────────────────────────────────────────────────────────────────
function CategorySelector({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: "36px" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", fontWeight: 700, color: S.ivory, margin: "0 0 8px" }}>
          Que cherchez-vous ?
        </h2>
        <p style={{ color: S.muted, fontSize: "14px", margin: 0 }}>
          Choisissez une catégorie pour démarrer votre recommandation personnalisée.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            onMouseEnter={() => setHovered(cat.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...S.surface,
              padding: "30px 24px 26px",
              cursor: "pointer", textAlign: "left",
              transition: "transform 0.22s, border-color 0.22s, box-shadow 0.22s",
              transform: hovered === cat.id ? "translateY(-6px)" : "translateY(0)",
              borderColor: hovered === cat.id ? cat.color : "#1e3a5f",
              boxShadow: hovered === cat.id
                ? `0 12px 36px rgba(0,0,0,0.4), 0 0 24px ${cat.color}22`
                : "0 4px 16px rgba(0,0,0,0.25)",
              background: "none", position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: cat.color, opacity: hovered === cat.id ? 1 : 0, transition: "opacity 0.22s",
            }} />
            <span style={{ fontSize: "2.6rem", display: "block", marginBottom: "14px", lineHeight: 1 }}>{cat.emoji}</span>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: S.ivory, margin: "0 0 8px" }}>{cat.label}</h3>
            <p style={{ fontSize: "13px", color: S.muted, lineHeight: 1.5, margin: "0 0 18px" }}>{cat.description}</p>
            <span style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: cat.color,
              background: `${cat.color}18`, borderRadius: "100px", padding: "3px 12px",
            }}>{cat.questions} questions</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — QuestionWizard (Recommandation)
// ─────────────────────────────────────────────────────────────────────────────
function QuestionWizard({ category, questions, onComplete, onBack }) {
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  const current  = questions[idx];
  const total    = questions.length;
  const progress = (idx / total) * 100;
  const isLast   = idx === total - 1;

  function advance(newAnswers) {
    if (isLast) { onComplete(newAnswers); return; }
    setIdx(i => i + 1); setSelected(null); setAnimKey(k => k + 1);
  }
  function handleNext() {
    if (selected === null && !current.is_optional) return;
    const next = { ...answers };
    if (selected !== null) next[current.field_name] = selected;
    setAnswers(next); advance(next);
  }
  function handleSkip() { advance({ ...answers }); }

  function readableLabel(field, val) {
    if (typeof val === "boolean") return val ? "Oui ✅" : "Non ❌";
    const q = questions.find(q => q.field_name === field);
    const opt = q?.options?.find(o => o.value === val);
    return opt ? `${opt.emoji || ""} ${opt.label}` : val;
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <button onClick={onBack} style={{
          background: "none", border: "1px solid #1e3a5f", borderRadius: "100px",
          color: S.muted, padding: "7px 16px", fontSize: "13px", cursor: "pointer",
          transition: "border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = S.orange; e.currentTarget.style.color = S.ivory; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = S.muted; }}
        >← Catégories</button>
        <span style={{
          fontSize: "13px", fontWeight: 700, color: category.color,
          background: `${category.color}18`, borderRadius: "100px", padding: "5px 14px",
        }}>{category.emoji} {category.label}</span>
      </div>

      <div style={{ height: "4px", background: "#1e3a5f", borderRadius: "100px", overflow: "hidden", marginBottom: "6px" }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: `linear-gradient(90deg, ${S.orange}, ${S.gold})`,
          borderRadius: "100px", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      <p style={{ textAlign: "right", fontSize: "11px", color: S.muted, marginBottom: "24px" }}>
        Question {idx + 1} / {total}
      </p>

      <div key={animKey} style={{ ...S.surface, padding: "32px 28px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "recoSlideIn 0.3s ease" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>
          Étape {idx + 1}
        </p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: S.ivory, margin: "0 0 6px", lineHeight: 1.25 }}>
          {current.question}
        </h2>
        {current.help_text && <p style={{ fontSize: "13px", color: S.muted, margin: "0 0 24px" }}>{current.help_text}</p>}
        {!current.help_text && <div style={{ marginBottom: "24px" }} />}

        {current.type === "boolean" ? (
          <div style={{ display: "flex", gap: "14px" }}>
            {[{ v: true, label: "✅ Oui" }, { v: false, label: "❌ Non" }].map(({ v, label }) => (
              <button key={String(v)} onClick={() => setSelected(v)} style={{
                flex: 1, padding: "16px", borderRadius: "12px", cursor: "pointer",
                border: `1.5px solid ${selected === v ? S.orange : "#1e3a5f"}`,
                background: selected === v ? `${S.orange}18` : "#0d2137",
                color: selected === v ? S.ivory : S.muted,
                fontSize: "15px", fontWeight: 700, transition: "all 0.2s",
                boxShadow: selected === v ? `0 0 16px ${S.orange}30` : "none",
              }}>{label}</button>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            {current.options?.map(opt => (
              <button key={opt.value} onClick={() => setSelected(opt.value)} style={{
                padding: "14px 10px", borderRadius: "12px", cursor: "pointer", textAlign: "center",
                border: `1.5px solid ${selected === opt.value ? S.orange : "#1e3a5f"}`,
                background: selected === opt.value ? `${S.orange}18` : "#0d2137",
                color: selected === opt.value ? S.ivory : S.muted,
                transition: "all 0.2s",
                boxShadow: selected === opt.value ? `0 0 14px ${S.orange}28` : "none",
              }}>
                {opt.emoji && <span style={{ fontSize: "1.6rem", display: "block", marginBottom: "6px" }}>{opt.emoji}</span>}
                <span style={{ fontSize: "12px", fontWeight: 700, display: "block" }}>{opt.label}</span>
                {opt.description && <span style={{ fontSize: "10px", opacity: 0.65, display: "block", marginTop: "3px" }}>{opt.description}</span>}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1e3a5f" }}>
          {current.is_optional ? (
            <button onClick={handleSkip} style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>Passer</button>
          ) : <span />}
          <button onClick={handleNext} disabled={selected === null && !current.is_optional} style={{
            background: selected !== null || current.is_optional ? `linear-gradient(135deg, ${S.orange}, #ea580c)` : "#1e3a5f",
            border: "none", borderRadius: "100px", color: "#fff",
            padding: "11px 26px", fontSize: "14px", fontWeight: 700,
            cursor: selected !== null || current.is_optional ? "pointer" : "not-allowed",
            opacity: selected === null && !current.is_optional ? 0.45 : 1,
            transition: "all 0.22s",
            boxShadow: selected !== null ? `0 6px 20px ${S.orange}40` : "none",
          }}>{isLast ? "✨ Voir mes recommandations" : "Suivant →"}</button>
        </div>
      </div>

      {Object.keys(answers).length > 0 && (
        <div style={{ marginTop: "18px", padding: "14px 18px", background: `${S.orange}0a`, border: `1px solid ${S.orange}25`, borderRadius: "12px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>Vos choix</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            {Object.entries(answers).map(([f, v]) => (
              <span key={f} style={{ fontSize: "12px", fontWeight: 500, color: S.ivory, background: "#1e3a5f", borderRadius: "100px", padding: "3px 11px" }}>
                {readableLabel(f, v)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — ResultCards (Recommandation)
// ─────────────────────────────────────────────────────────────────────────────
const PREF_MAP = {
  budget:        { icon: "", labels: { economique: "Économique", moyen: "Moyen", luxe: "Luxe" } },
  type_sejour:   { icon: "", labels: { couple: "Couple", famille: "Famille", solo: "Solo", amis: "Amis" } },
  cuisine:       { icon: "", labels: { marocaine: "Marocaine", internationale: "Internationale", cafe: "Café" } },
  ambiance:      { icon: "", labels: { calme: "Calme", romantique: "Romantique", moderne: "Moderne" } },
  type_plage:    { icon: "", labels: { calme: "Calme", animee: "Animée", randonnee: "Randonnée", coucher_soleil: "Coucher de soleil" } },
  type_activite: { icon: "", labels: { aventure: "Aventure", historique: "Historique", famille: "Famille", culture: "Culture" } },
  distance:      { icon: "", labels: { proche: "Proche", moyen: "Moyen", loin: "Loin" } },
  localisation:  { icon: "" },
};

function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function ResultCard({ item, rank }) {
  const [hov, setHov] = useState(false);
  const isTop      = rank === 0;
  const score      = item._score ?? 0;
  const pct        = Math.round(score * 100);
  const reasons    = item._match_reasons || [];
  const isFallback = item._is_exact_match === false;

  const tags = [
    item.budget        && cap(item.budget),
    item.localisation  && ` ${cap(item.localisation)}`,
    item.type_sejour   && cap(item.type_sejour),
    item.cuisine       && cap(item.cuisine),
    item.ambiance      && cap(item.ambiance),
    item.type_plage    && cap(item.type_plage),
    item.type_activite && cap(item.type_activite),
  ].filter(Boolean).slice(0, 4);

  const prix = item.prix_min != null
    ? `${item.prix_min}${item.prix_max ? `–${item.prix_max}` : ""} MAD`
    : item.fourchette_prix || null;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: "#112240", borderRadius: "16px", overflow: "hidden",
      border: `1.5px solid ${isTop ? S.orange : hov ? "#2e5a8a" : "#1e3a5f"}`,
      boxShadow: isTop ? `0 0 24px ${S.orange}28, 0 8px 32px rgba(0,0,0,0.4)` : hov ? "0 12px 36px rgba(0,0,0,0.45)" : "0 4px 16px rgba(0,0,0,0.3)",
      transition: "transform 0.22s, box-shadow 0.22s, border-color 0.22s",
      transform: hov ? "translateY(-5px)" : "translateY(0)",
      position: "relative",
    }}>
      {isTop && (
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2, background: S.orange, color: "#fff", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "100px" }}>
          Meilleur choix
        </div>
      )}
      {isFallback && (
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 2, background: "rgba(255,255,255,0.07)", color: S.muted, fontSize: "10px", padding: "3px 8px", borderRadius: "100px" }}>
          Suggestion
        </div>
      )}
      <div style={{
        height: "160px",
        background: item.image ? `url(${item.image}) center/cover no-repeat, #0d2137` : "linear-gradient(135deg, #0d2137, #1a3050)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "3rem", position: "relative",
      }}>
        {!item.image && <span>🏙️</span>}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, #112240, transparent)" }} />
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: S.ivory, margin: 0, lineHeight: 1.2 }}>{item.nom}</h3>
          {item.rating && <span style={{ color: S.gold, fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>★ {Number(item.rating).toFixed(1)}</span>}
        </div>
        {item.description && (
          <p style={{ fontSize: "12px", color: S.muted, lineHeight: 1.55, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.description}
          </p>
        )}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
            {tags.map((t, i) => <span key={i} style={{ fontSize: "10px", fontWeight: 500, color: S.muted, background: "#0d2137", borderRadius: "100px", padding: "2px 9px" }}>{t}</span>)}
            {item.piscine && <span style={{ fontSize: "10px", fontWeight: 500, color: S.muted, background: "#0d2137", borderRadius: "100px", padding: "2px 9px" }}>🏊 Piscine</span>}
            {item.vue_mer && <span style={{ fontSize: "10px", fontWeight: 500, color: S.muted, background: "#0d2137", borderRadius: "100px", padding: "2px 9px" }}>🌊 Vue mer</span>}
          </div>
        )}
        {score > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: S.muted, marginBottom: "4px" }}>
              <span>Pertinence</span><span>{pct}%</span>
            </div>
            <div style={{ height: "3px", background: "#1e3a5f", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${S.orange}, ${S.gold})`, borderRadius: "100px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}
        {reasons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "14px" }}>
            {reasons.map((r, i) => <span key={i} style={{ fontSize: "10px", fontWeight: 600, color: "#4ade80", background: "rgba(74,222,128,0.08)", borderRadius: "100px", padding: "2px 8px" }}>{r}</span>)}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #1e3a5f" }}>
          <div>
            {prix && <><span style={{ fontSize: "10px", color: S.muted, display: "block" }}>À partir de</span><span style={{ fontSize: "13px", fontWeight: 700, color: S.ivory }}>{prix}</span></>}
            {!prix && item.adresse && <span style={{ fontSize: "11px", color: S.muted }}>📍 {item.adresse}</span>}
          </div>
          <button style={{ background: `linear-gradient(135deg, ${S.orange}, #ea580c)`, border: "none", borderRadius: "100px", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "7px 16px", cursor: "pointer" }}>
            Voir plus →
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultCards({ results, category, preferences, onReset, onRetry }) {
  const items = results?.resultats || [];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", marginBottom: "28px" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.7rem", fontWeight: 700, color: S.ivory, margin: "0 0 6px" }}>
            {category.emoji} {items.length} {category.label} recommandé{items.length > 1 ? "s" : ""}
          </h2>
          <p style={{ fontSize: "13px", color: S.muted, margin: 0 }}>
            {items.length > 0 ? "Triés par pertinence selon vos préférences" : "Aucun résultat — essayez d'élargir vos critères"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onRetry} style={{ background: "none", border: "1px solid #1e3a5f", borderRadius: "100px", color: S.muted, fontSize: "13px", fontWeight: 600, padding: "9px 18px", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = S.orange; e.currentTarget.style.color = S.orange; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = S.muted; }}
          >✏️ Modifier</button>
          <button onClick={onReset} style={{ background: `linear-gradient(135deg, ${S.orange}, #ea580c)`, border: "none", borderRadius: "100px", color: "#fff", fontSize: "13px", fontWeight: 700, padding: "9px 20px", cursor: "pointer" }}>
            🔄 Recommencer
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "28px" }}>
        {Object.entries(preferences).map(([key, val]) => {
          const def = PREF_MAP[key];
          if (!def) return null;
          const icon  = def.icon || "";
          const label = typeof val === "boolean" ? `${icon} ${key}: ${val ? "Oui" : "Non"}` : `${icon} ${def.labels?.[val] || cap(val)}`;
          return (
            <span key={key} style={{ fontSize: "12px", fontWeight: 600, color: S.orange, background: `${S.orange}12`, border: `1px solid ${S.orange}25`, borderRadius: "100px", padding: "4px 12px" }}>
              {label}
            </span>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: S.muted }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "14px" }}>🔍</div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", color: S.ivory, margin: "0 0 8px" }}>Aucun résultat</h3>
          <p style={{ fontSize: "14px" }}>Essayez de modifier vos préférences.</p>
          <button onClick={onRetry} style={{ marginTop: "20px", background: `linear-gradient(135deg, ${S.orange}, #ea580c)`, border: "none", borderRadius: "100px", color: "#fff", padding: "11px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            Réessayer
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "20px" }}>
          {items.map((item, i) => <ResultCard key={item.id || item.nom || i} item={item} rank={i} />)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RECOMMANDATION
// ─────────────────────────────────────────────────────────────────────────────
const STEP_RECO = { CATEGORY: "category", QUESTIONS: "questions", RESULTS: "results" };

function SectionRecom() {
  const [step,      setStep]      = useState(STEP_RECO.CATEGORY);
  const [category,  setCategory]  = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [results,   setResults]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const topRef                    = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  async function handleCategorySelect(cat) {
    setError(null); setLoading(true);
    try {
      const data = await recoApi.getQuestions(cat.id);
      setCategory(cat); setQuestions(data.questions); setAnswers({});
      setStep(STEP_RECO.QUESTIONS);
    } catch (e) {
      setError("Impossible de charger les questions. Vérifiez que le backend est actif.");
    } finally { setLoading(false); }
  }

  async function handleWizardComplete(collectedAnswers) {
    setError(null); setLoading(true); setAnswers(collectedAnswers);
    try {
      const data = await recoApi.getRecommandations({ categorie: category.id, ...collectedAnswers });
      setResults(data); setStep(STEP_RECO.RESULTS);
    } catch (e) {
      setError("Erreur lors de la génération des recommandations.");
    } finally { setLoading(false); }
  }

  function handleReset() {
    setStep(STEP_RECO.CATEGORY); setCategory(null);
    setQuestions([]); setAnswers({}); setResults(null); setError(null);
  }

  return (
    <>
      <style>{`
        @keyframes recoSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: "linear-gradient(160deg, #0f2040 0%, #0a1628 100%)", borderBottom: "1px solid #1e3a5f", padding: "52px 24px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(249,115,22,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }} ref={topRef}>
          <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: S.orange, background: `${S.orange}15`, border: `1px solid ${S.orange}30`, borderRadius: "100px", padding: "5px 16px", marginBottom: "20px" }}>
            🤖 Recommandation IA
          </span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: S.ivory, margin: "0 0 12px", lineHeight: 1.1 }}>
            Votre séjour <em style={{ fontStyle: "italic", color: S.orange }}>sur mesure</em>
          </h1>
          <p style={{ color: S.muted, fontSize: "14px", maxWidth: "480px", margin: "0 auto 32px" }}>
            Répondez à quelques questions — notre IA trouve les meilleures adresses de Tanger pour vous.
          </p>
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
            {[
              { n: 1, label: "Catégorie", stepKey: STEP_RECO.CATEGORY },
              { n: 2, label: "Questions", stepKey: STEP_RECO.QUESTIONS },
              { n: 3, label: "Résultats", stepKey: STEP_RECO.RESULTS },
            ].map((s, i) => {
              const isActive = step === s.stepKey;
              const isDone = (s.stepKey === STEP_RECO.CATEGORY && step !== STEP_RECO.CATEGORY) || (s.stepKey === STEP_RECO.QUESTIONS && step === STEP_RECO.RESULTS);
              return (
                <span key={s.n} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <span style={{ width: "40px", height: "1px", background: "#1e3a5f", display: "block" }} />}
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", padding: "0 10px" }}>
                    <span style={{ width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, background: isActive ? S.orange : isDone ? `${S.orange}20` : "#1e3a5f", color: isActive ? "#fff" : isDone ? S.orange : S.muted, border: `1.5px solid ${isActive || isDone ? S.orange : "#1e3a5f"}`, boxShadow: isActive ? `0 0 14px ${S.orange}50` : "none", transition: "all 0.3s" }}>
                      {isDone ? "✓" : s.n}
                    </span>
                    <span style={{ fontSize: "10px", color: isActive ? S.ivory : S.muted, fontWeight: isActive ? 600 : 400 }}>{s.label}</span>
                  </span>
                </span>
              );
            })}
          </nav>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {error && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", borderRadius: "10px", padding: "13px 18px", color: "#fca5a5", fontSize: "13px", marginBottom: "24px" }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: "15px" }}>✕</button>
          </div>
        )}
        {loading && <RecoLoader />}
        {!loading && step === STEP_RECO.CATEGORY  && <CategorySelector onSelect={handleCategorySelect} />}
        {!loading && step === STEP_RECO.QUESTIONS  && <QuestionWizard category={category} questions={questions} onComplete={handleWizardComplete} onBack={handleReset} />}
        {!loading && step === STEP_RECO.RESULTS && results && <ResultCards results={results} category={category} preferences={answers} onReset={handleReset} onRetry={() => setStep(STEP_RECO.QUESTIONS)} />}
      </div>
    </>
  );
}

function RecoLoader() {
  const msgs = ["Analyse de vos préférences…", "Consultation de la base de données…", "Scoring des meilleures adresses…"];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: "22px" }}>
      <div style={{ width: "56px", height: "56px", border: `3px solid ${S.orange}30`, borderTopColor: S.orange, borderRadius: "50%", animation: "spin 0.85s linear infinite" }} />
      <p style={{ color: S.muted, fontSize: "13px", fontWeight: 300 }}>{msgs[idx]}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ACCUEIL — Lieux touristiques depuis API
// ─────────────────────────────────────────────────────────────────────────────
function Stars({ note }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <span style={{ color: "#f97316", fontSize: "14px" }}>★</span>
      <span style={{ color: "#f97316", fontWeight: 700, fontSize: "13px" }}>{note}</span>
    </div>
  );
}

function LieuCard({ lieu, onExplore }) {
  // Support des deux formats de champ image
  const imgUrl = lieu.image_url || lieu.imageUrl || "";
  return (
    <div style={{
      background: "#112240", borderRadius: "16px", overflow: "hidden",
      border: "1px solid #1e3a5f", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#f97316"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1e3a5f"; }}
    >
      <div style={{
        height: "200px",
        background: imgUrl
          ? `url(${imgUrl}) center/cover no-repeat, #1e3a5f`
          : "linear-gradient(135deg, #0d2137, #1a3050)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(13,27,42,0.85)", color: "#94a3b8", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 600 }}>
          {lieu.categorie}
        </div>
        {lieu.badge && (
          <div style={{ position: "absolute", top: "12px", right: "12px", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700 }}>
            {lieu.badge}
          </div>
        )}
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>{lieu.nom}</h3>
          <Stars note={lieu.note} />
        </div>
        <p style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>{lieu.description}</p>
        <button onClick={() => onExplore(lieu)} style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none",
          borderRadius: "10px", color: "#fff", padding: "9px 0", width: "100%",
          fontSize: "13px", fontWeight: 700, cursor: "pointer",
        }}>Explorer</button>
      </div>
    </div>
  );
}

function SectionAccueil({ onOpenChat }) {
  const { data: lieux, loading, error, refetch } = useApiDataWithRefetch(() => lieuxApi.getAll());

  // Support tableau direct ou objet { lieux: [...] }
  const lieuxList = Array.isArray(lieux) ? lieux : (lieux?.lieux || lieux?.data || []);

  return (
    <>
      <div style={{
        height: "380px",
        background: `linear-gradient(180deg, rgba(13,27,42,0.5) 0%, rgba(13,27,42,0.95) 100%),
                     url(https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1400) center/cover no-repeat`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 24px",
      }}>
        <div style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "20px", padding: "4px 16px", fontSize: "12px", color: "#f97316", fontWeight: 600, marginBottom: "16px" }}>
          🤖 Assistance IA disponible
        </div>
        <h1 style={{ fontSize: "42px", fontWeight: 900, margin: "0 0 12px", color: "#f1f5f9" }}>Découvrez Tanger 🇲🇦</h1>
        <p style={{ color: "#cbd5e1", fontSize: "17px", margin: "0 0 28px", maxWidth: "500px" }}>
          Porte de l'Afrique, là où la Méditerranée rencontre l'Atlantique
        </p>
        <div style={{ display: "flex", gap: "40px" }}>
          {[
            { n: lieuxList.length || "…", label: "lieux indexés" },
            { n: "4",  label: "agents IA" },
            { n: "11", label: "catégories" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#f97316" }}>{s.n}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px", letterSpacing: "1px" }}>
          LIEUX INCONTOURNABLES
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "40px", fontSize: "14px" }}>
          Explorez les plus beaux endroits de Tanger
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {loading && <LoadingGrid color={S.orange} />}
        {error   && <ErrorBanner message={error} onRetry={refetch} />}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {lieuxList.map(lieu => (
              <LieuCard key={lieu.id || lieu.nom} lieu={lieu} onExplore={onOpenChat} />
            ))}
          </div>
        )}

        <div style={{
          marginTop: "60px",
          background: "linear-gradient(135deg, #0d2137, #112240)",
          border: "1px solid #f9731630", borderRadius: "16px",
          padding: "32px 40px", display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: "24px",
        }}>
          <div>
            <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "20px", margin: "0 0 8px" }}>
              Besoin d'aide pour planifier votre visite ?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              Notre assistant IA répond à toutes vos questions : hôtels, restaurants, transports, urgences…
            </p>
          </div>
          <button onClick={onOpenChat} style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none",
            borderRadius: "12px", color: "#fff", padding: "12px 28px",
            fontSize: "14px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
          }}>🤖 Ouvrir l'Assistant IA</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK avec refetch (pour bouton "Réessayer")
// ─────────────────────────────────────────────────────────────────────────────
function useApiDataWithRefetch(fetchFn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    fetchFn()
      .then(d  => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { data, loading, error, refetch: () => setTick(t => t + 1) };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG types & budgets (utilisés pour les filtres dynamiques)
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  aventure:    { color: "#f97316", label: "Aventure",    emoji: "🪂" },
  sport:       { color: "#3b82f6", label: "Sport",       emoji: "⚽" },
  détente:     { color: "#ec4899", label: "Détente",     emoji: "🧘" },
  culture:     { color: "#06b6d4", label: "Culture",     emoji: "🏛️" },
  gastronomie: { color: "#f59e0b", label: "Gastronomie", emoji: "🍽️" },
  créatif:     { color: "#8b5cf6", label: "Créatif",     emoji: "🎨" },
  nightlife:   { color: "#6366f1", label: "Nightlife",   emoji: "🎶" },
  famille:     { color: "#10b981", label: "Famille",     emoji: "👨‍👩‍👧" },
  historique:  { color: "#a855f7", label: "Historique",  emoji: "🏰" },
};

const BUDGET_CONFIG = {
  économique: { label: "Éco",   emoji: "💚" },
  moyen:      { label: "Moyen", emoji: "💙" },
  luxe:       { label: "Luxe",  emoji: "💛" },
};

const LOCALISATION_ICONS = {
  intérieur: "🏠", extérieur: "🌿", plage: "🏖️",
  montagne: "⛰️", "centre-ville": "🏙️", médina: "🕌",
};

function formatDuree(duree) {
  const map = {
    "1h": "1h", "2h": "2h", "demi-journée": "Demi-journée",
    "Demi-journée": "Demi-journée", "journée complète": "Journée complète",
    "Journée complète": "Journée complète", "soirée": "Soirée",
    "quelques heures": "Quelques heures",
  };
  return map[duree] ?? duree;
}

const metaBadgeStyle = {
  fontSize: "11px", fontWeight: 500, color: "#94a3b8",
  background: "#0d2137", borderRadius: "100px",
  padding: "3px 10px", whiteSpace: "nowrap",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ACTIVITÉS — données depuis API
// ─────────────────────────────────────────────────────────────────────────────
function ActiviteCard({ act, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg      = TYPE_CONFIG[act.type] ?? { color: "#94a3b8", label: act.type, emoji: "🎯" };
  const isGratuit = act.prix?.toLowerCase() === "gratuit";
  const imgUrl   = act.image || act.image_url || "";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#112240", borderRadius: "16px", overflow: "hidden",
        border: `1.5px solid ${hovered ? cfg.color : "#1e3a5f"}`,
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.5), 0 0 24px ${cfg.color}20` : "0 4px 16px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        animation: "fadeInUp 0.4s ease both",
        animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
      }}
    >
      <div style={{
        height: "185px",
        backgroundImage: imgUrl ? `url(${imgUrl})` : "none",
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundColor: "#0d2137", position: "relative",
        background: imgUrl
          ? `url(${imgUrl}) center/cover no-repeat`
          : "linear-gradient(135deg, #0d2137 0%, #1a3050 100%)",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #112240 0%, transparent 55%)" }} />
        <span style={{
          position: "absolute", top: "12px", left: "12px",
          background: `${cfg.color}25`, border: `1px solid ${cfg.color}55`,
          color: cfg.color, fontSize: "11px", fontWeight: 700,
          padding: "4px 11px", borderRadius: "100px", backdropFilter: "blur(6px)",
        }}>
          {cfg.emoji} {cfg.label}
        </span>
        <span style={{
          position: "absolute", top: "12px", right: "12px",
          background: "rgba(10,20,35,0.82)", color: "#f5c842",
          fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "100px",
        }}>
          ★ {Number(act.rating).toFixed(1)}
        </span>
      </div>

      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 7px", lineHeight: 1.3 }}>
          {act.nom}
        </h3>
        <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {act.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
          <span style={metaBadgeStyle}>{LOCALISATION_ICONS[act.localisation] ?? "📍"} {act.localisation}</span>
          <span style={metaBadgeStyle}>⏱️ {formatDuree(act.duree)}</span>
          <span style={metaBadgeStyle}>{BUDGET_CONFIG[act.budget]?.emoji ?? ""} {act.budget}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "13px", borderTop: "1px solid #1e3a5f" }}>
          <span style={{ fontSize: "16px", fontWeight: 800, color: isGratuit ? "#4ade80" : "#f1f5f9" }}>{act.prix}</span>
          <button style={{
            background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}bb 100%)`,
            border: "none", borderRadius: "100px", color: "#fff",
            fontSize: "12px", fontWeight: 700, padding: "8px 18px", cursor: "pointer",
            transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Réserver →
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionActivites() {
  const [activeType,   setActiveType]   = useState("tous");
  const [activeBudget, setActiveBudget] = useState("tous");
  const [search,       setSearch]       = useState("");

  // ── Chargement API ─────────────────────────────────────────────
  const { data: rawData, loading, error, refetch } = useApiDataWithRefetch(
    () => activitesApi.getAll()
  );

  // Support plusieurs formats de réponse : tableau direct ou { activites: [...] }
  const activitesData = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData.activites || rawData.data || []);
  }, [rawData]);

  // ── Types disponibles dynamiquement depuis les données ─────────
  const availableTypes = useMemo(() => {
    const found = new Set(activitesData.map(a => a.type).filter(Boolean));
    return ["tous", ...Object.keys(TYPE_CONFIG).filter(k => found.has(k))];
  }, [activitesData]);

  // ── Filtrage ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activitesData.filter(a => {
      const matchType   = activeType   === "tous" || a.type   === activeType;
      const matchBudget = activeBudget === "tous" || a.budget === activeBudget;
      const matchSearch = !q
        || a.nom?.toLowerCase().includes(q)
        || a.description?.toLowerCase().includes(q)
        || a.type?.toLowerCase().includes(q)
        || a.localisation?.toLowerCase().includes(q);
      return matchType && matchBudget && matchSearch;
    });
  }, [activitesData, activeType, activeBudget, search]);

  const countByType = useMemo(() =>
    Object.keys(TYPE_CONFIG).reduce((acc, t) => {
      acc[t] = activitesData.filter(a => a.type === t).length;
      return acc;
    }, {}),
  [activitesData]);

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* HERO */}
      <div style={{ background: "linear-gradient(160deg, #0f2040 0%, #0a1628 100%)", borderBottom: "1px solid #1e3a5f", padding: "52px 24px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(99,102,241,0.09) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a855f7", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "100px", padding: "5px 16px", marginBottom: "18px" }}>
            🎯 Activités
          </span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" }}>
            Que faire à <em style={{ fontStyle: "italic", color: "#a855f7" }}>Tanger ?</em>
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 auto 32px", maxWidth: "480px" }}>
            {loading ? "Chargement des activités…" : `${activitesData.length} activités sélectionnées — aventure, sport, culture, famille & plus`}
          </p>

          {/* Stats par type (seulement si données chargées) */}
          {!loading && !error && (
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
              {availableTypes.filter(t => t !== "tous").map(t => {
                const cfg = TYPE_CONFIG[t];
                const count = countByType[t] ?? 0;
                if (!count) return null;
                return (
                  <button key={t} onClick={() => setActiveType(t === activeType ? "tous" : t)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", padding: "4px" }}>
                    <div style={{ fontSize: "20px" }}>{cfg.emoji}</div>
                    <div style={{ fontSize: "11px", color: cfg.color, fontWeight: 700, marginTop: "3px" }}>{count} {cfg.label}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Barre de filtres */}
        {!loading && !error && (
          <div style={{ background: "#0d1f38", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "18px 20px", marginBottom: "32px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Recherche */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#64748b", pointerEvents: "none" }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une activité, un lieu, un type…"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 40px", background: "#112240", border: "1.5px solid #1e3a5f", borderRadius: "10px", color: "#f1f5f9", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#1e3a5f"}
              />
            </div>

            {/* Filtres type */}
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600, marginRight: "4px", whiteSpace: "nowrap" }}>TYPE :</span>
              {availableTypes.map(t => {
                const cfg = TYPE_CONFIG[t];
                const isActive = activeType === t;
                const activeColor = cfg?.color ?? "#94a3b8";
                return (
                  <button key={t} onClick={() => setActiveType(t)} style={{
                    padding: "6px 14px", borderRadius: "100px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                    border: `1.5px solid ${isActive ? activeColor : "#1e3a5f"}`,
                    background: isActive ? `${activeColor}18` : "transparent",
                    color: isActive ? activeColor : "#64748b", transition: "all 0.2s", whiteSpace: "nowrap",
                  }}>
                    {t === "tous" ? "✦ Tous" : `${cfg.emoji} ${cfg.label}`}
                  </button>
                );
              })}
            </div>

            {/* Filtres budget */}
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600, marginRight: "4px", whiteSpace: "nowrap" }}>BUDGET :</span>
              {["tous", "économique", "moyen", "luxe"].map(b => {
                const isActive = activeBudget === b;
                const cfg = BUDGET_CONFIG[b];
                return (
                  <button key={b} onClick={() => setActiveBudget(b)} style={{
                    padding: "6px 14px", borderRadius: "100px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                    border: `1.5px solid ${isActive ? "#f5c842" : "#1e3a5f"}`,
                    background: isActive ? "rgba(245,200,66,0.12)" : "transparent",
                    color: isActive ? "#f5c842" : "#64748b", transition: "all 0.2s", whiteSpace: "nowrap",
                  }}>
                    {b === "tous" ? "💫 Tous budgets" : `${cfg.emoji} ${cfg.label}`}
                  </button>
                );
              })}
              {(activeType !== "tous" || activeBudget !== "tous" || search) && (
                <button onClick={() => { setActiveType("tous"); setActiveBudget("tous"); setSearch(""); }} style={{
                  padding: "6px 14px", borderRadius: "100px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                  border: "1.5px solid #ef4444", background: "rgba(239,68,68,0.1)", color: "#ef4444", transition: "all 0.2s", marginLeft: "auto",
                }}>
                  ✕ Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}

        {/* États */}
        {loading && <LoadingGrid color="#a855f7" />}
        {error   && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            <p style={{ color: "#475569", fontSize: "13px", marginBottom: "24px" }}>
              <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{filtered.length}</span>
              {" "}activité{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
              {activeType !== "tous" && <span style={{ color: TYPE_CONFIG[activeType]?.color }}> · {TYPE_CONFIG[activeType]?.label}</span>}
              {activeBudget !== "tous" && <span style={{ color: "#f5c842" }}> · budget {activeBudget}</span>}
              {search && <span style={{ color: "#94a3b8" }}> · "{search}"</span>}
            </p>

            {filtered.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {filtered.map((act, i) => <ActiviteCard key={act.id || `${act.nom}-${i}`} act={act} index={i} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "70px 0", color: "#475569" }}>
                <div style={{ fontSize: "3rem", marginBottom: "14px" }}>🔍</div>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>Aucune activité trouvée.</p>
                <p style={{ fontSize: "13px" }}>Essayez d'autres filtres ou effacez la recherche.</p>
                <button onClick={() => { setActiveType("tous"); setActiveBudget("tous"); setSearch(""); }} style={{
                  marginTop: "16px", padding: "9px 22px", borderRadius: "100px", cursor: "pointer",
                  background: "rgba(99,102,241,0.15)", border: "1.5px solid #6366f1", color: "#6366f1", fontSize: "13px", fontWeight: 700,
                }}>Réinitialiser les filtres</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ÉVÉNEMENTS — données depuis API
// ─────────────────────────────────────────────────────────────────────────────
const CAT_EVENT_CONFIG = {
  Musique:  { color: "#f97316", emoji: "🎵" },
  Culture:  { color: "#06b6d4", emoji: "🏛️" },
  Cinéma:   { color: "#a855f7", emoji: "🎬" },
  Sport:    { color: "#10b981", emoji: "🏅" },
};

function SectionEvenements() {
  const [filter,   setFilter]   = useState("tous");
  const [hovered,  setHovered]  = useState(null);
  const [expanded, setExpanded] = useState(null);

  // ── Chargement API ─────────────────────────────────────────────
  const { data: rawData, loading, error, refetch } = useApiDataWithRefetch(
    () => evenementsApi.getAll()
  );

  // Support plusieurs formats : tableau direct ou { evenements: [...] }
  const eventsData = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData.evenements || rawData.events || rawData.data || []);
  }, [rawData]);

  // ── Catégories dynamiques ──────────────────────────────────────
  const cats = useMemo(() => {
    const found = new Set(eventsData.map(e => e.category).filter(Boolean));
    return ["tous", ...Object.keys(CAT_EVENT_CONFIG).filter(k => found.has(k))];
  }, [eventsData]);

  const filtered = useMemo(() =>
    eventsData.filter(e => filter === "tous" || e.category === filter),
  [eventsData, filter]);

  const featured = eventsData[0];

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: featured?.image_url
          ? `linear-gradient(180deg, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.95) 100%), url(${featured.image_url}) center/cover no-repeat`
          : "linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)",
        padding: "80px 24px 60px", textAlign: "center",
      }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" }}>
          <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "100px", padding: "5px 16px", marginBottom: "18px" }}>
            📅 Agenda 2026–2027
          </span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" }}>
            Événements à <em style={{ fontStyle: "italic", color: "#f97316" }}>Tanger</em>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 auto 28px", maxWidth: "500px" }}>
            {loading ? "Chargement…" : `${eventsData.length} événements à venir — concerts, festivals, culture et sport`}
          </p>

          {!loading && !error && (
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
              {Object.entries(CAT_EVENT_CONFIG).map(([k, v]) => {
                const count = eventsData.filter(e => e.category === k).length;
                if (!count) return null;
                return (
                  <div key={k} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px" }}>{v.emoji}</div>
                    <div style={{ fontSize: "12px", color: v.color, fontWeight: 700, marginTop: "4px" }}>{count} {k}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* États */}
        {loading && <LoadingGrid color={S.orange} />}
        {error   && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            {/* Filtres catégorie */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
              {cats.map(c => {
                const cfg = CAT_EVENT_CONFIG[c];
                const isActive = filter === c;
                return (
                  <button key={c} onClick={() => setFilter(c)} style={{
                    padding: "8px 18px", borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontWeight: 700,
                    border: `1.5px solid ${isActive ? (cfg?.color || "#f97316") : "#1e3a5f"}`,
                    background: isActive ? `${cfg?.color || "#f97316"}15` : "none",
                    color: isActive ? (cfg?.color || "#f97316") : "#64748b", transition: "all 0.2s",
                  }}>
                    {cfg ? `${cfg.emoji} ${c}` : "✦ Tous"}
                  </button>
                );
              })}
            </div>

            <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "28px" }}>
              <span style={{ color: S.ivory, fontWeight: 700 }}>{filtered.length}</span> événement{filtered.length > 1 ? "s" : ""}
            </p>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {filtered.map((ev, i) => {
                const cfg   = CAT_EVENT_CONFIG[ev.category] || { color: "#f97316", emoji: "📅" };
                const isHov = hovered === i;
                const isExp = expanded === i;
                const imgUrl = ev.image_url || ev.image || "";
                return (
                  <div key={ev.id || i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: "#112240", borderRadius: "16px", overflow: "hidden",
                      border: `1.5px solid ${isHov || isExp ? cfg.color : "#1e3a5f"}`,
                      boxShadow: isHov ? `0 8px 28px rgba(0,0,0,0.4), 0 0 16px ${cfg.color}14` : "0 4px 16px rgba(0,0,0,0.25)",
                      transition: "all 0.22s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
                      <div style={{
                        width: "220px", minWidth: "220px", flexShrink: 0,
                        background: imgUrl
                          ? `url(${imgUrl}) center/cover no-repeat, #0d2137`
                          : "linear-gradient(135deg, #0d2137, #1a3050)",
                        position: "relative", minHeight: "160px",
                      }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, #112240 100%)" }} />
                        <span style={{ position: "absolute", top: "12px", left: "12px", background: `${cfg.color}22`, border: `1px solid ${cfg.color}60`, color: cfg.color, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "100px" }}>
                          {cfg.emoji} {ev.category}
                        </span>
                      </div>

                      <div style={{ flex: 1, padding: "20px 22px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", margin: 0, lineHeight: 1.25 }}>
                            {ev.title || ev.titre || ev.nom}
                          </h3>
                          <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "100px", padding: "3px 10px" }}>
                            À venir
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: cfg.color, fontWeight: 600 }}>
                            📅 {ev.date}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#64748b" }}>
                            📍 {ev.location || ev.lieu}
                          </span>
                        </div>
                        <p style={{
                          fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: "0 0 14px",
                          ...(isExp ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                        }}>
                          {ev.description}
                        </p>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <button onClick={() => setExpanded(isExp ? null : i)} style={{
                            background: "none", border: "1px solid #1e3a5f", borderRadius: "100px", color: "#64748b",
                            fontSize: "12px", fontWeight: 600, padding: "6px 14px", cursor: "pointer", transition: "all 0.2s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.color = cfg.color; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#64748b"; }}
                          >
                            {isExp ? "Voir moins ↑" : "Lire plus ↓"}
                          </button>
                          <button style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, border: "none", borderRadius: "100px", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "7px 16px", cursor: "pointer" }}>
                            En savoir plus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD (inchangé — déjà connecté au backend)
// ─────────────────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  culture:"#a855f7", nature:"#22c55e", gastronomie:"#ef4444", détente:"#06b6d4",
  aventure:"#f97316", sport:"#3b82f6", famille:"#f59e0b", nightlife:"#ec4899", autre:"#64748b",
};
const CAT_EMOJI = {
  culture:"🏛️", nature:"🌿", gastronomie:"🍽️", détente:"🧘",
  aventure:"🪂", sport:"⚽", famille:"👨‍👩‍👧", nightlife:"🎶", autre:"📍",
};
const BUDGET_COLORS  = { économique:"#22c55e", moyen:"#3b82f6", luxe:"#f5c842" };
const SAISON_COLORS  = { automne:"#f97316", printemps:"#22c55e", ete:"#06b6d4", hiver:"#a855f7" };
const SAISON_EMOJI   = { automne:"🍂", printemps:"🌸", ete:"☀️", hiver:"❄️" };

const API_DASH = "/api/dashboard";
async function dashFetch(path) {
  const res = await fetch(`${API_DASH}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function ProgressBar({ value, max, color, height = 8 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height, background: "#1e3a5f", borderRadius: 100, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 100, background: color, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function KPICard({ label, value, sub, icon, color = S.orange, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      ...S.surface, padding: "22px 20px", cursor: onClick ? "pointer" : "default",
      transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
      transform: hov ? "translateY(-4px)" : "translateY(0)",
      borderColor: hov ? color : "#1e3a5f",
      boxShadow: hov ? `0 12px 32px rgba(0,0,0,0.4), 0 0 20px ${color}18` : "0 4px 16px rgba(0,0,0,0.25)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: color, opacity: hov ? 1 : 0, transition: "opacity 0.2s" }} />
      <div style={{ fontSize: "1.8rem", marginBottom: "10px", lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: "1.9rem", fontWeight: 800, color, lineHeight: 1, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "13px", color: S.ivory, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: S.muted, marginTop: "3px" }}>{sub}</div>}
    </div>
  );
}

function Spinner({ color = S.orange }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <div style={{ width: 36, height: 36, border: `3px solid #1e3a5f`, borderTopColor: color, borderRadius: "50%", animation: "dashSpin 0.8s linear infinite" }} />
    </div>
  );
}

// ── Sous-sections Dashboard (identiques à l'original) ────────────────────────
function DashGlobal({ data }) {
  if (!data) return <Spinner />;
  const { overview, pricing, quality, geography } = data;
  const kpis = [
    { label: "Lieux touristiques", value: overview.total_lieux_touristiques, icon: "🏛️",  color: "#a855f7" },
    { label: "Activités",          value: overview.total_activites,           icon: "🎯",  color: "#f97316" },
    { label: "Hôtels",             value: overview.total_hotels,              icon: "🏨",  color: "#f5c842" },
    { label: "Restaurants",        value: overview.total_restaurants,         icon: "🍽️", color: "#ef4444" },
    { label: "Plages & Espaces",   value: overview.total_plages,              icon: "🏖️", color: "#06b6d4" },
    { label: "Événements 2026",    value: overview.total_events,              icon: "🎪",  color: "#22c55e" },
    { label: "Avis collectés",     value: overview.total_avis,                icon: "💬",  color: "#3b82f6" },
    { label: "Profils analysés",   value: overview.total_utilisateurs,        icon: "👤",  color: "#ec4899" },
  ];
  const maxQuartier = geography.top_quartiers[0]?.count || 1;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: "14px" }}>
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>💰 Prix moyens</p>
          {[
            { label: "Hôtel / nuit",  val: `${pricing.prix_moyen_hotel_mad.toLocaleString()} MAD`, color: "#f5c842", raw: pricing.prix_moyen_hotel_mad },
            { label: "Repas / pers.", val: `${pricing.prix_moyen_restaurant_mad} MAD`, color: "#ef4444", raw: pricing.prix_moyen_restaurant_mad },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: S.muted }}>{row.label}</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: row.color }}>{row.val}</span>
              </div>
              <ProgressBar value={row.raw} max={2000} color={row.color} />
            </div>
          ))}
        </div>
        <div style={{ ...S.surface, padding: "22px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>⭐ Satisfaction globale</p>
          <div style={{ fontSize: "3.8rem", fontWeight: 900, color: S.gold, lineHeight: 1 }}>{quality.note_moyenne_globale}</div>
          <div style={{ fontSize: "12px", color: S.muted, margin: "6px 0 16px" }}>/ 5.0 · {quality.total_avis_collectes} avis</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: i <= Math.round(quality.note_moyenne_globale) ? `${S.gold}22` : "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                {i <= Math.round(quality.note_moyenne_globale) ? "⭐" : "☆"}
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>📍 Top quartiers touristiques</p>
          {geography.top_quartiers.map((q, i) => (
            <div key={q.quartier} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: [S.orange,"#a855f7","#06b6d4","#22c55e","#f5c842"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{i+1}</span>
                  <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600 }}>{q.quartier}</span>
                </div>
                <span style={{ fontSize: "12px", color: S.muted, fontWeight: 700 }}>{q.count} lieux</span>
              </div>
              <ProgressBar value={q.count} max={maxQuartier} color={[S.orange,"#a855f7","#06b6d4","#22c55e","#f5c842"][i]} height={5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// (DashCategories, DashBudget, DashHotels, DashTopActivites, DashUserProfile identiques à l'original)
function DashCategories({ data }) {
  if (!data) return <Spinner />;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const maxVal = entries[0]?.[1] || 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>🗂️ Répartition par catégorie</p>
        {entries.map(([cat, val]) => {
          const color = CAT_COLORS[cat] || "#64748b";
          const pct   = Math.round((val / total) * 100);
          return (
            <div key={cat} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "15px" }}>{CAT_EMOJI[cat] || "📍"}</span>
                  <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600, textTransform: "capitalize" }}>{cat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: S.muted }}>{pct}%</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color, background: `${color}15`, borderRadius: 100, padding: "2px 10px", minWidth: 36, textAlign: "center" }}>{val}</span>
                </div>
              </div>
              <ProgressBar value={val} max={maxVal} color={color} height={7} />
            </div>
          );
        })}
      </div>
      <div style={{ ...S.surface, padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px", alignSelf: "flex-start" }}>🎯 Distribution visuelle</p>
        <DashDonut entries={entries} total={total} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px", justifyContent: "center" }}>
          {entries.slice(0, 6).map(([cat]) => (
            <span key={cat} style={{ fontSize: "11px", fontWeight: 700, borderRadius: 100, padding: "3px 10px", background: `${CAT_COLORS[cat] || "#64748b"}18`, color: CAT_COLORS[cat] || "#64748b", border: `1px solid ${CAT_COLORS[cat] || "#64748b"}30` }}>
              {CAT_EMOJI[cat]} {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashDonut({ entries, total }) {
  const r = 70, cx = 90, cy = 90, stroke = 22;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = entries.slice(0, 7).map(([cat, val]) => {
    const pct = val / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const slice = { cat, val, pct, dash, gap, offset, color: CAT_COLORS[cat] || "#64748b" };
    offset += dash;
    return slice;
  });
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3a5f" strokeWidth={stroke} />
      {slices.map(s => (
        <circle key={s.cat} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset + circumference * 0.25}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={S.ivory} fontSize={22} fontWeight={800}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={S.muted} fontSize={11}>lieux</text>
    </svg>
  );
}

function DashBudget({ data }) {
  if (!data) return <Spinner />;
  const users  = data.users  || {};
  const hotels = data.hotels || {};
  const acts   = data.activites || {};
  const totalU = Object.values(users).reduce((s, v) => s + v, 0) || 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>👤 Budget visiteurs</p>
        {["moyen", "économique", "luxe"].map(b => {
          const val = users[b] || 0; const color = BUDGET_COLORS[b]; const pct = Math.round((val / totalU) * 100);
          return (
            <div key={b} style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <span style={{ fontSize: "14px", color: S.ivory, fontWeight: 700, textTransform: "capitalize" }}>{{ économique:"💚", moyen:"💙", luxe:"💛" }[b]} {b}</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color }}>{pct}%</span>
              </div>
              <ProgressBar value={val} max={totalU} color={color} height={10} />
              <div style={{ fontSize: "11px", color: S.muted, marginTop: "4px", textAlign: "right" }}>{val} visiteurs</div>
            </div>
          );
        })}
        <div style={{ marginTop: "16px", padding: "12px 16px", background: `${S.orange}0a`, border: `1px solid ${S.orange}20`, borderRadius: "12px" }}>
          <div style={{ fontSize: "11px", color: S.muted, marginBottom: "2px" }}>Budget moyen / jour</div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: S.orange }}>{(data.budget_moyen_utilisateur_mad || 1160).toLocaleString()} MAD</div>
        </div>
      </div>
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>🏨 Segment hôtelier</p>
        {["économique", "moyen", "luxe"].map(b => {
          const val = hotels[b] || 0; const color = BUDGET_COLORS[b]; const total = Object.values(hotels).reduce((s, v) => s + v, 0) || 1;
          return (
            <div key={b} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600, textTransform: "capitalize" }}>{b}</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color }}>{val} hôtels</span>
              </div>
              <ProgressBar value={val} max={total} color={color} height={8} />
            </div>
          );
        })}
        <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: "16px", marginTop: "8px" }}>
          <div style={{ fontSize: "11px", color: S.muted, marginBottom: "2px" }}>Total parc hôtelier</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#f5c842" }}>{Object.values(hotels).reduce((s,v)=>s+v,0)} hôtels</div>
        </div>
      </div>
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>🎯 Activités par budget</p>
        {["économique", "moyen", "luxe"].map(b => {
          const val = acts[b] || 0; const color = BUDGET_COLORS[b]; const total = Object.values(acts).reduce((s, v) => s + v, 0) || 1;
          return (
            <div key={b} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600, textTransform: "capitalize" }}>{b}</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color }}>{val} activités</span>
              </div>
              <ProgressBar value={val} max={total} color={color} height={8} />
            </div>
          );
        })}
        <div style={{ marginTop: "16px", padding: "12px 16px", background: "#0d2137", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {[["Économique","< 200 MAD","#22c55e"],["Moyen","200–500 MAD","#3b82f6"],["Luxe","> 500 MAD","#f5c842"]].map(([l,r,c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", color: S.muted }}>{l}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: c }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashHotels({ data }) {
  if (!data) return <Spinner />;
  const { prix, rating_moyen, par_categorie, par_localisation, amenites } = data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "Prix moyen / nuit", value: `${prix?.moyen_mad?.toLocaleString()} MAD`, icon: "💰", color: S.orange },
          { label: "Prix médian",       value: `${prix?.median_mad?.toLocaleString()} MAD`, icon: "📊", color: "#3b82f6" },
          { label: "Note moyenne",      value: `${rating_moyen}/5`, icon: "⭐", color: S.gold },
          { label: "Avec piscine",      value: `${amenites?.pct_avec_piscine}%`, icon: "🏊", color: "#06b6d4" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
        <div style={{ ...S.surface, padding: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>🏷️ Segmentation tarifaire</p>
          {par_categorie?.map(cat => {
            const color = BUDGET_COLORS[cat.categorie] || "#64748b";
            return (
              <div key={cat.categorie} style={{ padding: "16px", marginBottom: "10px", borderRadius: "12px", background: `${color}08`, border: `1px solid ${color}25` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color, textTransform: "capitalize" }}>{{ économique:"💚", moyen:"💙", luxe:"💛" }[cat.categorie]} Segment {cat.categorie}</span>
                  <span style={{ fontSize: "12px", color: S.muted }}>{cat.count} hôtels</span>
                </div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {[{l:"Moy.",v:`${cat.prix_moyen} MAD`},{l:"Min",v:`${cat.prix_min} MAD`},{l:"Max",v:`${cat.prix_max} MAD`},{l:"Note",v:`★ ${cat.rating_moyen}`}].map(({l,v}) => (
                    <div key={l}><div style={{ fontSize: "10px", color: S.muted }}>{l}</div><div style={{ fontSize: "14px", fontWeight: 800, color }}>{v}</div></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ ...S.surface, padding: "22px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>📍 Par localisation</p>
            {par_localisation?.map(loc => (
              <div key={loc.localisation} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "13px", color: S.ivory, textTransform: "capitalize" }}>{loc.localisation}</span>
                  <span style={{ fontSize: "12px", color: S.gold, fontWeight: 700 }}>{loc.prix_moyen} MAD</span>
                </div>
                <ProgressBar value={loc.prix_moyen} max={2000} color={S.gold} height={5} />
              </div>
            ))}
          </div>
          <div style={{ ...S.surface, padding: "22px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>✨ Équipements</p>
            {[{label:"Avec piscine",pct:amenites?.pct_avec_piscine,icon:"🏊",color:"#06b6d4"},{label:"Vue mer",pct:amenites?.pct_avec_vue_mer,icon:"🌊",color:"#3b82f6"}].map(eq => (
              <div key={eq.label} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: S.ivory }}>{eq.icon} {eq.label}</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: eq.color }}>{eq.pct}%</span>
                </div>
                <ProgressBar value={eq.pct} max={100} color={eq.color} height={8} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashTopActivites({ data }) {
  if (!data) return <Spinner />;
  const { top_activities, methode, poids } = data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ ...S.surface, padding: "20px", background: `${S.orange}06`, borderColor: `${S.orange}25` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "22px" }}>🧮</span>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: S.orange, margin: "0 0 4px" }}>Méthode de scoring</p>
            <p style={{ fontSize: "12px", color: S.muted, margin: "0 0 10px" }}>{methode}</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.entries(poids).map(([k, v]) => (
                <span key={k} style={{ fontSize: "11px", fontWeight: 700, background: `${S.orange}15`, color: S.orange, borderRadius: 100, padding: "2px 10px" }}>
                  {k.replace(/_/g," ")} {Math.round(v*100)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: "12px", alignItems: "flex-end" }}>
        {[top_activities[1], top_activities[0], top_activities[2]].filter(Boolean).map((act, i) => {
          const isCenter = i === 1;
          const color = isCenter ? S.orange : ["#94a3b8","#f5c842"][i === 0 ? 1 : 0];
          const medal  = isCenter ? "🥇" : i === 0 ? "🥈" : "🥉";
          return (
            <div key={act.nom} style={{ ...S.surface, padding: "16px 14px", height: isCenter ? "190px" : "150px", display: "flex", flexDirection: "column", justifyContent: "flex-end", borderColor: isCenter ? S.orange : "#1e3a5f", boxShadow: isCenter ? `0 0 28px ${S.orange}25` : "0 4px 16px rgba(0,0,0,0.25)", position: "relative", overflow: "hidden" }}>
              {isCenter && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${S.orange}, ${S.gold})` }} />}
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>{medal}</div>
              <div style={{ fontSize: "11px", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{CAT_EMOJI[act.type] || "🎯"} {act.type}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: S.ivory, lineHeight: 1.3, marginBottom: "8px" }}>{act.nom}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: S.gold }}>★ {act.rating}</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color }}>{act.score_hybride.toFixed(3)}</span>
              </div>
            </div>
          );
        })}
      </div>
      {top_activities.slice(3).map(act => {
        const color = CAT_COLORS[act.type] || "#64748b";
        return (
          <div key={act.nom} style={{ ...S.surface, padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: S.muted, flexShrink: 0 }}>{act.rang}</span>
            <span style={{ fontSize: "18px" }}>{CAT_EMOJI[act.type] || "🎯"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: S.ivory }}>{act.nom}</div>
              <div style={{ fontSize: "11px", color: S.muted, marginTop: "2px" }}>{act.duree} · {act.prix}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: S.gold }}>★ {act.rating}</div>
              <div style={{ fontSize: "11px", color, fontWeight: 700 }}>score {act.score_hybride.toFixed(3)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashUserProfile({ data }) {
  if (!data) return <Spinner />;
  const { profil_type, demographique, preferences, saisons } = data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "Type dominant", value: profil_type.type_voyageur, icon: {couple:"💑",solo:"🧳",famille:"👨‍👩‍👧",groupe:"👥"}[profil_type.type_voyageur]||"👤", color: "#a855f7" },
          { label: "Âge moyen",    value: `${Math.round(profil_type.age_moyen)} ans`, icon: "🎂", color: "#06b6d4" },
          { label: "Budget / jour",value: `${profil_type.budget_moyen_mad?.toLocaleString()} MAD`, icon: "💰", color: S.orange },
          { label: "Durée séjour", value: `${profil_type.duree_sejour_jours?.toFixed(1)} jours`, icon: "📅", color: "#22c55e" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "16px" }}>
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px" }}>🗓️ Saison préférée</p>
          {Object.entries(saisons.distribution || {}).sort((a,b)=>b[1]-a[1]).map(([s,n]) => {
            const total = Object.values(saisons.distribution).reduce((a,b)=>a+b,0); const color = SAISON_COLORS[s]||"#64748b";
            return (
              <div key={s} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600 }}>{SAISON_EMOJI[s]} {s.charAt(0).toUpperCase()+s.slice(1)}</span>
                  <span style={{ fontSize: "12px", color, fontWeight: 700 }}>{Math.round(n/total*100)}%</span>
                </div>
                <ProgressBar value={n} max={total} color={color} height={7} />
              </div>
            );
          })}
        </div>
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px" }}>🌍 Top nationalités</p>
          {Object.entries(demographique.top_nationalites||{}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([nat,n],i) => {
            const colors=[S.orange,"#a855f7","#06b6d4","#22c55e","#f5c842"]; const max=Object.values(demographique.top_nationalites)[0];
            return (
              <div key={nat} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width:18,height:18,borderRadius:"50%",background:colors[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:800,color:"#0d1b2a" }}>{i+1}</span>
                    <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600 }}>{nat}</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: colors[i] }}>{n}</span>
                </div>
                <ProgressBar value={n} max={max} color={colors[i]} height={5} />
              </div>
            );
          })}
        </div>
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>🎯 Intérêts moyens (score 0–10)</p>
          {(preferences.categories||[]).map(c => {
            const color = CAT_COLORS[c.categorie]||"#64748b";
            return (
              <div key={c.categorie} style={{ marginBottom: "11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: S.ivory, fontWeight: 600 }}>{CAT_EMOJI[c.categorie]||"📊"} {c.categorie}</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color }}>{c.score_moyen}</span>
                </div>
                <ProgressBar value={c.score_moyen} max={10} color={color} height={6} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...S.surface, padding: "22px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>💡 Top intérêts déclarés</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {(preferences.top_interets||[]).map((item,i) => {
            const colors=[S.orange,"#a855f7","#06b6d4","#22c55e","#f5c842","#ef4444","#3b82f6","#ec4899"]; const c=colors[i%colors.length];
            return (
              <div key={item.interet} style={{ padding: "8px 16px", borderRadius: 100, background: `${c}12`, border: `1.5px solid ${c}30`, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: c, textTransform: "capitalize" }}>{item.interet.replace(/_/g," ")}</span>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#0d1b2a", background: c, borderRadius: 100, padding: "1px 7px" }}>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const DASH_TABS = [
  { id: "global",     label: "Vue globale",    emoji: "🌍" },
  { id: "categories", label: "Catégories",     emoji: "🗂️" },
  { id: "budget",     label: "Budget",         emoji: "💰" },
  { id: "hotels",     label: "Hôtels",         emoji: "🏨" },
  { id: "activites",  label: "Top activités",  emoji: "🏆" },
  { id: "profil",     label: "Profil visiteur",emoji: "👤" },
];

const PANEL_ENDPOINTS = {
  global:     "/stats/global",
  categories: "/stats/categories",
  budget:     "/stats/budget",
  hotels:     "/stats/hotels",
  activites:  "/stats/top-activities?top=5",
  profil:     "/stats/user-profile",
};

function SectionDashboard() {
  const [activePanel, setActivePanel] = useState("global");
  const [data,        setData]        = useState({});
  const [loading,     setLoading]     = useState({});
  const [errors,      setErrors]      = useState({});
  const [hovered,     setHovered]     = useState(null);

  useEffect(() => {
    if (data[activePanel] || loading[activePanel]) return;
    setLoading(l => ({ ...l, [activePanel]: true }));
    dashFetch(PANEL_ENDPOINTS[activePanel])
      .then(d => setData(prev => ({ ...prev, [activePanel]: d })))
      .catch(e => setErrors(prev => ({ ...prev, [activePanel]: e.message })))
      .finally(() => setLoading(l => ({ ...l, [activePanel]: false })));
  }, [activePanel]);

  return (
    <>
      <style>{`
        @keyframes dashSpin { to { transform: rotate(360deg); } }
        @keyframes dashFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ background: "linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)", borderBottom: "1px solid #1e3a5f", padding: "40px 24px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "8px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>📊 Analytics · Plateforme Touristique</p>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 800, color: S.ivory, margin: 0, lineHeight: 1.1 }}>Dashboard — Tanger</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: S.muted, marginBottom: "2px" }}>Données temps réel</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 100, padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Backend connecté
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2px", marginTop: "24px", overflowX: "auto" }}>
            {DASH_TABS.map(tab => {
              const isActive = activePanel === tab.id;
              return (
                <button key={tab.id} onClick={() => setActivePanel(tab.id)} onMouseEnter={() => setHovered(tab.id)} onMouseLeave={() => setHovered(null)} style={{
                  padding: "10px 18px", cursor: "pointer", whiteSpace: "nowrap",
                  background: isActive ? "#112240" : "none", border: "none",
                  borderBottom: `2.5px solid ${isActive ? S.orange : "transparent"}`,
                  borderRadius: "8px 8px 0 0",
                  color: isActive ? S.ivory : hovered === tab.id ? "#94a3b8" : S.muted,
                  fontSize: "13px", fontWeight: isActive ? 700 : 500, transition: "all 0.18s",
                }}>
                  {tab.emoji} {tab.label}
                  {loading[tab.id] && <span style={{ marginLeft: "6px", display: "inline-block", width: 8, height: 8, borderRadius: "50%", border: `2px solid ${S.orange}`, borderTopColor: "transparent", animation: "dashSpin 0.6s linear infinite" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px 80px", animation: "dashFadeIn 0.35s ease" }} key={activePanel}>
        {errors[activePanel] ? (
          <div style={{ ...S.surface, padding: "32px", textAlign: "center", borderColor: "#ef444440" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
            <p style={{ color: "#ef4444", fontWeight: 700, margin: "0 0 6px" }}>Erreur de chargement</p>
            <p style={{ color: S.muted, fontSize: "12px", margin: 0 }}>{errors[activePanel]}</p>
            <p style={{ color: S.muted, fontSize: "11px", margin: "8px 0 0" }}>Vérifiez que le backend tourne sur <code style={{ color: S.orange }}>localhost:8000</code></p>
          </div>
        ) : loading[activePanel] ? (
          <Spinner />
        ) : (
          <>
            {activePanel === "global"     && <DashGlobal      data={data.global}     />}
            {activePanel === "categories" && <DashCategories  data={data.categories} />}
            {activePanel === "budget"     && <DashBudget      data={data.budget}     />}
            {activePanel === "hotels"     && <DashHotels      data={data.hotels}     />}
            {activePanel === "activites"  && <DashTopActivites data={data.activites} />}
            {activePanel === "profil"     && <DashUserProfile  data={data.profil}    />}
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeTanger({ onBack, onOpenChat }) {
  const [activeTab, setActiveTab] = useState("accueil");

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b2a", color: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <NavbarTanger onBack={onBack} onOpenChat={onOpenChat} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "accueil"        && <SectionAccueil    onOpenChat={onOpenChat} />}
      {activeTab === "recommandation" && <SectionRecom      />}
      {activeTab === "activites"      && <SectionActivites  />}
      {activeTab === "evenements"     && <SectionEvenements />}
      {activeTab === "dashboard"      && <SectionDashboard  />}

      <Footer />
    </div>
  );
}