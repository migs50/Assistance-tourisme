"""
rag/retriever.py
Effectue la recherche sémantique dans ChromaDB.
"""

from rag.embedder import get_chroma_client, get_collection


def retrieve(
    query: str,
    n_results: int = 5,
    category_filter: str | None = None,
) -> list[dict]:
    client     = get_chroma_client()
    collection = get_collection(client)

    if collection.count() == 0:
        raise RuntimeError("L'index ChromaDB est vide.")

    # --- CORRECTION ICI ---
    # Si la catégorie demandée est "assurance", on s'assure qu'elle matche bien
    # On rend le filtre optionnel si la recherche ne donne rien
    where = {"category": category_filter} if category_filter else None

    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        
        # Si aucun résultat avec le filtre, on réessaie SANS le filtre pour aider l'utilisateur
        if not results["documents"][0] and where:
            results = collection.query(
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
            )
    except Exception:
        # En cas d'erreur de filtre, on fait une recherche globale
        results = collection.query(query_texts=[query], n_results=n_results)

    documents = []
    # Vérification que results a bien des données
    if results["documents"] and len(results["documents"][0]) > 0:
        for text, meta, distance in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            documents.append({
                "text":     text,
                "category": meta.get("category", ""),
                "source":   meta.get("source",   ""),
                "score":    round(1 - distance, 4),
            })

    return documents

def format_context(documents: list[dict]) -> str:
    if not documents:
        return "Aucune information pertinente trouvée."

    lines = ["=== INFORMATIONS DISPONIBLES ===\n"]
    for i, doc in enumerate(documents, 1):
        lines.append(f"[Source {i} - {doc['category'].upper()}]")
        lines.append(doc["text"])
        lines.append("")

    return "\n".join(lines)