"""
routes/recommandation.py — Endpoints FastAPI du système de recommandation
=========================================================================
Préfixe  : /api/recommandation   (ajouté dans main.py)
Modules  : recommendation.decision_tree | filter_engine | data_loader

À ajouter dans main.py (2 lignes) :
    from routes.recommandation import router as recommandation_router
    app.include_router(recommandation_router,
                       prefix="/api/recommandation",
                       tags=["Recommandation"])

"""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

from recommendation.decision_tree import DecisionTreeEngine, DECISION_TREE
from recommendation.filter_engine  import FilterEngine, UserPreferences
from recommendation.data_loader    import data_loader

logger = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────────────────────
# SCHÉMAS PYDANTIC
# ─────────────────────────────────────────────────────────────

CATEGORIES_VALIDES = {"hotels", "restaurants", "plages", "activites"}


class PreferencesBody(BaseModel):
    """Corps POST /recommandations — toutes les préférences utilisateur."""

    # Obligatoire
    categorie: str = Field(..., description="hotels | restaurants | plages | activites")

    # Commun
    budget:       str | None = Field(None, description="economique | moyen | luxe")
    localisation: str | None = Field(
        None,
        description=(
            "hotels    : plage | centre-ville | medina\n"
            "restaurants: centre-ville | corniche | medina\n"
            "plages    : nord | est | ouest | centre-ville | peripherie\n"
            "activites : centre-ville | medina | exterieurs"
        ),
    )
    type_sejour: str | None = Field(None, description="famille | couple | solo | amis")

    # Hôtels
    piscine:  bool | None = Field(None)
    vue_mer:  bool | None = Field(None)

    # Restaurants
    cuisine:  str | None = Field(None, description="marocaine | internationale | cafe")
    ambiance: str | None = Field(None, description="calme | romantique | moderne")

    # Plages
    type_plage: str | None = Field(
        None, description="calme | animee | randonnee | coucher_soleil"
    )
    distance: str | None = Field(None, description="proche | moyen | loin")

    # Activités
    type_activite: str | None = Field(
        None, description="aventure | historique | famille | culture"
    )

    @field_validator("categorie")
    @classmethod
    def _check_categorie(cls, v: str) -> str:
        c = v.lower().strip()
        if c not in CATEGORIES_VALIDES:
            raise ValueError(
                f"Catégorie '{v}' invalide. Acceptées : {sorted(CATEGORIES_VALIDES)}"
            )
        return c

    @field_validator("budget", "type_sejour", "cuisine", "ambiance",
                     "type_plage", "distance", "type_activite", "localisation",
                     mode="before")
    @classmethod
    def _lower_strip(cls, v: Any) -> Any:
        return v.lower().strip() if isinstance(v, str) else v


class ValidateAnswerBody(BaseModel):
    categorie:   str = Field(..., description="Catégorie de l'arbre de décision")
    question_id: str = Field(..., description="ID de la question")
    value:       str = Field(..., description="Valeur de la réponse")


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def _load_or_503(categorie: str) -> list[dict[str, Any]]:
    """Charge le dataset ou lève une HTTPException propre."""
    try:
        items = data_loader.load(categorie)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not items:
        raise HTTPException(
            status_code=404,
            detail=f"Aucune donnée disponible pour la catégorie '{categorie}'.",
        )
    return items


def _check_categorie(categorie: str) -> str:
    c = categorie.lower().strip()
    if c not in CATEGORIES_VALIDES:
        raise HTTPException(
            status_code=404,
            detail=f"Catégorie '{categorie}' inconnue. Acceptées : {sorted(CATEGORIES_VALIDES)}",
        )
    return c


# ─────────────────────────────────────────────────────────────
# ENDPOINT 1 — Catégories (page d'accueil)
# ─────────────────────────────────────────────────────────────

@router.get(
    "/categories",
    summary="Les 4 catégories principales (page d'accueil)",
)
def get_categories() -> dict[str, Any]:
    """
    Retourne les 4 catégories avec leurs métadonnées (titre, emoji,
    couleur, image, nombre de questions).
    Utilisé pour afficher les 4 grandes cards cliquables.
    """
    return {"categories": DecisionTreeEngine.get_categories()}


