/**
 * Accueil.jsx
 * Page d'accueil — Hero, lieux incontournables, CTA assistant IA.
 * Barre de recherche dynamique : filtre les lieux en temps réel.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T, lieuxApi, useApiDataWithRefetch, Spinner, ErrorBanner, DetailModal } from "./SharedTanger";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Star, Search, X } from "lucide-react";

import InteractiveMapPage from "../InteractiveMapPage";
import heroTangier from "../../assets/hero-Tangier.jpg";
/* ─── Carte lieu ──────────────────────────────────────────────────────────── */
function LieuCard({ lieu, onOpen, index }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = lieu.image_url || lieu.imageUrl || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 22, overflow: "hidden",
        border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Image */}
      <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: imgUrl
            ? `url(${imgUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${T.light} 0%, ${T.secondary}40 100%)`,
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />

        {/* Catégorie badge */}
        <span style={{
          position: "absolute", bottom: 14, left: 16, zIndex: 1,
          background: "rgba(255,255,255,0.9)", color: T.primary,
          fontSize: 11, fontWeight: 700, padding: "5px 14px",
          borderRadius: "100px", backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {lieu.categorie}
        </span>

        {/* Note */}
        {lieu.note && (
          <div style={{
            position: "absolute", top: 14, right: 14, zIndex: 1,
            background: "rgba(15,122,110,0.9)", borderRadius: 99,
            padding: "5px 12px", display: "flex", alignItems: "center", gap: 5,
            color: "#fff", fontSize: 13, fontWeight: 700,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
            <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
            {Number(lieu.note).toFixed(1)}
          </div>
        )}
      </div>

      {/* Corps */}
      <div style={{ padding: "20px 24px 24px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, color: T.text, fontFamily: "'Inter', sans-serif" }}>
          {lieu.nom}
        </h3>
        <p style={{
          fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 18,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {lieu.description}
        </p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 18, borderTop: "1px solid #f1f5f9",
        }}>
          {lieu.adresse && (
            <span style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>
              📍 {lieu.adresse}
            </span>
          )}
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button
              className="tg-btn-primary"
              onClick={onOpen}
              style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
            >
              Lire plus
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── État vide recherche ─────────────────────────────────────────────────── */
function EmptySearch({ query, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        textAlign: "center", padding: "72px 24px",
        background: "#f8fafc", borderRadius: 20,
        border: "1.5px dashed #e2e8f0",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <p style={{ fontWeight: 700, fontSize: 17, color: T.text, marginBottom: 8 }}>
        Aucun lieu trouvé
      </p>
      <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6 }}>
        Aucun résultat pour &laquo;&nbsp;<strong style={{ color: T.primary }}>{query}</strong>&nbsp;&raquo;.<br />
        Essayez un autre mot-clé (nom, catégorie, quartier…)
      </p>
      <button
        onClick={onReset}
        className="tg-btn-primary"
        style={{ marginTop: 24, padding: "10px 28px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <X size={14} />
        Réinitialiser la recherche
      </button>
    </motion.div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Accueil({ onOpenChat }) {
  const { data: lieux, loading, error, refetch } = useApiDataWithRefetch(() => lieuxApi.getAll());
  const lieuxList = Array.isArray(lieux) ? lieux : (lieux?.lieux || lieux?.data || []);

  const [search, setSearch] = useState("");
  const [selectedLieu, setSelectedLieu] = useState(null);

  /* Filtre dynamique */
  const query = search.trim().toLowerCase();
  const filteredLieux = query
    ? lieuxList.filter(l =>
        (l.nom         || "").toLowerCase().includes(query) ||
        (l.categorie   || "").toLowerCase().includes(query) ||
        (l.description || "").toLowerCase().includes(query) ||
        (l.adresse     || "").toLowerCase().includes(query)
      )
    : lieuxList;

  return (
    <>
      {/* ── Hero immersif ── */}
      <div style={{
        position: "relative", minHeight: 620,
        background: `linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,118,110,0.45) 100%),
  url(${heroTangier}) center/cover no-repeat`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 120px", textAlign: "center",
      }}>
        <span className="tg-tag" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", marginBottom: 20, backdropFilter: "blur(8px)" }}>
          Destination · Maroc
        </span>

        <h1 className="tg-serif tg-animate-fadeUp" style={{
          fontSize: "clamp(2.8rem,7vw,5rem)", fontWeight: 600,
          color: "#fff", lineHeight: 1.08, marginBottom: 20,
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
        }}>
          Découvrez Tanger
        </h1>

        <p className="tg-animate-fadeUp" style={{
          color: "rgba(255,255,255,0.85)", fontSize: 18, maxWidth: 500,
          lineHeight: 1.65, marginBottom: 40, animationDelay: "0.1s",
        }}>
            une destination unique entre tradition, innovation et horizons infinis
        </p>
        {/* ── Barre de recherche dynamique ── */}
        <div className="tg-search tg-animate-fadeUp" style={{ animationDelay: "0.2s", position: "relative" }}>
          <Search size={18} color={T.textMuted} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un lieu, une catégorie…"
          />
          {/* Bouton effacer si texte présent */}
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", padding: "0 4px",
                color: T.textMuted, flexShrink: 0,
              }}
              title="Effacer"
            >
              <X size={16} />
            </button>
          )}
          <button
            className="tg-btn-primary"
            style={{ padding: "10px 22px", fontSize: 14 }}
            onClick={() => {}} /* recherche déjà live */
          >
            Explorer
          </button>
        </div>

        {/* Vague bas */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
            <path d="M0,40 C320,80 640,0 960,40 C1120,60 1280,20 1440,40 L1440,80 L0,80 Z" fill={T.bg} />
          </svg>
        </div>
      </div>

      {/* ── Lieux incontournables ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p className="tg-section-label">À ne pas manquer</p>
          <h2 className="tg-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 600, marginBottom: 12 }}>
            {query ? "Résultats de recherche" : "Lieux incontournables"}
          </h2>
          <p style={{ color: T.textMuted, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            {query
              ? <>
                  <strong style={{ color: T.primary }}>{filteredLieux.length}</strong> lieu{filteredLieux.length !== 1 ? "x" : ""} trouvé{filteredLieux.length !== 1 ? "s" : ""} pour &laquo;&nbsp;<em>{search}</em>&nbsp;&raquo;
                </>
              : "Explorez les plus beaux endroits de Tanger, soigneusement sélectionnés pour vous."
            }
          </p>
        </div>

        {loading && <Spinner />}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          filteredLieux.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={query} /* re-anime à chaque nouveau filtre */
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}
              >
                {filteredLieux.map((lieu, i) => (
                  <LieuCard
                    key={lieu.id || lieu.nom}
                    lieu={lieu}
                    index={i}
                    onOpen={() => setSelectedLieu(lieu)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <EmptySearch query={search} onReset={() => setSearch("")} />
          )
        )}

        {/* CTA Assistant IA */}
        <div style={{
          marginTop: 72,
          background: `linear-gradient(135deg, ${T.primary} 0%, #0d9488 100%)`,
          borderRadius: T.radiusXl,
          padding: "44px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 24, color: "#fff",
        }}>
          <div>
            <p className="tg-section-label" style={{ color: T.light, marginBottom: 8 }}>Assistant IA</p>
            <h3 className="tg-serif" style={{ fontSize: "1.7rem", fontWeight: 600, marginBottom: 8 }}>
              Besoin de conseils personnalisés ?
            </h3>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15 }}>
              Notre IA répond à toutes vos questions : hôtels, restaurants, transports…
            </p>
          </div>
          <button
            className="tg-btn-primary"
            onClick={onOpenChat}
            style={{ background: "#fff", color: T.primary, flexShrink: 0 }}
          >
            Ouvrir l'assistant
          </button>
        </div>
      </div>

      {/* ── Modal détail lieu ── */}
      <AnimatePresence>
        {selectedLieu && (
          <DetailModal
            item={{
              ...selectedLieu,
              image: selectedLieu.image_url || selectedLieu.imageUrl || selectedLieu.image || "",
              adresse: selectedLieu.adresse || selectedLieu.localisation || "Tanger, Maroc",
              prix: selectedLieu.prix || selectedLieu.tarif || "Entrée libre",
            }}
            rank={-1}
            onClose={() => setSelectedLieu(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}