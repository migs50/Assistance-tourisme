/**
 * NavbarTanger.jsx — avec onglets fonctionnels
 */
export default function NavbarTanger({ onBack, onOpenChat, activeTab, onTabChange }) {

  const TABS = [
    { key: "accueil",          label: "Accueil" },
    { key: "recommandation",   label: "Recommandation" },
    { key: "activites",        label: "Activités" },
    { key: "evenements",       label: "Événements" },
    { key: "dashboard",        label: "Dashboard" },
  ];

  return (
    <nav style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "0 40px",
      height:         "64px",
      background:     "#0d1b2a",
      borderBottom:   "1px solid #1e3a5f",
      position:       "sticky",
      top: 0,
      zIndex: 100,
    }}>

      {/* Logo + retour */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{
          background:   "transparent",
          border:       "1px solid #1e3a5f",
          borderRadius: "8px",
          color:        "#94a3b8",
          padding:      "6px 14px",
          cursor:       "pointer",
          fontSize:     "13px",
        }}>← Maroc</button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "22px" }}>🕌</span>
          <span style={{ fontWeight: 800, fontSize: "18px", color: "#f1f5f9" }}>
            Maroc <span style={{ color: "#f97316" }}>Tourisme</span>
          </span>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: "4px" }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              background:   activeTab === tab.key ? "#f9731620" : "transparent",
              border:       activeTab === tab.key ? "1px solid #f97316" : "1px solid transparent",
              borderRadius: "8px",
              color:        activeTab === tab.key ? "#f97316" : "#94a3b8",
              padding:      "6px 16px",
              cursor:       "pointer",
              fontSize:     "14px",
              fontWeight:   activeTab === tab.key ? 700 : 400,
              transition:   "all 0.2s",
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = "#f1f5f9";
                e.currentTarget.style.background = "#ffffff10";
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bouton IA */}
      <button onClick={onOpenChat} style={{
        background:   "linear-gradient(135deg, #f97316, #ea580c)",
        border:       "none",
        borderRadius: "10px",
        color:        "#fff",
        padding:      "9px 20px",
        fontSize:     "13px",
        fontWeight:   700,
        cursor:       "pointer",
        display:      "flex",
        alignItems:   "center",
        gap:          "8px",
        boxShadow:    "0 4px 15px rgba(249,115,22,0.4)",
      }}>
        🤖 Assistant IA
      </button>
    </nav>
  );
}