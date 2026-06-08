"""
Router — /api/stats/*
======================
Endpoints KPIs touristiques — données statiques calculées dynamiquement.

Cache strategy :
  Pour un dashboard en prod avec fort trafic, ajouter :
    from fastapi_cache.decorator import cache
    @cache(expire=300)  # Cache 5 minutes
"""

import logging

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from services.stats_service import StatsService

logger = logging.getLogger("tanger.router.stats")
router = APIRouter()

_stats_service: StatsService | None = None

def get_stats_service() -> StatsService:
    global _stats_service
    if _stats_service is None:
        _stats_service = StatsService()
    return _stats_service


# ─── /api/stats/global ───────────────────────────────────────────────────────

@router.get(
    "/global",
    summary="KPIs Globaux de la plateforme",
    description="""
Retourne les indicateurs clés de performance (KPIs) de la plateforme touristique.

**Contenu :**
- Comptages (hôtels, restaurants, activités, événements...)
- Prix moyens (hôtels, restaurants)
- Note moyenne globale
- Top 5 quartiers touristiques

**Optimisation :** Données calculées en O(n) sur structures en mémoire.
Pour un fort trafic → ajouter un cache Redis/mémoire avec TTL de 5 minutes.
""",
)
async def get_global_kpis():
    try:
        data = get_stats_service().get_global_kpis()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /stats/global: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/stats/categories ───────────────────────────────────────────────────

@router.get(
    "/categories",
    summary="Répartition par catégorie touristique",
    description="""
Distribution de tous les lieux/activités par catégorie normalisée.

**Retour :**
```json
{
  "culture": 45,
  "nature": 38,
  "gastronomie": 35,
  "aventure": 23,
  ...
}
```

**Sources agrégées :** lieux_touristiques + musees + activites + restaurants + plages
""",
)
async def get_categories():
    try:
        data = get_stats_service().get_category_distribution()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /stats/categories: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/stats/budget ────────────────────────────────────────────────────────

@router.get(
    "/budget",
    summary="Répartition budgétaire des utilisateurs",
    description="""
Analyse de la répartition économique/moyen/luxe basée sur :
- Les préférences déclarées (utilisateurs.json)
- La catégorie des hôtels choisis
- Le budget des activités sélectionnées

**Utile pour :** Cibler les segments marketing, adapter les recommandations.
""",
)
async def get_budget_distribution():
    try:
        data = get_stats_service().get_budget_distribution()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /stats/budget: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/stats/hotels ───────────────────────────────────────────────────────

@router.get(
    "/hotels",
    summary="Analytics hôteliers — prix & segmentation",
    description="""
Analyse complète du parc hôtelier de Tanger :
- Prix moyen / médian / min / max par nuit (MAD)
- Segmentation par catégorie (économique/moyen/luxe)
- Segmentation par localisation (médina/plage/centre-ville)
- % hôtels avec piscine, vue mer
- Rating moyen

**Nettoyage automatique :** '1600 DH' → 1600.0 MAD
""",
)
async def get_hotel_analytics():
    try:
        data = get_stats_service().get_hotel_analytics()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /stats/hotels: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/stats/top-activities ────────────────────────────────────────────────

@router.get(
    "/top-activities",
    summary="Top activités — Scoring bayésien hybride",
    description="""
Classement intelligent des activités par scoring bayésien hybride.

**Formule :**
```
score = 0.55 × note_bayésienne
      + 0.25 × popularité_log
      + 0.15 × accessibilité_prix
      + 0.05 × note_brute
```

**Note bayésienne (formule IMDb) :**
```
note_baye = (C × m + n × r) / (C + n)
```
- C = 10 (seuil de confiance minimum)
- m = note moyenne globale (prior)
- n = nombre d'avis
- r = note réelle

**Avantage :** Évite le biais des petits échantillons.
Une activité avec 4.9/5 sur 2 avis ne bat pas une avec 4.5/5 sur 200 avis.
""",
)
async def get_top_activities(
    top: int = Query(default=5, ge=1, le=20, description="Nombre d'activités à retourner"),
):
    try:
        data = get_stats_service().get_top_activities(top_n=top)
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /stats/top-activities: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/stats/user-profile ─────────────────────────────────────────────────

