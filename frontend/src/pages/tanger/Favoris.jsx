/**
 * Favoris.jsx — Vos escales préférées
 *
 * ✅ Design premium cohérent avec le reste du site
 * ✅ Gestion des favoris locaux (localStorage)
 * ✅ Cartes premium avec image, zoom DetailModal, suppression
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    T, SectionHero, DetailModal, getFavoris, removeFavori,
} from "./SharedTanger";
import { Heart, Trash2, ChevronRight, Star, MapPin } from "lucide-react";

/* ─── Carte favori ────────────────────────────────────────────────────────── */
function FavoriCard({ item, index, onOpen, onRemove }) {
    const [hovered, setHovered] = useState(false);
    const imgUrl = item.image || item.image_url || item.imageUrl || "";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: "#fff", borderRadius: 22, overflow: "hidden",
                border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                cursor: "pointer", display: "flex", flexDirection: "column",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            {/* Image */}
            <div
                onClick={onOpen}
                style={{ height: 200, position: "relative", overflow: "hidden", flexShrink: 0 }}
            >
                <div style={{
                    position: "absolute", inset: 0,
                    background: imgUrl
                        ? `url(${imgUrl}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${T.light} 0%, ${T.secondary}40 100%)`,
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: hovered ? "scale(1.08)" : "scale(1)",
                }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)" }} />

                {/* Liked badge */}
                <div style={{
                    position: "absolute", top: 14, right: 14, zIndex: 1,
                    width: 38, height: 38, borderRadius: "50%",
                    background: "rgba(239,68,68,0.2)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Heart size={16} fill="#f87171" color="#f87171" />
                </div>

                {/* Rating */}
                {(item.note || item.rating) && (
                    <div style={{
                        position: "absolute", top: 14, left: 14, zIndex: 1,
                        background: "rgba(15,122,110,0.9)", borderRadius: 99,
                        padding: "5px 12px", display: "flex", alignItems: "center", gap: 5,
                        color: "#fff", fontSize: 13, fontWeight: 700,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                        <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                        {Number(item.note || item.rating).toFixed(1)}
                    </div>
                )}
            </div>

            {/* Corps */}
            <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{
                    fontSize: "1.1rem", fontWeight: 700, marginBottom: 8,
                    color: T.text, fontFamily: "'Inter', sans-serif",
                }}>
                    {item.nom || item.title || item.titre}
                </h3>

                {(item.adresse || item.localisation || item.location || item.lieu) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10, fontSize: 12, color: T.textMuted }}>
                        <MapPin size={12} />
                        {item.adresse || item.localisation || item.location || item.lieu}
                    </div>
                )}

                <p style={{
                    fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 18, flex: 1,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {item.description}
                </p>

                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: 16, borderTop: "1px solid #f1f5f9",
                }}>
                    {/* Remove button */}
                    <motion.button
                        whileHover={{ scale: 1.05, background: "rgba(239,68,68,0.12)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 14px", borderRadius: 12, border: "1.5px solid rgba(239,68,68,0.2)",
                            background: "rgba(239,68,68,0.04)", color: "#ef4444",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif", transition: "all 0.25s",
                        }}
                    >
                        <Trash2 size={13} /> Retirer
                    </motion.button>

                    {/* Lire plus */}
                    <button
                        onClick={onOpen}
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
export default function Favoris() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const loadFavoris = useCallback(() => {
        setItems(getFavoris());
    }, []);

    useEffect(() => {
        loadFavoris();
        /* Listen for changes from other components */
        window.addEventListener("favoris-updated", loadFavoris);
        return () => window.removeEventListener("favoris-updated", loadFavoris);
    }, [loadFavoris]);

    const handleRemove = (item) => {
        removeFavori(item);
        loadFavoris();
    };

    /* Normalize item for DetailModal */
    const normalizeForModal = (item) => ({
        ...item,
        nom: item.nom || item.title || item.titre || "Favori",
        image: item.image || item.image_url || item.imageUrl || "",
        adresse: item.adresse || item.localisation || item.location || item.lieu || "Tanger, Maroc",
        prix: item.prix || item.tarif || "Voir détails",
    });

    return (
        <>
            <SectionHero
                label="Votre Collection"
                title={<>Vos adresses <em style={{ fontStyle: "italic", color: T.light }}>favorites</em></>}
                subtitle={
                    items.length === 0
                        ? "Aucun favori enregistré pour le moment"
                        : `${items.length} lieu${items.length > 1 ? "x" : ""} enregistré${items.length > 1 ? "s" : ""} dans votre collection`
                }
            />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            textAlign: "center", padding: "80px 24px",
                            background: "#fff", borderRadius: 28,
                            border: "2px dashed #e2e8f0",
                            boxShadow: "0 4px 24px rgba(15,118,110,0.04)",
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.15))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 24px",
                            }}
                        >
                            <Heart size={32} color="#f87171" />
                        </motion.div>
                        <h3 style={{
                            fontSize: "1.5rem", fontWeight: 700, color: T.text,
                            fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 12,
                        }}>
                            Votre liste est vide
                        </h3>
                        <p style={{ color: T.textMuted, fontSize: 15, maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7 }}>
                            Parcourez les activités, événements et lieux touristiques, puis cliquez sur le bouton <Heart size={13} fill="#f87171" color="#f87171" style={{ verticalAlign: "middle" }} /> dans les détails pour sauvegarder vos coups de cœur.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 28 }}>
                            <span style={{ color: T.text, fontWeight: 600 }}>{items.length}</span>{" "}
                            favori{items.length > 1 ? "s" : ""} enregistré{items.length > 1 ? "s" : ""}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}>
                            <AnimatePresence>
                                {items.map((item, i) => (
                                    <FavoriCard
                                        key={item.id || item.nom || i}
                                        item={item}
                                        index={i}
                                        onOpen={() => setSelectedItem(item)}
                                        onRemove={() => handleRemove(item)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>

            {/* Modal détail */}
            <AnimatePresence>
                {selectedItem && (
                    <DetailModal
                        item={normalizeForModal(selectedItem)}
                        rank={-1}
                        onClose={() => { setSelectedItem(null); loadFavoris(); }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