# ─────────────────────────────────────────────────────────────
# ENDPOINT 2 — Questions de l'arbre de décision
# ─────────────────────────────────────────────────────────────

@router.get(
    "/questions/{categorie}",
    summary="Toutes les questions d'une catégorie",
)
def get_questions(categorie: str) -> dict[str, Any]:
    """
    Retourne la liste des questions + options pour l'arbre de décision.
    Le frontend peut les afficher toutes (formulaire) ou une par une (wizard).

    Nombre de questions par catégorie :
      hotels      → 5 questions
      restaurants → 4 questions
      plages      → 3 questions
      activites   → 3 questions
    """
    cat = _check_categorie(categorie)
    try:
        engine = DecisionTreeEngine(cat)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    questions = engine.get_all_questions()
    return {
        "categorie":  cat,
        "total":      len(questions),
        "questions":  questions,
    }


# ─────────────────────────────────────────────────────────────
# ENDPOINT 3 — Question suivante (navigation pas à pas)
# ─────────────────────────────────────────────────────────────

@router.get(
    "/questions/{categorie}/next",
    summary="Question suivante (mode wizard)",
)
def get_next_question(
    categorie: str,
    current_question_id: str = Query(..., description="ID de la question actuelle"),
    answers:             str = Query("{}",  description="Réponses déjà données (JSON encodé)"),
) -> dict[str, Any]:
    """
    Retourne la prochaine question à poser.
    Retourne next_question=null et is_last=true quand toutes ont été posées.
    """
    cat = _check_categorie(categorie)
    try:
        engine = DecisionTreeEngine(cat)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    try:
        parsed_answers: dict = json.loads(answers)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Le paramètre 'answers' doit être du JSON valide.",
        )

    next_q = engine.get_next_question(current_question_id, parsed_answers)
    return {
        "next_question": next_q,
        "is_last":       next_q is None,
        "progress":      engine.get_progress(len(parsed_answers)),
    }


# ─────────────────────────────────────────────────────────────
# ENDPOINT 4 — Validation d'une réponse
# ─────────────────────────────────────────────────────────────

@router.post(
    "/questions/validate",
    summary="Valide qu'une réponse correspond à une option valide",
)
def validate_answer(body: ValidateAnswerBody) -> dict[str, Any]:
    cat = _check_categorie(body.categorie)
    try:
        engine = DecisionTreeEngine(cat)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    is_valid = engine.validate_answer(body.question_id, body.value)
    return {
        "categorie":   cat,
        "question_id": body.question_id,
        "value":       body.value,
        "is_valid":    is_valid,
    }


# ─────────────────────────────────────────────────────────────
# ENDPOINT 5 — Recommandations personnalisées  ★ Principal ★
# ─────────────────────────────────────────────────────────────

@router.post(
    "/recommandations",
    summary="Génère les recommandations personnalisées (cards finales)",
)
def get_recommandations(body: PreferencesBody) -> dict[str, Any]:
    """
    Reçoit les préférences collectées par l'arbre de décision.
    Charge le dataset, filtre, score et retourne les cards triées.

    Flux interne :
      1. data_loader.load(categorie)   → items normalisés
      2. FilterEngine(items, prefs).run() → items filtrés + scorés
      3. Retour des 10 meilleurs résultats

    Chaque card retournée contient :
      - Tous les champs du dataset (nom, prix, rating, image, description…)
      - _score          : score de pertinence [0.0 – 1.0]
      - _match_reasons  : liste des critères matchés
      - _is_exact_match : True si filtrage strict, False si fallback

    Exemple de body :
      {
        "categorie":     "hotels",
        "budget":        "moyen",
        "localisation":  "medina",
        "type_sejour":   "couple",
        "vue_mer":       true
      }
    """
    items = _load_or_503(body.categorie)
    prefs = UserPreferences.from_dict(body.model_dump(exclude_none=True))

    engine  = FilterEngine(items=items, prefs=prefs)
    results = engine.run()

    logger.info(
        "[%s] %d résultats pour : %s",
        body.categorie, len(results), prefs.to_dict(),
    )

    return {
        "categorie":   body.categorie,
        "total":       len(results),
        "preferences": prefs.to_dict(),
        "resultats":   results,
    }


