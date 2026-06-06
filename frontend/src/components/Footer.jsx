import LogoIcon from "../assets/LogoIcon.jsx";

/**
 * Footer.jsx — Layout aligné sur la photo de référence
 * Logo | Organiser | Légal | Contact | Carte
 */
export default function Footer() {
  const T = {
    teal:     "#0f766e",
    tealDark: "#0B5D5F",
    white:    "#ffffff",
    muted:    "rgba(255,255,255,0.62)",
    border:   "rgba(255,255,255,0.15)",
    hover:    "rgba(255,255,255,1)",
  };

  const linkStyle = {
    color:          T.muted,
    textDecoration: "none",
    fontSize:       "13px",
    transition:     "color 0.2s",
    lineHeight:     1.6,
    display:        "block",
  };

  const colTitleStyle = {
    color:         T.white,
    fontWeight:    700,
    fontSize:      "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    margin:        "0 0 18px",
    whiteSpace:    "nowrap",
  };

  const moroccoPath = "M62.5 954.5l0.1-1.4 2.3-8.7 0.2-2.6-0.2-2.2 0.1-1.4 1-1.6 0.1-0.7 0.1-0.7 0-0.7-0.2-0.3-0.7-0.6-0.2-0.3 0.3-0.9 0.2-1.7 1.1-2.5 0.4-2.4 0.5-1.4 5.7-11.7 2-2.1 0.3-0.6 0.1-0.3 0.6-1.4 0.3-0.4 0.9-0.6 0.3-0.3 0.9-2.1 0.6-0.8 1.4-0.5 0.2-0.3 0.4-0.3 0.6-0.1 0.5 0.2 0.4 0.4 0.6 0.7 6.1-2.4 1-0.9 1.1-1.4 0.9-1.4 1.9-6.9 0.1-1 0.6-0.7 2.7-2.8 0.7-0.8 0.7-3.8 0.1-5.1 0.3-1.3 0.6-2.1 0.5-1 1.1-1.5 0-0.6-0.2-0.5-0.1-0.4 0-0.7 0.1-0.4 0.5-1.1 0.1-0.3 0.2-0.2 1.2-0.2 1.4-0.3 1.7-1.6 1.9-2.1 0.5-1.2 0.4-1.2 0.2-1.3 0-1.4-0.4-1.4-1.1-0.2-2.2 0.6 0.4-1.1 0.9-1.9 0.5-0.7 2.6-2.4 0.2-0.4 4.1-9.5 0.6-0.8 0.6-0.4 0.7-0.6 2.5-4.3 0.7-4 0.6-1.1 0.8-1.2 2-3.5 2.6-3.1 0.2-0.3 0.9-0.7 0.4-0.4 0.3-0.6 0.3-1.3 0.2-0.6 0.8-1.4 0.9-1.1 0.7-1.1 0.2-1.5 0.2-2.6-0.2-1.1-0.7-1.4 0.1-0.3 0.2-0.5-0.6 0.5-0.1 0.7 0.1 0.8-0.1 0.8-0.4 0.5-1.4 1-0.5 0.2-0.7 0-0.5-0.1-0.5 0.1-0.9 0.8-0.6 0.7-0.3 0.8-0.9 2-0.7 1.3-0.1 0.3-0.1 0.8-0.6 1.2-0.1 0.5-0.4 0.7-2.6 2.4-0.8-0.7 0.3-1 1.3-1.4 0.2-0.9 2-3.8 3.4-4.7 0.4-1 0.8-1 0.8-1 4-3.4 1.8-0.7 2.4-1.4 0.7-0.7 1.8-0.2 1.4-1 1.2-1.3 0.8-1.3 2.3-2.6 1.5-2.3 2.1-1.6 0.9-0.8 0.4-1.1 0.4-0.7 5-4.2 3-3.2 3.8-5.8 1.4-1.6 1.8-1.6 1-0.7 1.1-0.5 1.1-0.4 2.4-0.4 1.1-0.6 1.9-1.5-0.1-1.4 0.2-0.3 0.7-1.4 1.3-1.6 1.3-1.1 1.4-0.8 1-0.8 0.7-1.2 0.5-3.9 1.3-3.6 0.5-2.8 0.7-1.7 0.2-0.8-0.1-1-0.2-1 0-0.9 0.3-0.9-0.4-0.4 0.4-0.9 0.2-0.9 0.2-1 0-1-0.1-0.9-0.5-1.3-0.2-0.8 0.1-5.4-0.4-1.5 1.7-7 0.4-1 1.6-6.1 2.5-3.6 0.7-0.6 0.5-0.6 1.6-3.9 0.4-2.8 0.1-0.3 0.5-1.1 0.3-1.9 2.2-5.6 4.1-5.9 1.5-2.7 0.3-0.8 0.1-1.2 0.9-2.7 0.5-0.9-0.2-0.9 0.5-3.5-0.1-0.9-0.6-1.8 0.2-0.6 0.4-0.7 0.6-1.8 0.3-0.7 3.1-4 0.5-0.4 2.6-0.5 3-1.6 4.5-4.5 0.8-1 0.5-1.1 0.6-0.9 1.3-0.6 6.1-0.6 1-0.5 5.7-3 9.9-7.2 6.7-4.3 3.2-3.7 3.3-6.7 1.2-3.3 1-4.9 1.6-3.6 1.6-7.8 1.1-2.3 4.5-6.8 0-0.3-0.4-0.6 0-0.3 0.8-0.4 2.9-7 1.8-6.3 0.1-1.4 0.3-1.1 1.1-2.3 0.1-1.1 0-0.3 0.4-1.1 0.6-0.6 1.6-0.8 1.8-1.5 2-0.7 0.9-1 2.3-3.8 1.3-4.5 0.6-1.3 0.9-0.9 1-0.6 5.2-2 9.9-1.7 7.9 0.2 9.8-3.2 14.9-2.6 0.7-0.5 1.2-1.3 0.2-0.1 1-0.3 12.2-5.4 16.3-7.1 1.8-1.5 1.3-1.7 2.1-3.6 0.9-1 1-0.8 0.8-1 0.3-1.3 0.5-0.9 3.3-2.3 2.5-3.2 0.5-0.9 2.2-1.4 0.5-0.5 0.4-0.8 0.3-0.4 1.9-1.5 0.2-0.3 1.1-1.9 1.5-1.6 0.9-0.6 15.6-8 3.7-2.6 4.5-2.3 2.1-1.4 6.7-6.4 5.7-8.6 1.4-1.8 1.1-0.9 2.1-0.7 0.8-1 1.3-2.1 1.4-1.8 0.6-1.1 0.3-1.1 0.3-0.6 1.9-1.4 0.3-0.4 0.5-1.3 2.2-3.4 0.4-0.7 0.1-1.3 0.3-1.5 0.5-1.2 0.6-1 2.6-2.4 0.4-0.8 0.4-1 2.2-3.1 7.1-7.7 5.6-10 3.5-8.2 0.5-2.4 0.9-8.1 1.1-4.2 0.1-1.2-0.2-1.7-0.6-0.9-0.9-0.5-0.9-1-0.6-1.1-1.4-3.2-0.5-2.1-0.4-0.3-0.6-0.1-0.7-0.2-0.5-0.5-1-1.7-3.9-2.7-1.1 0-1.3-0.3-0.8-0.9 0.1-2.5 1.2-2.4 1.4-2.2 1-2.1 0.4-1.4 0-0.8-0.2-0.6-0.4-0.6 0-0.4 0.2-0.5 0-0.7-0.4-12.6-0.2-1.1-0.8-2.3 0.6-1.5 1.5-9.1 0.1-3.6-0.2-1.5-0.6-0.8-0.8-0.6-0.6-0.9 1.7-2.2 1.2-2.2 1.3-3.9 0.6-0.9 1.1-0.9 0.3-0.5 0.3-1.1 0.8-0.9 0.3-0.7 0.7-1.1 0.3-0.6 0.8-5.1 0.4-1 5-5.5 2.2-3.1 0.4-0.5 0.9-0.6 0.4-0.5 0.4-0.6 0.5-1.1 0.3-0.5 6.4-6.7 0.7-1.3 0.4-0.9 0.6-2.6 0.1-1.1 0.3-0.8 2-2.5 0.7-1.8 0.5-2 0.3-6.6-0.3-0.4-1-0.5-0.2-0.5 0.1-1.4 0.3-1 1.5-2.9 0.4-1.3 0.1-1.2-0.4-1.1-0.5-0.6-0.5-1-0.3-1 0-1.1 1-2 8.1-6.9 6.2-7.5 5.3-3.7 1.9-1.8 6.2-8.4 6.9-7.6 0.4-0.8 0-0.8 0-1.4 0.5-0.9 4.5-5.3 0.5-0.3 0.4 0.1 0.6 0.6 0.4 0.2 1.4-0.1 1-0.3 2-1 2-1.6 3.2-4 1.9-1.6 2.3-0.9 7.5-1.8 5.2-2.3 2.6-1.2 2.6-0.7 1.3-0.5 1.2-1.6 1.4-0.6 3.7-1.1 2.1-1.2 1.1-0.2 1-0.5 0.9-1.2 0.9-0.8 1.1 0.3 0.6-0.4 0.5 0 0.6 0.3 0.6 0.1 0.5-0.2 0.9-0.6 1.6-0.4 1.2-0.4 1-0.6 0.7-0.6 1.9-2.4 1.6-0.7 1.5-1.9 1.1-0.4-0.4 0.5 1.1 0.4 1.1-0.4 0.7-0.4 4-2.7 2.1-1.9 2-1.1 2.2-0.8 1.9-0.3 0.1 0 0.9-0.4 1.7-1.5 2-0.7 5.7-4.6 5.8-6.4 4.8-8.1 3.6-7.8 6-9.1 0.6-1.1 0.9-2.6 1.3-2.1 11.8-25 4.7-16.3 10-25.3 0.3-1.2 0.1-1.7 0.2-0.9 1.2-2.7 1.1-3.7 0.1-0.5 0.2-0.6 0.7-1.1 0.2-0.6 0.3-3.2 0.4-1.6 0.5-1 1-1.1 1.9-0.3 5.1 0.7 0.6-0.1 1.5-1.5 0.7-0.5 1-0.6 1-0.2 0.7 0.3 0.9-0.4 1.3-0.1 1.3 0.4 0.9 0.6 3.3-1.9 0.9-0.9 2-2.2 1-1 1.1-0.5 0.5 0 0.2 0.3 0.7 0.3 0.5 0 0.2-0.5 0.1-0.5 0.1-0.1 0.4 0.1 0.5 1.5 0.6 1.4 0.9 1.2 1.2 1.1-0.3 1 0.2 1.7 0.8 3.5 0.3 2.8 0.2 0.8 0.3 0.7 0.5 0.4 0.3 0.1 0.9-0.1 0.3 0 0.1 0.4-0.1 1.1 0 0.4 0.9 3.6 0.6 1.3 1.1 1.1 2.3 1.7 2 1.8 4.6 6.7 0.9 0.6 1.3 0.3 1 0.3 1.1 0.7 1.8 1.8 1.6 2.1 0.9 1.1 2.4 0.8 3 2.8 2.2 1.3 7.8 2.4 7.3 1.6 0 0.1 6.5 1.9 1.6 0.1 1.1-0.3 3.1-2 7.6-1.4 4.6-2.1 4.7-0.9 2.3-1.1 0.5 0.7-0.1 0.3-0.7 0.3-0.3 0.2 0.3 0.4 0.4 0.5 0.7 1.1 0.9 0.4 1.1 0.1 1.5 0.1 1-0.1 1.9-0.2 1.3-0.6 0.5-1.2 0.4-1.8 1.2-1.3 1.4-0.5 1.5 0.2 1 0.7 2.3 2.1 1.2 0.8 4.1 0.7 1.4 0.8 0.7 0 0.7 0 0.6 0 0.6 0.2 1.1 0.5 0.5 0.2 2.8 0.2 2.4-0.5 6.8-2.4 1.1-0.7 2.5-2.7 0.6-0.4 0.4 0.1 0.5 0.2 0.6 0.3 0.7-0.1 1.7-1.8 2.2-5.3 1.4-2.1-0.1-0.7 0.2-0.6 0.6-0.2 0.6 0.4 0.3 0.5-0.3 1.2 0.2 0.8-0.5 2 0.7 2.6 0.1 0.3-1.1 1.1 0.2 1.9 1.2 1.2 1.6-0.6 0.8 1.1-0.5 0.6-0.3 1.1 0 1.1 0.2 2.1 0.2 0.9 0.5 0.8 0.8 1 1.4 1.1 1.9 0.6 4 0.4-2.4-2-4.2-4.8-0.8-1.4 0.3-0.6 0.7 0.6 2.7 2.9 0.4 0.7 2.6 2.8 2.4 1.3 2.8 1 5.6 0.8 2.6-0.2 1.3-0.3 0.9-0.6 1.1-1.3 1.1-0.9 1.1-0.2 5.2 2 1.2 0.2 1.3 0.4 1.5 0.8 1.4 0.6 0.1 2.6 0.5 1.8 1 1.3 1.6 0.6 2.1 1.5 1.7 1.6 1.8 1.2 2.5 0.3 0.7 0.5 0.2 0.8 0.1 0.9 0.2 0.9 0.8 0.9 2.9 1.8 1.8 1.8 5.8 3.7 1 1-0.2 0.5-0.7 0.5-1.3 3-2.9 4.5-0.5 1.1 6.6 6.8 2 0.6 0.6 0.4-5.8 7.1 2.1 2.5 1.4 3 3.9 12.2 0.1 0.9 0.2 0.8-0.2 1.4-2.5 10.6-0.2 3.1 0.5 3.2 0.6 1.9-0.1 0.8-0.4 0.9-0.5 0.7-0.7 0.6-0.5 0.7-0.3 1 0.4 1 0.8 0.6 1.9 0.7 1 0.7 0.6 0.8 2.4 5.9 0.3 2.2-0.7 1.8-0.8 1.2-1.1 3.7-0.7 1.6-0.6 1.7 0 6.4 0.5 2.2 2.8 2.7 1 1.8 0.7 2.1 1.1 1.6 1.5 1.3 1.6 1.2 0.9 0.9 0.3 1.3 0 1.6-0.2 1.4-0.1 0.7-0.2 0.6-0.3 0.5-0.4 0.5-2.4 1.6 7.5 12.5 1.7 1.5 3.5 1.3 15.3 11.9 0.9 1.4-3.2 3.6-1.8 1.4-2 0.8-2.3 0.4-0.9 0.4-0.9 1.2-0.5 1.1-0.8 2.4-0.8 5.9-0.2 0.8 0.1 0.5-0.1 0.6-0.4 0.6-0.3 0.4-0.9 0.7-0.2 0.4 0.2 1.1 0.9 0 2-0.8 1.1 0 1.1 0.3 0.9 0.8 0.3 1.3-1.1 2.3-2.1 0.6-4.2-0.2-0.4-0.1-1.3 0-2.1-0.1-2.8-0.1-3.3-0.2-3.8-0.2-4.2-0.2-4.5-0.2-4.7-0.2-4.8-0.2-4.8-0.3-4.7-0.2-4.6-0.2-4.2-0.2-4-0.2-3.4-0.2-7.6-0.3-9.8 2.7-10.2 0.9-3.1 1.8 3.8 10.1 2.3 6.3-9.6 1.3-11.9 3.6-16 2.9-2 0.2-2.3-0.5-3.8 1.9-0.7 16.6-4.1 0.3-3 2.2-0.7 0.9-0.2 1.1 0.3 4.9-0.1 1.4-1.1 2-0.4 1.3 0.2 1.1 0.6 0.6 0.9 0 1-0.4 1.6-1.5 0.8-0.5 1 0.3 0.8 0.8 1.5 2.4 0.9 1 2 0.9 0.7 0.6 0.5 1.2 0.2 1.1 0.1 1.3 3 4.8-3.1 4.9-2.7 2.6 0.4 4 0.4 4.1-10.3 5.3-9.2 2.2-8.4 0.5-6.5 1.7-5.4 3.1-6.1 8-7.7 6.2-8 3.6-5.7 3.1-4.6 3.5-6.2 5.3-5.7 4-5.4 5.7-3.8 7.5-5 8-5.7 7.5-5.4 1.7-4.5-1.7-2-5.8-6.8 0.9-6.5 1.3-6.9 0-8.1 0-7.6 0.9-8.1 2.2-7.6 0.9-4.6 4.4-9.6-4-6.1-0.4-4.2 0.4-6.1 2.7-5 5.2-6.2-0.3-1.2 0.4-1.2 0.1-1.2 0-2.4-0.4-2.6-0.1-1.8 0.8-3.4 3.4-0.8 0.7-2.6 1.4-3.4 3.1-5.8 3.9-5 4.8-1.8 1.3-6.2 2.8-3.7 2.5-3.6 3.5-0.9 0.5-2 0.9-0.8 0.7-1.9 3.3-0.7 0.7-2.5 1.4-2.4 2-7 3.8-1.1 0.9-0.6 1.2-0.2 1.7 0 2.8 0 3.8 0 3.7 0 3.7 0 3.7 0 3.8 0 3.7 0 3.7 0 3.7 0 3.8 0 3.7 0 3.7 0 3.7 0 3.7 0 3.7 0 3.7 0 3.7-3.8 0-3.5 0-0.1 0.2 0.3 2.8 1.6 5.1 0.6 4.4-0.8 2.7-0.8 3.4 0.3 3.3 1.3 3.5 1.1 3.7 0 2.5-2.3 1.8-5.1 1-6.2 0.9-4.5 0-6.8-0.6-4.2 0.1-3.7 0-3.3 0.6-4.1 2.3-4.5 3.7-5.7 4.9-3.4 3.1-4.5 0.6-4.5 0-4.4-2.4-2.8-1.3-1.9 0.1-3.1 1.8-3.6 1.2-3.4 0-5.7-2.5-6.8-3.6-3.9-1.9-5.7-0.6-5.6-1.2-4 0.6-5.1 0-6.8 2.5-5.6 1.8-6.2 1.8-7.1 1.7 1.7 5.5 2.5 3 0 3.7-1.2 3.1-3.4 3.1-3.9 3.9-2.2 3-2.3 4.3-1.7 2.4-2.9 4-2.6 5-0.8 3.1-1 3.6-2 1-6.9 1-4.4 1.2-3.8 1.2-1.4 2.1-0.3 0.4-1.1 4.3 0 3-1.1 2.4-1.6 6.1-2.2 5.5-1.6 7.3-1.7 6-2.2 9.7-2.2 9.1-2.7 8.5-2.2 5.4-1.6 3-3.9 3.6-3.2 2.4-3.9 3.1-4.4 3-6 3.5-4.9 3.1-2 1.4-2.4 1.6-3.8 4.2-3.3 6-2.2 4.8-3.8 7.8-2.8 4.2-1.6 2.4-4.4 2.4-4.9 1.8-5.5 2.4-4.4 2.4-6 2.4-3.8 2.4-2.8 3.5-2.2 4.2-2.7 6-2.2 6.6-1.1 4.2-3.3 14.3-1.1 8.3-1.1 5.3-1.6 6.6-1.1 10.1 0 8.2-1.1 4.8-0.5 3.6-2.8 4.1-2.2 2.9-3.8 4.2-3.3 2.3-1.1 2.4-3.3 2.9-3.2 4.8-2.8 2.9 0.6 2.4 0.5 4.1-1.6 4.2-1.7 4.7-4.3 5.8-5 3-7.1 0.5-9.8 0-7.7-0.5-9.3 0-8.2-1.2-7.7-1.2-9.3-0.6-6.6 0-8.2 1.2-21.3 0-8.2 0.6-12.1 2.4-3.5 0.5z";

  return (
    <footer style={{
      background: `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 55%, #0d9488 100%)`,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position:   "relative",
      overflow:   "hidden",
    }}>

      {/* Vague de transition */}
      <div style={{ lineHeight: 0, marginTop: -1 }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: 40 }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,10 1440,20 L1440,0 L0,0 Z"
            fill="#f7fbfb" />
        </svg>
      </div>

      {/* ════════ GRILLE PRINCIPALE : 5 colonnes ════════ */}
      <div style={{
        maxWidth: "100%",
        padding:  "48px 48px 36px 48px",
        display:  "grid",
        /* Logo | Organiser | Légal | Contact | Carte */
        gridTemplateColumns: "220px 160px 200px 220px 1fr",
        gap:      "0",
        alignItems: "start",
      }}>

        {/* ── COL 1 : Logo + Description ── */}
        <div style={{ paddingRight: "36px" }}>
          <div>
            {/* Logo SVG inline — aucun import de fichier */}
            <div style={{ marginBottom: "12px" }}>
              <LogoIcon
                width={130}
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))" }}
              />
            </div>

            {/* Nom plateforme — même style que la photo */}
            <div style={{ marginBottom: "20px", lineHeight: 1.15 }}>
              <span style={{
                display:     "block",
                fontSize:    "22px",
                fontWeight:  800,
                color:       T.white,
                letterSpacing: "0.01em",
              }}>
                MoroccoGuide
              </span>
              <span style={{
                display:     "block",
                fontSize:    "22px",
                fontWeight:  800,
                color:       "rgba(255,255,255,0.32)",
                letterSpacing: "0.01em",
              }}>
                AI
              </span>
            </div>

            <p style={{ color: T.muted, fontSize: "12.5px", lineHeight: 1.75, margin: "0 0 20px" }}>
              Portail officiel d'information et d'assistance touristique du Maroc.
              Explorez des destinations authentiques et des expériences uniques à travers tout le royaume.
            </p>

            <div style={{ display: "flex", gap: "8px" }}>
              {["f", "in", "ig"].map((l) => (
                <a key={l} href="#" style={{
                  width: "30px", height: "30px", borderRadius: "50%",
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

            {/* Copyright sous les socials */}
            <p style={{
              color:      T.muted,
              fontSize:   "11.5px",
              margin:     "20px 0 0",
              lineHeight: 1.5,
            }}>
              © 2026 MoroccoGuide AI — Tous droits réservés.
            </p>
          </div>
        </div>

        {/* ── COL 2 : Organiser votre séjour ── */}
        <div style={{
          borderLeft:  `1px solid ${T.border}`,
          paddingLeft: "36px",
          paddingRight: "24px",
        }}>
          <h4 style={colTitleStyle}>Organiser<br/>votre séjour</h4>
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

        {/* ── COL 3 : Informations légales ── */}
        <div style={{
          borderLeft:  `1px solid ${T.border}`,
          paddingLeft: "36px",
          paddingRight: "24px",
        }}>
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

        {/* ── COL 4 : Contact ── */}
        <div style={{
          borderLeft:  `1px solid ${T.border}`,
          paddingLeft: "36px",
          paddingRight: "24px",
        }}>
          <h4 style={colTitleStyle}>Contact</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ color: T.muted, fontSize: "12.5px", lineHeight: 1.6 }}>
              Conseil National du Tourisme — Maroc
            </span>
            <span style={{ color: T.muted, fontSize: "12.5px", lineHeight: 1.6 }}>
              contact@visitmorocco.ma
            </span>
            <span style={{ color: T.muted, fontSize: "12.5px", lineHeight: 1.6, whiteSpace: "nowrap" }}>
              +212 (0) 5 37 67 40 12
            </span>
          </div>
        </div>

        {/* ── COL 5 : Carte Maroc ── */}
        <div style={{
          borderLeft:   `1px solid ${T.border}`,
          paddingLeft:  "36px",
          display:      "flex",
          alignItems:   "flex-start",
          alignSelf:    "stretch",
          position:     "relative",
        }}>
          {/* Sous-colonne gauche : titre + carte + badge + texte en bas */}
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column" }}>
          <h4 style={{ ...colTitleStyle, marginBottom: "14px" }}>Notre territoire</h4>

          <svg
            viewBox="62 46 876 908"
            style={{
              width:    "100%",
              maxWidth: "320px",
              display:  "block",
              overflow: "visible",
              filter:   "drop-shadow(0 4px 20px rgba(0,0,0,0.30))",
            }}
          >
            <defs>
              <linearGradient id="fgMaroc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.34)" />
                <stop offset="60%"  stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
              </linearGradient>
              <linearGradient id="fgMaroc2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
              <filter id="fglow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Ombre */}
            <path transform="translate(6,8)" fill="rgba(0,0,0,0.18)" d={moroccoPath} />

            {/* Halo */}
            <path d={moroccoPath}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="18"
              strokeLinejoin="round"
              transform="scale(1.012) translate(-6,-6)"
              style={{ transformOrigin: "500px 500px" }}
            />

            {/* Silhouette principale */}
            <path d={moroccoPath}
              fill="url(#fgMaroc)"
              stroke="rgba(255,255,255,0.90)"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Couche profondeur */}
            <path d={moroccoPath}
              fill="url(#fgMaroc2)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
              strokeDasharray="10 7"
              strokeLinejoin="round"
              transform="scale(0.975) translate(13,13)"
              style={{ transformOrigin: "500px 500px" }}
            />

            {/* ── Villes ── */}
            {[
              { x: 744, y:  94, label: "Chefchaouen", anchor: "start",  dx: 14, dy: 5  },
              { x: 762, y: 167, label: "Fès",          anchor: "start",  dx: 14, dy: 5  },
              { x: 657, y: 167, label: "Rabat",        anchor: "end",    dx:-14, dy: 5, bold: true },
              { x: 610, y: 191, label: "Casablanca",   anchor: "end",    dx:-14, dy: 5  },
              { x: 587, y: 312, label: "Marrakech",    anchor: "end",    dx:-14, dy: 5  },
              { x: 494, y: 385, label: "Agadir",       anchor: "end",    dx:-14, dy: 5  },
            ].map(({ x, y, label, anchor, dx, dy, bold }) => (
              <g key={label}>
                <circle cx={x} cy={y}
                  r={bold ? 9 : 6}
                  fill={bold ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)"}
                  stroke="rgba(255,255,255,0.20)" strokeWidth="2"
                />
                <text
                  x={x + dx} y={y + dy}
                  fill={bold ? "#ffffff" : "rgba(255,255,255,0.75)"}
                  fontSize={bold ? 24 : 20}
                  fontWeight={bold ? "700" : "400"}
                  fontFamily="DM Sans, sans-serif"
                  textAnchor={anchor}
                >
                  {label}
                </text>
              </g>
            ))}

            {/* ── Marker Tanger animé ── */}
            <circle cx="715" cy="58" r="0" fill="none"
              stroke="rgba(255,255,255,0.15)" strokeWidth="2">
              <animate attributeName="r" values="20;55;20" dur="2.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="715" cy="58" r="0" fill="none"
              stroke="rgba(255,255,255,0.25)" strokeWidth="2">
              <animate attributeName="r" values="14;38;14" dur="2.8s" begin="0.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.8s" begin="0.4s" repeatCount="indefinite"/>
            </circle>

            {/* Cercle marker */}
            <circle cx="715" cy="58" r="16"
              fill="rgba(255,255,255,0.96)"
              stroke="rgba(94,202,203,0.8)"
              strokeWidth="3"
              filter="url(#fglow)"
            />
            <circle cx="715" cy="58" r="8" fill="#0f766e" />
            <circle cx="709" cy="52" r="3" fill="rgba(255,255,255,0.85)" />

            {/* Label Tanger */}
            <rect x="554" y="38" width="146" height="38" rx="8"
              fill="rgba(255,255,255,0.18)"
              stroke="rgba(255,255,255,0.60)"
              strokeWidth="1.5"
            />
            <line x1="698" y1="58" x2="700" y2="58"
              stroke="rgba(255,255,255,0.60)" strokeWidth="1.5"/>
            <text x="627" y="62"
              fill="#ffffff" fontSize="19" fontWeight="800"
              fontFamily="DM Sans, sans-serif"
              letterSpacing="2.5" textAnchor="middle"
            >
              TANGER
            </text>
          </svg>

          {/* Badge Maroc — largeur auto sur le texte */}
          <div style={{ marginTop: "12px", width: "fit-content" }}>
            <div style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "8px",
              background:   "rgba(255,255,255,0.08)",
              border:       "1px solid rgba(255,255,255,0.20)",
              borderRadius: "99px",
              padding:      "5px 14px",
            }}>
              <span style={{
                position: "relative", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                width: "10px", height: "10px", flexShrink: 0,
              }}>
                <span style={{
                  position: "absolute", width: "10px", height: "10px",
                  borderRadius: "50%", background: "rgba(94,202,203,0.4)",
                  animation: "footerPing 2s cubic-bezier(0,0,0.2,1) infinite",
                }} />
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "#5ECACB", boxShadow: "0 0 6px #5ECACB",
                  position: "relative",
                }} />
              </span>
              <span style={{ color: T.white, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                Maroc
              </span>
            </div>
          </div>

          {/* Texte juste sous la carte, sans espace en bas */}
          <p style={{
            color:         "rgba(255,255,255,0.28)",
            fontSize:      "11px",
            margin:        "8px 0 0",
            letterSpacing: "0.08em",
            lineHeight:    1.4,
          }}>
            MoroccoGuide AI · Plateforme touristique intelligente
          </p>

          </div>{/* fin sous-colonne carte */}

        </div>

      </div>{/* fin grille principale */}

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