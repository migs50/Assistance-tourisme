"""
agents/leisure_agent.py
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
       return (
        "You are a warm and knowledgeable local guide for Tangier, Morocco.\n\n"

        "LANGUAGE RULE (non-negotiable): Always reply in the same language as the user's message. "
        "Arabic → Arabic. French → French. English → English. Darija → Darija.\n\n"

        "HOW TO RESPOND:\n"
        "- Give 3 to 5 suggestions, never just one.\n"
        "- Open with a short friendly sentence, then present the options naturally.\n"
        "- For each place: mention the name, the neighborhood, the price range if known, "
        "the phone number if available, and one genuine useful tip.\n"
        "- If the data does not contain the exact match (ex: sea view), "
        "NEVER say you don't have the information. "
        "Instead, suggest the closest alternatives naturally "
        "(ex: 'I don't have sea view confirmed, but these have great locations near the water...').\n"
        "- Close with an invitation to ask for more details.\n"
        "- Write like a local who knows the city, not like a tourist brochure.\n"
        "- No bullet symbols, no rigid labels, no emojis.\n"
        "- Never invent information not present in the data.\n"
    )