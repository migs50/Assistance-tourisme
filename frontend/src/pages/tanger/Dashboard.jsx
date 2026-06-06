/**
 * Dashboard.jsx — Tableau de bord d'analyse du tourisme à Tanger
 * PATCH : Card "Catégories touristiques par nombre" remplacée par
 *         "Hôtels par nombre d'étoiles" (endpoint /api/dashboard/charts/hotels-par-etoiles)
 */

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import {
  Hotel, UtensilsCrossed, Waves, Sparkles, Zap, CalendarDays,
  MapPin, Bus, TrendingUp, BarChart3, Map, Bot, Globe, Phone,
  Shield, ChevronDown, ChevronRight, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Clock, Accessibility, Star, Navigation, Layers,
  HelpCircle, Loader2, Building2, Users, Compass, Menu, X,
} from "lucide-react";
import { SectionHero, SectionHead, KPICard, ProgressBar, Spinner as Spin, ErrorBanner as ApiError } from "./SharedTanger";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API  = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TEAL = "#0d9488";
const BLUE = "#3b82f6";
const MINT = "#2dd4bf";
const NAVY = "#1d4ed8";
const PIE_COLORS = [TEAL, BLUE, MINT, "#6366f1", "#22d3ee"];

// ─── LEAFLET FIX ─────────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── HOOK useApi ─────────────────────────────────────────────────────────────
const UNWRAP_KEYS = [
  "data","results","items","list","records",
  "hotels","restaurants","plages","musees","activites",
  "evenements","lieux","transports","faq",
  "services","urgences","assurances","itineraires",
];

function unwrap(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const found = UNWRAP_KEYS.find(k => Array.isArray(raw[k]));
    if (found) return raw[found];
    const anyArr = Object.keys(raw).find(k => Array.isArray(raw[k]));
    if (anyArr) return raw[anyArr];
    return raw;
  }
  return raw;
}

