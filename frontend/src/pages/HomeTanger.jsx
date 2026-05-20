/**
 * HomeTanger.jsx — VERSION FINALE
 * Avec onglets : Accueil | Recommandation | Activités | Événements | Dashboard
 * Section Recommandation : wizard interactif complet (inline, sans fichiers externes)
 */
import { useState, useEffect, useRef, useMemo } from "react";
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
  const isTop   = rank === 0;
  const score   = item._score ?? 0;
  const pct     = Math.round(score * 100);
  const reasons = item._match_reasons || [];
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
           Meilleur choix
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
        {!item.image && <span></span>}
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
              <span style={{ fontSize: "11px", color: S.muted }}> {item.adresse}</span>
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
            <span> {error}</span>
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
  { nom: "Quad Aventure Cap Spartel", prix: "250 MAD", rating: 4.5, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", type: "aventure", budget: "moyen", duree: "2h", localisation: "extérieur", description: "Explorez les dunes et les pistes sauvages autour du Cap Spartel à bord de quads puissants. Une expérience de conduite tout-terrain inoubliable avec vue sur l'Atlantique et le détroit de Gibraltar, encadrée par des guides professionnels." },
  { nom: "Karting Tanger Indoor", prix: "120 MAD", rating: 4.2, image: "https://images.unsplash.com/photo-1504204267155-aaad8e81290d?w=800&q=80", type: "sport", budget: "économique", duree: "1h", localisation: "intérieur", description: "Un circuit de karting couvert moderne au cœur de Tanger. Idéal pour les familles et groupes d'amis, avec des karts adaptés aux adultes et aux enfants. Sensations de vitesse garanties dans un environnement sécurisé." },
  { nom: "Paintball Tanger Zone de Combat", prix: "180 MAD", rating: 4.3, image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=800&q=80", type: "aventure", budget: "moyen", duree: "2h", localisation: "extérieur", description: "Affrontez vos amis dans des parties de paintball épiques sur un terrain aménagé en plein air près de la zone industrielle de Tanger. Équipements fournis, casques et combinaisons inclus. Parfait pour les team buildings et anniversaires." },
  { nom: "Escape Room Tanger Mystery", prix: "150 MAD", rating: 4.6, image: "https://images.unsplash.com/photo-1596553700955-3b1f622a4c71?w=800&q=80", type: "aventure", budget: "moyen", duree: "1h", localisation: "intérieur", description: "Plongez dans une expérience de jeu d'évasion immersive avec plusieurs scénarios thématiques inspirés de la ville de Tanger et de son histoire." },
  { nom: "Bowling Tanger Méditerranée", prix: "80 MAD", rating: 4.0, image: "https://images.unsplash.com/photo-1545680945-f56f99a4afe0?w=800&q=80", type: "famille", budget: "économique", duree: "2h", localisation: "intérieur", description: "Une salle de bowling moderne avec des pistes bien entretenues, idéale pour les sorties en famille ou entre amis. Lumières néon, musique animée et snack-bar sur place." },
  { nom: "Hammam & Spa Riad Dar Jameel", prix: "380 MAD", rating: 4.8, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80", type: "détente", budget: "luxe", duree: "2h", localisation: "intérieur", description: "Ressourcez-vous dans le hammam traditionnel et le spa du Riad Dar Jameel dans la médina de Tanger. Gommage au savon beldi, massage à l'huile d'argan, enveloppement au ghassoul." },
  { nom: "Atelier Poterie Médina de Tanger", prix: "160 MAD", rating: 4.6, image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80", type: "créatif", budget: "moyen", duree: "2h", localisation: "intérieur", description: "Découvrez l'art ancestral de la poterie marocaine dans un atelier authentique au cœur de la médina. Un maître artisan vous initie au tour de potier et aux motifs berbères traditionnels." },
  { nom: "Atelier Cuisine Marocaine Dar Tanger", prix: "350 MAD", rating: 4.9, image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80", type: "gastronomie", budget: "luxe", duree: "demi-journée", localisation: "intérieur", description: "Initiez-vous aux secrets de la gastronomie marocaine dans un riad de charme en médina. Visite du souk pour les épices, puis préparation du tajine, couscous et pastilla guidée par un chef local." },
  { nom: "Live Music Jazz & Gnawa Café Hafa", prix: "50 MAD", rating: 4.7, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", type: "nightlife", budget: "économique", duree: "soirée", localisation: "extérieur", description: "Vivez une soirée musicale inoubliable au légendaire Café Hafa, perché sur la falaise avec vue sur la mer. Jazz, gnawa et musique andalouse dans une atmosphère bohème unique." },
  { nom: "Surf Plage Merkala", prix: "200 MAD", rating: 4.5, image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80", type: "sport", budget: "moyen", duree: "2h", localisation: "plage", description: "Prenez vos premières vagues ou perfectionnez votre technique à la plage de Merkala. Cours pour tous niveaux avec instructeurs certifiés, planches et combinaisons disponibles." },
  { nom: "Kayak de Mer Grottes d'Hercule", prix: "250 MAD", rating: 4.7, image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80", type: "aventure", budget: "moyen", duree: "demi-journée", localisation: "plage", description: "Pagayez le long du littoral atlantique jusqu'aux célèbres Grottes d'Hercule à Cap Spartel. Kayak de mer encadré avec vue sur falaises spectaculaires." },
  { nom: "Yoga au Lever du Soleil Cap Spartel", prix: "100 MAD", rating: 4.7, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80", type: "détente", budget: "économique", duree: "1h", localisation: "extérieur", description: "Séance de yoga en plein air au lever du soleil sur les hauteurs du Cap Spartel, à la jonction de l'Atlantique et de la Méditerranée. Instructrice certifiée, tapis fournis." },
  { nom: "Jet Ski Plage Malabata", prix: "350 MAD", rating: 4.6, image: "https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&q=80", type: "sport", budget: "luxe", duree: "1h", localisation: "plage", description: "Sillonnez les eaux turquoise du détroit de Gibraltar à bord d'un jet ski puissant depuis la plage de Malabata. Location avec gilet de sauvetage et briefing sécurité inclus." },
  { nom: "Randonnée Jbel Moussa", prix: "120 MAD", rating: 4.8, image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", type: "aventure", budget: "économique", duree: "journée complète", localisation: "montagne", description: "Ascension guidée du Jbel Moussa (882 m) avec vue panoramique sur Tanger, Gibraltar et l'Espagne. Guide local inclus, pique-nique en option." },
  { nom: "Tour en Bateau Détroit de Gibraltar", prix: "400 MAD", rating: 4.8, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80", type: "aventure", budget: "luxe", duree: "demi-journée", localisation: "plage", description: "Croisière dans le légendaire détroit de Gibraltar depuis le port de Tanger. Observation des dauphins, vue sur l'Europe et l'Afrique, passage devant le Cap Spartel." },
  { nom: "Paint & Sip Workshop Tanger Art Studio", prix: "200 MAD", rating: 4.7, image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80", type: "créatif", budget: "moyen", duree: "2h", localisation: "intérieur", description: "Atelier de peinture convivial guidé par un artiste local, verre de jus à la main. Ambiance décontractée, toiles et pinceaux fournis. Idéal pour anniversaires et soirées entre amis." },
  { nom: "Rooftop Café El Morocco Club", prix: "80 MAD", rating: 4.6, image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80", type: "nightlife", budget: "moyen", duree: "soirée", localisation: "centre-ville", description: "Cocktails, thé à la menthe et tapas marocaines sur le rooftop iconique en plein cœur de Tanger. Vue imprenable sur la médina et la baie. DJ les weekends." },
  { nom: "Aqua Fun Park Asilah", prix: "200 MAD", rating: 4.4, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", type: "famille", budget: "moyen", duree: "journée complète", localisation: "extérieur", description: "À 40 km de Tanger, le parc aquatique d'Asilah offre toboggans géants, piscines à vagues et lazy river. Idéal pour les familles en été." },
  { nom: "Dégustation de Thé & Pâtisseries Marocaines", prix: "70 MAD", rating: 4.5, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80", type: "gastronomie", budget: "économique", duree: "1h", localisation: "centre-ville", description: "Découvrez le rituel du thé à la menthe marocain dans un salon de thé traditionnel de la médina. Cornes de gazelle, briwat et chebakia préparés maison." },
  { nom: "Padel Club Tanger", prix: "100 MAD", rating: 4.3, image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80", type: "sport", budget: "économique", duree: "1h", localisation: "extérieur", description: "Courts de padel bien entretenus dans un club moderne à Tanger. Location de raquettes disponible, cours pour débutants et créneaux compétitifs pour joueurs confirmés." },
  { nom: "Tyrolienne Cap Malabata", prix: "280 MAD", rating: 4.8, image: "https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&q=80", type: "aventure", budget: "moyen", duree: "1h", localisation: "extérieur", description: "Glissez en tyrolienne au-dessus des falaises et de la forêt de Cap Malabata avec vue imprenable sur le détroit. Accessible dès 12 ans. Adrénaline garantie." },
  { nom: "Beach Club La Tangerina", prix: "200 MAD", rating: 4.5, image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&q=80", type: "détente", budget: "moyen", duree: "journée complète", localisation: "plage", description: "Transats premium, bar à cocktails, cuisine de mer fraîche et piscine à débordement face à l'océan. Musique lounge et ambiance internationale." },
  { nom: "VR Experience Tanger", prix: "120 MAD", rating: 4.4, image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80", type: "famille", budget: "moyen", duree: "1h", localisation: "intérieur", description: "Mondes virtuels époustouflants grâce aux casques VR de dernière génération. Jeux multijoueurs, simulations de vol et aventures fantastiques." },
  { nom: "Plongée Sous-Marine Détroit de Gibraltar", prix: "450 MAD", rating: 4.7, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", type: "aventure", budget: "luxe", duree: "demi-journée", localisation: "plage", description: "Explorez les fonds marins exceptionnels du détroit de Gibraltar avec un club certifié PADI. Dauphins, thons, murènes et pieuvres au programme." },
  { nom: "Cake Design Workshop Tanger", prix: "220 MAD", rating: 4.5, image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=80", type: "créatif", budget: "moyen", duree: "2h", localisation: "intérieur", description: "Apprenez à décorer des gâteaux comme un professionnel. Fondant, ganache, fleurs en sucre et techniques modernes. Repartez avec votre création." },
  { nom: "Équitation Ranch Ksar Sghir", prix: "300 MAD", rating: 4.5, image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80", type: "sport", budget: "moyen", duree: "2h", localisation: "extérieur", description: "Balade équestre dans les paysages verdoyants autour de Ksar Sghir, à 30 km de Tanger. Chevaux barbes bien dressés, encadrement par des cavaliers expérimentés." },
  { nom: "Piscine & Bien-être Hôtel Ibis Tanger", prix: "150 MAD", rating: 4.1, image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80", type: "détente", budget: "moyen", duree: "demi-journée", localisation: "intérieur", description: "Accès journée à la piscine chauffée et aux installations de bien-être. Transats, pool-bar, serviettes fournies. Une parenthèse de détente en plein cœur de Tanger." },
  { nom: "Gaming Zone Tanger City Mall", prix: "50 MAD", rating: 4.0, image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", type: "famille", budget: "économique", duree: "2h", localisation: "intérieur", description: "Espace de jeux vidéo et d'arcade moderne au Tanger City Mall. Consoles dernière génération, simulateurs de conduite et jeux de tir laser." },
  { nom: "Cinéma Dawliz Méga", prix: "60 MAD", rating: 4.1, image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80", type: "famille", budget: "économique", duree: "2h", localisation: "intérieur", description: "Dernières sorties internationales et arabes dans des salles climatisées dotées de systèmes son Dolby. Popcorn et boissons disponibles au comptoir." },
  { nom: "Visite Guidée Médina & Kasbah de Tanger", prix: "130 MAD", rating: 4.6, image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80", type: "culture", budget: "économique", duree: "demi-journée", localisation: "centre-ville", description: "Explorez les ruelles labyrinthiques de la médina millénaire et la majestueuse Kasbah avec un guide certifié. Palais du Mendoub, Grande Mosquée, souks d'épices." },
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
  // Types du nouveau dataset JSON
  aventure:    { color: "#f97316",  label: "Aventure" },
  sport:       { color: "#3b82f6",  label: "Sport" },
  détente:     { color: "#ec4899", label: "Détente" },
  culture:     { color: "#06b6d4", label: "Culture" },
  gastronomie: { color: "#f59e0b", label: "Gastronomie" },
  créatif:     { color: "#8b5cf6", label: "Créatif" },
  nightlife:   { color: "#6366f1", label: "Nightlife" },
  famille:     { color: "#10b981", label: "Famille" },
  // Anciens types (compatibilité avec l'autre dataset)
  historique:  { color: "#a855f7", label: "Historique" },
};

const CAT_EVENT_CONFIG = {
  Musique:  { color: "#f97316"},
  Culture:  { color: "#06b6d4" },
  Cinéma:   { color: "#a855f7" },
  Sport:    { color: "#10b981"},
};


 
// ─────────────────────────────────────────────────────────────────────────────
// Constantes de filtre — extraites dynamiquement depuis le dataset
// ─────────────────────────────────────────────────────────────────────────────
const ALL_TYPES   = ["tous", ...Object.keys(TYPE_CONFIG).filter(k =>
  ACTIVITES_DATA.some(a => a.type === k)
)];
const ALL_BUDGETS = ["tous", "économique", "moyen", "luxe"];
 
const BUDGET_CONFIG = {
  économique: {  label: "Éco" },
  moyen:      { label: "Moyen" },
  luxe:       { label: "Luxe" },
};
 
const LOCALISATION_ICONS = {
  intérieur:    "🏠",
  extérieur:    "🌿",
  plage:        "🏖️",
  montagne:     "⛰️",
  "centre-ville":"🏙️",
  médina:       "🕌",
  extérieurs:   "🌿",
};
 
// ─────────────────────────────────────────────────────────────────────────────
// Formatage durée — normalise les deux formats (1h / Quelques heures)
// ─────────────────────────────────────────────────────────────────────────────
function formatDuree(duree) {
  const map = {
    "1h":              "1h",
    "2h":              "2h",
    "demi-journée":    "Demi-journée",
    "Demi-journée":    "Demi-journée",
    "journée complète":"Journée complète",
    "Journée complète":"Journée complète",
    "soirée":          "Soirée",
    "quelques heures": "Quelques heures",
    "Quelques heures": "Quelques heures",
  };
  return map[duree] ?? duree;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ACTIVITÉS
// ─────────────────────────────────────────────────────────────────────────────
function ActiviteCard({ act, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg = TYPE_CONFIG[act.type] ?? { color: "#94a3b8", label: act.type };
  const isGratuit = act.prix?.toLowerCase() === "gratuit";
 
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#112240",
        borderRadius: "16px",
        overflow: "hidden",
        border: `1.5px solid ${hovered ? cfg.color : "#1e3a5f"}`,
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.5), 0 0 24px ${cfg.color}20`
          : "0 4px 16px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        animation: `fadeInUp 0.4s ease both`,
        animationDelay: `${index * 0.04}s`,
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          height: "185px",
          backgroundImage: `url(${act.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#0d2137",
          position: "relative",
        }}
      >
        {/* Dégradé bas */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #112240 0%, transparent 55%)",
        }} />
 
        {/* Badge type */}
        <span style={{
          position: "absolute", top: "12px", left: "12px",
          background: `${cfg.color}25`,
          border: `1px solid ${cfg.color}55`,
          color: cfg.color,
          fontSize: "11px", fontWeight: 700,
          padding: "4px 11px", borderRadius: "100px",
          backdropFilter: "blur(6px)",
        }}>
          {cfg.emoji} {cfg.label}
        </span>
 
        {/* Rating */}
        <span style={{
          position: "absolute", top: "12px", right: "12px",
          background: "rgba(10,20,35,0.82)",
          color: "#f5c842",
          fontSize: "12px", fontWeight: 700,
          padding: "4px 10px", borderRadius: "100px",
          backdropFilter: "blur(6px)",
        }}>
          ★ {act.rating.toFixed(1)}
        </span>
      </div>
 
      {/* CONTENU */}
      <div style={{ padding: "16px 18px 18px" }}>
 
        <h3 style={{
          fontFamily: "Georgia, serif",
          fontSize: "1.05rem", fontWeight: 700,
          color: "#f1f5f9", margin: "0 0 7px",
          lineHeight: 1.3,
        }}>
          {act.nom}
        </h3>
 
        <p style={{
          fontSize: "12px", color: "#64748b",
          lineHeight: 1.6, margin: "0 0 14px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {act.description}
        </p>
 
        {/* META BADGES */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
          {/* Localisation */}
          <span style={metaBadgeStyle}>
            {LOCALISATION_ICONS[act.localisation] ?? ""} {act.localisation}
          </span>
          {/* Durée */}
          <span style={metaBadgeStyle}>
            ⏱️ {formatDuree(act.duree)}
          </span>
          {/* Budget */}
          <span style={metaBadgeStyle}>
            {BUDGET_CONFIG[act.budget]?.emoji ?? ""} {act.budget}
          </span>
        </div>
 
        {/* FOOTER : prix + CTA */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "13px",
          borderTop: "1px solid #1e3a5f",
        }}>
          <span style={{
            fontSize: "16px", fontWeight: 800,
            color: isGratuit ? "#4ade80" : "#f1f5f9",
          }}>
            {act.prix}
          </span>
 
          <button
            style={{
              background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}bb 100%)`,
              border: "none", borderRadius: "100px",
              color: "#fff", fontSize: "12px", fontWeight: 700,
              padding: "8px 18px", cursor: "pointer",
              transition: "opacity 0.2s, transform 0.15s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.82"; e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Réserver →
          </button>
        </div>
      </div>
    </div>
  );
}
 
const metaBadgeStyle = {
  fontSize: "11px", fontWeight: 500, color: "#94a3b8",
  background: "#0d2137", borderRadius: "100px",
  padding: "3px 10px", whiteSpace: "nowrap",
};
 
// ─────────────────────────────────────────────────────────────────────────────
// SECTION ACTIVITÉS PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────
function SectionActivites() {
  const [activeType,   setActiveType]   = useState("tous");
  const [activeBudget, setActiveBudget] = useState("tous");
  const [search,       setSearch]       = useState("");
 
  // ── Filtrage mémoïsé ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ACTIVITES_DATA.filter(a => {
      const matchType   = activeType   === "tous" || a.type   === activeType;
      const matchBudget = activeBudget === "tous" || a.budget === activeBudget;
      const matchSearch = !q
        || a.nom.toLowerCase().includes(q)
        || a.description.toLowerCase().includes(q)
        || a.type.toLowerCase().includes(q)
        || a.localisation.toLowerCase().includes(q);
      return matchType && matchBudget && matchSearch;
    });
  }, [activeType, activeBudget, search]);
 
  // ── Compteurs par type (pour les stats hero) ──────────────────────────────
  const countByType = useMemo(() =>
    Object.keys(TYPE_CONFIG).reduce((acc, t) => {
      acc[t] = ACTIVITES_DATA.filter(a => a.type === t).length;
      return acc;
    }, {}),
  []);
 
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
 
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
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
          background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(99,102,241,0.09) 0%, transparent 70%)",
        }} />
 
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-block", fontSize: "12px", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#a855f7", background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: "100px", padding: "5px 16px", marginBottom: "18px",
          }}>
             Activités
          </span>
 
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700, color: "#f1f5f9",
            margin: "0 0 10px",
          }}>
            Que faire à <em style={{ fontStyle: "italic", color: "#a855f7" }}>Tanger ?</em>
          </h1>
 
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 auto 32px", maxWidth: "480px" }}>
            {ACTIVITES_DATA.length} activités sélectionnées — aventure, sport, culture, famille & plus
          </p>
 
          {/* Stats par type */}
          <div style={{
            display: "flex", justifyContent: "center",
            gap: "20px", flexWrap: "wrap",
          }}>
            {ALL_TYPES.filter(t => t !== "tous").map(t => {
              const cfg = TYPE_CONFIG[t];
              const count = countByType[t] ?? 0;
              if (!count) return null;
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t === activeType ? "tous" : t)}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", textAlign: "center", padding: "4px",
                  }}
                >
                  <div style={{ fontSize: "20px" }}>{cfg.emoji}</div>
                  <div style={{ fontSize: "11px", color: cfg.color, fontWeight: 700, marginTop: "3px" }}>
                    {count} {cfg.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
 
      {/* ── CONTENU ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>
 
        {/* ── Barre de filtres ── */}
        <div style={{
          background: "#0d1f38", border: "1px solid #1e3a5f",
          borderRadius: "14px", padding: "18px 20px",
          marginBottom: "32px",
          display: "flex", flexDirection: "column", gap: "14px",
        }}>
 
          {/* Recherche */}
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", fontSize: "14px", color: "#64748b",
              pointerEvents: "none",
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une activité, un lieu, un type…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 14px 10px 40px",
                background: "#112240", border: "1.5px solid #1e3a5f",
                borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#1e3a5f"}
            />
          </div>
 
          {/* Filtres type */}
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600, marginRight: "4px", whiteSpace: "nowrap" }}>
              TYPE :
            </span>
            {ALL_TYPES.map(t => {
              const cfg = TYPE_CONFIG[t];
              const isActive = activeType === t;
              const activeColor = cfg?.color ?? "#94a3b8";
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  style={{
                    padding: "6px 14px", borderRadius: "100px",
                    cursor: "pointer", fontSize: "12px", fontWeight: 700,
                    border: `1.5px solid ${isActive ? activeColor : "#1e3a5f"}`,
                    background: isActive ? `${activeColor}18` : "transparent",
                    color: isActive ? activeColor : "#64748b",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t === "tous" ? "✦ Tous" : `${cfg.emoji} ${cfg.label}`}
                </button>
              );
            })}
          </div>
 
          {/* Filtres budget */}
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600, marginRight: "4px", whiteSpace: "nowrap" }}>
              BUDGET :
            </span>
            {ALL_BUDGETS.map(b => {
              const isActive = activeBudget === b;
              const cfg = BUDGET_CONFIG[b];
              return (
                <button
                  key={b}
                  onClick={() => setActiveBudget(b)}
                  style={{
                    padding: "6px 14px", borderRadius: "100px",
                    cursor: "pointer", fontSize: "12px", fontWeight: 700,
                    border: `1.5px solid ${isActive ? "#f5c842" : "#1e3a5f"}`,
                    background: isActive ? "rgba(245,200,66,0.12)" : "transparent",
                    color: isActive ? "#f5c842" : "#64748b",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b === "tous" ? " Tous budgets" : `${cfg.emoji} ${cfg.label}`}
                </button>
              );
            })}
 
            {/* Reset filtres */}
            {(activeType !== "tous" || activeBudget !== "tous" || search) && (
              <button
                onClick={() => { setActiveType("tous"); setActiveBudget("tous"); setSearch(""); }}
                style={{
                  padding: "6px 14px", borderRadius: "100px",
                  cursor: "pointer", fontSize: "12px", fontWeight: 700,
                  border: "1.5px solid #ef4444",
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444", transition: "all 0.2s",
                  marginLeft: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </div>
 
        {/* Compteur résultats */}
        <p style={{ color: "#475569", fontSize: "13px", marginBottom: "24px" }}>
          <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{filtered.length}</span>
          {" "}activité{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
          {activeType !== "tous" && (
            <span style={{ color: TYPE_CONFIG[activeType]?.color }}>
              {" "}· {TYPE_CONFIG[activeType]?.label}
            </span>
          )}
          {activeBudget !== "tous" && (
            <span style={{ color: "#f5c842" }}> · budget {activeBudget}</span>
          )}
          {search && (
            <span style={{ color: "#94a3b8" }}> · "{search}"</span>
          )}
        </p>
 
        {/* ── Grille de cartes ── */}
        {filtered.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {filtered.map((act, i) => (
              <ActiviteCard key={`${act.nom}-${i}`} act={act} index={i} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "70px 0", color: "#475569" }}>
            <div style={{ fontSize: "3rem", marginBottom: "14px" }}>🔍</div>
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>Aucune activité trouvée.</p>
            <p style={{ fontSize: "13px" }}>Essayez d'autres filtres ou effacez la recherche.</p>
            <button
              onClick={() => { setActiveType("tous"); setActiveBudget("tous"); setSearch(""); }}
              style={{
                marginTop: "16px", padding: "9px 22px",
                borderRadius: "100px", cursor: "pointer",
                background: "rgba(99,102,241,0.15)",
                border: "1.5px solid #6366f1",
                color: "#6366f1", fontSize: "13px", fontWeight: 700,
              }}
            >
              Réinitialiser les filtres
            </button>
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
          }}> Agenda 2026–2027</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" }}>
            Événements à <em style={{ fontStyle: "italic", color: "#f97316" }}>Tanger</em>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 auto 28px", maxWidth: "500px" }}>
           événements à venir — concerts, festivals, culture et sport
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
                {cfg ? `${cfg.emoji} ${c}` : "Tous"}
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
            const cfg = CAT_EVENT_CONFIG[ev.category] || { color: "#f97316", };
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
                         {ev.date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#64748b" }}>
                         {ev.location}
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
                        En savoir plus
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

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD — Constantes & utilitaires
// ─────────────────────────────────────────────────────────────────────────────
const API_DASH = "/api/dashboard";

async function dashFetch(path) {
  const res = await fetch(`${API_DASH}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Couleurs par catégorie
const CAT_COLORS = {
  culture:      "#a855f7",
  nature:       "#22c55e",
  gastronomie:  "#ef4444",
  détente:      "#06b6d4",
  aventure:     "#f97316",
  sport:        "#3b82f6",
  famille:      "#f59e0b",
  nightlife:    "#ec4899",
  autre:        "#64748b",
};
const CAT_EMOJI = {
  culture: "🏛️", nature: "🌿", gastronomie: "🍽️", détente: "🧘",
  aventure: "🪂", sport: "⚽", famille: "👨‍👩‍👧", nightlife: "🎶", autre: "📍",
};
const BUDGET_COLORS = { économique: "#22c55e", moyen: "#3b82f6", luxe: "#f5c842" };
const SAISON_COLORS = { automne: "#f97316", printemps: "#22c55e", ete: "#06b6d4", hiver: "#a855f7" };
const SAISON_EMOJI  = { automne: "🍂", printemps: "🌸", ete: "☀️", hiver: "❄️" };

// Barre de progression réutilisable
function ProgressBar({ value, max, color, height = 8 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height, background: "#1e3a5f", borderRadius: 100, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: 100,
        background: color, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

// Carte KPI simple
function KPICard({ label, value, sub, icon, color = S.orange, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...S.surface,
        padding: "22px 20px",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        borderColor: hov ? color : "#1e3a5f",
        boxShadow: hov ? `0 12px 32px rgba(0,0,0,0.4), 0 0 20px ${color}18` : "0 4px 16px rgba(0,0,0,0.25)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: color, opacity: hov ? 1 : 0, transition: "opacity 0.2s",
      }} />
      <div style={{ fontSize: "1.8rem", marginBottom: "10px", lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: "1.9rem", fontWeight: 800, color: color, lineHeight: 1, marginBottom: "4px", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: S.ivory, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: S.muted, marginTop: "3px" }}>{sub}</div>}
    </div>
  );
}

// Spinner de chargement
function Spinner({ color = S.orange }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <div style={{
        width: 36, height: 36,
        border: `3px solid #1e3a5f`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "dashSpin 0.8s linear infinite",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-SECTIONS DU DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

// ── Vue Globale ───────────────────────────────────────────────────────────────
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
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Ligne : prix + note + quartiers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: "14px" }}>

        {/* Prix moyens */}
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
            💰 Prix moyens
          </p>
          {[
            { label: "Hôtel / nuit", val: `${pricing.prix_moyen_hotel_mad.toLocaleString()} MAD`, color: "#f5c842" },
            { label: "Repas / pers.", val: `${pricing.prix_moyen_restaurant_mad} MAD`, color: "#ef4444" },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: S.muted }}>{row.label}</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: row.color }}>{row.val}</span>
              </div>
              <ProgressBar value={pricing.prix_moyen_hotel_mad === row.val.replace(" MAD","") ? 1038 : 160} max={2000} color={row.color} />
            </div>
          ))}
        </div>

        {/* Note globale */}
        <div style={{ ...S.surface, padding: "22px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>
            ⭐ Satisfaction globale
          </p>
          <div style={{ fontSize: "3.8rem", fontWeight: 900, color: S.gold, lineHeight: 1 }}>
            {quality.note_moyenne_globale}
          </div>
          <div style={{ fontSize: "12px", color: S.muted, margin: "6px 0 16px" }}>/ 5.0 · {quality.total_avis_collectes} avis</div>
          {/* Étoiles visuelles */}
          <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: "50%",
                background: i <= Math.round(quality.note_moyenne_globale)
                  ? `${S.gold}22` : "#1e3a5f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px",
              }}>
                {i <= Math.round(quality.note_moyenne_globale) ? "⭐" : "☆"}
              </div>
            ))}
          </div>
        </div>

        {/* Top quartiers */}
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
            📍 Top quartiers touristiques
          </p>
          {geography.top_quartiers.map((q, i) => (
            <div key={q.quartier} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: [S.orange,"#a855f7","#06b6d4","#22c55e","#f5c842"][i],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: 800, color: "#fff", flexShrink: 0,
                  }}>{i+1}</span>
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

// ── Catégories ────────────────────────────────────────────────────────────────
function DashCategories({ data }) {
  if (!data) return <Spinner />;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const maxVal = entries[0]?.[1] || 1;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>

      {/* Barres horizontales */}
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>
          🗂️ Répartition par catégorie
        </p>
        {entries.map(([cat, val]) => {
          const color = CAT_COLORS[cat] || "#64748b";
          const pct = Math.round((val / total) * 100);
          return (
            <div key={cat} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "15px" }}>{CAT_EMOJI[cat] || "📍"}</span>
                  <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600, textTransform: "capitalize" }}>{cat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: S.muted }}>{pct}%</span>
                  <span style={{
                    fontSize: "13px", fontWeight: 800, color: color,
                    background: `${color}15`, borderRadius: 100, padding: "2px 10px",
                    minWidth: 36, textAlign: "center",
                  }}>{val}</span>
                </div>
              </div>
              <ProgressBar value={val} max={maxVal} color={color} height={7} />
            </div>
          );
        })}
      </div>

      {/* Donut SVG */}
      <div style={{ ...S.surface, padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px", alignSelf: "flex-start" }}>
          🎯 Distribution visuelle
        </p>
        <DashDonut entries={entries} total={total} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px", justifyContent: "center" }}>
          {entries.slice(0, 6).map(([cat]) => (
            <span key={cat} style={{
              fontSize: "11px", fontWeight: 700, borderRadius: 100, padding: "3px 10px",
              background: `${CAT_COLORS[cat] || "#64748b"}18`,
              color: CAT_COLORS[cat] || "#64748b",
              border: `1px solid ${CAT_COLORS[cat] || "#64748b"}30`,
            }}>
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
    const gap = circumference - dash;
    const slice = { cat, val, pct, dash, gap, offset, color: CAT_COLORS[cat] || "#64748b" };
    offset += dash;
    return slice;
  });

  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3a5f" strokeWidth={stroke} />
      {slices.map(s => (
        <circle key={s.cat} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circumference * 0.25}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={S.ivory} fontSize={22} fontWeight={800}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={S.muted} fontSize={11}>lieux</text>
    </svg>
  );
}

// ── Budget ────────────────────────────────────────────────────────────────────
function DashBudget({ data }) {
  if (!data) return <Spinner />;
  const users  = data.users  || {};
  const hotels = data.hotels || {};
  const acts   = data.activites || {};
  const totalU = Object.values(users).reduce((s, v) => s + v, 0) || 1;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>

      {/* Utilisateurs */}
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>
          👤 Budget visiteurs
        </p>
        {["moyen", "économique", "luxe"].map(b => {
          const val = users[b] || 0;
          const color = BUDGET_COLORS[b];
          const pct = Math.round((val / totalU) * 100);
          return (
            <div key={b} style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <span style={{ fontSize: "14px", color: S.ivory, fontWeight: 700, textTransform: "capitalize" }}>
                  {{ économique: "💚", moyen: "💙", luxe: "💛" }[b]} {b}
                </span>
                <span style={{ fontSize: "20px", fontWeight: 900, color }}>{pct}%</span>
              </div>
              <ProgressBar value={val} max={totalU} color={color} height={10} />
              <div style={{ fontSize: "11px", color: S.muted, marginTop: "4px", textAlign: "right" }}>
                {val} visiteurs
              </div>
            </div>
          );
        })}
        <div style={{
          marginTop: "16px", padding: "12px 16px",
          background: `${S.orange}0a`, border: `1px solid ${S.orange}20`, borderRadius: "12px",
        }}>
          <div style={{ fontSize: "11px", color: S.muted, marginBottom: "2px" }}>Budget moyen / jour</div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: S.orange }}>
            {(data.budget_moyen_utilisateur_mad || 1160).toLocaleString()} MAD
          </div>
        </div>
      </div>

      {/* Hôtels par segment */}
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>
          🏨 Segment hôtelier
        </p>
        {["économique", "moyen", "luxe"].map(b => {
          const val = hotels[b] || 0;
          const color = BUDGET_COLORS[b];
          const total = Object.values(hotels).reduce((s, v) => s + v, 0) || 1;
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
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#f5c842" }}>
            {Object.values(hotels).reduce((s,v)=>s+v,0)} hôtels
          </div>
        </div>
      </div>

      {/* Activités par budget */}
      <div style={{ ...S.surface, padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>
          🎯 Activités par budget
        </p>
        {["économique", "moyen", "luxe"].map(b => {
          const val = acts[b] || 0;
          const color = BUDGET_COLORS[b];
          const total = Object.values(acts).reduce((s, v) => s + v, 0) || 1;
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
        <div style={{
          marginTop: "16px", padding: "12px 16px",
          background: "#0d2137", borderRadius: "12px",
          display: "flex", flexDirection: "column", gap: "6px",
        }}>
          {[["Économique", "< 200 MAD", "#22c55e"], ["Moyen", "200–500 MAD", "#3b82f6"], ["Luxe", "> 500 MAD", "#f5c842"]].map(([l,r,c]) => (
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

// ── Hôtels ────────────────────────────────────────────────────────────────────
function DashHotels({ data }) {
  if (!data) return <Spinner />;
  const { prix, rating_moyen, par_categorie, par_localisation, amenites } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* KPIs hôtel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "Prix moyen / nuit", value: `${prix?.moyen_mad?.toLocaleString()} MAD`, icon: "💰", color: S.orange },
          { label: "Prix médian",        value: `${prix?.median_mad?.toLocaleString()} MAD`, icon: "📊", color: "#3b82f6" },
          { label: "Note moyenne",       value: `${rating_moyen}/5`, icon: "⭐", color: S.gold },
          { label: "Avec piscine",       value: `${amenites?.pct_avec_piscine}%`, icon: "🏊", color: "#06b6d4" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Segmentation */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>

        {/* Par catégorie */}
        <div style={{ ...S.surface, padding: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
            🏷️ Segmentation tarifaire
          </p>
          {par_categorie?.map(cat => {
            const color = BUDGET_COLORS[cat.categorie] || "#64748b";
            return (
              <div key={cat.categorie} style={{
                padding: "16px", marginBottom: "10px", borderRadius: "12px",
                background: `${color}08`, border: `1px solid ${color}25`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color, textTransform: "capitalize" }}>
                    {{ économique: "💚", moyen: "💙", luxe: "💛" }[cat.categorie]} Segment {cat.categorie}
                  </span>
                  <span style={{ fontSize: "12px", color: S.muted }}>{cat.count} hôtels</span>
                </div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {[
                    { l: "Moy.", v: `${cat.prix_moyen} MAD` },
                    { l: "Min", v: `${cat.prix_min} MAD` },
                    { l: "Max", v: `${cat.prix_max} MAD` },
                    { l: "Note", v: `★ ${cat.rating_moyen}` },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <div style={{ fontSize: "10px", color: S.muted }}>{l}</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Par localisation + amenités */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ ...S.surface, padding: "22px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
              📍 Par localisation
            </p>
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
            <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
              ✨ Équipements
            </p>
            {[
              { label: "Avec piscine", pct: amenites?.pct_avec_piscine, icon: "🏊", color: "#06b6d4" },
              { label: "Vue mer",      pct: amenites?.pct_avec_vue_mer,  icon: "🌊", color: "#3b82f6" },
            ].map(eq => (
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

// ── Top Activités ─────────────────────────────────────────────────────────────
function DashTopActivites({ data }) {
  if (!data) return <Spinner />;
  const { top_activities, methode, prior_global_m, poids } = data;
  const maxScore = top_activities[0]?.score_hybride || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Explication méthode */}
      <div style={{ ...S.surface, padding: "20px", background: `${S.orange}06`, borderColor: `${S.orange}25` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "22px" }}>🧮</span>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: S.orange, margin: "0 0 4px" }}>Méthode de scoring</p>
            <p style={{ fontSize: "12px", color: S.muted, margin: "0 0 10px" }}>{methode}</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.entries(poids).map(([k, v]) => (
                <span key={k} style={{
                  fontSize: "11px", fontWeight: 700,
                  background: `${S.orange}15`, color: S.orange,
                  borderRadius: 100, padding: "2px 10px",
                }}>
                  {k.replace(/_/g," ")} {Math.round(v*100)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Podium top 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: "12px", alignItems: "flex-end" }}>
        {[top_activities[1], top_activities[0], top_activities[2]].filter(Boolean).map((act, i) => {
          const isCenter = i === 1;
          const color = isCenter ? S.orange : ["#94a3b8","#f5c842"][i === 0 ? 1 : 0];
          const height = isCenter ? "190px" : "150px";
          const medal  = isCenter ? "🥇" : i === 0 ? "🥈" : "🥉";
          return (
            <div key={act.nom} style={{
              ...S.surface,
              padding: "16px 14px",
              height,
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              borderColor: isCenter ? S.orange : "#1e3a5f",
              boxShadow: isCenter ? `0 0 28px ${S.orange}25` : "0 4px 16px rgba(0,0,0,0.25)",
              position: "relative", overflow: "hidden",
            }}>
              {isCenter && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                  background: `linear-gradient(90deg, ${S.orange}, ${S.gold})`,
                }} />
              )}
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>{medal}</div>
              <div style={{ fontSize: "11px", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                {CAT_EMOJI[act.type] || "🎯"} {act.type}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: S.ivory, lineHeight: 1.3, marginBottom: "8px" }}>
                {act.nom}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: S.gold }}>★ {act.rating}</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color }}>{act.score_hybride.toFixed(3)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste complète */}
      {top_activities.slice(3).map((act, i) => {
        const color = CAT_COLORS[act.type] || "#64748b";
        return (
          <div key={act.nom} style={{
            ...S.surface, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%", background: "#1e3a5f",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: 800, color: S.muted, flexShrink: 0,
            }}>{act.rang}</span>
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

// ── Profil Utilisateur ────────────────────────────────────────────────────────
function DashUserProfile({ data }) {
  if (!data) return <Spinner />;
  const { profil_type, demographique, preferences, saisons } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Ligne 1 : profil principal */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "Type dominant",  value: profil_type.type_voyageur,      icon: { couple:"💑", solo:"🧳", famille:"👨‍👩‍👧", groupe:"👥" }[profil_type.type_voyageur] || "👤", color: "#a855f7" },
          { label: "Âge moyen",      value: `${Math.round(profil_type.age_moyen)} ans`, icon: "🎂", color: "#06b6d4" },
          { label: "Budget / jour",  value: `${profil_type.budget_moyen_mad?.toLocaleString()} MAD`, icon: "💰", color: S.orange },
          { label: "Durée séjour",   value: `${profil_type.duree_sejour_jours?.toFixed(1)} jours`, icon: "📅", color: "#22c55e" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Ligne 2 : saisons + nationalités + préférences */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "16px" }}>

        {/* Saisons */}
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px" }}>
            🗓️ Saison préférée
          </p>
          {Object.entries(saisons.distribution || {})
            .sort((a, b) => b[1] - a[1])
            .map(([s, n]) => {
              const total = Object.values(saisons.distribution).reduce((a, b) => a + b, 0);
              const color = SAISON_COLORS[s] || "#64748b";
              return (
                <div key={s} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600 }}>
                      {SAISON_EMOJI[s]} {s.charAt(0).toUpperCase()+s.slice(1)}
                    </span>
                    <span style={{ fontSize: "12px", color, fontWeight: 700 }}>{Math.round(n/total*100)}%</span>
                  </div>
                  <ProgressBar value={n} max={total} color={color} height={7} />
                </div>
              );
            })
          }
        </div>

        {/* Nationalités */}
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px" }}>
            🌍 Top nationalités
          </p>
          {Object.entries(demographique.top_nationalites || {})
            .sort((a,b) => b[1]-a[1])
            .slice(0,5)
            .map(([nat, n], i) => {
              const colors = [S.orange, "#a855f7", "#06b6d4", "#22c55e", "#f5c842"];
              const max = Object.values(demographique.top_nationalites)[0];
              return (
                <div key={nat} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: colors[i], display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "#0d1b2a",
                      }}>{i+1}</span>
                      <span style={{ fontSize: "13px", color: S.ivory, fontWeight: 600 }}>{nat}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: colors[i] }}>{n}</span>
                  </div>
                  <ProgressBar value={n} max={max} color={colors[i]} height={5} />
                </div>
              );
            })
          }
        </div>

        {/* Scores catégories */}
        <div style={{ ...S.surface, padding: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
            🎯 Intérêts moyens (score 0–10)
          </p>
          {(preferences.categories || []).map(c => {
            const color = CAT_COLORS[c.categorie] || "#64748b";
            return (
              <div key={c.categorie} style={{ marginBottom: "11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: S.ivory, fontWeight: 600 }}>
                    {CAT_EMOJI[c.categorie] || "📊"} {c.categorie}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color }}>{c.score_moyen}</span>
                </div>
                <ProgressBar value={c.score_moyen} max={10} color={color} height={6} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Ligne 3 : intérêts populaires */}
      <div style={{ ...S.surface, padding: "22px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
          💡 Top intérêts déclarés
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {(preferences.top_interets || []).map((item, i) => {
            const colors = [S.orange, "#a855f7", "#06b6d4", "#22c55e", "#f5c842", "#ef4444", "#3b82f6", "#ec4899"];
            const c = colors[i % colors.length];
            return (
              <div key={item.interet} style={{
                padding: "8px 16px", borderRadius: 100,
                background: `${c}12`, border: `1.5px solid ${c}30`,
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: c, textTransform: "capitalize" }}>
                  {item.interet.replace(/_/g, " ")}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 800, color: "#0d1b2a",
                  background: c, borderRadius: 100, padding: "1px 7px",
                }}>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DASHBOARD PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────
const DASH_TABS = [
  { id: "global",       label: "Vue globale",    emoji: "🌍" },
  { id: "categories",   label: "Catégories",     emoji: "🗂️" },
  { id: "budget",       label: "Budget",         emoji: "💰" },
  { id: "hotels",       label: "Hôtels",         emoji: "🏨" },
  { id: "activites",    label: "Top activités",  emoji: "🏆" },
  { id: "profil",       label: "Profil visiteur",emoji: "👤" },
];

function SectionDashboard() {
  const [activePanel, setActivePanel] = useState("global");
  const [data,        setData]        = useState({});
  const [loading,     setLoading]     = useState({});
  const [errors,      setErrors]      = useState({});
  const [hovered,     setHovered]     = useState(null);

  // Endpoints par panel
  const PANEL_ENDPOINTS = {
    global:     "/stats/global",
    categories: "/stats/categories",
    budget:     "/stats/budget",
    hotels:     "/stats/hotels",
    activites:  "/stats/top-activities?top=5",
    profil:     "/stats/user-profile",
  };

  // Chargement lazy : seulement quand on accède au panel
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
      {/* Styles inline pour animations */}
      <style>{`
        @keyframes dashSpin { to { transform: rotate(360deg); } }
        @keyframes dashFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Hero header */}
      <div style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)",
        borderBottom: "1px solid #1e3a5f",
        padding: "40px 24px 0",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Titre */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "8px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: S.orange, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>
                📊 Analytics · Plateforme Touristique
              </p>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 800, color: S.ivory, margin: 0, lineHeight: 1.1 }}>
                Dashboard — Tanger
              </h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: S.muted, marginBottom: "2px" }}>Données temps réel</div>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: "#22c55e",
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 100, padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: "5px",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Backend connecté
              </div>
            </div>
          </div>

          {/* Navigation panels */}
          <div style={{ display: "flex", gap: "2px", marginTop: "24px", overflowX: "auto" }}>
            {DASH_TABS.map(tab => {
              const isActive = activePanel === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  onMouseEnter={() => setHovered(tab.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    padding: "10px 18px", cursor: "pointer", whiteSpace: "nowrap",
                    background: isActive ? "#112240" : "none",
                    border: "none",
                    borderBottom: `2.5px solid ${isActive ? S.orange : "transparent"}`,
                    borderRadius: "8px 8px 0 0",
                    color: isActive ? S.ivory : hovered === tab.id ? "#94a3b8" : S.muted,
                    fontSize: "13px", fontWeight: isActive ? 700 : 500,
                    transition: "all 0.18s",
                  }}
                >
                  {tab.emoji} {tab.label}
                  {loading[tab.id] && (
                    <span style={{ marginLeft: "6px", display: "inline-block", width: 8, height: 8, borderRadius: "50%", border: `2px solid ${S.orange}`, borderTopColor: "transparent", animation: "dashSpin 0.6s linear infinite" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px 80px", animation: "dashFadeIn 0.35s ease" }}
        key={activePanel}
      >
        {errors[activePanel] ? (
          <div style={{
            ...S.surface, padding: "32px", textAlign: "center",
            borderColor: "#ef444440",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
            <p style={{ color: "#ef4444", fontWeight: 700, margin: "0 0 6px" }}>Erreur de chargement</p>
            <p style={{ color: S.muted, fontSize: "12px", margin: 0 }}>{errors[activePanel]}</p>
            <p style={{ color: S.muted, fontSize: "11px", margin: "8px 0 0" }}>
              Vérifiez que le backend tourne sur <code style={{ color: S.orange }}>localhost:8000</code>
            </p>
          </div>
        ) : loading[activePanel] ? (
          <Spinner />
        ) : (
          <>
            {activePanel === "global"     && <DashGlobal        data={data.global}     />}
            {activePanel === "categories" && <DashCategories     data={data.categories} />}
            {activePanel === "budget"     && <DashBudget         data={data.budget}     />}
            {activePanel === "hotels"     && <DashHotels         data={data.hotels}     />}
            {activePanel === "activites"  && <DashTopActivites   data={data.activites}  />}
            {activePanel === "profil"     && <DashUserProfile    data={data.profil}     />}
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