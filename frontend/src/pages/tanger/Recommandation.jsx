/**
 * Recommandation.jsx
 * Page recommandation IA : sélection catégorie → wizard → résultats.
 */
import { useState, useEffect, useRef } from "react";
import {
  T, recoApi, CATEGORIES,
  SectionHero, Spinner, ErrorBanner,
} from "./shared";

/* ─── Étapes ─────────────────────────────────────────────────────────────── */
const STEP = { CATEGORY: "category", QUESTIONS: "questions", RESULTS: "results" };

/* ─── Sélecteur de catégorie ──────────────────────────────────────────────── */
function CategorySelector({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h2 className="tg-serif" style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: 10 }}>
          Que cherchez-vous ?
        </h2>
        <p style={{ color: T.textMuted, fontSize: 15 }}>
          Choisissez une catégorie pour démarrer votre recommandation.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            onMouseEnter={() => setHovered(cat.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: "#fff", borderRadius: T.radius, padding: "32px 26px 28px",
              border: `1.5px solid ${hovered === cat.id ? T.primary : T.border}`,
              cursor: "pointer", textAlign: "left",
              boxShadow: hovered === cat.id ? T.shadowHover : T.shadow,
              transform: hovered === cat.id ? "translateY(-4px)" : "translateY(0)",
              transition: "all 0.22s",
            }}
          >
            <span style={{ fontSize: "2.4rem", display: "block", marginBottom: 16 }}>{cat.icon}</span>
            <h3 className="tg-serif" style={{ fontSize: "1.15rem", fontWeight: 600, color: T.text, marginBottom: 8 }}>
              {cat.label}
            </h3>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>{cat.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Wizard questions ────────────────────────────────────────────────────── */
function QuestionWizard({ category, questions, onComplete, onBack }) {
  const [idx,      setIdx]      = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [selected, setSelected] = useState(null);
  const [animKey,  setAnimKey]  = useState(0);

  const current  = questions[idx];
  const total    = questions.length;
  const progress = (idx / total) * 100;
  const isLast   = idx === total - 1;

  function advance(next) {
    if (isLast) { onComplete(next); return; }
    setIdx(i => i + 1); setSelected(null); setAnimKey(k => k + 1);
  }
  function handleNext() {
    if (selected === null && !current.is_optional) return;
    const next = { ...answers };
    if (selected !== null) next[current.field_name] = selected;
    setAnswers(next); advance(next);
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <button className="tg-btn-ghost" onClick={onBack}>← Catégories</button>
        <span className="tg-tag">{category.label}</span>
      </div>

      {/* Barre de progression */}
      <div className="tg-progress-track" style={{ marginBottom: 6 }}>
        <div className="tg-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p style={{ textAlign: "right", fontSize: 11, color: T.textMuted, marginBottom: 24 }}>
        {idx + 1} / {total}
      </p>

      <div key={animKey} style={{
        background: "#fff", borderRadius: T.radius, padding: "36px 32px",
        border: `1px solid ${T.border}`, boxShadow: T.shadow,
        animation: "tg-fadeUp 0.3s ease",
      }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: T.secondary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          Étape {idx + 1}
        </p>
        <h2 className="tg-serif" style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 6 }}>
          {current.question}
        </h2>
        {current.help_text && (
          <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>{current.help_text}</p>
        )}
        {!current.help_text && <div style={{ marginBottom: 24 }} />}

        {/* Options */}
        {current.type === "boolean" ? (
          <div style={{ display: "flex", gap: 12 }}>
            {[{ v: true, label: "Oui" }, { v: false, label: "Non" }].map(({ v, label }) => (
              <button key={String(v)} onClick={() => setSelected(v)} style={{
                flex: 1, padding: 16, borderRadius: T.radiusSm, cursor: "pointer",
                border: `1.5px solid ${selected === v ? T.primary : T.border}`,
                background: selected === v ? T.light : "#f8fafc",
                color: selected === v ? T.primary : T.textMuted,
                fontSize: 15, fontWeight: 500, transition: "all 0.18s",
                fontFamily: "'DM Sans', sans-serif",
              }}>{label}</button>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {current.options?.map(opt => (
              <button key={opt.value} onClick={() => setSelected(opt.value)} style={{
                padding: "14px 10px", borderRadius: T.radiusSm, cursor: "pointer", textAlign: "center",
                border: `1.5px solid ${selected === opt.value ? T.primary : T.border}`,
                background: selected === opt.value ? T.light : "#f8fafc",
                color: selected === opt.value ? T.primary : T.textMuted,
                transition: "all 0.18s", fontFamily: "'DM Sans', sans-serif",
              }}>
                {opt.emoji && <span style={{ fontSize: "1.4rem", display: "block", marginBottom: 5 }}>{opt.emoji}</span>}
                <span style={{ fontSize: 12, fontWeight: 500, display: "block" }}>{opt.label}</span>
                {opt.description && <span style={{ fontSize: 10, opacity: 0.6, display: "block", marginTop: 2 }}>{opt.description}</span>}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
          {current.is_optional ? (
            <button onClick={() => advance({ ...answers })} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13, textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>
              Passer
            </button>
          ) : <span />}
          <button
            className="tg-btn-primary"
            onClick={handleNext}
            disabled={selected === null && !current.is_optional}
            style={{ opacity: selected === null && !current.is_optional ? 0.4 : 1, cursor: selected === null && !current.is_optional ? "not-allowed" : "pointer" }}
          >
            {isLast ? "Voir mes recommandations" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Carte résultat ─────────────────────────────────────────────────────── */
function RecoResultCard({ item, rank }) {
  const isTop = rank === 0;
  const score = item._score ?? 0;
  const pct   = Math.round(score * 100);

  return (
    <div className="tg-card" style={{ border: isTop ? `2px solid ${T.secondary}` : `1px solid ${T.border}` }}>
      {isTop && (
        <div style={{ background: T.primary, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", textAlign: "center" }}>
          Meilleur choix
        </div>
      )}
      <div style={{
        height: 160,
        background: item.image ? `url(${item.image}) center/cover no-repeat, ${T.light}` : T.light,
        position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,118,110,0.3), transparent)" }} />
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h3 className="tg-serif" style={{ fontSize: "1.05rem", fontWeight: 600 }}>{item.nom}</h3>
          {item.rating && <span className="tg-rating">★ {Number(item.rating).toFixed(1)}</span>}
        </div>
        {item.description && (
          <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.description}
          </p>
        )}
        {score > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginBottom: 4 }}>
              <span>Pertinence</span><span>{pct}%</span>
            </div>
            <div className="tg-progress-track">
              <div className="tg-progress-bar" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <div>
            {item.prix_min != null && (
              <>
                <span style={{ fontSize: 10, color: T.textMuted, display: "block" }}>À partir de</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.prix_min}{item.prix_max ? `–${item.prix_max}` : ""} MAD</span>
              </>
            )}
          </div>
          <button className="tg-btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>Voir plus</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Grille résultats ───────────────────────────────────────────────────── */
function ResultCards({ results, category, onReset, onRetry }) {
  const items = results?.resultats || [];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <p className="tg-section-label">{category.label}</p>
          <h2 className="tg-serif" style={{ fontSize: "1.7rem", fontWeight: 600 }}>
            {items.length} résultat{items.length > 1 ? "s" : ""} personnalisé{items.length > 1 ? "s" : ""}
          </h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="tg-btn-ghost" onClick={onRetry}>Modifier</button>
          <button className="tg-btn-primary" onClick={onReset}>Recommencer</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>Aucun résultat — essayez d'élargir vos critères.</p>
          <button className="tg-btn-outline" onClick={onRetry}>Modifier les préférences</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {items.map((item, i) => (
            <RecoResultCard key={item.id || item.nom || i} item={item} rank={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Loader animé ───────────────────────────────────────────────────────── */
function RecoLoader() {
  const msgs = ["Analyse de vos préférences…", "Consultation de la base de données…", "Scoring des meilleures adresses…"];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 20 }}>
      <div className="tg-spinner" />
      <p style={{ color: T.textMuted, fontSize: 13 }}>{msgs[idx]}</p>
    </div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Recommandation() {
  const [step,      setStep]      = useState(STEP.CATEGORY);
  const [category,  setCategory]  = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [results,   setResults]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  async function handleCategorySelect(cat) {
    setError(null); setLoading(true);
    try {
      const data = await recoApi.getQuestions(cat.id);
      setCategory(cat); setQuestions(data.questions); setAnswers({});
      setStep(STEP.QUESTIONS);
    } catch {
      setError("Impossible de charger les questions. Vérifiez que le backend est actif.");
    } finally { setLoading(false); }
  }

  async function handleWizardComplete(collectedAnswers) {
    setError(null); setLoading(true); setAnswers(collectedAnswers);
    try {
      const data = await recoApi.getRecommandations({ categorie: category.id, ...collectedAnswers });
      setResults(data); setStep(STEP.RESULTS);
    } catch {
      setError("Erreur lors de la génération des recommandations.");
    } finally { setLoading(false); }
  }

  function handleReset() {
    setStep(STEP.CATEGORY); setCategory(null);
    setQuestions([]); setAnswers({}); setResults(null); setError(null);
  }

  const stepList = [
    { n: 1, label: "Catégorie", key: STEP.CATEGORY },
    { n: 2, label: "Questions", key: STEP.QUESTIONS },
    { n: 3, label: "Résultats", key: STEP.RESULTS },
  ];
  const stepIdx = stepList.findIndex(s => s.key === step);

  return (
    <>
      <SectionHero
        label="Recommandation IA"
        title={<>Votre séjour <em style={{ fontStyle: "italic", color: T.light }}>sur mesure</em></>}
        subtitle="Répondez à quelques questions — notre IA trouve les meilleures adresses de Tanger pour vous."
      />

      {/* Stepper */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            {stepList.map((s, i) => {
              const isActive = step === s.key;
              const isDone   = stepIdx > i;
              return (
                <span key={s.n} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <span style={{ width: 48, height: 1, background: isDone ? T.secondary : T.border, margin: "0 4px" }} />}
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600,
                      background: isActive ? T.primary : isDone ? T.light : "#f1f5f9",
                      color: isActive ? "#fff" : isDone ? T.primary : T.textMuted,
                      border: `1.5px solid ${isActive || isDone ? T.primary : T.border}`,
                      transition: "all 0.3s",
                    }}>
                      {isDone ? "✓" : s.n}
                    </span>
                    <span style={{ fontSize: 11, color: isActive ? T.primary : T.textMuted }}>{s.label}</span>
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 24px 80px" }} ref={topRef}>
        {error && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fecaca", borderRadius: T.radiusSm,
            padding: "14px 18px", color: "#b91c1c", fontSize: 13, marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c", fontSize: 16 }}>✕</button>
          </div>
        )}

        {loading && <RecoLoader />}
        {!loading && step === STEP.CATEGORY  && <CategorySelector onSelect={handleCategorySelect} />}
        {!loading && step === STEP.QUESTIONS && (
          <QuestionWizard
            category={category}
            questions={questions}
            onComplete={handleWizardComplete}
            onBack={handleReset}
          />
        )}
        {!loading && step === STEP.RESULTS && results && (
          <ResultCards
            results={results}
            category={category}
            preferences={answers}
            onReset={handleReset}
            onRetry={() => setStep(STEP.QUESTIONS)}
          />
        )}
      </div>
    </>
  );
}