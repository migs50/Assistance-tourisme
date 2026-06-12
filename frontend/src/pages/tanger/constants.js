// Shared constants for Tanger pages
export const C = {
  teal: "#0F7B6C",
  tealLight: "#14B8A6",
  tealDark: "#065F56",
  orange: "#F97316",
  orangeLight: "#FED7AA",
  red: "#EF4444",
  amber: "#F59E0B",
  green: "#22C55E",
  blue: "#3B82F6",
  indigo: "#6366F1",
  navy: "#0F172A",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray600: "#475569",
  gray800: "#1E293B",
  white: "#FFFFFF",
};

export const QUICK_EMERGENCY = [
  { title: "Police", subtitle: "Urgences policières, vol, agression, perte de documents", num: "19", color: C.blue, type: "commissariat" },
  { title: "Gendarmerie Royale", subtitle: "Sécurité hors zones urbaines, accidents de route", num: "177", color: C.indigo, type: "gendarmerie" },
  { title: "Protection Civile", subtitle: "Incendies, accidents graves, catastrophes", num: "15", color: C.orange, type: "pompiers" },
  { title: "Ambulance / SAMU", subtitle: "Urgences médicales, détresses cardiaques et respiratoires", num: "150", color: C.red, type: "samu" },
  { title: "Pompiers", subtitle: "Incendies, désincarcération, secours d'urgence", num: "15", color: C.orange, type: "pompiers" },
  { title: "Urgences Médicales", subtitle: "Détresse médicale, hospitalisation urgente", num: "15", color: C.green, type: "hopital_public" },
];
