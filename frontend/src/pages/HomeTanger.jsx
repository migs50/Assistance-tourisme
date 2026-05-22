/**
 * HomeTanger.jsx — REDESIGN PREMIUM
 * UI entièrement repensée : palette teal/blanc, typographie élégante,
 * cartes animées, vagues SVG, design minimaliste premium.
 * Backend / APIs / logique métier : INCHANGÉS.
 */
import { useState, useEffect, useRef, useMemo } from "react";
import NavbarTanger from "../components/Navbartanger";
import Footer from "../components/Footer";


/* ─────────────────────────────────────────────────────────────────────────────
   SERVICE API — identique à l'original
───────────────────────────────────────────────────────────────────────────── */
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

const BASE_RECO = "/api/recommandation";
const recoApi = {
  getQuestions: (cat) => apiFetch(`${BASE_RECO}/questions/${cat}`),
  getRecommandations: (body) =>
    apiFetch(`${BASE_RECO}/recommandations`, { method: "POST", body: JSON.stringify(body) }),
};

const BASE_ACT = "/api/activites";
const activitesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "tous"))
    ).toString();
    return apiFetch(`${BASE_ACT}${qs ? `?${qs}` : ""}`);
  },
};

const BASE_EVT = "/api/evenements";
const evenementsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "tous"))
    ).toString();
    return apiFetch(`${BASE_EVT}${qs ? `?${qs}` : ""}`);
  },
};

const BASE_LIEUX = "/api/lieux";
const lieuxApi = { getAll: () => apiFetch(BASE_LIEUX) };

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS — identiques à l'original
───────────────────────────────────────────────────────────────────────────── */


function useApiData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error };
}

