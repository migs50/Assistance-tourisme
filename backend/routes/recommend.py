"""
routes/recommend.py
Endpoint de recommandation directe par catégorie (sans conversation).
POST /recommend → recherche RAG pure → liste de résultats
"""
from fastapi import APIRouter, HTTPException
from models.schemas      import RecommendRequest, RecommendResponse, Source
from models.schemas      import AgentType
from rag.retriever       import retrieve
from agents.orchestrator import Orchestrator

router       = APIRouter(prefix="/api", tags=["Recommandations"])
orchestrator = Orchestrator()


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest) -> RecommendResponse:
    """
    Recherche RAG directe : retourne les documents les plus pertinents
    pour une requête, avec filtre optionnel par catégorie.
    """
    try:
        docs = retrieve(
            query           = req.query,
            n_results       = req.limit,
            category_filter = req.category,
        )

        sources = [
            Source(
                text     = doc["text"],
                category = doc["category"],
                source   = doc["source"],
                score    = doc["score"],
            )
            for doc in docs
        ]

        return RecommendResponse(
            query   = req.query,
            results = sources,
            total   = len(sources),
        )

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur RAG : {e}")


@router.get("/categories", tags=["Recommandations"])
async def list_categories():
    """Liste toutes les catégories disponibles dans la base de données."""
    return {
        "categories": [
            {"key": "hotel",            "label": "Hôtels",             "agent": "leisure"},
            {"key": "restaurant",       "label": "Restaurants",        "agent": "leisure"},
            {"key": "activite",         "label": "Activités",          "agent": "leisure"},
            {"key": "plage",            "label": "Plages",             "agent": "leisure"},
            {"key": "musee",            "label": "Musées",             "agent": "leisure"},
            {"key": "lieu_touristique", "label": "Lieux touristiques", "agent": "leisure"},
            {"key": "evenement",        "label": "Événements",         "agent": "leisure"},
            {"key": "transport",        "label": "Transports",         "agent": "logistics"},
            {"key": "itineraire",       "label": "Itinéraires",        "agent": "logistics"},
            {"key": "assurance",        "label": "Assurances Voyage",  "agent": "logistics"}, # Ajouté
            {"key": "service_urgence",  "label": "Services d'urgence", "agent": "emergency"},
            {"key": "faq",              "label": "FAQ",                "agent": "general"},
            {"key": "avis",             "label": "Avis touristes",     "agent": "leisure"},
        ]
    }