/**
 * Activites.jsx
 * Page activités — filtres type/budget/recherche, grille de cartes.
 */
import { useState, useMemo } from "react";
import {
  T, activitesApi, TYPE_CONFIG,
  useApiDataWithRefetch, SectionHero, Spinner, ErrorBanner,
  formatDuree, cap, DetailModal
} from "./SharedTanger";
import { motion, AnimatePresence } from "framer-motion";
import { Info, MapPin, Star, ChevronRight } from "lucide-react";

/* ─── Carte activité ──────────────────────────────────────────────────────── */
function ActiviteCard({ act, index, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const cfg = TYPE_CONFIG[act.type] ?? { color: T.secondary, label: act.type };
  const imgUrl = act.image || act.image_url || "";
  const isGratuit = act.prix?.toLowerCase() === "gratuit";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={onOpen}
      style={{
        background: "#fff", borderRadius: 22, overflow: "hidden",
        border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : T.light,
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />

        <span style={{
          position: "absolute", top: 14, left: 14,
          background: "rgba(255,255,255,0.9)", border: `1px solid rgba(255,255,255,0.4)`,
          color: cfg.color, fontSize: 11, fontWeight: 700,
          padding: "5px 14px", borderRadius: "100px",
          backdropFilter: "blur(8px)", fontFamily: "'Inter', sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {cfg.label}
        </span>

        {act.rating && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(15,122,110,0.9)", borderRadius: 99,
            padding: "5px 12px", display: "flex", alignItems: "center", gap: 5,
            color: "#fff", fontSize: 13, fontWeight: 700,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
            <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
            {Number(act.rating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Corps */}
      <div style={{ padding: "20px 24px 24px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, color: T.text, fontFamily: "'Inter', sans-serif" }}>
          {act.nom}
        </h3>
        <p style={{
          fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 18,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {act.description}
        </p>

        {/* Meta chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
          {[act.localisation, formatDuree(act.duree), cap(act.budget)].filter(Boolean).map((v, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 600, color: "#64748b",
              padding: "4px 10px", background: "#f1f5f9", borderRadius: 8,
            }}>{v}</span>
          ))}
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 18, borderTop: `1px solid #f1f5f9`
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: isGratuit ? "#059669" : "#0f172a" }}>
            {act.prix}
          </span>
          <button className="tg-btn-primary-new" style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            Lire plus
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Activites() {
  const [activeType, setActiveType] = useState("tous");
  const [activeBudget, setActiveBudget] = useState("tous");
  const [search, setSearch] = useState("");
  const [selectedAct, setSelectedAct] = useState(null);

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
      const matchType = activeType === "tous" || a.type === activeType;
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
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>
              <span style={{ color: T.text, fontWeight: 600 }}>{filtered.length}</span>{" "}
              activité{filtered.length > 1 ? "s" : ""}
            </p>

            {filtered.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 28 }}>
                {filtered.map((act, i) => (
                  <ActiviteCard
                    key={act.id || `${act.nom}-${i}`}
                    act={act}
                    index={i}
                    onOpen={() => setSelectedAct(act)}
                  />
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

      <AnimatePresence>
        {selectedAct && (
          <DetailModal item={selectedAct} rank={-1} onClose={() => setSelectedAct(null)} />
        )}
      </AnimatePresence>
    </>
  );
}