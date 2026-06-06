import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, ZoomControl
} from "react-leaflet";
import L from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ExternalLink, MapPin, Layers, Star, X,
    Hotel, UtensilsCrossed, Landmark, Palmtree, Ticket, Bus, Eye, EyeOff, Calendar
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */
const TANGIER_CENTER = [35.7595, -5.8340];
const DEFAULT_ZOOM = 13;

const CATEGORIES = {
    hotels:       { label: "Hôtels",            color: "#6366f1", icon: Hotel,            iconKey: "hotels",       file: "/api/dashboard/hotels" },
    restaurants:  { label: "Restaurants",        color: "#ef4444", icon: UtensilsCrossed,  iconKey: "restaurants",  file: "/api/dashboard/restaurants" },
    musees:       { label: "Musées",             color: "#a855f7", icon: Landmark,         iconKey: "musees",       file: "/api/dashboard/musees" },
    lieux:        { label: "Lieux Touristiques", color: "#f59e0b", icon: Landmark,         iconKey: "lieux",        file: "/api/dashboard/lieux" },
    plages:       { label: "Plages",             color: "#06b6d4", icon: Palmtree,         iconKey: "plages",       file: "/api/dashboard/plages" },
    activites:    { label: "Activités",          color: "#10b981", icon: Ticket,           iconKey: "activites",    file: "/api/dashboard/activites" },
    evenements:   { label: "Événements",         color: "#ec4899", icon: Calendar,         iconKey: "evenements",   file: "/api/dashboard/evenements" },
};

const T = {
    primary: "#0f766e",
    primaryLight: "#14b8a6",
    text: "#0f172a",
    textMuted: "#64748b",
    bg: "#f8fafc",
};

/* ═══════════════════════════════════════════════════════════════════════════
   LUCIDE SVG PATHS — viewBox 0 0 24 24, couleur blanche
   ═══════════════════════════════════════════════════════════════════════════ */
const ICON_SVG = {
  hotels: `
    <path d="M3 22V8l9-6 9 6v14" stroke="white" stroke-width="2"
      fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="9" y="14" width="6" height="8" fill="white" rx="1"/>
    <rect x="6" y="11" width="3" height="3" stroke="white" stroke-width="1.5" fill="none" rx="0.5"/>
    <rect x="15" y="11" width="3" height="3" stroke="white" stroke-width="1.5" fill="none" rx="0.5"/>`,

  restaurants: `
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"
      stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M7 2v20" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"
      stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`,

  musees: `
    <path d="M3 22V11l9-9 9 9v11"
      stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 22v-4a3 3 0 0 0-6 0v4"
      stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M2 22h20" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <rect x="9" y="9" width="2" height="4" fill="white" opacity="0.85" rx="0.3"/>
    <rect x="13" y="9" width="2" height="4" fill="white" opacity="0.85" rx="0.3"/>`,

  lieux: `
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"
      fill="white" opacity="0.95"/>
    <circle cx="12" cy="10" r="3" fill="__COLOR__"/>`,

  plages: `
    <path d="M17 18a5 5 0 0 0-10 0"
      stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    <line x1="12" y1="9" x2="12" y2="2" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="m4.22 10.22 1.42 1.42M19.78 10.22l-1.42 1.42"
      stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="3" y1="21" x2="21" y2="21" stroke="white" stroke-width="2" stroke-linecap="round"/>`,

  activites: `
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
      fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>`,

  evenements: `
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="white" stroke-width="2" fill="none"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <rect x="8" y="14" width="3" height="3" fill="white" opacity="0.9" rx="0.5"/>`,
};

/* ═══════════════════════════════════════════════════════════════════════════
   MARKER ICON FACTORY — pin avec icône SVG Lucide
   ═══════════════════════════════════════════════════════════════════════════ */