function useApiDataWithRefetch(fetchFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const T = {
  primary:    "#0f766e",
  secondary:  "#14b8a6",
  light:      "#ccfbf1",
  bg:         "#f7fbfb",
  bgCard:     "#ffffff",
  text:       "#0f172a",
  textMuted:  "#64748b",
  textLight:  "#94a3b8",
  border:     "#e2e8f0",
  borderHover:"#0f766e",
  shadow:     "0 4px 24px rgba(15,118,110,0.08)",
  shadowHover:"0 12px 40px rgba(15,118,110,0.18)",
  radius:     "16px",
  radiusSm:   "10px",
  radiusXl:   "24px",
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES (injectés une seule fois)
───────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tg-root {
    font-family: 'DM Sans', sans-serif;
    background: ${T.bg};
    color: ${T.text};
    min-height: 100vh;
  }

  .tg-serif { font-family: 'Cormorant Garamond', serif; }

  /* Animations */
  @keyframes tg-fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tg-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes tg-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes tg-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }

  .tg-animate-fadeUp  { animation: tg-fadeUp  0.6s ease both; }
  .tg-animate-fadeIn  { animation: tg-fadeIn  0.4s ease both; }

  /* Skeleton loader */
  .tg-skeleton {
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: tg-shimmer 1.4s infinite;
    border-radius: 8px;
  }

  /* Buttons */
  .tg-btn-primary {
    background: ${T.primary};
    color: #fff;
    border: none;
    border-radius: 100px;
    padding: 12px 28px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    letter-spacing: 0.01em;
  }
  .tg-btn-primary:hover {
    background: #0d6660;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(15,118,110,0.28);
  }
  .tg-btn-outline {
    background: transparent;
    color: ${T.primary};
    border: 1.5px solid ${T.primary};
    border-radius: 100px;
    padding: 10px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .tg-btn-outline:hover {
    background: ${T.primary};
    color: #fff;
    transform: translateY(-1px);
  }
  .tg-btn-ghost {
    background: transparent;
    color: ${T.textMuted};
    border: 1px solid ${T.border};
    border-radius: 100px;
    padding: 9px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s;
  }
  .tg-btn-ghost:hover {
    border-color: ${T.primary};
    color: ${T.primary};
  }

  /* Cards */
  .tg-card {
    background: ${T.bgCard};
    border-radius: ${T.radius};
    border: 1px solid ${T.border};
    overflow: hidden;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1),
                box-shadow 0.25s cubic-bezier(0.4,0,0.2,1),
                border-color 0.2s;
    box-shadow: ${T.shadow};
  }
  .tg-card:hover {
    transform: translateY(-6px);
    box-shadow: ${T.shadowHover};
    border-color: ${T.light};
  }

  /* Tags / pills */
  .tg-tag {
    display: inline-block;
    background: ${T.light};
    color: ${T.primary};
    font-size: 11px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 100px;
    letter-spacing: 0.04em;
  }
  .tg-tag-outline {
    display: inline-block;
    background: transparent;
    color: ${T.primary};
    border: 1px solid ${T.secondary};
    font-size: 11px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 100px;
  }

  /* Filter pills */
  .tg-filter-btn {
    padding: 8px 18px;
    border-radius: 100px;
    border: 1.5px solid ${T.border};
    background: #fff;
    color: ${T.textMuted};
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .tg-filter-btn:hover,
  .tg-filter-btn.active {
    border-color: ${T.primary};
    background: ${T.primary};
    color: #fff;
  }

  /* Section label */
  .tg-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${T.secondary};
    margin-bottom: 10px;
  }

  /* Hero search bar */
  .tg-search {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 100px;
    padding: 6px 8px 6px 22px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12);
    gap: 10px;
    max-width: 520px;
    width: 100%;
  }
  .tg-search input {
    border: none;
    outline: none;
    flex: 1;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: ${T.text};
    background: transparent;
  }
  .tg-search input::placeholder { color: ${T.textLight}; }

  /* Image overlay gradient */
  .tg-img-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15,118,110,0.65) 0%, transparent 55%);
    pointer-events: none;
  }

  /* Rating badge */
  .tg-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #fff;
    border-radius: 100px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    color: ${T.primary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }

  /* Progress bar */
  .tg-progress-track {
    height: 4px;
    background: ${T.border};
    border-radius: 100px;
    overflow: hidden;
  }
  .tg-progress-bar {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, ${T.secondary}, ${T.primary});
    transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
  }

  /* Divider wave */
  .tg-wave { display: block; width: 100%; line-height: 0; }

  /* Spinner */
  .tg-spinner {
    width: 40px; height: 40px;
    border: 2.5px solid ${T.light};
    border-top-color: ${T.primary};
    border-radius: 50%;
    animation: tg-spin 0.75s linear infinite;
  }

  /* Nav tabs */
  .tg-nav-tab {
    padding: 10px 18px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: ${T.textMuted};
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .tg-nav-tab:hover { color: ${T.primary}; }
  .tg-nav-tab.active {
    color: ${T.primary};
    border-bottom-color: ${T.primary};
    font-weight: 500;
  }

  /* Input */
  .tg-input {
    width: 100%;
    padding: 11px 16px 11px 42px;
    border: 1.5px solid ${T.border};
    border-radius: ${T.radiusSm};
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: ${T.text};
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
  }
  .tg-input:focus { border-color: ${T.secondary}; }
  .tg-input::placeholder { color: ${T.textLight}; }
`;

function InjectGlobalStyles() {
  useEffect(() => {
    const id = "tg-global-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { /* keep alive */ };
  }, []);
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED UI ATOMS
───────────────────────────────────────────────────────────────────────────── */
function Spinner({ size = 40 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div className="tg-spinner" style={{ width: size, height: size }} />
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: "#fff5f5", border: "1px solid #fecaca", borderRadius: T.radius,
      padding: "28px 24px", textAlign: "center", margin: "32px 0",
    }}>
      <p style={{ color: "#b91c1c", fontWeight: 500, marginBottom: 8 }}>Erreur de chargement</p>
      <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 16 }}>{message}</p>
      {onRetry && (
        <button className="tg-btn-outline" onClick={onRetry} style={{ fontSize: 13 }}>
          Réessayer
        </button>
      )}
    </div>
  );
}

function WaveSeparator({ flip = false, color = T.bg }) {
  return (
    <div className="tg-wave" style={{ transform: flip ? "rotate(180deg)" : "none" }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
        <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill={color} />
      </svg>
    </div>
  );
}

function SectionHero({ label, title, subtitle, bgColor = T.primary }) {
  return (
    <div style={{ background: bgColor, padding: "72px 24px 0", position: "relative" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", paddingBottom: 48 }}>
        <p className="tg-section-label" style={{ color: T.light }}>
          {label}
        </p>
        <h1 className="tg-serif tg-animate-fadeUp" style={{
          fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 600,
          color: "#fff", lineHeight: 1.15, marginBottom: 16,
        }}>
          {title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.7, animationDelay: "0.1s" }}
           className="tg-animate-fadeUp">
          {subtitle}
        </p>
      </div>
      <WaveSeparator color={T.bg} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DONNÉES LOCALES
───────────────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "hotels",      label: "Hôtels",      icon: "🏨", description: "Hébergement selon votre budget et vos envies." },
  { id: "restaurants", label: "Restaurants", icon: "🍽️", description: "Cuisine marocaine, internationale, terrasses." },
  { id: "plages",      label: "Plages",      icon: "🏖️", description: "Calme, animée, coucher de soleil." },
  { id: "activites",   label: "Activités",   icon: "🎭", description: "Aventure, culture, histoire, famille." },
];

const TYPE_CONFIG = {
  aventure:    { color: "#f97316", label: "Aventure" },
  sport:       { color: "#3b82f6", label: "Sport" },
  détente:     { color: "#ec4899", label: "Détente" },
  culture:     { color: "#06b6d4", label: "Culture" },
  gastronomie: { color: "#f59e0b", label: "Gastronomie" },
  créatif:     { color: "#8b5cf6", label: "Créatif" },
  nightlife:   { color: "#6366f1", label: "Nightlife" },
  famille:     { color: "#10b981", label: "Famille" },
  historique:  { color: "#a855f7", label: "Historique" },
};

const BUDGET_CONFIG = {
  économique: { label: "Économique" },
  moyen:      { label: "Moyen" },
  luxe:       { label: "Luxe" },
};

const CAT_EVENT_CONFIG = {
  Musique:  { color: "#f97316" },
  Culture:  { color: "#06b6d4" },
  Cinéma:   { color: "#a855f7" },
  Sport:    { color: "#10b981" },
};

const CAT_COLORS = {
  culture:"#a855f7", nature:"#22c55e", gastronomie:"#ef4444", détente:"#06b6d4",
  aventure:"#f97316", sport:"#3b82f6", famille:"#f59e0b", nightlife:"#ec4899", autre:"#64748b",
};

const LOCALISATION_ICONS = {
  intérieur:"intérieur", extérieur:"extérieur", plage:"plage",
  montagne:"montagne", "centre-ville":"centre-ville", médina:"médina",
};

function formatDuree(d) {
  const map = { "1h":"1h","2h":"2h","demi-journée":"Demi-journée","Demi-journée":"Demi-journée","journée complète":"Journée complète","Journée complète":"Journée complète","soirée":"Soirée","quelques heures":"Quelques heures" };
  return map[d] ?? d;
}
function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION ACCUEIL
───────────────────────────────────────────────────────────────────────────── */
function SectionAccueil({ onOpenChat }) {
  const { data: lieux, loading, error, refetch } = useApiDataWithRefetch(() => lieuxApi.getAll());
  const lieuxList = Array.isArray(lieux) ? lieux : (lieux?.lieux || lieux?.data || []);
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Hero immersif */}
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
          fontSize: "clamp(2.8rem, 7vw, 5rem)", fontWeight: 600,
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

        {/* Search bar */}
        <div className="tg-search tg-animate-fadeUp" style={{ animationDelay: "0.2s" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
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
            { n: "4", label: "agents IA" },
            { n: "11", label: "catégories" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Wave bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
            <path d="M0,40 C320,80 640,0 960,40 C1120,60 1280,20 1440,40 L1440,80 L0,80 Z" fill={T.bg} />
          </svg>
        </div>
      </div>

      {/* Lieux incontournables */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p className="tg-section-label">À ne pas manquer</p>
          <h2 className="tg-serif" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 600, marginBottom: 12 }}>
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

        {/* CTA assistant IA */}
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
          <button className="tg-btn-primary" onClick={onOpenChat} style={{
            background: "#fff", color: T.primary, flexShrink: 0,
          }}>
            Ouvrir l'assistant
          </button>
        </div>
      </div>
    </>
  );
}

function LieuCard({ lieu, onExplore, delay = 0 }) {
  const imgUrl = lieu.image_url || lieu.imageUrl || "";
  return (
    <div className="tg-card tg-animate-fadeUp" style={{ animationDelay: `${delay}s`, cursor: "pointer" }}
      onClick={() => onExplore(lieu)}>
      {/* Image */}
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
      {/* Body */}
      <div style={{ padding: "20px 22px 22px" }}>
        <h3 className="tg-serif" style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 8, color: T.text }}>
          {lieu.nom}
        </h3>
        <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.65, marginBottom: 18,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {lieu.description}
        </p>
        <button className="tg-btn-primary" style={{ width: "100%", textAlign: "center" }}>
          Explorer
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION RECOMMANDATION
───────────────────────────────────────────────────────────────────────────── */
const STEP_RECO = { CATEGORY: "category", QUESTIONS: "questions", RESULTS: "results" };

function SectionRecom() {
  const [step, setStep]         = useState(STEP_RECO.CATEGORY);
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]   = useState({});
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const topRef                  = useRef(null);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);

  async function handleCategorySelect(cat) {
    setError(null); setLoading(true);
    try {
      const data = await recoApi.getQuestions(cat.id);
      setCategory(cat); setQuestions(data.questions); setAnswers({});
      setStep(STEP_RECO.QUESTIONS);
    } catch { setError("Impossible de charger les questions. Vérifiez que le backend est actif."); }
    finally { setLoading(false); }
  }

  async function handleWizardComplete(collectedAnswers) {
    setError(null); setLoading(true); setAnswers(collectedAnswers);
    try {
      const data = await recoApi.getRecommandations({ categorie: category.id, ...collectedAnswers });
      setResults(data); setStep(STEP_RECO.RESULTS);
    } catch { setError("Erreur lors de la génération des recommandations."); }
    finally { setLoading(false); }
  }

  function handleReset() {
    setStep(STEP_RECO.CATEGORY); setCategory(null);
    setQuestions([]); setAnswers({}); setResults(null); setError(null);
  }

  const steps = [
    { n: 1, label: "Catégorie", key: STEP_RECO.CATEGORY },
    { n: 2, label: "Questions", key: STEP_RECO.QUESTIONS },
    { n: 3, label: "Résultats", key: STEP_RECO.RESULTS },
  ];
  const stepIdx = steps.findIndex(s => s.key === step);

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
            {steps.map((s, i) => {
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
                    <span style={{ fontSize: 11, color: isActive ? T.primary : T.textMuted }}>
                      {s.label}
                    </span>
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
        {!loading && step === STEP_RECO.CATEGORY  && <CategorySelector onSelect={handleCategorySelect} />}
        {!loading && step === STEP_RECO.QUESTIONS  && <QuestionWizard category={category} questions={questions} onComplete={handleWizardComplete} onBack={handleReset} />}
        {!loading && step === STEP_RECO.RESULTS && results && <ResultCards results={results} category={category} preferences={answers} onReset={handleReset} onRetry={() => setStep(STEP_RECO.QUESTIONS)} />}
      </div>
    </>
  );
}

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
          <button key={cat.id} onClick={() => onSelect(cat)}
            onMouseEnter={() => setHovered(cat.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: "#fff", borderRadius: T.radius, padding: "32px 26px 28px",
              border: `1.5px solid ${hovered === cat.id ? T.primary : T.border}`,
              cursor: "pointer", textAlign: "left",
              boxShadow: hovered === cat.id ? T.shadowHover : T.shadow,
              transform: hovered === cat.id ? "translateY(-4px)" : "translateY(0)",
              transition: "all 0.22s",
            }}>
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

function QuestionWizard({ category, questions, onComplete, onBack }) {
  const [idx, setIdx]     = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  const current = questions[idx];
  const total   = questions.length;
  const progress = (idx / total) * 100;
  const isLast  = idx === total - 1;

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

      {/* Progress */}
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
            <button onClick={() => advance({ ...answers })} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13, textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>Passer</button>
          ) : <span />}
          <button className="tg-btn-primary" onClick={handleNext}
            disabled={selected === null && !current.is_optional}
            style={{ opacity: selected === null && !current.is_optional ? 0.4 : 1, cursor: selected === null && !current.is_optional ? "not-allowed" : "pointer" }}>
            {isLast ? "Voir mes recommandations" : "Suivant"}
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
          {items.map((item, i) => <RecoResultCard key={item.id || item.nom || i} item={item} rank={i} />)}
        </div>
      )}
    </div>
  );
}

function RecoResultCard({ item, rank }) {
  const [hov, setHov] = useState(false);
  const isTop = rank === 0;
  const score = item._score ?? 0;
  const pct   = Math.round(score * 100);

  return (
    <div className="tg-card" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: isTop ? `2px solid ${T.secondary}` : `1px solid ${T.border}` }}>
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
          <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginBottom: 12,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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
              <><span style={{ fontSize: 10, color: T.textMuted, display: "block" }}>À partir de</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.prix_min}{item.prix_max ? `–${item.prix_max}` : ""} MAD</span></>
            )}
          </div>
          <button className="tg-btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>Voir plus</button>
        </div>
      </div>
    </div>
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 20 }}>
      <div className="tg-spinner" />
      <p style={{ color: T.textMuted, fontSize: 13 }}>{msgs[idx]}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION ACTIVITÉS
───────────────────────────────────────────────────────────────────────────── */
function SectionActivites() {
  const [activeType,   setActiveType]   = useState("tous");
  const [activeBudget, setActiveBudget] = useState("tous");
  const [search,       setSearch]       = useState("");

  const { data: rawData, loading, error, refetch } = useApiDataWithRefetch(() => activitesApi.getAll());

  const activitesData = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData.activites || rawData.data || []);
  }, [rawData]);

  const availableTypes = useMemo(() => {
    const found = new Set(activitesData.map(a => a.type).filter(Boolean));
    return ["tous", ...Object.keys(TYPE_CONFIG).filter(k => found.has(k))];
  }, [activitesData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activitesData.filter(a => {
      const matchType   = activeType   === "tous" || a.type   === activeType;
      const matchBudget = activeBudget === "tous" || a.budget === activeBudget;
      const matchSearch = !q || a.nom?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.type?.toLowerCase().includes(q);
      return matchType && matchBudget && matchSearch;
    });
  }, [activitesData, activeType, activeBudget, search]);

  return (
    <>
      <SectionHero
        label="Explorer Tanger"
        title={<>Que faire à <em style={{ fontStyle: "italic", color: T.light }}>Tanger ?</em></>}
        subtitle={loading ? "Chargement des activités…" : `${activitesData.length} activités sélectionnées — aventure, sport, culture, famille`}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Filtres */}
        {!loading && !error && (
          <div style={{
            background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`,
            padding: "20px 22px", marginBottom: 36, boxShadow: T.shadow,
          }}>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="tg-input" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une activité, un lieu, un type…" />
            </div>
            {/* Type pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Type :</span>
              {availableTypes.map(t => (
                <button key={t} className={`tg-filter-btn ${activeType === t ? "active" : ""}`} onClick={() => setActiveType(t)}>
                  {t === "tous" ? "Tous" : TYPE_CONFIG[t]?.label || t}
                </button>
              ))}
            </div>
            {/* Budget pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Budget :</span>
              {["tous", "économique", "moyen", "luxe"].map(b => (
                <button key={b} className={`tg-filter-btn ${activeBudget === b ? "active" : ""}`} onClick={() => setActiveBudget(b)}>
                  {b === "tous" ? "Tous budgets" : cap(b)}
                </button>
              ))}
              {(activeType !== "tous" || activeBudget !== "tous" || search) && (
                <button className="tg-btn-ghost" onClick={() => { setActiveType("tous"); setActiveBudget("tous"); setSearch(""); }}
                  style={{ marginLeft: "auto", borderColor: "#fca5a5", color: "#b91c1c", fontSize: 12 }}>
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}

        {loading && <Spinner />}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>
              <span style={{ color: T.text, fontWeight: 600 }}>{filtered.length}</span> activité{filtered.length > 1 ? "s" : ""}
            </p>
            {filtered.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 24 }}>
                {filtered.map((act, i) => <ActiviteCard key={act.id || `${act.nom}-${i}`} act={act} index={i} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                <p style={{ fontSize: 16, marginBottom: 16 }}>Aucune activité trouvée.</p>
                <button className="tg-btn-outline" onClick={() => { setActiveType("tous"); setActiveBudget("tous"); setSearch(""); }}>
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function ActiviteCard({ act, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg    = TYPE_CONFIG[act.type] ?? { color: T.secondary, label: act.type };
  const imgUrl = act.image || act.image_url || "";
  const isGratuit = act.prix?.toLowerCase() === "gratuit";

  return (
    <div className="tg-card tg-animate-fadeUp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}>
      <div style={{
        height: 190, position: "relative",
        background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : T.light,
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.25), transparent)" }} />
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: `${cfg.color}20`, border: `1px solid ${cfg.color}50`,
          color: cfg.color, fontSize: 11, fontWeight: 600,
          padding: "4px 12px", borderRadius: "100px",
          backdropFilter: "blur(6px)", fontFamily: "'DM Sans', sans-serif",
        }}>
          {cfg.label}
        </span>
        {act.rating && (
          <span className="tg-rating" style={{ position: "absolute", top: 12, right: 12 }}>
            ★ {Number(act.rating).toFixed(1)}
          </span>
        )}
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <h3 className="tg-serif" style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: T.text }}>
          {act.nom}
        </h3>
        <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.65, marginBottom: 14,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {act.description}
        </p>
        {/* Meta chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {[act.localisation, formatDuree(act.duree), cap(act.budget)].filter(Boolean).map((v, i) => (
            <span key={i} className="tg-tag-outline" style={{ fontSize: 11 }}>{v}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: isGratuit ? "#16a34a" : T.text }}>
            {act.prix}
          </span>
          <button className="tg-btn-primary" style={{ padding: "8px 18px", fontSize: 12 }}>
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION ÉVÉNEMENTS
───────────────────────────────────────────────────────────────────────────── */
function SectionEvenements() {
  const [filter,   setFilter]   = useState("tous");
  const [expanded, setExpanded] = useState(null);

  const { data: rawData, loading, error, refetch } = useApiDataWithRefetch(() => evenementsApi.getAll());

  const eventsData = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData.evenements || rawData.events || rawData.data || []);
  }, [rawData]);

  const cats = useMemo(() => {
    const found = new Set(eventsData.map(e => e.category).filter(Boolean));
    return ["tous", ...Object.keys(CAT_EVENT_CONFIG).filter(k => found.has(k))];
  }, [eventsData]);

  const filtered = useMemo(() =>
    eventsData.filter(e => filter === "tous" || e.category === filter),
  [eventsData, filter]);

  return (
    <>
      <SectionHero
        label="Agenda 2026–2027"
        title={<>Événements à <em style={{ fontStyle: "italic", color: T.light }}>Tanger</em></>}
        subtitle={loading ? "Chargement…" : `${eventsData.length} événements à venir — concerts, festivals, culture et sport`}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

        {!loading && !error && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
            {cats.map(c => {
              const cfg = CAT_EVENT_CONFIG[c];
              return (
                <button key={c} className={`tg-filter-btn ${filter === c ? "active" : ""}`}
                  onClick={() => setFilter(c)}
                  style={filter === c && cfg ? { borderColor: cfg.color, background: cfg.color, color: "#fff" } : {}}>
                  {c === "tous" ? "Tous" : c}
                </button>
              );
            })}
          </div>
        )}

        {loading && <Spinner />}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 28 }}>
              <span style={{ color: T.text, fontWeight: 600 }}>{filtered.length}</span> événement{filtered.length > 1 ? "s" : ""}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 22 }}>
              {filtered.map((ev, i) => {
                const cfg    = CAT_EVENT_CONFIG[ev.category] || { color: T.primary };
                const isExp  = expanded === i;
                const imgUrl = ev.image_url || ev.image || "";
                return (
                  <div key={ev.id || i} className="tg-card tg-animate-fadeUp"
                    style={{ animationDelay: `${i * 0.05}s`, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 0, flex: 1 }}>
                      {/* Image column */}
                      <div style={{
                        width: 180, flexShrink: 0,
                        background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : T.light,
                        position: "relative", minHeight: 160, borderRadius: `${T.radius} 0 0 ${T.radius}`,
                        overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.08) 100%)" }} />
                        <span style={{
                          position: "absolute", top: 10, left: 10,
                          background: `${cfg.color}20`, border: `1px solid ${cfg.color}60`,
                          color: cfg.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: "100px",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {ev.category}
                        </span>
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, padding: "20px 22px", minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                          <h3 className="tg-serif" style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.3 }}>
                            {ev.title || ev.titre || ev.nom}
                          </h3>
                          <span className="tg-tag" style={{ flexShrink: 0, background: "#f0fdf4", color: "#16a34a", fontSize: 10 }}>
                            À venir
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: cfg.color, fontWeight: 500 }}>{ev.date}</span>
                          <span style={{ fontSize: 12, color: T.textMuted }}>{ev.location || ev.lieu}</span>
                        </div>
                        <p style={{
                          fontSize: 13, color: T.textMuted, lineHeight: 1.65, marginBottom: 14,
                          ...(isExp ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                        }}>
                          {ev.description}
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button className="tg-btn-ghost" onClick={() => setExpanded(isExp ? null : i)} style={{ fontSize: 12 }}>
                            {isExp ? "Voir moins" : "Lire plus"}
                          </button>
                          <button className="tg-btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>
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

/* ─────────────────────────────────────────────────────────────────────────────
   DASHBOARD — inchangé structurellement, redesigné visuellement
───────────────────────────────────────────────────────────────────────────── */
const BUDGET_COLORS  = { économique:"#22c55e", moyen:"#3b82f6", luxe:"#f5c842" };
const SAISON_COLORS  = { automne:"#f97316", printemps:"#22c55e", ete:"#06b6d4", hiver:"#a855f7" };

const API_DASH = "/api/dashboard";
async function dashFetch(path) {
  const res = await fetch(`${API_DASH}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function ProgressBar({ value, max, color = T.primary, height = 5 }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="tg-progress-track" style={{ height }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: "100px", background: color, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function KPICard({ label, value, icon, color = T.primary }) {
  return (
    <div style={{
      background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`,
      padding: "22px 20px", boxShadow: T.shadow,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color, lineHeight: 1, marginBottom: 4, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textMuted }}>{label}</div>
    </div>
  );
}

function DashGlobal({ data }) {
  if (!data) return <Spinner />;
  const { overview, pricing, quality, geography } = data;
  const kpis = [
    { label: "Lieux touristiques", value: overview.total_lieux_touristiques, icon: "🏛️",  color: T.primary },
    { label: "Activités",          value: overview.total_activites,           icon: "🎯",  color: "#f97316" },
    { label: "Hôtels",             value: overview.total_hotels,              icon: "🏨",  color: "#f5c842" },
    { label: "Restaurants",        value: overview.total_restaurants,         icon: "🍽️", color: "#ef4444" },
    { label: "Plages & Espaces",   value: overview.total_plages,              icon: "🏖️", color: "#06b6d4" },
    { label: "Événements 2026",    value: overview.total_events,              icon: "🎪",  color: "#22c55e" },
    { label: "Avis collectés",     value: overview.total_avis,                icon: "💬",  color: "#3b82f6" },
    { label: "Profils analysés",   value: overview.total_utilisateurs,        icon: "👤",  color: "#ec4899" },
  ];
  const maxQ = geography.top_quartiers[0]?.count || 1;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 14 }}>
        {/* Prix */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: "22px", boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Prix moyens</p>
          {[
            { label: "Hôtel / nuit", val: `${pricing.prix_moyen_hotel_mad?.toLocaleString()} MAD`, color: "#f5c842", raw: pricing.prix_moyen_hotel_mad, max: 2000 },
            { label: "Repas / pers.", val: `${pricing.prix_moyen_restaurant_mad} MAD`, color: "#ef4444", raw: pricing.prix_moyen_restaurant_mad, max: 500 },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
              <ProgressBar value={row.raw} max={row.max} color={row.color} height={5} />
            </div>
          ))}
        </div>
        {/* Satisfaction */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: "22px", textAlign: "center", boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Satisfaction globale</p>
          <div style={{ fontSize: "3.2rem", fontWeight: 700, color: "#f59e0b", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>
            {quality.note_moyenne_globale}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, margin: "6px 0 16px" }}>/ 5.0 · {quality.total_avis_collectes} avis</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ color: i <= Math.round(quality.note_moyenne_globale) ? "#f59e0b" : T.border, fontSize: 18 }}>★</span>
            ))}
          </div>
        </div>
        {/* Top quartiers */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: "22px", boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Top quartiers touristiques</p>
          {geography.top_quartiers.map((q, i) => {
            const colors = [T.primary, "#a855f7", "#06b6d4", "#22c55e", "#f5c842"];
            return (
              <div key={q.quartier} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: colors[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i+1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{q.quartier}</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{q.count} lieux</span>
                </div>
                <ProgressBar value={q.count} max={maxQ} color={colors[i]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashCategories({ data }) {
  if (!data) return <Spinner />;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0);
  const maxVal  = entries[0]?.[1] || 1;
  const CAT_EMOJI = { culture:"🏛️", nature:"🌿", gastronomie:"🍽️", détente:"🧘", aventure:"🪂", sport:"⚽", famille:"👨‍👩‍👧", nightlife:"🎶", autre:"📍" };
  return (
    <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 28, boxShadow: T.shadow }}>
      <p className="tg-section-label" style={{ marginBottom: 22 }}>Répartition par catégorie</p>
      {entries.map(([cat, val]) => {
        const color = CAT_COLORS[cat] || T.textMuted;
        const pct = Math.round((val / total) * 100);
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>{CAT_EMOJI[cat] || "📍"}</span>
                <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{cat}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{pct}%</span>
                <span style={{ fontSize: 13, fontWeight: 700, color, background: `${color}15`, borderRadius: 100, padding: "1px 10px" }}>{val}</span>
              </div>
            </div>
            <ProgressBar value={val} max={maxVal} color={color} height={6} />
          </div>
        );
      })}
    </div>
  );
}

function DashBudget({ data }) {
  if (!data) return <Spinner />;
  const users  = data.users  || {};
  const hotels = data.hotels || {};
  const acts   = data.activites || {};
  const totalU = Object.values(users).reduce((s, v) => s + v, 0) || 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      {[
        { title: "Budget visiteurs", items: users, total: totalU, suffix: "visiteurs", extra: <div style={{ marginTop: 16, padding: "12px 16px", background: T.light, borderRadius: T.radiusSm }}><div style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>Budget moyen / jour</div><div style={{ fontSize: 22, fontWeight: 700, color: T.primary, fontFamily: "'Cormorant Garamond', serif" }}>{(data.budget_moyen_utilisateur_mad || 1160).toLocaleString()} MAD</div></div> },
        { title: "Segment hôtelier", items: hotels, total: Object.values(hotels).reduce((s,v)=>s+v,0)||1, suffix: "hôtels" },
        { title: "Activités par budget", items: acts, total: Object.values(acts).reduce((s,v)=>s+v,0)||1, suffix: "activités" },
      ].map(({ title, items, total, suffix, extra }) => (
        <div key={title} style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: "24px", boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 20 }}>{title}</p>
          {["économique","moyen","luxe"].map(b => {
            const val = items[b] || 0;
            const color = BUDGET_COLORS[b];
            const pct = Math.round((val / total) * 100);
            return (
              <div key={b} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{cap(b)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val} {suffix}</span>
                </div>
                <ProgressBar value={val} max={total} color={color} />
              </div>
            );
          })}
          {extra}
        </div>
      ))}
    </div>
  );
}

