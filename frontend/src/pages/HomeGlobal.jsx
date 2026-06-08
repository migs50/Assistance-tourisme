/**
 * HomeGlobal.jsx
 * PAGE 1 — Accueil Maroc Tourisme (Premium Redesign)
 * UI redesign only — all backend logic preserved.
 * Zero external animation dependencies — pure CSS animations.
 */
import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";

/* ── Design tokens ─────────────────────────────── */
const C = {
  primary:   "#0f766e",
  secondary: "#14b8a6",
  light:     "#ccfbf1",
  bg:        "#f7fbfb",
  bgAlt:     "#ffffff",
  text:      "#0f172a",
  muted:     "#64748b",
};

/* ── Data (unchanged) ──────────────────────────── */
const VILLES = [
  {
    id:          "tanger",
    nom:         "Tanger",
    description: "Porte de l'Afrique, là où la Méditerranée rencontre l'Atlantique sous le regard des agents intelligents.",
    note:        4.8,
    imageUrl:    "/src/assets/tanger.jpg",
    isMain:      true,
  },
  {
    id:          "chefchaouen",
    nom:         "Chefchaouen",
    description: "La Perle Bleue, une médina enchanteresse nichée au cœur des montagnes du Rif.",
    note:        4.7,
    imageUrl:    "/src/assets/chefchaouen.jpg",
  },
  {
    id:          "essaouira",
    nom:         "Essaouira",
    description: "Ancienne Mogador, cité fortifiée au charme marin et aux alizés légendaires.",
    note:        4.5,
    imageUrl:    "/src/assets/essaouira.jpg",
  },
  {
    id:          "agadir",
    nom:         "Agadir",
    description: "Station balnéaire moderne offrant une baie splendide et un ensoleillement permanent.",
    note:        4.6,
    imageUrl:    "/src/assets/agadir.jpg",
  },
  {
    id:          "rabat",
    nom:         "Rabat",
    description: "Capitale administrative mêlant harmonieusement espaces verts et monuments séculaires.",
    note:        4.5,
    imageUrl:    "/src/assets/rabat.jpg",
  },
  {
    id:          "marrakech",
    nom:         "Marrakech",
    description: "La cité ocre et son effervescente place Jemaâ el-Fna aux mille couleurs.",
    note:        4.9,
    imageUrl:    "/src/assets/marrakech.jpg",
  },
];

const CATEGORIES = [
  { label: "Hotels",      slug: "hotels" },
  { label: "Restaurants", slug: "restaurants" },
  { label: "Activites",   slug: "activites" },
  { label: "Evenements",  slug: "evenements" },
  { label: "Musees",      slug: "musees" },
];

const STATS = [
  { value: "6",    label: "Destinations" },
  { value: "500+", label: "Experiences" },
  { value: "98%",  label: "Satisfaction" },
  { value: "24/7", label: "Assistance IA" },
];

