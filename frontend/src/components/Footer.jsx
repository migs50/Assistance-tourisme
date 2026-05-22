/**
 * Footer.jsx — REDESIGN PREMIUM FINAL
 * Vraie silhouette Maroc SVG · Marker animé Tanger · Contenu original
 */
export default function Footer() {
  const T = {
    teal:      "#0f766e",
    tealDark:  "#0B5D5F",
    white:     "#ffffff",
    muted:     "rgba(255,255,255,0.62)",
    border:    "rgba(255,255,255,0.12)",
    hover:     "rgba(255,255,255,1)",
  };

  const linkStyle = {
    color:          T.muted,
    textDecoration: "none",
    fontSize:       "13px",
    transition:     "color 0.2s",
    lineHeight:     1.4,
  };

  const colTitleStyle = {
    color:         T.white,
    fontWeight:    700,
    fontSize:      "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    margin:        "0 0 16px",
  };

  return (
    <footer style={{
      background: `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 55%, #0d9488 100%)`,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position:   "relative",
      overflow:   "hidden",
    }}>

      {/* ── Vague de transition ── */}
      <div style={{ lineHeight: 0, marginTop: -1 }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: 40 }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,10 1440,20 L1440,0 L0,0 Z"
            fill="#f7fbfb" />
        </svg>
      </div>

      {/* ── Cercle déco bg ── */}
      <div style={{
        position: "absolute", right: -60, bottom: -60,
        width: 320, height: 320, borderRadius: "50%",
        background: "rgba(255,255,255,0.03)", pointerEvents: "none",
      }} />

      {/* ════════════════════════════════
          GRILLE PRINCIPALE
      ════════════════════════════════ */}
      <div style={{
        maxWidth:            "1140px",
        margin:              "0 auto",
        padding:             "52px 40px 36px",
        display:             "grid",
        gridTemplateColumns: "220px 1fr 260px",
        gap:                 "48px",
        alignItems:          "start",
      }}>

        {/* ══════════════════
            COL 1 — Logo
        ══════════════════ */}
        <div>
          <div style={{ marginBottom: "18px" }}>
            <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
              <path d="M22 42 L38 10 L54 42 Z" fill="rgba(255,255,255,0.20)" />
              <path d="M2 42 L22 6 L42 42 Z"  fill="rgba(255,255,255,0.88)" />
              <path d="M22 6 L16 20 L28 20 Z" fill="rgba(255,255,255,0.35)" />
              <circle cx="46" cy="10" r="5"   fill="rgba(255,255,255,0.65)" />
            </svg>
          </div>

          <div style={{ marginBottom: "14px", lineHeight: 1.2 }}>
            <span style={{ fontSize: "19px", fontWeight: 800, color: T.white, display: "block" }}>
              MoroccoGuide
            </span>
            <span style={{ fontSize: "19px", fontWeight: 800, color: "rgba(255,255,255,0.40)", display: "block" }}>
              AI
            </span>
          </div>

          <p style={{ color: T.muted, fontSize: "12.5px", lineHeight: 1.75, margin: "0 0 20px" }}>
            Portail officiel d'information et d'assistance touristique pour la région de Tanger.
            Découvrez le nord du Maroc à travers des expériences uniques.
          </p>

          <div style={{ display: "flex", gap: "9px" }}>
            {["f", "in", "ig"].map((l) => (
              <a key={l} href="#" style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.white, fontSize: "10px", fontWeight: 700,
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                }}>
                {l}
              </a>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            COL 2 — Contenu original (3 sous-col)
        ══════════════════════════════════════════ */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap:                 "32px",
          borderLeft:          `1px solid ${T.border}`,
          borderRight:         `1px solid ${T.border}`,
          padding:             "0 32px",
        }}>

          {/* ORGANISER VOTRE SÉJOUR */}
          <div>
            <h4 style={colTitleStyle}>Organiser votre séjour</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Destinations", "Guide Pratique", "Brochures & Cartes", "Numéros d'Urgence"].map(link => (
                <a key={link} href="#" style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = T.hover}
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* INFORMATIONS LÉGALES */}
          <div>
            <h4 style={colTitleStyle}>Informations légales</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Mentions Légales", "Politique de Confidentialité", "Gestion des Cookies", "Conditions Générales"].map(link => (
                <a key={link} href="#" style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = T.hover}
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h4 style={colTitleStyle}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Conseil Régional du Tourisme (CRT) — Tanger",
                "support@visit-tanger.ma",
                "+212 (0) 5 39 94 00 11",
              ].map((line, i) => (
                <span key={i} style={{ color: T.muted, fontSize: "13px", lineHeight: 1.55 }}>
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════
            COL 3 — Vraie carte Maroc SVG
        ════════════════════════════════════ */}
        <div>
          <h4 style={{ ...colTitleStyle, marginBottom: "18px" }}>Notre territoire</h4>

          <div style={{ position: "relative", width: "100%" }}>
            <svg
              viewBox="0 0 250 230"
              style={{
                width:    "100%",
                maxWidth: "240px",
                display:  "block",
                overflow: "visible",
                filter:   "drop-shadow(0 6px 24px rgba(0,0,0,0.28))",
              }}
            >
              <defs>
                {/* Dégradé principal */}
                <linearGradient id="fgMaroc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.32)" />
                  <stop offset="60%"  stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                </linearGradient>

                {/* Dégradé couche intérieure */}
                <linearGradient id="fgMaroc2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.12)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                </linearGradient>

                {/* Glow pour marker */}
                <filter id="fglow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* ──────────────────────────────────────
                  VRAIE SILHOUETTE MAROC
                  Points calés sur la géographie réelle :
                  - Tanger (NW) : haut-gauche
                  - Méditerranée : haut
                  - Algérie border : droite
                  - Staircase : bas
                  - Atlantique : gauche
              ────────────────────────────────────── */}

              {/* Ombre portée */}
              <path transform="translate(4,5)"
                d="
                  M 82,22
                  L 90,13 L 112,9  L 142,7  L 170,9
                  L 195,14 L 210,22 L 216,32
                  L 219,58 L 221,90 L 221,122
                  L 218,150 L 214,163
                  L 193,165 L 193,177
                  L 161,177 L 161,189
                  L 126,189 L 126,201
                  L 90,205  L 64,199
                  L 44,183  L 28,165
                  L 22,147  L 22,129
                  L 26,111  L 32,93
                  L 40,76   L 50,61
                  L 62,48   L 73,37
                  L 82,22 Z
                "
                fill="rgba(0,0,0,0.20)"
              />

              {/* Halo extérieur (effet glow) */}
              <path
                d="
                  M 82,22
                  L 90,13 L 112,9  L 142,7  L 170,9
                  L 195,14 L 210,22 L 216,32
                  L 219,58 L 221,90 L 221,122
                  L 218,150 L 214,163
                  L 193,165 L 193,177
                  L 161,177 L 161,189
                  L 126,189 L 126,201
                  L 90,205  L 64,199
                  L 44,183  L 28,165
                  L 22,147  L 22,129
                  L 26,111  L 32,93
                  L 40,76   L 50,61
                  L 62,48   L 73,37
                  L 82,22 Z
                "
                fill="rgba(255,255,255,0.06)"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="7"
                strokeLinejoin="round"
                transform="scale(1.025) translate(-3,-2)"
                style={{ transformOrigin: "125px 105px" }}
              />

              {/* Corps principal — forme Maroc */}
              <path
                d="
                  M 82,22
                  L 90,13 L 112,9  L 142,7  L 170,9
                  L 195,14 L 210,22 L 216,32
                  L 219,58 L 221,90 L 221,122
                  L 218,150 L 214,163
                  L 193,165 L 193,177
                  L 161,177 L 161,189
                  L 126,189 L 126,201
                  L 90,205  L 64,199
                  L 44,183  L 28,165
                  L 22,147  L 22,129
                  L 26,111  L 32,93
                  L 40,76   L 50,61
                  L 62,48   L 73,37
                  L 82,22 Z
                "
                fill="url(#fgMaroc)"
                stroke="rgba(255,255,255,0.88)"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Couche intérieure (effet depth) */}
              <path
                d="
                  M 88,30
                  L 96,22  L 115,18 L 142,16 L 168,18
                  L 190,22 L 203,30 L 208,40
                  L 211,64 L 212,94 L 212,122
                  L 209,147 L 206,158
                  L 186,160 L 186,170
                  L 157,170 L 157,181
                  L 124,181 L 124,192
                  L 92,196  L 70,191
                  L 52,177  L 38,161
                  L 32,145  L 32,130
                  L 36,114  L 42,98
                  L 49,83   L 58,69
                  L 68,57   L 78,47
                  L 88,30 Z
                "
                fill="url(#fgMaroc2)"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
                strokeDasharray="4 3"
                strokeLinejoin="round"
              />

              {/* ── Villes secondaires ── */}
              {[
                { x: 118, y: 35,  label: "Chefchaouen", bold: false, side: "right" },
                { x: 58,  y: 62,  label: "Rabat",        bold: true,  side: "right" },
                { x: 48,  y: 76,  label: "Casablanca",   bold: false, side: "right" },
                { x: 178, y: 50,  label: "Fès",           bold: false, side: "right" },
                { x: 100, y: 130, label: "Marrakech",    bold: false, side: "right" },
                { x: 28,  y: 158, label: "Agadir",       bold: false, side: "right" },
              ].map(({ x, y, label, bold }) => (
                <g key={label}>
                  <circle cx={x} cy={y}
                    r={bold ? 3.5 : 2.5}
                    fill={bold ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)"}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1"
                  />
                  <text
                    x={x + 6} y={y + 4}
                    fill={bold ? "#ffffff" : "rgba(255,255,255,0.72)"}
                    fontSize={bold ? 9 : 7.5}
                    fontWeight={bold ? "700" : "400"}
                    fontFamily="DM Sans, sans-serif"
                  >
                    {label}
                  </text>
                </g>
              ))}

              {/* ══════════════════════════════
                  MARKER TANGER ANIMÉ
                  Position : (90, 20) → NW coast
              ══════════════════════════════ */}

              {/* Ring pulse 3 (grand) */}
              <circle cx="90" cy="20" r="18" fill="none"
                stroke="rgba(255,255,255,0.18)" strokeWidth="1">
                <animate attributeName="r"
                  values="10;22;10" dur="2.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity"
                  values="0.5;0;0.5" dur="2.8s" repeatCount="indefinite"/>
              </circle>

              {/* Ring pulse 2 */}
              <circle cx="90" cy="20" r="12" fill="none"
                stroke="rgba(255,255,255,0.30)" strokeWidth="1">
                <animate attributeName="r"
                  values="7;16;7" dur="2.8s" begin="0.35s" repeatCount="indefinite"/>
                <animate attributeName="opacity"
                  values="0.6;0;0.6" dur="2.8s" begin="0.35s" repeatCount="indefinite"/>
              </circle>

              {/* Cercle blanc extérieur */}
              <circle cx="90" cy="20" r="8.5"
                fill="rgba(255,255,255,0.96)"
                stroke="rgba(94,202,203,0.75)"
                strokeWidth="2"
                filter="url(#fglow)"
              />

              {/* Centre teal */}
              <circle cx="90" cy="20" r="4" fill="#0f766e" />

              {/* Reflet */}
              <circle cx="88" cy="18" r="1.5" fill="rgba(255,255,255,0.85)" />

              {/* Bulle label TANGER */}
              <rect x="102" y="11" width="66" height="18" rx="5"
                fill="rgba(255,255,255,0.20)"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="1.2"
              />
              {/* Connecteur */}
              <line x1="100" y1="20" x2="102" y2="20"
                stroke="rgba(255,255,255,0.65)" strokeWidth="1"/>

              <text x="135" y="23.5"
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="800"
                fontFamily="DM Sans, Montserrat, sans-serif"
                letterSpacing="0.12em"
                textAnchor="middle"
              >
                TANGER
              </text>
            </svg>

            {/* Badge localisation */}
            <div style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "8px",
              background:   "rgba(255,255,255,0.10)",
              border:       "1px solid rgba(255,255,255,0.22)",
              borderRadius: "99px",
              padding:      "5px 14px",
              marginTop:    "10px",
            }}>
              <span style={{ position: "relative", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                width: "10px", height: "10px", flexShrink: 0 }}>
                <span style={{
                  position: "absolute",
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: "rgba(94,202,203,0.4)",
                  animation: "footerPing 2s cubic-bezier(0,0,0.2,1) infinite",
                }} />
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "#5ECACB",
                  boxShadow: "0 0 6px #5ECACB",
                  position: "relative",
                }} />
              </span>
              <span style={{ color: T.white, fontSize: "11px",
                fontWeight: 600, letterSpacing: "0.06em" }}>
                 Maroc
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bas de page ── */}
      <div style={{
        borderTop:      `1px solid ${T.border}`,
        maxWidth:       "1140px",
        margin:         "0 auto",
        padding:        "16px 40px",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        flexWrap:       "wrap",
        gap:            "8px",
      }}>
        <p style={{ color: T.muted, fontSize: "11.5px", margin: 0 }}>
          © 2026 Conseil Régional du Tourisme de Tanger-Tétouan-Al Hoceima. Tous droits réservés.
        </p>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "11px", margin: 0 }}>
          MoroccoGuide AI · Plateforme touristique intelligente
        </p>
      </div>

      {/* ── Keyframe ping ── */}
      <style>{`
        @keyframes footerPing {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.4); opacity: 0;   }
          100% { transform: scale(2.4); opacity: 0;   }
        }
      `}</style>
    </footer>
  );
}