"""
routes/dashboard.py
Tous les endpoints alignés sur Dashboard.jsx et analytics.py
"""

from fastapi import APIRouter
from typing import Any, Optional

from Dashboard.analytics import (
    # Statistics & KPI
    get_statistics,
    get_kpis,
    # Données brutes
    get_hotels,
    get_restaurants,
    get_plages,
    get_musees,
    get_activites,
    get_evenements,
    get_lieux,
    get_transports,
    get_bus_stops,
    # Charts
    get_charts_lieux_par_categorie,
    get_charts_hotels_par_etoiles,
    get_charts_visiteurs_par_lieu,
    get_charts_prix_hotels,
    get_charts_restaurants_par_cuisine,
    get_charts_activites_par_saison,
    get_charts_budget_activites,
    get_charts_evenements_par_type,
    # Map
    get_map_lieux,
    get_map_hotels,
    get_map_restaurants,
    get_map_services,
    # AI & Transport
    get_ai_insights,
    get_transport,
    # FAQ / Services / Assurances
    get_faq,
    get_services_urgence,
    get_assurances,
    get_itineraries,
    get_full_overview,
    # GeoJSON Bus
    get_bus_routes_geojson,
    get_bus_stops_geojson,
)

router = APIRouter()

# ══════════════════════════════════════════════════════════════════════════════
# STATISTICS & KPI
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/statistics")
def statistics() -> dict[str, int]:
    """Totaux par catégorie — utilisé par KpiSection et AnalyticsSection."""
    return get_statistics()


@router.get("/kpis")
def kpis() -> dict[str, Any]:
    """KPI enrichis : totaux + prix moyen + note moyenne + visiteurs."""
    return get_kpis()


# ══════════════════════════════════════════════════════════════════════════════
# DONNÉES BRUTES  (utilisées par AIInsightsSection et MapSection)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/hotels")
def hotels() -> list[dict]:
    return get_hotels()


@router.get("/restaurants")
def restaurants() -> list[dict]:
    return get_restaurants()


@router.get("/plages")
def plages() -> list[dict]:
    return get_plages()


@router.get("/musees")
def musees() -> list[dict]:
    return get_musees()


@router.get("/activites")
def activites() -> list[dict]:
    return get_activites()


@router.get("/evenements")
def evenements() -> list[dict]:
    return get_evenements()


@router.get("/lieux")
def lieux() -> list[dict]:
    return get_lieux()


@router.get("/transports")
def transports() -> list[dict]:
    return get_transports()


@router.get("/bus-stops")
def bus_stops() -> list[dict]:
    return get_bus_stops()


# ══════════════════════════════════════════════════════════════════════════════
# CHARTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/charts/lieux-par-categorie")
def charts_lieux_cat() -> list[dict]:
    return get_charts_lieux_par_categorie()


@router.get("/charts/hotels-par-etoiles")
def charts_hotels_stars() -> list[dict]:
    return get_charts_hotels_par_etoiles()


@router.get("/charts/visiteurs-par-lieu")
def charts_visiteurs() -> list[dict]:
    return get_charts_visiteurs_par_lieu()


@router.get("/charts/prix-hotels")
def charts_prix_hotels() -> list[dict]:
    return get_charts_prix_hotels()


@router.get("/charts/restaurants-par-cuisine")
def charts_rest_cuisine() -> list[dict]:
    return get_charts_restaurants_par_cuisine()


@router.get("/charts/activites-par-saison")
def charts_activites_saison() -> list[dict]:
    return get_charts_activites_par_saison()


@router.get("/charts/budget-activites")
def charts_budget() -> list[dict]:
    return get_charts_budget_activites()


@router.get("/charts/evenements-par-type")
def charts_events_type() -> list[dict]:
    return get_charts_evenements_par_type()


# ══════════════════════════════════════════════════════════════════════════════
# MAP
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/map/lieux")
def map_lieux() -> list[dict]:
    return get_map_lieux()


@router.get("/map/hotels")
def map_hotels() -> list[dict]:
    return get_map_hotels()


@router.get("/map/restaurants")
def map_restaurants() -> list[dict]:
    return get_map_restaurants()


@router.get("/map/services")
def map_services() -> list[dict]:
    return get_map_services()


# ══════════════════════════════════════════════════════════════════════════════
# AI INSIGHTS & TRANSPORT
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/ai-insights")
def ai_insights() -> list[dict]:
    return get_ai_insights()


