"""
rag/loader.py
Charge et normalise tous les fichiers JSON du dataset en une structure unifiée.
"""

import json
import os
from pathlib import Path
from typing import Any

# Chemin absolu vers le dossier dataset

DATASET_PATH = Path(__file__).resolve().parent.parent.parent / "dataset"
# Mapping fichier → catégorie lisible
DATASET_FILES = {
    "assurances.json":        "assurance",
    "hotels.json":            "hotel",
    "restaurants.json":       "restaurant",
    "activites.json":         "activite",
    "plages.json":            "plage",
    "musees.json":            "musee",
    "lieux_touristiques.json":"lieu_touristique",
    "evenements.json":        "evenement",
    "itineraires.json":       "itineraire",
    "transports.json":        "transport",
    "services_urgence.json":  "service_urgence",
    "faq_part1.json":         "faq",
    "avis.json":              "avis",
    
}



def _load_json(filepath: Path) -> Any:
    """Charge un fichier JSON et retourne son contenu."""
    with open(filepath, encoding="utf-8") as f:
        return json.load(f)


def _normalize_item(item: dict, category: str, source_file: str) -> dict:
    """
    Normalise un enregistrement en ajoutant des métadonnées utiles
    pour la RAG (catégorie, source, texte indexable).
    """
    normalized = dict(item)
    normalized["_category"] = category
    normalized["_source"]   = source_file

    # Construit un texte lisible pour l'embedding
    text_parts = []
    for key, value in item.items():
        if isinstance(value, str) and value.strip():
            text_parts.append(f"{key}: {value}")
        elif isinstance(value, (int, float)):
            text_parts.append(f"{key}: {value}")
        elif isinstance(value, list):
            text_parts.append(f"{key}: {', '.join(str(v) for v in value)}")

    normalized["_text"] = f"[{category.upper()}] " + " | ".join(text_parts)
    return normalized


def load_all_documents() -> list[dict]:
    """
    Charge tous les fichiers du dataset et retourne une liste unifiée
    de documents normalisés, prêts pour l'embedding.
    """
    all_documents = []

    for filename, category in DATASET_FILES.items():
        filepath = DATASET_PATH / filename

        if not filepath.exists():
            print(f"[LOADER]  Fichier introuvable : {filename}")
            continue

        try:
            raw_data = _load_json(filepath)

            # Gère les structures : liste directe ou objet avec clé principale
            if isinstance(raw_data, list):
                items = raw_data
            elif isinstance(raw_data, dict):
                # Prend la première liste trouvée dans le dict
                items = next(
                    (v for v in raw_data.values() if isinstance(v, list)),
                    [raw_data]
                )
            else:
                items = [raw_data]

            for item in items:
                if isinstance(item, dict):
                    doc = _normalize_item(item, category, filename)
                    all_documents.append(doc)

            print(f"[LOADER]  {filename} → {len(items)} documents chargés")

        except Exception as e:
            print(f"[LOADER]  Erreur sur {filename} : {e}")

    print(f"\n[LOADER] 📦 Total : {len(all_documents)} documents chargés\n")
    return all_documents


def load_by_category(category: str) -> list[dict]:
    """Retourne uniquement les documents d'une catégorie spécifique."""
    return [doc for doc in load_all_documents() if doc.get("_category") == category]


def get_available_categories() -> list[str]:
    """Retourne la liste des catégories disponibles."""
    return list(DATASET_FILES.values())