/**
 * Recommandation.jsx — Premium UI/UX Redesign v6
 * ─────────────────────────────────────────────────
 * CHANGEMENTS v6 :
 *  - Emojis supprimés des tags intelligents
 *  - Bordure du bouton "Commencer" supprimée
 *  - Nouvelles photos de fond pour les catégories (Tanger / Maroc)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, MapPin, Star, ChevronRight, ChevronLeft,
  X, ArrowLeft, RotateCcw, SlidersHorizontal,
  Brain, DollarSign, Clock, Camera, Info, Award,
  Loader2, AlertCircle, CheckCircle2, Zap,
  Heart, Share2, Navigation, MessageCircle, ExternalLink,
  ThumbsUp, Eye, Compass, TrendingUp
} from "lucide-react";
import InteractiveMapPage from "../InteractiveMapPage";
import {
  T, recoApi, CATEGORIES,
  SectionHero, Spinner, ErrorBanner,
  isFavori, toggleFavori
} from "./SharedTanger";

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS — REUSABLE
═══════════════════════════════════════════════════════════════════════════ */
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES — PREMIUM (injectées une seule fois)
═══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_STYLES = `
  @keyframes tg-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tg-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes tg-shimmer-slide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes tg-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes tg-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }

  .tg-shimmer-card {
    background: linear-gradient(90deg, #f0f4f8 25%, #e8eef4 50%, #f0f4f8 75%);
    background-size: 800px 100%;
    animation: tg-shimmer 1.6s infinite linear;
    position: relative;
    overflow: hidden;
  }
  .tg-shimmer-card::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    animation: tg-shimmer-slide 1.8s infinite;
  }

  /* ── Category card hover ── */
  .tg-cat-card {
    transition: all 0.35s cubic-bezier(.34,1.56,.64,1);
    position: relative;
  }
  .tg-cat-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  }

  /* ── Result card hover ── */
  .tg-result-card {
    transition: all 0.35s cubic-bezier(.34,1.56,.64,1);
    cursor: pointer;
  }
  .tg-result-card:hover .tg-card-img {
    transform: scale(1.08);
  }
  .tg-card-img {
    transition: transform 0.6s cubic-bezier(.25,.46,.45,.94);
  }
  .tg-result-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 60px rgba(15,118,110,0.15), 0 0 0 1px rgba(14,165,233,0.1);
  }

  /* ── Primary button ── */
  .tg-btn-primary-new {
    background: linear-gradient(135deg, #0f7a6e 0%, #0ea5e9 100%);
    color: #fff; border: none; border-radius: 14px;
    padding: 12px 24px; font-size: 14px; font-weight: 600;
    cursor: pointer; letter-spacing: 0.01em;
    transition: all 0.3s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 4px 18px rgba(15,122,110,0.3);
    font-family: 'Inter', sans-serif;
    position: relative; overflow: hidden;
  }
  .tg-btn-primary-new::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.3s;
  }
  .tg-btn-primary-new:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(15,122,110,0.4);
  }
  .tg-btn-primary-new:hover::before { opacity: 1; }
  .tg-btn-primary-new:active { transform: translateY(0); }
  .tg-btn-primary-new:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

  /* ── Ghost button ── */
  .tg-btn-ghost-new {
    background: rgba(15,122,110,0.06); color: #0f7a6e;
    border: 1.5px solid rgba(15,122,110,0.18);
    border-radius: 14px; padding: 10px 20px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.25s; font-family: 'Inter', sans-serif;
    backdrop-filter: blur(4px);
  }
  .tg-btn-ghost-new:hover {
    background: rgba(15,122,110,0.12); border-color: #0f7a6e;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15,122,110,0.1);
  }

  /* ── Option button ── */
  .tg-opt-btn {
    transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
    font-family: 'Inter', sans-serif;
    position: relative; overflow: hidden;
  }
  .tg-opt-btn:hover { transform: scale(1.03); }

  /* ── Custom scrollbar for modals ── */
  .tg-modal-scroll::-webkit-scrollbar { width: 6px; }
  .tg-modal-scroll::-webkit-scrollbar-track { background: transparent; }
  .tg-modal-scroll::-webkit-scrollbar-thumb {
    background: rgba(15,118,110,0.15); border-radius: 99px;
  }
  .tg-modal-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(15,118,110,0.3);
  }

  /* ── Tag préférence ── */
  .tg-pref-tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 99px;
    background: rgba(249,115,22,0.08); color: #ea580c;
    border: 1px solid rgba(249,115,22,0.2);
    white-space: nowrap;
    transition: all 0.2s;
  }
  .tg-pref-tag:hover {
    background: rgba(249,115,22,0.14);
    border-color: rgba(249,115,22,0.35);
  }
`;

function injectStyles() {
  if (typeof document !== "undefined" && !document.getElementById("tg-premium-styles")) {
    const el = document.createElement("style");
    el.id = "tg-premium-styles";
    el.textContent = GLOBAL_STYLES;
    document.head.appendChild(el);
  }
}