// ── Icône catégorie : petit cercle Google Maps style (22px) ──
const createCategoryIcon = (color, iconKey, size = 22) => {
  const rawSvg    = ICON_SVG[iconKey] || ICON_SVG.lieux;
  const svgContent = rawSvg.replace(/__COLOR__/g, color);
  const iconSize  = 12;
  const offset    = Math.floor((size - iconSize) / 2);

  return L.divIcon({
    className: "category-marker",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;
        cursor:pointer;filter:drop-shadow(0 2px 5px ${color}77);">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};
          border:2px solid rgba(255,255,255,0.95);
          box-shadow:0 2px 6px ${color}44;
        "></div>
        <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"
          style="position:absolute;top:${offset}px;left:${offset}px;z-index:2;pointer-events:none;"
          xmlns="http://www.w3.org/2000/svg"
        >${svgContent}</svg>
      </div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
};
/* ═══════════════════════════════════════════════════════════════════════════
   CLUSTER ICON FACTORY  (inchangé)
   ═══════════════════════════════════════════════════════════════════════════ */
const createClusterIcon = (cluster) => {
    const count = cluster.getChildCount();
    const size = count < 20 ? 40 : count < 50 ? 50 : 60;
    return L.divIcon({
        html: `<div style="
            width:${size}px;height:${size}px;
            background:linear-gradient(135deg, ${T.primary}, ${T.primaryLight});
            border-radius:50%;border:3px solid #fff;
            display:flex;align-items:center;justify-content:center;
            color:#fff;font-weight:800;font-size:${size * 0.3}px;
            box-shadow:0 6px 20px rgba(15,118,110,0.4);
            font-family:'Inter',sans-serif;
        ">${count}</div>`,
        className: "custom-cluster-icon",
        iconSize: [size, size],
    });
};

/* ═══════════════════════════════════════════════════════════════════════════
   RECENTER MAP COMPONENT  (inchangé)
   ═══════════════════════════════════════════════════════════════════════════ */
function RecenterMap({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, zoom || DEFAULT_ZOOM, { animate: true, duration: 1.2 });
    }, [center, zoom, map]);
    return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   POPUP CARD COMPONENT — badge catégorie avec icône SVG
   ═══════════════════════════════════════════════════════════════════════════ */
function PopupCard({ item, catConfig, navigate }) {
    const nom = item.nom || item.name || "Sans nom";
    const desc = item.description_fr || item.description || "";
    const address = item.adresse || item.quartier || "";
    const rating = item.note_moyenne || item.rating || null;
    const image = item.image_url || item.image || item.photo || null;
    const cat = item.categorie || item.type || catConfig.label;
    const color = catConfig.color;
    const iconKey = catConfig.iconKey || "lieux";
    const rawSvg = ICON_SVG[iconKey] || ICON_SVG.lieux;
    const svgContent = rawSvg.replace(/__COLOR__/g, color);

    return (
        <div style={{ width: 280, overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
            {/* Image header */}
            <div style={{
                height: 140,
                background: image
                    ? `url(${image}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${color}dd, ${color}88)`,
                position: "relative",
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)",
                }} />

                {/* ── Badge catégorie avec icône SVG Lucide ── */}
                <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: color,
                    fontSize: 10, fontWeight: 700,
                    padding: "4px 10px 4px 7px",
                    borderRadius: 20,
                    display: "flex", alignItems: "center", gap: 5,
                    zIndex: 2,
                    boxShadow: `0 2px 8px ${color}55`,
                }}>
                    <svg viewBox="0 0 24 24" width="13" height="13"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ flexShrink: 0 }}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                    <span style={{ color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {catConfig.label}
                    </span>
                </div>

                {/* Rating */}
                {rating && (
                    <div style={{
                        position: "absolute", top: 10, right: 10,
                        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                        borderRadius: 20, padding: "4px 10px",
                        display: "flex", alignItems: "center", gap: 4, zIndex: 2,
                    }}>
                        <Star size={12} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                            {Number(rating).toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Name over image */}
                <h3 style={{
                    position: "absolute", bottom: 10, left: 14, right: 14,
                    color: "#fff", fontSize: 16, fontWeight: 700,
                    margin: 0, lineHeight: 1.3,
                    textShadow: "0 1px 6px rgba(0,0,0,0.5)", zIndex: 2,
                }}>
                    {nom}
                </h3>
            </div>

            {/* Body */}
            <div style={{ padding: "14px 16px 16px" }}>
                {address && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <MapPin size={13} color={T.textMuted} />
                        <span style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>
                            {address}
                        </span>
                    </div>
                )}
                {desc && (
                    <p style={{
                        fontSize: 12, color: "#475569", lineHeight: 1.5,
                        margin: "0 0 14px", display: "-webkit-box",
                        WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {desc}
                    </p>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => {
                            const lat = item.latitude || item.lat;
                            const lng = item.longitude || item.lng;
                            if (lat && lng)
                                window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
                        }}
                        style={{
                            flex: 1, background: "#f1f5f9", color: T.text,
                            border: "none", borderRadius: 10, padding: "10px",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        <ExternalLink size={13} /> Maps
                    </button>
                    <button
                        onClick={() => navigate("/lieu", { state: { ...item, categorie: cat } })}
                        style={{
                            flex: 2,
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            color: "#fff", border: "none", borderRadius: 10,
                            padding: "10px", fontSize: 12, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.02em",
                        }}
                    >
                        Voir Plus →
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN MAP COMPONENT  (interface 100% identique à l'original)
   ═══════════════════════════════════════════════════════════════════════════ */
export default function InteractiveMapPage(props) {
    const location = useLocation();
    const navigate = useNavigate();

    const [datasets, setDatasets] = useState({});
    const [routesData, setRoutesData] = useState(null);
    const [stopsData, setStopsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategories, setActiveCategories] = useState(
        Object.fromEntries(Object.keys(CATEGORIES).map(k => [k, true]))
    );
    const [showRoutes, setShowRoutes] = useState(true);
    const [showLegend, setShowLegend] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const data = props.lat || props.latitude ? props : (location.state || {});
    const { height = "100vh" } = data;
    const focusLat = data.lat || data.latitude;
    const focusLng = data.lng || data.longitude;
    const mapCenter = focusLat && focusLng ? [focusLat, focusLng] : TANGIER_CENTER;
    const mapZoom = focusLat ? 16 : DEFAULT_ZOOM;
    const isEmbedded = !!props.lat || !!props.latitude;

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            if (isEmbedded) { setIsLoading(false); return; }

            const entries = Object.entries(CATEGORIES);
            const results = {};
            await Promise.all(
                entries.map(async ([key, config]) => {
                    try {
                        const res = await fetch(config.file);
                        const json = await res.json();
                        results[key] = Array.isArray(json) ? json
                            : json?.data || json?.items || json?.[key] || [];
                    } catch (e) {
                        console.warn(`Failed to load ${key}:`, e);
                        results[key] = [];
                    }
                })
            );
            setDatasets(results);

            try {
                const rRes = await fetch("/api/dashboard/bus-routes");
                if (rRes.ok) setRoutesData(await rRes.json());
            } catch (e) { console.warn("bus-routes:", e); }

            try {
                const sRes = await fetch("/api/dashboard/bus-stops-geojson");
                if (sRes.ok) setStopsData(await sRes.json());
            } catch (e) { console.warn("bus-stops:", e); }

            setIsLoading(false);
        };
        loadData();
    }, []);

    const toggleCategory = useCallback((key) => {
        setActiveCategories(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const markersToRender = useMemo(() => {
        const markers = [];
        Object.entries(datasets).forEach(([catKey, items]) => {
            if (!activeCategories[catKey]) return;
            const config = CATEGORIES[catKey];
            (items || []).forEach((item, idx) => {
                const lat = parseFloat(item.latitude || item.lat || 0);
                const lng = parseFloat(item.longitude || item.lng || 0);
                if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
                markers.push({ item, catKey, config, lat, lng, id: `${catKey}-${idx}` });
            });
        });
        return markers;
    }, [datasets, activeCategories]);

    const totalMarkers = markersToRender.length;

    const LINE_COLORS = {
        "L1":"#e74c3c","L1B":"#c0392b","L2":"#3498db","L2A":"#2980b9",
        "L3":"#2ecc71","L4":"#27ae60","L4B":"#1e8449","L5":"#f39c12","L6":"#e67e22",
        "L7":"#9b59b6","L8":"#8e44ad","L9A":"#1abc9c","L10":"#16a085",
        "L11":"#d35400","L12":"#c0392b","L13":"#2c3e50","L14":"#7f8c8d",
        "L15":"#f1c40f","L16":"#e74c3c","L17":"#3498db","L18":"#2ecc71",
        "L19":"#9b59b6","L20":"#1abc9c","L21":"#e67e22","L22":"#f39c12",
        "L23":"#27ae60","L26":"#8e44ad","L27":"#16a085","L30":"#c0392b",
        "LI1":"#e74c3c","LI2":"#3498db","LI3":"#2ecc71","LI4":"#f39c12",
        "LI5":"#9b59b6","LI6":"#1abc9c","LI7":"#e67e22","LI8":"#8e44ad",
        "LI9":"#d35400","LI10":"#2c3e50","LI11":"#27ae60","LI12":"#16a085",
        "LI13":"#f1c40f","LI14":"#c0392b","LI16":"#7f8c8d","LI17":"#3498db",
        "LI24":"#e74c3c",
    };

    const busStopIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:8px;height:8px;border-radius:50%;
    background:#9ca3af;border:1.5px solid #fff;
    box-shadow:0 1px 3px rgba(0,0,0,0.2);
  "></div>`,
  iconSize:   [8, 8],
  iconAnchor: [4, 4],
});

    return (
        <div style={{
            position: "relative", width: "100%", height,
            background: "#0f172a", overflow: "hidden",
            borderRadius: isEmbedded ? 20 : 0,
            fontFamily: "'Inter', -apple-system, sans-serif",
        }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes markerBounce {
                    0% { transform: rotate(-45deg) scale(0); opacity: 0; }
                    60% { transform: rotate(-45deg) scale(1.15); }
                    100% { transform: rotate(-45deg) scale(1); opacity: 1; }
                }
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 16px !important; padding: 0 !important;
                    overflow: hidden !important;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
                    border: 1px solid rgba(0,0,0,0.06) !important;
                }
                .leaflet-popup-content { margin: 0 !important; width: auto !important; line-height: 1.4 !important; }
                .leaflet-popup-tip-container { display: none !important; }
                .leaflet-popup-close-button {
                    color: #fff !important; font-size: 20px !important;
                    top: 8px !important; right: 10px !important; z-index: 10 !important;
                    text-shadow: 0 1px 4px rgba(0,0,0,0.5) !important;
                }
                .custom-cluster-icon { background: transparent !important; border: none !important; }
                .category-marker { background: transparent !important; border: none !important; }
                .leaflet-control-zoom { border-radius: 12px !important; overflow: hidden; border: none !important; box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important; }
                .leaflet-control-zoom a { width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 16px !important; }
            `}</style>

            {/* Loading overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: "absolute", inset: 0, zIndex: 2000,
                            background: "linear-gradient(135deg, #0f172a, #1e293b)",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", gap: 16,
                        }}>
                        <div style={{
                            width: 48, height: 48,
                            border: "4px solid rgba(255,255,255,0.1)",
                            borderTop: `4px solid ${T.primaryLight}`,
                            borderRadius: "50%", animation: "spin 1s linear infinite",
                        }} />
                        <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
                            Chargement de la carte...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top bar */}
            {!isEmbedded && (
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        position: "absolute", top: 16, left: 16, right: 16, zIndex: 1000,
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                        pointerEvents: "none", flexWrap: "wrap", gap: 10,
                    }}>
                    <button onClick={() => navigate(-1)}
                        style={{
                            pointerEvents: "auto",
                            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)",
                            border: "none", borderRadius: 14, padding: "10px 18px",
                            display: "flex", alignItems: "center", gap: 8,
                            fontSize: 13, fontWeight: 600, color: T.text, cursor: "pointer",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        }}>
                        <ArrowLeft size={16} /> Retour
                    </button>
                    <div style={{
                        pointerEvents: "auto",
                        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)",
                        borderRadius: 14, padding: "10px 18px",
                        display: "flex", alignItems: "center", gap: 10,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}>
                        <MapPin size={16} color={T.primary} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                            Tanger — Carte Interactive
                        </span>
                        <span style={{
                            background: T.primary, color: "#fff",
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        }}>
                            {totalMarkers}
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Category filters */}
            {!isEmbedded && (
                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        position: "absolute",
                        bottom: isMobile ? 20 : 30,
                        left: "50%", transform: "translateX(-50%)",
                        zIndex: 1000,
                        display: "flex", gap: 6,
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(16px)",
                        borderRadius: 16, padding: "8px 10px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        maxWidth: isMobile ? "calc(100vw - 24px)" : "auto",
                        overflowX: "auto",
                        flexWrap: isMobile ? "nowrap" : "wrap",
                        justifyContent: "center",
                    }}>
                    {Object.entries(CATEGORIES).map(([key, config]) => {
                        const Icon   = config.icon;
                        const active = activeCategories[key];
                        const count  = (datasets[key] || []).filter(i =>
                            parseFloat(i.latitude || i.lat || 0) &&
                            parseFloat(i.longitude || i.lng || 0)
                        ).length;
                        return (
                            <button key={key} onClick={() => toggleCategory(key)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "7px 12px", borderRadius: 12, border: "none",
                                    background: active ? config.color : "transparent",
                                    color: active ? "#fff" : T.textMuted,
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    whiteSpace: "nowrap", transition: "all 0.2s ease",
                                    opacity: active ? 1 : 0.6,
                                }}>
                                <Icon size={14} />
                                <span>{config.label}</span>
                                {count > 0 && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 800,
                                        background: active ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                                        padding: "1px 6px", borderRadius: 10,
                                    }}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                    <button onClick={() => setShowRoutes(prev => !prev)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "7px 12px", borderRadius: 12, border: "none",
                            background: showRoutes ? "#f97316" : "transparent",
                            color: showRoutes ? "#fff" : T.textMuted,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                            whiteSpace: "nowrap", transition: "all 0.2s ease",
                            opacity: showRoutes ? 1 : 0.6,
                        }}>
                        <Bus size={14} /><span>Bus</span>
                    </button>
                </motion.div>
            )}

            {/* Side controls */}
            {!isEmbedded && (
                <div style={{
                    position: "absolute", top: isEmbedded ? 16 : 70,
                    right: 16, zIndex: 1000,
                    display: "flex", flexDirection: "column", gap: 8,
                }}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLegend(prev => !prev)}
                        style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: showLegend ? T.primary : "rgba(255,255,255,0.95)",
                            border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)", backdropFilter: "blur(16px)",
                        }}>
                        <Layers size={18} color={showLegend ? "#fff" : T.textMuted} />
                    </motion.button>
                </div>
            )}

            {/* Legend panel — icônes SVG */}
            {!isEmbedded && (
                <AnimatePresence>
                    {showLegend && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{
                                position: "absolute", top: isEmbedded ? 70 : 124,
                                right: 16, zIndex: 1000,
                                background: "rgba(255,255,255,0.96)",
                                backdropFilter: "blur(20px)",
                                borderRadius: 16, padding: 18,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.12)", width: 200,
                            }}>
                            <div style={{
                                fontSize: 12, fontWeight: 800, color: T.text,
                                marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>Légende</div>
                            {Object.entries(CATEGORIES).map(([key, config]) => {
                                const rawSvg = ICON_SVG[config.iconKey] || ICON_SVG.lieux;
                                const svg = rawSvg.replace(/__COLOR__/g, config.color);
                                return (
                                    <div key={key} style={{
                                        display: "flex", alignItems: "center", gap: 10, padding: "5px 0",
                                    }}>
                                        <div style={{
                                            width: 26, height: 26, borderRadius: 8,
                                            background: config.color,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0,
                                        }}>
                                            <svg viewBox="0 0 24 24" width="15" height="15"
                                                xmlns="http://www.w3.org/2000/svg"
                                                dangerouslySetInnerHTML={{ __html: svg }}
                                            />
                                        </div>
                                        <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>
                                            {config.label}
                                        </span>
                                    </div>
                                );
                            })}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "5px 0", borderTop: "1px solid #e2e8f0", marginTop: 4,
                            }}>
                                <div style={{ width: 16, height: 3, borderRadius: 2, background: "#f97316" }} />
                                <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>Routes Bus</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                                <div style={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    background: "#3b82f6", border: "2px solid #fff",
                                    boxShadow: "0 0 0 1px #3b82f6",
                                }} />
                                <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>Arrêts Bus</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* ═══════ LEAFLET MAP ═══════ */}
            <MapContainer center={mapCenter} zoom={mapZoom}
                style={{ width: "100%", height: "100%", zIndex: 1 }}
                zoomControl={false} maxZoom={18} minZoom={10}>

                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <ZoomControl position="topleft" />
                <RecenterMap center={mapCenter} zoom={mapZoom} />

                {/* Bus Routes GeoJSON */}
                {!isEmbedded && showRoutes && routesData && (
                    <GeoJSON key="bus-routes" data={routesData}
                        style={(feature) => ({
                            color: feature.properties?.color || "#f97316",
                            weight: 3.5, opacity: 0.75, dashArray: "8 5",
                        })}
                        onEachFeature={(feature, layer) => {
                            const ref  = feature.properties?.ref  || "";
                            const name = feature.properties?.name || ref || "Route";
                            const from = feature.properties?.from || "";
                            const to   = feature.properties?.to   || "";
                            layer.bindTooltip(
                                from && to
                                    ? `<b>${ref}</b> ${from} → ${to}`
                                    : `<b>${ref}</b> ${name}`,
                                { permanent: false, direction: "top", className: "route-tooltip" }
                            );
                        }}
                    />
                )}

                {/* Bus Stops */}
                {!isEmbedded && showRoutes && stopsData?.features?.map((feature, idx) => {
                    const coords = feature.geometry?.coordinates;
                    if (!coords || feature.geometry?.type !== "Point") return null;
                    const lat   = coords[1];
                    const lng   = coords[0];
                    const props = feature.properties || {};
                    const lines = props.lines || [];
                    return (
                        <Marker key={`bus-stop-${idx}`} position={[lat, lng]} icon={busStopIcon}>
                            <Popup maxWidth={320} minWidth={220}>
                                <div style={{ fontFamily: "'Outfit','Segoe UI',sans-serif", padding: "4px 0" }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 2 }}>
                                        {props.name || "Arrêt"}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                                        Arrêt de bus · ALSA Tanger
                                    </div>
                                    {lines.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                            {lines.map((line, li) => (
                                                <span key={li} style={{
                                                    minWidth: 32, padding: "3px 8px", borderRadius: 8,
                                                    background: LINE_COLORS[line] || "#6b7280",
                                                    color: "#fff", fontSize: 11, fontWeight: 800,
                                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                    letterSpacing: "0.02em",
                                                }}>{line}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Category Markers */}
                {isEmbedded ? (
                    <Marker position={[focusLat, focusLng]}
                        icon={createCategoryIcon(T.primary, "lieux")}>
                        {data && (data.nom || data.name) && (
                            <Popup maxWidth={300} minWidth={280}>
                                <PopupCard
                                    item={data}
                                    catConfig={{ color: T.primary, label: data.categorie || "Lieu", iconKey: "lieux" }}
                                    navigate={navigate}
                                />
                            </Popup>
                        )}
                    </Marker>
                ) : (
                    markersToRender.map(({ item, config, lat, lng, id }) => (
                        <Marker key={id} position={[lat, lng]}
                            icon={createCategoryIcon(config.color, config.iconKey)}>
                            <Popup maxWidth={300} minWidth={280}>
                                <PopupCard item={item} catConfig={config} navigate={navigate} />
                            </Popup>
                        </Marker>
                    ))
                )}
            </MapContainer>
        </div>
    );
}