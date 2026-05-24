import React, { useState, useEffect } from 'react';
import { T, SectionHero } from "./SharedTanger";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  // 1. Initialisation de l'état du dashboard
  const [stats, setStats] = useState({
    total_events: 0,
    active_agents: 0,
    total_conversations: 0,
    top_visited_zone: "Chargement..."
  });
  const [loading, setLoading] = useState(true);

  // 2. Fonction qui va chercher les données réelles sur ton serveur FastAPI
  const fetchStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/stats/');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
    }
  };

  // 3. Recharger les données automatiquement toutes les 5 secondes pour le côté "temps réel"
  useEffect(() => {
    fetchStats(); // Premier appel au chargement de la page

    const interval = setInterval(() => {
      fetchStats(); // Rappelle l'API dynamiquement en arrière-plan
    }, 5000);

    return () => clearInterval(interval); // Nettoyage de l'intervalle
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f7fb' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 TangerGuide AI — Tableau de bord analytique</h2>

      {/* Grille des cartes statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

        {/* Carte 1 : Nombre de documents RAG */}
        <div style={cardStyle}>
          <h3>📚 Événements en BDD (RAG)</h3>
          <p style={numberStyle}>{loading ? '...' : stats.total_events}</p>
          <span style={{ color: '#4caf50', fontSize: '12px' }}>● Mis à jour en temps réel</span>
        </div>

        {/* Carte 2 : Agents Actifs */}
        <div style={cardStyle}>
          <h3>🤖 Agents IA Actifs</h3>
          <p style={numberStyle}>{stats.active_agents}</p>
          <span style={{ color: '#2196f3', fontSize: '12px' }}>Système multi-agents opérationnel</span>
        </div>

        {/* Carte 3 : Requêtes Utilisateurs */}
        <div style={cardStyle}>
          <h3>💬 Conversations</h3>
          <p style={numberStyle}>{stats.total_conversations}</p>
          <span style={{ color: '#ff9800', fontSize: '12px' }}>Simulations d'audiences</span>
        </div>

        {/* Carte 4 : Zone la plus recherchée */}
        <div style={cardStyle}>
          <h3>📍 Zone Populaire</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63', margin: '10px 0' }}>{stats.top_visited_zone}</p>
          <span style={{ color: '#757575', fontSize: '12px' }}>Basé sur les requêtes RAG</span>
        </div>

      </div>
    </div>
  );
}

// Quelques styles CSS rapides en ligne pour la présentation
const cardStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  borderLeft: '5px solid #4f46e5'
};

const numberStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#4f46e5',
  margin: '10px 0'
};