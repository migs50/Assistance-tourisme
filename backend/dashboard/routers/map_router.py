"""
Router — /api/map/*
====================
Endpoints géographiques pour alimenter la carte interactive.

Tous retournent du GeoJSON standard compatible Leaflet / Mapbox.

Intégration Leaflet (frontend React) :
  import { GeoJSON } from 'react-leaflet'
  fetch('/api/map/hotels').then(r => r.json()).then(data => setHotels(data))

Clustering côté frontend :
  import MarkerClusterGroup from 'react-leaflet-cluster'
  <MarkerClusterGroup><GeoJSON data={hotels} /></MarkerClusterGroup>
"""

import logging

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from services.map_service import MapService

logger = logging.getLogger("tanger.router.map")
router = APIRouter()

# Service instancié une seule fois (DataLoader déjà en mémoire)
_map_service: MapService | None = None

def get_map_service() -> MapService:
    global _map_service
    if _map_service is None:
        _map_service = MapService()
    return _map_service


# ─── /api/map/hotels ─────────────────────────────────────────────────────────

@router.get(
    "/hotels",
    summary="Hôtels en GeoJSON",
    description="""
Retourne les hôtels de Tanger en GeoJSON pour affichage sur carte.

**Filtres disponibles :**
- `budget` : économique | moyen | luxe
- `localisation` : médina | centre-ville | plage
- `type` : couple | solo | famille
- `piscine` : true | false
- `vue_mer` : true | false

**Intégration Leaflet :**
```javascript
const response = await fetch('/api/map/hotels?budget=luxe')
const geojson = await response.json()
L.geoJSON(geojson, { pointToLayer: ... }).addTo(map)
```
""",
)
async def get_hotels(
    budget:        str | None = Query(None, description="économique | moyen | luxe"),
    localisation:  str | None = Query(None, description="médina | centre-ville | plage"),
    type_voyageur: str | None = Query(None, alias="type"),
    piscine:       bool | None = Query(None),
    vue_mer:       bool | None = Query(None),
):
    try:
        data = get_map_service().get_hotels_geojson(
            budget=budget,
            localisation=localisation,
            type_voyageur=type_voyageur,
            piscine=piscine,
            vue_mer=vue_mer,
        )
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /map/hotels: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/map/restaurants ────────────────────────────────────────────────────

@router.get("/restaurants", summary="Restaurants en GeoJSON")
async def get_restaurants(
    budget:       str | None = Query(None, description="économique | moyen | luxe"),
    cuisine:      str | None = Query(None, description="marocaine | internationale | café"),
    localisation: str | None = Query(None),
    ambiance:     str | None = Query(None, description="calme | romantique | moderne"),
    vue_mer:      bool | None = Query(None),
):
    try:
        data = get_map_service().get_restaurants_geojson(
            budget=budget, cuisine=cuisine,
            localisation=localisation, ambiance=ambiance, vue_mer=vue_mer,
        )
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /map/restaurants: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/map/plages ─────────────────────────────────────────────────────────

@router.get("/plages", summary="Plages & Espaces naturels en GeoJSON")
async def get_plages(
    preference:   str | None = Query(None, description="plage animée | plage calme | randonnée | coucher de soleil"),
    compagnie:    str | None = Query(None, description="Solo | Entre amis | En famille"),
    localisation: str | None = Query(None, description="nord | sud | est | ouest | centre-ville | périphérie"),
    gratuit:      bool | None = Query(None),
):
    try:
        data = get_map_service().get_plages_geojson(
            preference=preference, compagnie=compagnie,
            localisation=localisation, gratuit=gratuit,
        )
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /map/plages: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/map/events ─────────────────────────────────────────────────────────

@router.get("/events", summary="Événements en GeoJSON")
async def get_events(
    category: str | None = Query(None, description="Musique | Culture | Cinéma | Sport"),
):
    try:
        data = get_map_service().get_events_geojson(category=category)
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /map/events: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/map/activities ─────────────────────────────────────────────────────

@router.get("/activities", summary="Activités touristiques en GeoJSON")
async def get_activities(
    type_activite: str | None = Query(None, alias="type", description="aventure | sport | culture | détente | gastronomie | nightlife | famille"),
    budget:        str | None = Query(None, description="économique | moyen | luxe"),
    localisation:  str | None = Query(None),
):
    try:
        data = get_map_service().get_activities_geojson(
            type_activite=type_activite, budget=budget, localisation=localisation,
        )
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /map/activities: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/map/lieux ──────────────────────────────────────────────────────────

@router.get("/lieux", summary="Lieux touristiques en GeoJSON (avec vraies coordonnées)")
async def get_lieux(
    categorie: str | None = Query(None, description="monument_historique | musee | parc_espace_vert | ..."),
    quartier:  str | None = Query(None, description="Kasbah | Médina | Centre-ville | ..."),
    gratuit:   bool | None = Query(None),
):
    try:
        data = get_map_service().get_lieux_geojson(
            categorie=categorie, quartier=quartier, gratuit=gratuit,
        )
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /map/lieux: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/map/transport ──────────────────────────────────────────────────────

@router.get(
    "/transport",
    summary="Transport public (stops + routes GeoJSON)",
    description="Retourne les arrêts de bus et lignes de transport d'ALSA Tanger.",
)
async def get_transport():
    try:
        data = get_map_service().get_transport_geojson()
        return JSONResponse(content={
            "stops_count":  data["stops"].get("features", []).__len__() if "stops" in data else 0,
            "routes_count": data["routes"].get("features", []).__len__() if "routes" in data else 0,
            "stops":  data.get("stops", {}),
        })
    except Exception as e:
        logger.error(f"Erreur /map/transport: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/map/all ────────────────────────────────────────────────────────────

@router.get(
    "/all",
    summary="Tous les markers en un seul appel",
    description="""
Optimisation réseau : retourne TOUS les types de markers en une seule requête.
Idéal pour le chargement initial de la carte.

Réduire les allers-retours HTTP → meilleure performance perçue.
""",
)
async def get_all_markers():
    try:
        data = get_map_service().get_all_markers()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /map/all: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})