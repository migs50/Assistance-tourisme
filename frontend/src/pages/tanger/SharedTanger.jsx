/**
 * shared.js — Premium Redesign v4
 * ─────────────────────────────────────────────────
 * LOGIQUE MÉTIER : 100 % préservée (API, hooks, data, endpoints)
 * DESIGN        : Refonte premium — glassmorphism, animations, moderne
 * LANGUE        : Français intégral
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Star, MapPin, X, Heart, Award,
  ArrowLeft, ArrowRight, Clock, Camera,
  Navigation, Share2, Zap, Info, ChevronLeft, ChevronRight,
  DollarSign, Map as MapIcon
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   SERVICE API — INTACT
───────────────────────────────────────────────────────────────────────────── */
export async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch (networkErr) {
    console.error(`[apiFetch] Réseau KO → ${path}`, networkErr);
    throw new Error(`Impossible de contacter le serveur : ${networkErr.message}`);
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    let detail = `Erreur HTTP ${res.status}`;
    try {
      const json = JSON.parse(raw);
      detail = json.detail || json.message || json.error || detail;
      if (Array.isArray(detail))
        detail = detail.map(d => d.msg || JSON.stringify(d)).join(" | ");
    } catch {
      if (raw) detail = raw.slice(0, 300);
    }
    console.error(`[apiFetch] ${res.status} → ${path}`, detail);
    throw new Error(detail);
  }

  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    console.error(`[apiFetch] Réponse non-JSON → ${path}`, text.slice(0, 200));
    throw new Error("La réponse du serveur n'est pas du JSON valide.");
  }
}

// Recommandation
const BASE_RECO = "/api/recommandation";
export const recoApi = {
  getQuestions: (cat) => apiFetch(`${BASE_RECO}/questions/${cat}`),
  getRecommandations: (body) =>
    apiFetch(`${BASE_RECO}/recommandations`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// Activités
const BASE_ACT = "/api/activites";
export const activitesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v && v !== "tous")
      )
    ).toString();
    return apiFetch(`${BASE_ACT}${qs ? `?${qs}` : ""}`);
  },
};

// Événements
const BASE_EVT = "/api/evenements";
export const evenementsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v && v !== "tous")
      )
    ).toString();
    return apiFetch(`${BASE_EVT}${qs ? `?${qs}` : ""}`);
  },
};

// Lieux
const BASE_LIEUX = "/api/lieux";
export const lieuxApi = { getAll: () => apiFetch(BASE_LIEUX) };

