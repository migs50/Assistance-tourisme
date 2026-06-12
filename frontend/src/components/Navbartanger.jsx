/**
 * NavbarTanger.jsx — PREMIUM GLASSMORPHISM
 * Remplace entièrement l'ancien navbar sombre.
 */
import { useState, useEffect } from "react";

/* ── CSS injecté une seule fois ───────────────────────────────── */
const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;600&display=swap');

  @keyframes tt-pulse {
    0%   { transform: scale(1);    opacity: 0.65; }
    70%  { transform: scale(1.22); opacity: 0; }
    100% { transform: scale(1.22); opacity: 0; }
  }
  @keyframes tt-navSlide {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tt-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .tt-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 80px;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    transition: background 0.45s ease,
                backdrop-filter 0.45s ease,
                box-shadow 0.45s ease;
    background: transparent;
    animation: tt-navSlide 0.7s cubic-bezier(.22,.68,0,1.2) both;
  }

  .tt-nav.scrolled {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(20px) saturate(1.6);
    -webkit-backdrop-filter: blur(20px) saturate(1.6);
    box-shadow: 0 2px 32px rgba(15,139,141,0.10),
                0 1px 0 rgba(0,0,0,0.06);
  }

  /* Logo */
  .tt-logo-eyebrow {
    font-family: 'Cormorant Garamond', serif;
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.70);
    transition: color 0.45s;
    display: block;
  }
  .tt-nav.scrolled .tt-logo-eyebrow { color: #0F8B8D; }

  .tt-logo-main {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #ffffff;
    transition: color 0.45s;
    display: block;
    line-height: 1.2;
  }
  .tt-nav.scrolled .tt-logo-main { color: #1F2937; }

  .tt-logo-accent {
    color: #5ECACB;
    transition: color 0.45s;
  }
  .tt-nav.scrolled .tt-logo-accent { color: #0F8B8D; }

  /* Links */
  .tt-link {
    position: relative;
    padding: 8px 15px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.88);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.3s, background 0.3s;
  }
  .tt-link:hover { color: #fff; }
  .tt-link.active { color: #fff; font-weight: 600; }

  .tt-nav.scrolled .tt-link { color: #374151; }
  .tt-nav.scrolled .tt-link:hover {
    color: #0F8B8D;
    background: rgba(15,139,141,0.07);
  }
  .tt-nav.scrolled .tt-link.active { color: #0B5D5F; }

  /* Underline */
  .tt-underline {
    position: absolute;
    bottom: 4px; left: 50%;
    height: 1.5px;
    border-radius: 99px;
    background: #5ECACB;
    transform: translateX(-50%);
    transition: width 0.3s cubic-bezier(.22,.68,0,1.2);
  }
  .tt-nav.scrolled .tt-underline { background: #0F8B8D; }

  /* AI Button */
  .tt-ai-btn {
    position: relative;
    padding: 11px 26px;
    border-radius: 99px;
    border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #fff;
    cursor: pointer;
    background: linear-gradient(135deg, #0F8B8D 0%, #0B5D5F 100%);
    box-shadow: 0 4px 20px rgba(15,139,141,0.45);
    flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(.22,.68,0,1.2),
                box-shadow 0.3s;
    overflow: visible;
  }
  .tt-ai-btn:hover {
    transform: scale(1.06) translateY(-1px);
    box-shadow: 0 10px 36px rgba(15,139,141,0.55),
                0 0 44px rgba(94,202,203,0.30);
  }
  .tt-ai-btn:active { transform: scale(0.97); }

  .tt-pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 99px;
    border: 1.5px solid rgba(94,202,203,0.60);
    animation: tt-pulse 2.4s cubic-bezier(0.2,0.6,0.5,1) infinite;
    pointer-events: none;
  }

  /* Back button */
  .tt-back-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.30);
    border-radius: 8px;
    color: rgba(255,255,255,0.75);
    padding: 5px 12px;
    cursor: pointer;
    font-size: 11px;
    font-family: 'Montserrat', sans-serif;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
    transition: color 0.3s, border-color 0.3s;
    display: inline-block;
  }
  .tt-nav.scrolled .tt-back-btn {
    border-color: rgba(15,139,141,0.4);
    color: #0F8B8D;
  }

  /* Hamburger */
  .tt-hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 26px; height: 18px;
    background: none; border: none;
    cursor: pointer; padding: 0;
  }
  .tt-hamburger span {
    display: block;
    height: 2px; border-radius: 2px;
    background: #fff;
    transition: background 0.3s, transform 0.35s, opacity 0.25s;
    transform-origin: left center;
  }
  .tt-nav.scrolled .tt-hamburger span { background: #1F2937; }
  .tt-hamburger.open span:nth-child(1) { transform: rotate(42deg) scaleX(1.1); }
  .tt-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .tt-hamburger.open span:nth-child(3) { transform: rotate(-42deg) scaleX(1.1); }

  /* Mobile menu */
  .tt-mobile-menu {
    position: fixed;
    inset: 0; z-index: 999;
    background: rgba(11,30,40,0.88);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    animation: tt-fadeIn 0.38s ease both;
  }
  .tt-mobile-link {
    font-family: 'Montserrat', sans-serif;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.85);
    background: transparent;
    border: none;
    border-radius: 12px;
    padding: 14px 48px;
    cursor: pointer;
    width: 280px;
    text-align: center;
    transition: color 0.2s, background 0.2s;
  }
  .tt-mobile-link:hover,
  .tt-mobile-link.active { color: #5ECACB; background: rgba(94,202,203,0.08); }

  .tt-mobile-divider {
    width: 40px; height: 1px;
    background: rgba(94,202,203,0.28);
    margin: 8px 0;
  }
  .tt-mobile-ai {
    margin-top: 20px;
    padding: 14px 44px;
    border-radius: 99px; border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: #fff; cursor: pointer;
    background: linear-gradient(135deg, #0F8B8D, #0B5D5F);
    box-shadow: 0 6px 28px rgba(15,139,141,0.5);
  }

  /* Padding helper so content isn't hidden under fixed nav */
  .tt-nav-spacer { height: 80px; }

  @media (max-width: 900px) {
    .tt-nav { padding: 0 24px; }
    .tt-nav-center { display: none !important; }
    .tt-hamburger { display: flex; }
    .tt-ai-btn    { display: none; }
  }
`;

function injectNavCSS() {
  if (document.getElementById("tt-nav-css")) return;
  const el = document.createElement("style");
  el.id = "tt-nav-css";
  el.textContent = NAV_CSS;
  document.head.appendChild(el);
}

/* ── TABS ─────────────────────────────────────────────────────── */
const TABS = [
  { key: "accueil", label: "Accueil" },
  { key: "recommandation", label: "Recommandation" },
  { key: "activites", label: "Activités" },
  { key: "evenements", label: "Événements" },
  { key: "dashboard", label: "Dashboard" },
  { key: "assurance", label: "Assurance" },
  { key: "favoris", label: "Favoris" }
];


/* ── COMPOSANT ────────────────────────────────────────────────── */
export default function NavbarTanger({ onBack, onOpenChat,activeTab, onTabChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  /* Inject CSS */
  useEffect(() => { injectNavCSS(); }, []);

  /* Scroll listener */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleTab = (key) => {
    onTabChange?.(key);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className={`tt-nav${scrolled ? " scrolled" : ""}`}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, lineHeight: 1 }}>
          {onBack && (
            <button className="tt-back-btn" onClick={onBack}>
              ← Maroc
            </button>
          )}
          <span className="tt-logo-eyebrow">Discover Morocco</span>
          <span className="tt-logo-main">
            Explore<span className="tt-logo-accent">212</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="tt-nav-center" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const isHovered = hoveredLink === tab.key;
            return (
              <button
                key={tab.key}
                className={`tt-link${isActive ? " active" : ""}`}
                onClick={() => handleTab(tab.key)}
                onMouseEnter={() => setHoveredLink(tab.key)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {tab.label}
                <span
                  className="tt-underline"
                  style={{ width: isActive || isHovered ? "55%" : "0%" }}
                />
              </button>
            );
          })}
        </div>

        {/* AI Button */}
        <button className="tt-ai-btn" onClick={onOpenChat}>
          <span className="tt-pulse-ring" />
          Assistant IA
        </button>

        {/* Hamburger */}
        <button
          className={`tt-hamburger${mobileOpen ? " open" : ""}`}
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="tt-mobile-menu">
          {TABS.map((tab, idx) => (
            <div
              key={tab.key}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
            >
              {(idx === 2 || idx === 4) && <div className="tt-mobile-divider" />}
              <button
                className={`tt-mobile-link${activeTab === tab.key ? " active" : ""}`}
                onClick={() => handleTab(tab.key)}
              >
                {tab.label}
              </button>
            </div>
          ))}
          <button
            className="tt-mobile-ai"
            onClick={() => { onOpenChat?.(); setMobileOpen(false); }}
          >
            Assistant IA
          </button>
        </div>
      )}
    </>
  );
}