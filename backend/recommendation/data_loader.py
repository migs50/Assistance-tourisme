"""
data_loader.py — Chargement et normalisation des datasets JSON
==============================================================
Corrections appliquées sur les fichiers réels sans les modifier :

  hotels.json
    'categorie'   → renommé 'budget'        (luxe|moyen|économique)
    'type'        → renommé 'type_sejour'   (couple|famille|solo)
    'prix'        → "1600 DH" → 1600.0
    accent budget → "économique" → "economique"
    localisation  → "médina" → "medina"
    'id'          → absent → auto-généré

  restaurants.json
    'prix'        → "60 DH" → 60.0
    accent budget → "économique" → "economique"
    accent cuisine→ "café" → "cafe"
    localisation  → "médina" → "medina"
    'id'          → absent → auto-généré

  plages.json
    'preference'  → renommé 'type_plage'
      "coucher de soleil" → "coucher_soleil"
      "plage animée"      → "animee"
      "plage calme"       → "calme"
      "randonnée"         → "randonnee"
    'compagnie'   → renommé 'type_sejour'
      "En famille"  → "famille"
      "Entre amis"  → "amis"
      "Solo"        → "solo"
    localisation  → "périphérie" → "peripherie"
    'distance_km' → absent → estimé depuis localisation
    'prix'        → "Gratuit" → 0.0
    'id'          → absent → auto-généré

  activites.json
    'type'        → renommé 'type_activite' (aventure|culture|famille|historique)
    'prix'        → "30 DH"/"Gratuit" → float
    accent budget → "économique" → "economique"
    localisation  → "médina" → "medina" | "extérieurs" → "exterieurs"
    'id'          → absent → auto-généré
"""

from __future__ import annotations

import json
import logging
import re
import time
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "dataset"

DATASET_FILES: dict[str, str] = {
    "hotels":      "hotels.json",
    "restaurants": "restaurants.json",
    "plages":      "plages.json",
    "activites":   "activites.json",
}

# Champs obligatoires après normalisation
REQUIRED_FIELDS: dict[str, list[str]] = {
    "hotels":      ["id", "nom", "rating", "localisation", "budget", "description", "image"],
    "restaurants": ["id", "nom", "rating", "localisation", "cuisine", "budget", "description", "image"],
    "plages":      ["id", "nom", "rating", "localisation", "type_plage", "description", "image"],
    "activites":   ["id", "nom", "rating", "localisation", "type_activite", "budget", "description", "image"],
}

# Valeurs par défaut pour champs absents
FIELD_DEFAULTS: dict[str, Any] = {
    "prix":          0.0,
    "rating":        0.0,
    "piscine":       False,
    "vue_mer":       False,
    "distance_km":   0.0,
    "tags":          [],
    "galerie":       [],
    "disponible":    True,
    "type_sejour":   "",
    "ambiance":      "",
    "type_plage":    "",
    "type_activite": "",
    "duree":         "",
}

# ─────────────────────────────────────────────────────────────
# MAPPINGS CALÉS SUR LES VRAIS FICHIERS
# ─────────────────────────────────────────────────────────────

# Renommage de champs
FIELD_ALIASES: dict[str, dict[str, str]] = {
    "hotels":      {"categorie": "budget",     "type": "type_sejour"},
    "plages":      {"preference": "type_plage", "compagnie": "type_sejour"},
    "activites":   {"type": "type_activite"},
    "restaurants": {},
}

# Mapping valeurs type_plage (après remove_accents + lower)
#   valeur brute JSON → valeur normalisée
TYPE_PLAGE_MAP: dict[str, str] = {
    "coucher de soleil": "coucher_soleil",
    "plage animee":      "animee",          # après suppression accent "animée"
    "plage calme":       "calme",
    "randonnee":         "randonnee",       # après suppression accent "randonnée"
}

# Mapping valeurs type_sejour / compagnie
TYPE_SEJOUR_MAP: dict[str, str] = {
    "entre amis": "amis",
    "en famille": "famille",
    "solo":       "solo",
    "couple":     "couple",
    "famille":    "famille",
    "amis":       "amis",
}

# distance_km estimée depuis la localisation des plages
#   (champ absent dans plages.json)
#   valeurs localisations réelles : nord | est | ouest | centre-ville | périphérie
DISTANCE_KM_PLAGES: dict[str, float] = {
    "nord":         2.0,
    "centre-ville": 1.0,
    "est":          8.0,
    "ouest":        12.0,
    "peripherie":   20.0,   # après suppression accent de "périphérie"
}


