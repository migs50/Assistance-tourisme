"""
agents/logistics_agent.py
Agent spécialisé dans la logistique du voyage à Tanger :
transports (taxi, bus, train, ferry, navette) ET assurances voyage.
"""
from agents.base_agent import BaseAgent
from models.schemas import AgentType

# Mots-clés pour détecter si la question concerne l'assurance
ASSURANCE_KEYWORDS = [
    "assurance", "couverture", "sinistre", "remboursement",
    "rapatriement", "garantie", "axa", "allianz",
    "contrat", "assistance", "indemnisation", "déclaration",
    "insurance", "coverage", "claim",
]

TRANSPORT_SYSTEM_PROMPT = """Tu es un assistant transport local à Tanger. SOIS ULTRA-PRÉCIS et CONTEXTUEL.

RÈGLES STRICTES :
- Question en arabe → reponse en arabe uniquement
- Question en francais → reponse en francais uniquement
- Question en anglais → reponse en anglais uniquement
- Réponds UNIQUEMENT avec les transports pertinents pour la destination demandée
- Ne mentionne JAMAIS un transport qui ne dessert pas la destination
- Si un transport ne va pas à la destination → ne le mentionne PAS
- Maximum 3 options, triées par pertinence

FORMAT OBLIGATOIRE :
🚗 [Moyen] → [Destination] | [Prix MAD] | [Durée estimée]
💡 [1 conseil pratique ultra-court]

INTERDIT : politesses, phrases longues, transports non pertinents."""

ASSURANCE_SYSTEM_PROMPT = """Tu es un conseiller en assurance voyage spécialisé pour les touristes à Tanger.

FORMAT OBLIGATOIRE :
🛡️ [Nom assureur] | [Type de couverture] | [Prix indicatif]
📞 [Numéro assistance si disponible]
💡 [1 conseil pratique]

RÈGLES STRICTES :
- Mentionne uniquement les assureurs accessibles aux étrangers
- Précise toujours si le support est multilingue (FR/EN/AR)
- Indique la procédure d'urgence si demandée
- INTERDIT : recommander CNOPS/CMIM (réservées aux Marocains)
- OBLIGATOIRE : données réelles uniquement, pas d'inventions."""


class LogisticsAgent(BaseAgent):

    @property
    def agent_type(self) -> AgentType:
        return AgentType.LOGISTICS

    @property
    def categories(self) -> list[str]:
        return ["transport", "itineraire", "assurance"]

    @property
    def system_prompt(self) -> str:
        # Prompt par défaut transport — surchargé dynamiquement dans run()
        return TRANSPORT_SYSTEM_PROMPT

    def run(self, user_message: str, language: str = "fr") -> dict:
        """
        Surcharge run() pour choisir dynamiquement le bon prompt
        selon que la question porte sur le transport ou l'assurance.
        """
        msg_lower = user_message.lower()
        is_assurance = any(kw in msg_lower for kw in ASSURANCE_KEYWORDS)

        if is_assurance:
            self._override_categories = ["assurance"]
            self._override_prompt     = ASSURANCE_SYSTEM_PROMPT
            print(f"[LOGISTICS] Mode : ASSURANCE")
        else:
            self._override_categories = ["transport", "itineraire"]
            self._override_prompt     = TRANSPORT_SYSTEM_PROMPT
            print(f"[LOGISTICS] Mode : TRANSPORT")

        return super().run(user_message, language=language)