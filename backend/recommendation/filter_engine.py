"""
filter_engine.py — Moteur de filtrage et scoring
=================================================
Filtre les items selon les préférences utilisateur.
Toutes les valeurs de filtrage sont celles produites par data_loader.py
(après normalisation des champs et suppression des accents).

Valeurs normalisées utilisées pour comparer :
  budget       : economique | moyen | luxe
  localisation : medina | plage | centre-ville | corniche
                 nord | est | ouest | peripherie (plages)
                 exterieurs (activites)
  type_sejour  : famille | couple | solo | amis
  cuisine      : marocaine | internationale | cafe
  ambiance     : calme | romantique | moderne
  type_plage   : calme | animee | randonnee | coucher_soleil
  type_activite: aventure | historique | famille | culture
  distance_km  : float (estimé par data_loader depuis localisation)
  piscine      : bool
  vue_mer      : bool
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# MODÈLE PRÉFÉRENCES — Entrée du moteur
# ─────────────────────────────────────────────────────────────

@dataclass
class UserPreferences:
    categorie:     str

    # Commun
    budget:        str | None = None
    localisation:  str | None = None
    type_sejour:   str | None = None

    # Hôtels
    piscine:       bool | None = None
    vue_mer:       bool | None = None

    # Restaurants
    cuisine:       str | None = None
    ambiance:      str | None = None

    # Plages
    type_plage:    str | None = None
    distance:      str | None = None   # proche | moyen | loin

    # Activités
    type_activite: str | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "UserPreferences":
        valid_fields = {f for f in cls.__dataclass_fields__}   # type: ignore[attr-defined]
        clean = {
            k: v for k, v in data.items()
            if k in valid_fields and v is not None and v != ""
        }
        return cls(**clean)

    def to_dict(self) -> dict[str, Any]:
        return {k: v for k, v in self.__dict__.items() if v is not None}


# ─────────────────────────────────────────────────────────────
# POIDS PAR CATÉGORIE — Scoring pondéré
# ─────────────────────────────────────────────────────────────

WEIGHTS: dict[str, dict[str, float]] = {
    "hotels": {
        "budget":       0.30,
        "localisation": 0.20,
        "type_sejour":  0.15,
        "piscine":      0.15,
        "vue_mer":      0.10,
        "rating":       0.10,
    },
    "restaurants": {
        "cuisine":      0.30,
        "budget":       0.25,
        "ambiance":     0.20,
        "vue_mer":      0.15,
        "rating":       0.10,
    },
    "plages": {
        "type_plage":   0.35,
        "type_sejour":  0.25,
        "distance_km":  0.25,
        "rating":       0.15,
    },
    "activites": {
        "type_activite": 0.40,
        "budget":         0.30,
        "localisation":   0.20,
        "rating":         0.10,
    },
}

# distance (string user) → plage km depuis data_loader
#   localisation → distance_km : nord=2 | centre-ville=1 | est=8 | ouest=12 | peripherie=20
DISTANCE_RANGES: dict[str, tuple[float, float]] = {
    "proche": (0,   5),    # nord, centre-ville
    "moyen":  (5,   15),   # est
    "loin":   (15,  9999), # ouest, peripherie
}


# ─────────────────────────────────────────────────────────────
# RÉSULTAT ENRICHI
# ─────────────────────────────────────────────────────────────

@dataclass
class ScoredItem:
    item:           dict[str, Any]
    score:          float
    match_reasons:  list[str]
    is_exact_match: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            **self.item,
            "_score":          round(self.score, 3),
            "_match_reasons":  self.match_reasons,
            "_is_exact_match": self.is_exact_match,
        }


# ─────────────────────────────────────────────────────────────
# MOTEUR PRINCIPAL
# ─────────────────────────────────────────────────────────────

class FilterEngine:
    """
    Pipeline en 3 phases :
      1. Filtrage strict  — tous les critères doivent correspondre
      2. Scoring pondéré  — classement par pertinence
      3. Fallback soft    — si < MIN_RESULTS, critère principal seulement
    """

    MIN_RESULTS = 2
    MAX_RESULTS = 10

    def __init__(self, items: list[dict[str, Any]], prefs: UserPreferences) -> None:
        self._items     = items
        self._prefs     = prefs
        self._cat       = prefs.categorie.lower()

    # ── Point d'entrée ───────────────────────────────────────

    def run(self) -> list[dict[str, Any]]:
        if not self._items:
            return []

        strict = self._strict_filter()

        if len(strict) >= self.MIN_RESULTS:
            scored = self._score(strict, is_exact=True)
        else:
            logger.info(
                "[%s] Filtrage strict : %d résultats → fallback",
                self._cat, len(strict)
            )
            soft   = self._soft_filter()
            scored = self._score(soft, is_exact=False)

        scored.sort(key=lambda r: (r.score, r.item.get("rating", 0)), reverse=True)
        return [r.to_dict() for r in scored[: self.MAX_RESULTS]]

    # ── Phase 1 : Filtrage strict ────────────────────────────

    def _strict_filter(self) -> list[dict[str, Any]]:
        result = list(self._items)

        # --- Hôtels ---
        result = self._str(result, "budget",       self._prefs.budget)
        result = self._str(result, "localisation", self._prefs.localisation)
        result = self._str(result, "type_sejour",  self._prefs.type_sejour)
        result = self._bool(result, "piscine",     self._prefs.piscine)
        result = self._bool(result, "vue_mer",     self._prefs.vue_mer)

        # --- Restaurants ---
        result = self._str(result, "cuisine",  self._prefs.cuisine)
        result = self._str(result, "ambiance", self._prefs.ambiance)

        # --- Plages ---
        result = self._str(result, "type_plage", self._prefs.type_plage)
        result = self._distance(result, strict=True)

        # --- Activités ---
        result = self._str(result, "type_activite", self._prefs.type_activite)

        return result

    # ── Phase 3 : Fallback ───────────────────────────────────

    def _soft_filter(self) -> list[dict[str, Any]]:
        """Garde seulement le critère discriminant principal de la catégorie."""
        result = list(self._items)

        if self._cat == "hotels":
            result = self._str(result, "budget", self._prefs.budget)

        elif self._cat == "restaurants":
            result = self._str(result, "cuisine", self._prefs.cuisine)
            if not result:
                result = self._str(list(self._items), "budget", self._prefs.budget)

        elif self._cat == "plages":
            result = self._str(result, "type_plage", self._prefs.type_plage)

        elif self._cat == "activites":
            result = self._str(result, "type_activite", self._prefs.type_activite)
            if not result:
                result = self._str(list(self._items), "budget", self._prefs.budget)

        # Dernier recours : top par rating
        if len(result) < self.MIN_RESULTS:
            result = sorted(self._items, key=lambda x: x.get("rating", 0), reverse=True)

        return result

    # ── Phase 2 : Scoring ────────────────────────────────────

    def _score(
        self,
        items: list[dict[str, Any]],
        is_exact: bool,
    ) -> list[ScoredItem]:
        w = WEIGHTS.get(self._cat, {})
        results: list[ScoredItem] = []

        for item in items:
            score   = 0.0
            reasons = []

            def add(field: str, matched: bool, label: str) -> None:
                nonlocal score
                if matched and field in w:
                    score += w[field]
                    reasons.append(label)

            # Budget
            if self._prefs.budget:
                add("budget",
                    self._match_str(item, "budget", self._prefs.budget),
                    f"Budget {self._prefs.budget} ✓")

            # Localisation
            if self._prefs.localisation:
                add("localisation",
                    self._match_str(item, "localisation", self._prefs.localisation),
                    f"Localisation {self._prefs.localisation} ✓")

            # Type séjour
            if self._prefs.type_sejour:
                add("type_sejour",
                    self._match_str(item, "type_sejour", self._prefs.type_sejour),
                    f"Idéal {self._prefs.type_sejour} ✓")

            # Cuisine
            if self._prefs.cuisine:
                add("cuisine",
                    self._match_str(item, "cuisine", self._prefs.cuisine),
                    f"Cuisine {self._prefs.cuisine} ✓")

            # Ambiance
            if self._prefs.ambiance:
                add("ambiance",
                    self._match_str(item, "ambiance", self._prefs.ambiance),
                    f"Ambiance {self._prefs.ambiance} ✓")

            # Type plage
            if self._prefs.type_plage:
                add("type_plage",
                    self._match_str(item, "type_plage", self._prefs.type_plage),
                    f"Plage {self._prefs.type_plage} ✓")

            # Type activité
            if self._prefs.type_activite:
                add("type_activite",
                    self._match_str(item, "type_activite", self._prefs.type_activite),
                    f"Activité {self._prefs.type_activite} ✓")

            # Piscine
            if self._prefs.piscine is not None and "piscine" in w:
                if item.get("piscine") == self._prefs.piscine:
                    score += w["piscine"]
                    reasons.append("Piscine ✓")

            # Vue mer
            if self._prefs.vue_mer is not None and "vue_mer" in w:
                if item.get("vue_mer") == self._prefs.vue_mer:
                    score += w["vue_mer"]
                    reasons.append("Vue mer ✓")

            # Distance plages
            if self._prefs.distance and "distance_km" in w:
                if self._distance_match(item):
                    score += w["distance_km"]
                    reasons.append(f"Distance {self._prefs.distance} ✓")

            # Rating normalisé
            rating = float(item.get("rating", 0))
            if "rating" in w and rating:
                score += w["rating"] * (rating / 5.0)

            results.append(ScoredItem(
                item=item,
                score=score,
                match_reasons=reasons,
                is_exact_match=is_exact,
            ))

        return results

    # ── Helpers filtrage ─────────────────────────────────────

    @staticmethod
    def _str(
        items: list[dict],
        field: str,
        value: str | None,
    ) -> list[dict]:
        """
        Filtre string exact (case-insensitive).
        Toutes les valeurs sont déjà normalisées par data_loader.
        """
        if value is None:
            return items
        v = value.lower().strip()
        return [i for i in items if str(i.get(field, "")).lower() == v]

    @staticmethod
    def _bool(
        items: list[dict],
        field: str,
        value: bool | None,
    ) -> list[dict]:
        if value is None:
            return items
        return [i for i in items if i.get(field) == value]

    def _distance(
        self,
        items: list[dict],
        strict: bool = True,
    ) -> list[dict]:
        if not self._prefs.distance:
            return items
        ranges = DISTANCE_RANGES.get(self._prefs.distance.lower())
        if not ranges:
            return items
        lo, hi = ranges
        filtered = [
            i for i in items
            if lo <= float(i.get("distance_km", 0)) <= hi
        ]
        return filtered if (filtered or not strict) else items

    def _distance_match(self, item: dict) -> bool:
        if not self._prefs.distance:
            return False
        ranges = DISTANCE_RANGES.get(self._prefs.distance.lower())
        if not ranges:
            return False
        lo, hi = ranges
        return lo <= float(item.get("distance_km", 0)) <= hi

    @staticmethod
    def _match_str(item: dict, field: str, value: str | None) -> bool:
        if value is None:
            return False
        return str(item.get(field, "")).lower() == value.lower().strip()

    # ── Méthodes utilitaires publiques ───────────────────────

    @staticmethod
    def get_top_rated(
        items: list[dict[str, Any]],
        limit: int = 6,
    ) -> list[dict[str, Any]]:
        return sorted(items, key=lambda x: x.get("rating", 0), reverse=True)[:limit]

    @staticmethod
    def search_by_name(
        items: list[dict[str, Any]],
        query: str,
    ) -> list[dict[str, Any]]:
        q = query.lower().strip()
        return [
            i for i in items
            if q in i.get("nom", "").lower() or q in i.get("description", "").lower()
        ]