# ─────────────────────────────────────────────────────────────
# UTILITAIRES
# ─────────────────────────────────────────────────────────────

def _strip_accents(text: str) -> str:
    """
    Supprime les accents et cédilles.
    économique → economique
    médina     → medina
    périphérie → peripherie
    café       → cafe
    """
    return "".join(
        c for c in unicodedata.normalize("NFD", str(text))
        if unicodedata.category(c) != "Mn"
    )


def _parse_prix(raw: Any) -> float:
    """
    Convertit la valeur prix du JSON en float.
    "1600 DH" → 1600.0
    "25 DH"   → 25.0
    "Gratuit" → 0.0
    0 / 0.0   → 0.0
    """
    if isinstance(raw, (int, float)):
        return float(raw)
    if not isinstance(raw, str):
        return 0.0
    s = raw.strip().lower()
    if s in ("gratuit", "free", "0", ""):
        return 0.0
    m = re.search(r"\d+(?:[.,]\d+)?", raw)
    return float(m.group().replace(",", ".")) if m else 0.0


# ─────────────────────────────────────────────────────────────
# CACHE
# ─────────────────────────────────────────────────────────────

@dataclass
class _CacheEntry:
    data:       list[dict[str, Any]]
    loaded_at:  float = field(default_factory=time.time)
    file_mtime: float = 0.0
    item_count: int   = 0

    def is_stale(self, ttl: float = 300.0) -> bool:
        return (time.time() - self.loaded_at) > ttl


# ─────────────────────────────────────────────────────────────
# DATA LOADER — Singleton
# ─────────────────────────────────────────────────────────────