function DashHotels({ data }) {
  if (!data) return <Spinner />;
  const { prix, rating_moyen, par_categorie, par_localisation, amenites } = data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Prix moyen / nuit", value: `${prix?.moyen_mad?.toLocaleString()} MAD`, icon: "💰", color: T.primary },
          { label: "Prix médian",       value: `${prix?.median_mad?.toLocaleString()} MAD`, icon: "📊", color: "#3b82f6" },
          { label: "Note moyenne",      value: `${rating_moyen}/5`, icon: "⭐", color: "#f59e0b" },
          { label: "Avec piscine",      value: `${amenites?.pct_avec_piscine}%`, icon: "🏊", color: "#06b6d4" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 24, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Segmentation tarifaire</p>
          {par_categorie?.map(cat => {
            const color = BUDGET_COLORS[cat.categorie] || T.textMuted;
            return (
              <div key={cat.categorie} style={{ padding: 16, marginBottom: 10, borderRadius: T.radiusSm, background: `${color}08`, border: `1px solid ${color}22` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color, textTransform: "capitalize" }}>Segment {cat.categorie}</span>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{cat.count} hôtels</span>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[{l:"Moy.", v:`${cat.prix_moyen} MAD`},{l:"Note",v:`★ ${cat.rating_moyen}`}].map(({l,v}) => (
                    <div key={l}><div style={{ fontSize: 10, color: T.textMuted }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color }}>{v}</div></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
            <p className="tg-section-label" style={{ marginBottom: 14 }}>Par localisation</p>
            {par_localisation?.map(loc => (
              <div key={loc.localisation} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, textTransform: "capitalize" }}>{loc.localisation}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>{loc.prix_moyen} MAD</span>
                </div>
                <ProgressBar value={loc.prix_moyen} max={2000} color={T.secondary} />
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
            <p className="tg-section-label" style={{ marginBottom: 14 }}>Équipements</p>
            {[{label:"Avec piscine",pct:amenites?.pct_avec_piscine,color:"#06b6d4"},{label:"Vue mer",pct:amenites?.pct_avec_vue_mer,color:"#3b82f6"}].map(eq => (
              <div key={eq.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{eq.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: eq.color }}>{eq.pct}%</span>
                </div>
                <ProgressBar value={eq.pct} max={100} color={eq.color} />
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
  const CAT_EMOJI = { culture:"🏛️", nature:"🌿", gastronomie:"🍽️", détente:"🧘", aventure:"🪂", sport:"⚽", famille:"👨‍👩‍👧", nightlife:"🎶", autre:"📍" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: T.light, borderRadius: T.radius, padding: "20px 24px", border: `1px solid ${T.secondary}30` }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.primary, marginBottom: 6 }}>Méthode de scoring</p>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>{methode}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(poids).map(([k, v]) => (
            <span key={k} className="tg-tag" style={{ fontSize: 11 }}>
              {k.replace(/_/g," ")} {Math.round(v*100)}%
            </span>
          ))}
        </div>
      </div>
      {top_activities.map((act, i) => {
        const color = CAT_COLORS[act.type] || T.primary;
        return (
          <div key={act.nom} style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: T.shadow, borderLeft: `3px solid ${i === 0 ? T.primary : T.border}` }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: i === 0 ? T.primary : T.textMuted, fontFamily: "'Cormorant Garamond', serif", minWidth: 28 }}>
              {["1st","2nd","3rd"][i] || `${i+1}th`}
            </span>
            <span style={{ fontSize: 16 }}>{CAT_EMOJI[act.type] || "🎯"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{act.nom}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{act.duree} · {act.prix}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#f59e0b" }}>★ {act.rating}</div>
              <div style={{ fontSize: 11, color, fontWeight: 600 }}>{act.score_hybride?.toFixed(3)}</div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Type dominant", value: profil_type.type_voyageur, icon: "👤", color: T.primary },
          { label: "Âge moyen",    value: `${Math.round(profil_type.age_moyen)} ans`, icon: "🎂", color: "#06b6d4" },
          { label: "Budget / jour",value: `${profil_type.budget_moyen_mad?.toLocaleString()} MAD`, icon: "💰", color: "#f97316" },
          { label: "Durée séjour", value: `${profil_type.duree_sejour_jours?.toFixed(1)} jours`, icon: "📅", color: "#22c55e" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16 }}>
        {/* Saisons */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 18 }}>Saison préférée</p>
          {Object.entries(saisons.distribution || {}).sort((a,b)=>b[1]-a[1]).map(([s,n]) => {
            const total = Object.values(saisons.distribution).reduce((a,b)=>a+b,0);
            const color = SAISON_COLORS[s] || T.textMuted;
            return (
              <div key={s} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{s}</span>
                  <span style={{ fontSize: 12, color, fontWeight: 600 }}>{Math.round(n/total*100)}%</span>
                </div>
                <ProgressBar value={n} max={total} color={color} />
              </div>
            );
          })}
        </div>
        {/* Nationalités */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 18 }}>Top nationalités</p>
          {Object.entries(demographique.top_nationalites||{}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([nat,n],i) => {
            const colors=[T.primary,"#a855f7","#06b6d4","#22c55e","#f5c842"];
            const max=Object.values(demographique.top_nationalites)[0];
            return (
              <div key={nat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width:18,height:18,borderRadius:"50%",background:colors[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{nat}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: colors[i] }}>{n}</span>
                </div>
                <ProgressBar value={n} max={max} color={colors[i]} />
              </div>
            );
          })}
        </div>
        {/* Intérêts */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Intérêts (score 0–10)</p>
          {(preferences.categories||[]).map(c => {
            const color = CAT_COLORS[c.categorie] || T.textMuted;
            return (
              <div key={c.categorie} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, textTransform: "capitalize" }}>{c.categorie}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{c.score_moyen}</span>
                </div>
                <ProgressBar value={c.score_moyen} max={10} color={color} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const DASH_TABS = [
  { id: "global",     label: "Vue globale" },
  { id: "categories", label: "Catégories" },
  { id: "budget",     label: "Budget" },
  { id: "hotels",     label: "Hôtels" },
  { id: "activites",  label: "Top activités" },
  { id: "profil",     label: "Profil visiteur" },
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
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

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
      {/* Header */}
      <div style={{ background: T.primary, padding: "52px 24px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="tg-section-label" style={{ color: T.light }}>Analytics · Plateforme Touristique</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <h1 className="tg-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "#fff" }}>
              Dashboard — Tanger
            </h1>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 100, padding: "4px 12px" }}>
              Backend connecté
            </span>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {DASH_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                style={{
                  padding: "10px 18px", background: "transparent", border: "none",
                  borderBottom: `2.5px solid ${activePanel === tab.id ? "#fff" : "transparent"}`,
                  color: activePanel === tab.id ? "#fff" : "rgba(255,255,255,0.55)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  fontWeight: activePanel === tab.id ? 500 : 400,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.18s",
                  borderRadius: "6px 6px 0 0",
                }}>
                {tab.label}
                {loading[tab.id] && <span style={{ marginLeft: 6, display: "inline-block", width: 7, height: 7, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "tg-spin 0.6s linear infinite" }} />}
              </button>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 40 }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1350,10 1440,20 L1440,40 L0,40 Z" fill={T.bg} />
        </svg>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 80px" }} key={activePanel}>
        {errors[activePanel] ? (
          <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: T.radius, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#b91c1c", fontWeight: 600, marginBottom: 6 }}>Erreur de chargement</p>
            <p style={{ color: T.textMuted, fontSize: 13 }}>{errors[activePanel]}</p>
          </div>
        ) : loading[activePanel] ? (
          <Spinner />
        ) : (
          <>
            {activePanel === "global"     && <DashGlobal       data={data.global}     />}
            {activePanel === "categories" && <DashCategories   data={data.categories} />}
            {activePanel === "budget"     && <DashBudget       data={data.budget}     />}
            {activePanel === "hotels"     && <DashHotels       data={data.hotels}     />}
            {activePanel === "activites"  && <DashTopActivites data={data.activites}  />}
            {activePanel === "profil"     && <DashUserProfile  data={data.profil}     />}
          </>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────────────────────────────────────── */
export default function HomeTanger({ onBack, onOpenChat }) {
  const [activeTab, setActiveTab] = useState("accueil");

  return (
    <div className="tg-root">
      <InjectGlobalStyles />
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