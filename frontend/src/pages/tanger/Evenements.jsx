/**
 * Evenements.jsx
 * Page événements — filtres par catégorie, cartes horizontales avec expand.
 */
import { useState, useMemo } from "react";
import {
  T, evenementsApi, CAT_EVENT_CONFIG,
  useApiDataWithRefetch, SectionHero, Spinner, ErrorBanner,
} from "./SharedTanger";

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function Evenements() {
  const [filter, setFilter] = useState("tous");
  const [expanded, setExpanded] = useState(null);

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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 22 }}>
              {filtered.map((ev, i) => {
                const cfg = CAT_EVENT_CONFIG[ev.category] || { color: T.primary };
                const isExp = expanded === i;
                const imgUrl = ev.image_url || ev.image || "";

                return (
                  <div
                    key={ev.id || i}
                    className="tg-card tg-animate-fadeUp"
                    style={{ animationDelay: `${i * 0.05}s`, display: "flex", flexDirection: "column" }}
                  >
                    <div style={{ display: "flex", gap: 0, flex: 1 }}>
                      {/* Colonne image */}
                      <div style={{
                        width: 180, flexShrink: 0,
                        background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : T.light,
                        position: "relative", minHeight: 160,
                        borderRadius: `${T.radius} 0 0 ${T.radius}`,
                        overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.08) 100%)" }} />
                        <span style={{
                          position: "absolute", top: 10, left: 10,
                          background: `${cfg.color}20`, border: `1px solid ${cfg.color}60`,
                          color: cfg.color, fontSize: 10, fontWeight: 700,
                          padding: "3px 10px", borderRadius: "100px",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {ev.category}
                        </span>
                      </div>

                      {/* Contenu */}
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
                          <button
                            className="tg-btn-ghost"
                            onClick={() => setExpanded(isExp ? null : i)}
                            style={{ fontSize: 12 }}
                          >
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

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                <p style={{ fontSize: 16 }}>Aucun événement dans cette catégorie.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}