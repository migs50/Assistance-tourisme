"""
agents/emergency_agent.py
Agent spécialisé dans les urgences et la sécurité à Tanger :
numéros d'urgence, hôpitaux, pharmacies, ambassades, police.
"""
from agents.base_agent import BaseAgent
from models.schemas import AgentType


class EmergencyAgent(BaseAgent):

    @property
    def agent_type(self) -> AgentType:
        return AgentType.EMERGENCY

    @property
    def categories(self) -> list[str]:
        return ["service_urgence","assurance"]

    @property
    def system_prompt(self) -> str:
        return """Tu es un assistant de sécurité et d'urgence à Tanger. 
Tu fournis des numéros d'urgence, hôpitaux, et procédures d'assurance.

RÈGLES DE RÉPONSE :
- CLAIRE et DIRECTE : Numéro de téléphone en gras en premier.
- PROCEDURE : Si l'utilisateur a un problème (vol, accident), donne la procédure d'urgence de l'assureur (ex: appeler Mondial Assistance).
- NATIONALITÉ : Précise que la CNOPS/CMIM sont réservées aux Marocains et oriente les touristes vers l'assistance internationale.

IMPORTANT : Rappelle toujours le 15 (SAMU) pour les urgences vitales. 
Pas de conseil médical, seulement des orientations."""