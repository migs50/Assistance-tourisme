/**
 * Activites.jsx
 * Page activités — filtres type/budget/recherche, grille de cartes.
 */
import { useState, useMemo } from "react";
import {
  T, activitesApi, TYPE_CONFIG,
  useApiDataWithRefetch, SectionHero, Spinner, ErrorBanner,
  formatDuree, cap,
} from "./shared";

/* ─── Carte activité ──────────────────────────────────────────────────────── */
function ActiviteCard({ act, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg      = TYPE_CONFIG[act.type] ?? { color: T.secondary, label: act.type };
  const imgUrl   = act.image || act.image_url || "";
  const isGratuit = act.prix?.toLowerCase() === "gratuit";

  return (
    <div
      className="tg-card tg-animate-fadeUp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
    >
      {/* Image */}
      <div style={{ height: 190, position: "relative", background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : T.light }}>
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

      {/* Corps */}
      <div style={{ padding: "18px 20px 20px" }}>
        <h3 className="tg-serif" style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: T.text }}>
          {act.nom}
        </h3>
        <p style={{
          fontSize: 12, color: T.textMuted, lineHeight: 1.65, marginBottom: 14,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
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

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Activites() {
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
      const matchSearch = !q
        || a.nom?.toLowerCase().includes(q)
        || a.description?.toLowerCase().includes(q)
        || a.type?.toLowerCase().includes(q);
      return matchType && matchBudget && matchSearch;
    });
  }, [activitesData, activeType, activeBudget, search]);

  const resetFilters = () => { setActiveType("tous"); setActiveBudget("tous"); setSearch(""); };

  return (
    <>
      <SectionHero
        label="Explorer Tanger"
        title={<>Que faire à <em style={{ fontStyle: "italic", color: T.light }}>Tanger ?</em></>}
        subtitle={
          loading
            ? "Chargement des activités…"
            : `${activitesData.length} activités sélectionnées — aventure, sport, culture, famille`
        }
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Barre de filtres ── */}
        {!loading && !error && (
          <div style={{
            background: "#fff", borderRadius: T.radius, border: `1px solid ${T.border}`,
            padding: "20px 22px", marginBottom: 36, boxShadow: T.shadow,
          }}>
            {/* Recherche */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="tg-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une activité, un lieu, un type…"
              />
            </div>

            {/* Type */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>
                Type :
              </span>
              {availableTypes.map(t => (
                <button
                  key={t}
                  className={`tg-filter-btn ${activeType === t ? "active" : ""}`}
                  onClick={() => setActiveType(t)}
                >
                  {t === "tous" ? "Tous" : TYPE_CONFIG[t]?.label || t}
                </button>
              ))}
            </div>

            {/* Budget */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>
                Budget :
              </span>
              {["tous", "économique", "moyen", "luxe"].map(b => (
                <button
                  key={b}
                  className={`tg-filter-btn ${activeBudget === b ? "active" : ""}`}
                  onClick={() => setActiveBudget(b)}
                >
                  {b === "tous" ? "Tous budgets" : cap(b)}
                </button>
              ))}
              {(activeType !== "tous" || activeBudget !== "tous" || search) && (
                <button
                  className="tg-btn-ghost"
                  onClick={resetFilters}
                  style={{ marginLeft: "auto", borderColor: "#fca5a5", color: "#b91c1c", fontSize: 12 }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}

        {loading && <Spinner />}
        {error   && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>
              <span style={{ color: T.text, fontWeight: 600 }}>{filtered.length}</span>{" "}
              activité{filtered.length > 1 ? "s" : ""}
            </p>

            {filtered.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 24 }}>
                {filtered.map((act, i) => (
                  <ActiviteCard key={act.id || `${act.nom}-${i}`} act={act} index={i} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                <p style={{ fontSize: 16, marginBottom: 16 }}>Aucune activité trouvée.</p>
                <button className="tg-btn-outline" onClick={resetFilters}>
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