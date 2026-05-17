"""
decision_tree.py — Arbre de décision calé sur les données réelles
==================================================================
Toutes les options correspondent exactement aux valeurs présentes
dans les fichiers JSON après normalisation par data_loader.py.

Valeurs JSON réelles (après normalisation) :
  hotels      → budget     : economique | moyen | luxe
                type_sejour: couple | famille | solo
                localisation: centre-ville | medina | plage
  restaurants → budget     : economique | moyen | luxe
                cuisine    : marocaine | internationale | cafe
                ambiance   : calme | moderne | romantique
                localisation: centre-ville | corniche | medina
  plages      → type_plage : calme | animee | randonnee | coucher_soleil
                type_sejour: famille | amis | solo
                localisation: nord | est | ouest | centre-ville | peripherie
  activites   → type_activite: aventure | culture | famille | historique
                budget     : economique | moyen | luxe
                localisation: centre-ville | medina | exterieurs
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any


# ─────────────────────────────────────────────────────────────
# DATACLASSES — Nœuds de l'arbre
# ─────────────────────────────────────────────────────────────

@dataclass
class QuestionOption:
    value:       str          # valeur envoyée à l'API / utilisée pour filtrer
    label:       str          # texte affiché à l'utilisateur
    emoji:       str  = ""
    description: str  = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "value":       self.value,
            "label":       self.label,
            "emoji":       self.emoji,
            "description": self.description,
        }


@dataclass
class Question:
    id:          str
    question:    str
    field_name:  str          # champ UserPreferences rempli par cette question
    type:        str          # "single" | "boolean"
    options:     list[QuestionOption] = field(default_factory=list)
    is_optional: bool  = False
    help_text:   str   = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id":          self.id,
            "question":    self.question,
            "field_name":  self.field_name,
            "type":        self.type,
            "is_optional": self.is_optional,
            "help_text":   self.help_text,
            "options":     [o.to_dict() for o in self.options],
        }


# ─────────────────────────────────────────────────────────────
# ARBRE DE DÉCISION — Calé sur les données réelles
# ─────────────────────────────────────────────────────────────

DECISION_TREE: dict[str, list[Question]] = {

    # ──────────────────────────────────────────────────────────
    # HÔTELS
    # categorie réel → budget  : 'économique' | 'moyen' | 'luxe'
    #           → normalisé    : 'economique' | 'moyen' | 'luxe'
    # type réel → type_sejour  : 'couple' | 'famille' | 'solo'
    # localisation réel        : 'médina' | 'plage' | 'centre-ville'
    #           → normalisé    : 'medina' | 'plage' | 'centre-ville'
    # ──────────────────────────────────────────────────────────
    "hotels": [
        Question(
            id="budget",
            question="Quel est votre budget par nuit ?",
            field_name="budget",
            type="single",
            help_text="Fourchette de prix indicative",
            options=[
                QuestionOption("economique", "Économique", "💚", "Moins de 700 DH / nuit"),
                QuestionOption("moyen",      "Moyen",      "💛", "700 – 1 300 DH / nuit"),
                QuestionOption("luxe",       "Luxe",       "💎", "Plus de 1 300 DH / nuit"),
            ],
        ),
        Question(
            id="localisation",
            question="Quelle localisation préférez-vous ?",
            field_name="localisation",
            type="single",
            options=[
                QuestionOption("plage",        "Au bord de la plage", "🏖️", "Accès direct à la mer"),
                QuestionOption("centre-ville", "Centre-ville",        "🏙️", "Proche commerces & restaurants"),
                QuestionOption("medina",       "Médina",              "🕌", "Ambiance authentique marocaine"),
            ],
        ),
        Question(
            id="type_sejour",
            question="Quel type de séjour planifiez-vous ?",
            field_name="type_sejour",
            type="single",
            options=[
                QuestionOption("famille", "En famille", "👨‍👩‍👧", "Espace et activités enfants"),
                QuestionOption("couple",  "En couple",  "💑",      "Romantique et intime"),
                QuestionOption("solo",    "Solo",       "🧳",      "Flexible et indépendant"),
            ],
        ),
        Question(
            id="piscine",
            question="Souhaitez-vous un hôtel avec piscine ?",
            field_name="piscine",
            type="boolean",
            options=[
                QuestionOption("true",  "Oui, avec piscine", "🏊", "Indispensable"),
                QuestionOption("false", "Non, peu importe",  "✋", "Pas un critère"),
            ],
        ),
        Question(
            id="vue_mer",
            question="Voulez-vous une vue mer depuis votre chambre ?",
            field_name="vue_mer",
            type="boolean",
            options=[
                QuestionOption("true",  "Oui, vue mer",     "🌊", "Je veux voir la mer"),
                QuestionOption("false", "Non, peu importe", "🏠", "La vue n'est pas prioritaire"),
            ],
        ),
    ],

    # ──────────────────────────────────────────────────────────
    # RESTAURANTS
    # cuisine réel             : 'marocaine' | 'internationale' | 'café'
    #         → normalisé      : 'marocaine' | 'internationale' | 'cafe'
    # budget réel              : 'économique' | 'moyen' | 'luxe'
    #        → normalisé       : 'economique' | 'moyen' | 'luxe'
    # ambiance réel            : 'calme' | 'moderne' | 'romantique'
    # localisation réel        : 'médina' | 'centre-ville' | 'corniche'
    #             → normalisé  : 'medina' | 'centre-ville' | 'corniche'
    # vue_mer                  : bool
    # ──────────────────────────────────────────────────────────
    "restaurants": [
        Question(
            id="cuisine",
            question="Quel type de cuisine vous attire ?",
            field_name="cuisine",
            type="single",
            options=[
                QuestionOption("marocaine",      "Cuisine Marocaine",      "🥘", "Tajines, couscous, pastilla…"),
                QuestionOption("internationale", "Cuisine Internationale", "🌍", "Italienne, mexicaine, française…"),
                QuestionOption("cafe",           "Café & Pâtisserie",      "☕", "Thé à la menthe, viennoiseries…"),
            ],
        ),
        Question(
            id="budget",
            question="Quel est votre budget par personne ?",
            field_name="budget",
            type="single",
            options=[
                QuestionOption("economique", "Économique", "💚", "Moins de 100 DH / personne"),
                QuestionOption("moyen",      "Moyen",      "💛", "100 – 200 DH / personne"),
                QuestionOption("luxe",       "Gastronomie","💎", "Plus de 200 DH / personne"),
            ],
        ),
        Question(
            id="vue_mer",
            question="Souhaitez-vous un restaurant avec vue mer ?",
            field_name="vue_mer",
            type="boolean",
            options=[
                QuestionOption("true",  "Oui, vue mer",     "🌊", "Dîner face à l'Atlantique"),
                QuestionOption("false", "Non, peu importe", "🍽️", "Je privilégie la cuisine"),
            ],
        ),
        Question(
            id="ambiance",
            question="Quelle ambiance recherchez-vous ?",
            field_name="ambiance",
            type="single",
            options=[
                QuestionOption("calme",      "Calme & Reposant",  "🕯️", "Idéal pour discuter"),
                QuestionOption("romantique", "Romantique",         "🌹", "Dîner aux chandelles"),
                QuestionOption("moderne",    "Moderne & Branché",  "✨", "Déco contemporaine, lounge"),
            ],
        ),
    ],

    # ──────────────────────────────────────────────────────────
    # PLAGES
    # preference réel          : 'coucher de soleil' | 'plage animée'
    #                            'plage calme'       | 'randonnée'
    #           → normalisé    : 'coucher_soleil' | 'animee'
    #                            'calme'          | 'randonnee'
    # compagnie réel           : 'En famille' | 'Entre amis' | 'Solo'
    #           → normalisé    : 'famille'    | 'amis'       | 'solo'
    # localisation réel        : 'nord' | 'est' | 'ouest'
    #                            'centre-ville' | 'périphérie'
    #             → normalisé  : 'nord' | 'est' | 'ouest'
    #                            'centre-ville' | 'peripherie'
    # distance_km : estimé (1 | 2 | 8 | 12 | 20)
    # ──────────────────────────────────────────────────────────
    "plages": [
        Question(
            id="type_plage",
            question="Que recherchez-vous comme expérience ?",
            field_name="type_plage",
            type="single",
            options=[
                QuestionOption("calme",          "Plage Calme",        "🌅", "Eaux tranquilles, endroit paisible"),
                QuestionOption("animee",         "Plage Animée",       "🏄", "Sports nautiques, ambiance dynamique"),
                QuestionOption("randonnee",      "Randonnée & Nature", "🥾", "Sentiers, parcs, végétation"),
                QuestionOption("coucher_soleil", "Coucher de Soleil",  "🌇", "Meilleurs spots panoramiques"),
            ],
        ),
        Question(
            id="type_sejour",
            question="Vous venez avec qui ?",
            field_name="type_sejour",
            type="single",
            options=[
                QuestionOption("famille", "En famille", "👨‍👩‍👧", "Plages sécurisées pour enfants"),
                QuestionOption("amis",    "Entre amis", "👫",      "Plages animées et festives"),
                QuestionOption("solo",    "Solo",       "🧘",      "Tranquillité et ressourcement"),
            ],
        ),
        Question(
            id="distance",
            question="Quelle distance êtes-vous prêt(e) à parcourir ?",
            field_name="distance",
            type="single",
            help_text="Depuis le centre de Tanger",
            options=[
                QuestionOption("proche", "Proche (< 5 km)",  "📍", "À pied ou taxi rapide"),
                QuestionOption("moyen",  "Moyen (5–15 km)",  "🚗", "15–30 min en voiture"),
                QuestionOption("loin",   "Loin (> 15 km)",   "🗺️", "Excursion demi-journée"),
            ],
        ),
    ],

    # ──────────────────────────────────────────────────────────
    # ACTIVITÉS
    # type réel → type_activite: 'aventure' | 'culture' | 'famille' | 'historique'
    # budget réel              : 'économique' | 'moyen' | 'luxe'
    #        → normalisé       : 'economique' | 'moyen' | 'luxe'
    # localisation réel        : 'centre-ville' | 'médina' | 'extérieurs'
    #             → normalisé  : 'centre-ville' | 'medina' | 'exterieurs'
    # ──────────────────────────────────────────────────────────
    "activites": [
        Question(
            id="type_activite",
            question="Quel type d'activité vous intéresse ?",
            field_name="type_activite",
            type="single",
            options=[
                QuestionOption("aventure",   "Aventure & Sport",     "🧗", "Surf, kitesurf, plongée, kayak…"),
                QuestionOption("historique", "Histoire & Patrimoine", "🏛️", "Musées, Kasbah, monuments…"),
                QuestionOption("famille",    "Famille & Loisirs",    "🎠", "Calèche, hammam, promenades…"),
                QuestionOption("culture",    "Culture & Art",        "🎨", "Galeries, musique, cuisine…"),
            ],
        ),
        Question(
            id="budget",
            question="Quel est votre budget pour cette activité ?",
            field_name="budget",
            type="single",
            options=[
                QuestionOption("economique", "Économique", "💚", "Gratuit ou moins de 100 DH"),
                QuestionOption("moyen",      "Moyen",      "💛", "100 – 400 DH"),
                QuestionOption("luxe",       "Premium",    "💎", "Plus de 400 DH"),
            ],
        ),
        Question(
            id="localisation",
            question="Dans quelle zone souhaitez-vous cette activité ?",
            field_name="localisation",
            type="single",
            options=[
                QuestionOption("medina",       "Médina & Kasbah",     "🕌", "Cœur historique de Tanger"),
                QuestionOption("centre-ville", "Centre-ville",        "🏙️", "Tanger moderne"),
                QuestionOption("exterieurs",   "Extérieurs & Nature", "⛰️", "Hors de la ville"),
            ],
        ),
    ],
}


# ─────────────────────────────────────────────────────────────
# MÉTADONNÉES CATÉGORIES — Page d'accueil
# ─────────────────────────────────────────────────────────────

CATEGORIES_CONFIG: list[dict[str, Any]] = [
    {
        "id":           "hotels",
        "titre":        "Hôtels & Riads",
        "emoji":        "🏨",
        "description":  "Trouvez l'hébergement parfait à Tanger",
        "image":        "/images/categories/hotels.jpg",
        "couleur":      "#2563EB",
        "nb_questions": len(DECISION_TREE["hotels"]),
    },
    {
        "id":           "restaurants",
        "titre":        "Restaurants & Cafés",
        "emoji":        "🍽️",
        "description":  "Découvrez les meilleures tables de Tanger",
        "image":        "/images/categories/restaurants.jpg",
        "couleur":      "#DC2626",
        "nb_questions": len(DECISION_TREE["restaurants"]),
    },
    {
        "id":           "plages",
        "titre":        "Plages & Nature",
        "emoji":        "🏖️",
        "description":  "Explorez les plus belles plages de Tanger",
        "image":        "/images/categories/plages.jpg",
        "couleur":      "#059669",
        "nb_questions": len(DECISION_TREE["plages"]),
    },
    {
        "id":           "activites",
        "titre":        "Activités Touristiques",
        "emoji":        "🎯",
        "description":  "Vivez des expériences inoubliables à Tanger",
        "image":        "/images/categories/activites.jpg",
        "couleur":      "#D97706",
        "nb_questions": len(DECISION_TREE["activites"]),
    },
]


# ─────────────────────────────────────────────────────────────
# ENGINE
# ─────────────────────────────────────────────────────────────

class DecisionTreeEngine:
    """Navigation dans l'arbre de décision et validation des réponses."""

    def __init__(self, categorie: str) -> None:
        cat = categorie.lower().strip()
        if cat not in DECISION_TREE:
            raise ValueError(
                f"Catégorie inconnue : '{cat}'. "
                f"Acceptées : {list(DECISION_TREE.keys())}"
            )
        self._questions: list[Question] = DECISION_TREE[cat]
        self._index: dict[str, int] = {q.id: i for i, q in enumerate(self._questions)}

    def get_all_questions(self) -> list[dict[str, Any]]:
        return [q.to_dict() for q in self._questions]

    def get_question_by_id(self, question_id: str) -> dict[str, Any] | None:
        idx = self._index.get(question_id)
        return self._questions[idx].to_dict() if idx is not None else None

    def get_next_question(
        self,
        current_id: str,
        answers: dict[str, Any],
    ) -> dict[str, Any] | None:
        idx = self._index.get(current_id)
        if idx is None:
            return None
        next_idx = idx + 1
        if next_idx < len(self._questions):
            return self._questions[next_idx].to_dict()
        return None  # Toutes les questions posées

    def get_progress(self, answered_count: int) -> dict[str, Any]:
        total = len(self._questions)
        return {
            "answered":   answered_count,
            "total":      total,
            "percentage": round((answered_count / total) * 100) if total else 0,
            "remaining":  total - answered_count,
        }

    def validate_answer(self, question_id: str, value: str) -> bool:
        idx = self._index.get(question_id)
        if idx is None:
            return False
        valid = {opt.value for opt in self._questions[idx].options}
        return value in valid

    @staticmethod
    def get_categories() -> list[dict[str, Any]]:
        return CATEGORIES_CONFIG