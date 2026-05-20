"""
Router — /api/analytics/*
==========================
Endpoints de tracking anonyme et KPIs IA.

Architecture Event Sourcing légère :
  Client → POST /api/analytics/track/recommendation → SQLite → GET /api/analytics/recommendations

Aucun cookie, aucune authentification.
Le session_id est un UUID généré côté client (localStorage) et transmis dans les requêtes.
"""

import logging

from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse

from services.analytics_service import AnalyticsService
from schemas.models import (
    TrackRecommendationRequest,
    TrackSearchRequest,
    TrackClickRequest,
    TrackChatbotRequest,
    TrackResponse,
)

logger = logging.getLogger("tanger.router.analytics")
router = APIRouter()

_analytics_service: AnalyticsService | None = None

def get_analytics_service() -> AnalyticsService:
    global _analytics_service
    if _analytics_service is None:
        _analytics_service = AnalyticsService()
    return _analytics_service


# ─── LECTURE : KPIs Analytics ────────────────────────────────────────────────

@router.get(
    "/recommendations",
    summary="KPIs du système de recommandation IA",
    description="""
Statistiques agrégées des recommandations générées par le système IA.

**KPIs retournés :**
- Total recommandations générées
- Catégorie la plus populaire
- Activité la plus demandée
- Budget préféré
- Distribution par catégorie et budget
- Tendance sur 7 jours
""",
)
async def get_recommendation_stats():
    try:
        data = get_analytics_service().get_recommendation_stats()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /analytics/recommendations: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get(
    "/searches",
    summary="KPIs des recherches utilisateurs",
    description="""
Analyse des requêtes de recherche effectuées sur la plateforme.

**KPIs :**
- Total recherches
- Top 10 requêtes les plus fréquentes
- Nombre moyen de résultats
- Distribution horaire (dernières 24h)
""",
)
async def get_search_stats():
    try:
        data = get_analytics_service().get_search_stats()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /analytics/searches: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get(
    "/chatbot",
    summary="KPIs du chatbot RAG",
    description="""
Métriques d'utilisation du chatbot IA.

**KPIs :**
- Total requêtes chatbot
- Requêtes dernières 24h
- Top intents détectés
- Temps de réponse moyen (ms)
""",
)
async def get_chatbot_stats():
    try:
        data = get_analytics_service().get_chatbot_stats()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /analytics/chatbot: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get(
    "/clicks",
    summary="KPIs des clics sur recommandations",
)
async def get_click_stats():
    try:
        data = get_analytics_service().get_click_stats()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /analytics/clicks: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get(
    "/dashboard",
    summary="Dashboard analytique complet (tout en un)",
    description="Agrège tous les KPIs analytics en un seul appel pour le dashboard.",
)
async def get_analytics_dashboard():
    """Appel unique pour charger tout le dashboard analytics."""
    try:
        svc = get_analytics_service()
        return JSONResponse(content={
            "recommendations": svc.get_recommendation_stats(),
            "searches":        svc.get_search_stats(),
            "chatbot":         svc.get_chatbot_stats(),
            "clicks":          svc.get_click_stats(),
        })
    except Exception as e:
        logger.error(f"Erreur /analytics/dashboard: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── ÉCRITURE : Tracking des événements ──────────────────────────────────────

@router.post(
    "/track/recommendation",
    response_model=TrackResponse,
    summary="Tracker une recommandation IA générée",
    description="""
Enregistre une recommandation générée par le système IA.

**Appelé automatiquement** quand le chatbot ou le système de reco retourne des résultats.

**Body exemple :**
```json
{
  "session_id": "uuid-anonyme-client",
  "category": "culture",
  "budget": "moyen",
  "activity": "Visite de la Kasbah",
  "items": ["Kasbah Museum", "Grand Socco", "Dar el Makhzen"]
}
```
""",
)
async def track_recommendation(payload: TrackRecommendationRequest):
    try:
        get_analytics_service().track_recommendation(
            session_id=payload.session_id,
            category=payload.category,
            budget=payload.budget,
            activity=payload.activity,
            items=payload.items,
        )
        return TrackResponse(success=True, message="Recommandation enregistrée")
    except Exception as e:
        logger.error(f"Erreur track_recommendation: {e}")
        return TrackResponse(success=False, message=str(e))


@router.post(
    "/track/search",
    response_model=TrackResponse,
    summary="Tracker une recherche utilisateur",
)
async def track_search(payload: TrackSearchRequest):
    try:
        get_analytics_service().track_search(
            session_id=payload.session_id,
            query=payload.query,
            filters=payload.filters,
            results_count=payload.results_count,
        )
        return TrackResponse(success=True, message="Recherche enregistrée")
    except Exception as e:
        return TrackResponse(success=False, message=str(e))


@router.post(
    "/track/click",
    response_model=TrackResponse,
    summary="Tracker un clic sur un item",
    description="""
Enregistre quand un utilisateur clique sur une recommandation ou un résultat.

**Body exemple :**
```json
{
  "session_id": "uuid",
  "item_type": "hotel",
  "item_id": "hyatt_regency_tanger",
  "item_name": "Hyatt Regency Tanger"
}
```
""",
)
async def track_click(payload: TrackClickRequest):
    try:
        get_analytics_service().track_click(
            session_id=payload.session_id,
            item_type=payload.item_type,
            item_id=payload.item_id,
            item_name=payload.item_name,
        )
        return TrackResponse(success=True, message="Clic enregistré")
    except Exception as e:
        return TrackResponse(success=False, message=str(e))


@router.post(
    "/track/chatbot",
    response_model=TrackResponse,
    summary="Tracker une requête chatbot",
)
async def track_chatbot(payload: TrackChatbotRequest):
    try:
        get_analytics_service().track_chatbot(
            session_id=payload.session_id,
            query=payload.query,
            intent=payload.intent,
            response_ms=payload.response_ms,
        )
        return TrackResponse(success=True, message="Requête chatbot enregistrée")
    except Exception as e:
        logger.error(f"Erreur track_chatbot: {e}")
        return TrackResponse(success=False, message=str(e))