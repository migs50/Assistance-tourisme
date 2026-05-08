"""
agents/base_agent.py
Classe de base abstraite partagée par tous les agents.
Chaque agent hérite de BaseAgent et surcharge `system_prompt` et `categories`.
"""
import os
from abc import ABC, abstractmethod
from groq import Groq
from rag.retriever import retrieve, format_context
from models.schemas import AgentType, Source


class BaseAgent(ABC):
    """Agent de base : récupère le contexte RAG puis génère une réponse Llama 3."""

    MODEL = "llama-3.1-8b-instant"   # Modèle Groq disponible en avril 2025

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    # ── À surcharger dans chaque agent ────────────────────────────────────────

    @property
    @abstractmethod
    def agent_type(self) -> AgentType:
        """Type de l'agent (utilisé dans la réponse API)."""

    @property
    @abstractmethod
    def categories(self) -> list[str]:
        """Catégories RAG que cet agent utilise."""

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """Prompt système spécifique à l'agent."""

    # ── Méthode principale ────────────────────────────────────────────────────

    def run(self, user_message: str, language: str = "fr") -> dict:
        """
        1. Récupère les documents pertinents dans ChromaDB.
        2. Construit le prompt avec contexte RAG.
        3. Appelle Groq / Llama 3 et retourne la réponse.
        """
        # Recherche RAG — on essaie chaque catégorie de l'agent
        all_docs = []
        for cat in self.categories:
            docs = retrieve(user_message, n_results=3, category_filter=cat)
            all_docs.extend(docs)

        # Si aucun doc trouvé avec filtre, recherche globale
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

        # Construction du prompt
        lang_instruction = {
            "fr": "Réponds toujours en français.",
            "en": "Always answer in English.",
            "ar": "أجب دائماً باللغة العربية.",
        }.get(language, "Réponds toujours en français.")

        full_system = f"{self.system_prompt}\n\n{lang_instruction}"

        user_content = f"""Question du touriste : {user_message}

{context}

En te basant UNIQUEMENT sur les informations ci-dessus, donne une réponse précise, utile et amicale.
Si l'information n'est pas disponible, dis-le poliment et propose une alternative."""

        # Appel Groq
        completion = self.client.chat.completions.create(
            model=self.MODEL,
            messages=[
                {"role": "system",  "content": full_system},
                {"role": "user",    "content": user_content},
            ],
            temperature=0.2,   
            max_tokens=500,  
        )

        response_text = completion.choices[0].message.content

        # Sources à retourner
        sources = [
            Source(
                text=d["text"][:200],
                category=d["category"],
                source=d["source"],
                score=d["score"],
            )
            for d in unique_docs[:3]
        ]

        return {
            "agent":    self.agent_type,
            "response": response_text,
            "sources":  sources,
        }