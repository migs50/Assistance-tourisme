// src/pages/tanger/SharedHeader.jsx
import { SectionHero } from "./SharedTanger";
import { Phone, Building2, Map, TrendingUp } from "lucide-react";
import { StatCard } from "./SharedTanger";
import { C, QUICK_EMERGENCY } from "./constants";

/**
 * Header component used for Assurance page (and can be reused by other pages).
 * It renders the hero section plus a quick‑stats grid.
 */
export const AssuranceHeader = ({
  label = "Explorer Tanger",
  title = "Sécurité Voyageur",
  subtitle = "Votre guide complet pour voyager en toute sérénité à Tanger et au Maroc. Numéros d'urgence, compagnies d'assurance, conseils de sécurité et indicateurs en temps réel",
}) => (
  <SectionHero label={label} title={title} subtitle={subtitle} />
);
