"""
DataLoader — Service de chargement et mise en cache des données JSON/GeoJSON
============================================================================

Singleton pattern : données chargées UNE SEULE FOIS au démarrage.
Accès O(1) depuis tous les routers → performances maximales.

Bonne pratique : séparer le chargement des données de la logique métier.
"""

import json
import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger("tanger.data_loader")

# Chemin vers le dossier datasets (relatif au fichier courant)
DATA_DIR = Path(__file__).parent.parent.parent/ "datasets"


class DataLoader:
    """
    Singleton centralisant tous les datasets de la plateforme.

    Pourquoi un singleton ?
    → Les fichiers JSON sont lus UNE SEULE FOIS au démarrage.
    → Toute la mémoire partagée entre les workers (si Uvicorn multi-process,
      utiliser Redis ou un fichier partagé à la place).
    """

    _instance: "DataLoader | None" = None

    def __init__(self):
        # ── Raw JSON lists ──────────────────────────────────────────────────
        self.hotels: list[dict] = []
        self.restaurants: list[dict] = []
        self.plages: list[dict] = []
        self.activites: list[dict] = []
        self.lieux: list[dict] = []
        self.musees: list[dict] = []
        self.events: list[dict] = []
        self.utilisateurs: list[dict] = []
        self.avis: list[dict] = []

        # ── GeoJSON FeatureCollections ──────────────────────────────────────
        self.routes_geojson: dict = {}
        self.stops_geojson: dict = {}

        # ── Pandas DataFrames (calculés à la demande, mis en cache) ─────────
        self._df_utilisateurs: pd.DataFrame | None = None
        self._df_avis: pd.DataFrame | None = None
        self._df_lieux: pd.DataFrame | None = None
        self._df_hotels: pd.DataFrame | None = None

        self.datasets_loaded: bool = False

    # ── Singleton ────────────────────────────────────────────────────────────

    @classmethod
    def get_instance(cls) -> "DataLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def preload_all(cls) -> "DataLoader":
        """Précharge tous les fichiers. Appelé au lifespan startup."""
        instance = cls.get_instance()
        instance._load_all()
        return instance

    # ── Chargement ───────────────────────────────────────────────────────────

    def _load_json(self, filename: str) -> list[dict] | dict:
        """Charge un fichier JSON avec gestion d'erreur."""
        path = DATA_DIR / filename
        if not path.exists():
            logger.warning(f"Fichier introuvable : {path}")
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            logger.info(f"✓ {filename} → {len(data) if isinstance(data, list) else 'objet'} entrées")
            return data
        except json.JSONDecodeError as e:
            logger.error(f"JSON invalide dans {filename}: {e}")
            return []

    def _load_all(self):
        """Chargement séquentiel de tous les datasets."""
        logger.info(f" Chargement depuis : {DATA_DIR}")

        self.hotels       = self._load_json("hotels.json")
        self.restaurants  = self._load_json("restaurants.json")
        self.plages       = self._load_json("plages.json")
        self.activites    = self._load_json("activites.json")
        self.lieux        = self._load_json("lieux_touristiques.json")
        self.musees       = self._load_json("musees.json")
        self.events       = self._load_json("events.json")
        self.utilisateurs = self._load_json("utilisateurs.json")
        self.avis         = self._load_json("avis.json")

        self.routes_geojson = self._load_json("routes.geojson")
        self.stops_geojson  = self._load_json("stops.geojson")

        self.datasets_loaded = True
        logger.info("✅ Tous les datasets chargés en mémoire")

    # ── DataFrames avec lazy loading ─────────────────────────────────────────

    @property
    def df_utilisateurs(self) -> pd.DataFrame:
        if self._df_utilisateurs is None:
            self._df_utilisateurs = pd.DataFrame(self.utilisateurs)
        return self._df_utilisateurs

    @property
    def df_avis(self) -> pd.DataFrame:
        if self._df_avis is None:
            self._df_avis = pd.DataFrame(self.avis)
        return self._df_avis

    @property
    def df_lieux(self) -> pd.DataFrame:
        if self._df_lieux is None:
            self._df_lieux = pd.DataFrame(self.lieux)
        return self._df_lieux

    @property
    def df_hotels(self) -> pd.DataFrame:
        if self._df_hotels is None:
            self._df_hotels = pd.DataFrame(self.hotels)
        return self._df_hotels

    # ── Utilitaires ──────────────────────────────────────────────────────────

    @staticmethod
    def parse_price_mad(price_str: Any) -> float | None:
        """
        Convertit '1600 DH', '250 MAD', 'Gratuit', '0' → float.
        Retourne None si non parseable.
        """
        if price_str is None:
            return None
        s = str(price_str).upper().replace("DH", "").replace("MAD", "").strip()
        if s in ("GRATUIT", "FREE", "0", ""):
            return 0.0
        try:
            return float(s.replace(" ", "").replace(",", "."))
        except ValueError:
            return None