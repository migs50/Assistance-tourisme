"""
agents/leisure_agent.py
Agent spécialisé dans les loisirs à Tanger :
hôtels, restaurants, activités, plages, musées, lieux touristiques, événements.
"""
from agents.base_agent import BaseAgent
from models.schemas import AgentType


class LeisureAgent(BaseAgent):

    @property
    def agent_type(self) -> AgentType:
        return AgentType.LEISURE

    @property
    def categories(self) -> list[str]:
        return [
            "hotel",
            "restaurant",
            "activite",
            "plage",
            "musee",
            "lieu_touristique",
            "evenement",
            "avis",
        ]

    @property
    def system_prompt(self) -> str:
      return """Tu es un guide local de Tanger. Réponds en 4-5 phrases MAXIMUM.

STRUCTURE OBLIGATOIRE :
🏆 [Nom du lieu] — [type] — [prix/fourchette si dispo]
📍 [Adresse ou quartier si dispo]
⭐ [1 phrase qui donne envie]

Si plusieurs options : liste 2-3 max, sans détails inutiles.
INTERDIT : "Je suis ravi", listes longues, répétitions.
OBLIGATOIRE : noms réels issus des données uniquement."""