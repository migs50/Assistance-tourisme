/**
 * Dashboard.jsx
 * Page analytics — KPIs, catégories, budget, hôtels, top activités, profils.
 */
import { useState, useEffect } from "react";
import {
  T, dashFetch, CAT_COLORS, BUDGET_COLORS, SAISON_COLORS,
  Spinner, KPICard, ProgressBar, cap,
} from "./shared";

/* ─── Sous-panneaux ────────────────────────────────────────────────────────── */

function DashGlobal({ data }) {
  if (!data) return <Spinner />;
  const { overview, pricing, quality, geography } = data;
  const kpis = [
    { label: "Lieux touristiques", value: overview.total_lieux_touristiques, icon: "🏛️", color: T.primary },
    { label: "Activités",          value: overview.total_activites,           icon: "🎯", color: "#f97316" },
    { label: "Hôtels",             value: overview.total_hotels,              icon: "🏨", color: "#f5c842" },
    { label: "Restaurants",        value: overview.total_restaurants,         icon: "🍽️",color: "#ef4444" },
    { label: "Plages & Espaces",   value: overview.total_plages,              icon: "🏖️",color: "#06b6d4" },
    { label: "Événements 2026",    value: overview.total_events,              icon: "🎪", color: "#22c55e" },
    { label: "Avis collectés",     value: overview.total_avis,                icon: "💬", color: "#3b82f6" },
    { label: "Profils analysés",   value: overview.total_utilisateurs,        icon: "👤", color: "#ec4899" },
  ];
  const maxQ = geography.top_quartiers[0]?.count || 1;
  const quarterColors = [T.primary, "#a855f7", "#06b6d4", "#22c55e", "#f5c842"];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 14 }}>
        {/* Prix moyens */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Prix moyens</p>
          {[
            { label: "Hôtel / nuit",  val: `${pricing.prix_moyen_hotel_mad?.toLocaleString()} MAD`, color: "#f5c842", raw: pricing.prix_moyen_hotel_mad,      max: 2000 },
            { label: "Repas / pers.", val: `${pricing.prix_moyen_restaurant_mad} MAD`,              color: "#ef4444", raw: pricing.prix_moyen_restaurant_mad, max: 500  },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
              <ProgressBar value={row.raw} max={row.max} color={row.color} />
            </div>
          ))}
        </div>

        {/* Satisfaction */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, textAlign: "center", boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Satisfaction globale</p>
          <div style={{ fontSize: "3.2rem", fontWeight: 700, color: "#f59e0b", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>
            {quality.note_moyenne_globale}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, margin: "6px 0 16px" }}>
            / 5.0 · {quality.total_avis_collectes} avis
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} style={{ color: i <= Math.round(quality.note_moyenne_globale) ? "#f59e0b" : T.border, fontSize: 18 }}>★</span>
            ))}
          </div>
        </div>

        {/* Top quartiers */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 16 }}>Top quartiers touristiques</p>
          {geography.top_quartiers.map((q, i) => (
            <div key={q.quartier} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: quarterColors[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{q.quartier}</span>
                </div>
                <span style={{ fontSize: 12, color: T.textMuted }}>{q.count} lieux</span>
              </div>
              <ProgressBar value={q.count} max={maxQ} color={quarterColors[i]} />
            </div>
          ))}
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
  const CAT_EMOJI = { culture: "🏛️", nature: "🌿", gastronomie: "🍽️", détente: "🧘", aventure: "🪂", sport: "⚽", famille: "👨‍👩‍👧", nightlife: "🎶", autre: "📍" };

  return (
    <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 28, boxShadow: T.shadow }}>
      <p className="tg-section-label" style={{ marginBottom: 22 }}>Répartition par catégorie</p>
      {entries.map(([cat, val]) => {
        const color = CAT_COLORS[cat] || T.textMuted;
        const pct   = Math.round((val / total) * 100);
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

  const sections = [
    { title: "Budget visiteurs",    items: users,  total: totalU,                                              suffix: "visiteurs", extra: (
      <div style={{ marginTop: 16, padding: "12px 16px", background: T.light, borderRadius: T.radiusSm }}>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>Budget moyen / jour</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.primary, fontFamily: "'Cormorant Garamond', serif" }}>
          {(data.budget_moyen_utilisateur_mad || 1160).toLocaleString()} MAD
        </div>
      </div>
    )},
    { title: "Segment hôtelier",    items: hotels, total: Object.values(hotels).reduce((s,v)=>s+v,0)||1,     suffix: "hôtels" },
    { title: "Activités par budget",items: acts,   total: Object.values(acts).reduce((s,v)=>s+v,0)||1,       suffix: "activités" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      {sections.map(({ title, items, total, suffix, extra }) => (
        <div key={title} style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 24, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 20 }}>{title}</p>
          {["économique", "moyen", "luxe"].map(b => {
            const val   = items[b] || 0;
            const color = BUDGET_COLORS[b];
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
          { label: "Note moyenne",      value: `${rating_moyen}/5`,                          icon: "⭐", color: "#f59e0b" },
          { label: "Avec piscine",      value: `${amenites?.pct_avec_piscine}%`,              icon: "🏊", color: "#06b6d4" },
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
                  {[{ l: "Moy.", v: `${cat.prix_moyen} MAD` }, { l: "Note", v: `★ ${cat.rating_moyen}` }].map(({ l, v }) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: T.textMuted }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color }}>{v}</div>
                    </div>
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
            {[
              { label: "Avec piscine", pct: amenites?.pct_avec_piscine, color: "#06b6d4" },
              { label: "Vue mer",      pct: amenites?.pct_avec_vue_mer,  color: "#3b82f6" },
            ].map(eq => (
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
  const CAT_EMOJI = { culture: "🏛️", nature: "🌿", gastronomie: "🍽️", détente: "🧘", aventure: "🪂", sport: "⚽", famille: "👨‍👩‍👧", nightlife: "🎶", autre: "📍" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: T.light, borderRadius: T.radius, padding: "20px 24px", border: `1px solid ${T.secondary}30` }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.primary, marginBottom: 6 }}>Méthode de scoring</p>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>{methode}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(poids).map(([k, v]) => (
            <span key={k} className="tg-tag" style={{ fontSize: 11 }}>
              {k.replace(/_/g, " ")} {Math.round(v * 100)}%
            </span>
          ))}
        </div>
      </div>

      {top_activities.map((act, i) => {
        const color = CAT_COLORS[act.type] || T.primary;
        return (
          <div key={act.nom} style={{
            background: "#fff", borderRadius: T.radius,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${i === 0 ? T.primary : T.border}`,
            padding: "16px 20px", display: "flex", alignItems: "center",
            gap: 16, boxShadow: T.shadow,
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: i === 0 ? T.primary : T.textMuted, fontFamily: "'Cormorant Garamond', serif", minWidth: 28 }}>
              {["1st", "2nd", "3rd"][i] || `${i + 1}th`}
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
          { label: "Type dominant", value: profil_type.type_voyageur,                      icon: "👤", color: T.primary },
          { label: "Âge moyen",     value: `${Math.round(profil_type.age_moyen)} ans`,      icon: "🎂", color: "#06b6d4" },
          { label: "Budget / jour", value: `${profil_type.budget_moyen_mad?.toLocaleString()} MAD`, icon: "💰", color: "#f97316" },
          { label: "Durée séjour",  value: `${profil_type.duree_sejour_jours?.toFixed(1)} jours`, icon: "📅", color: "#22c55e" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16 }}>
        {/* Saisons */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 18 }}>Saison préférée</p>
          {Object.entries(saisons.distribution || {}).sort((a, b) => b[1] - a[1]).map(([s, n]) => {
            const total = Object.values(saisons.distribution).reduce((a, b) => a + b, 0);
            const color = SAISON_COLORS[s] || T.textMuted;
            return (
              <div key={s} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{s}</span>
                  <span style={{ fontSize: 12, color, fontWeight: 600 }}>{Math.round(n / total * 100)}%</span>
                </div>
                <ProgressBar value={n} max={total} color={color} />
              </div>
            );
          })}
        </div>

        {/* Nationalités */}
        <div style={{ background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 22, boxShadow: T.shadow }}>
          <p className="tg-section-label" style={{ marginBottom: 18 }}>Top nationalités</p>
          {Object.entries(demographique.top_nationalites || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nat, n], i) => {
            const colors = [T.primary, "#a855f7", "#06b6d4", "#22c55e", "#f5c842"];
            const max    = Object.values(demographique.top_nationalites)[0];
            return (
              <div key={nat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: colors[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</span>
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
          {(preferences.categories || []).map(c => {
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

/* ─── Config onglets ────────────────────────────────────────────────────────── */
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

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const [activePanel, setActivePanel] = useState("global");
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (data[activePanel] || loading[activePanel]) return;
    setLoading(l => ({ ...l, [activePanel]: true }));
    dashFetch(PANEL_ENDPOINTS[activePanel])
      .then(d  => setData(prev => ({ ...prev, [activePanel]: d })))
      .catch(e => setErrors(prev => ({ ...prev, [activePanel]: e.message })))
      .finally(() => setLoading(l => ({ ...l, [activePanel]: false })));
  }, [activePanel]);

  return (
    <>
      {/* ── En-tête teal ── */}
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

          {/* Onglets */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {DASH_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                style={{
                  padding: "10px 18px", background: "transparent", border: "none",
                  borderBottom: `2.5px solid ${activePanel === tab.id ? "#fff" : "transparent"}`,
                  color: activePanel === tab.id ? "#fff" : "rgba(255,255,255,0.55)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  fontWeight: activePanel === tab.id ? 500 : 400,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.18s",
                  borderRadius: "6px 6px 0 0",
                }}
              >
                {tab.label}
                {loading[tab.id] && (
                  <span style={{ marginLeft: 6, display: "inline-block", width: 7, height: 7, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "tg-spin 0.6s linear infinite" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vague */}
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 40 }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1350,10 1440,20 L1440,40 L0,40 Z" fill={T.bg} />
        </svg>
      </div>

      {/* ── Contenu panneau ── */}
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