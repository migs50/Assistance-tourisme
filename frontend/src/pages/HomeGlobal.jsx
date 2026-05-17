/**
 * HomeGlobal.jsx
 * PAGE 1 — Accueil Maroc Tourisme (Version Grille Verticale avec Arrière-plan Réel)
 */
import { useState } from "react";
import NavbarGlobal from "../components/NavbarGlobal";
import Footer from "../components/Footer";

const COLORS = {
  blueNight: "#0A1F44",    
  blueLight: "#2C497F",    
  orange: "#E67E22",       
  textMuted: "#A0AEC0",    
};

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

function Stars({ note }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <span style={{ color: COLORS.orange, fontSize: "14px" }}>★</span>
      <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{note}</span>
    </div>
  );
}

function VilleCard({ ville, onExplore }) {
  return (
    <div style={{
      background:   COLORS.blueLight, 
      borderRadius: "16px",
      overflow:     "hidden",
      boxShadow:    ville.isMain ? `0 0 25px ${COLORS.orange}60` : "0 8px 24px rgba(0,0,0,0.3)",
      border:       ville.isMain ? `2.5px solid ${COLORS.orange}` : "2.5px solid transparent", 
      transition:   "transform 0.2s ease, box-shadow 0.2s ease",
      cursor:       "pointer",
      display:      "flex",
      flexDirection:"column",
      justifyContent:"space-between"
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        if(!ville.isMain) e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        if(!ville.isMain) e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
      }}
    >
      <div style={{
        height:     "180px",
        background: `url(${ville.imageUrl}) center/cover no-repeat, linear-gradient(135deg, #1e293b, #0f172a)`,
        position:   "relative",
      }}>
        {ville.isMain && (
          <div style={{
            position:     "absolute",
            top:          "12px",
            right:        "12px",
            background:   COLORS.orange,
            color:        "#fff",
            borderRadius: "20px",
            padding:      "4px 12px",
            fontSize:     "11px",
            fontWeight:   700,
            letterSpacing:"0.5px"
          }}>
            IA ACTIVÉE
          </div>
        )}
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 700, color: "#fff" }}>
              {ville.nom}
            </h3>
            <Stars note={ville.note} />
          </div>
          <p style={{
            margin: "0 0 20px",
            color: COLORS.textMuted,
            fontSize: "13.5px",
            lineHeight: 1.6,
          }}>
            {ville.description}
          </p>
        </div>

        <button
          onClick={() => onExplore(ville.id)}
          style={{
            background:   COLORS.orange, 
            border:       "none",
            borderRadius: "25px",
            color:        "#fff",
            padding:      "10px 0",
            width:        "100%",
            fontSize:     "14px",
            fontWeight:   700,
            cursor:       "pointer",
            transition:   "opacity 0.2s",
          }}
          onMouseEnter={e => e.target.style.opacity = "0.9"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >
          Explorer
        </button>
      </div>
    </div>
  );
}

export default function HomeGlobal({ onExploreTanger }) {
  const [query, setQuery] = useState("");

  const handleExplore = (villeId) => {
    if (villeId === "tanger") {
      onExploreTanger();
    } else {
      alert("L'assistance par système Multi-Agents RAG est actuellement configurée pour la zone Tanger.");
    }
  };

  const filteredVilles = VILLES.filter(ville =>
    ville.nom.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      minHeight:  "100vh",
      background: COLORS.blueNight, 
      fontFamily: "'Segoe UI', sans-serif",
      color:      "#fff"
    }}>
      {/* ── Hero section avec l'image de fond Kasbah Maroc ── */}
      <div style={{
        background:   `linear-gradient(rgba(10, 31, 68, 0.4), rgba(10, 31, 68, 0.9)), url('/src/assets/hero.png') center/cover no-repeat`, 
        padding:      "120px 24px 80px 24px",
        textAlign:    "center",
      }}>
        <h1 style={{ fontSize: "52px", fontWeight: 800, margin: "0 0 16px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
          Bienvenue au Maroc
        </h1>
        <p style={{ color: "#E2E8F0", fontSize: "19px", margin: "0 0 36px", fontWeight: 400 }}>
          Découvrez un royaume de paysages à couper le souffle et de culture riche
        </p>

        {/* Moteur de Recherche */}
        <div style={{
          display:      "flex",
          maxWidth:     "600px",
          margin:       "0 auto",
          background:   "#fff",
          borderRadius: "30px", 
          overflow:     "hidden",
          boxShadow:    "0 10px 30px rgba(0,0,0,0.5)",
          padding:      "4px 6px"
        }}>
          <input
            type="text"
            placeholder="Où souhaitez-vous aller ?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex:       1,
              border:     "none",
              outline:    "none",
              padding:    "12px 22px",
              fontSize:   "15px",
              color:      "#1e293b",
            }}
          />
          <button style={{
            background:   COLORS.orange,
            border:       "none",
            borderRadius: "25px",
            padding:      "12px 30px",
            color:        "#fff",
            fontWeight:   700,
            fontSize:     "15px",
            cursor:       "pointer",
          }}>
            Rechercher
          </button>
        </div>
      </div>

      {/* ── Section Villes (Verticale / Grille Responsive) ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px 100px 24px" }}>
        <h2 style={{
          textAlign:    "center",
          fontSize:     "24px",
          fontWeight:   800,
          color:        "#fff",
          letterSpacing:"1.5px",
          marginBottom: "45px",
        }}>
          DÉCOUVRIR LES DESTINATIONS
        </h2>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap:                 "32px",
        }}>
          {filteredVilles.map(ville => (
            <VilleCard
              key={ville.id}
              ville={ville}
              onExplore={handleExplore}
            />
          ))}
        </div>
        
        {filteredVilles.length === 0 && (
          <p style={{ textAlign: "center", color: COLORS.textMuted, marginTop: "40px", fontSize: "15px" }}>
            Aucune destination trouvée pour cette recherche.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}