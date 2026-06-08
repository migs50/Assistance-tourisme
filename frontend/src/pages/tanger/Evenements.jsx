/**
 * Evenements.jsx
 * Page événements — filtres par catégorie, cartes avec DetailModal zoom.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  T, evenementsApi, CAT_EVENT_CONFIG,
  useApiDataWithRefetch, SectionHero, Spinner, ErrorBanner, DetailModal,
} from "./SharedTanger";
import { ChevronRight, Calendar, MapPin } from "lucide-react";

/* ─── Carte événement ─────────────────────────────────────────────────────── */
function EventCard({ ev, index, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const cfg = CAT_EVENT_CONFIG[ev.category] || { color: T.primary };
  const imgUrl = ev.image_url || ev.image || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={{
        background: "#fff", borderRadius: 22, overflow: "hidden",
        border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        cursor: "pointer", display: "flex", flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Image */}
      <div style={{ height: 200, position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          background: imgUrl
            ? `url(${imgUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}40)`,
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />

        {/* Catégorie badge */}
        <span style={{
          position: "absolute", top: 14, left: 14, zIndex: 1,
          background: `${cfg.color}20`, border: `1px solid ${cfg.color}60`,
          color: cfg.color, fontSize: 11, fontWeight: 700,
          padding: "5px 14px", borderRadius: "100px",
          backdropFilter: "blur(8px)", fontFamily: "'Inter', sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {ev.category}
        </span>

        {/* Badge À venir */}
        <span style={{
          position: "absolute", top: 14, right: 14, zIndex: 1,
          background: "#f0fdf4", color: "#16a34a",
          fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 99,
        }}>
          À venir
        </span>
      </div>

      {/* Corps */}
      <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10, color: T.text, fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>
          {ev.title || ev.titre || ev.nom}
        </h3>

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          {ev.date && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: cfg.color, fontWeight: 600 }}>
              <Calendar size={12} />
              {ev.date}
            </span>
          )}
          {(ev.location || ev.lieu) && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.textMuted }}>
              <MapPin size={12} />
              {ev.location || ev.lieu}
            </span>
          )}
        </div>

        <p style={{
          fontSize: 13, color: T.textMuted, lineHeight: 1.65, marginBottom: 18, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {ev.description}
        </p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          paddingTop: 16, borderTop: "1px solid #f1f5f9",
        }}>
          <button
            className="tg-btn-primary"
            style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            Lire plus
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Evenements() {
  const [filter, setFilter] = useState("tous");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: rawData, loading, error, refetch } = useApiDataWithRefetch(
    () => evenementsApi.getAll()
  );

  /* Support plusieurs formats de réponse */
  const eventsData = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData)
      ? rawData
      : (rawData.evenements || rawData.events || rawData.data || []);
  }, [rawData]);

  /* Catégories présentes dans les données */
  const cats = useMemo(() => {
    const found = new Set(eventsData.map(e => e.category).filter(Boolean));
    return ["tous", ...Object.keys(CAT_EVENT_CONFIG).filter(k => found.has(k))];
  }, [eventsData]);

  const filtered = useMemo(
    () => eventsData.filter(e => filter === "tous" || e.category === filter),
    [eventsData, filter]
  );

  /* Normalise l'événement pour le modal (compatibilité avec DetailModal) */
  const normalizeEvent = (ev) => ({
    ...ev,
    nom: ev.title || ev.titre || ev.nom || "Événement",
    image: ev.image_url || ev.image || "",
    adresse: ev.location || ev.lieu || "Tanger, Maroc",
    horaires: ev.date || ev.horaires || "Voir programme",
    prix: ev.prix || ev.tarif || "Entrée libre",
  });

  return (
    <>
      <SectionHero
        label="Agenda 2026–2027"
        title={<>Événements à <em style={{ fontStyle: "italic", color: T.light }}>Tanger</em></>}
        subtitle={
          loading
            ? "Chargement…"
            : `${eventsData.length} événements à venir — concerts, festivals, culture et sport`
        }
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Filtres catégorie ── */}
        {!loading && !error && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
            {cats.map(c => {
              const cfg = CAT_EVENT_CONFIG[c];
              const isActive = filter === c;
              return (
                <button
                  key={c}
                  className={`tg-filter-btn ${isActive ? "active" : ""}`}
                  onClick={() => setFilter(c)}
                  style={isActive && cfg ? { borderColor: cfg.color, background: cfg.color, color: "#fff" } : {}}
                >
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
              <span style={{ color: T.text, fontWeight: 600 }}>{filtered.length}</span>{" "}
              événement{filtered.length > 1 ? "s" : ""}
            </p>

            {/* ── Grille événements ── */}
            {filtered.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}>
                {filtered.map((ev, i) => (
                  <EventCard
                    key={ev.id || i}
                    ev={ev}
                    index={i}
                    onOpen={() => setSelectedEvent(ev)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                <p style={{ fontSize: 16 }}>Aucun événement dans cette catégorie.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal détail événement ── */}
      <AnimatePresence>
        {selectedEvent && (
          <DetailModal
            item={normalizeEvent(selectedEvent)}
            rank={-1}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}