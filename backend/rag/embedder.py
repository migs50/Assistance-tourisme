"""
rag/embedder.py
Génère les embeddings de tous les documents et les indexe dans ChromaDB.
À exécuter UNE SEULE FOIS pour construire la base vectorielle.
"""
import sys
import os

# Configure stdout/stderr to use UTF-8 to prevent UnicodeEncodeError on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path
from rag.loader import load_all_documents

# Dossier où ChromaDB sauvegarde l'index sur le disque
CHROMA_PATH = Path(__file__).resolve().parent.parent / "chroma_db"


# Modèle d'embedding multilingue (français + arabe + anglais)
EMBEDDING_MODEL  = "paraphrase-multilingual-MiniLM-L12-v2"
COLLECTION_NAME  = "tanger_V2"


def get_chroma_client() -> chromadb.PersistentClient:
    """Retourne un client ChromaDB persistant."""
    return chromadb.PersistentClient(path=str(CHROMA_PATH))


def get_collection(client: chromadb.PersistentClient):
    """Retourne la collection ChromaDB avec le bon modèle d'embedding."""
    emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBEDDING_MODEL
    )
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=emb_fn,
        metadata={"hnsw:space": "cosine"}
    )


def build_index(force_rebuild: bool = False) -> None:
    """
    Construit l'index vectoriel à partir de tous les documents du dataset.

    Args:
        force_rebuild: Si True, supprime et reconstruit l'index complet.
    """
    client = get_chroma_client()

    if force_rebuild:
        try:
            client.delete_collection(COLLECTION_NAME)
            print("[EMBEDDER] 🗑️  Ancien index supprimé.")
        except Exception:
            pass

    collection = get_collection(client)

    # Ne pas re-indexer si déjà fait
    if collection.count() > 0 and not force_rebuild:
        print(f"[EMBEDDER] ✅ Index déjà existant ({collection.count()} documents). Rien à faire.")
        return

    print("[EMBEDDER] 🔄 Construction de l'index vectoriel...")
    documents = load_all_documents()

    # Prépare les batches pour ChromaDB
    texts    = []
    ids      = []
    metadatas = []

    for i, doc in enumerate(documents):
        text = doc.get("_text", "")
        if not text.strip():
            continue

        texts.append(text)
        ids.append(f"doc_{i}")
        metadatas.append({
            "category": doc.get("_category", "inconnu"),
            "source":   doc.get("_source",   "inconnu"),
        })

    # Indexation par batch de 100 pour éviter les timeouts
    BATCH_SIZE = 100
    total = len(texts)

    for start in range(0, total, BATCH_SIZE):
        end = min(start + BATCH_SIZE, total)
        collection.add(
            documents=texts[start:end],
            ids=ids[start:end],
            metadatas=metadatas[start:end],
        )
        print(f"[EMBEDDER] 📥 Indexé {end}/{total} documents...")

    print(f"\n[EMBEDDER] 🎉 Index construit : {collection.count()} documents indexés.\n")


if __name__ == "__main__":
    build_index(force_rebuild=True)