/* ─── Étapes ─────────────────────────────────────────────────────────────── */
const STEP = { CATEGORY: "category", QUESTIONS: "questions", RESULTS: "results" };

/* ═══════════════════════════════════════════════════════════════════════════
   NOUVELLES PHOTOS DE FOND POUR LES CATÉGORIES — Tanger / Maroc
═══════════════════════════════════════════════════════════════════════════ */
const CATEGORY_PHOTOS = [
  // Hôtels & Riads — riad marocain authentique
 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf3jRLeyD6clnG0ua-wKleexXoj2sMHSUj-w&s", 
  // Restaurants & Cafés — cuisine marocaine / tagine
   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA_1GCpYv3cJ5FoomuAi0OqgKSf4mIDPHpfw&s",
  // Plages & Nature — plage de Tanger / détroit
 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj_PxxybxYOtwgGQo-ObxgmFnr7bRGSZaIKg&s",  // Activités — médina / ruelles marocaines
 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScgNKx0ZHlwyaql2v-cwRzhgz--RlscS_YHg&s",];

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITAIRE — Formatage des valeurs de préférences pour affichage
═══════════════════════════════════════════════════════════════════════════ */
function formatPrefValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "string") {
    return value
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  if (typeof value === "number") return String(value);
  return String(value);
}

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE IA — PREMIUM GLASS (utilisé dans le modal détail seulement)
═══════════════════════════════════════════════════════════════════════════ */
function AIBadge({ small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: small
        ? "rgba(255,255,255,0.15)"
        : "linear-gradient(135deg, rgba(15,122,110,0.1), rgba(14,165,233,0.1))",
      border: small
        ? "1px solid rgba(255,255,255,0.25)"
        : "1px solid rgba(15,122,110,0.2)",
      borderRadius: 99, padding: small ? "4px 10px" : "6px 14px",
      fontSize: small ? 10 : 11, fontWeight: 700,
      color: small ? "#fff" : "#0f7a6e",
      letterSpacing: "0.05em", textTransform: "uppercase",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxShadow: "0 2px 8px rgba(15,122,110,0.08)",
    }}>
      <Sparkles size={small ? 10 : 12} />
      Recommandé par l'IA
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY SELECTOR — PHOTOS DE FOND + BOUTON SANS BORDURE
═══════════════════════════════════════════════════════════════════════════ */
function CategorySelector({ onSelect }) {
  injectStyles();

  return (
    <div>
      {/* En-tête section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ marginBottom: 52, textAlign: "center" }}
      >
        {/* IA badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(15,122,110,0.06)", borderRadius: 99,
            padding: "8px 20px", marginBottom: 20,
            border: "1px solid rgba(15,122,110,0.1)",
          }}
        >
          <Brain size={15} color="#0f7a6e" />
          <span style={{
            fontSize: 12, fontWeight: 700, color: "#0f7a6e",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Moteur de recommandation Explore212
          </span>
        </motion.div>

        <h2 style={{
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, color: "#0f172a",
          marginBottom: 14, fontFamily: "'Playfair Display', Georgia, serif",
          lineHeight: 1.25,
        }}>
          Que recherchez-vous à Tanger ?
        </h2>
       
      </motion.div>

      {/* Grille catégories */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.id}
            className="tg-cat-card"
            variants={staggerItem}
            onClick={() => onSelect(cat)}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              backgroundImage: `url(${CATEGORY_PHOTOS[i % CATEGORY_PHOTOS.length]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 24,
              padding: "0",
              border: "none",
              cursor: "pointer", textAlign: "left",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              position: "relative", overflow: "hidden",
              minHeight: 220,
            }}
          >
            {/* Overlay gradient sombre */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "inherit",
              background: "linear-gradient(to top, rgba(8,15,25,0.82) 0%, rgba(8,15,25,0.45) 55%, rgba(8,15,25,0.15) 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }} />

            {/* Contenu de la carte */}
            <div style={{
              position: "relative", zIndex: 2,
              padding: "28px 24px 24px",
              display: "flex", flexDirection: "column",
              height: "100%", minHeight: 220,
              justifyContent: "flex-end",
            }}>
              {/* Icon en haut */}
              <div style={{
                position: "absolute", top: 20, left: 24,
                fontSize: "1.8rem",
              }}>
                {cat.icon}
              </div>

              <h3 style={{
                fontSize: "1.15rem", fontWeight: 700, color: "#fff",
                marginBottom: 6, fontFamily: "'Inter', sans-serif",
              }}>
                {cat.label}
              </h3>
              <p style={{
                fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, marginBottom: 16,
              }}>
                {cat.description}
              </p>

              {/* Bouton Commencer — sans bordure */}
              
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUESTION WIZARD — PREMIUM INTERACTIVE
═══════════════════════════════════════════════════════════════════════════ */
function QuestionWizard({ category, questions, onComplete, onBack }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animKey, setAnimKey] = useState(0);
  const [dir, setDir] = useState(1);

  const current = questions[idx];
  const total = questions.length;
  const progress = ((idx) / total) * 100;
  const isLast = idx === total - 1;

  function advance(next) {
    if (isLast) { onComplete(next); return; }
    setDir(1);
    setIdx(i => i + 1);
    setAnimKey(k => k + 1);
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      {/* Wizard header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}
      >
        <motion.button
          className="tg-btn-ghost-new"
          onClick={onBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", gap: 7 }}
        >
          <ArrowLeft size={14} />
          Catégories
        </motion.button>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(15,122,110,0.06)", borderRadius: 99,
          padding: "7px 16px",
          border: "1px solid rgba(15,122,110,0.1)",
        }}>
          <span style={{ fontSize: "1.1rem" }}>{category.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0f7a6e" }}>{category.label}</span>
        </div>
      </motion.div>

      {/* Premium progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          height: 6, borderRadius: 99,
          background: "rgba(15,122,110,0.08)",
          overflow: "hidden", position: "relative",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
        }}>
          <motion.div
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              borderRadius: 99,
              background: T.gradientPrimary,
              boxShadow: "0 0 12px rgba(14,165,233,0.3)",
            }}
            initial={{ width: `${((idx - 1) / total) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
            Question {idx + 1} sur {total}
          </span>
          <span style={{ fontSize: 12, color: "#0f7a6e", fontWeight: 700 }}>
            {Math.round((idx / total) * 100)}% complété
          </span>
        </div>
      </div>

      {/* Animated question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -dir * 80, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "44px 40px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative gradient corner */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 160, height: 160, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(15,122,110,0.04), rgba(14,165,233,0.04))",
            pointerEvents: "none",
          }} />

          {/* Step badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ marginBottom: 22 }}
          >
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#0f7a6e",
              letterSpacing: "0.1em", textTransform: "uppercase",
              background: "rgba(15,122,110,0.06)", padding: "5px 14px",
              borderRadius: 99, display: "inline-block",
              border: "1px solid rgba(15,122,110,0.1)",
            }}>
              Étape {idx + 1}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: "1.5rem", fontWeight: 700, color: "#0f172a",
              marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1.35,
              position: "relative", zIndex: 2,
            }}
          >
            {current.question}
          </motion.h2>

          {current.help_text && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{
                fontSize: 14, color: "#64748b", marginBottom: 30,
                lineHeight: 1.65, display: "flex", alignItems: "flex-start", gap: 8,
              }}
            >
              <Info size={14} style={{ marginTop: 3, flexShrink: 0, color: "#94a3b8" }} />
              {current.help_text}
            </motion.p>
          )}
          {!current.help_text && <div style={{ marginBottom: 30 }} />}

          {/* Boolean options */}
          {current.type === "boolean" ? (
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { v: true, label: "Oui" },
                { v: false, label: "Non" },
              ].map(({ v, label }) => (
                <motion.button
                  key={String(v)}
                  className="tg-opt-btn"
                  onClick={() => {
                    const nextAnswers = { ...answers, [current.field_name]: v };
                    setAnswers(nextAnswers);
                    advance(nextAnswers);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: "22px 18px",
                    borderRadius: 18, cursor: "pointer",
                    border: "2px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#64748b",
                    fontSize: 16, fontWeight: 600,
                    transition: "all 0.25s",
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          ) : (
            /* Multiple choice options */
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 12,
            }}>
              {current.options?.map((opt, oi) => (
                <motion.button
                  key={opt.value}
                  className="tg-opt-btn"
                  onClick={() => {
                    const nextAnswers = { ...answers, [current.field_name]: opt.value };
                    setAnswers(nextAnswers);
                    advance(nextAnswers);
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + oi * 0.04 }}
                  style={{
                    padding: "18px 12px",
                    borderRadius: 16, cursor: "pointer", textAlign: "center",
                    border: "2px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#475569",
                    transition: "all 0.25s",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, display: "block" }}>{opt.label}</span>
                  {opt.description && (
                    <span style={{ fontSize: 10, color: "#94a3b8", display: "block", marginTop: 4, lineHeight: 1.4 }}>
                      {opt.description}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 32, paddingTop: 24,
            borderTop: "1px solid #f1f5f9",
          }}>
            {current.is_optional ? (
              <motion.button
                onClick={() => advance({ ...answers })}
                whileHover={{ x: 2 }}
                style={{
                  background: "none", border: "none", color: "#94a3b8",
                  cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif",
                  textDecoration: "underline", textDecorationColor: "#cbd5e1",
                  textUnderlineOffset: 3,
                }}
              >
                Passer cette question
              </motion.button>
            ) : <span />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IMAGE CAROUSEL — PREMIUM
═══════════════════════════════════════════════════════════════════════════ */
function ImageCarousel({ images = [], heroImage }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const allImages = heroImage ? [heroImage, ...images] : [...images];

  if (allImages.length === 0) return null;

  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            height: 320, position: "relative",
            borderRadius: "28px 28px 0 0", overflow: "hidden",
            background: `url(${allImages[activeIdx]}) center/cover no-repeat`,
          }}
        >
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%)",
          }} />
        </motion.div>
      </AnimatePresence>

      {allImages.length > 1 && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: 6,
          background: "rgba(0,0,0,0.2)",
          backdropFilter: "blur(8px)",
          borderRadius: 99, padding: "4px 10px",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                width: activeIdx === i ? 20 : 8, height: 8,
                borderRadius: 99, border: "none", cursor: "pointer",
                background: activeIdx === i ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "all 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {allImages.length > 1 && (
        <>
          <button
            onClick={() => setActiveIdx(i => (i - 1 + allImages.length) % allImages.length)}
            style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setActiveIdx(i => (i + 1) % allImages.length)}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL MODAL — PREMIUM GLASS + ANIMATED
═══════════════════════════════════════════════════════════════════════════ */
function DetailModal({ item, rank, onClose }) {
  const navigate = useNavigate();
  const score = item._score ?? 0;
  const pct = Math.round(score * 100);
  const isTop = rank === 0;
  const [liked, setLiked] = useState(isFavori(item));

  useEffect(() => {
    const handleSync = () => setLiked(isFavori(item));
    window.addEventListener("favoris-updated", handleSync);
    return () => window.removeEventListener("favoris-updated", handleSync);
  }, [item]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const allPhotos = item.photos && item.photos.length > 0 ? item.photos : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={e => e.stopPropagation()}
          className="tg-modal-scroll"
          style={{
            background: "#fff", borderRadius: 28,
            maxWidth: 720, width: "100%",
            maxHeight: "90vh", overflow: "auto",
            boxShadow: "0 40px 120px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
            position: "relative",
          }}
        >
          {/* Image carousel */}
          <ImageCarousel images={allPhotos} heroImage={item.image} />

          {/* Overlay content on image */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 320, pointerEvents: "none",
          }}>
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "#fff", pointerEvents: "auto",
              }}
            >
              <X size={18} />
            </motion.button>

            {/* Like button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              onClick={() => {
                const active = toggleFavori(item);
                setLiked(active);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: "absolute", top: 16, right: 70,
                width: 44, height: 44, borderRadius: "50%",
                background: liked ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                border: liked ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: liked ? "#f87171" : "#fff", pointerEvents: "auto",
              }}
            >
              <Heart size={18} fill={liked ? "#f87171" : "none"} />
            </motion.button>

            {/* Badge IA dans le modal */}
            <div style={{
              position: "absolute", bottom: 20, left: 20,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <AIBadge small />
            </div>

            {/* Rating badge */}
            {item.rating && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  position: "absolute", top: 16, left: 16,
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 99, padding: "7px 14px",
                  display: "flex", alignItems: "center", gap: 6,
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  {Number(item.rating).toFixed(1)}
                </span>
              </motion.div>
            )}
          </div>

          {/* Detail content */}
          <div style={{ padding: "32px 36px 36px" }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 style={{
                fontSize: "1.7rem", fontWeight: 800, color: "#0f172a",
                marginBottom: 8,
                fontFamily: "'Playfair Display', Georgia, serif",
                lineHeight: 1.3,
              }}>
                {item.nom}
              </h2>

              {item.adresse && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 7,
                  color: "#64748b", fontSize: 13, marginBottom: 20,
                }}>
                  <MapPin size={14} color="#0f7a6e" />
                  {item.adresse}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{ height: 1, background: "#f1f5f9", margin: "16px 0", transformOrigin: "left" }}
            />

            {item.description && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{ marginBottom: 24 }}
              >
                <h3 style={{
                  fontSize: 12, fontWeight: 700, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Info size={12} />
                  À propos
                </h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                  {item.description}
                </p>
              </motion.div>
            )}

            {/* Practical info grid */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}
            >
              {item.prix_min != null && (
                <div style={{
                  background: "#f8fafc", borderRadius: 16,
                  padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
                  border: "1px solid #f1f5f9",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "rgba(15,122,110,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <DollarSign size={17} color="#0f7a6e" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Tarif
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                      {item.prix_min}{item.prix_max ? `–${item.prix_max}` : ""} MAD
                    </div>
                  </div>
                </div>
              )}
              {item.horaires && (
                <div style={{
                  background: "#f8fafc", borderRadius: 16,
                  padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
                  border: "1px solid #f1f5f9",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "rgba(14,165,233,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Clock size={17} color="#0ea5e9" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Horaires
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                      {typeof item.horaires === "object" && item.horaires !== null
                        ? Object.entries(item.horaires)
                          .map(([jour, h]) => `${jour.charAt(0).toUpperCase() + jour.slice(1)} : ${h}`)
                          .join(" · ")
                        : item.horaires}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Photo gallery */}
            {allPhotos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginBottom: 24 }}
              >
                <h3 style={{
                  fontSize: 12, fontWeight: 700, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  marginBottom: 12, display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Camera size={13} />
                  Galerie photos
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {allPhotos.slice(0, 6).map((photo, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        height: 100, borderRadius: 14, overflow: "hidden",
                        background: `url(${photo}) center/cover no-repeat, #e2e8f0`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Map */}
            {item.latitude && item.longitude ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{ marginBottom: 24, borderRadius: 18, overflow: "hidden", border: "1px solid #e2e8f0" }}
              >
                <InteractiveMapPage
                  latitude={item.latitude}
                  longitude={item.longitude}
                  name={item.nom}
                  category={item.categorie || item.category || item.type}
                  address={item.adresse}
                  image={item.image}
                  height={240}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{
                  marginBottom: 24, borderRadius: 18, overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  background: "linear-gradient(135deg, #f0fdfa, #ecfeff)",
                  height: 160,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <Navigation size={28} color="#0f7a6e" style={{ opacity: 0.6 }} />
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                  Carte interactive
                </span>
                {item.adresse && (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {item.adresse}
                  </span>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ display: "flex", gap: 10 }}
            >
              <button
                className="tg-btn-primary-new"
                onClick={() => { onClose(); navigate("/map", { state: item }); }}
                style={{
                  flex: 1, padding: "14px", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 14,
                }}
              >
                <MapPin size={15} />
                Voir sur la carte
              </button>
              <motion.button
                className="tg-btn-ghost-new"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "14px 20px",
                }}
              >
                <Share2 size={14} />
                Partager
              </motion.button>
              <motion.button
                className="tg-btn-ghost-new"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "14px 20px",
                }}
              >
                <X size={14} />
                Fermer
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GÉNÉRATION DES TAGS INTELLIGENTS — SANS EMOJIS
═══════════════════════════════════════════════════════════════════════════ */

// Normalise une valeur de réponse en label lisible
function normalizePref(key, value) {
  if (value === null || value === undefined || value === false) return null;
  if (typeof value === "boolean") return null;
  if (typeof value === "string") {
    return value.replace(/_/g, " ").replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  if (typeof value === "number") return String(value);
  return String(value);
}

// Extrait les caractéristiques de l'item depuis ses champs
function extractItemFeatures(item) {
  const features = [];

  if (item.prix_min != null) {
    if (item.prix_min < 300) features.push("Économique");
    else if (item.prix_min < 800) features.push("Prix abordable");
    else features.push("Haut de gamme");
  }
  if (item.type_activite) features.push(item.type_activite.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
  if (item.categorie) features.push(item.categorie.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
  if (item.N_etoiles) features.push(`${item.N_etoiles} étoiles`);

  const desc = (item.description || "").toLowerCase();
  if (desc.includes("piscine")) features.push("Piscine");
  if (desc.includes("spa")) features.push("Spa");
  if (desc.includes("wifi")) features.push("Wi-Fi");
  if (desc.includes("parking")) features.push("Parking");
  if (desc.includes("restaurant")) features.push("Restaurant sur place");
  if (desc.includes("famil")) features.push("Familial");
  if (desc.includes("histori") || desc.includes("médina") || desc.includes("medina")) features.push("Médina historique");
  if (desc.includes("architectur")) features.push("Architecture marocaine");
  if (desc.includes("vue mer") || desc.includes("bord de mer")) features.push("Vue mer");
  if (desc.includes("calme") || desc.includes("tranquil")) features.push("Calme");
  if (desc.includes("animé") || desc.includes("central")) features.push("Centre-ville");
  if (desc.includes("proximit") || desc.includes("attraction")) features.push("Proche des attractions");
  if (desc.includes("authentiq")) features.push("Ambiance authentique");

  const addr = (item.adresse || "").toLowerCase();
  if (addr.includes("centre") || addr.includes("médina") || addr.includes("medina")) {
    if (!features.includes("Centre-ville")) features.push("Centre-ville");
  }

  return [...new Set(features)];
}

// Construit la liste finale des tags avec flag "match"
function buildSmartTags(item, answers) {
  const userPrefs = Object.entries(answers)
    .filter(([, v]) => v !== null && v !== undefined && v !== false)
    .map(([k, v]) => normalizePref(k, v))
    .filter(Boolean)
    .map(p => p.toLowerCase());

  const itemFeatures = extractItemFeatures(item);
  const tags = [];

  userPrefs.forEach(pref => {
    const matchingFeature = itemFeatures.find(f =>
      f.toLowerCase().includes(pref) || pref.includes(f.toLowerCase())
    );
    if (matchingFeature) {
      tags.push({ label: matchingFeature, match: true });
    } else {
      tags.push({ label: pref.replace(/\b\w/g, c => c.toUpperCase()), match: true });
    }
  });

  itemFeatures.forEach(f => {
    const alreadyIn = tags.some(t => t.label.toLowerCase() === f.toLowerCase());
    if (!alreadyIn) tags.push({ label: f, match: false });
  });

  const seen = new Set();
  return tags.filter(t => {
    const k = t.label.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 4);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RECO RESULT CARD — PREMIUM v6 (sans emojis dans les tags)
═══════════════════════════════════════════════════════════════════════════ */
function RecoResultCard({ item, rank, answers = {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [liked, setLiked] = useState(isFavori(item));
  const isTop = rank === 0;

  useEffect(() => {
    const handleSync = () => setLiked(isFavori(item));
    window.addEventListener("favoris-updated", handleSync);
    return () => window.removeEventListener("favoris-updated", handleSync);
  }, [item]);

  const smartTags = buildSmartTags(item, answers);

  return (
    <>
      <motion.div
        className="tg-result-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: rank * 0.08 }}
        whileHover={{ y: -6 }}
        style={{
          background: "#fff",
          borderRadius: 22,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: isTop
            ? "0 8px 32px rgba(15,118,110,0.12)"
            : "0 4px 16px rgba(0,0,0,0.04)",
          position: "relative",
          cursor: "pointer",
        }}
        onClick={() => setModalOpen(true)}
      >
        {/* Image section */}
        <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
          <div
            className="tg-card-img"
            style={{
              position: "absolute", inset: 0,
              background: item.image
                ? `url(${item.image}) center/cover no-repeat`
                : "linear-gradient(135deg, rgba(15,122,110,0.1), rgba(14,165,233,0.1))",
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 55%)",
          }} />

          {/* Rating badge */}
          {item.rating && (
            <div style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              borderRadius: 99, padding: "5px 12px",
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}>
              <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                {Number(item.rating).toFixed(1)}
              </span>
            </div>
          )}

          {/* Rank number */}
          <div style={{
            position: "absolute", top: 14, left: 14,
            width: 30, height: 30, borderRadius: "50%",
            background: isTop
              ? "linear-gradient(135deg, #f97316, #ea580c)"
              : "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 11, fontWeight: 800,
            boxShadow: isTop ? "0 4px 12px rgba(249,115,22,0.4)" : "none",
          }}>
            #{rank + 1}
          </div>

          {/* Badge MEILLEUR CHOIX — carte #1 uniquement */}
          {isTop && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                position: "absolute", bottom: 14, left: 14,
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(15,23,42,0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1.5px solid rgba(249,115,22,0.75)",
                borderRadius: 99,
                padding: "5px 12px",
                boxShadow: "0 2px 10px rgba(249,115,22,0.2)",
              }}
            >
              <Award size={11} color="#f97316" />
              <span style={{
                fontSize: 9, fontWeight: 800, color: "#fff",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Meilleur choix
              </span>
            </motion.div>
          )}

          {/* Like button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              const active = toggleFavori(item);
              setLiked(active);
            }}
            style={{
              position: "absolute", bottom: 14, right: 14,
              width: 34, height: 34, borderRadius: "50%",
              background: liked ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: liked ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.25)",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: liked ? "#f87171" : "#fff",
              padding: 0,
            }}
          >
            <Heart size={14} fill={liked ? "#f87171" : "none"} />
          </motion.button>
        </div>

        {/* Card body */}
        <div style={{ padding: "20px 22px 22px" }}>
          <div style={{ marginBottom: 10 }}>
            <h3 style={{
              fontSize: "1.1rem", fontWeight: 700, color: "#0f172a",
              marginBottom: 5, fontFamily: "'Inter', sans-serif",
            }}>
              {item.nom}
            </h3>
            {item.adresse && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12 }}>
                <MapPin size={11} />
                {item.adresse}
              </div>
            )}
          </div>

          {item.description && (
            <p style={{
              fontSize: 12, color: "#64748b", lineHeight: 1.65, marginBottom: 14,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {item.description}
            </p>
          )}

          {/* Tags intelligents — sans emojis */}
          {smartTags.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, color: "#94a3b8", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.06em",
                display: "flex", alignItems: "center", gap: 4,
                marginBottom: 8,
              }}>
                <Sparkles size={10} color="#94a3b8" />
                Pourquoi ce choix
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {smartTags.map((tag, i) => (
                  <span key={i} style={{
                    display: "inline-flex", alignItems: "center",
                    fontSize: 11, fontWeight: tag.match ? 700 : 500,
                    padding: "4px 11px",
                    borderRadius: 99,
                    background: tag.match
                      ? "rgba(249,115,22,0.08)"
                      : "rgba(100,116,139,0.06)",
                    color: tag.match ? "#ea580c" : "#64748b",
                    border: tag.match
                      ? "1.5px solid #f97316"
                      : "1.5px solid #e2e8f0",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 16, borderTop: "1px solid #f1f5f9",
          }}>
            <div>
              {item.prix_min != null ? (
                <>
                  <span style={{ fontSize: 10, color: "#94a3b8", display: "block", fontWeight: 500 }}>À partir de</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                    {item.prix_min}{item.prix_max ? `–${item.prix_max}` : ""}&nbsp;
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>MAD</span>
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Prix sur demande</span>
              )}
            </div>
            <motion.button
              className="tg-btn-primary-new"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "9px 18px", fontSize: 12,
                display: "flex", alignItems: "center", gap: 5,
              }}
              onClick={e => { e.stopPropagation(); setModalOpen(true); }}
            >
              Voir plus
              <ChevronRight size={13} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {modalOpen && (
          <DetailModal item={item} rank={rank} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESULT CARDS GRID
═══════════════════════════════════════════════════════════════════════════ */
function ResultCards({ results, category, preferences = {}, onReset, onRetry }) {
  const items = results?.resultats || [];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 16, marginBottom: 40,
        }}
      >
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(15,122,110,0.06)", borderRadius: 99,
            padding: "6px 16px", marginBottom: 12,
            border: "1px solid rgba(15,122,110,0.08)",
          }}>
            <span style={{ fontSize: "1rem" }}>{category.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0f7a6e" }}>{category.label}</span>
          </div>
          <h2 style={{
            fontSize: "clamp(1.4rem, 3vw, 1.85rem)", fontWeight: 800, color: "#0f172a",
            fontFamily: "'Playfair Display', Georgia, serif",
            lineHeight: 1.25,
          }}>
            {items.length} résultat{items.length > 1 ? "s" : ""} personnalisé{items.length > 1 ? "s" : ""}
          </h2>
        
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
            className="tg-btn-ghost-new"
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <SlidersHorizontal size={13} />
            Modifier
          </motion.button>
          <motion.button
            className="tg-btn-primary-new"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RotateCcw size={13} />
            Recommencer
          </motion.button>
        </div>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: "center", padding: "80px 24px",
            background: "linear-gradient(135deg, #f8fafc, #f0fdfa)",
            borderRadius: 24,
            border: "1.5px dashed #e2e8f0",
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(15,122,110,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <Brain size={30} color="#0f7a6e" />
          </div>
          <h3 style={{
            fontSize: "1.25rem", fontWeight: 700, color: "#0f172a",
            marginBottom: 10, fontFamily: "'Inter', sans-serif",
          }}>
            Aucun résultat trouvé
          </h3>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Essayez d'élargir vos critères de recherche.
          </p>
          <motion.button
            className="tg-btn-ghost-new"
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Modifier mes préférences
          </motion.button>
        </motion.div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
        }}>
          {items.map((item, i) => (
            <RecoResultCard
              key={item.id || item.nom || i}
              item={item}
              rank={i}
              answers={preferences}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADER — PREMIUM SKELETON
═══════════════════════════════════════════════════════════════════════════ */
function RecoLoader() {
  const msgs = [
    "Analyse de vos préférences…",
    "Consultation de la base de données…",
    "Scoring des meilleures adresses…",
    "Finalisation des recommandations…",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "100px 20px", gap: 28,
      }}
    >
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid rgba(15,122,110,0.08)",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#0f7a6e",
          borderRightColor: "rgba(14,165,233,0.3)",
          animation: "tg-spin 0.8s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: "50%", transform: "translate(-50%,-50%)",
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(15,122,110,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Brain size={20} color="#0f7a6e" style={{ animation: "tg-float 2s ease-in-out infinite" }} />
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 900 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ borderRadius: 22, overflow: "hidden", border: "1px solid #e2e8f0" }}
            >
              <div className="tg-shimmer-card" style={{ height: 180 }} />
              <div style={{ padding: "18px 20px" }}>
                <div className="tg-shimmer-card" style={{ height: 18, borderRadius: 10, marginBottom: 10 }} />
                <div className="tg-shimmer-card" style={{ height: 12, borderRadius: 8, width: "70%", marginBottom: 18 }} />
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                  <div className="tg-shimmer-card" style={{ height: 22, width: 70, borderRadius: 99 }} />
                  <div className="tg-shimmer-card" style={{ height: 22, width: 80, borderRadius: 99 }} />
                  <div className="tg-shimmer-card" style={{ height: 22, width: 60, borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div className="tg-shimmer-card" style={{ height: 32, width: 80, borderRadius: 10 }} />
                  <div className="tg-shimmer-card" style={{ height: 32, width: 90, borderRadius: 12 }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          style={{
            color: "#64748b", fontSize: 14, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <Loader2 size={14} style={{ animation: "tg-spin 0.8s linear infinite" }} />
          {msgs[idx]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR ALERT — PREMIUM
═══════════════════════════════════════════════════════════════════════════ */
function ErrorAlert({ error, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      style={{
        background: "linear-gradient(135deg, #fff5f5, #fef2f2)",
        border: "1px solid rgba(239,68,68,0.12)",
        borderRadius: 18, padding: "18px 22px",
        marginBottom: 24,
        display: "flex", gap: 14,
        alignItems: "flex-start",
        boxShadow: "0 4px 20px rgba(239,68,68,0.06)",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: "rgba(239,68,68,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <AlertCircle size={18} color="#ef4444" />
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", marginBottom: 4, color: "#b91c1c", fontSize: 14, fontWeight: 700 }}>
          Une erreur est survenue
        </strong>
        <span style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.5 }}>{error}</span>
        <span style={{ fontSize: 11, color: "#ef4444", marginTop: 6, display: "block", opacity: 0.8 }}>
          Consultez la console du navigateur (F12) pour plus de détails.
        </span>
      </div>
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: "rgba(239,68,68,0.06)", border: "none", cursor: "pointer",
          color: "#b91c1c", flexShrink: 0, padding: 6,
          borderRadius: 8,
        }}
      >
        <X size={16} />
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STEPPER BAR — PREMIUM
═══════════════════════════════════════════════════════════════════════════ */
function StepperBar({ stepList, step }) {
  const stepIdx = stepList.findIndex(s => s.key === step);
  const icons = [Brain, SlidersHorizontal, CheckCircle2];

  return (
    <div style={{
      background: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(15,118,110,0.06)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    }}>
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", padding: "22px 0",
        }}>
          {stepList.map((s, i) => {
            const isActive = step === s.key;
            const isDone = stepIdx > i;
            const Icon = icons[i];

            return (
              <span key={s.n} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    style={{
                      width: 60, height: 2, borderRadius: 99, margin: "0 8px",
                      background: isDone ? T.gradientPrimary : "#e2e8f0",
                      transformOrigin: "left",
                    }}
                  />
                )}
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                  <motion.span
                    animate={{
                      background: isActive
                        ? T.gradientPrimary
                        : isDone ? "rgba(15,122,110,0.08)" : "#f8fafc",
                      borderColor: isDone ? "#0f7a6e" : isActive ? "transparent" : "#e2e8f0",
                      boxShadow: isActive ? "0 4px 16px rgba(15,122,110,0.3)" : "none",
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #e2e8f0",
                    }}
                  >
                    {isDone
                      ? <CheckCircle2 size={16} color="#0f7a6e" />
                      : <Icon size={16} color={isActive ? "#fff" : "#94a3b8"} />
                    }
                  </motion.span>
                  <span style={{
                    fontSize: 11, fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#0f7a6e" : isDone ? "#475569" : "#94a3b8",
                    transition: "all 0.3s",
                  }}>
                    {s.label}
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT — BUSINESS LOGIC 100% PRESERVED
═══════════════════════════════════════════════════════════════════════════ */
export default function Recommandation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP.CATEGORY);
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const topRef = useRef(null);

  injectStyles();

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  async function handleCategorySelect(cat) {
    setError(null);
    setLoading(true);
    try {
      const data = await recoApi.getQuestions(cat.id);
      console.log("[Reco] getQuestions response:", data);
      const qs = Array.isArray(data) ? data : (data.questions || data.data || []);
      if (!qs.length) throw new Error("Aucune question retournée par l'API.");
      setCategory(cat);
      setQuestions(qs);
      setAnswers({});
      setStep(STEP.QUESTIONS);
    } catch (e) {
      console.error("[Reco] getQuestions error:", e);
      setError(`Impossible de charger les questions : ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleWizardComplete(collectedAnswers) {
    setError(null);
    setLoading(true);
    setAnswers(collectedAnswers);
    try {
      const payload = { categorie: category.id, ...collectedAnswers };
      console.log("[Reco] getRecommandations payload:", payload);
      const data = await recoApi.getRecommandations(payload);
      console.log("[Reco] getRecommandations response:", data);
      const normalized = {
        resultats: data?.resultats ?? data?.results ?? (Array.isArray(data) ? data : []),
      };
      setResults(normalized);
      setStep(STEP.RESULTS);
    } catch (e) {
      console.error("[Reco] getRecommandations error:", e);
      setError(`Erreur API : ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep(STEP.CATEGORY);
    setCategory(null);
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setError(null);
  }

  const stepList = [
    { n: 1, label: "Catégorie", key: STEP.CATEGORY },
    { n: 2, label: "Questions", key: STEP.QUESTIONS },
    { n: 3, label: "Résultats", key: STEP.RESULTS },
  ];

  return (
    <>
      <SectionHero
        label="Explorer Tanger"
        title={<>Votre séjour <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.85)" }}>sur mesure</em></>}
        subtitle="Répondez à quelques questions ,
        Explore212 trouve les meilleures adresses de Tanger pour vous."
      />

      <StepperBar stepList={stepList} step={step} />

      <div
        ref={topRef}
        style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 24px 100px" }}
      >
        <AnimatePresence>
          {error && <ErrorAlert error={error} onClose={() => setError(null)} />}
        </AnimatePresence>

        {loading && <RecoLoader />}

        <AnimatePresence mode="wait">
          {!loading && step === STEP.CATEGORY && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <CategorySelector onSelect={handleCategorySelect} />
            </motion.div>
          )}

          {!loading && step === STEP.QUESTIONS && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <QuestionWizard
                category={category}
                questions={questions}
                onComplete={handleWizardComplete}
                onBack={handleReset}
              />
            </motion.div>
          )}

          {!loading && step === STEP.RESULTS && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <ResultCards
                results={results}
                category={category}
                preferences={answers}
                onReset={handleReset}
                onRetry={() => setStep(STEP.QUESTIONS)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}