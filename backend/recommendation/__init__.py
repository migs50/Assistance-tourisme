"""
Recommendation Module — Système de recommandation touristique pour Tanger
=========================================================================
decision_tree.py  : Arbre de décision interactif
filter_engine.py  : Moteur de filtrage et scoring
data_loader.py    : Chargement, normalisation et cache des datasets JSON

Valeurs réelles dans les datasets
──────────────────────────────────
hotels      → budget    : economique | moyen | luxe
             type_sejour: couple | famille | solo
             localisation: centre-ville | medina | plage
             piscine / vue_mer : bool

restaurants → budget    : economique | moyen | luxe
              cuisine   : marocaine | internationale | cafe
              ambiance  : calme | moderne | romantique
              localisation: centre-ville | corniche | medina
              vue_mer   : bool

plages      → type_plage : calme | animee | randonnee | coucher_soleil
              type_sejour: famille | amis | solo
              localisation: nord | est | ouest | centre-ville | peripherie
              distance_km : calculé depuis localisation

activites   → type_activite: aventure | culture | famille | historique
              budget       : economique | moyen | luxe
              localisation : centre-ville | medina | exterieurs
"""

from .decision_tree import DecisionTreeEngine, CATEGORIES_CONFIG
from .filter_engine  import FilterEngine, UserPreferences
from .data_loader    import DataLoader, data_loader

__all__ = [
    "DecisionTreeEngine",
    "CATEGORIES_CONFIG",
    "FilterEngine",
    "UserPreferences",
    "DataLoader",
    "data_loader",
]