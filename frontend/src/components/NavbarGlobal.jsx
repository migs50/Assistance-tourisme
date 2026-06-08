/**
 * NavbarGlobal.jsx
 * Navbar pour la PAGE 1 — Maroc Tourisme
 * Style clair avec logo et liens de navigation
 */
export default function NavbarGlobal() {
  return (
    <nav style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "0 40px",
      height:         "64px",
      background:     "#fff",
      borderBottom:   "1px solid #e2e8f0",
      boxShadow:      "0 1px 8px rgba(0,0,0,0.06)",
      position:       "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "24px" }}>🕌</span>
        <span style={{ fontWeight: 800, fontSize: "18px", color: "#1e293b" }}>
          Maroc <span style={{ color: "#6366f1" }}>Tourisme</span>
        </span>
      </div>

      {/* Liens */}
      <div style={{ display: "flex", gap: "32px" }}>
        {["Accueil", "Destinations", "Culture", "Découvrir", "À Propos"].map(link => (
          <a key={link} href="#" style={{
            color:          "#475569",
            textDecoration: "none",
            fontSize:       "14px",
            fontWeight:     500,
            transition:     "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#6366f1"}
            onMouseLeave={e => e.target.style.color = "#475569"}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Bouton connexion */}
      <button style={{
        background:   "linear-gradient(135deg, #6366f1, #8b5cf6)",
        border:       "none",
        borderRadius: "10px",
        color:        "#fff",
        padding:      "8px 20px",
        fontSize:     "13px",
        fontWeight:   600,
        cursor:       "pointer",
      }}>
        Connexion
      </button>
    </nav>
  );
}