export function useApi(path, fallback = null) {
  const [data,    setData]    = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`${API}${path}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(raw => {
        if (!alive) return;
        setData(unwrap(raw) ?? fallback);
        setLoading(false);
      })
      .catch(err => {
        if (!alive) return;
        console.error(`[useApi] ${path} →`, err.message);
        setError(err.message);
        setData(fallback);
        setLoading(false);
      });
    return () => { alive = false; };
  }, [path]);

  return { data, loading, error };
}

// ─── EMPTY ───────────────────────────────────────────────────────────────────
function Empty({ Icon: I = HelpCircle, label = "Aucune donnée disponible" }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"#9ca3af", fontSize:13 }}>
      <I size={32} color="#e5e7eb" style={{ margin:"0 auto 10px", display:"block" }} />
      {label}
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroHeader() {
  return (
    <SectionHero
      label={"Tanger"}
      title={"Tableau de bord d'analyse du tourisme"}
      subtitle={"Aperçus touristiques intelligents pour Tanger, Maroc"}
    />
  );
}

// ─── KPI ─────────────────────────────────────────────────────────────────────
const KPI_META = [
  { key:"hotels",      label:"Hôtels",              Icon:Hotel,           color:"#3b82f6" },
  { key:"restaurants", label:"Restaurants",          Icon:UtensilsCrossed, color:"#f97316" },
  { key:"plages",      label:"Plages",               Icon:Waves,           color:"#14b8a6" },
  { key:"musees",      label:"Musées",               Icon:Sparkles,        color:"#a855f7" },
  { key:"activites",   label:"Activités",            Icon:Zap,             color:"#ec4899" },
  { key:"evenements",  label:"Événements",           Icon:CalendarDays,    color:"#6366f1" },
  { key:"lieux",       label:"Lieux touristiques",   Icon:MapPin,          color:"#10b981" },
  { key:"transports",  label:"Transport",            Icon:Bus,             color:"#06b6d4" },
];

function KpiSection() {
  const { data, loading, error } = useApi("/api/dashboard/statistics", {});
  const s = (data && !Array.isArray(data)) ? data : {};
  return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={BarChart3} title="Indicateurs clés du tourisme" />
      {loading ? <Spin /> : error ? <ApiError path="/api/dashboard/statistics" /> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
          {KPI_META.map((m, i) => (
            <motion.div key={m.key}
              initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{delay:i*0.06, duration:.5}}
              whileHover={{y:-4, boxShadow:"0 12px 32px rgba(0,0,0,0.10)"}}
              style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9",
                boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
                padding:"24px 22px", position:"relative", cursor:"default" }}>
              <div style={{ width:52, height:52, borderRadius:14, background:m.color,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                <m.Icon size={24} color="#fff" fill="#fff" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize:36, fontWeight:800, color:"#111827",
                fontFamily:"'Outfit',sans-serif", lineHeight:1, marginBottom:6 }}>
                {Number(s[m.key] ?? 0)}
              </div>
              <div style={{ fontSize:14, color:"#6b7280", fontWeight:500 }}>{m.label}</div>
              <ChevronRight size={16} color="#d1d5db"
                style={{ position:"absolute", bottom:18, right:18 }} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
function AnalyticsSection() {
  const { data: stats,      loading:l1 } = useApi("/api/dashboard/statistics", {});
  const { data: budgetActivites, loading:l2 } = useApi("/api/dashboard/charts/budget-activites", []);
  const { data: evenements, loading:l3 } = useApi("/api/dashboard/evenements",  []);
  // ── NOUVEAU : données agrégées par étoiles depuis le backend ──────────────
  const { data: hotelsStars, loading:l4 } = useApi("/api/dashboard/charts/hotels-par-etoiles", []);

  const s = (stats && !Array.isArray(stats)) ? stats : {};
  const pieData = [
    { name:"Hôtels",      value:Number(s.hotels      ?? 0) },
    { name:"Restaurants", value:Number(s.restaurants ?? 0) },
    { name:"Plages",      value:Number(s.plages      ?? 0) },
    { name:"Musées",      value:Number(s.musees      ?? 0) },
    { name:"Activités",   value:Number(s.activites   ?? 0) },
  ].filter(d => d.value > 0);

  const months = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];
  const evMap  = Object.fromEntries(months.map(m => [m, 0]));
  if (Array.isArray(evenements)) {
    evenements.forEach(e => {
      const raw = e.date || e.Date || e.date_debut || e.dateDebut || "";
      const idx = new Date(raw).getMonth();
      if (!isNaN(idx)) evMap[months[idx]]++;
    });
  }
  const lineData = months.map(m => ({ month:m, events:evMap[m] }));


// AJOUTER
const budgetData = Array.isArray(budgetActivites)
  ? [...budgetActivites]
      .sort((a, b) => b.prix - a.prix)
      .slice(0, 15)
      .map(a => ({
        name: (a.name || a.nom || "—").slice(0, 26),
        fullName: a.name || a.nom || "—",
        prix: Math.round(a.prix || 0),
      }))
  : [];

const budgetMax = budgetData.length > 0
  ? Math.max(...budgetData.map(d => d.prix))
  : 500;

const budgetColors = [
  "#0d9488","#0f766e","#14b8a6","#2dd4bf","#5eead4",
  "#0891b2","#0e7490","#06b6d4","#22d3ee","#67e8f9",
  "#3b82f6","#2563eb","#1d4ed8","#6366f1","#4f46e5",
];

  // ── Données étoiles déjà agrégées par le backend ─────────────────────────
  const starData = Array.isArray(hotelsStars) ? hotelsStars : [];

  // Couleurs par rang d'étoiles : 1★ gris, 2★ vert, 3★ bleu, 4★ or, 5★ teal
  const STAR_COLORS = ["#94a3b8", "#34d399", "#3b82f6", "#f59e0b", "#0d9488"];

  const card = (title, children) => (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9",
      boxShadow:"0 2px 8px rgba(0,0,0,0.05)", padding:"24px" }}>
      <h3 style={{ margin:"0 0 20px", fontSize:15, fontWeight:600,
        color:"#111827", fontFamily:"'Outfit',sans-serif" }}>{title}</h3>
      {children}
    </div>
  );

  if (l1 || l2 || l3 || l4) return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={TrendingUp} title="Aperçu analytique" /><Spin />
    </section>
  );

  return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={TrendingUp} title="Aperçu analytique" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        {/* ── Graphique 1 : Pie Distribution ── */}
        {card("Distribution des catégories touristiques",
          pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={115}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{fontSize:12,color:"#6b7280"}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty label="Aucune statistique disponible" />
        )}

        {/* ── Graphique 2 : Hôtels par nombre d'étoiles (NOUVEAU) ── */}
        {card("Hôtels par nombre d'étoiles",
          starData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={starData} barSize={42}
                margin={{ top:10, right:16, left:0, bottom:0 }}>
                <defs>
                  {[1,2,3,4,5].map((s, i) => (
                    <linearGradient key={s} id={`starGrad${s}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={STAR_COLORS[i]} stopOpacity={1} />
                      <stop offset="100%" stopColor={STAR_COLORS[i]} stopOpacity={0.55} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize:14, fill:"#374151", fontWeight:700,
                    fontFamily:"'Outfit',sans-serif" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize:11, fill:"#9ca3af" }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill:"rgba(249,250,251,0.8)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{
                        background:"#fff",
                        border:"1px solid #e5e7eb",
                        borderRadius:14,
                        padding:"12px 16px",
                        boxShadow:"0 8px 28px rgba(0,0,0,0.11)",
                        fontFamily:"'Outfit',sans-serif",
                        minWidth:190,
                      }}>
                        <div style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:8 }}>
                          {"★".repeat(d.stars)}
                          <span style={{ color:"#6b7280", fontWeight:500, fontSize:12, marginLeft:6 }}>
                            {d.stars} étoile{d.stars > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:7,
                          fontSize:13, color:"#4b5563", marginBottom:5 }}>
                          <Hotel size={13} color={STAR_COLORS[d.stars - 1]} strokeWidth={1.8} />
                          <span>
                            <b style={{ color:"#111827" }}>{d.count}</b>
                            {" "}hôtel{d.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:7,
                          fontSize:13, color:"#4b5563" }}>
                          <Star size={13} color="#f59e0b" fill="#f59e0b" strokeWidth={1.8} />
                          <span>
                            Prix moyen :{" "}
                            <b style={{ color: TEAL }}>
                              {d.avgPrice > 0 ? `${d.avgPrice} MAD/nuit` : "N/A"}
                            </b>
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" name="Hôtels" radius={[8,8,0,0]}>
                  {starData.map((d) => (
                    <Cell key={d.stars ?? d.name} fill={`url(#starGrad${d.stars})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty Icon={Hotel} label="Aucune donnée hôtelière disponible" />
        )}

        {/* ── Graphique 3 : Évolution des événements ── */}
        {card("Évolution des événements par mois",
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={TEAL} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="events" name="Événements"
                stroke={TEAL} strokeWidth={2.5} fill="url(#evGrad)"
                dot={false} activeDot={{r:5,fill:TEAL}} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* ── Graphique 4 : Popularité transport ── */}
        {card("Budget activités — Toutes les activités",
  budgetData.length > 0 ? (
    <ResponsiveContainer width="100%" height={Math.max(300, budgetData.length * 38)}>
      <BarChart
        data={budgetData}
        layout="vertical"
        barSize={22}
        margin={{ top: 0, right: 72, left: 0, bottom: 0 }}
      >
        <defs>
          {budgetColors.map((color, i) => (
            <linearGradient key={i} id={`budgetGrad${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, budgetMax * 1.1]}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${Math.round(v)} MAD`}
          tickCount={5}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={168}
          tick={{ fontSize: 11, fill: "#374151", fontFamily: "'Outfit',sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(249,250,251,0.8)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            const i = budgetData.findIndex(b => b.name === d.name);
            const color = budgetColors[i % budgetColors.length];
            return (
              <div style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: "12px 16px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.11)",
                fontFamily: "'Outfit',sans-serif",
                minWidth: 210,
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "#111827",
                  marginBottom: 4, lineHeight: 1.35
                }}>
                  {d.fullName}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginTop: 6
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 3,
                    background: color, flexShrink: 0
                  }} />
                  <span style={{ fontSize: 13, color: "#374151" }}>
                    Prix :{" "}
                    <b style={{ color, fontSize: 15 }}>
                      {d.prix > 0 ? `${d.prix} MAD` : "Gratuit"}
                    </b>
                  </span>
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="prix" name="Prix (MAD)" radius={[0, 8, 8, 0]}>
          {budgetData.map((_, i) => (
            <Cell key={i} fill={`url(#budgetGrad${i % budgetColors.length})`} />
          ))}
          <LabelList
            dataKey="prix"
            position="right"
            formatter={v => v > 0 ? `${v} MAD` : "Gratuit"}
            style={{
              fontSize: 11,
              fontWeight: 700,
              fill: TEAL,
              fontFamily: "'Outfit',sans-serif",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ) : <Empty Icon={Zap} label="Aucune donnée d'activités disponible" />
)}
      </div>
    </section>
  );
}
// ─── MAP ─────────────────────────────────────────────────────────────────────
function MapSection() {
  const { data: hotelsApi }  = useApi("/api/dashboard/hotels",      []);
  const { data: restApi }    = useApi("/api/dashboard/restaurants", []);
  const { data: plagesApi }  = useApi("/api/dashboard/plages",      []);
  const { data: museesApi }  = useApi("/api/dashboard/musees",      []);
  const { data: activApi }   = useApi("/api/dashboard/activites",   []);
  const { data: lieuxApi }   = useApi("/api/dashboard/lieux",       []);
  const { data: busApi }     = useApi("/api/dashboard/bus-stops",   []);

  const [activeCats, setActiveCats] = useState({
    hotels:true, restaurants:true, plages:true,
    musees:true, activites:true, lieux:true, bus:false,
  });
  const [busLineFilter, setBusLineFilter] = useState('');
  const mapRef          = useRef(null);
  const layerGroupsRef  = useRef({});

  const CATS = {
    hotels:      { label:"Hôtels",             Icon:Hotel,           color:"#3b82f6" },
    restaurants: { label:"Restaurants",         Icon:UtensilsCrossed, color:"#ef4444" },
    plages:      { label:"Plages",              Icon:Waves,           color:"#14b8a6" },
    musees:      { label:"Musées",              Icon:Sparkles,        color:"#a855f7" },
    activites:   { label:"Activités",           Icon:Zap,             color:"#ec4899" },
    lieux:       { label:"Lieux touristiques",  Icon:MapPin,          color:"#10b981" },
    bus:         { label:"Arrêts de bus",       Icon:Bus,             color:"#06b6d4" },
  };

  const datasets = {
    hotels:      Array.isArray(hotelsApi) ? hotelsApi : [],
    restaurants: Array.isArray(restApi)   ? restApi   : [],
    plages:      Array.isArray(plagesApi) ? plagesApi : [],
    musees:      Array.isArray(museesApi) ? museesApi : [],
    activites:   Array.isArray(activApi)  ? activApi  : [],
    lieux:       Array.isArray(lieuxApi)  ? lieuxApi  : [],
    bus:         Array.isArray(busApi)    ? busApi    : [],
  };

  const ICON_SVG_PATHS = {
    hotels: `
      <path d="M3 22V8l9-6 9 6v14" stroke="white" stroke-width="2"
        fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="9" y="14" width="6" height="8" fill="white" rx="1"/>
      <rect x="6" y="11" width="3" height="3" stroke="white"
        stroke-width="1.5" fill="none" rx="0.5"/>
      <rect x="15" y="11" width="3" height="3" stroke="white"
        stroke-width="1.5" fill="none" rx="0.5"/>`,
    restaurants: `
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"
        stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M7 2v20" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"
        stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    plages: `
      <path d="M17 18a5 5 0 0 0-10 0"
        stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      <line x1="12" y1="9" x2="12" y2="2"
        stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="m4.22 10.22 1.42 1.42M19.78 10.22l-1.42 1.42"
        stroke="white" stroke-width="2" stroke-linecap="round"/>
      <line x1="3" y1="21" x2="21" y2="21"
        stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    musees: `
      <path d="M3 22V11l9-9 9 9v11"
        stroke="white" stroke-width="2" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 22v-4a3 3 0 0 0-6 0v4"
        stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M2 22h20" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <rect x="9" y="9" width="2" height="4" fill="white" opacity="0.85" rx="0.3"/>
      <rect x="13" y="9" width="2" height="4" fill="white" opacity="0.85" rx="0.3"/>`,
    activites: `
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
        fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>`,
    evenements: `
      <rect x="3" y="4" width="18" height="18" rx="2"
        stroke="white" stroke-width="2" fill="none"/>
      <line x1="16" y1="2" x2="16" y2="6"
        stroke="white" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="2" x2="8" y2="6"
        stroke="white" stroke-width="2" stroke-linecap="round"/>
      <line x1="3" y1="10" x2="21" y2="10"
        stroke="white" stroke-width="2" stroke-linecap="round"/>
      <rect x="8" y="14" width="3" height="3" fill="white" opacity="0.9" rx="0.5"/>`,
    lieux: `
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"
        fill="white" opacity="0.95"/>
      <circle cx="12" cy="10" r="3" fill="__COLOR__"/>`,
    bus: `
      <rect x="3" y="6" width="18" height="13" rx="2"
        stroke="white" stroke-width="2" fill="none"/>
      <path d="M3 11h18" stroke="white" stroke-width="1.5" opacity="0.75"/>
      <path d="M8 6V4M16 6V4"
        stroke="white" stroke-width="2" stroke-linecap="round"/>
      <circle cx="8"  cy="17" r="1.3" fill="white"/>
      <circle cx="16" cy="17" r="1.3" fill="white"/>`,
  };

const mkIcon = (color, catKey) => {
  const rawPath = ICON_SVG_PATHS[catKey] || ICON_SVG_PATHS.lieux;
  const svgPath = rawPath.replace(/__COLOR__/g, color);
  const isBus   = catKey === 'bus';

  // Bus stops: tiny grey dot
  if (isBus) {
    return new L.DivIcon({
      html: `<div style="
        width:10px;height:10px;border-radius:50%;
        background:#9ca3af;border:1.5px solid #fff;
        box-shadow:0 1px 3px rgba(0,0,0,0.25);
      "></div>`,
      className:   '',
      iconSize:    [10, 10],
      iconAnchor:  [5, 5],
      popupAnchor: [0, -8],
    });
  }

  // Category markers: small Google Maps style circle (20px)
  const SIZE = 20;
  const ICON = 11;
  const OFF  = Math.floor((SIZE - ICON) / 2);

  return new L.DivIcon({
    html: `
      <div style="
        position:relative;width:${SIZE}px;height:${SIZE}px;
        filter:drop-shadow(0 2px 4px ${color}88);cursor:pointer;
      ">
        <div style="
          width:${SIZE}px;height:${SIZE}px;border-radius:50%;
          background:${color};
          border:2px solid rgba(255,255,255,0.95);
          box-shadow:0 2px 6px ${color}44;
        "></div>
        <svg viewBox="0 0 24 24" width="${ICON}" height="${ICON}"
          style="position:absolute;top:${OFF}px;left:${OFF}px;z-index:2;pointer-events:none;"
          xmlns="http://www.w3.org/2000/svg"
        >${svgPath}</svg>
      </div>`,
    className:   '',
    iconSize:    [SIZE, SIZE],
    iconAnchor:  [SIZE / 2, SIZE / 2],
    popupAnchor: [0, -(SIZE / 2 + 4)],
  });
};

  const mkCluster = (color) => (cluster) => {
    const n  = cluster.getChildCount();
    const sz = n < 10 ? 36 : n < 30 ? 44 : n < 100 ? 52 : 60;
    return new L.DivIcon({
      html: `
        <div style="
          width:${sz}px;height:${sz}px;border-radius:50%;
          background:${color};color:#fff;
          border:3px solid rgba(255,255,255,0.95);
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:${Math.round(sz*0.3)}px;
          box-shadow:0 4px 18px ${color}66,0 0 0 6px ${color}22;
          font-family:'Outfit',sans-serif;
        ">${n}</div>`,
      className: '', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2],
    });
  };

  const mkPopup = (item, catKey) => {
    const conf   = CATS[catKey];
    const color  = conf?.color  || '#0d9488';
    const label  = conf?.label  || catKey;
    const name   = item.nom  || item.name || '—';
    const desc   = (item.description_fr || item.description || '').slice(0, 120);
    const addr   = item.adresse || item.quartier || item.localisation || item.lieu || '';
    const img    = item.image_url || item.image || item.photo || '';
    const rating = parseFloat(item.note_moyenne || item.rating || item.note || 0);
    const lat    = item.latitude  || item.lat || '';
    const lng    = item.longitude || item.lng || '';
    const gmaps  = lat && lng
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : '';

    const catSvgPath  = (ICON_SVG_PATHS[catKey] || ICON_SVG_PATHS.lieux).replace(/__COLOR__/g, color);
    const iconSVGbadge = `<svg viewBox="0 0 24 24" width="13" height="13" style="flex-shrink:0" xmlns="http://www.w3.org/2000/svg">${catSvgPath}</svg>`;

    const extraHTML = (() => {
      switch (catKey) {
        case 'hotels':
          return (item.etoiles
            ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"/></svg><span>${'★'.repeat(Number(item.etoiles))} <b style="color:#374151">${item.etoiles} étoiles</b></span></div>` : '')
            + (item.prix_min ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><line x1="12" y1="1" x2="12" y2="23" stroke="${color}" stroke-width="1.9" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="${color}" stroke-width="1.9" fill="none" stroke-linecap="round"/></svg><span>À partir de <b style="color:${color}">${item.prix_min} MAD</b>/nuit</span></div>` : '');
        case 'restaurants':
          return (item.cuisine ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="${color}" stroke-width="1.8" fill="none"/><line x1="7" y1="7" x2="7.01" y2="7" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/></svg><span>${item.cuisine}</span></div>` : '')
            + (item.prix_moyen ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><line x1="12" y1="1" x2="12" y2="23" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg><span>Prix moyen : <b style="color:${color}">${item.prix_moyen} MAD</b></span></div>` : '');
        case 'activites':
          return (item.duree ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.8" fill="none"/><polyline points="12,6 12,12 16,14" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg><span>Durée : <b style="color:${color}">${item.duree}</b></span></div>` : '')
            + (item.prix != null ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><line x1="12" y1="1" x2="12" y2="23" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg><span>${item.prix == 0 ? '<b style="color:#10b981">Gratuit</b>' : `<b style="color:${color}">${item.prix} MAD</b>`}</span></div>` : '');
        case 'musees':
          return (item.prix_entree !== undefined ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><rect x="2" y="7" width="20" height="14" rx="2" stroke="${color}" stroke-width="1.8" fill="none"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="${color}" stroke-width="1.8" fill="none"/></svg><span>Entrée : <b style="color:${color}">${item.prix_entree == 0 ? 'Gratuite' : item.prix_entree + ' MAD'}</b></span></div>` : '')
            + (item.horaires ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.8" fill="none"/><polyline points="12,6 12,12 16,14" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg><span>${typeof item.horaires === 'object' ? Object.values(item.horaires)[0] : item.horaires}</span></div>` : '');
        case 'bus': {
          const raw      = item.lines || item.lignes || [];
          const linesArr = Array.isArray(raw) ? raw
            : (typeof raw === 'string' ? raw.split(/[-,;]/).map(l=>l.trim()).filter(Boolean) : []);
          return `<div class="pp-row" style="align-items:flex-start;gap:6px;">
            <svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg" style="margin-top:2px;flex-shrink:0"><rect x="3" y="6" width="18" height="13" rx="2" stroke="${color}" stroke-width="1.8" fill="none"/><path d="M3 11h18" stroke="${color}" stroke-width="1.5" opacity="0.7"/><circle cx="8" cy="17" r="1.2" fill="${color}"/><circle cx="16" cy="17" r="1.2" fill="${color}"/></svg>
            <div style="display:flex;flex-wrap:wrap;gap:4px;flex:1;">
              ${linesArr.length > 0
                ? linesArr.map(l=>`<span style="background:${color}15;color:${color};border:1px solid ${color}30;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;">${l}</span>`).join('')
                : `<span style="color:#9ca3af;font-style:italic;font-size:12px;">Non disponible</span>`}
            </div>
          </div>
          <div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.8" fill="none"/><polyline points="12,6 12,12 16,14" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg><span>06:00 – 22:30 &nbsp;·&nbsp; Opérateur : <b>ISSAL</b></span></div>`;
        }
        default:
          return item.categorie ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="${color}" stroke-width="1.8" fill="none"/></svg><span>${item.categorie}</span></div>` : '';
      }
    })();

    return `
      <div class="pp-wrap">
        <style>
          .pp-wrap{font-family:'Outfit','Segoe UI',sans-serif;width:290px;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.12);}
          .pp-hero{height:128px;position:relative;overflow:hidden;background:${img ? `url(${img}) center/cover no-repeat` : `linear-gradient(135deg,${color}dd,${color}88)`};}
          .pp-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 60%);pointer-events:none;}
          .pp-badge{position:absolute;top:10px;left:10px;background:${color};color:#fff;font-size:10px;font-weight:700;padding:4px 10px 4px 7px;border-radius:20px;display:flex;align-items:center;gap:5px;z-index:2;box-shadow:0 2px 8px ${color}55;}
          .pp-rating{position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.4);backdrop-filter:blur(6px);color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:12px;z-index:2;}
          .pp-title{position:absolute;bottom:10px;left:12px;right:12px;color:#fff;font-weight:700;font-size:14px;line-height:1.35;text-shadow:0 1px 5px rgba(0,0,0,0.7);z-index:2;}
          .pp-body{padding:12px 14px 13px;}
          .pp-row{display:flex;align-items:center;gap:8px;font-size:12px;color:#4b5563;margin-bottom:6px;line-height:1.45;}
          .pp-svg{flex-shrink:0;}
          .pp-divider{height:1px;background:#f1f5f9;margin:9px 0;}
          .pp-actions{display:flex;gap:8px;}
          .pp-btn-ghost{flex:1;text-align:center;padding:8px 0;background:#f8fafc;color:#374151;border-radius:10px;font-size:11px;font-weight:600;text-decoration:none;display:block;border:1px solid #e5e7eb;}
          .pp-btn-main{flex:2;padding:8px 0;background:${color};color:#fff;border:none;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;box-shadow:0 3px 12px ${color}44;}
        </style>
        <div class="pp-hero">
          <div class="pp-badge">${iconSVGbadge} ${label}</div>
          ${rating > 0 ? `<div class="pp-rating">★ ${rating.toFixed(1)}</div>` : ''}
          <div class="pp-title">${name}</div>
        </div>
        <div class="pp-body">
          ${addr ? `<div class="pp-row"><svg viewBox="0 0 24 24" width="13" height="13" class="pp-svg"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" stroke="${color}" stroke-width="1.8" fill="none"/><circle cx="12" cy="10" r="3" stroke="${color}" stroke-width="1.8" fill="none"/></svg><span>${addr}</span></div>` : ''}
          ${extraHTML}
          ${desc && catKey !== 'bus' ? `<div class="pp-divider"></div><div style="font-size:12px;color:#6b7280;line-height:1.65;margin-bottom:8px;">${desc}${desc.length >= 120 ? '…' : ''}</div>` : ''}
          <div class="pp-divider"></div>
          <div class="pp-actions">
            ${gmaps ? `<a href="${gmaps}" target="_blank" rel="noreferrer" class="pp-btn-ghost">↗ Maps</a>` : ''}
            <button class="pp-btn-main">Plus d'infos →</button>
          </div>
        </div>
      </div>`;
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(layerGroupsRef.current).forEach(g => {
      try { if (map.hasLayer(g)) map.removeLayer(g); } catch {}
    });
    layerGroupsRef.current = {};

    Object.entries(CATS).forEach(([catKey, conf]) => {
      if (!activeCats[catKey]) return;
      const items = datasets[catKey] || [];
      if (!items.length) return;

      let group;
      try {
        group = L.markerClusterGroup({
          maxClusterRadius:50, spiderfyOnMaxZoom:true,
          showCoverageOnHover:false,
          iconCreateFunction: mkCluster(conf.color),
        });
      } catch { group = L.layerGroup(); }

      const itemsToShow = catKey === 'bus' && busLineFilter
        ? items.filter(item => {
            const lines = item.lignes || item.lines || item.numero_lignes;
            if (Array.isArray(lines)) return lines.includes(busLineFilter);
            if (typeof lines === 'string')
              return lines.split(/[;,]/).map(s=>s.trim()).includes(busLineFilter);
            return false;
          })
        : items;

      itemsToShow.forEach(item => {
        const lat = parseFloat(item.latitude ?? item.lat ?? 0);
        const lng = parseFloat(item.longitude ?? item.lng ?? item.lon ?? 0);
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
        const marker = L.marker([lat, lng], { icon: mkIcon(conf.color, catKey) });
        marker.bindPopup(mkPopup(item, catKey), {
          maxWidth:280, minWidth:260, className:"dash-popup",
        });
        group.addLayer(marker);
      });

      group.addTo(map);
      layerGroupsRef.current[catKey] = group;
    });
  }, [datasets, activeCats, busLineFilter]);

  useEffect(() => {
    const id = "dash-map-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .dash-popup .leaflet-popup-content-wrapper{
        border-radius:16px!important;padding:0!important;
        box-shadow:0 12px 40px rgba(0,0,0,0.18)!important;
        overflow:hidden!important;border:none!important;}
      .dash-popup .leaflet-popup-content{margin:0!important;width:auto!important;}
      .dash-popup .leaflet-popup-tip-container{display:none!important;}
      .dash-popup .leaflet-popup-close-button{
        color:#fff!important;font-size:18px!important;
        top:6px!important;right:8px!important;z-index:10!important;}
    `;
    document.head.appendChild(s);
  }, []);

  const totalVisible = Object.entries(activeCats)
    .filter(([,v]) => v)
    .reduce((sum,[k]) => sum + (datasets[k]||[]).filter(i => {
      const la = parseFloat(i.latitude??i.lat??0);
      const lo = parseFloat(i.longitude??i.lng??0);
      return la && lo && !isNaN(la) && !isNaN(lo);
    }).length, 0);

  return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={Map} title="Carte touristique interactive" />
      <div style={{ background:"#fff", borderRadius:20, border:"1px solid #f1f5f9",
        boxShadow:"0 4px 24px rgba(0,0,0,0.07)", overflow:"hidden" }}>

        <div style={{ padding:"12px 18px", display:"flex", gap:8, flexWrap:"wrap",
          borderBottom:"1px solid #f3f4f6", alignItems:"center",
          background:"linear-gradient(180deg,#fafbfc,#fff)" }}>
          {Object.entries(CATS).map(([k, v]) => {
            const on  = activeCats[k];
            const cnt = (datasets[k]||[]).filter(i => {
              const la = parseFloat(i.latitude??i.lat??0);
              const lo = parseFloat(i.longitude??i.lng??0);
              return la && lo && !isNaN(la) && !isNaN(lo);
            }).length;
            return (
              <button key={k} onClick={() => setActiveCats(p=>({...p,[k]:!p[k]}))}
                style={{ display:"flex", alignItems:"center", gap:6,
                  padding:"6px 12px", borderRadius:20, cursor:"pointer",
                  border:`1.5px solid ${on ? v.color : "#e5e7eb"}`,
                  background: on ? v.color+"15" : "transparent",
                  color: on ? v.color : "#9ca3af",
                  fontSize:12, fontWeight:600, transition:"all .2s",
                  fontFamily:"'Outfit',sans-serif",
                  boxShadow: on ? `0 2px 8px ${v.color}22` : "none" }}>
                <v.Icon size={13} strokeWidth={1.5} />
                {v.label}
                {cnt > 0 && (
                  <span style={{ background: on ? v.color : "#e5e7eb",
                    color: on ? "#fff" : "#9ca3af",
                    fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10, marginLeft:2 }}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
          {activeCats.bus && (
            <select value={busLineFilter} onChange={e=>setBusLineFilter(e.target.value)}
              style={{ marginLeft:8, padding:"4px 8px", borderRadius:4,
                border:"1px solid #e5e7eb", fontSize:12, fontFamily:"'Outfit',sans-serif" }}>
              <option value="">Toutes les lignes</option>
              {Array.from(new Set((datasets.bus||[]).flatMap(item => {
                const lines = item.lignes||item.lines||item.numero_lignes;
                if (Array.isArray(lines)) return lines;
                if (typeof lines==='string') return lines.split(/[;,]/).map(s=>s.trim()).filter(Boolean);
                return [];
              }))).map(line => <option key={line} value={line}>{line}</option>)}
            </select>
          )}
          <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af",
            fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:4 }}>
            <Layers size={12} /> {totalVisible} lieux
          </span>
        </div>

        <MapContainer center={[35.78,-5.81]} zoom={13}
          style={{ height:520, width:"100%" }}
          scrollWheelZoom zoomControl
          whenReady={e => { mapRef.current = e.target; }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        </MapContainer>
      </div>
    </section>
  );
}

// ─── AI INSIGHTS ─────────────────────────────────────────────────────────────
function AIInsightsSection() {
  const { data: lieux,       loading:l1 } = useApi("/api/dashboard/lieux",       []);
  const { data: plages,      loading:l2 } = useApi("/api/dashboard/plages",      []);
  const { data: restaurants, loading:l3 } = useApi("/api/dashboard/restaurants", []);
  const { data: activites,   loading:l4 } = useApi("/api/dashboard/activites",   []);

  const getName   = o => o?.nom||o?.name||o?.titre||o?.title||"—";
  const getCat    = o => o?.categorie||o?.category||o?.type||o?.cuisine||o?.specialite||"";
  const getRating = o => {
    const v = parseFloat(o?.note??o?.note_moyenne??o?.rating??o?.evaluation??o?.score??0);
    return v > 0 ? v : null;
  };
  const getPrice = o => {
    const raw = o?.prix??o?.price??o?.tarif??o?.cout??o?.prix_entree??null;
    if (raw === null) return null;
    const str = String(raw).toLowerCase().trim();
    if (!str||str==="0"||str==="gratuit"||str==="free") return "Gratuit";
    const num = parseFloat(str.replace(/[^\d.]/g,""));
    return isNaN(num) ? str : `${num} MAD`;
  };
  const getDur = o => o?.duree||o?.duration||"";

  const toItems = arr =>
    (Array.isArray(arr)?arr:[]).slice(0,5).map(o=>({
      name:getName(o), sub:getCat(o),
      rating:getRating(o), price:getPrice(o),
    }));

  const PANELS = [
    { title:"Principales destinations touristiques", PanelIcon:MapPin,          items:toItems(lieux) },
    { title:"Meilleures plages",                     PanelIcon:Waves,           items:toItems(plages) },
    { title:"Restaurants célèbres",                  PanelIcon:UtensilsCrossed, items:toItems(restaurants) },
    { title:"Activités recommandées",                PanelIcon:Zap,
      items:(Array.isArray(activites)?activites:[]).slice(0,5).map(o=>({
        name:getName(o),
        sub:`${getCat(o)}${getDur(o)?" · "+getDur(o):""}`,
        rating:getRating(o), price:getPrice(o),
      })),
    },
  ];

  if (l1||l2||l3||l4) return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={Bot} title="Informations touristiques IA" /><Spin />
    </section>
  );

  return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={Bot} title="Informations touristiques IA" />
      <div style={{ background:"linear-gradient(135deg,rgba(13,148,136,0.06),rgba(59,130,246,0.04))",
        borderRadius:20, padding:20, border:"1px solid rgba(13,148,136,0.15)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {PANELS.map(({ title, PanelIcon, items }, pi) => (
            <div key={pi} style={{ background:"#374151", borderRadius:16,
              padding:"20px", border:"1px solid #4b5563" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <span style={{ display:"flex", alignItems:"center", gap:5,
                  background:"rgba(13,148,136,0.3)", border:"1px solid rgba(13,148,136,0.5)",
                  borderRadius:20, padding:"3px 10px",
                  fontSize:11, fontWeight:600, color:TEAL }}>
                  <Bot size={10} strokeWidth={2.5} /> Sélection IA
                </span>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <PanelIcon size={15} color="#f9fafb" strokeWidth={1.5} />
                  <h3 style={{ margin:0, fontSize:15, fontWeight:700,
                    color:"#f9fafb", fontFamily:"'Outfit',sans-serif" }}>{title}</h3>
                </div>
              </div>
              {items.length===0
                ? <Empty label="Données non disponibles" />
                : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8,
                    maxHeight:320, overflowY:"auto",
                    scrollbarWidth:"thin", scrollbarColor:"#4b5563 transparent" }}>
                    {items.map((item,i) => (
                      <motion.div key={i}
                        initial={{opacity:0,x:-8}} whileInView={{opacity:1,x:0}}
                        viewport={{once:true}} transition={{delay:i*0.05}}
                        style={{ background:"#4b5563", borderRadius:10,
                          padding:"12px 14px", border:"1px solid #6b7280" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                          <span style={{ width:24, height:24, borderRadius:6,
                            background:"rgba(255,255,255,0.1)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:11, fontWeight:800, color:"#d1d5db", flexShrink:0 }}>{i+1}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:"#f9fafb",
                              fontFamily:"'Outfit',sans-serif",
                              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                              {item.name}
                            </div>
                            {item.sub && (
                              <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>
                                {item.sub}
                              </div>
                            )}
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:5 }}>
                              {item.rating && (
                                <span style={{ display:"flex", alignItems:"center", gap:4,
                                  fontSize:12, color:"#fbbf24", fontWeight:600 }}>
                                  <Star size={11} fill="#fbbf24" color="#fbbf24" />
                                  {item.rating.toFixed(1)}
                                </span>
                              )}
                              {item.price && (
                                <span style={{ fontSize:11,
                                  color: item.price==="Gratuit" ? "#34d399" : "#9ca3af",
                                  fontWeight: item.price==="Gratuit" ? 600 : 400 }}>
                                  {item.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TRANSPORT ───────────────────────────────────────────────────────────────
function TransportSection() {
  const { data, loading, error } = useApi("/api/dashboard/transport", {});

  if (loading) return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={Bus} title="Analyse du transport" /><Spin />
    </section>
  );
  if (error) return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={Bus} title="Analyse du transport" />
      <ApiError path="/api/dashboard/transport" />
    </section>
  );

  const list = Array.isArray(data) ? data
    : Array.isArray(data?.transports) ? data.transports : [];

  const fmtPrice = t => {
    const id   = (t.id||"").toUpperCase();
    const type = (t.type||"").toLowerCase();
    if (id==="TR001"||type==="bus")              return { main:"4 ou 5 MAD",              sub:null };
    if (id==="TR002"||type==="petit_taxi")        return { main:"~10 à 50 MAD",            sub:"Selon la distance" };
    if (id==="TR003"||type==="grand_taxi")        return { main:"5 à 10 MAD / place",      sub:"Selon la destination" };
    if (id==="TR004"||type==="navette_aeroport")  return { main:"40 MAD",                  sub:null };
    if (id==="TR005")                             return { main:"À partir de 49 MAD",      sub:"Selon la destination" };
    if (id==="TR007"||(type==="train"&&id!=="TR005")) return { main:"~20 à 150 MAD",       sub:"Selon la destination" };
    if (id==="TR006"||type==="ferry")             return { main:"À partir de 300 MAD",     sub:"Selon la compagnie" };
    if (id==="TR008"||type==="vtc")               return { main:"~15 à 80 MAD",            sub:"Selon la distance" };
    if (id==="TR009"||type==="location_voiture")  return { main:"250 à 500 MAD / jour",    sub:"Selon le véhicule" };
    const base = t.tarif_base_mad, max = t.tarif_max_mad;
    if (base!==undefined&&base!==null) {
      const b=Number(base), m=max!==undefined&&max!==null?Number(max):null;
      if (b===0) return { main:t.tarif_note||null, sub:null };
      if (m&&m!==b&&m>0) return { main:`${b} à ${m} MAD`, sub:null };
      if (b>0) return { main:`${b} MAD`, sub:null };
    }
    return { main:t.tarif_note?String(t.tarif_note):null, sub:null };
  };

  const fmtHours = t => t.disponibilite||t.horaires||t.hours||t.schedule||"";

  const fmtFreq = t => {
    const id=(t.id||"").toUpperCase(), type=(t.type||"").toLowerCase();
    if (Array.isArray(t.lignes_principales)&&t.lignes_principales.length) {
      const freqs=t.lignes_principales.map(l=>l.frequence_min).filter(Boolean);
      if (freqs.length) { const avg=Math.round(freqs.reduce((a,b)=>a+b,0)/freqs.length); return `Toutes les ~${avg} min`; }
      return `${t.lignes_principales.length} lignes`;
    }
    if (Array.isArray(t.destinations)&&t.destinations.length) {
      const d=t.destinations[0]; if (d?.duree_min) return `Traversée ~${d.duree_min} min`;
    }
    if (id==="TR002"||type==="petit_taxi")       return "À la demande";
    if (id==="TR003"||type==="grand_taxi")        return "Au remplissage";
    if (id==="TR004"||type==="navette_aeroport")  return "Selon les vols";
    if (id==="TR008"||type==="vtc")               return "À la demande";
    if (id==="TR009"||type==="location_voiture")  return "Disponible";
    if (id==="TR005") return "8 départs/jour";
    if (id==="TR007"||(type==="train"&&id!=="TR005")) return "Toutes les 2h";
    if (id==="TR006"||type==="ferry") return "1 départ/heure";
    const raw=t.frequence||t.frequency||t.frequence_min||"";
    return raw ? String(raw) : "";
  };

  const fmtAcc = t => {
    const v=t.accessibilite_pmr??t.accessibilite??t.accessible??t.pmr;
    if (v===null||v===undefined) return null;
    if (typeof v==="boolean") return v;
    const s=String(v).toLowerCase().trim();
    if (["true","yes","oui","1"].includes(s)) return true;
    if (["false","no","non","0"].includes(s)) return false;
    return null;
  };

  const fmtSubtitle = t => {
    const op=t.operateur||t.compagnie||t.operator||"";
    if (op) return op;
    if (Array.isArray(t.lignes_principales)&&t.lignes_principales.length)
      return t.lignes_principales.map(l=>l.numero).join(" · ");
    if (Array.isArray(t.destinations)&&t.destinations.length)
      return t.destinations.map(d=>d.port||d.destination).join(" · ");
    if (Array.isArray(t.destinations_principales)&&t.destinations_principales.length)
      return t.destinations_principales.map(d=>d.destination).join(" · ");
    return t.type||"";
  };

  return (
    <section style={{ marginBottom:56 }}>
      <SectionHead Icon={Bus} title="Analyse du transport" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {list.map((t,i) => {
          const { main:prixMain, sub:prixSub } = fmtPrice(t);
          const hours=fmtHours(t), freq=fmtFreq(t), acc=fmtAcc(t), sub=fmtSubtitle(t);
          const name=t.nom||t.name||"—";
          return (
            <motion.div key={t.id||i}
              initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{delay:i*0.05}}
              whileHover={{y:-3,boxShadow:"0 10px 28px rgba(0,0,0,0.09)"}}
              style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9",
                boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
                padding:"20px 20px 18px", display:"flex", flexDirection:"column", cursor:"default" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:"#111827",
                    fontFamily:"'Outfit',sans-serif", lineHeight:1.3 }}>{name}</div>
                  {sub && <div style={{ fontSize:12, color:"#9ca3af", marginTop:3,
                    fontFamily:"'Outfit',sans-serif" }}>{sub}</div>}
                </div>
                {prixMain && (
                  <div style={{ flexShrink:0, marginLeft:10, textAlign:"right" }}>
                    <span style={{ fontSize:13, fontWeight:800, color:TEAL,
                      fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap", display:"block" }}>
                      {prixMain}
                    </span>
                    {prixSub && <span style={{ fontSize:11, color:"#9ca3af",
                      fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap", display:"block", marginTop:2 }}>
                      {prixSub}
                    </span>}
                  </div>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:7, margin:"12px 0 0" }}>
                {hours && <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#6b7280" }}>
                  <Clock size={14} color="#9ca3af" strokeWidth={1.5} /><span>{hours}</span>
                </div>}
                {freq && <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#6b7280" }}>
                  <TrendingUp size={14} color="#9ca3af" strokeWidth={1.5} /><span>{freq}</span>
                </div>}
                {acc!==null && <div style={{ display:"flex", alignItems:"center", gap:8,
                  fontSize:13, fontWeight:600, color:acc?TEAL:"#ef4444" }}>
                  <Accessibility size={14} color={acc?TEAL:"#ef4444"} strokeWidth={1.5} />
                  <span>{acc?"Accessible":"Non accessible"}</span>
                </div>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── FAQ + URGENCES ──────────────────────────────────────────────────────────
function FAQSection() {
  const SELECTED_FAQ_IDS = [
    "faq_001","faq_003","faq_006","faq_009","faq_011",
    "faq_013","faq_014","faq_018","faq_021","faq_029","faq_042",
  ];
  const { data: faqRaw, loading:l1 } = useApi(
    `/api/dashboard/faq?ids=${SELECTED_FAQ_IDS.join(",")}`, []
  );
  const { data: svcRaw, loading:l2 } = useApi("/api/dashboard/services-urgence", []);
  const [openIdx, setOpenIdx] = useState(null);

  const faq      = Array.isArray(faqRaw) ? faqRaw : [];
  const services = Array.isArray(svcRaw) ? svcRaw : [];
  const getQ = i => i.question||i.q||i.titre||i.sujet||"";
  const getA = i => i.reponse||i.answer||i.a||i.contenu||"";

  return (
    <section style={{ marginBottom:56 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:24 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <HelpCircle size={20} color="#ec4899" strokeWidth={1.5} />
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:"#111827",
              fontFamily:"'Outfit',sans-serif" }}>Questions fréquemment posées</h2>
          </div>
          {l1 ? <Spin /> : faq.length===0
            ? <Empty Icon={HelpCircle} label="Aucune question disponible" />
            : (
              <div style={{ display:"flex", flexDirection:"column" }}>
                {faq.map((item,i) => {
                  const isOpen=openIdx===i, q=getQ(item), a=getA(item);
                  if (!q) return null;
                  return (
                    <div key={i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                      <button onClick={() => setOpenIdx(isOpen?null:i)}
                        style={{ width:"100%", textAlign:"left", background:"none",
                          border:"none", padding:"14px 4px", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:20, height:20, borderRadius:6,
                            background: isOpen?TEAL+"22":"#f3f4f6",
                            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <HelpCircle size={11} color={isOpen?TEAL:"#9ca3af"} strokeWidth={1.5} />
                          </div>
                          <span style={{ fontSize:14, fontWeight:isOpen?600:500,
                            color:isOpen?TEAL:"#374151", fontFamily:"'Outfit',sans-serif",
                            transition:"color .2s" }}>{q}</span>
                        </div>
                        <motion.div animate={{rotate:isOpen?180:0}} style={{flexShrink:0}}>
                          <ChevronDown size={16} color="#9ca3af" strokeWidth={1.5} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                            exit={{height:0,opacity:0}} transition={{duration:.25}}
                            style={{overflow:"hidden"}}>
                            <p style={{ margin:"0 0 14px 30px", fontSize:13,
                              color:"#6b7280", lineHeight:1.7,
                              fontFamily:"'Outfit',sans-serif" }}>{a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Outfit','Segoe UI',sans-serif;background:#f8fafc;-webkit-font-smoothing:antialiased}
      ::-webkit-scrollbar{width:6px;height:6px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
      .leaflet-container{z-index:1}
    `;
    document.head.appendChild(style);
    setTimeout(() => setReady(true), 600);
  }, []);

  if (!ready) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center",
      background:"linear-gradient(135deg,#f0fdfa,#eff6ff)" }}>
      <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}}
        style={{ textAlign:"center" }}>
        <motion.div animate={{rotate:360}}
          transition={{duration:1.8,repeat:Infinity,ease:"linear"}}
          style={{ marginBottom:16, display:"flex", justifyContent:"center" }}>
          <Globe size={48} color={TEAL} strokeWidth={1.5} />
        </motion.div>
        <div style={{ fontWeight:700, fontSize:18, color:"#111827",
          fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>Tanger Tourisme</div>
        <div style={{ fontSize:13, color:"#9ca3af" }}>Chargement du tableau de bord...</div>
        <div style={{ width:180, height:3, background:"#e5e7eb", borderRadius:2,
          margin:"16px auto 0", overflow:"hidden" }}>
          <motion.div initial={{x:"-100%"}} animate={{x:"100%"}}
            transition={{duration:1,repeat:Infinity,ease:"easeInOut"}}
            style={{ width:"40%", height:"100%", borderRadius:2,
              background:`linear-gradient(90deg,${TEAL},${BLUE})` }} />
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc" }}>
      <HeroHeader />
      <main style={{ maxWidth:1320, margin:"0 auto", padding:"48px 24px 40px" }}>
        <KpiSection />
        <AnalyticsSection />
        <MapSection />
        <AIInsightsSection />
        <TransportSection />
        <FAQSection />
      </main>
    </div>
  );
}