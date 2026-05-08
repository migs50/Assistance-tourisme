"""
agents/orchestrator.py
Orchestrateur central : détecte l'intention de l'utilisateur
et route la requête vers le bon agent spécialisé.
"""
import re
from models.schemas import AgentType, ChatResponse
from agents.leisure_agent   import LeisureAgent
from agents.logistics_agent import LogisticsAgent
from agents.emergency_agent import EmergencyAgent
from agents.general_agent   import GeneralAgent


# ─── Mots-clés par domaine ────────────────────────────────────────────────────

EMERGENCY_KEYWORDS = [
    "urgence", "urgent", "secours", "ambulance", "police", "pompier",
    "accident", "blessé", "hôpital", "pharmacie", "médecin", "docteur",
    "vol", "agression", "danger", "ambassade", "consulat", "perdu",
    "emergency", "help", "malade", "sick", "hurt", "stolen", "lost",
    "مستشفى", "طوارئ", "شرطة", "إسعاف",
]

LOGISTICS_KEYWORDS = [
    "transport", "taxi", "bus", "train", "ferry", "bateau", "avion",
    "aéroport", "gare", "trajet", "itinéraire", "comment aller", "comment se rendre",
    "route", "chemin", "distance", "durée", "horaire", "billet", "ticket",
    "voiture", "location", "déplacement", "partir", "arriver",
    "how to get", "directions", "schedule",
    "سيارة", "حافلة", "قطار", "مواصلات",
]

LEISURE_KEYWORDS = [
    "hôtel", "hotel", "hébergement", "chambre", "nuit", "séjour",
    "restaurant", "manger", "nourriture", "cuisine", "café", "plage", "beach",
    "musée", "visite", "activité", "sortie", "loisir", "touriste",
    "lieu", "site", "monument", "médina", "kasbah", "souk",
    "événement", "festival", "spectacle", "shopping",
    "recommande", "conseil", "suggestion", "meilleur", "top",
    "food", "eat", "visit", "see", "do", "activity",
    "فندق", "مطعم", "شاطئ", "متحف",
]


class Orchestrator:
    """Route les messages utilisateur vers l'agent le plus adapté."""

    def __init__(self):
        self._agents = {
            AgentType.LEISURE:   LeisureAgent(),
            AgentType.LOGISTICS: LogisticsAgent(),
            AgentType.EMERGENCY: EmergencyAgent(),
            AgentType.GENERAL:   GeneralAgent(),
        }

    # ── Détection d'intention ─────────────────────────────────────────────────

    def _detect_agent(self, message: str) -> AgentType:
        """
        Détermine quel agent doit traiter le message.
        Priorité : Urgence > Logistique > Loisirs > Général
        """
        msg_lower = message.lower()

        # 1. Urgence — priorité maximale
        if any(kw in msg_lower for kw in EMERGENCY_KEYWORDS):
            return AgentType.EMERGENCY

        # 2. Logistique
        if any(kw in msg_lower for kw in LOGISTICS_KEYWORDS):
            return AgentType.LOGISTICS

        # 3. Loisirs
        if any(kw in msg_lower for kw in LEISURE_KEYWORDS):
            return AgentType.LEISURE

        # 4. Général par défaut
        return AgentType.GENERAL

    # ── Point d'entrée principal ──────────────────────────────────────────────

    def handle(
        self,
        message: str,
        session_id: str = "default",
        language:   str = "fr",
    ) -> ChatResponse:
        """
        Traite un message utilisateur de bout en bout :
        détection → sélection de l'agent → appel RAG + LLM → réponse.
        """
        agent_type = self._detect_agent(message)
        agent      = self._agents[agent_type]

        print(f"[ORCHESTRATOR] Message : '{message[:60]}…'")
        print(f"[ORCHESTRATOR] Agent sélectionné : {agent_type.value}")

        result = agent.run(message, language=language)

        return ChatResponse(
            agent      = result["agent"],
            response   = result["response"],
            sources    = result["sources"],
            session_id = session_id,
        )

    def get_agent_for_category(self, category: str) -> AgentType:
        """Retourne l'AgentType responsable d'une catégorie donnée."""
        CATEGORY_MAP = {
            "hotel":            AgentType.LEISURE,
            "restaurant":       AgentType.LEISURE,
            "activite":         AgentType.LEISURE,
            "plage":            AgentType.LEISURE,
            "musee":            AgentType.LEISURE,
            "lieu_touristique": AgentType.LEISURE,
            "evenement":        AgentType.LEISURE,
            "transport":        AgentType.LOGISTICS,
            "itineraire":       AgentType.LOGISTICS,
            "service_urgence":  AgentType.EMERGENCY,
            "faq":              AgentType.GENERAL,
            "avis":             AgentType.LEISURE,
            "assurance":        AgentType.LOGISTICS,
        }
        return CATEGORY_MAP.get(category, AgentType.GENERAL)