/**
 * HomeTanger.jsx — VERSION FINALE
 * Avec onglets : Accueil | Recommandation | Activités | Événements | Dashboard
 * Section Recommandation : wizard interactif complet (inline, sans fichiers externes)
 */
import { useState, useEffect, useRef } from "react";
import NavbarTanger from "../components/NavbarTanger";
import Footer       from "../components/Footer";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE API — recommandation
// ─────────────────────────────────────────────────────────────────────────────
const BASE_RECO = "/api/recommandation";

async function recoFetch(path, options = {}) {
  const res = await fetch(`${BASE_RECO}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  return res.json();
}

const recoApi = {
  getQuestions:      (cat)   => recoFetch(`/questions/${cat}`),
  getRecommandations:(body)  => recoFetch("/recommandations", { method: "POST", body: JSON.stringify(body) }),
};

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES LOCALES CATÉGORIES (pas besoin d'appel GET /categories)
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
// STYLES PARTAGÉS (inline, compatibles avec votre thème #0d1b2a / orange)
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
// STEP 1 — CategorySelector
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
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.22s, border-color 0.22s, box-shadow 0.22s",
              transform: hovered === cat.id ? "translateY(-6px)" : "translateY(0)",
              borderColor: hovered === cat.id ? cat.color : "#1e3a5f",
              boxShadow: hovered === cat.id
                ? `0 12px 36px rgba(0,0,0,0.4), 0 0 24px ${cat.color}22`
                : "0 4px 16px rgba(0,0,0,0.25)",
              background: "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent couleur coin */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: cat.color, opacity: hovered === cat.id ? 1 : 0,
              transition: "opacity 0.22s",
            }} />

            <span style={{ fontSize: "2.6rem", display: "block", marginBottom: "14px", lineHeight: 1 }}>
              {cat.emoji}
            </span>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: S.ivory, margin: "0 0 8px" }}>
              {cat.label}
            </h3>
            <p style={{ fontSize: "13px", color: S.muted, lineHeight: 1.5, margin: "0 0 18px" }}>
              {cat.description}
            </p>
            <span style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
              color: cat.color,
              background: `${cat.color}18`,
              borderRadius: "100px", padding: "3px 12px",
            }}>
              {cat.questions} questions
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — QuestionWizard
// ─────────────────────────────────────────────────────────────────────────────
function QuestionWizard({ category, questions, onComplete, onBack }) {
  const [idx,      setIdx]      = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [selected, setSelected] = useState(null);
  const [animKey,  setAnimKey]  = useState(0);

  const current  = questions[idx];
  const total    = questions.length;
  const progress = (idx / total) * 100;
  const isLast   = idx === total - 1;

  function advance(newAnswers) {
    if (isLast) { onComplete(newAnswers); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setAnimKey(k => k + 1);
  }

  function handleNext() {
    if (selected === null && !current.is_optional) return;
    const next = { ...answers };
    if (selected !== null) next[current.field_name] = selected;
    setAnswers(next);
    advance(next);
  }

  function handleSkip() {
    advance({ ...answers });
  }

  function readableLabel(field, val) {
    if (typeof val === "boolean") return val ? "Oui ✅" : "Non ❌";
    const q = questions.find(q => q.field_name === field);
    const opt = q?.options?.find(o => o.value === val);
    return opt ? `${opt.emoji || ""} ${opt.label}` : val;
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <button onClick={onBack} style={{
          background: "none", border: "1px solid #1e3a5f",
          borderRadius: "100px", color: S.muted,
          padding: "7px 16px", fontSize: "13px", cursor: "pointer",
          transition: "border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = S.orange; e.currentTarget.style.color = S.ivory; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = S.muted; }}
        >
          ← Catégories
        </button>
        <span style={{
          fontSize: "13px", fontWeight: 700, color: category.color,
          background: `${category.color}18`, borderRadius: "100px",
          padding: "5px 14px",
        }}>
          {category.emoji} {category.label}
        </span>
      </div>

      {/* Barre de progression */}
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

      {/* Card question */}
      <div key={animKey} style={{
        ...S.surface,
        padding: "32px 28px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "recoSlideIn 0.3s ease",
      }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>
          Étape {idx + 1}
        </p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: S.ivory, margin: "0 0 6px", lineHeight: 1.25 }}>
          {current.question}
        </h2>
        {current.help_text && (
          <p style={{ fontSize: "13px", color: S.muted, margin: "0 0 24px" }}>{current.help_text}</p>
        )}
        {!current.help_text && <div style={{ marginBottom: "24px" }} />}

        {/* Options */}
        {current.type === "boolean" ? (
          <div style={{ display: "flex", gap: "14px" }}>
            {[{ v: true, label: "✅ Oui" }, { v: false, label: "❌ Non" }].map(({ v, label }) => (
              <button key={String(v)} onClick={() => setSelected(v)} style={{
                flex: 1, padding: "16px", borderRadius: "12px", cursor: "pointer",
                border: `1.5px solid ${selected === v ? S.orange : "#1e3a5f"}`,
                background: selected === v ? `${S.orange}18` : "#0d2137",
                color: selected === v ? S.ivory : S.muted,
                fontSize: "15px", fontWeight: 700,
                transition: "all 0.2s",
                boxShadow: selected === v ? `0 0 16px ${S.orange}30` : "none",
              }}>
                {label}
              </button>
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
                {opt.description && (
                  <span style={{ fontSize: "10px", opacity: 0.65, display: "block", marginTop: "3px" }}>{opt.description}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1e3a5f",
        }}>
          {current.is_optional ? (
            <button onClick={handleSkip} style={{
              background: "none", border: "none", color: S.muted, cursor: "pointer",
              fontSize: "13px", textDecoration: "underline", textUnderlineOffset: "3px",
            }}>
              Passer
            </button>
          ) : <span />}

          <button onClick={handleNext} disabled={selected === null && !current.is_optional} style={{
            background: selected !== null || current.is_optional
              ? `linear-gradient(135deg, ${S.orange}, #ea580c)`
              : "#1e3a5f",
            border: "none", borderRadius: "100px", color: "#fff",
            padding: "11px 26px", fontSize: "14px", fontWeight: 700,
            cursor: selected !== null || current.is_optional ? "pointer" : "not-allowed",
            opacity: selected === null && !current.is_optional ? 0.45 : 1,
            transition: "all 0.22s",
            boxShadow: selected !== null ? `0 6px 20px ${S.orange}40` : "none",
          }}
            onMouseEnter={e => { if (selected !== null || current.is_optional) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {isLast ? "✨ Voir mes recommandations" : "Suivant →"}
          </button>
        </div>
      </div>

      {/* Récap réponses précédentes */}
      {Object.keys(answers).length > 0 && (
        <div style={{
          marginTop: "18px", padding: "14px 18px",
          background: `${S.orange}0a`, border: `1px solid ${S.orange}25`,
          borderRadius: "12px",
        }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>
            Vos choix
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            {Object.entries(answers).map(([f, v]) => (
              <span key={f} style={{
                fontSize: "12px", fontWeight: 500, color: S.ivory,
                background: "#1e3a5f", borderRadius: "100px", padding: "3px 11px",
              }}>
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
// STEP 3 — ResultCards
// ─────────────────────────────────────────────────────────────────────────────
const PREF_MAP = {
  budget:        { icon: "💰", labels: { economique: "Économique", moyen: "Moyen", luxe: "Luxe" } },
  type_sejour:   { icon: "👥", labels: { couple: "Couple", famille: "Famille", solo: "Solo", amis: "Amis" } },
  cuisine:       { icon: "🍴", labels: { marocaine: "Marocaine", internationale: "Internationale", cafe: "Café" } },
  ambiance:      { icon: "✨", labels: { calme: "Calme", romantique: "Romantique", moderne: "Moderne" } },
  type_plage:    { icon: "🌊", labels: { calme: "Calme", animee: "Animée", randonnee: "Randonnée", coucher_soleil: "Coucher de soleil" } },
  type_activite: { icon: "🎯", labels: { aventure: "Aventure", historique: "Historique", famille: "Famille", culture: "Culture" } },
  distance:      { icon: "🛣️", labels: { proche: "Proche", moyen: "Moyen", loin: "Loin" } },
  localisation:  { icon: "📍" },
};

function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function ResultCard({ item, rank }) {
  const [hov, setHov] = useState(false);
  const isTop   = rank === 0;
  const score   = item._score ?? 0;
  const pct     = Math.round(score * 100);
  const reasons = item._match_reasons || [];
  const isFallback = item._is_exact_match === false;

  const tags = [
    item.budget        && cap(item.budget),
    item.localisation  && `📍 ${cap(item.localisation)}`,
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
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#112240",
        borderRadius: "16px",
        overflow: "hidden",
        border: `1.5px solid ${isTop ? S.orange : hov ? "#2e5a8a" : "#1e3a5f"}`,
        boxShadow: isTop
          ? `0 0 24px ${S.orange}28, 0 8px 32px rgba(0,0,0,0.4)`
          : hov ? "0 12px 36px rgba(0,0,0,0.45)" : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "transform 0.22s, box-shadow 0.22s, border-color 0.22s",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {isTop && (
        <div style={{
          position: "absolute", top: "12px", left: "12px", zIndex: 2,
          background: S.orange, color: "#fff",
          fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "3px 10px", borderRadius: "100px",
        }}>
          ⭐ Meilleur choix
        </div>
      )}
      {isFallback && (
        <div style={{
          position: "absolute", top: "12px", right: "12px", zIndex: 2,
          background: "rgba(255,255,255,0.07)", color: S.muted,
          fontSize: "10px", padding: "3px 8px", borderRadius: "100px",
        }}>
          Suggestion
        </div>
      )}

      {/* Placeholder image */}
      <div style={{
        height: "160px",
        background: item.image
          ? `url(${item.image}) center/cover no-repeat, #0d2137`
          : "linear-gradient(135deg, #0d2137, #1a3050)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "3rem",
        position: "relative",
      }}>
        {!item.image && <span>🏙️</span>}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
          background: "linear-gradient(to top, #112240, transparent)",
        }} />
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: S.ivory, margin: 0, lineHeight: 1.2 }}>
            {item.nom}
          </h3>
          {item.rating && (
            <span style={{ color: S.gold, fontWeight: 700, fontSize: "13px", flexShrink: 0, display: "flex", alignItems: "center", gap: "3px" }}>
              ★ {Number(item.rating).toFixed(1)}
            </span>
          )}
        </div>

        {item.description && (
          <p style={{
            fontSize: "12px", color: S.muted, lineHeight: 1.55, margin: "0 0 12px",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {item.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                fontSize: "10px", fontWeight: 500, color: S.muted,
                background: "#0d2137", borderRadius: "100px", padding: "2px 9px",
              }}>{t}</span>
            ))}
            {item.piscine && <span style={{ fontSize: "10px", fontWeight: 500, color: S.muted, background: "#0d2137", borderRadius: "100px", padding: "2px 9px" }}>🏊 Piscine</span>}
            {item.vue_mer && <span style={{ fontSize: "10px", fontWeight: 500, color: S.muted, background: "#0d2137", borderRadius: "100px", padding: "2px 9px" }}>🌊 Vue mer</span>}
          </div>
        )}

        {/* Barre score */}
        {score > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: S.muted, marginBottom: "4px" }}>
              <span>Pertinence</span><span>{pct}%</span>
            </div>
            <div style={{ height: "3px", background: "#1e3a5f", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: `linear-gradient(90deg, ${S.orange}, ${S.gold})`,
                borderRadius: "100px", transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}

        {/* Match reasons */}
        {reasons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "14px" }}>
            {reasons.map((r, i) => (
              <span key={i} style={{
                fontSize: "10px", fontWeight: 600, color: "#4ade80",
                background: "rgba(74,222,128,0.08)", borderRadius: "100px", padding: "2px 8px",
              }}>{r}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "12px", borderTop: "1px solid #1e3a5f",
        }}>
          <div>
            {prix && <>
              <span style={{ fontSize: "10px", color: S.muted, display: "block" }}>À partir de</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: S.ivory }}>{prix}</span>
            </>}
            {!prix && item.adresse && (
              <span style={{ fontSize: "11px", color: S.muted }}>📍 {item.adresse}</span>
            )}
          </div>
          <button style={{
            background: `linear-gradient(135deg, ${S.orange}, #ea580c)`,
            border: "none", borderRadius: "100px", color: "#fff",
            fontSize: "12px", fontWeight: 700, padding: "7px 16px",
            cursor: "pointer", transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
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
      {/* Header résultats */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: "14px", marginBottom: "28px",
      }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.7rem", fontWeight: 700, color: S.ivory, margin: "0 0 6px" }}>
            {category.emoji} {items.length} {category.label} recommandé{items.length > 1 ? "s" : ""}
          </h2>
          <p style={{ fontSize: "13px", color: S.muted, margin: 0 }}>
            {items.length > 0 ? "Triés par pertinence selon vos préférences" : "Aucun résultat — essayez d'élargir vos critères"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onRetry} style={{
            background: "none", border: "1px solid #1e3a5f", borderRadius: "100px",
            color: S.muted, fontSize: "13px", fontWeight: 600, padding: "9px 18px", cursor: "pointer",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = S.orange; e.currentTarget.style.color = S.orange; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = S.muted; }}
          >
            ✏️ Modifier
          </button>
          <button onClick={onReset} style={{
            background: `linear-gradient(135deg, ${S.orange}, #ea580c)`,
            border: "none", borderRadius: "100px", color: "#fff",
            fontSize: "13px", fontWeight: 700, padding: "9px 20px", cursor: "pointer",
          }}>
            🔄 Recommencer
          </button>
        </div>
      </div>

      {/* Chips préférences */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "28px" }}>
        {Object.entries(preferences).map(([key, val]) => {
          const def = PREF_MAP[key];
          if (!def) return null;
          const icon  = def.icon || "";
          const label = typeof val === "boolean"
            ? `${icon} ${key}: ${val ? "Oui" : "Non"}`
            : `${icon} ${def.labels?.[val] || cap(val)}`;
          return (
            <span key={key} style={{
              fontSize: "12px", fontWeight: 600, color: S.orange,
              background: `${S.orange}12`, border: `1px solid ${S.orange}25`,
              borderRadius: "100px", padding: "4px 12px",
            }}>
              {label}
            </span>
          );
        })}
      </div>

      {/* Grille */}
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: S.muted }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "14px" }}>🔍</div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", color: S.ivory, margin: "0 0 8px" }}>
            Aucun résultat
          </h3>
          <p style={{ fontSize: "14px" }}>Essayez de modifier vos préférences.</p>
          <button onClick={onRetry} style={{
            marginTop: "20px", background: `linear-gradient(135deg, ${S.orange}, #ea580c)`,
            border: "none", borderRadius: "100px", color: "#fff",
            padding: "11px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
          }}>
            Réessayer
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: "20px",
        }}>
          {items.map((item, i) => (
            <ResultCard key={item.id || item.nom || i} item={item} rank={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RECOMMANDATION — wizard complet inline
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
      {/* CSS animation inline */}
      <style>{`
        @keyframes recoSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Mini hero section recommandation */}
      <div style={{
        background: "linear-gradient(160deg, #0f2040 0%, #0a1628 100%)",
        borderBottom: "1px solid #1e3a5f",
        padding: "52px 24px 44px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(249,115,22,0.07) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }} ref={topRef}>
          <span style={{
            display: "inline-block", fontSize: "12px", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: S.orange, background: `${S.orange}15`,
            border: `1px solid ${S.orange}30`, borderRadius: "100px",
            padding: "5px 16px", marginBottom: "20px",
          }}>
            🤖 Recommandation IA
          </span>

          <h1 style={{
            fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700, color: S.ivory, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Votre séjour{" "}
            <em style={{ fontStyle: "italic", color: S.orange }}>sur mesure</em>
          </h1>
          <p style={{ color: S.muted, fontSize: "14px", maxWidth: "480px", margin: "0 auto 32px" }}>
            Répondez à quelques questions — notre IA trouve les meilleures adresses de Tanger pour vous.
          </p>

          {/* Fil d'Ariane */}
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
            {[
              { n: 1, label: "Catégorie", stepKey: STEP_RECO.CATEGORY },
              { n: 2, label: "Questions", stepKey: STEP_RECO.QUESTIONS },
              { n: 3, label: "Résultats", stepKey: STEP_RECO.RESULTS },
            ].map((s, i) => {
              const isActive = step === s.stepKey;
              const isDone   = (
                (s.stepKey === STEP_RECO.CATEGORY  && step !== STEP_RECO.CATEGORY) ||
                (s.stepKey === STEP_RECO.QUESTIONS  && step === STEP_RECO.RESULTS)
              );
              return (
                <span key={s.n} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && (
                    <span style={{ width: "40px", height: "1px", background: "#1e3a5f", display: "block" }} />
                  )}
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", padding: "0 10px" }}>
                    <span style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700,
                      background: isActive ? S.orange : isDone ? `${S.orange}20` : "#1e3a5f",
                      color: isActive ? "#fff" : isDone ? S.orange : S.muted,
                      border: `1.5px solid ${isActive || isDone ? S.orange : "#1e3a5f"}`,
                      boxShadow: isActive ? `0 0 14px ${S.orange}50` : "none",
                      transition: "all 0.3s",
                    }}>
                      {isDone ? "✓" : s.n}
                    </span>
                    <span style={{ fontSize: "10px", color: isActive ? S.ivory : S.muted, fontWeight: isActive ? 600 : 400 }}>
                      {s.label}
                    </span>
                  </span>
                </span>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Erreur */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)",
            borderRadius: "10px", padding: "13px 18px",
            color: "#fca5a5", fontSize: "13px", marginBottom: "24px",
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{
              background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: "15px",
            }}>✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && <RecoLoader />}

        {/* Étapes */}
        {!loading && step === STEP_RECO.CATEGORY && (
          <CategorySelector onSelect={handleCategorySelect} />
        )}
        {!loading && step === STEP_RECO.QUESTIONS && (
          <QuestionWizard
            category={category}
            questions={questions}
            onComplete={handleWizardComplete}
            onBack={handleReset}
          />
        )}
        {!loading && step === STEP_RECO.RESULTS && results && (
          <ResultCards
            results={results}
            category={category}
            preferences={answers}
            onReset={handleReset}
            onRetry={() => setStep(STEP_RECO.QUESTIONS)}
          />
        )}
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
      <div style={{
        width: "56px", height: "56px",
        border: `3px solid ${S.orange}30`,
        borderTopColor: S.orange,
        borderRadius: "50%",
        animation: "recoSpin 0.85s linear infinite",
      }} />
      <style>{`@keyframes recoSpin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: S.muted, fontSize: "13px", fontWeight: 300 }}>{msgs[idx]}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES LIEUX
// ─────────────────────────────────────────────────────────────────────────────
const LIEUX = [
  { id: "kasbah",          nom: "Kasbah de Tanger",       categorie: "Patrimoine", note: 4.8, badge: "Incontournable",
    imageUrl: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600",
    description: "Forteresse historique dominant la mer, la Kasbah abrite le musée des Arts marocains et des jardins andalous secrets." },
  { id: "medina",          nom: "Médina de Tanger",        categorie: "Culture",    note: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1548018560-c7196548aba4?w=600",
    description: "Labyrinthe de ruelles animées, de souks colorés et de maisons blanches aux portes bleues chargées d'histoire." },
  { id: "cap-spartel",     nom: "Cap Spartel",             categorie: "Nature",     note: 4.9, badge: "Vue imprenable",
    imageUrl: "https://images.unsplash.com/photo-1553603227-2358aabe821e?w=600",
    description: "Point de rencontre mythique entre l'Atlantique et la Méditerranée, avec son phare emblématique." },
  { id: "grottes-hercule", nom: "Grottes d'Hercule",       categorie: "Nature",     note: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=600",
    description: "Cavernes mystérieuses creusées par la mer et l'homme depuis des millénaires, ouvertes sur l'Atlantique." },
  { id: "plage-malabata",  nom: "Plage de Malabata",       categorie: "Plage",      note: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    description: "Grande plage dorée en croissant avec vue sur le détroit de Gibraltar et les côtes espagnoles." },
  { id: "marshan",         nom: "Quartier Marshan",        categorie: "Promenade",  note: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    description: "Quartier résidentiel calme offrant des panoramas à 180° sur le détroit, idéal au coucher du soleil." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sections des autres onglets (inchangées)
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
        background: `url(${lieu.imageUrl}) center/cover no-repeat, #1e3a5f`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "12px", left: "12px",
          background: "rgba(13,27,42,0.85)", color: "#94a3b8",
          borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 600,
        }}>{lieu.categorie}</div>
        {lieu.badge && (
          <div style={{
            position: "absolute", top: "12px", right: "12px",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700,
          }}>{lieu.badge}</div>
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
  return (
    <>
      <div style={{
        height: "380px",
        background: `linear-gradient(180deg, rgba(13,27,42,0.5) 0%, rgba(13,27,42,0.95) 100%),
                     url(https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1400) center/cover no-repeat`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 24px",
      }}>
        <div style={{
          background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: "20px", padding: "4px 16px",
          fontSize: "12px", color: "#f97316", fontWeight: 600, marginBottom: "16px",
        }}>🤖 Assistance IA disponible</div>
        <h1 style={{ fontSize: "42px", fontWeight: 900, margin: "0 0 12px", color: "#f1f5f9" }}>
          Découvrez Tanger 🇲🇦
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "17px", margin: "0 0 28px", maxWidth: "500px" }}>
          Porte de l'Afrique, là où la Méditerranée rencontre l'Atlantique
        </p>
        <div style={{ display: "flex", gap: "40px" }}>
          {[{ n: "626", label: "lieux indexés" }, { n: "4", label: "agents IA" }, { n: "11", label: "catégories" }].map((s, i) => (
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {LIEUX.map(lieu => <LieuCard key={lieu.id} lieu={lieu} onExplore={onOpenChat} />)}
        </div>

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
// DONNÉES ACTIVITÉS & ÉVÉNEMENTS
// ─────────────────────────────────────────────────────────────────────────────
const ACTIVITES_DATA = [
  { nom: "Musée Ibn Battouta", prix: "30 DH", rating: 4.6, type: "historique", budget: "économique", duree: "Quelques heures", localisation: "centre-ville", image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80", description: "Musée dédié au célèbre explorateur tangérois Ibn Battouta, retraçant ses voyages à travers le monde musulman au 14ème siècle." },
  { nom: "Cinémathèque de Tanger", prix: "40 DH", rating: 4.7, type: "culture", budget: "économique", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80", description: "Espace culturel fondé par le cinéaste Yto Barrada dans l'ancien ciné-club Rif, programmant des films d'auteur et des expositions d'art contemporain." },
  { nom: "Grand Socco et Petit Socco", prix: "Gratuit", rating: 4.5, type: "historique", budget: "économique", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80", description: "Places emblématiques de la vie tangéroise, témoins de l'âge d'or de Tanger internationale." },
  { nom: "Croisière vers Tarifa", prix: "600 DH", rating: 4.5, type: "aventure", budget: "luxe", duree: "Journée complète", localisation: "centre-ville", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", description: "Traversée en ferry rapide vers l'Espagne pour une journée à Tarifa, capitale européenne du kite-surf." },
  { nom: "Excursion à Chefchaouen", prix: "350 DH", rating: 4.8, type: "aventure", budget: "moyen", duree: "Journée complète", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80", description: "Excursion d'une journée vers la célèbre ville bleue de Chefchaouen dans le Rif, à deux heures de route." },
  { nom: "Promenade sur la Corniche", prix: "Gratuit", rating: 4.4, type: "famille", budget: "économique", duree: "Quelques heures", localisation: "centre-ville", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", description: "Belle promenade balnéaire longeant la côte ouest de Tanger, reliant le centre-ville au Cap Spartel." },
  { nom: "Tour en calèche de la médina", prix: "100 DH", rating: 4.2, type: "famille", budget: "économique", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80", description: "Balade traditionnelle en calèche à cheval à travers les rues de la médina et le long de la corniche." },
  { nom: "Atelier de cuisine marocaine", prix: "300 DH", rating: 4.7, type: "culture", budget: "moyen", duree: "Demi-journée", localisation: "médina", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80", description: "Cours de cuisine interactif chez l'habitant pour apprendre à préparer tajines, couscous et pastilla." },
  { nom: "Plongée sous-marine", prix: "500 DH", rating: 4.5, type: "aventure", budget: "luxe", duree: "Demi-journée", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", description: "Session de plongée sous-marine dans les eaux cristallines du détroit de Gibraltar, encadrée par des moniteurs certifiés." },
  { nom: "Kitesurf à Dalia", prix: "450 DH", rating: 4.6, type: "aventure", budget: "luxe", duree: "Demi-journée", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80", description: "Cours de kitesurf sur la plage de Dalia, spot réputé pour ses vents réguliers et ses conditions idéales." },
  { nom: "Musée archéologique de Tanger", prix: "20 DH", rating: 4.3, type: "historique", budget: "économique", duree: "Quelques heures", localisation: "centre-ville", image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80", description: "Musée abritant des collections archéologiques allant de la préhistoire à l'époque islamique." },
  { nom: "Hammam traditionnel", prix: "150 DH", rating: 4.8, type: "famille", budget: "moyen", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80", description: "Expérience authentique de hammam marocain dans un établissement historique de la médina." },
  { nom: "Galerie d'art contemporain", prix: "Gratuit", rating: 4.2, type: "culture", budget: "économique", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80", description: "Espace d'exposition dédié à l'art contemporain marocain et international." },
  { nom: "Surf à Achakar", prix: "300 DH", rating: 4.4, type: "aventure", budget: "moyen", duree: "Demi-journée", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3029?w=800&q=80", description: "Leçon de surf sur les vagues de la plage d'Achakar, adaptée aux débutants comme aux surfeurs confirmés." },
  { nom: "Soirée de musique gnawa", prix: "200 DH", rating: 4.6, type: "culture", budget: "moyen", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", description: "Soirée immersive dans un riad de la médina pour découvrir la musique gnawa, patrimoine culturel immatériel de l'UNESCO." },
  { nom: "VTT dans les collines", prix: "350 DH", rating: 4.5, type: "aventure", budget: "moyen", duree: "Demi-journée", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80", description: "Balade en VTT à travers les collines et les sentiers forestiers autour de Tanger, avec des vues panoramiques." },
  { nom: "Kayak de mer", prix: "250 DH", rating: 4.4, type: "aventure", budget: "moyen", duree: "Demi-journée", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1472745433479-4556f22e32c2?w=800&q=80", description: "Sortie en kayak de mer le long de la côte rocheuse de Tanger, avec arrêts dans des criques cachées." },
  { nom: "Visite du Palais du Méchouar", prix: "40 DH", rating: 4.5, type: "historique", budget: "économique", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80", description: "Ancien palais royal situé dans l'enceinte de la Kasbah, abritant un musée des arts et traditions." },
  { nom: "Excursion Parc National d'Al Hoceima", prix: "500 DH", rating: 4.7, type: "aventure", budget: "luxe", duree: "Journée complète", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", description: "Randonnée dans les montagnes du Rif, plages sauvages et observation de la faune marine." },
  { nom: "Marché aux puces de la médina", prix: "Gratuit", rating: 4.1, type: "culture", budget: "économique", duree: "Quelques heures", localisation: "médina", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80", description: "Marché animé où se mêlent antiquités, artisanat, vêtements et bibelots de toutes sortes." },
  { nom: "Visite Tanger Med", prix: "Gratuit", rating: 4.0, type: "culture", budget: "économique", duree: "Demi-journée", localisation: "extérieurs", image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80", description: "Découverte du plus grand port d'Afrique, hub maritime reliant l'Europe et l'Afrique." },
];

const EVENTS_DATA = [
  { id: "fete_musique", title: "Fête de la Musique - Tanger 2026", date: "Du 21 au 26 Juin 2026", location: "Palais des Arts, Tanger", category: "Musique", image_url: "https://images.unsplash.com/photo-1777290734934-1d6fd526f016?w=1200&q=80&fit=crop", description: "Concerts gratuits, jams sessions et performances live animeront la ville du Détroit dans une ambiance festive et conviviale." },
  { id: "expo_back_to_morocco", title: "Exposition « Back to Morocco »", date: "Du 17 Juin au 31 Août 2026", location: "Musée de la Kasbah, Tanger", category: "Culture", image_url: "https://images.unsplash.com/photo-1778339098347-d2c013164b3a?w=1200&q=80&fit=crop", description: "Exposition photographique exceptionnelle retraçant les premiers temps de la photographie au Maroc." },
  { id: "festival_plages", title: "Festival des Plages Maroc Telecom", date: "Du 15 Juillet au 21 Août 2026", location: "Corniche de Tanger", category: "Musique", image_url: "https://images.unsplash.com/photo-1759250451085-cd57dfa49b5c?w=1200&q=80&fit=crop", description: "Le plus grand festival gratuit du Maroc investit les plages de Tanger pour plusieurs semaines de concerts live en plein air." },
  { id: "salon_livre", title: "Salon Régional du Livre", date: "Juillet 2026", location: "Centre Culturel de Tanger", category: "Culture", image_url: "https://images.unsplash.com/photo-1758839448242-1d4d6035e210?w=1200&q=80&fit=crop", description: "Éditeurs, auteurs et lecteurs se retrouvent pour des rencontres littéraires, des dédicaces et des tables rondes." },
  { id: "tanjazz", title: "Tanjazz - 23e Festival International de Jazz", date: "Du 18 au 20 Septembre 2026", location: "Palais des Institutions Italiennes", category: "Musique", image_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80&fit=crop", description: "Tanjazz revient pour sa 23e édition — trois jours de concerts, de jam sessions et de rencontres musicales." },
  { id: "tiff", title: "Tangier International Film Festival - 15e édition", date: "Du 7 au 10 Octobre 2026", location: "Cinémas et centres culturels", category: "Cinéma", image_url: "https://images.unsplash.com/photo-1762215609231-538f04f78d75?w=1200&q=80&fit=crop", description: "Compétition internationale de courts et longs métrages, projections en plein air et masterclasses." },
  { id: "fnf", title: "26e Festival National du Film", date: "Du 23 au 31 Octobre 2026", location: "Palais des Congrès, Tanger", category: "Cinéma", image_url: "https://images.unsplash.com/photo-1702890764798-eda71e941da1?w=1200&q=80&fit=crop", description: "Neuf jours de compétition, de projections et de débats qui célèbrent la production cinématographique marocaine." },
  { id: "marathon", title: "Marathon International de Tanger 2026", date: "Dimanche 15 Novembre 2026", location: "Tanja Marina Bay", category: "Sport", image_url: "https://images.unsplash.com/photo-1771166446975-2e9e9a9cd3d0?w=1200&q=80&fit=crop", description: "Marathon 42K, semi-marathon 21K et course 10K le long du détroit de Gibraltar." },
  { id: "bachikh", title: "12e Festival Bachikh - Nouvel An Amazigh", date: "Du 12 au 13 Janvier 2027", location: "Tanger (lieux culturels)", category: "Culture", image_url: "https://images.unsplash.com/photo-1757947513279-217814eb998d?w=1200&q=80&fit=crop", description: "Concerts de musique amazighe, spectacles de danse, défilés traditionnels et gastronomie berbère." },
  { id: "latin_festival", title: "9e Tangier International Latin Festival", date: "Janvier 2027", location: "Hôtel Kenzi Solazur, Tanger", category: "Culture", image_url: "https://images.unsplash.com/photo-1568805647632-69f6deec1547?w=1200&q=80&fit=crop", description: "Cinq jours de danse latine avec plus de 1500 danseurs internationaux — Salsa, Bachata et Kizomba." },
];

// ── Type → couleur & emoji
const TYPE_CONFIG = {
  aventure:   { color: "#f97316", emoji: "🏄", label: "Aventure" },
  culture:    { color: "#06b6d4", emoji: "🎨", label: "Culture" },
  historique: { color: "#a855f7", emoji: "🏛️", label: "Historique" },
  famille:    { color: "#10b981", emoji: "👨‍👩‍👧", label: "Famille" },
};
const CAT_EVENT_CONFIG = {
  Musique:  { color: "#f97316", emoji: "🎵" },
  Culture:  { color: "#06b6d4", emoji: "🎨" },
  Cinéma:   { color: "#a855f7", emoji: "🎬" },
  Sport:    { color: "#10b981", emoji: "🏃" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ACTIVITÉS
// ─────────────────────────────────────────────────────────────────────────────
function SectionActivites() {
  const [filter, setFilter]   = useState("tous");
  const [budget, setBudget]   = useState("tous");
  const [search, setSearch]   = useState("");
  const [hovered, setHovered] = useState(null);

  const types   = ["tous", "aventure", "culture", "historique", "famille"];
  const budgets = ["tous", "économique", "moyen", "luxe"];

  const filtered = ACTIVITES_DATA.filter(a => {
    const matchType   = filter === "tous" || a.type === filter;
    const matchBudget = budget === "tous" || a.budget === budget;
    const matchSearch = !search || a.nom.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchBudget && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg, #0f2040 0%, #0a1628 100%)",
        borderBottom: "1px solid #1e3a5f",
        padding: "52px 24px 44px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(168,85,247,0.08) 0%, transparent 70%)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#a855f7", background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.3)", borderRadius: "100px", padding: "5px 16px", marginBottom: "18px",
          }}>🎭 Activités</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" }}>
            Que faire à <em style={{ fontStyle: "italic", color: "#a855f7" }}>Tanger ?</em>
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 auto 28px", maxWidth: "480px" }}>
            {ACTIVITES_DATA.length} activités sélectionnées — aventure, culture, histoire, famille
          </p>
          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px" }}>{v.emoji}</div>
                <div style={{ fontSize: "12px", color: v.color, fontWeight: 700, marginTop: "4px" }}>
                  {ACTIVITES_DATA.filter(a => a.type === k).length} {v.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Barre de recherche + filtres */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#64748b" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une activité…"
              style={{
                width: "100%", padding: "10px 14px 10px 38px", boxSizing: "border-box",
                background: "#112240", border: "1.5px solid #1e3a5f", borderRadius: "10px",
                color: "#f1f5f9", fontSize: "14px", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#a855f7"}
              onBlur={e => e.target.style.borderColor = "#1e3a5f"}
            />
          </div>

          {/* Type pills */}
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {types.map(t => {
              const cfg = TYPE_CONFIG[t];
              const isActive = filter === t;
              return (
                <button key={t} onClick={() => setFilter(t)} style={{
                  padding: "7px 16px", borderRadius: "100px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                  border: `1.5px solid ${isActive ? (cfg?.color || "#f97316") : "#1e3a5f"}`,
                  background: isActive ? `${cfg?.color || "#f97316"}18` : "none",
                  color: isActive ? (cfg?.color || "#f97316") : "#64748b",
                  transition: "all 0.2s",
                }}>
                  {cfg ? `${cfg.emoji} ${cfg.label}` : "Tous"}
                </button>
              );
            })}
          </div>

          {/* Budget pills */}
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {budgets.map(b => {
              const isActive = budget === b;
              return (
                <button key={b} onClick={() => setBudget(b)} style={{
                  padding: "7px 14px", borderRadius: "100px", cursor: "pointer", fontSize: "12px", fontWeight: 600,
                  border: `1.5px solid ${isActive ? "#f5c842" : "#1e3a5f"}`,
                  background: isActive ? "rgba(245,200,66,0.12)" : "none",
                  color: isActive ? "#f5c842" : "#64748b",
                  transition: "all 0.2s",
                }}>
                  {b === "tous" ? "💰 Tous budgets" : b === "économique" ? "💚 Éco" : b === "moyen" ? "🟡 Moyen" : "💎 Luxe"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compteur */}
        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
          {filtered.length} activité{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Grille */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filtered.map((act, i) => {
            const cfg = TYPE_CONFIG[act.type] || { color: "#f97316", emoji: "🎯" };
            const isHov = hovered === i;
            return (
              <div key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#112240", borderRadius: "16px", overflow: "hidden",
                  border: `1.5px solid ${isHov ? cfg.color : "#1e3a5f"}`,
                  boxShadow: isHov ? `0 12px 36px rgba(0,0,0,0.45), 0 0 20px ${cfg.color}18` : "0 4px 16px rgba(0,0,0,0.3)",
                  transform: isHov ? "translateY(-5px)" : "translateY(0)",
                  transition: "all 0.22s",
                }}
              >
                {/* Image */}
                <div style={{
                  height: "180px",
                  background: `url(${act.image}) center/cover no-repeat, #0d2137`,
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #112240 0%, transparent 50%)" }} />
                  <span style={{
                    position: "absolute", top: "12px", left: "12px",
                    background: `${cfg.color}22`, border: `1px solid ${cfg.color}60`,
                    color: cfg.color, fontSize: "11px", fontWeight: 700,
                    padding: "3px 10px", borderRadius: "100px",
                  }}>
                    {cfg.emoji} {cfg.label}
                  </span>
                  <span style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "rgba(13,27,42,0.85)", color: "#f5c842",
                    fontSize: "12px", fontWeight: 700, padding: "3px 9px", borderRadius: "100px",
                  }}>
                    ★ {act.rating}
                  </span>
                </div>

                <div style={{ padding: "16px 18px 18px" }}>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>
                    {act.nom}
                  </h3>
                  <p style={{
                    fontSize: "12px", color: "#64748b", lineHeight: 1.55, margin: "0 0 14px",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {act.description}
                  </p>

                  {/* Meta */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                    {[
                      { icon: "📍", val: act.localisation },
                      { icon: "⏱️", val: act.duree },
                      { icon: "💰", val: act.budget },
                    ].map((m, j) => (
                      <span key={j} style={{
                        fontSize: "10px", fontWeight: 500, color: "#64748b",
                        background: "#0d2137", borderRadius: "100px", padding: "3px 9px",
                      }}>
                        {m.icon} {m.val}
                      </span>
                    ))}
                  </div>

                  {/* Footer prix + CTA */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #1e3a5f" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: act.prix === "Gratuit" ? "#4ade80" : "#f1f5f9" }}>
                      {act.prix}
                    </span>
                    <button style={{
                      background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                      border: "none", borderRadius: "100px", color: "#fff",
                      fontSize: "12px", fontWeight: 700, padding: "7px 16px", cursor: "pointer",
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
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
            <p>Aucune activité trouvée — essayez d'autres filtres.</p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ÉVÉNEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function SectionEvenements() {
  const [filter, setFilter]   = useState("tous");
  const [hovered, setHovered] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const cats = ["tous", "Musique", "Culture", "Cinéma", "Sport"];

  const filtered = EVENTS_DATA.filter(e =>
    filter === "tous" || e.category === filter
  );

  // Prochain événement (featured)
  const featured = EVENTS_DATA[0];

  return (
    <>
      {/* Hero avec l'événement vedette */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(180deg, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.95) 100%), url(${featured.image_url}) center/cover no-repeat`,
        padding: "80px 24px 60px",
        textAlign: "center",
      }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" }}>
          <span style={{
            display: "inline-block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#f97316", background: "rgba(249,115,22,0.15)",
            border: "1px solid rgba(249,115,22,0.3)", borderRadius: "100px", padding: "5px 16px", marginBottom: "18px",
          }}>📅 Agenda 2026–2027</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" }}>
            Événements à <em style={{ fontStyle: "italic", color: "#f97316" }}>Tanger</em>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 auto 28px", maxWidth: "500px" }}>
            {EVENTS_DATA.length} événements à venir — concerts, festivals, culture et sport
          </p>

          {/* Stats catégories */}
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
            {Object.entries(CAT_EVENT_CONFIG).map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px" }}>{v.emoji}</div>
                <div style={{ fontSize: "12px", color: v.color, fontWeight: 700, marginTop: "4px" }}>
                  {EVENTS_DATA.filter(e => e.category === k).length} {k}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Filtres catégorie */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
          {cats.map(c => {
            const cfg = CAT_EVENT_CONFIG[c];
            const isActive = filter === c;
            return (
              <button key={c} onClick={() => setFilter(c)} style={{
                padding: "8px 18px", borderRadius: "100px", cursor: "pointer",
                fontSize: "13px", fontWeight: 700,
                border: `1.5px solid ${isActive ? (cfg?.color || "#f97316") : "#1e3a5f"}`,
                background: isActive ? `${cfg?.color || "#f97316"}15` : "none",
                color: isActive ? (cfg?.color || "#f97316") : "#64748b",
                transition: "all 0.2s",
              }}>
                {cfg ? `${cfg.emoji} ${c}` : "🗓️ Tous"}
              </button>
            );
          })}
        </div>

        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "28px" }}>
          {filtered.length} événement{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Cards événements */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {filtered.map((ev, i) => {
            const cfg = CAT_EVENT_CONFIG[ev.category] || { color: "#f97316", emoji: "🎉" };
            const isHov = hovered === i;
            const isExp = expanded === i;
            return (
              <div key={ev.id}
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
                  {/* Image */}
                  <div style={{
                    width: "220px", minWidth: "220px", flexShrink: 0,
                    background: `url(${ev.image_url}) center/cover no-repeat, #0d2137`,
                    position: "relative",
                    minHeight: "160px",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, #112240 100%)" }} />
                    <span style={{
                      position: "absolute", top: "12px", left: "12px",
                      background: `${cfg.color}22`, border: `1px solid ${cfg.color}60`,
                      color: cfg.color, fontSize: "11px", fontWeight: 700,
                      padding: "3px 10px", borderRadius: "100px",
                    }}>
                      {cfg.emoji} {ev.category}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, padding: "20px 22px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                      <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", margin: 0, lineHeight: 1.25 }}>
                        {ev.title}
                      </h3>
                      {/* Badge à venir */}
                      <span style={{
                        flexShrink: 0, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                        background: "rgba(74,222,128,0.1)", color: "#4ade80",
                        border: "1px solid rgba(74,222,128,0.25)", borderRadius: "100px", padding: "3px 10px",
                      }}>À venir</span>
                    </div>

                    {/* Date & lieu */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: cfg.color, fontWeight: 600 }}>
                        📅 {ev.date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#64748b" }}>
                        📍 {ev.location}
                      </span>
                    </div>

                    {/* Description (collapse) */}
                    <p style={{
                      fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: "0 0 14px",
                      ...(isExp ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                    }}>
                      {ev.description}
                    </p>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button onClick={() => setExpanded(isExp ? null : i)} style={{
                        background: "none", border: "1px solid #1e3a5f",
                        borderRadius: "100px", color: "#64748b",
                        fontSize: "12px", fontWeight: 600, padding: "6px 14px", cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.color = cfg.color; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#64748b"; }}
                      >
                        {isExp ? "Voir moins ↑" : "Lire plus ↓"}
                      </button>
                      <button style={{
                        background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                        border: "none", borderRadius: "100px", color: "#fff",
                        fontSize: "12px", fontWeight: 700, padding: "7px 16px", cursor: "pointer",
                      }}>
                        🎟️ En savoir plus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function SectionDashboard() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <h2 style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Dashboard</h2>
      <p style={{ color: "#64748b", fontSize: "14px" }}>Section dashboard — statistiques et analyses</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeTanger({ onBack, onOpenChat }) {
  const [activeTab, setActiveTab] = useState("accueil");

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b2a", color: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <NavbarTanger
        onBack={onBack}
        onOpenChat={onOpenChat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "accueil"        && <SectionAccueil    onOpenChat={onOpenChat} />}
      {activeTab === "recommandation" && <SectionRecom      />}
      {activeTab === "activites"      && <SectionActivites  />}
      {activeTab === "evenements"     && <SectionEvenements />}
      {activeTab === "dashboard"      && <SectionDashboard  />}

      <Footer />
    </div>
  );
}