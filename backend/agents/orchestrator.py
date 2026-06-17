"""
agents/orchestrator.py
"""
import re
from models.schemas import AgentType, ChatResponse
from agents.leisure_agent   import LeisureAgent
from agents.logistics_agent import LogisticsAgent
from agents.emergency_agent import EmergencyAgent
from agents.general_agent   import GeneralAgent

# --- Mots-clés (inchangés) ---
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
    "assurance", "couverture", "sinistre", "remboursement",
    "how to get", "directions", "schedule",
    "سيارة", "حافلة", "قطار", "مواصلات","insurance",
    "rapatriement", "garantie", "indemnisation", "déclaration", "assistance",
    "تأمين",
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

    def __init__(self):
        self._agents = {
            AgentType.LEISURE:   LeisureAgent(),
            AgentType.LOGISTICS: LogisticsAgent(),
            AgentType.EMERGENCY: EmergencyAgent(),
            AgentType.GENERAL:   GeneralAgent(),
        }

    # ── NOUVEAU : détecte une liste d'agents ──────────────────────────────────
    def _detect_agents(self, message: str) -> list[AgentType]:
        """
        Retourne la liste de tous les agents concernés par le message.
        Si un seul domaine → liste avec 1 agent.
        Si plusieurs → liste avec 2-3 agents (sans GENERAL).
        """
        msg_lower = message.lower()
        detected  = []

        # Urgence — priorité maximale, toujours seul
        if any(kw in msg_lower for kw in EMERGENCY_KEYWORDS):
            return [AgentType.EMERGENCY]

        if any(kw in msg_lower for kw in LOGISTICS_KEYWORDS):
            detected.append(AgentType.LOGISTICS)

        if any(kw in msg_lower for kw in LEISURE_KEYWORDS):
            detected.append(AgentType.LEISURE)

        # Aucun domaine détecté → General
        if not detected:
            return [AgentType.GENERAL]

        return detected  # Peut contenir 1 ou 2 agents

    # ── handle() mis à jour ───────────────────────────────────────────────────
    def handle(
        self,
        message:    str,
        session_id: str = "default",
        language:   str = "fr",
    ) -> ChatResponse:

        agent_types = self._detect_agents(message)

        print(f"[ORCHESTRATOR] Message    : '{message[:60]}…'")
        print(f"[ORCHESTRATOR] Agent(s)   : {[a.value for a in agent_types]}")

        # ── Cas simple : 1 seul agent (comportement inchangé) ─────────────────
        if len(agent_types) == 1:
            result = self._agents[agent_types[0]].run(message, language=language)

        # ── Cas multi-agents : collecte + fusion via GeneralAgent ─────────────
        else:
            results = []
            for agent_type in agent_types:
                r = self._agents[agent_type].run(message, language=language)
                results.append(r)
                print(f"[ORCHESTRATOR] ✅ {agent_type.value} a répondu.")

            # GeneralAgent fusionne toutes les réponses
            result = self._agents[AgentType.GENERAL].synthesize(
                user_message=message,
                agent_results=results,
                language=language,
            )
            print(f"[ORCHESTRATOR] 🔀 Fusion effectuée par GeneralAgent.")

        return ChatResponse(
            agent      = result["agent"],
            response   = result["response"],
            sources    = result["sources"],
            session_id = session_id,
        )

    def get_agent_for_category(self, category: str) -> AgentType:
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