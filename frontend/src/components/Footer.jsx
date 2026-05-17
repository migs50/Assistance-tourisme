/**
 * Footer.jsx
 * Pied de page professionnel et réaliste pour la plateforme touristique
 */
export default function Footer() {
  const COLORS = {
    blueNight: "#0A1F44",
    blueLight: "#2C497F",
    orange: "#E67E22",
    textMuted: "#A0AEC0"
  };

  return (
    <footer style={{
      background:  COLORS.blueNight,
      borderTop:   `1px solid ${COLORS.blueLight}`,
      padding:     "48px 40px 24px",
      fontFamily:  "'Segoe UI', sans-serif",
    }}>
      {/* Colonnes de navigation réelles */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap:                 "40px",
        maxWidth:            "1100px",
        margin:              "0 auto 32px",
      }}>

        {/* Colonne 1 — Identité Institutionnelle */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "20px" }}>🕌</span>
            <span style={{ fontWeight: 800, fontSize: "16px", color: "#fff" }}>
              Maroc<span style={{ color: COLORS.orange }}> Tourisme</span>
            </span>
          </div>
          <p style={{ color: COLORS.textMuted, fontSize: "13px", lineHeight: 1.7, margin: 0 }}>
            Portail officiel d'information et d'assistance touristique pour la région de Tanger. Découvrez le nord du Maroc à travers des expériences uniques.
          </p>
        </div>

        {/* Colonne 2 — Liens Utiles pour le Voyageur */}
        <div>
          <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "14px", margin: "0 0 16px", letterSpacing: "0.5px" }}>
            ORGANISER VOTRE SÉJOUR
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {["Destinations", "Guide Pratique", "Brochures & Cartes", "Numéros d'Urgence"].map(link => (
              <a key={link} href="#" style={{
                color:          COLORS.textMuted,
                textDecoration: "none",
                fontSize:       "13px",
                transition:     "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = COLORS.orange}
                onMouseLeave={e => e.target.style.color = COLORS.textMuted}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Colonne 3 — Mentions Légales et Infos */}
        <div>
          <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "14px", margin: "0 0 16px", letterSpacing: "0.5px" }}>
            INFORMATIONS LÉGALES
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {["Mentions Légales", "Politique de Confidentialité", "Gestion des Cookies", "Conditions Générales"].map(link => (
              <a key={link} href="#" style={{
                color:          COLORS.textMuted,
                textDecoration: "none",
                fontSize:       "13px",
                transition:     "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = COLORS.orange}
                onMouseLeave={e => e.target.style.color = COLORS.textMuted}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Colonne 4 — Contact & Partenaires */}
        <div>
          <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "14px", margin: "0 0 16px", letterSpacing: "0.5px" }}>
            CONTACT
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: COLORS.textMuted, fontSize: "13px" }}>
            <span>📍 Conseil Régional du Tourisme (CRT) — Tanger</span>
            <span>✉️ support@visit-tanger.ma</span>
            <span>📞 +212 (0) 5 39 94 00 11</span>
          </div>
        </div>
      </div>

      {/* Ligne de bas — Standard et Pro */}
      <div style={{
        maxWidth:     "1100px",
        margin:       "0 auto",
        paddingTop:   "20px",
        borderTop:    `1px solid ${COLORS.blueLight}`,
        textAlign:    "center",
        color:        COLORS.textMuted,
        fontSize:     "12px",
      }}>
        © 2026 Conseil Régional du Tourisme de Tanger-Tétouan-Al Hoceima. Tous droits réservés.
      </div>
    </footer>
  );
}