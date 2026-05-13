"""
agents/base_agent.py
Classe de base abstraite partagée par tous les agents.
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
        # Utilise les catégories et prompt actifs (surchargés ou par défaut)
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

        lang_instruction = {
            "fr": "Réponds toujours en français.",
            "en": "Always answer in English.",
            "ar": "أجب دائماً باللغة العربية.",
        }.get(language, "Réponds toujours en français.")

        full_system = f"{active_prompt}\n\n{lang_instruction}"

        user_content = f"""Question du touriste : {user_message}

{context}

En te basant UNIQUEMENT sur les informations ci-dessus, donne une réponse précise et directe.
Si l'information n'est pas disponible dans les données, dis-le clairement."""

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

        # Nettoyage des overrides après exécution
        self._override_categories = None
        self._override_prompt     = None
        if hasattr(self, "_override_categories"):
          del self._override_categories
        if hasattr(self, "_override_prompt"):
          del self._override_prompt

        return {
            "agent":    self.agent_type,
            "response": response_text,
            "sources":  sources,
        }