# ─────────────────────────────────────────────────────────────
# ENDPOINT 6 — Top items (suggestions rapides sans filtrage)
# ─────────────────────────────────────────────────────────────

@router.get(
    "/top/{categorie}",
    summary="Top items par rating (suggestions rapides)",
)
def get_top(
    categorie: str,
    limit: int = Query(default=6, ge=1, le=20, description="Nombre d'items"),
) -> dict[str, Any]:
    """
    Retourne les N meilleurs items classés par rating.
    Utilisé sur la page d'accueil avant que l'utilisateur réponde aux questions.
    """
    cat   = _check_categorie(categorie)
    items = _load_or_503(cat)
    top   = FilterEngine.get_top_rated(items, limit=limit)
    return {
        "categorie": cat,
        "total":     len(top),
        "resultats": top,
    }


# ─────────────────────────────────────────────────────────────
# ENDPOINT 7 — Détail d'un item (bouton "Voir plus")
# ─────────────────────────────────────────────────────────────

@router.get(
    "/item/{categorie}/{item_id}",
    summary="Détail complet d'un item",
)
def get_item_detail(categorie: str, item_id: str) -> dict[str, Any]:
    """
    Retourne tous les champs d'un item.
    Déclenché par le bouton 'Voir plus' sur une card.
    """
    cat = _check_categorie(categorie)
    try:
        item = data_loader.get_by_id(cat, item_id)
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if item is None:
        raise HTTPException(
            status_code=404,
            detail=f"Item '{item_id}' introuvable dans '{cat}'.",
        )
    return item


# ─────────────────────────────────────────────────────────────
# ENDPOINT 8 — Recherche textuelle
# ─────────────────────────────────────────────────────────────

@router.get(
    "/search/{categorie}",
    summary="Recherche textuelle par nom ou description",
)
def search_items(
    categorie: str,
    q: str = Query(..., min_length=2, description="Terme de recherche"),
) -> dict[str, Any]:
    """
    Recherche par nom ou description dans une catégorie.
    Utile pour une barre de recherche dans l'interface React.
    """
    cat = _check_categorie(categorie)
    try:
        results = data_loader.search(cat, q)
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return {
        "query":     q,
        "categorie": cat,
        "total":     len(results),
        "resultats": results,
    }


# ─────────────────────────────────────────────────────────────
# ENDPOINT 8.5 — Tous les items d'une catégorie (sans limite)
# ─────────────────────────────────────────────────────────────

@router.get(
    "/all/{categorie}",
    summary="Tous les items d'une catégorie (sans limite)",
)
def get_all_items(categorie: str) -> dict[str, Any]:
    """
    Retourne la liste complète de tous les items d'une catégorie, normalisés.
    Utile pour l'affichage complet et le filtrage côté client dans React.
    """
    c = categorie.lower().strip()
    if c not in {"hotels", "restaurants", "plages", "activites", "evenement"}:
        raise HTTPException(
            status_code=404,
            detail=f"Catégorie '{categorie}' inconnue. Acceptées : {sorted({'hotels', 'restaurants', 'plages', 'activites', 'evenement'})}",
        )
    try:
        items = data_loader.load(c)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not items:
        raise HTTPException(
            status_code=404,
            detail=f"Aucune donnée disponible pour la catégorie '{c}'.",
        )
    return {
        "categorie": c,
        "total":     len(items),
        "resultats": items,
    }


# ─────────────────────────────────────────────────────────────
# ENDPOINT 9 — Santé & statistiques (usage interne)
# ─────────────────────────────────────────────────────────────

@router.get("/health", include_in_schema=False)
def health_check() -> dict[str, Any]:
    """Vérifie l'état du service et l'accessibilité des datasets."""
    return {
        "status":   "ok",
        "service":  "recommandation-tanger",
        "datasets": data_loader.get_stats(),
    }


@router.post("/cache/invalidate", include_in_schema=False)
def invalidate_cache(
    categorie: str | None = Query(
        default=None,
        description="Laisser vide pour vider tout le cache",
    ),
) -> dict[str, str]:
    """Vide le cache mémoire (utile après mise à jour d'un fichier JSON)."""
    data_loader.invalidate_cache(categorie)
    return {"message": f"Cache vidé : {categorie or 'tous les datasets'}"}