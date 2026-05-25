import React, { useEffect, useState } from "react";
import {
    MapContainer, TileLayer, Marker, Popup, useMap
} from "react-leaflet";
import L from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Navigation, ExternalLink, MapPin,
    Layers, Maximize, Smartphone
} from "lucide-react";

/* ─── Styles et Config ─────────────────────────────────────────────────── */
const T = {
    primary: "#0f766e",
    secondary: "#0ea5e9",
    text: "#0f172a",
    textMuted: "#64748b",
    bg: "#f8fafc",
    glass: "rgba(255, 255, 255, 0.8)",
};

// Composant pour recentrer et zoomer automatiquement
function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 15, { animate: true, duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
}

// Marker personnalisé avec effet "Pulse"
const pulseIcon = L.divIcon({
    className: "custom-pulse-marker",
    html: `
    <div style="position: relative; width: 40px; height: 40px;">
      <div style="position: absolute; inset: 0; background: #0f766e; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div>
      <div style="position: absolute; top: 10px; left: 10px; width: 20px; height: 20px; background: #0f766e; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>
    </div>
  `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10],
});

export default function InteractiveMapPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { lat, lng, nom, categorie, image, adresse } = location.state || {
        lat: 35.7595, lng: -5.8340, nom: "Tanger, Maroc", categorie: "VIlle"
    };

    const openGoogleMaps = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh", background: "#f1f5f9", overflow: "hidden" }}>

            {/* Styles injectés pour l'animation Pulse */}
            <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 20px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 280px !important;
        }
        .leaflet-popup-tip-container { display: none; }
      `}</style>

            {/* Barre de navigation flottante */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    position: "absolute", top: 20, left: 20, right: 20, zIndex: 1000,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    pointerEvents: "none"
                }}
            >
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        pointerEvents: "auto",
                        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
                        border: "1px solid rgba(0,0,0,0.05)", borderRadius: 16,
                        padding: "12px 20px", display: "flex", alignItems: "center", gap: 10,
                        fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                    }}
                >
                    <ArrowLeft size={18} /> Retour
                </button>

                <div style={{
                    pointerEvents: "auto",
                    background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
                    borderRadius: 99, padding: "8px 20px",
                    display: "flex", alignItems: "center", gap: 10,
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                }}>
                    <MapPin size={16} color={T.primary} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{nom}</span>
                </div>
            </motion.div>

            {/* Carte Leaflet */}
            <MapContainer
                center={[lat, lng]}
                zoom={14}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap lat={lat} lng={lng} />

                <Marker position={[lat, lng]} icon={pulseIcon}>
                    <Popup closeButton={false}>
                        <div style={{ overflow: "hidden" }}>
                            {image && (
                                <div style={{
                                    height: 140, background: `url(${image}) center/cover no-repeat`,
                                    position: "relative"
                                }}>
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
                                </div>
                            )}
                            <div style={{ padding: 20 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 800, color: T.primary,
                                    textTransform: "uppercase", letterSpacing: "0.1em",
                                    background: "rgba(15,118,110,0.08)", padding: "4px 10px", borderRadius: 99
                                }}>
                                    {categorie}
                                </span>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "10px 0 6px", color: T.text }}>{nom}</h3>
                                {adresse && <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, marginBottom: 15 }}>{adresse}</p>}

                                <button
                                    onClick={openGoogleMaps}
                                    style={{
                                        width: "100%", background: T.primary, color: "#fff",
                                        border: "none", borderRadius: 12, padding: "12px",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        fontSize: 13, fontWeight: 600, cursor: "pointer"
                                    }}
                                >
                                    <ExternalLink size={14} /> Open Google Maps
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Overlay controls */}
            <div style={{
                position: "absolute", bottom: 40, right: 20, zIndex: 1000,
                display: "flex", flexDirection: "column", gap: 12
            }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        background: "#fff", width: 50, height: 50, borderRadius: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9",
                        cursor: "pointer"
                    }}
                >
                    <Navigation size={20} color={T.primary} />
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        background: "#fff", width: 50, height: 50, borderRadius: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9",
                        cursor: "pointer"
                    }}
                >
                    <Layers size={20} color={T.textMuted} />
                </motion.div>
            </div>

        </div>
    );
}
