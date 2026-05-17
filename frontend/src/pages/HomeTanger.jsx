/**
 * HomeTanger.jsx — VERSION FINALE
 * Avec onglets : Accueil | Recommandation | Activités | Événements | Dashboard
 */
import { useState } from "react";
import NavbarTanger from "../components/NavbarTanger";
import Footer       from "../components/Footer";

// ── Données lieux ─────────────────────────────────────────────────────────────
const LIEUX = [
  {
    id:          "kasbah",
    nom:         "Kasbah de Tanger",
    categorie:   "Patrimoine",
    description: "Forteresse historique dominant la mer, la Kasbah abrite le musée des Arts marocains et des jardins andalous secrets.",
    note:        4.8,
    imageUrl:    "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600",
    badge:       "Incontournable",
  },
  {
    id:          "medina",
    nom:         "Médina de Tanger",
    categorie:   "Culture",
    description: "Labyrinthe de ruelles animées, de souks colorés et de maisons blanches aux portes bleues chargées d'histoire.",
    note:        4.7,
    imageUrl:    "https://images.unsplash.com/photo-1548018560-c7196548aba4?w=600",
  },
  {
    id:          "cap-spartel",
    nom:         "Cap Spartel",
    categorie:   "Nature",
    description: "Point de rencontre mythique entre l'Atlantique et la Méditerranée, avec son phare emblématique et ses vues spectaculaires.",
    note:        4.9,
    imageUrl:    "https://images.unsplash.com/photo-1553603227-2358aabe821e?w=600",
    badge:       "Vue imprenable",
  },
  {
    id:          "grottes-hercule",
    nom:         "Grottes d'Hercule",
    categorie:   "Nature",
    description: "Cavernes mystérieuses creusées par la mer et l'homme depuis des millénaires, ouvertes sur l'océan Atlantique.",
    note:        4.6,
    imageUrl:    "https://images.unsplash.com/photo-1549924231-f129b911e442?w=600",
  },
  {
    id:          "plage-malabata",
    nom:         "Plage de Malabata",
    categorie:   "Plage",
    description: "Grande plage dorée en croissant avec vue sur le détroit de Gibraltar et les côtes espagnoles en toile de fond.",
    note:        4.5,
    imageUrl:    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
  },
  {
    id:          "marshan",
    nom:         "Quartier Marshan",
    categorie:   "Promenade",
    description: "Quartier résidentiel calme offrant des panoramas à 180° sur le détroit, idéal pour une promenade au coucher du soleil.",
    note:        4.4,
    imageUrl:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
  },
];

// ── Composants utilitaires ────────────────────────────────────────────────────
function Stars({ note }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <span style={{ color: "#f97316", fontSize: "14px" }}>★</span>
      <span style={{ color: "#f97316", fontWeight: 700, fontSize: "13px" }}>{note}</span>
    </div>
  );
}

function LieuCard({ lieu, onExplore }) {
  return (
    <div style={{
      background:   "#112240",
      borderRadius: "16px",
      overflow:     "hidden",
      border:       "1px solid #1e3a5f",
      boxShadow:    "0 4px 20px rgba(0,0,0,0.3)",
      transition:   "transform 0.2s, box-shadow 0.2s",
      cursor:       "pointer",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
        e.currentTarget.style.borderColor = "#f97316";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
        e.currentTarget.style.borderColor = "#1e3a5f";
      }}
    >
      <div style={{
        height:     "200px",
        background: `url(${lieu.imageUrl}) center/cover no-repeat, #1e3a5f`,
        position:   "relative",
      }}>
        <div style={{
          position: "absolute", top: "12px", left: "12px",
          background: "rgba(13,27,42,0.85)", color: "#94a3b8",
          borderRadius: "20px", padding: "3px 10px",
          fontSize: "11px", fontWeight: 600, border: "1px solid #1e3a5f",
        }}>
          {lieu.categorie}
        </div>
        {lieu.badge && (
          <div style={{
            position: "absolute", top: "12px", right: "12px",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff", borderRadius: "20px",
            padding: "3px 10px", fontSize: "11px", fontWeight: 700,
          }}>
            {lieu.badge}
          </div>
        )}
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>
            {lieu.nom}
          </h3>
          <Stars note={lieu.note} />
        </div>
        <p style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>
          {lieu.description}
        </p>
        <button onClick={() => onExplore(lieu)} style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          border: "none", borderRadius: "10px", color: "#fff",
          padding: "9px 0", width: "100%", fontSize: "13px",
          fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
          boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
        }}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >
          Explorer
        </button>
      </div>
    </div>
  );
}

