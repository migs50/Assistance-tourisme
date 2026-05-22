/**
 * Footer.jsx — REDESIGN PREMIUM FINAL
 * Carte Maroc via image locale · Badge Tanger · Contenu original
 */
import moroccoMap from "../assets/morocco-map.png";

export default function Footer() {
  const T = {
    teal:      "#0f766e",
    tealDark:  "#0B5D5F",
    tealMid:   "#14b8a6",
    tealLight: "#ccfbf1",
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

      {/* ── Vague de transition en haut ── */}
      <div style={{ lineHeight: 0, marginTop: -1 }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: 40 }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,10 1440,20 L1440,0 L0,0 Z"
            fill="#f7fbfb" />
        </svg>
      </div>

      {/* ── Cercle décoratif bg ── */}
      <div style={{
        position:     "absolute",
        right:        -60,
        bottom:       -60,
        width:        320,
        height:       320,
        borderRadius: "50%",
        background:   "rgba(255,255,255,0.03)",
        pointerEvents:"none",
      }} />

      {/* ════════════════════════════════════════
          GRILLE PRINCIPALE
      ════════════════════════════════════════ */}
      <div style={{
        maxWidth:            "1140px",
        margin:              "0 auto",
        padding:             "52px 40px 36px",
        display:             "grid",
        gridTemplateColumns: "220px 1fr 240px",
        gap:                 "48px",
        alignItems:          "start",
      }}>

        {/* ══════════════════════════
            COL 1 — Logo + Identité
        ══════════════════════════ */}
        <div>
          {/* Montagne SVG */}
          <div style={{ marginBottom: "18px" }}>
            <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
              <path d="M22 42 L38 10 L54 42 Z" fill="rgba(255,255,255,0.20)" />
              <path d="M2 42 L22 6 L42 42 Z"  fill="rgba(255,255,255,0.88)" />
              <path d="M22 6 L16 20 L28 20 Z" fill="rgba(255,255,255,0.35)" />
              <circle cx="46" cy="10" r="5"   fill="rgba(255,255,255,0.65)" />
            </svg>
          </div>

          {/* Nom */}
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

          {/* Réseaux sociaux */}
          <div style={{ display: "flex", gap: "9px" }}>
            {["f", "in", "ig"].map((l) => (
              <a key={l} href="#" style={{
                width:          "32px",
                height:         "32px",
                borderRadius:   "50%",
                border:         "1px solid rgba(255,255,255,0.22)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                color:          T.white,
                fontSize:       "10px",
                fontWeight:     700,
                textDecoration: "none",
                transition:     "all 0.2s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background   = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.borderColor  = "rgba(255,255,255,0.55)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background   = "transparent";
                  e.currentTarget.style.borderColor  = "rgba(255,255,255,0.22)";
                }}
              >
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
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}
                >
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
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}
                >
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

        {/* ══════════════════════════════
            COL 3 — Carte Maroc (image)
        ══════════════════════════════ */}
        <div>
          <h4 style={{ ...colTitleStyle, marginBottom: "18px" }}>Notre territoire</h4>

          <div style={{ position: "relative", width: "100%" }}>

            {/* ── Image Maroc ── */}
           {/* ── Carte Maroc SVG — sans fond ── */}
<svg
  viewBox="0 0 240 210"
  style={{ width: "100%", maxWidth: "220px", display: "block", overflow: "visible" }}
>
  <defs>
    <linearGradient id="mg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stopColor="rgba(255,255,255,0.35)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.10)" />
    </linearGradient>
    <linearGradient id="mg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
    </linearGradient>
    <filter id="mglow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  {/* Couche halo extérieure */}
  <path
    d="M30,22 L50,14 L72,10 L98,8 L124,9 L148,15 L166,26
       L178,42 L182,60 L179,78 L185,96 L189,114 L186,130
       L181,146 L171,158 L158,168 L142,176 L124,180
       L106,178 L88,171 L72,160 L56,145 L42,128
       L30,110 L20,90 L17,70 L19,50 Z"
    fill="rgba(255,255,255,0.07)"
    stroke="rgba(255,255,255,0.20)"
    strokeWidth="6"
    strokeLinejoin="round"
    transform="translate(2,3) scale(1.03)"
    style={{ transformOrigin: "103px 95px" }}
  />

  {/* Corps principal */}
  <path
    d="M30,22 L50,14 L72,10 L98,8 L124,9 L148,15 L166,26
       L178,42 L182,60 L179,78 L185,96 L189,114 L186,130
       L181,146 L171,158 L158,168 L142,176 L124,180
       L106,178 L88,171 L72,160 L56,145 L42,128
       L30,110 L20,90 L17,70 L19,50 Z"
    fill="url(#mg1)"
    stroke="rgba(255,255,255,0.85)"
    strokeWidth="2.2"
    strokeLinejoin="round"
  />

  {/* Couche intérieure (effet depth) */}
  <path
    d="M38,30 L56,22 L76,18 L100,16 L122,17 L144,22 L160,32
       L170,47 L173,63 L171,79 L176,95 L179,111 L176,126
       L172,140 L163,151 L151,161 L136,168 L120,171
       L104,169 L88,162 L74,152 L60,138 L48,122
       L38,104 L30,86 L28,68 L30,50 Z"
    fill="url(#mg2)"
    stroke="rgba(255,255,255,0.15)"
    strokeWidth="1"
    strokeDasharray="4 3"
  />

  {/* Villes */}
  {[
    { x: 100, y: 88,  label: "Rabat",       bold: true  },
    { x: 158, y: 55,  label: "Chefchaouen", bold: false },
    { x: 68,  y: 108, label: "Essaouira",   bold: false },
    { x: 112, y: 118, label: "Marrakech",   bold: false },
    { x: 74,  y: 135, label: "Agadir",      bold: false },
  ].map(({ x, y, label, bold }) => (
    <g key={label}>
      <circle cx={x} cy={y} r={bold ? 3.5 : 2.5}
        fill="rgba(255,255,255,0.90)"
        stroke="rgba(255,255,255,0.30)" strokeWidth="1" />
      <text x={x + 6} y={y + 4}
        fill={bold ? "#fff" : "rgba(255,255,255,0.70)"}
        fontSize={bold ? 9 : 7.5}
        fontWeight={bold ? "700" : "400"}
        fontFamily="DM Sans, sans-serif">
        {label}
      </text>
    </g>
  ))}

  {/* ── MARKER TANGER animé ── */}
  {/* Ring 1 */}
  <circle cx="150" cy="22" r="16" fill="none"
    stroke="rgba(255,255,255,0.25)" strokeWidth="1">
    <animate attributeName="r"       values="10;22;10" dur="2.6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite"/>
  </circle>

  {/* Ring 2 */}
  <circle cx="150" cy="22" r="10" fill="none"
    stroke="rgba(255,255,255,0.40)" strokeWidth="1">
    <animate attributeName="r"       values="6;15;6"  dur="2.6s" begin="0.3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" begin="0.3s" repeatCount="indefinite"/>
  </circle>

  {/* Cercle blanc */}
  <circle cx="150" cy="22" r="8"
    fill="rgba(255,255,255,0.95)"
    stroke="rgba(94,202,203,0.70)" strokeWidth="2"
    filter="url(#mglow)" />

  {/* Centre teal */}
  <circle cx="150" cy="22" r="4" fill="#0f766e" />

  {/* Reflet */}
  <circle cx="148" cy="20" r="1.5" fill="rgba(255,255,255,0.80)" />

  {/* Bulle TANGER */}
  <rect x="161" y="13" width="64" height="18" rx="5"
    fill="rgba(255,255,255,0.20)"
    stroke="rgba(255,255,255,0.60)" strokeWidth="1.2" />
  <line x1="161" y1="22" x2="158" y2="22"
    stroke="rgba(255,255,255,0.60)" strokeWidth="1" />
  <text x="193" y="25"
    fill="#ffffff" fontSize="8.5" fontWeight="800"
    fontFamily="DM Sans, Montserrat, sans-serif"
    letterSpacing="0.12em" textAnchor="middle">
    TANGER
  </text>
</svg>
            {/* ── Badge Tanger ── */}
            <div style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "7px",
              background:     "rgba(255,255,255,0.10)",
              border:         "1px solid rgba(255,255,255,0.22)",
              borderRadius:   "99px",
              padding:        "5px 14px",
              marginTop:      "10px",
            }}>
              {/* Point lumineux animé */}
              <span style={{ position: "relative", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                width: "10px", height: "10px", flexShrink: 0 }}>
                <span style={{
                  position:     "absolute",
                  width:        "10px",
                  height:       "10px",
                  borderRadius: "50%",
                  background:   "rgba(94,202,203,0.35)",
                  animation:    "footerPing 2s cubic-bezier(0,0,0.2,1) infinite",
                }} />
                <span style={{
                  width:        "7px",
                  height:       "7px",
                  borderRadius: "50%",
                  background:   "#5ECACB",
                  boxShadow:    "0 0 6px #5ECACB",
                  position:     "relative",
                }} />
              </span>
              <span style={{
                color:         T.white,
                fontSize:      "11px",
                fontWeight:    600,
                letterSpacing: "0.06em",
              }}>
                Tanger, Maroc
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

      {/* ── Animation ping badge ── */}
      <style>{`
        @keyframes footerPing {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

    </footer>
  );
}