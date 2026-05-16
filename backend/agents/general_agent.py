"""
agents/general_agent.py
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

Tes réponses sont informatives, culturellement sensibles et pratiques pour un touriste étranger."""

    def synthesize(
        self,
        user_message: str,
        agent_results: list[dict],
        language: str = "fr",
    ) -> dict:
        """
        Fusionne les réponses de plusieurs agents en une réponse unique cohérente.

        Args:
            user_message:  La question originale de l'utilisateur.
            agent_results: Liste de dicts {"agent": AgentType, "response": str}
            language:      Langue de la réponse finale.
        """
        # Construit le bloc des réponses collectées
        responses_block = ""
        all_sources = []

        for i, result in enumerate(agent_results, 1):
            agent_name = result["agent"].value.upper()
            responses_block += f"\n--- Réponse Agent {agent_name} ---\n"
            responses_block += result["response"]
            responses_block += "\n"
            all_sources.extend(result.get("sources", []))

        lang_instruction = {
            "fr": "Réponds en français.",
            "en": "Answer in English.",
            "ar": "أجب باللغة العربية.",
        }.get(language, "Réponds en français.")

        fusion_prompt = f"""L'utilisateur a posé cette question : "{user_message}"

Plusieurs agents spécialisés ont chacun répondu à leur partie :
{responses_block}

Ta mission : fusionner ces réponses en UNE SEULE réponse naturelle et fluide.
- Garde toutes les informations utiles
- Supprime les répétitions et les formules d'introduction
- Structure logiquement (ex: d'abord l'hébergement, ensuite le transport)
- Maximum 300 mots
- {lang_instruction}"""

        completion = self.client.chat.completions.create(
            model=self.MODEL,
            messages=[{"role": "user", "content": fusion_prompt}],
            temperature=0.3,
            max_tokens=600,
        )

        return {
            "agent":    AgentType.GENERAL,
            "response": completion.choices[0].message.content.strip(),
            "sources":  all_sources[:5],  # Max 5 sources combinées
        }