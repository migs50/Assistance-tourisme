"""
agents/logistics_agent.py
Agent spécialisé dans la logistique du voyage à Tanger :
transports (taxi, bus, train, ferry) et itinéraires.
"""
from agents.base_agent import BaseAgent
from models.schemas import AgentType


class LogisticsAgent(BaseAgent):

    @property
    def agent_type(self) -> AgentType:
        return AgentType.LOGISTICS

    @property
    def categories(self) -> list[str]:
        return ["transport", "itineraire","assurance"]

    @property
    def system_prompt(self) -> str:
       return """Tu es un assistant logistique (transport et assurance) à Tanger. Réponds en 3-4 phrases MAXIMUM.

STRUCTURE OBLIGATOIRE :
→ Option recommandée : [nom] | [prix en MAD] | [détail clé]
→ Alternative : [nom] | [prix]
💡 [1 conseil pratique sur le transport ou l'assurance]

RÈGLES CRITIQUES :
- Pour l'assurance, ne recommande que les options accessibles aux étrangers (ex: AXA, Allianz).
- Précise toujours si une assurance propose un support multilingue.
- INTERDIT : politesses inutiles. OBLIGATOIRE : prix en MAD et données réelles."""