class DataLoader:
    """
    Charge, normalise et met en cache les datasets JSON.
    Corrige automatiquement tous les décalages entre les fichiers
    réels et le schéma attendu par filter_engine.py.
    """

    _instance: "DataLoader | None" = None
    _cache:    dict[str, _CacheEntry] = {}

    @classmethod
    def get_instance(cls) -> "DataLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ── API publique ─────────────────────────────────────────

    def load(self, categorie: str, force_reload: bool = False) -> list[dict[str, Any]]:
        """Charge (ou retourne depuis le cache) les items d'une catégorie."""
        cat = categorie.lower().strip()
        if cat not in DATASET_FILES:
            raise ValueError(f"Catégorie inconnue : '{cat}'. Acceptées : {list(DATASET_FILES)}")

        fp = DATA_DIR / DATASET_FILES[cat]

        # Cache valide ?
        if not force_reload and cat in self._cache:
            e = self._cache[cat]
            if not e.is_stale() and e.file_mtime == self._mtime(fp):
                logger.debug("Cache HIT %s (%d items)", cat, e.item_count)
                return e.data

        raw   = self._read_json(fp)
        items = self._normalize(raw, cat)
        items = self._validate(items, cat)

        self._cache[cat] = _CacheEntry(
            data=items,
            loaded_at=time.time(),
            file_mtime=self._mtime(fp),
            item_count=len(items),
        )
        logger.info("Dataset '%s' : %d items chargés", cat, len(items))
        return items

    def load_all(self) -> dict[str, list[dict[str, Any]]]:
        return {cat: self.load(cat) for cat in DATASET_FILES}

    def get_by_id(self, categorie: str, item_id: str | int) -> dict[str, Any] | None:
        return next(
            (i for i in self.load(categorie) if str(i.get("id")) == str(item_id)),
            None,
        )

    def search(
        self,
        categorie: str,
        query: str,
        fields: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        fields = fields or ["nom", "description"]
        q = query.lower().strip()
        return [i for i in self.load(categorie) if any(q in str(i.get(f, "")).lower() for f in fields)]

    def invalidate_cache(self, categorie: str | None = None) -> None:
        (self._cache.pop(categorie.lower(), None) if categorie else self._cache.clear())

    def get_stats(self) -> dict[str, Any]:
        return {
            cat: {
                "fichier":      fn,
                "existe":       (DATA_DIR / fn).exists(),
                "en_cache":     cat in self._cache,
                "nb_items":     self._cache[cat].item_count if cat in self._cache else None,
                "taille_bytes": (DATA_DIR / fn).stat().st_size if (DATA_DIR / fn).exists() else None,
            }
            for cat, fn in DATASET_FILES.items()
        }

    # ── Lecture JSON ─────────────────────────────────────────

    @staticmethod
    def _read_json(fp: Path) -> list[dict[str, Any]]:
        if not fp.exists():
            raise FileNotFoundError(
                f"Dataset introuvable : {fp}\n"
                f"Placez vos fichiers JSON dans /backend/data/"
            )
        try:
            data = json.loads(fp.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"JSON invalide ({fp.name}) : {exc}") from exc
        if not isinstance(data, list):
            raise ValueError(f"{fp.name} doit être un tableau JSON, reçu : {type(data).__name__}")
        return data

    # ── Pipeline de normalisation ────────────────────────────

    def _normalize(self, items: list[dict[str, Any]], cat: str) -> list[dict[str, Any]]:
        aliases = FIELD_ALIASES.get(cat, {})
        result  = []

        for idx, raw in enumerate(items):
            item = dict(raw)

            # ① Renommage des champs selon la catégorie
            for old, new in aliases.items():
                if old in item:
                    item[new] = item.pop(old)

            # ② ID auto-généré (absent dans tous les vrais fichiers)
            if not item.get("id"):
                slug = re.sub(r"[^a-z0-9]+", "-",
                              _strip_accents(str(item.get("nom", ""))).lower()).strip("-")[:20]
                item["id"] = f"{cat[:3]}-{idx+1:03d}-{slug}"
            item["id"] = str(item["id"])

            # ③ Prix string → float
            item["prix"] = _parse_prix(item.get("prix", 0))

            # ④ Normalisation des champs filtrables (accents + lowercase)
            for f in ("budget", "localisation", "type_sejour", "cuisine",
                      "ambiance", "type_plage", "type_activite"):
                if f in item and isinstance(item[f], str):
                    item[f] = _strip_accents(item[f]).lower().strip()

            # ⑤ Mappings spéciaux type_plage
            if cat == "plages" and "type_plage" in item:
                tp = item["type_plage"]
                item["type_plage"] = TYPE_PLAGE_MAP.get(tp, tp)

            # ⑥ Mappings spéciaux type_sejour
            if "type_sejour" in item:
                ts = item["type_sejour"]
                item["type_sejour"] = TYPE_SEJOUR_MAP.get(ts, ts)

            # ⑦ distance_km : estimé depuis localisation (absent dans plages.json)
            if cat == "plages" and not item.get("distance_km"):
                loc = _strip_accents(str(item.get("localisation", ""))).lower().strip()
                item["distance_km"] = DISTANCE_KM_PLAGES.get(loc, 5.0)

            # ⑧ Valeurs par défaut pour champs absents
            for key, default in FIELD_DEFAULTS.items():
                if key not in item or item[key] is None:
                    item[key] = default

            # ⑨ Clamp rating [0, 5]
            try:
                item["rating"] = max(0.0, min(5.0, float(item.get("rating", 0))))
            except (TypeError, ValueError):
                item["rating"] = 0.0

            # ⑩ Booléens (piscine/vue_mer peuvent être bool ou string dans le JSON)
            for bf in ("piscine", "vue_mer", "disponible"):
                if bf in item:
                    v = item[bf]
                    item[bf] = v.lower() in ("true", "oui", "1") if isinstance(v, str) else bool(v)

            # ⑪ Listes
            for lf in ("tags", "galerie"):
                item[lf] = item.get(lf) if isinstance(item.get(lf), list) else []

            result.append(item)

        return result

    # ── Validation ───────────────────────────────────────────

    def _validate(self, items: list[dict[str, Any]], cat: str) -> list[dict[str, Any]]:
        required  = REQUIRED_FIELDS.get(cat, [])
        valid     = []
        seen: set[str] = set()

        for item in items:
            iid = str(item.get("id", "?"))
            if iid in seen:
                logger.warning("[%s] ID dupliqué ignoré : %s", cat, iid)
                continue
            seen.add(iid)

            missing = [f for f in required if not item.get(f)]
            if missing:
                logger.warning("[%s] '%s' ignoré — manquants : %s", cat, item.get("nom"), missing)
                continue

            valid.append(item)

        if (skipped := len(items) - len(valid)):
            logger.warning("[%s] %d/%d items ignorés", cat, skipped, len(items))

        return valid

    @staticmethod
    def _mtime(fp: Path) -> float:
        try:
            return fp.stat().st_mtime
        except OSError:
            return 0.0


# Instance globale utilisée dans les routes
data_loader = DataLoader.get_instance()