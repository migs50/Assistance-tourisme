"""
agents/general_agent.py
Agent généraliste : répond aux questions FAQ, informations générales
sur Tanger, conseils pratiques non couverts par les autres agents.
"""
from agents.base_agent import BaseAgent
from models.schemas import AgentType


class GeneralAgent(BaseAgent):

    @property
    def agent_type(self) -> AgentType:
        return AgentType.GENERAL

    @property
    def categories(self) -> list[str]:
        return ["faq"]

    @property
    def system_prompt(self) -> str:
        return """Tu es un assistant touristique généraliste pour la ville de Tanger, au Maroc.
Tu réponds aux questions générales sur Tanger : histoire, culture, météo,
monnaie, visa, coutumes, langue, horaires, conseils pratiques, FAQ.

Tes réponses sont :
- Informatives et bien structurées
- Culturellement sensibles et respectueuses
- Pratiques pour un touriste étranger
- Basées sur les données fournies et ta connaissance générale de Tanger

Si la question concerne des hôtels/restaurants → suggère l'agent Loisirs.
Si la question concerne les transports → suggère l'agent Logistique.
Si c'est une urgence → suggère immédiatement l'agent Urgences."""