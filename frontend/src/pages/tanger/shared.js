/**
 * Accueil.jsx
 * Page d'accueil — Hero, lieux incontournables, CTA assistant IA.
 */
import { useState } from "react";
import { T, lieuxApi, useApiDataWithRefetch, Spinner, ErrorBanner } from "./shared";

/* ─── Carte lieu ──────────────────────────────────────────────────────────── */
function LieuCard({ lieu, onExplore, delay = 0 }) {
  const imgUrl = lieu.image_url || lieu.imageUrl || "";
  return (
    <div
      className="tg-card tg-animate-fadeUp"
      style={{ animationDelay: `${delay}s`, cursor: "pointer" }}
      onClick={() => onExplore(lieu)}
    >
      <div className="tg-img-overlay" style={{ position: "relative", height: 220 }}>
        <div style={{
          height: "100%",
          background: imgUrl
            ? `url(${imgUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${T.light} 0%, ${T.secondary}40 100%)`,
        }} />
        <span style={{ position: "absolute", bottom: 14, left: 16, zIndex: 1 }}>
          <span className="tg-tag" style={{ background: "rgba(255,255,255,0.9)", color: T.primary }}>
            {lieu.categorie}
          </span>
        </span>
        {lieu.note && (
          <span style={{ position: "absolute", top: 14, right: 14, zIndex: 1 }}>
            <span className="tg-rating">★ {lieu.note}</span>
          </span>
        )}
      </div>
      <div style={{ padding: "20px 22px 22px" }}>
        <h3 className="tg-serif" style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 8, color: T.text }}>
          {lieu.nom}
        </h3>
        <p style={{
          fontSize: 13, color: T.textMuted, lineHeight: 1.65, marginBottom: 18,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {lieu.description}
        </p>
        <button className="tg-btn-primary" style={{ width: "100%", textAlign: "center" }}>
          Explorer
        </button>
      </div>
    </div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Accueil({ onOpenChat }) {
  const { data: lieux, loading, error, refetch } = useApiDataWithRefetch(() => lieuxApi.getAll());
  const lieuxList = Array.isArray(lieux) ? lieux : (lieux?.lieux || lieux?.data || []);
  const [search, setSearch] = useState("");

  return (
    <>
      {/* ── Hero immersif ── */}
      <div style={{
        position: "relative", minHeight: 620,
        background: `linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,118,110,0.45) 100%),
          url(https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600&q=80) center/cover no-repeat`,
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
          Là où la Méditerranée rencontre l'Atlantique — une ville de lumière, d'histoire et d'authenticité.
        </p>

        {/* Barre de recherche */}
        <div className="tg-search tg-animate-fadeUp" style={{ animationDelay: "0.2s" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un lieu, une activité…"
          />
          <button className="tg-btn-primary" style={{ padding: "10px 22px", fontSize: 14 }}>
            Explorer
          </button>
        </div>

        {/* Stats */}
        <div className="tg-animate-fadeUp" style={{ display: "flex", gap: 40, marginTop: 52, animationDelay: "0.3s" }}>
          {[
            { n: lieuxList.length || "—", label: "lieux indexés" },
            { n: "4",  label: "agents IA" },
            { n: "11", label: "catégories" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
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
            Lieux incontournables
          </h2>
          <p style={{ color: T.textMuted, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            Explorez les plus beaux endroits de Tanger, soigneusement sélectionnés pour vous.
          </p>
        </div>

        {loading && <Spinner />}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}>
            {lieuxList.map((lieu, i) => (
              <LieuCard key={lieu.id || lieu.nom} lieu={lieu} onExplore={onOpenChat} delay={i * 0.06} />
            ))}
          </div>
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
    </>
  );
}