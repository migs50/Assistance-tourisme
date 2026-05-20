"""
MapService — Données géographiques pour carte interactive
==========================================================

Prépare les données pour Leaflet / Mapbox :
  • Extraction lat/lng depuis les datasets
  • Format GeoJSON standardisé
  • Filtrage par budget, catégorie, type
  • Clustering-ready (envoi de tous les points, clustering côté frontend)

Architecture :
  React → fetch("/api/map/hotels?budget=luxe")
  Leaflet reçoit du GeoJSON → MarkerClusterGroup
"""

import logging
from typing import Any

from services.data_loader import DataLoader

logger = logging.getLogger("tanger.map")

# Coordonnées de Tanger (centre par défaut pour les entités sans coords)
TANGER_CENTER = [35.7595, -5.8340]

# Coordonnées approximatives par zone (pour hôtels/restos sans lat/lng explicite)
ZONE_COORDS = {
    "médina":       (35.7872, -5.8136),
    "centre-ville": (35.7667, -5.8138),
    "plage":        (35.7914, -5.7914),
    "corniche":     (35.7958, -5.8050),
    "kasbah":       (35.7901, -5.8142),
    "périphérie":   (35.7450, -5.8500),
    "ouest":        (35.7750, -5.9200),
    "est":          (35.7800, -5.7600),
    "nord":         (35.8000, -5.8200),
    "extérieur":    (35.7595, -5.9200),
}


def _to_geojson_feature(
    properties: dict,
    lat: float,
    lng: float,
) -> dict:
    """Construit une feature GeoJSON standard."""
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lng, lat],  # GeoJSON : [lng, lat]
        },
        "properties": properties,
    }


def _coords_from_zone(zone: str) -> tuple[float, float]:
    """Retourne des coords approximatives selon la zone texte."""
    key = zone.lower().strip()
    return ZONE_COORDS.get(key, tuple(TANGER_CENTER))


