"""
agents/base_agent.py
"""
import os
from abc import ABC, abstractmethod
from groq import Groq
from rag.retriever import retrieve, format_context
from models.schemas import AgentType, Source


class BaseAgent(ABC):

    MODEL = "llama-3.1-8b-instant"

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    @property
    @abstractmethod
    def agent_type(self) -> AgentType:
        pass

    @property
    @abstractmethod
    def categories(self) -> list[str]:
        pass

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        pass

    def _get_active_categories(self) -> list[str]:
        val = getattr(self, "_override_categories", None)
        return val if val else self.categories

    def _get_active_prompt(self) -> str:
        val = getattr(self, "_override_prompt", None)
        return val if val else self.system_prompt

    def run(self, user_message: str, language: str = "fr") -> dict:
        active_categories = self._get_active_categories()
        active_prompt     = self._get_active_prompt()

        # Recherche RAG par catégorie
        all_docs = []
        for cat in active_categories:
            docs = retrieve(user_message, n_results=3, category_filter=cat)
            all_docs.extend(docs)

        # Fallback recherche globale si rien trouvé
        if not all_docs:
            all_docs = retrieve(user_message, n_results=5)

        # Déduplique et trie par score
        seen = set()
        unique_docs = []
        for d in sorted(all_docs, key=lambda x: x["score"], reverse=True):
            key = d["text"][:80]
            if key not in seen:
                seen.add(key)
                unique_docs.append(d)

        context = format_context(unique_docs[:5])

        # ✅ Instruction de langue claire dans toutes les langues
        lang_instruction = {
            "fr": "You MUST reply in French. Ne réponds qu'en français.",
            "en": "You MUST reply in English only.",
            "ar": "يجب أن تجيب باللغة العربية فقط. Do NOT use French or English.",
        }.get(language, "Reply in the same language as the question.")

        full_system = f"{active_prompt}\n\nLANGUAGE (mandatory): {lang_instruction}"

        # ✅ user_content 100% neutre — zéro mot français
        user_content = f"{user_message}\n\n---\n{context}\n---"

        completion = self.client.chat.completions.create(
            model=self.MODEL,
            messages=[
                {"role": "system", "content": full_system},
                {"role": "user",   "content": user_content},
            ],
            temperature=0.2,
            max_tokens=500,
        )

        response_text = completion.choices[0].message.content

        sources = [
            Source(
                text=d["text"][:200],
                category=d["category"],
                source=d["source"],
                score=d["score"],
            )
            for d in unique_docs[:3]
        ]

        # Nettoyage overrides
        for attr in ("_override_categories", "_override_prompt"):
            try:
                delattr(self, attr)
            except AttributeError:
                pass

        return {
            "agent":    self.agent_type,
            "response": response_text,
            "sources":  sources,
        }