"""
Schemas Pydantic — Validation & Sérialisation des réponses API
==============================================================

Chaque endpoint retourne un schema typé.
Avantages :
  • Documentation automatique dans /docs
  • Validation des données en entrée/sortie
  • Autocomplétion dans le frontend TypeScript
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


# ─── Géographique ────────────────────────────────────────────────────────────

class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [lng, lat]


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: dict[str, Any]


class GeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[GeoJSONFeature]
    count: int


# ─── KPIs Globaux ────────────────────────────────────────────────────────────

class OverviewKPIs(BaseModel):
    total_lieux_touristiques: int
    total_activites: int
    total_hotels: int
    total_restaurants: int
    total_plages: int
    total_events: int
    total_avis: int
    total_utilisateurs: int


class PricingKPIs(BaseModel):
    prix_moyen_hotel_mad: float
    prix_moyen_restaurant_mad: float


class QualityKPIs(BaseModel):
    note_moyenne_globale: float
    total_avis_collectes: int


class QuartierStat(BaseModel):
    quartier: str
    count: int


class GlobalKPIsResponse(BaseModel):
    overview: OverviewKPIs
    pricing: PricingKPIs
    quality: QualityKPIs
    geography: dict[str, list[QuartierStat]]


# ─── Hôtels ──────────────────────────────────────────────────────────────────

class HotelSegment(BaseModel):
    categorie: str
    count: int
    prix_moyen: float
    prix_min: float
    prix_max: float
    rating_moyen: float


class HotelAnalyticsResponse(BaseModel):
    prix: dict[str, float]
    rating_moyen: float
    par_categorie: list[dict]
    par_localisation: list[dict]
    par_segment_prix: list[dict]
    amenites: dict[str, float]


# ─── Top Activités ────────────────────────────────────────────────────────────

class TopActivity(BaseModel):
    rang: int
    nom: str
    type: str
    budget: str
    prix: str
    rating: float
    note_bayesienne: float
    nb_avis: int
    score_hybride: float
    image: str
    description: str
    duree: str


class TopActivitiesResponse(BaseModel):
    methode: str
    prior_global_m: float
    prior_c: int
    poids: dict[str, float]
    top_activities: list[TopActivity]


# ─── Analytics ───────────────────────────────────────────────────────────────

class TrackRecommendationRequest(BaseModel):
    session_id: str = Field(..., description="UUID anonyme côté client")
    category: str = Field(default="", description="Catégorie demandée")
    budget: str = Field(default="", description="Budget sélectionné")
    activity: str = Field(default="", description="Activité spécifique")
    items: list[str] = Field(default=[], description="Noms des items retournés")


class TrackSearchRequest(BaseModel):
    session_id: str
    query: str
    filters: dict[str, Any] = {}
    results_count: int = 0


class TrackClickRequest(BaseModel):
    session_id: str
    item_type: str  # hotel, restaurant, activite, lieu, event
    item_id: str
    item_name: str


class TrackChatbotRequest(BaseModel):
    session_id: str
    query: str
    intent: str = ""
    response_ms: int = 0


class TrackResponse(BaseModel):
    success: bool
    message: str


# ─── Profil utilisateur ──────────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    profil_type: dict[str, Any]
    demographique: dict[str, Any]
    preferences: dict[str, Any]
    budget: dict[str, Any]
    saisons: dict[str, Any]
    total_profils_analyses: int