// Dashboard
const API_DASH = "/api/dashboard";
export async function dashFetch(path) {
  return apiFetch(`${API_DASH}${path}`);
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS — INTACTS
───────────────────────────────────────────────────────────────────────────── */
export function useApiData(fetchFn, deps = []) {
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

export function useApiDataWithRefetch(fetchFn) {
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
   DESIGN TOKENS — PREMIUM REDESIGN
───────────────────────────────────────────────────────────────────────────── */
export const T = {
  primary: "#0f766e",
  primaryLight: "#14b8a6",
  primaryDark: "#0d5f59",
  secondary: "#14b8a6",
  accent: "#0ea5e9",
  accentDark: "#0284c7",
  light: "#ccfbf1",
  bg: "#f8fffe",
  bgSubtle: "#f0fdfa",
  bgCard: "#ffffff",
  text: "#0f172a",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  border: "#e2e8f0",
  borderHover: "#0f766e",
  shadow: "0 4px 24px rgba(15,118,110,0.08)",
  shadowHover: "0 12px 40px rgba(15,118,110,0.18)",
  shadowPremium: "0 8px 32px rgba(15,118,110,0.12)",
  shadowGlow: "0 0 40px rgba(14,165,233,0.15)",
  radius: "16px",
  radiusSm: "10px",
  radiusMd: "14px",
  radiusXl: "24px",
  radius2xl: "28px",
  radiusFull: "9999px",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.35)",
  glassShadow: "0 8px 32px rgba(31,38,135,0.08)",
  gradientPrimary: "linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)",
  gradientHero: "linear-gradient(135deg, #0f766e 0%, #06b6d4 50%, #0ea5e9 100%)",
  gradientCard: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   DONNÉES LOCALES PARTAGÉES — INTACTES
───────────────────────────────────────────────────────────────────────────── */
export const CATEGORIES = [
  { id: "hotels", label: "Hôtels", description: "Hébergement selon votre budget et vos envies." },
  { id: "restaurants", label: "Restaurants", description: "Cuisine marocaine, internationale, terrasses." },
  { id: "plages", label: "Plages", description: "Calme, animée, coucher de soleil." },
  { id: "activites", label: "Activités", description: "Aventure, culture, histoire, famille." },
];

export const TYPE_CONFIG = {
  aventure: { color: "#f97316", label: "Aventure" },
  sport: { color: "#3b82f6", label: "Sport" },
  détente: { color: "#ec4899", label: "Détente" },
  culture: { color: "#06b6d4", label: "Culture" },
  gastronomie: { color: "#f59e0b", label: "Gastronomie" },
  créatif: { color: "#8b5cf6", label: "Créatif" },
  nightlife: { color: "#6366f1", label: "Nightlife" },
  famille: { color: "#10b981", label: "Famille" },
  historique: { color: "#a855f7", label: "Historique" },
};

export const BUDGET_CONFIG = {
  économique: { label: "Économique" },
  moyen: { label: "Moyen" },
  luxe: { label: "Luxe" },
};

export const CAT_EVENT_CONFIG = {
  Musique: { color: "#f97316" },
  Culture: { color: "#06b6d4" },
  Cinéma: { color: "#a855f7" },
  Sport: { color: "#10b981" },
};

export const CAT_COLORS = {
  culture: "#a855f7",
  nature: "#22c55e",
  gastronomie: "#ef4444",
  détente: "#06b6d4",
  aventure: "#f97316",
  sport: "#3b82f6",
  famille: "#f59e0b",
  nightlife: "#ec4899",
  autre: "#64748b",
};

export const BUDGET_COLORS = { économique: "#22c55e", moyen: "#3b82f6", luxe: "#f5c842" };
export const SAISON_COLORS = { automne: "#f97316", printemps: "#22c55e", ete: "#06b6d4", hiver: "#a855f7" };

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITAIRES — INTACTS
───────────────────────────────────────────────────────────────────────────── */
export function formatDuree(d) {
  const map = {
    "1h": "1h", "2h": "2h",
    "demi-journée": "Demi-journée", "Demi-journée": "Demi-journée",
    "journée complète": "Journée complète", "Journée complète": "Journée complète",
    "soirée": "Soirée", "quelques heures": "Quelques heures",
  };
  return map[d] ?? d;
}

export function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

/* ─────────────────────────────────────────────────────────────────────────────
   FAVORIS — localStorage helpers
───────────────────────────────────────────────────────────────────────────── */
const FAV_KEY = "tg-favoris";

export function getFavoris() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch { return []; }
}

function _saveFavoris(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
  /* dispatch a storage event so other tabs / components can react */
  window.dispatchEvent(new Event("favoris-updated"));
}

export function isFavori(item) {
  const key = item.id || item.nom;
  return getFavoris().some(f => (f.id || f.nom) === key);
}

export function addFavori(item) {
  if (isFavori(item)) return;
  const list = getFavoris();
  list.push({ ...item, _savedAt: Date.now() });
  _saveFavoris(list);
}

export function removeFavori(item) {
  const key = item.id || item.nom;
  _saveFavoris(getFavoris().filter(f => (f.id || f.nom) !== key));
}

export function toggleFavori(item) {
  if (isFavori(item)) { removeFavori(item); return false; }
  addFavori(item); return true;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES — PREMIUM REDESIGN
───────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tg-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f8fffe;
    color: #0f172a;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .tg-serif { font-family: 'Playfair Display', Georgia, serif; }

  /* ── Keyframes Premium ── */
  @keyframes tg-fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes tg-fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes tg-spin    { to { transform:rotate(360deg); } }
  @keyframes tg-shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
  @keyframes tg-pulse-soft { 0%,100%{opacity:1;} 50%{opacity:0.6;} }
  @keyframes tg-float   { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
  @keyframes tg-shimmer-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes tg-glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(15,118,110,0.2); }
    50% { box-shadow: 0 0 40px rgba(14,165,233,0.3); }
  }

  .tg-animate-fadeUp { animation: tg-fadeUp 0.6s ease both; }
  .tg-animate-fadeIn { animation: tg-fadeIn 0.4s ease both; }

  /* ── Skeleton premium ── */
  .tg-skeleton {
    background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
    background-size: 200% 100%;
    animation: tg-shimmer 1.4s infinite;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  }
  .tg-skeleton::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: tg-shimmer-slide 1.8s infinite;
  }

  /* ── Buttons premium ── */
  .tg-btn-primary {
    background: linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%);
    color: #fff; border: none; border-radius: 14px;
    padding: 12px 28px; font-family:'Inter',sans-serif; font-size:14px;
    font-weight:600; cursor:pointer; letter-spacing: 0.01em;
    transition: all .3s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 4px 15px rgba(15,118,110,0.3);
    position: relative; overflow: hidden;
  }
  .tg-btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    opacity: 0; transition: opacity .3s;
  }
  .tg-btn-primary:hover {
    transform:translateY(-2px);
    box-shadow:0 8px 30px rgba(15,118,110,0.4);
  }
  .tg-btn-primary:hover::before { opacity: 1; }
  .tg-btn-primary:active { transform:translateY(0); box-shadow:0 4px 15px rgba(15,118,110,0.3); }

  .tg-btn-outline {
    background:transparent; color:#0f766e; border:1.5px solid #0f766e;
    border-radius:14px; padding:10px 24px; font-family:'Inter',sans-serif;
    font-size:14px; font-weight:500; cursor:pointer; transition:all .25s;
    position: relative; overflow: hidden;
  }
  .tg-btn-outline::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, #0f766e, #0ea5e9);
    opacity: 0; transition: opacity .25s; z-index: -1;
  }
  .tg-btn-outline:hover {
    color:#fff; transform:translateY(-1px);
    box-shadow:0 6px 20px rgba(15,118,110,0.25);
  }
  .tg-btn-outline:hover::before { opacity: 1; }

  .tg-btn-ghost {
    background:rgba(15,118,110,0.06); color:#0f766e;
    border:1.5px solid rgba(15,118,110,0.15);
    border-radius:14px; padding:9px 20px; font-family:'Inter',sans-serif;
    font-size:13px; font-weight:500; cursor:pointer; transition:all .25s;
    backdrop-filter: blur(4px);
  }
  .tg-btn-ghost:hover {
    background:rgba(15,118,110,0.12); border-color:#0f766e;
    transform:translateY(-1px);
  }

  /* ── Card premium ── */
  .tg-card {
    background:#fff; border-radius:20px; border:1px solid #e2e8f0;
    overflow:hidden;
    transition: transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s cubic-bezier(.4,0,.2,1), border-color .25s;
    box-shadow: 0 4px 24px rgba(15,118,110,0.06);
    position: relative;
  }
  .tg-card::after {
    content: ''; position: absolute; inset: 0; border-radius: inherit;
    background: linear-gradient(135deg, rgba(14,165,233,0.04) 0%, transparent 50%);
    opacity: 0; transition: opacity .3s; pointer-events: none;
  }
  .tg-card:hover {
    transform:translateY(-8px);
    box-shadow:0 20px 50px rgba(15,118,110,0.15);
    border-color:rgba(14,165,233,0.2);
  }
  .tg-card:hover::after { opacity: 1; }

  /* ── Tags premium ── */
  .tg-tag {
    display:inline-block;
    background: linear-gradient(135deg, rgba(15,118,110,0.08), rgba(14,165,233,0.08));
    color:#0f766e;
    font-size:11px; font-weight:600; padding:5px 14px;
    border-radius:100px; letter-spacing:.04em;
    border: 1px solid rgba(15,118,110,0.12);
    backdrop-filter: blur(4px);
  }
  .tg-tag-outline {
    display:inline-block; background:transparent; color:#0f766e;
    border:1px solid rgba(20,184,166,0.4); font-size:11px; font-weight:500;
    padding:4px 12px; border-radius:100px;
  }

  /* ── Filter buttons ── */
  .tg-filter-btn {
    padding:8px 18px; border-radius:14px; border:1.5px solid #e2e8f0;
    background:#fff; color:#64748b; font-family:'Inter',sans-serif;
    font-size:13px; font-weight:500; cursor:pointer; transition:all .25s; white-space:nowrap;
  }
  .tg-filter-btn:hover, .tg-filter-btn.active {
    border-color:#0f766e; background:linear-gradient(135deg, #0f766e, #0ea5e9);
    color:#fff; box-shadow: 0 4px 15px rgba(15,118,110,0.25);
  }

  .tg-section-label {
    font-size:11px; font-weight:700; letter-spacing:.14em;
    text-transform:uppercase; color:#14b8a6; margin-bottom:10px;
  }

  /* ── Search bar premium ── */
  .tg-search {
    display:flex; align-items:center; background:rgba(255,255,255,0.85);
    border-radius:16px; padding:6px 8px 6px 22px;
    box-shadow:0 8px 40px rgba(0,0,0,.08), 0 0 0 1px rgba(15,118,110,0.06);
    gap:10px; max-width:520px; width:100%;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.3);
  }
  .tg-search input {
    border:none; outline:none; flex:1; font-family:'Inter',sans-serif;
    font-size:15px; color:#0f172a; background:transparent;
  }
  .tg-search input::placeholder { color:#94a3b8; }

  /* ── Image overlay ── */
  .tg-img-overlay::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(to top,rgba(15,118,110,.65) 0%,transparent 55%);
    pointer-events:none;
  }

  /* ── Rating premium ── */
  .tg-rating {
    display:inline-flex; align-items:center; gap:4px;
    background:rgba(255,255,255,0.92); border-radius:100px; padding:4px 12px;
    font-size:12px; font-weight:700; color:#0f766e;
    box-shadow:0 2px 12px rgba(0,0,0,.10);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.3);
  }

  /* ── Progress bar ── */
  .tg-progress-track {
    height:4px; background:rgba(15,118,110,0.08); border-radius:100px; overflow:hidden;
  }
  .tg-progress-bar {
    height:100%; border-radius:100px;
    background:linear-gradient(90deg,#14b8a6,#0ea5e9);
    transition:width .8s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 0 8px rgba(14,165,233,0.3);
  }

  /* ── Spinner premium ── */
  .tg-spinner {
    width:40px; height:40px;
    border:2.5px solid rgba(15,118,110,0.1); border-top-color:#0f766e;
    border-radius:50%; animation:tg-spin .75s linear infinite;
  }

  /* ── Nav tabs premium ── */
  .tg-nav-tab {
    padding:10px 18px; background:transparent; border:none;
    border-bottom:2px solid transparent; font-family:'Inter',sans-serif;
    font-size:14px; font-weight:400; color:#64748b;
    cursor:pointer; transition:all .25s; white-space:nowrap;
    position: relative;
  }
  .tg-nav-tab::after {
    content: ''; position: absolute; bottom: 0; left: 50%; width: 0; height: 2px;
    background: linear-gradient(90deg, #0f766e, #0ea5e9);
    border-radius: 99px; transition: all .3s; transform: translateX(-50%);
  }
  .tg-nav-tab:hover { color:#0f766e; }
  .tg-nav-tab:hover::after { width: 60%; }
  .tg-nav-tab.active { color:#0f766e; border-bottom-color:transparent; font-weight:600; }
  .tg-nav-tab.active::after { width: 80%; }

  /* ── Input premium ── */
  .tg-input {
    width:100%; padding:12px 16px 12px 42px;
    border:1.5px solid #e2e8f0; border-radius:14px;
    font-family:'Inter',sans-serif; font-size:14px; color:#0f172a;
    background:#fff; outline:none; transition:all .25s;
    box-sizing: border-box;
  }
  .tg-input:focus {
    border-color:#14b8a6;
    box-shadow:0 0 0 4px rgba(20,184,166,0.1);
  }
  .tg-input::placeholder { color:#94a3b8; }

  /* ── Glass card ── */
  .tg-glass {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.35);
    box-shadow: 0 8px 32px rgba(31,38,135,0.06);
  }

  /* ── Scrollbar custom ── */
  .tg-scroll::-webkit-scrollbar { width: 6px; }
  .tg-scroll::-webkit-scrollbar-track { background: transparent; }
  .tg-scroll::-webkit-scrollbar-thumb {
    background: rgba(15,118,110,0.15); border-radius: 99px;
  }
  .tg-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(15,118,110,0.3);
  }

  /* ── Responsive helpers ── */
  @media (max-width: 768px) {
    .tg-hide-mobile { display: none !important; }
  }
  @media (min-width: 769px) {
    .tg-hide-desktop { display: none !important; }
  }
`;

export function InjectGlobalStyles() {
  useEffect(() => {
    const id = "tg-global-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPOSANTS ATOMIQUES PARTAGÉS — PREMIUM REDESIGN
───────────────────────────────────────────────────────────────────────────── */
export function Spinner({ size = 40 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div className="tg-spinner" style={{ width: size, height: size }} />
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #fff5f5, #fef2f2)",
      border: "1px solid rgba(239,68,68,0.15)",
      borderRadius: T.radiusXl, padding: "28px 28px",
      textAlign: "center", margin: "32px 0",
      boxShadow: "0 4px 20px rgba(239,68,68,0.06)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "rgba(239,68,68,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px", fontSize: "1.2rem",
      }}>
        ⚠️
      </div>
      <p style={{ color: "#b91c1c", fontWeight: 600, marginBottom: 8, fontSize: 15 }}>Erreur de chargement</p>
      <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>{message}</p>
      {onRetry && (
        <button className="tg-btn-outline" onClick={onRetry} style={{ fontSize: 13 }}>
          Réessayer
        </button>
      )}
    </div>
  );
}

export function WaveSeparator({ flip = false, color = T.bg }) {
  return (
    <div style={{ display: "block", width: "100%", lineHeight: 0, transform: flip ? "rotate(180deg)" : "none" }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
        <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill={color} />
      </svg>
    </div>
  );
}

export function SectionHero({ label, title, subtitle }) {
  return (
    <div style={{
      background: T.gradientHero,
      padding: "80px 24px 0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative circles */}
      <div style={{
        position: "absolute", top: -80, right: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 60, left: -60,
        width: 200, height: 200, borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", paddingBottom: 48, position: "relative" }}>
        <p className="tg-section-label" style={{
          color: "rgba(255,255,255,0.8)",
          background: "rgba(255,255,255,0.1)",
          display: "inline-block",
          padding: "6px 18px",
          borderRadius: 99,
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          marginBottom: 20,
        }}>{label}</p>
        <h1 className="tg-serif tg-animate-fadeUp" style={{
          fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 600,
          color: "#fff", lineHeight: 1.15, marginBottom: 16,
          textShadow: "0 2px 20px rgba(0,0,0,0.1)",
        }}>
          {title}
        </h1>
        <p className="tg-animate-fadeUp" style={{
          color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.7, animationDelay: "0.1s",
          maxWidth: 500, margin: "0 auto",
        }}>
          {subtitle}
        </p>
      </div>
      <WaveSeparator color={T.bg} />
    </div>
  );
}

export function ProgressBar({ value, max, color = T.primary, height = 5 }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="tg-progress-track" style={{ height }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: "100px",
        background: color, transition: "width .8s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

export function KPICard({ label, value, icon, color = T.primary }) {
  return (
    <div style={{
      background: "#fff", borderRadius: T.radiusXl,
      border: `1px solid ${T.border}`, padding: "22px 20px",
      boxShadow: T.shadow, borderTop: `3px solid ${color}`,
      transition: "all .3s cubic-bezier(.4,0,.2,1)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative gradient */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}08, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontSize: "1.8rem", fontWeight: 800, color, lineHeight: 1,
        marginBottom: 4, fontFamily: "'Inter', sans-serif",
      }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE IA — PREMIUM GLASS
═══════════════════════════════════════════════════════════════════════════ */
export function AIBadge({ small }) {
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
   IMAGE CAROUSEL — PREMIUM
═══════════════════════════════════════════════════════════════════════════ */
export function ImageCarousel({ images = [], heroImage }) {
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

      {/* Carousel dots */}
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

      {/* Navigation arrows */}
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
export function DetailModal({ item, rank, onClose }) {
  const navigate = useNavigate();
  const isTop = rank === 0;
  const [liked, setLiked] = useState(() => isFavori(item));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleToggleFav = (e) => {
    e.stopPropagation();
    const nowLiked = toggleFavori(item);
    setLiked(nowLiked);
  };

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
          position: "fixed", inset: 0, zIndex: 1100,
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
          <ImageCarousel images={allPhotos} heroImage={item.image} />

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320, pointerEvents: "none" }}>
            <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", pointerEvents: "auto" }}>
              <X size={18} />
            </motion.button>
            <motion.button onClick={handleToggleFav} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ position: "absolute", top: 16, right: 70, width: 44, height: 44, borderRadius: "50%", background: liked ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: liked ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: liked ? "#f87171" : "#fff", pointerEvents: "auto" }}>
              <Heart size={18} fill={liked ? "#f87171" : "none"} />
            </motion.button>
            <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "auto" }}>
              {(item.latitude && item.longitude) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    navigate("/map", { state: { ...item } });
                  }}
                  style={{
                    background: "rgba(15,118,110,0.9)", backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
                    padding: "8px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 8,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                  }}
                >
                  <MapIcon size={14} /> Voir sur la carte
                </motion.button>
              )}
            </div>

            {isTop && (
              <motion.div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", borderRadius: 99, padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", boxShadow: "0 4px 15px rgba(245,158,11,0.3)" }}>
                <Award size={12} /> MEILLEUR CHOIX
              </motion.div>
            )}
            <AIBadge small />
          </div>
          {item.rating && (
            <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 99, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
              <Star size={14} fill="#fbbf24" stroke="#fbbf24" /> <span style={{ fontSize: 14, fontWeight: 700 }}>{Number(item.rating).toFixed(1)}</span>
            </div>
          )}

          <div style={{ padding: "32px 36px 36px" }}>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a", marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.3 }}>{item.nom}</h2>

            {/* Row with Price and Hours */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "24px 0" }}>
              <div style={{ background: "#f8fafc", borderRadius: 20, padding: "20px", display: "flex", alignItems: "center", gap: 16, border: "1px solid #f1f5f9" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(15,122,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={20} color="#0f7a6e" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Tarif</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{item.prix || "Prix ouvert"}</div>
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 20, padding: "20px", display: "flex", alignItems: "center", gap: 16, border: "1px solid #f1f5f9" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(14,165,233,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={20} color="#0ea5e9" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Horaires</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                    {typeof item.horaires === "object" && item.horaires !== null
                      ? Object.entries(item.horaires)
                        .map(([jour, h]) => `${jour.charAt(0).toUpperCase() + jour.slice(1)} : ${h}`)
                        .join(" · ")
                      : (item.horaires || "09h - 18h")}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Description</h3>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.8 }}>{item.description}</p>
              </div>
            )}

            {/* Interactive Map Section */}
            <div style={{
              background: "linear-gradient(135deg, #f0fdfa, #ecfeff)",
              borderRadius: 24, padding: "40px 20px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 12, border: "1px solid #ccfbf1", marginBottom: 32,
              position: "relative", overflow: "hidden"
            }}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(15,122,110,0.12)", color: "#0f7a6e" }}
              >
                <Navigation size={24} />
              </motion.div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Carte interactive</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{item.adresse || "Tanger, Maroc"}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(15,118,110,0.35)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 2, padding: "14px 20px", borderRadius: 16, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)",
                  color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: "0 4px 18px rgba(15,118,110,0.3)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <MapPin size={17} /> Voir sur la carte
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, background: "rgba(15,118,110,0.08)", borderColor: "#0f766e" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 16, cursor: "pointer",
                  background: "rgba(15,118,110,0.04)", border: "1.5px solid rgba(15,118,110,0.2)",
                  color: "#0f766e", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.25s",
                }}
              >
                <Share2 size={15} /> Partager
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, background: "rgba(239,68,68,0.1)", borderColor: "#ef4444" }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 16, cursor: "pointer",
                  background: "rgba(239,68,68,0.04)", border: "1.5px solid rgba(239,68,68,0.2)",
                  color: "#ef4444", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.25s",
                }}
              >
                <X size={15} /> Fermer
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence >
  );
}