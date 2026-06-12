import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield, Phone, MapPin, Mail, Clock, Globe, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Info, Star, Building2, Ambulance,
  Activity, BarChart2, PieChart as PieChartIcon, Map, TrendingUp,
  BadgeAlert, HeartPulse, Scale, Briefcase, FileText, Users, Layers,
  Navigation, ShieldCheck, Siren, Hospital, Pill, BadgeDollarSign
} from "lucide-react";
import { AssuranceHeader } from "./SharedHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = "/api/assurance";

// ─── PALETTE ───────────────────────────────────────────────────────────────
const C = {
  teal:       "#0F7B6C",
  tealLight:  "#14B8A6",
  tealDark:   "#065F56",
  orange:     "#F97316",
  orangeLight:"#FED7AA",
  red:        "#EF4444",
  amber:      "#F59E0B",
  green:      "#22C55E",
  blue:       "#3B82F6",
  indigo:     "#6366F1",
  navy:       "#0F172A",
  gray50:     "#F8FAFC",
  gray100:    "#F1F5F9",
  gray200:    "#E2E8F0",
  gray400:    "#94A3B8",
  gray600:    "#475569",
  gray700:    "#334155",
  gray800:    "#1E293B",
  white:      "#FFFFFF",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────
const fetchJSON = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

const stars = (n) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={13}
      fill={i < Math.floor(n) ? C.amber : "none"}
      stroke={i < Math.floor(n) ? C.amber : C.gray400}
    />
  ));

const categoryColor = (cat) => {
  const m = {
    assureur_local_marocain:       { bg: "#DCFCE7", text: "#166534", label: "Assureur Local" },
    assureur_international:        { bg: "#DBEAFE", text: "#1E40AF", label: "Assureur International" },
    mutuelle_sante:                { bg: "#F3E8FF", text: "#6B21A8", label: "Mutuelle Santé" },
    assistance_voyage_specialisee: { bg: "#FEF3C7", text: "#92400E", label: "Assistance Spécialisée" },
  };
  return m[cat] || { bg: C.gray100, text: C.gray800, label: cat };
};

const urgencyIcon = (type) => {
  const icons = {
    commissariat:    <Shield size={22} color={C.blue} />,
    gendarmerie:     <ShieldCheck size={22} color={C.indigo} />,
    pompiers:        <Siren size={22} color={C.orange} />,
    samu:            <Ambulance size={22} color={C.red} />,
    hopital_public:  <Hospital size={22} color={C.teal} />,
    clinique_privee: <HeartPulse size={22} color={C.green} />,
    pharmacie:       <Pill size={22} color={C.amber} />,
    consulat:        <Globe size={22} color={C.gray600} />,
  };
  return icons[type] || <BadgeAlert size={22} color={C.teal} />;
};

const urgencyBg = (type) => {
  const bgs = {
    commissariat:    "#DBEAFE",
    gendarmerie:     "#EDE9FE",
    pompiers:        "#FFEDD5",
    samu:            "#FEE2E2",
    hopital_public:  "#CCFBF1",
    clinique_privee: "#DCFCE7",
    pharmacie:       "#FEF9C3",
    consulat:        "#F1F5F9",
  };
  return bgs[type] || "#F1F5F9";
};

const emergencyNumColor = (type) => {
  const c = { commissariat: C.blue, gendarmerie: C.indigo, pompiers: C.orange, samu: C.red };
  return c[type] || C.teal;
};

// ─── TYPE ICONS ────────────────────────────────────────────────────────────
const typeIcons = {
  voyage:                <Navigation size={24} color={C.teal} />,
  accident_corporel:     <Activity size={24} color={C.orange} />,
  hospitalisation:       <Hospital size={24} color={C.blue} />,
  rapatriement_medical:  <Ambulance size={24} color={C.red} />,
  rapatriement_corps:    <HeartPulse size={24} color={C.indigo} />,
  responsabilite_civile: <Scale size={24} color={C.amber} />,
  assistance_juridique:  <Briefcase size={24} color={C.green} />,
  multi_risques:         <Layers size={24} color="#8B5CF6" />,
};

