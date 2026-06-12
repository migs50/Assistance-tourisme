/**
 * HomeTanger.jsx — POINT D'ENTRÉE PRINCIPAL
 *
 * Ce fichier est maintenant un simple routeur :
 * il importe chaque page depuis son propre fichier
 * et les affiche selon l'onglet actif.
 *
 * Structure du projet :
 *   shared.js          → tokens, hooks, API, atoms partagés
 *   Accueil.jsx        → page d'accueil + hero + lieux
 *   Recommandation.jsx → wizard recommandation IA
 *   Activites.jsx      → liste activités avec filtres
 *   Evenements.jsx     → agenda événements
 *   Dashboard.jsx      → analytics / statistiques
 *   AssistantIA.jsx    → page dédiée assistant IA
 *   HomeTanger.jsx     → ce fichier (routeur principal)
 */
import { useState } from "react";
import NavbarTanger from "../../components/Navbartanger";
import Footer from "../../components/Footer";

import { InjectGlobalStyles } from "./SharedTanger";
import Accueil from "./Accueil";
import Recommandation from "./Recommandation";
import Activites from "./Activites";
import Evenements from "./Evenements";
import Dashboard from "./Dashboard";
import AssistantIA from "./AssistantIA";
import Favoris from "./Favoris";
import Assurance from "./Assurance";

export default function HomeTanger({ onBack, onOpenChat }) {
  const [activeTab, setActiveTab] = useState("accueil");

  return (
    <div className="tg-root">
      {/* Injecte les styles globaux une seule fois */}
      <InjectGlobalStyles />

      {/* Barre de navigation */}
      <NavbarTanger
        onBack={onBack}
        onOpenChat={onOpenChat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Pages */}
      {activeTab === "accueil" && <Accueil onOpenChat={onOpenChat} />}
      {activeTab === "recommandation" && <Recommandation />}
      {activeTab === "activites" && <Activites />}
      {activeTab === "evenements" && <Evenements />}
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "assistant" && <AssistantIA onOpenChat={onOpenChat} />}
      {activeTab === "favoris" && <Favoris />}
      {activeTab === "assurance" && <Assurance />}

      <Footer />
    </div>
  );
}