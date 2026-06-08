/**
 * Favoris.jsx — Vos escales préférées
 * 
 * ✅ Design premium cohérent avec le reste du site
 * ✅ Gestion des favoris locaux (localStorage)
 */
import { useState, useEffect } from "react";
import { T, SectionHero } from "./SharedTanger";

export default function Favoris() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("tg-favoris") || "[]");
            setItems(Array.isArray(saved) ? saved : []);
        } catch (e) {
            console.error("[Favoris] Problem with localStorage:", e);
            setItems([]);
        }
    }, []);

    return (
        <div className="reco-fade-up">
            <SectionHero
                label="Votre Collection"
                title={<span>Vos adresses <em>favorites</em></span>}
                description="Retrouvez ici tous les lieux et expériences que vous avez enregistrés lors de votre exploration."
            />

            <div className="reco-content">
                {items.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "80px 24px",
                        background: "rgba(255,255,255,0.5)",
                        borderRadius: 32,
                        border: "1px dashed #cbd5e1"
                    }}>
                        <div style={{ fontSize: "4rem", marginBottom: 20 }}>❤️</div>
                        <h3 className="reco-serif" style={{ fontSize: 28, marginBottom: 16 }}>Votre liste est vide</h3>
                        <p style={{ color: "#64748b", maxWidth: 400, margin: "0 auto 32px" }}>
                            Parcourez les activités et le moteur de recommandation pour ajouter vos pépites à cette collection.
                        </p>
                        <button className="reco-opt-btn" onClick={() => window.location.reload()}>
                            Explorer Tanger
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                        {/* Ici on mapperait les items avec le même style de ResultCard */}
                        {items.map((item, i) => (
                            <div key={i} className="reco-card" style={{ padding: 24 }}>
                                <h4 className="reco-serif" style={{ fontSize: 22 }}>{item.nom}</h4>
                                <p style={{ fontSize: 14, color: "#64748b" }}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
