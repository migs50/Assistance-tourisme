/**
 * Footer.jsx — REDESIGN PREMIUM
 * Inspiré du design territorial Mézenc-Loire-Meygal
 * Palette teal · Logo montagne SVG · Carte Maroc SVG · Marker Tanger
 */
export default function Footer() {
  const T = {
    teal:     "#0f766e",
    tealDark: "#0B5D5F",
    tealMid:  "#14b8a6",
    tealLight:"#ccfbf1",
    white:    "#ffffff",
    muted:    "rgba(255,255,255,0.65)",
    border:   "rgba(255,255,255,0.12)",
  };

  return (
    <footer style={{
      background:  `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 60%, #0d9488 100%)`,
      fontFamily:  "'DM Sans', 'Segoe UI', sans-serif",
      position:    "relative",
      overflow:    "hidden",
    }}>

      {/* ── Vague décorative en haut ── */}
      <div style={{ lineHeight: 0, marginTop: -1 }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: 40 }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,10 1440,20 L1440,0 L0,0 Z"
            fill="#f7fbfb" />
        </svg>
      </div>

      {/* ── Cercle décoratif bg ── */}
      <div style={{
        position: "absolute", right: -80, top: -80,
        width: 360, height: 360, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />

      {/* ── Contenu principal ── */}
      <div style={{
        maxWidth: "1100px",
        margin:   "0 auto",
        padding:  "48px 40px 36px",
        display:  "grid",
        gridTemplateColumns: "1fr 1.6fr 1fr",
        gap:      "48px",
        alignItems: "start",
      }}>

        {/* ── COLONNE GAUCHE — Logo + Nom + Tagline ── */}
        <div>
          {/* Logo montagne SVG */}
          <div style={{ marginBottom: "16px" }}>
            <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
              {/* Montagne arrière */}
              <path d="M18 38 L34 10 L50 38 Z"
                fill="rgba(255,255,255,0.25)" />
              {/* Montagne avant */}
              <path d="M2 38 L20 8 L38 38 Z"
                fill="rgba(255,255,255,0.90)" />
              {/* Neige sommet */}
              <path d="M20 8 L15 20 L25 20 Z"
                fill="rgba(255,255,255,0.40)" />
              {/* Soleil */}
              <circle cx="42" cy="10" r="5"
                fill="rgba(255,255,255,0.70)" />
            </svg>
          </div>

          {/* Nom du site */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{
              fontSize: "20px", fontWeight: 800,
              color: T.white, letterSpacing: "0.02em",
              lineHeight: 1.15,
            }}>
              MoroccoGuide
            </div>
            <div style={{
              fontSize: "20px", fontWeight: 800,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.02em", lineHeight: 1.15,
            }}>
              AI
            </div>
          </div>

          <p style={{
            color: T.muted, fontSize: "13px",
            lineHeight: 1.75, margin: 0,
            maxWidth: "200px",
          }}>
            Plateforme intelligente de tourisme pour découvrir le nord du Maroc.
          </p>

          {/* Réseaux sociaux */}
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            {[
              { label: "f",  title: "Facebook" },
              { label: "in", title: "LinkedIn" },
              { label: "ig", title: "Instagram" },
            ].map(({ label, title }) => (
              <a key={title} href="#" title={title} style={{
                width: "34px", height: "34px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.white, fontSize: "11px", fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s, border-color 0.2s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── COLONNE CENTRE — Infos institutionnelles ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          paddingLeft: "16px",
          borderLeft:  `1px solid ${T.border}`,
          borderRight: `1px solid ${T.border}`,
        }}>
          {/* Bloc adresse */}
          <div>
            <p style={{
              color: T.white, fontWeight: 700,
              fontSize: "12px", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: "14px",
            }}>
              Conseil Régional du Tourisme
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "CRT Tanger-Tétouan-Al Hoceima",
                "Av. Mohamed VI, Tanger 90000",
                "support@visit-tanger.ma",
                "+212 (0) 5 39 94 00 11",
              ].map((line, i) => (
                <p key={i} style={{
                  color: T.muted, fontSize: "12.5px",
                  lineHeight: 1.6, margin: 0,
                }}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Bloc horaires + liens */}
          <div>
            <p style={{
              color: T.white, fontWeight: 700,
              fontSize: "12px", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: "14px",
            }}>
              Horaires d'ouverture
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
              <p style={{ color: T.muted, fontSize: "12.5px", margin: 0, lineHeight: 1.6 }}>
                Lun–Jeu : 9h à 12h et 14h à 17h
              </p>
              <p style={{ color: T.muted, fontSize: "12.5px", margin: 0, lineHeight: 1.6 }}>
                Vendredi : 9h à 12h
              </p>
            </div>

            <p style={{
              color: T.white, fontWeight: 700,
              fontSize: "12px", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: "12px",
            }}>
              Liens utiles
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {["Mentions légales", "Confidentialité", "Cookies", "Contact"].map(link => (
                <a key={link} href="#" style={{
                  color: T.muted, fontSize: "12.5px",
                  textDecoration: "none", transition: "color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = T.white}
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE — Carte Maroc SVG + Marker Tanger ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <p style={{
            color: T.white, fontWeight: 700,
            fontSize: "12px", letterSpacing: "0.12em",
            textTransform: "uppercase", marginBottom: "16px",
            alignSelf: "flex-start",
          }}>
            Notre territoire
          </p>

          {/* Carte Maroc SVG simplifiée */}
          <div style={{ position: "relative", width: "100%", maxWidth: "220px" }}>
            <svg
              viewBox="0 0 220 200"
              style={{ width: "100%", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}
            >
              {/* Silhouette Maroc simplifiée */}
              <path
                d="
                  M 30,20
                  L 45,15 L 60,12 L 80,10 L 100,8
                  L 120,9  L 140,14 L 155,22
                  L 165,35 L 168,50 L 165,65
                  L 170,80 L 175,95 L 172,110
                  L 168,125 L 160,138 L 150,148
                  L 138,158 L 125,165 L 110,170
                  L 95,168  L 80,162 L 68,152
                  L 55,140 L 42,125 L 32,110
                  L 22,95  L 18,78  L 20,60
                  L 18,45  L 22,32  Z
                "
                fill="rgba(255,255,255,0.18)"
                stroke="rgba(255,255,255,0.50)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Villes secondaires — points discrets */}
              {[
                { x: 85,  y: 95,  label: "Rabat",       size: 3 },
                { x: 75,  y: 108, label: "Casablanca",  size: 3.5 },
                { x: 120, y: 115, label: "Fès",         size: 3 },
                { x: 90,  y: 130, label: "Marrakech",   size: 3 },
              ].map(({ x, y, label, size }) => (
                <g key={label}>
                  <circle cx={x} cy={y} r={size}
                    fill="rgba(255,255,255,0.35)"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1" />
                  <text x={x + 6} y={y + 4}
                    fill="rgba(255,255,255,0.50)"
                    fontSize="7.5" fontFamily="DM Sans, sans-serif">
                    {label}
                  </text>
                </g>
              ))}

              {/* ── MARKER TANGER ── */}
              {/* Halo pulse */}
              <circle cx="52" cy="32" r="12"
                fill="rgba(255,255,255,0.08)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1">
                <animate attributeName="r" values="10;16;10"
                  dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5"
                  dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* Point blanc Tanger */}
              <circle cx="52" cy="32" r="5.5"
                fill="#ffffff"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2" />
              <circle cx="52" cy="32" r="2.5"
                fill={T.teal} />

              {/* Pin drop */}
              <path d="M52,20 Q58,20 58,27 Q58,32 52,40 Q46,32 46,27 Q46,20 52,20 Z"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
                strokeDasharray="3 2" />

              {/* Label Tanger */}
              <rect x="59" y="26" width="48" height="14" rx="4"
                fill="rgba(255,255,255,0.15)"
                stroke="rgba(255,255,255,0.30)"
                strokeWidth="0.8" />
              <text x="83" y="36"
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="DM Sans, sans-serif"
                textAnchor="middle">
                TANGER
              </text>
            </svg>

            {/* Badge "Nous sommes ici" */}
            <div style={{
              marginTop: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: "99px",
              padding: "5px 12px",
            }}>
              <span style={{
                width: "7px", height: "7px",
                borderRadius: "50%",
                background: T.white,
                display: "inline-block",
                flexShrink: 0,
              }} />
              <span style={{
                color: T.white, fontSize: "11px",
                fontWeight: 600, letterSpacing: "0.06em",
              }}>
                Tanger, Maroc
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bas de page ── */}
      <div style={{
        borderTop:  `1px solid ${T.border}`,
        padding:    "16px 40px",
        maxWidth:   "1100px",
        margin:     "0 auto",
        display:    "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap:   "wrap",
        gap:        "8px",
      }}>
        <p style={{ color: T.muted, fontSize: "11.5px", margin: 0 }}>
          © 2026 MoroccoGuide AI — CRT Tanger-Tétouan-Al Hoceima. Tous droits réservés.
        </p>
        <p style={{ color: "rgba(255,255,255,0.30)", fontSize: "11px", margin: 0 }}>
          Plateforme touristique intelligente · Maroc
        </p>
      </div>
    </footer>
  );
}