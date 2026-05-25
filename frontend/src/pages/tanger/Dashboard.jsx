import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import {
  T, SectionHero, Spinner, ErrorBanner, dashFetch
} from "./SharedTanger";
import {
  TrendingUp, Users, MapPin, Star, DollarSign,
  Briefcase, Activity, Calendar, Info, Coffee,
  Palmtree, Utensils, Hotel, ArrowUpRight
} from "lucide-react";

/* ─── Styles des cartes Premium ─────────────────────────────────────────── */
const cardStyle = {
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  borderRadius: 24,
  padding: 24,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 32px rgba(31, 38, 135, 0.07)",
  position: "relative",
  overflow: "hidden",
};

/* ─── Composants UI internes ────────────────────────────────────────────── */
function StatCard({ title, value, sub, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
      style={cardStyle}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}15`, color: color,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={22} />
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{title}</p>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{value}</h3>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textMuted, borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 10 }}>
        <ArrowUpRight size={12} color="#10b981" /> {sub}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadAllStats = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);

      const [gl, lx, av, cat, ev, topAct, ht] = await Promise.all([
        dashFetch("/stats/global"),
        dashFetch("/stats/lieux"),
        dashFetch("/stats/avis"),
        dashFetch("/stats/categories"),
        dashFetch("/stats/events-evolution"),
        dashFetch("/stats/top-activities?top=6"),
        dashFetch("/stats/hotels"),
      ]);

      setData({
        global: gl,
        lieux: lx,
        avis: av,
        categories: cat,
        eventsEvo: ev,
        topActivities: topAct,
        hotels: ht
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Dashboard error:", err);
      if (!isSilent) setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllStats();

    // Polling toutes les 10 secondes (pour ne pas saturer et montrer le "temps réel")
    const interval = setInterval(() => {
      loadAllStats(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadAllStats]);

  if (loading && !data) return <div style={{ padding: 100 }}><Spinner label="Synchronisation des flux de données..." /></div>;
  if (error) return <div style={{ padding: 40 }}><ErrorBanner message={error} /></div>;

  const { global, lieux, avis, categories, eventsEvo, topActivities, hotels } = data;

  // Préparation des données pour les graphiques
  const catChartData = Object.entries(categories || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })).slice(0, 6);

  const budgetData = Object.entries(global?.summary || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const hotelSegmentData = (hotels?.par_segment_prix || []).map(s => ({
    name: s.segment_prix.charAt(0).toUpperCase() + s.segment_prix.slice(1),
    prix: s.prix_moyen,
    count: s.count
  }));

  const topActData = (topActivities?.top_activities || []).map(a => ({
    name: a.nom.length > 15 ? a.nom.substring(0, 15) + "..." : a.nom,
    val: a.score_hybride * 100, // On multiplie pour la lisibilité sur le graph
    realScore: a.score_hybride
  }));

  const COLORS = [T.light, "#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="reco-fade-up" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <SectionHero
        label="Live Analytics Suite"
        title={<span>Smart Tanger <em>Dashboard</em></span>}
        description="Monitoring en temps réel de l'écosystème touristique. Données synchronisées toutes les 10s."
      />

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px 80px" }}>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: 99 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* ─── Rangée 1 : KPIs Spécifiques ─── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 20,
          position: "relative",
          zIndex: 10
        }}>
          <StatCard title="Hôtels" value={global?.overview?.total_hotels || 0} sub="Offre premium" icon={Hotel} color={T.light} delay={0.1} />
          <StatCard title="Restaurants" value={global?.overview?.total_restaurants || 0} sub="Gastronomie" icon={Utensils} color="#ef4444" delay={0.15} />
          <StatCard title="Activités" value={global?.overview?.total_activites || 0} sub="Expériences" icon={Activity} color="#0ea5e9" delay={0.2} />
          <StatCard title="Événements" value={global?.overview?.total_events || 0} sub="Agenda 2026" icon={Calendar} color="#8b5cf6" delay={0.25} />
          <StatCard title="Plages" value={global?.overview?.total_plages || 0} sub="Détente" icon={Palmtree} color="#10b981" delay={0.3} />
          <StatCard title="Avis" value={global?.overview?.total_avis || 0} sub="Flux temps réel" icon={Star} color="#ec4899" delay={0.4} />
        </div>

        {/* ─── Rangée 2 : Analyses Complexes ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 24, marginTop: 40 }}>

          {/* 1. Catégories & Budget (Side by Side in one card potentially) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={cardStyle}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 25, display: "flex", alignItems: "center", gap: 10 }}>
              <Briefcase size={20} color={T.light} /> Répartition Immobilière & Offre
            </h4>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {catChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 2. Évolution des Événements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={cardStyle}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 25, display: "flex", alignItems: "center", gap: 10 }}>
              <Calendar size={20} color="#8b5cf6" /> Distribution Agenda Mensuel
            </h4>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventsEvo || []}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 16, border: "none" }} />
                  <Area type="monotone" dataKey="total" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEvents)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* ─── Rangée 3 : Popularité & Prix ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 24, marginTop: 24 }}>

          {/* 3. Activités les plus populaires (Radar or Bar) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={cardStyle}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 25, display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={20} color="#10b981" /> Top Expériences (Score IA)
            </h4>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topActData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} width={120} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Bar dataKey="val" fill="#10b981" radius={[0, 10, 10, 0]} barSize={20}>
                    {topActData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 4. Prix Hôtels & Budget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} style={cardStyle}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 25, display: "flex", alignItems: "center", gap: 10 }}>
              <DollarSign size={20} color="#f59e0b" /> Analyse Tarifaire (Hotels)
            </h4>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hotelSegmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: "none" }} />
                  <Bar dataKey="prix" name="Prix moyen (MAD)" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Footer simple dashboard */}
        <div style={{ marginTop: 60, textAlign: "center", color: T.textMuted, fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            <span>Architecture : <strong>FastAPI Service</strong></span>
            <span>Viz Engine : <strong>Recharts 2.15</strong></span>
            <span>Sync : <strong>Polling 10s</strong></span>
          </div>
          <p>© 2026 TangerGuide Analytics Hub — Infrastructure de données temps réel</p>
        </div>

      </div>
    </div>
  );
}