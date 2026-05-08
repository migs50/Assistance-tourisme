"""
routes/chat.py
Endpoint principal de conversation avec le système multi-agents.
POST /chat → détection d'intention → agent → réponse RAG + LLM
"""
from fastapi import APIRouter, HTTPException
from models.schemas  import ChatRequest, ChatResponse
from agents.orchestrator import Orchestrator

router       = APIRouter(prefix="/api", tags=["Chat"])
orchestrator = Orchestrator()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """
    Envoie un message au système multi-agents.
    L'orchestrateur détecte l'intention et route vers le bon agent.
    """
    try:
        response = orchestrator.handle(
            message    = req.message,
            session_id = req.session_id,
            language   = req.language,
        )
        return response

    except RuntimeError as e:
        # Index RAG vide
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne : {e}")


@router.get("/agents", tags=["Chat"])
async def list_agents():
    """Liste les agents disponibles et leurs domaines."""
    return {
        "agents": [
            {
                "type":        "leisure",
                "description": "Hôtels, restaurants, plages, musées, activités, événements",
                "keywords":    ["hôtel", "restaurant", "plage", "musée", "activité"],
            },
            {
                "type":        "logistics",
                "description": "Transports, itinéraires, déplacements et assurances voyage", # Modifié
                "keywords":    ["taxi", "bus", "train", "ferry", "itinéraire", "assurance"], # Ajouté
            },
            {
                "type":        "emergency",
                "description": "Urgences, sécurité, hôpitaux, police et assistance assurance", # Modifié
                "keywords":    ["urgence", "hôpital", "police", "ambulance", "rapatriement"], # Ajouté
            },
            {
                "type":        "general",
                "description": "FAQ, informations générales sur Tanger",
                "keywords":    ["culture", "météo", "monnaie", "visa", "conseil"],
            },
        ]
    }