class MapService:
    """Service de préparation des données géographiques."""

    def __init__(self):
        self.loader = DataLoader.get_instance()

    # ── HÔTELS ───────────────────────────────────────────────────────────────

    def get_hotels_geojson(
        self,
        budget: str | None = None,
        localisation: str | None = None,
        type_voyageur: str | None = None,
        piscine: bool | None = None,
        vue_mer: bool | None = None,
    ) -> dict:
        """
        Retourne les hôtels en GeoJSON avec filtres optionnels.

        Filtres disponibles :
          budget         : économique | moyen | luxe
          localisation   : médina | centre-ville | plage | ...
          type_voyageur  : couple | solo | famille
          piscine        : true | false
          vue_mer        : true | false
        """
        features = []

        for h in self.loader.hotels:
            # ── Filtres ──────────────────────────────────────────────────────
            if budget and h.get("categorie", "").lower() != budget.lower():
                continue
            if localisation and h.get("localisation", "").lower() != localisation.lower():
                continue
            if type_voyageur and h.get("type", "").lower() != type_voyageur.lower():
                continue
            if piscine is not None and h.get("piscine") != piscine:
                continue
            if vue_mer is not None and h.get("vue_mer") != vue_mer:
                continue

            # ── Coordonnées (depuis la zone textuelle) ───────────────────────
            lat, lng = _coords_from_zone(h.get("localisation", "centre-ville"))

            features.append(_to_geojson_feature(
                properties={
                    "id":          h.get("nom", "").lower().replace(" ", "_"),
                    "nom":         h.get("nom", ""),
                    "prix":        h.get("prix", ""),
                    "prix_mad":    DataLoader.parse_price_mad(h.get("prix")),
                    "rating":      h.get("rating", 0),
                    "categorie":   h.get("categorie", ""),
                    "localisation": h.get("localisation", ""),
                    "type":        h.get("type", ""),
                    "piscine":     h.get("piscine", False),
                    "vue_mer":     h.get("vue_mer", False),
                    "image":       h.get("image", ""),
                    "description": h.get("description", ""),
                    "marker_color": self._hotel_color(h.get("categorie", "")),
                    "entity_type": "hotel",
                },
                lat=lat, lng=lng,
            ))

        return {"type": "FeatureCollection", "features": features, "count": len(features)}

    @staticmethod
    def _hotel_color(categorie: str) -> str:
        return {"économique": "#22c55e", "moyen": "#3b82f6", "luxe": "#f59e0b"}.get(
            categorie.lower(), "#6b7280"
        )

    # ── RESTAURANTS ──────────────────────────────────────────────────────────

    def get_restaurants_geojson(
        self,
        budget: str | None = None,
        cuisine: str | None = None,
        localisation: str | None = None,
        ambiance: str | None = None,
        vue_mer: bool | None = None,
    ) -> dict:
        features = []

        for r in self.loader.restaurants:
            if budget and r.get("budget", "").lower() != budget.lower():
                continue
            if cuisine and r.get("cuisine", "").lower() != cuisine.lower():
                continue
            if localisation and r.get("localisation", "").lower() != localisation.lower():
                continue
            if ambiance and r.get("ambiance", "").lower() != ambiance.lower():
                continue
            if vue_mer is not None and r.get("vue_mer") != vue_mer:
                continue

            lat, lng = _coords_from_zone(r.get("localisation", "centre-ville"))

            features.append(_to_geojson_feature(
                properties={
                    "id":          r.get("nom", "").lower().replace(" ", "_"),
                    "nom":         r.get("nom", ""),
                    "prix":        r.get("prix", ""),
                    "prix_mad":    DataLoader.parse_price_mad(r.get("prix")),
                    "rating":      r.get("rating", 0),
                    "cuisine":     r.get("cuisine", ""),
                    "budget":      r.get("budget", ""),
                    "localisation": r.get("localisation", ""),
                    "ambiance":    r.get("ambiance", ""),
                    "vue_mer":     r.get("vue_mer", False),
                    "image":       r.get("image", ""),
                    "description": r.get("description", ""),
                    "marker_color": "#ef4444",
                    "entity_type": "restaurant",
                },
                lat=lat, lng=lng,
            ))

        return {"type": "FeatureCollection", "features": features, "count": len(features)}

    # ── PLAGES / ESPACES NATURELS ─────────────────────────────────────────────

    def get_plages_geojson(
        self,
        preference: str | None = None,
        compagnie: str | None = None,
        localisation: str | None = None,
        gratuit: bool | None = None,
    ) -> dict:
        features = []

        for p in self.loader.plages:
            if preference and preference.lower() not in p.get("preference", "").lower():
                continue
            if compagnie and p.get("compagnie", "").lower() != compagnie.lower():
                continue
            if localisation and p.get("localisation", "").lower() != localisation.lower():
                continue
            if gratuit is not None:
                is_free = p.get("prix", "").lower() in ("gratuit", "free", "0", "")
                if is_free != gratuit:
                    continue

            lat, lng = _coords_from_zone(p.get("localisation", "nord"))

            features.append(_to_geojson_feature(
                properties={
                    "id":          p.get("nom", "").lower().replace(" ", "_"),
                    "nom":         p.get("nom", ""),
                    "prix":        p.get("prix", ""),
                    "prix_mad":    DataLoader.parse_price_mad(p.get("prix")),
                    "rating":      p.get("rating", 0),
                    "preference":  p.get("preference", ""),
                    "compagnie":   p.get("compagnie", ""),
                    "localisation": p.get("localisation", ""),
                    "image":       p.get("image", ""),
                    "description": p.get("description", ""),
                    "marker_color": "#06b6d4",
                    "entity_type": "plage",
                },
                lat=lat, lng=lng,
            ))

        return {"type": "FeatureCollection", "features": features, "count": len(features)}

    # ── ÉVÉNEMENTS ───────────────────────────────────────────────────────────

    def get_events_geojson(
        self,
        category: str | None = None,
    ) -> dict:
        """
        Les événements n'ont pas de coords → on utilise le lieu textuel
        pour les assigner à une zone approximative.
        """
        features = []
        VENUE_ZONES = {
            "palais des arts":         (35.7670, -5.8135),
            "musée de la kasbah":      (35.7905, -5.8148),
            "kasbah":                  (35.7905, -5.8148),
            "plages de tanger":        (35.7914, -5.7914),
            "corniche":                (35.7958, -5.8050),
            "centre culturel":         (35.7667, -5.8138),
            "tanja marina bay":        (35.7930, -5.8000),
            "palais des institutions": (35.7680, -5.8145),
            "palais des congrès":      (35.7670, -5.8150),
            "kenzi solazur":           (35.7924, -5.7905),
            "default":                 (35.7667, -5.8138),
        }

        def get_event_coords(location_str: str) -> tuple[float, float]:
            loc = location_str.lower()
            for key, coords in VENUE_ZONES.items():
                if key in loc:
                    return coords
            return VENUE_ZONES["default"]

        for i, ev in enumerate(self.loader.events):
            if category and ev.get("category", "").lower() != category.lower():
                continue

            location = ev.get("location", "")
            lat, lng = get_event_coords(location)

            features.append(_to_geojson_feature(
                properties={
                    "id":          ev.get("id", f"event_{i}"),
                    "nom":         ev.get("title", ""),
                    "date":        ev.get("date", ""),
                    "location":    location,
                    "category":    ev.get("category", ""),
                    "description": ev.get("description", ""),
                    "image":       ev.get("image_url", ""),
                    "marker_color": "#8b5cf6",
                    "entity_type": "event",
                },
                lat=lat, lng=lng,
            ))

        return {"type": "FeatureCollection", "features": features, "count": len(features)}

    # ── ACTIVITÉS ────────────────────────────────────────────────────────────

    def get_activities_geojson(
        self,
        type_activite: str | None = None,
        budget: str | None = None,
        localisation: str | None = None,
        duree_max: str | None = None,
    ) -> dict:
        features = []

        for act in self.loader.activites:
            if type_activite and act.get("type", "").lower() != type_activite.lower():
                continue
            if budget and act.get("budget", "").lower() != budget.lower():
                continue
            if localisation and act.get("localisation", "").lower() != localisation.lower():
                continue

            lat, lng = _coords_from_zone(act.get("localisation", "extérieur"))

            features.append(_to_geojson_feature(
                properties={
                    "id":          act.get("nom", "").lower().replace(" ", "_"),
                    "nom":         act.get("nom", ""),
                    "prix":        act.get("prix", ""),
                    "prix_mad":    DataLoader.parse_price_mad(act.get("prix")),
                    "rating":      act.get("rating", 0),
                    "type":        act.get("type", ""),
                    "budget":      act.get("budget", ""),
                    "duree":       act.get("duree", ""),
                    "localisation": act.get("localisation", ""),
                    "image":       act.get("image", ""),
                    "description": act.get("description", ""),
                    "marker_color": self._activity_color(act.get("type", "")),
                    "entity_type": "activite",
                },
                lat=lat, lng=lng,
            ))

        return {"type": "FeatureCollection", "features": features, "count": len(features)}

    @staticmethod
    def _activity_color(type_act: str) -> str:
        colors = {
            "aventure":    "#f97316",
            "sport":       "#22c55e",
            "culture":     "#a855f7",
            "détente":     "#06b6d4",
            "gastronomie": "#ef4444",
            "nightlife":   "#ec4899",
            "famille":     "#3b82f6",
        }
        return colors.get(type_act.lower(), "#6b7280")

    # ── LIEUX TOURISTIQUES ────────────────────────────────────────────────────

    def get_lieux_geojson(
        self,
        categorie: str | None = None,
        quartier: str | None = None,
        gratuit: bool | None = None,
    ) -> dict:
        """
        Les lieux_touristiques ont de vraies coordonnées lat/lng dans le JSON.
        """
        features = []

        for l in self.loader.lieux:
            if categorie and l.get("categorie", "").lower() != categorie.lower():
                continue
            if quartier and quartier.lower() not in l.get("quartier", "").lower():
                continue
            if gratuit is not None and l.get("gratuit") != gratuit:
                continue

            lat = l.get("latitude")
            lng = l.get("longitude")
            if lat is None or lng is None:
                continue  # Skip si pas de coords

            features.append(_to_geojson_feature(
                properties={
                    "id":           l.get("id", ""),
                    "nom":          l.get("nom", ""),
                    "categorie":    l.get("categorie", ""),
                    "sous_categorie": l.get("sous_categorie", ""),
                    "quartier":     l.get("quartier", ""),
                    "note_moyenne": l.get("note_moyenne", 0),
                    "nb_avis":      l.get("nb_avis", 0),
                    "prix_entree":  l.get("prix_entree_mad", 0),
                    "gratuit":      l.get("gratuit", True),
                    "tags":         l.get("tags", []),
                    "image":        l.get("image_url", ""),
                    "marker_color": "#f59e0b",
                    "entity_type":  "lieu",
                },
                lat=lat, lng=lng,
            ))

        return {"type": "FeatureCollection", "features": features, "count": len(features)}

    # ── TRANSPORT (Stops + Routes) ────────────────────────────────────────────

    def get_transport_geojson(self) -> dict:
        """Retourne stops et routes de transport public."""
        return {
            "stops":  self.loader.stops_geojson,
            "routes": self.loader.routes_geojson,
        }

    # ── ALL IN ONE (pour affichage initial de la carte) ───────────────────────

    def get_all_markers(self) -> dict:
        """Retourne TOUS les markers en un seul appel (optimisation réseau)."""
        return {
            "hotels":      self.get_hotels_geojson(),
            "restaurants": self.get_restaurants_geojson(),
            "plages":      self.get_plages_geojson(),
            "events":      self.get_events_geojson(),
            "activites":   self.get_activities_geojson(),
            "lieux":       self.get_lieux_geojson(),
        }