// ── Sections des onglets ──────────────────────────────────────────────────────

function SectionAccueil({ onOpenChat }) {
  return (
    <>
      {/* Hero */}
      <div style={{
        height:         "380px",
        background:     `linear-gradient(180deg, rgba(13,27,42,0.5) 0%, rgba(13,27,42,0.95) 100%),
                         url(https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1400) center/cover no-repeat`,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        textAlign:      "center",
        padding:        "0 24px",
      }}>
        <div style={{
          background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: "20px", padding: "4px 16px",
          fontSize: "12px", color: "#f97316", fontWeight: 600, marginBottom: "16px",
        }}>
          🤖 Assistance IA disponible
        </div>
        <h1 style={{ fontSize: "42px", fontWeight: 900, margin: "0 0 12px", color: "#f1f5f9", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          Découvrez Tanger 🇲🇦
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "17px", margin: "0 0 28px", maxWidth: "500px" }}>
          Porte de l'Afrique, là où la Méditerranée rencontre l'Atlantique
        </p>
        <div style={{ display: "flex", gap: "40px" }}>
          {[
            { n: "626", label: "lieux indexés" },
            { n: "4",   label: "agents IA" },
            { n: "11",  label: "catégories" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#f97316" }}>{s.n}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grille lieux */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{
          textAlign: "center", fontSize: "24px", fontWeight: 800,
          color: "#f1f5f9", marginBottom: "8px", letterSpacing: "1px",
        }}>
          LIEUX INCONTOURNABLES
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "40px", fontSize: "14px" }}>
          Explorez les plus beaux endroits de Tanger
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}>
          {LIEUX.map(lieu => (
            <LieuCard key={lieu.id} lieu={lieu} onExplore={() => onOpenChat()} />
          ))}
        </div>

        {/* Bannière IA */}
        <div style={{
          marginTop: "60px",
          background: "linear-gradient(135deg, #0d2137, #112240)",
          border: "1px solid #f9731630", borderRadius: "16px",
          padding: "32px 40px", display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: "24px",
        }}>
          <div>
            <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "20px", margin: "0 0 8px" }}>
              Besoin d'aide pour planifier votre visite ?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              Notre assistant IA répond à toutes vos questions : hôtels, restaurants, transports, urgences…
            </p>
          </div>
          <button onClick={onOpenChat} style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            border: "none", borderRadius: "12px", color: "#fff",
            padding: "12px 28px", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
          }}>
            🤖 Ouvrir l'Assistant IA
          </button>
        </div>
      </div>
    </>
  );
}

function SectionRecom() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <h2 style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
        Recommandations IA
      </h2>
      <p style={{ color: "#64748b", fontSize: "14px" }}>
        Section recommandations — connectée au backend /api/recommend
      </p>
    </div>
  );
}

function SectionActivites() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <h2 style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
        Activités à Tanger
      </h2>
      <p style={{ color: "#64748b", fontSize: "14px" }}>
        Section activités — à compléter
      </p>
    </div>
  );
}

function SectionEvenements() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <h2 style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
        Événements à Tanger
      </h2>
      <p style={{ color: "#64748b", fontSize: "14px" }}>
        Section événements — à compléter
      </p>
    </div>
  );
}

function SectionDashboard() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <h2 style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
        Dashboard
      </h2>
      <p style={{ color: "#64748b", fontSize: "14px" }}>
        Section dashboard — statistiques et analyses
      </p>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function HomeTanger({ onBack, onOpenChat }) {
  const [activeTab, setActiveTab] = useState("accueil");

  return (
    <div style={{
      minHeight:  "100vh",
      background: "#0d1b2a",
      color:      "#f1f5f9",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <NavbarTanger
        onBack={onBack}
        onOpenChat={onOpenChat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "accueil"        && <SectionAccueil    onOpenChat={onOpenChat} />}
      {activeTab === "recommandation" && <SectionRecom      />}
      {activeTab === "activites"      && <SectionActivites  />}
      {activeTab === "evenements"     && <SectionEvenements />}
      {activeTab === "dashboard"      && <SectionDashboard  />}

      <Footer />
    </div>
  );
}