// ─── SECTION HEADER — icône transparente avec bordure teal ────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "transparent",
      border: `1.5px solid ${C.teal}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 2,
    }}>
      {icon}
    </div>
    <div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.navy }}>{title}</h2>
      {subtitle && <p style={{ margin: "2px 0 0", fontSize: 13, color: C.gray600 }}>{subtitle}</p>}
    </div>
  </div>
);

// ─── INSURANCE CARD ───────────────────────────────────────────────────────
const InsuranceCard = ({ company }) => {
  const catStyle = categoryColor(company.categorie);
  const coverages = Object.entries(company.couvertures || {})
    .filter(([k, v]) => v === true)
    .map(([k]) =>
      k.replace(/_/g, " ")
       .replace("rapatriement medical", "Rapatriement médical")
       .replace("accident corporel", "Accident corporel")
       .replace("annulation voyage", "Annulation voyage")
       .replace("responsabilite civile", "Responsabilité civile")
       .replace("assistance juridique", "Assistance juridique")
       .replace("rapatriement corps", "Rapatriement corps")
    );

  return (
    <div
      style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12, transition: "box-shadow 0.2s", cursor: "default" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: C.gray100, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {company.image_url
            ? <img src={company.image_url} alt={company.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
            : <Building2 size={24} color={C.gray400} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{company.nom}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: catStyle.bg, color: catStyle.text }}>{catStyle.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            {stars(company.note_moyenne || 0)}
            <span style={{ fontSize: 12, fontWeight: 600, color: C.gray800, marginLeft: 4 }}>{company.note_moyenne}</span>
            <span style={{ fontSize: 11, color: C.gray400 }}>({company.avis_count} avis)</span>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {company.coordonnees?.adresse && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <MapPin size={13} color={C.teal} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.gray600 }}>{company.coordonnees.adresse}</span>
          </div>
        )}
        {company.coordonnees?.telephone_agence && (
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <Phone size={13} color={C.teal} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.gray600 }}>{company.coordonnees.telephone_agence}</span>
          </div>
        )}
        {company.coordonnees?.email_contact && (
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <Mail size={13} color={C.teal} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.gray600 }}>{company.coordonnees.email_contact}</span>
          </div>
        )}
        {company.horaires && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <Clock size={13} color={C.teal} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.gray600 }}>
              {company.horaires.lundi_vendredi ? `Lun-Ven: ${company.horaires.lundi_vendredi}` : ""}
              {company.horaires.samedi ? ` | Sam: ${company.horaires.samedi}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* 24h badge */}
      {company.permanence_urgence_24h && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEE2E2", color: C.red, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, width: "fit-content" }}>
          <AlertTriangle size={12} /> Permanence 24h
        </div>
      )}

      {/* Coverages */}
      {coverages.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.gray600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Couvertures</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {coverages.slice(0, 5).map(c => (
              <span key={c} style={{ fontSize: 11, padding: "3px 9px", background: C.gray100, color: C.gray800, borderRadius: 20, border: `1px solid ${C.gray200}` }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8, borderTop: `1px solid ${C.gray100}` }}>
        <div>
          <span style={{ fontSize: 11, color: C.gray400 }}>À partir de </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.orange }}>{company.tarif_journalier_moyen_mad}</span>
          <span style={{ fontSize: 11, color: C.gray400 }}> MAD/jour</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {company.coordonnees?.telephone_agence && (
            <a href={`tel:${company.coordonnees.telephone_agence.replace(/\s/g, "")}`}
               style={{ width: 34, height: 34, borderRadius: 8, background: `${C.teal}15`, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <Phone size={15} color={C.teal} />
            </a>
          )}
          {company.coordonnees?.site_web && (
            <a href={company.coordonnees.site_web} target="_blank" rel="noreferrer"
               style={{ width: 34, height: 34, borderRadius: 8, background: `${C.teal}15`, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <Globe size={15} color={C.teal} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── EMERGENCY SERVICE CARD ────────────────────────────────────────────────
const EmergencyServiceCard = ({ service }) => (
  <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: urgencyBg(service.type), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {urgencyIcon(service.type)}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 4 }}>{service.nom}</div>
      {service.description_fr && (
        <p style={{ fontSize: 12, color: C.gray600, margin: "0 0 8px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {service.description_fr}
        </p>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {service.telephone_local && (
          <a href={`tel:${service.telephone_local}`}
             style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: emergencyNumColor(service.type), color: C.white, borderRadius: 20, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            <Phone size={11} /> {service.telephone_local}
          </a>
        )}
        {service.urgences_24h && (
          <span style={{ fontSize: 11, padding: "4px 10px", background: "#DCFCE7", color: "#166534", borderRadius: 20, fontWeight: 600 }}>24h/24</span>
        )}
      </div>
    </div>
  </div>
);

// ─── SECURITY DASHBOARD ───────────────────────────────────────────────────
const SecurityDashboard = ({ securityScores, loading }) => {
  const chartRef       = useRef(null);
  const chartInstance  = useRef(null);
  const [filter, setFilter] = useState("all");

  const getBgColor     = (s) => s >= 85 ? "#22C55E30" : s >= 75 ? "#F59E0B30" : "#EF444430";
  const getBorderColor = (s) => s >= 85 ? "#16A34A"   : s >= 75 ? "#D97706"   : "#DC2626";

  const filteredScores = [...securityScores]
    .filter(s => {
      if (filter === "safe")     return s.security >= 85;
      if (filter === "moderate") return s.security >= 75 && s.security < 85;
      return true;
    })
    .sort((a, b) => b.security - a.security);

  useEffect(() => {
    if (loading || !chartRef.current || filteredScores.length === 0) return;
    if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: filteredScores.map(d => d.name),
        datasets: [{
          data: filteredScores.map(d => d.security),
          backgroundColor: filteredScores.map(d => getBgColor(d.security)),
          borderColor:     filteredScores.map(d => getBorderColor(d.security)),
          borderWidth: 2, borderRadius: 8, borderSkipped: false,
          categoryPercentage: 0.95, barPercentage: 0.85,
        }],
      },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        layout: { padding: { top: 0, bottom: 0, left: 0, right: 20 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw}% — ${ctx.raw >= 85 ? "Sûr" : ctx.raw >= 75 ? "Modéré" : "Attention"}` } },
        },
        scales: {
          x: {
            min: 55, max: 100,
            ticks: { callback: v => v + "%", font: { size: 11 }, color: "#94A3B8", stepSize: 5 },
            grid: { color: "#E2E8F040", drawTicks: false },
            border: { display: false },
          },
          y: { ticks: { font: { size: 10, weight: "300" }, color: "#525252", padding: 2 } },
        },
      },
    });

    return () => { if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; } };
  }, [filteredScores, loading]);

  const tabStyle = (active) => ({
    padding: "6px 14px", borderRadius: 20,
    border: `1px solid ${active ? "transparent" : C.gray200}`,
    background: active ? C.orange : "transparent",
    color: active ? C.white : C.gray600,
    fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
  });

  const BAR_HEIGHT  = 16;
  const chartHeight = Math.max(250, filteredScores.length * BAR_HEIGHT + 20);

  const totalSafe     = securityScores.filter(s => s.security >= 85).length;
  const totalModerate = securityScores.filter(s => s.security >= 75 && s.security < 85).length;
  const totalLow      = securityScores.filter(s => s.security < 75).length;
  const avgScore      = securityScores.length
    ? Math.round(securityScores.reduce((acc, s) => acc + s.security, 0) / securityScores.length)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Score moyen",   value: avgScore + "%", bg: C.gray100, color: C.navy    },
          { label: "Lieux sûrs",    value: totalSafe,      bg: "#DCFCE7", color: "#166534" },
          { label: "Lieux modérés", value: totalModerate,  bg: "#FEF3C7", color: "#92400E" },
          { label: "À surveiller",  value: totalLow,       bg: "#FEE2E2", color: "#991B1B" },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: card.color, opacity: 0.75, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {card.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart card */}
      <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 20, background: C.orange, borderRadius: 2, display: "inline-block" }} />
            Sécurité par Lieu Touristique
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ id: "all", label: "Tous" }, { id: "safe", label: "Sûr (85%+)" }, { id: "moderate", label: "Modéré" }].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={tabStyle(filter === tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 12, color: C.gray600 }}>
          {[
            { color: "#22C55E", label: "Sûr (≥85%)"      },
            { color: "#F59E0B", label: "Modéré (75–84%)"  },
            { color: "#EF4444", label: "Attention (<75%)" },
          ].map(l => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: "inline-block" }} />
              {l.label}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Chargement…</div>
        ) : filteredScores.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Aucun lieu dans cette catégorie.</div>
        ) : (
          <div style={{ position: "relative", width: "100%", height: chartHeight, minHeight: 200 }}>
            <canvas ref={chartRef} role="img" aria-label="Scores de sécurité des lieux touristiques de Tanger">
              Scores entre {Math.min(...filteredScores.map(s => s.security))}% et {Math.max(...filteredScores.map(s => s.security))}%.
            </canvas>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── EMERGENCY SERVICES CONTENT ───────────────────────────────────────────
const EmergencyServicesContent = () => {
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [loadingEmergency, setLoadingEmergency]   = useState(true);
  const [errorEmergency, setErrorEmergency]       = useState(null);
  const [selectedCategory, setSelectedCategory]   = useState("all");

  useEffect(() => { fetchEmergencyServices(); }, []);

  const fetchEmergencyServices = async () => {
    try {
      setLoadingEmergency(true);
      const response = await fetch("/api/assurance/emergency-services");
      if (!response.ok) throw new Error("Erreur réseau");
      const data = await response.json();
      setEmergencyServices(data.data || []);
      setErrorEmergency(null);
    } catch (err) {
      setErrorEmergency("Impossible de charger les services d'urgence");
    } finally {
      setLoadingEmergency(false);
    }
  };

  const getColorByType = (type) => {
    const colorMap = {
      hopital_public:  "#22C55E",
      clinique_privee: "#0EA5E9",
      pharmacie:       "#14B8A6",
      samu:            "#EF4444",
      commissariat:    "#F97316",
      gendarmerie:     "#F97316",
      pompiers:        "#EF4444",
      consulat:        "#0EA5E9",
    };
    return colorMap[type] || "#F97316";
  };

  const getIconByType = (type) => {
    switch (type) {
      case "hopital_public":
      case "clinique_privee": return <HeartPulse size={18} color={C.white} />;
      case "pharmacie":       return <Pill size={18} color={C.white} />;
      case "commissariat":
      case "gendarmerie":     return <Shield size={18} color={C.white} />;
      case "pompiers":        return <Siren size={18} color={C.white} />;
      case "samu":            return <Ambulance size={18} color={C.white} />;
      case "consulat":        return <Globe size={18} color={C.white} />;
      default:                return <Phone size={18} color={C.white} />;
    }
  };

  const getDescriptionByType = (type) => ({
    hopital_public:  "Hôpital public",
    clinique_privee: "Clinique privée",
    pharmacie:       "Pharmacie",
    commissariat:    "Police",
    gendarmerie:     "Gendarmerie",
    pompiers:        "Pompiers",
    samu:            "SAMU",
    consulat:        "Consulat",
  }[type] || "Service");

  const categories = ["all", ...new Set(emergencyServices.map(s => s.categorie || s.type))];

  const sortedServices = [...emergencyServices]
    .filter(s => selectedCategory === "all" || s.categorie === selectedCategory || s.type === selectedCategory)
    .sort((a, b) => {
      const priority = { samu: 0, pompiers: 1, commissariat: 2, gendarmerie: 3, hopital_public: 4, clinique_privee: 5, pharmacie: 6, consulat: 7 };
      return (priority[a.type] || 999) - (priority[b.type] || 999);
    });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "transparent",
      border: `1.5px solid ${C.orange}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Phone size={16} color={C.orange} />
    </div>
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>
        Numéros d'Urgence
      </h3>
      <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>
        Services disponibles à Tanger
      </p>
    </div>
  </div>
</div>

      {/* Filtres */}
      {categories.length > 1 && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8, overflowX: "auto", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${selectedCategory === cat ? "transparent" : C.gray200}`,
                background: selectedCategory === cat ? C.orange : "transparent",
                color: selectedCategory === cat ? C.white : C.gray600,
                fontSize: 12, fontWeight: selectedCategory === cat ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
              }}>
              {cat === "all" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Card services */}
      <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, overflow: "hidden" }}>
        {loadingEmergency ? (
          <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Chargement des services d'urgence…</div>
        ) : errorEmergency ? (
          <div style={{ textAlign: "center", padding: 40, color: C.red }}>{errorEmergency}</div>
        ) : sortedServices.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Aucun service trouvé.</div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", borderBottom: `1px solid ${C.gray100}` }}>
              <AlertTriangle size={16} color={C.orange} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                Services d'urgence ({sortedServices.length})
              </span>
            </div>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.orange}, ${C.red})`, margin: "0 18px 12px" }} />
            <div>
              {sortedServices.map((service, index) => (
                <div key={service.id || index}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px",
                    borderBottom: index < sortedServices.length - 1 ? `1px solid ${C.gray50}` : "none",
                    transition: "background-color 0.2s", cursor: "pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.gray50}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {/* Icon */}
<div style={{
  width: 40, height: 40, borderRadius: 10,
  background: "transparent",
  border: `1.5px solid ${getColorByType(service.type)}`,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
}}>
  {(() => {
    const color = getColorByType(service.type);
    switch (service.type) {
      case "hopital_public":
      case "clinique_privee": return <HeartPulse size={18} color={color} />;
      case "pharmacie":       return <Pill size={18} color={color} />;
      case "commissariat":
      case "gendarmerie":     return <Shield size={18} color={color} />;
      case "pompiers":        return <Siren size={18} color={color} />;
      case "samu":            return <Ambulance size={18} color={color} />;
      case "consulat":        return <Globe size={18} color={color} />;
      default:                return <Phone size={18} color={color} />;
    }
  })()}
</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{service.nom}</div>
                    <div style={{ fontSize: 11, color: C.gray400, marginBottom: 3 }}>{getDescriptionByType(service.type)}</div>
                    {service.urgences_24h && (
                      <div style={{ fontSize: 10, color: C.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.green }} />
                        Ouvert 24h/24
                      </div>
                    )}
                  </div>
                  <a href={`tel:${service.telephone_local || service.telephone_international}`}
                    style={{ fontSize: 15, fontWeight: 800, color: getColorByType(service.type), textDecoration: "none", flexShrink: 0, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "1";   e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    {service.telephone_local || service.numero_urgence_national || "N/A"}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!loadingEmergency && !errorEmergency && sortedServices.length > 0 && (
        <div style={{ marginTop: 16, padding: "12px 14px", background: C.gray50, borderRadius: 12, fontSize: 12, color: C.gray600, borderLeft: `3px solid ${C.orange}` }}>
          <strong>💡 Conseil :</strong> En cas d'urgence vitale, composez le numéro approprié ci-dessus. Gardez toujours votre numéro d'assurance à portée de main.
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function Assurance() {
  const [faqOpen, setFaqOpen]           = useState(null);
  const [insuranceTab, setInsuranceTab] = useState("all");
  const [companies, setCompanies]       = useState([]);
  const [securityScores, setSecurityScores] = useState([]);
  const [insuranceInfo, setInsuranceInfo]   = useState(null);
  const [safetyReport, setSafetyReport]     = useState(null);
  const [loading, setLoading] = useState({ companies: true, emergency: true, scores: true, info: true, report: true });
  const [error, setError]     = useState({});

  useEffect(() => {
    fetchJSON(`${API_BASE}/insurance-companies`)
      .then(d => setCompanies(d.data || []))
      .catch(() => setError(e => ({ ...e, companies: true })))
      .finally(() => setLoading(l => ({ ...l, companies: false })));

    fetchJSON(`${API_BASE}/security-scores`)
      .then(d => setSecurityScores(d.data || []))
      .catch(() => setError(e => ({ ...e, scores: true })))
      .finally(() => setLoading(l => ({ ...l, scores: false })));

    fetchJSON(`${API_BASE}/insurance-info`)
      .then(d => setInsuranceInfo(d.data))
      .catch(() => setError(e => ({ ...e, info: true })))
      .finally(() => setLoading(l => ({ ...l, info: false })));

    fetchJSON(`${API_BASE}/safety-report`)
      .then(d => setSafetyReport(d.data))
      .catch(() => setError(e => ({ ...e, report: true })))
      .finally(() => setLoading(l => ({ ...l, report: false })));
  }, []);

  const filteredCompanies = companies.filter(c => {
    if (insuranceTab === "all")           return true;
    if (insuranceTab === "local")         return c.categorie === "assureur_local_marocain";
    if (insuranceTab === "international") return c.categorie === "assureur_international";
    if (insuranceTab === "mutuelle")      return ["mutuelle_sante", "assistance_voyage_specialisee"].includes(c.categorie);
    return true;
  });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: C.gray50, minHeight: "100vh", color: C.navy }}>

      {/* HERO */}
      <AssuranceHeader />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 60px" }}>

        {/* ── COMPAGNIES ── */}
        <div id="companies" style={{ marginBottom: 40 }}>
          <SectionHeader
            icon={<Building2 size={22} color={C.teal} />}
            title="Compagnies d'Assurance"
            subtitle="Agences d'assurance à Tanger"
          />

          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 4, width: "fit-content" }}>
            {[
              { id: "all",           label: `Toutes (${companies.length})` },
              { id: "local",         label: `Locales (${companies.filter(c => c.categorie === "assureur_local_marocain").length})` },
              { id: "international", label: `Internationales (${companies.filter(c => c.categorie === "assureur_international").length})` },
              { id: "mutuelle",      label: `Mutuelles & Assistance (${companies.filter(c => ["mutuelle_sante","assistance_voyage_specialisee"].includes(c.categorie)).length})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setInsuranceTab(tab.id)}
                style={{ padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: insuranceTab === tab.id ? 600 : 400, background: insuranceTab === tab.id ? C.teal : "transparent", color: insuranceTab === tab.id ? C.white : C.gray600 }}>
                {tab.label}
              </button>
            ))}
          </div>

          {loading.companies ? (
            <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Chargement des compagnies…</div>
          ) : error.companies ? (
            <div style={{ textAlign: "center", padding: 40, color: C.red }}>Erreur de chargement des compagnies d'assurance.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {filteredCompanies.map(c => <InsuranceCard key={c.id} company={c} />)}
            </div>
          )}
        </div>

        {/* ── INSURANCE INFO ── */}
        <div id="assurance_info" style={{ marginBottom: 40 }}>
          <SectionHeader
            icon={<FileText size={22} color={C.teal} />}
            title="Comment fonctionne l'assurance au Maroc ?"
            subtitle="Guide complet pour les voyageurs"
          />

          {loading.info ? (
            <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Chargement…</div>
          ) : insuranceInfo ? (
            <>
              {/* Description + key points */}
              <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
                <p style={{ margin: "0 0 16px", fontSize: 14, color: C.gray600, lineHeight: 1.7 }}>{insuranceInfo.description}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(insuranceInfo.key_points || []).map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 12, background: C.gray50, borderRadius: 10 }}>
                      <CheckCircle size={16} color={C.teal} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: C.gray700, lineHeight: 1.5 }}>{pt.text || pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance types */}
              {insuranceInfo.insurance_types && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Types d'assurance disponibles</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {Object.entries(insuranceInfo.insurance_types).map(([key, desc]) => (
                      <div key={key} style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>{typeIcons[key] || <Shield size={24} color={C.teal} />}</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.navy, textTransform: "capitalize" }}>
                          {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div style={{ fontSize: 12, color: C.gray600, lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency steps */}
              {insuranceInfo.emergency_steps && (
                <div style={{ background: "#FFF7F0", border: "1px solid #FED7AA", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <AlertTriangle size={18} color={C.orange} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#C2410C" }}>Que faire en cas d'urgence ?</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {insuranceInfo.emergency_steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.orange, color: C.white, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 13, color: C.gray700, lineHeight: 1.5 }}>
                          {typeof step === "string" ? step.replace(/^\d+\.\s*/, "") : step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regulatory bodies */}
              {insuranceInfo.regulatory_bodies && (
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Organismes de régulation</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {Object.entries(insuranceInfo.regulatory_bodies).map(([key, org]) => (
                      <div key={key} style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: 18 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 4 }}>{org.name}</div>
                        <div style={{ fontSize: 12, color: C.gray600, marginBottom: 12 }}>{org.role}</div>
                        <div style={{ display: "flex", gap: 12 }}>
                          {org.website && (
                            <a href={org.website} target="_blank" rel="noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: "none" }}>
                              <Globe size={13} /> Site web
                            </a>
                          )}
                          {org.phone && (
                            <a href={`tel:${org.phone}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: "none" }}>
                              <Phone size={13} /> {org.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── DASHBOARD ── */}
        <div id="dashboard" style={{ marginBottom: 40 }}>
          <SectionHeader
            icon={<BarChart2 size={22} color={C.teal} />}
            title="Dashboard Sécurité Touristique"
            subtitle="Indicateurs analytiques en temps réel"
          />
          <SecurityDashboard securityScores={securityScores} loading={loading.scores} />
        </div>

      </div>

      {/* ── FAQ + NUMÉROS D'URGENCE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, maxWidth: 1200, margin: "0 auto 60px", padding: "0 32px" }}>

        {/* FAQ */}
        <div>
          <SectionHeader
            icon={<Info size={22} color={C.teal} />}
            title="Questions Fréquentes"
            
          />

          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderBottom: `1px solid ${C.gray100}` }}>
              <Info size={17} color={C.white} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Réponses aux questions les plus posées</span>
            </div>

            {loading.info ? (
              <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Chargement…</div>
            ) : !insuranceInfo?.faq_generale?.length ? (
              <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>FAQ non disponible.</div>
            ) : (
              insuranceInfo.faq_generale.map((faq, i) => {
                const isOpen = faqOpen === i;
                return (
                  <div key={i} style={{ borderBottom: i < insuranceInfo.faq_generale.length - 1 ? `1px solid ${C.gray100}` : "none" }}>
                    <button
                      onClick={() => setFaqOpen(isOpen ? null : i)}
                      style={{
                        width: "100%", padding: "14px 20px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        border: "none", background: isOpen ? C.gray50 : "transparent",
                        cursor: "pointer", textAlign: "left", gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 5,
                          background: C.teal, color: C.white,
                          fontSize: 11, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>T</div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{faq.question}</span>
                      </div>
                      {isOpen
                        ? <ChevronUp size={15} color={C.gray400} />
                        : <ChevronDown size={15} color={C.gray400} />
                      }
                    </button>

                    {isOpen && (
                      <div style={{ padding: "0 20px 14px 52px", fontSize: 13, color: C.gray600, lineHeight: 1.65 }}>
                        {faq.reponse_fr}
                        {faq.conseil && (
                          <div style={{
                            marginTop: 10, padding: "8px 12px",
                            background: "#EFF6FF",
                            borderLeft: `3px solid ${C.blue}`,
                            borderRadius: "0 8px 8px 0",
                            fontSize: 12, color: "#1E40AF",
                          }}>
                            💡 {faq.conseil}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* NUMÉROS D'URGENCE */}
        <div>
          <EmergencyServicesContent />
        </div>

      </div>

    </div>
  );
}