@router.get("/transport")
def transport() -> dict[str, Any]:
    return get_transport()


# ══════════════════════════════════════════════════════════════════════════════
# FAQ / URGENCES / ASSURANCES / ITINÉRAIRES
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/faq")
def faq(ids: Optional[str] = None) -> list[dict]:
    """Renvoie les FAQ. Paramètre optionnel `ids` (CSV) pour filtrer par identifiants.

    Exemple: `/api/dashboard/faq?ids=faq_001,faq_003`
    """
    ids_list = [s.strip() for s in ids.split(",") if s.strip()] if ids else None
    return get_faq(ids_list)


@router.get("/services-urgence")
def services_urgence() -> list[dict]:
    return get_services_urgence()


@router.get("/assurances")
def assurances() -> list[dict]:
    return get_assurances()


@router.get("/itineraries")
def itineraries() -> list[dict]:
    return get_itineraries()


# ══════════════════════════════════════════════════════════════════════════════
# OVERVIEW COMPLET (1 seul appel)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/overview")
def overview() -> dict[str, Any]:
    """Agrège statistics, kpi, faq, urgences, assurances en un seul appel."""
    return get_full_overview()


@router.get("/dump-all")
def dump_all() -> dict[str, Any]:
    """Renvoie l'ensemble des jeux de données et visualisations générées
    (charts, maps, raw lists, ai-insights, transport, kpis, statistics).
    Utile pour exporter ou debugger le dataset complet côté frontend/backoffice.
    """
    return {
        "statistics": get_statistics(),
        "kpis": get_kpis(),
        "charts": {
            "lieux_par_categorie": get_charts_lieux_par_categorie(),
            "hotels_par_etoiles": get_charts_hotels_par_etoiles(),
            "visiteurs_par_lieu": get_charts_visiteurs_par_lieu(),
            "prix_hotels": get_charts_prix_hotels(),
            "restaurants_par_cuisine": get_charts_restaurants_par_cuisine(),
            "activites_par_saison": get_charts_activites_par_saison(),
            "budget_activites": get_charts_budget_activites(),
            "evenements_par_type": get_charts_evenements_par_type(),
        },
        "maps": {
            "lieux": get_map_lieux(),
            "hotels": get_map_hotels(),
            "restaurants": get_map_restaurants(),
            "services": get_map_services(),
        },
        "raw": {
            "hotels": get_hotels(),
            "restaurants": get_restaurants(),
            "plages": get_plages(),
            "musees": get_musees(),
            "activites": get_activites(),
            "evenements": get_evenements(),
            "lieux": get_lieux(),
            "transports": get_transports(),
            "bus_stops": get_bus_stops(),
            "itineraries": get_itineraries(),
        },
        "ai_insights": get_ai_insights(),
        "transport": get_transport(),
        "overview": get_full_overview(),
    }


# ══════════════════════════════════════════════════════════════════════════════
# BUS GEOJSON
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/bus-routes")
def bus_routes() -> dict:
    """GeoJSON FeatureCollection de tous les tracés de lignes de bus ALSA Tanger."""
    return get_bus_routes_geojson()


@router.get("/bus-stops-geojson")
def bus_stops_geojson() -> dict:
    """GeoJSON FeatureCollection de tous les arrêts de bus ALSA Tanger."""
    return get_bus_stops_geojson()

@router.get("/debug/hotels-fields")
def debug_hotels_fields():
    """Endpoint temporaire pour diagnostiquer les champs hotels.json"""
    from Dashboard.analytics import _load
    hotels = _load("hotels.json")
    if not hotels:
        return {"error": "hotels.json vide ou introuvable", "count": 0}
    
    # Montrer les clés du premier hôtel
    premier = hotels[0]
    
    # Compter combien ont chaque champ étoiles possible
    champs_etoiles = ["etoiles", "stars", "categorie_etoiles", "nb_etoiles", "classement", "categorie"]
    stats = {}
    for champ in champs_etoiles:
        valeurs = [h.get(champ) for h in hotels if h.get(champ) is not None]
        if valeurs:
            stats[champ] = {
                "count": len(valeurs),
                "exemples": list(set(str(v) for v in valeurs[:5]))
            }
    
    return {
        "total_hotels": len(hotels),
        "cles_premier_hotel": list(premier.keys()),
        "champs_etoiles_trouves": stats,
        "exemple_hotel": {k: premier.get(k) for k in list(premier.keys())[:10]}
    }