@router.get(
    "/user-profile",
    summary="Profil moyen utilisateur",
    description="""
Portrait statistique du voyageur type sur la plateforme (800 profils analysés).

**Contenu :**
- Type voyageur dominant (couple/solo/famille/groupe)
- Âge moyen, budget moyen en MAD
- Durée moyenne de séjour
- Top catégories d'intérêt (scores moyens)
- Saison préférée
- Top 5 nationalités
- Hébergement & transport préférés
""",
)
async def get_user_profile():
    try:
        data = get_stats_service().get_user_profile()
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Erreur /stats/user-profile: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/stats/lieux ────────────────────────────────────────────────────────

@router.get(
    "/lieux",
    summary="Statistiques lieux touristiques",
    description="Analyse des lieux par quartier, catégorie, accessibilité.",
)
async def get_lieux_stats():
    try:
        from services.data_loader import DataLoader
        from collections import Counter
        loader = DataLoader.get_instance()

        # Distribution par quartier
        by_quartier = Counter(l.get("quartier", "Inconnu") for l in loader.lieux)
        by_category = Counter(l.get("categorie", "autre") for l in loader.lieux)

        # Note moyenne par quartier
        quartier_notes: dict = {}
        for l in loader.lieux:
            q = l.get("quartier", "Inconnu")
            note = l.get("note_moyenne", 0)
            if q not in quartier_notes:
                quartier_notes[q] = []
            if isinstance(note, (int, float)) and note > 0:
                quartier_notes[q].append(note)

        quartier_avg = {
            q: round(sum(notes) / len(notes), 2)
            for q, notes in quartier_notes.items()
            if notes
        }

        # Lieux gratuits vs payants
        nb_gratuits = sum(1 for l in loader.lieux if l.get("gratuit", True))
        nb_payants = len(loader.lieux) - nb_gratuits

        return JSONResponse(content={
            "total": len(loader.lieux) + len(loader.musees),
            "lieux_seuls": len(loader.lieux),
            "musees": len(loader.musees),
            "par_quartier": dict(by_quartier.most_common()),
            "par_categorie": dict(by_category.most_common()),
            "note_moyenne_par_quartier": quartier_avg,
            "accessibilite": {
                "gratuits": nb_gratuits,
                "payants":  nb_payants,
                "pct_gratuit": round(nb_gratuits / len(loader.lieux) * 100, 1),
            },
        })
    except Exception as e:
        logger.error(f"Erreur /stats/lieux: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── /api/stats/avis ─────────────────────────────────────────────────────────

@router.get(
    "/avis",
    summary="Analyse des avis & sentiments",
    description="Distribution des notes, analyse de sentiment, saisonnalité des visites.",
)
async def get_avis_stats():
    try:
        from services.data_loader import DataLoader
        from collections import Counter
        import pandas as pd

        loader = DataLoader.get_instance()
        df = loader.df_avis

        if df.empty:
            return JSONResponse(content={"error": "Aucun avis"})

        # Distribution des notes
        notes = df["note"].dropna()
        note_dist = notes.value_counts().sort_index().to_dict()

        # Sentiment distribution
        sentiment_dist = df["sentiment"].value_counts().to_dict() if "sentiment" in df.columns else {}

        # Saisons
        saison_dist = df["saison_visite"].value_counts().to_dict() if "saison_visite" in df.columns else {}

        # Taux de recommandation
        pct_recommande = 0
        if "recommande" in df.columns:
            pct_recommande = round(df["recommande"].mean() * 100, 1)

        # Type d'entité le plus reviewé
        entite_dist = df["entite_type"].value_counts().to_dict() if "entite_type" in df.columns else {}

        return JSONResponse(content={
            "total_avis": len(df),
            "note_moyenne": round(float(notes.mean()), 2),
            "note_mediane": float(notes.median()),
            "distribution_notes": {str(k): v for k, v in note_dist.items()},
            "sentiment": sentiment_dist,
            "saisons": saison_dist,
            "pct_recommande": pct_recommande,
            "par_type_entite": entite_dist,
        })
    except Exception as e:
        logger.error(f"Erreur /stats/avis: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})