/* ── Global CSS ────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes hg-fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hg-pulse {
    0%,100% { transform: scale(1);    opacity:.13; }
    50%      { transform: scale(1.09); opacity:.21; }
  }
  @keyframes hg-bob {
    0%,100% { transform: translateX(-50%) translateY(0); }
    50%      { transform: translateX(-50%) translateY(9px); }
  }

  .hg-eyebrow  { animation: hg-fadeUp .65s .02s both ease-out; }
  .hg-title    { animation: hg-fadeUp .75s .12s both ease-out; }
  .hg-sub      { animation: hg-fadeUp .75s .22s both ease-out; }
  .hg-search   { animation: hg-fadeUp .75s .32s both ease-out; }
  .hg-pulse    { animation: hg-pulse 8s infinite ease-in-out; }
  .hg-bob      { animation: hg-bob 1.9s infinite ease-in-out; }

  /* ── Card ── */
  .hg-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 0 2px ${C.secondary}, 0 16px 40px rgba(15,118,110,0.15);
    transition: transform .28s ease, box-shadow .28s ease;
  }
  .hg-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 0 0 2px ${C.secondary}, 0 28px 56px rgba(15,118,110,0.22);
  }
  .hg-card:hover .hg-card-img { transform: scale(1.07); }
  .hg-card-img {
    width: 100%; height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform .55s ease;
  }

  /* ── Buttons ── */
  .hg-btn {
    width: 100%; padding: 11px 0;
    border-radius: 30px;
    background: ${C.primary};
    border: 2px solid ${C.primary};
    color: #fff;
    font-size: 14px; font-weight: 600;
    cursor: pointer; letter-spacing: .3px;
    transition: opacity .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .hg-btn:hover { opacity: .88; }

  .hg-search-btn {
    background: ${C.primary};
    border: none; border-radius: 40px;
    padding: 12px 28px; color: #fff;
    font-weight: 600; font-size: 14px;
    cursor: pointer; white-space: nowrap;
    transition: background .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .hg-search-btn:hover { background: ${C.secondary}; }

  /* ── Category pills ── */
  .hg-cat-pill {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; cursor: pointer;
    padding: 16px 28px; border-radius: 14px;
    background: #fff;
    box-shadow: 0 2px 12px rgba(15,23,42,.07);
    transition: background .25s, box-shadow .25s, transform .25s;
    font-size: 13px; font-weight: 600; color: ${C.text};
    letter-spacing: .3px;
  }
  .hg-cat-pill:hover {
    background: ${C.light};
    box-shadow: 0 8px 24px rgba(15,118,110,.14);
    transform: translateY(-4px);
    color: ${C.primary};
  }

  /* ── CTA button ── */
  .hg-cta-btn {
    background: transparent;
    border: 2px solid #fff;
    border-radius: 40px;
    color: #fff;
    padding: 14px 46px;
    font-size: 15px; font-weight: 600;
    cursor: pointer;
    transition: background .25s, color .25s;
    font-family: 'DM Sans', sans-serif;
  }
  .hg-cta-btn:hover { background: #fff; color: ${C.primary}; }

  /* ── Navbar logo ── */
  .hg-nav-logo-main {
    font-size: 20px; font-weight: 800;
    color: ${C.text};
    font-family: 'Playfair Display', Georgia, serif;
    letter-spacing: -.3px;
  }
  .hg-nav-logo-ai {
    color: ${C.secondary};
    font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 18px;
    margin-left: 2px;
  }
  .hg-nav-discover {
    font-size: 10px; font-weight: 600;
    letter-spacing: 3px; text-transform: uppercase;
    color: ${C.secondary};
    display: block;
    margin-bottom: 2px;
  }

  /* ── Scroll reveal ── */
  .hg-reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .hg-reveal.visible { opacity: 1; transform: translateY(0); }
`;

/* ── CSS injector ──────────────────────────────── */
function useGlobalCSS() {
  useEffect(() => {
    const id = "hg-global-style";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
  }, []);
}

/* ── IntersectionObserver reveal ──────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Wave separator ────────────────────────────── */
function Wave({ topColor, bottomColor }) {
  return (
    <div style={{ lineHeight: 0, background: topColor }}>
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "70px" }}>
        <path d="M0,35 C240,70 480,0 720,35 C960,70 1200,0 1440,35 L1440,70 L0,70 Z"
          fill={bottomColor} />
      </svg>
    </div>
  );
}

/* ── Stars ─────────────────────────────────────── */
function Stars({ note }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 20 20"
          fill={i <= Math.round(note) ? C.secondary : "#cbd5e1"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span style={{ color:"#fff", fontSize:"12px", fontWeight:600, marginLeft:"3px" }}>{note}</span>
    </span>
  );
}

/* ── Ville Card — même style pour toutes ──────── */
function VilleCard({ ville, onExplore, delay = 0 }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className="hg-card hg-reveal"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "210px", overflow: "hidden" }}>
        <div
          className="hg-card-img"
          style={{
            backgroundImage: `url(${ville.imageUrl}),
              linear-gradient(135deg, ${C.primary}55, ${C.secondary}33)`,
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(15,23,42,.55) 0%, transparent 58%)",
        }} />
        <div style={{ position: "absolute", bottom: "13px", left: "15px" }}>
          <Stars note={ville.note} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "22px 22px 26px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3 style={{
          margin: "0 0 9px", fontSize: "20px", fontWeight: 700,
          color: C.text, fontFamily: "'Playfair Display', Georgia, serif",
        }}>
          {ville.nom}
        </h3>
        <p style={{ margin: "0 0 22px", color: C.muted, fontSize: "14px", lineHeight: 1.65, flexGrow: 1 }}>
          {ville.description}
        </p>
        <button className="hg-btn" onClick={() => onExplore(ville.id)}>
          Explorer
        </button>
      </div>
    </div>
  );
}

/* ── Stat item ─────────────────────────────────── */
function StatItem({ value, label }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="hg-reveal" style={{ textAlign: "center" }}>
      <div style={{ fontSize: "38px", fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', Georgia, serif" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: C.light, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "5px" }}>
        {label}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function HomeGlobal({ onExploreTanger }) {
  useGlobalCSS();

  const [query, setQuery]       = useState("");
  const [scrolled, setScrolled] = useState(false);
  const ctaRef                  = useReveal();

  /* ── unchanged backend logic ── */
  const handleExplore = (villeId) => {
    if (villeId === "tanger") {
      onExploreTanger();
    } else {
      alert("L'assistance par système Multi-Agents RAG est actuellement configurée pour la zone Tanger.");
    }
  };

  const filteredVilles = VILLES.filter(v =>
    v.nom.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ════════════════════════════════════════
          NAVBAR — logo seul, à gauche
      ════════════════════════════════════════ */}
      <nav style={{
  position:   "fixed", top: 0, zIndex: 100,
  width:      "100%",
  background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
  boxShadow:  scrolled ? "0 2px 20px rgba(15,23,42,0.09)" : "none",
  backdropFilter: scrolled ? "blur(10px)" : "none",
  transition: "background .4s, box-shadow .4s",
  padding:    "0 32px",
  height:     "64px",
  display:    "flex", alignItems: "center",
}}>
  <div>
    <span className="hg-nav-discover" style={{
      color: scrolled ? C.secondary : C.light,
      transition: "color .4s",
    }}>
      Discover Morocco
    </span>
    <span className="hg-nav-logo-main" style={{
      color: scrolled ? C.text : "#ffffff",
      transition: "color .4s",
    }}>
      MoroccoGuide
    </span>
    <span className="hg-nav-logo-ai" style={{
      color: scrolled ? C.secondary : C.light,
      transition: "color .4s",
    }}>
      AI
    </span>
  </div>
</nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", paddingTop: "64px" }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: `linear-gradient(160deg, rgba(15,118,110,.88) 0%, rgba(15,23,42,.72) 100%),
                       url('/src/assets/hero.png') center/cover no-repeat`,
        }} />

        {/* Animated bg circle */}
        <div className="hg-pulse" style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "540px", height: "540px", borderRadius: "50%",
          background: C.secondary, zIndex: 0, pointerEvents: "none",
        }} />

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: "760px", margin: "0 auto",
          padding: "120px 24px 100px", textAlign: "center",
        }}>
          <p className="hg-eyebrow" style={{
            color: C.light, fontSize: "12px", fontWeight: 600,
            letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 18px",
          }}>
            Tourisme Maroc — Decouverte Intelligente
          </p>

          <h1 className="hg-title" style={{
            fontSize: "clamp(40px,7vw,74px)", fontWeight: 800,
            color: "#fff", lineHeight: 1.1, margin: "0 0 20px",
            fontFamily: "'Playfair Display', Georgia, serif",
            textShadow: "0 2px 20px rgba(0,0,0,.3)",
          }}>
            Bienvenue au Maroc
          </h1>

          <p className="hg-sub" style={{
            color: "rgba(255,255,255,.82)", fontSize: "18px",
            lineHeight: 1.65, margin: "0 0 44px", fontWeight: 300,
          }}>
            Decouvrez un royaume de paysages a couper le souffle,<br />
            guide par l'intelligence artificielle.
          </p>

          {/* Search */}
          <div className="hg-search" style={{
            display: "flex", maxWidth: "540px", margin: "0 auto",
            background: "rgba(255,255,255,.97)", borderRadius: "50px",
            overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            padding: "6px 6px 6px 22px", alignItems: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke={C.muted} strokeWidth="2.2" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Ou souhaitez-vous aller ?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                flex: 1, border: "none", outline: "none",
                padding: "10px 14px", fontSize: "15px",
                color: C.text, background: "transparent",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button className="hg-search-btn">Rechercher</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hg-bob" style={{
          position: "absolute", bottom: "32px", left: "50%",
          zIndex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", gap: "6px",
          color: "rgba(255,255,255,.5)", fontSize: "10px", letterSpacing: "2px",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          DEFILER
        </div>
      </section>

      {/* Wave hero → stats */}
      <Wave topColor="transparent" bottomColor={C.primary} />

      {/* ════════════════════════════════════════
          STATS BAND
      ════════════════════════════════════════ */}
      <section style={{ background: C.primary, padding: "48px 24px" }}>
        <div style={{
          display: "flex", justifyContent: "center", gap: "40px",
          flexWrap: "wrap", maxWidth: "900px", margin: "0 auto",
        }}>
          {STATS.map(stat => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </section>

      {/* Wave stats → bg */}
      <Wave topColor={C.primary} bottomColor={C.bg} />

      {/* ════════════════════════════════════════
          CATEGORIES
      ════════════════════════════════════════ */}
      <section style={{ padding: "68px 24px 52px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{
            color: C.secondary, fontWeight: 600, fontSize: "11px",
            letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 12px",
          }}>
            Explorer par categorie
          </p>
          <h2 style={{
            fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Tout ce que le Maroc vous offre
          </h2>
        </div>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <div key={cat.slug} className="hg-cat-pill">{cat.label}</div>
          ))}
        </div>
      </section>

      {/* Thin wave */}
      <div style={{ lineHeight: 0, background: C.bg }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "48px" }}>
          <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill={C.light + "88"} />
        </svg>
      </div>

      {/* ════════════════════════════════════════
          DESTINATIONS GRID
      ════════════════════════════════════════ */}
      <section style={{ background: C.bg, padding: "16px 24px 96px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "44px", flexWrap: "wrap", gap: "14px",
          }}>
            <div>
              <p style={{
                color: C.secondary, fontWeight: 600, fontSize: "11px",
                letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 10px",
              }}>
                Nos destinations
              </p>
              <h2 style={{
                fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, margin: 0,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                Decouvrir les villes du Maroc
              </h2>
            </div>
            {query && (
              <span style={{ fontSize: "14px", color: C.muted }}>
                {filteredVilles.length} resultat{filteredVilles.length !== 1 ? "s" : ""} pour « {query} »
              </span>
            )}
          </div>

          {filteredVilles.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "26px",
            }}>
              {filteredVilles.map((ville, i) => (
                <VilleCard key={ville.id} ville={ville} onExplore={handleExplore} delay={i * 70} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "80px 24px",
              color: C.muted, borderRadius: "20px", background: C.bgAlt,
            }}>
              <p style={{ fontSize: "16px", margin: 0 }}>
                Aucune destination trouvee pour « {query} »
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Wave → CTA */}
      <div style={{ lineHeight: 0, background: C.bg }}>
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "72px" }}>
          <path d="M0,0 C480,72 960,0 1440,54 L1440,72 L0,72 Z" fill={C.primary} />
        </svg>
      </div>

      {/* ════════════════════════════════════════
          CTA BAND
      ════════════════════════════════════════ */}
      <section style={{ background: C.primary, padding: "72px 24px", textAlign: "center" }}>
        <div ref={ctaRef} className="hg-reveal">
          <p style={{
            color: C.light, fontSize: "11px", fontWeight: 600,
            letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 16px",
          }}>
            Pret a partir ?
          </p>
          <h2 style={{
            fontSize: "clamp(26px,4vw,42px)", fontWeight: 700,
            color: "#fff", margin: "0 0 30px",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Votre prochaine aventure commence ici
          </h2>
          <button className="hg-cta-btn" onClick={() => handleExplore("tanger")}>
            Explorer Tanger avec l'IA
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}