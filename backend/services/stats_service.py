"""
StatsService — Calculs analytiques & KPIs touristiques
=======================================================

Toute la logique métier analytique est ici.
Les routers ne font qu'appeler ce service → séparation claire.

Techniques utilisées :
  • Pandas pour agrégations rapides
  • Counter pour distributions
  • Scoring bayésien pour le ranking
  • Numpy pour les moyennes pondérées
"""

import logging
import math
from collections import Counter
from typing import Any

import pandas as pd

from services.data_loader import DataLoader

logger = logging.getLogger("tanger.stats")


class StatsService:
    """Service de calcul des statistiques touristiques."""

    def __init__(self):
        self.loader = DataLoader.get_instance()

    # ────────────────────────────────────────────────────────────────────────
    # PARTIE 3 — KPIs GLOBAUX
    # ────────────────────────────────────────────────────────────────────────

    def get_global_kpis(self) -> dict:
        """
        Calcule les KPIs globaux de la plateforme en temps réel.

        Optimisation : tous les calculs sont O(n) sur des listes déjà en mémoire.
        Pour un volume > 100K entrées, utiliser Pandas avec des dtypes optimisés.
        """
        loader = self.loader

        # ── Comptages de base ────────────────────────────────────────────────
        total_hotels      = len(loader.hotels)
        total_restaurants = len(loader.restaurants)
        total_plages      = len(loader.plages)
        total_activites   = len(loader.activites)
        total_lieux       = len(loader.lieux)
        total_musees      = len(loader.musees)
        total_events      = len(loader.events)
        total_avis        = len(loader.avis)

        # ── Note moyenne globale (tous avis confondus) ───────────────────────
        all_notes = [
            a["note"] for a in loader.avis
            if isinstance(a.get("note"), (int, float))
        ]
        note_moyenne_globale = round(sum(all_notes) / len(all_notes), 2) if all_notes else 0.0

        # ── Prix moyen hotels ────────────────────────────────────────────────
        hotel_prices = [
            DataLoader.parse_price_mad(h.get("prix"))
            for h in loader.hotels
        ]
        hotel_prices_valid = [p for p in hotel_prices if p is not None and p > 0]
        prix_moyen_hotel = round(sum(hotel_prices_valid) / len(hotel_prices_valid), 0) if hotel_prices_valid else 0

        # ── Prix moyen restaurants ───────────────────────────────────────────
        resto_prices = [
            DataLoader.parse_price_mad(r.get("prix"))
            for r in loader.restaurants
        ]
        resto_prices_valid = [p for p in resto_prices if p is not None and p > 0]
        prix_moyen_resto = round(sum(resto_prices_valid) / len(resto_prices_valid), 0) if resto_prices_valid else 0

        # ── Top quartiers touristiques (depuis lieux_touristiques) ───────────
        quartier_counter = Counter(
            l.get("quartier", "Inconnu")
            for l in loader.lieux
            if l.get("quartier")
        )
        top_quartiers = [
            {"quartier": q, "count": c}
            for q, c in quartier_counter.most_common(5)
        ]

        # ── Statistiques utilisateurs ────────────────────────────────────────
        total_utilisateurs = len(loader.utilisateurs)

        return {
            "overview": {
                "total_lieux_touristiques": total_lieux + total_musees,
                "total_activites":          total_activites,
                "total_hotels":             total_hotels,
                "total_restaurants":        total_restaurants,
                "total_plages":             total_plages,
                "total_events":             total_events,
                "total_avis":               total_avis,
                "total_utilisateurs":       total_utilisateurs,
            },
            "pricing": {
                "prix_moyen_hotel_mad":      prix_moyen_hotel,
                "prix_moyen_restaurant_mad": prix_moyen_resto,
            },
            "quality": {
                "note_moyenne_globale": note_moyenne_globale,
                "total_avis_collectes": total_avis,
            },
            "geography": {
                "top_quartiers": top_quartiers,
            },
        }

    # ────────────────────────────────────────────────────────────────────────
    # PARTIE 4 — RÉPARTITION PAR CATÉGORIE
    # ────────────────────────────────────────────────────────────────────────

    def get_category_distribution(self) -> dict:
        """
        Répartition de TOUS les lieux par catégorie normalisée.

        Stratégie de normalisation :
          - lieux_touristiques → utilise le champ 'categorie'
          - activites → utilise le champ 'type'
          - restaurants → déduit du champ 'cuisine'
          - musees → toujours 'culture'
        """
        loader = self.loader
        counts: Counter = Counter()

        # Mapping normalisé des catégories
        CATEGORY_MAP = {
            "monument_historique":  "culture",
            "quartier_historique":  "culture",
            "site_archeologique":   "culture",
            "musee":                "culture",
            "marche_souk":          "culture",
            "parc_espace_vert":     "nature",
            "espace_naturel":       "nature",
            "viewpoint":            "nature",
            "aventure":             "aventure",
            "sport":                "sport",
            "détente":              "détente",
            "gastronomie":          "gastronomie",
            "nightlife":            "nightlife",
            "famille":              "famille",
            "créatif":              "culture",
            "marocaine":            "gastronomie",
            "internationale":       "gastronomie",
            "café":                 "gastronomie",
        }

        # ── Lieux touristiques ───────────────────────────────────────────────
        for lieu in loader.lieux:
            cat_raw = (lieu.get("categorie") or "").lower()
            cat = CATEGORY_MAP.get(cat_raw, "autre")
            counts[cat] += 1

        # ── Musées → toujours culture ────────────────────────────────────────
        counts["culture"] += len(loader.musees)

        # ── Activités ────────────────────────────────────────────────────────
        for act in loader.activites:
            cat_raw = (act.get("type") or "").lower()
            cat = CATEGORY_MAP.get(cat_raw, "autre")
            counts[cat] += 1

        # ── Restaurants → gastronomie ────────────────────────────────────────
        counts["gastronomie"] += len(loader.restaurants)

        # ── Plages → nature / détente ────────────────────────────────────────
        for plage in loader.plages:
            pref = (plage.get("preference") or "").lower()
            if "randonnée" in pref:
                counts["nature"] += 1
            elif "plage" in pref:
                counts["détente"] += 1
            else:
                counts["nature"] += 1

        # Retour trié par nombre décroissant
        return {k: v for k, v in sorted(counts.items(), key=lambda x: -x[1])}

    # ────────────────────────────────────────────────────────────────────────
    # PARTIE 5 — RÉPARTITION BUDGÉTAIRE
    # ────────────────────────────────────────────────────────────────────────

    def get_budget_distribution(self) -> dict:
        """
        Analyse la répartition budgétaire des utilisateurs.

        Source 1 : utilisateurs.json → champ budget_journalier
        Source 2 : hotels → catégorie (économique/moyen/luxe)
        Source 3 : activites → champ budget
        """
        loader = self.loader

        # ── Normalisation des labels ─────────────────────────────────────────
        BUDGET_NORM = {
            "economique": "économique",
            "économique": "économique",
            "moyen":      "moyen",
            "premium":    "luxe",
            "luxe":       "luxe",
            "luxury":     "luxe",
        }

        # ── Depuis utilisateurs ──────────────────────────────────────────────
        user_budgets = Counter()
        for u in loader.utilisateurs:
            raw = (u.get("budget_journalier") or "").lower()
            normalized = BUDGET_NORM.get(raw, "moyen")
            user_budgets[normalized] += 1

        # ── Depuis hotels ────────────────────────────────────────────────────
        hotel_budgets = Counter()
        for h in loader.hotels:
            raw = (h.get("categorie") or "").lower()
            normalized = BUDGET_NORM.get(raw, "moyen")
            hotel_budgets[normalized] += 1

        # ── Depuis activites ─────────────────────────────────────────────────
        act_budgets = Counter()
        for a in loader.activites:
            raw = (a.get("budget") or "").lower()
            normalized = BUDGET_NORM.get(raw, "moyen")
            act_budgets[normalized] += 1

        # ── Budget moyen en MAD (depuis utilisateurs) ────────────────────────
        budgets_mad = [
            u.get("budget_max_mad", 0)
            for u in loader.utilisateurs
            if isinstance(u.get("budget_max_mad"), (int, float))
        ]
        budget_moyen_mad = round(sum(budgets_mad) / len(budgets_mad), 0) if budgets_mad else 0

        return {
            "users": dict(user_budgets),
            "hotels": dict(hotel_budgets),
            "activites": dict(act_budgets),
            "budget_moyen_utilisateur_mad": budget_moyen_mad,
            "summary": {
                "économique": user_budgets.get("économique", 0),
                "moyen":      user_budgets.get("moyen", 0),
                "luxe":       user_budgets.get("luxe", 0),
            },
        }

    # ────────────────────────────────────────────────────────────────────────
    # PARTIE 6 — ANALYTICS HÔTELS
    # ────────────────────────────────────────────────────────────────────────

    def get_hotel_analytics(self) -> dict:
        """
        Segmentation hôtelière par budget et calcul des prix moyens.

        Nettoyage : '1600 DH' → 1600.0
        Segmentation :
          économique  : < 700 MAD/nuit
          moyen       : 700–1400 MAD/nuit
          luxe        : > 1400 MAD/nuit
        """
        loader = self.loader
        hotels = loader.hotels

        # ── Parse des prix ───────────────────────────────────────────────────
        parsed = []
        for h in hotels:
            price = DataLoader.parse_price_mad(h.get("prix"))
            if price is None:
                continue
            parsed.append({
                "nom":        h.get("nom", ""),
                "prix":       price,
                "categorie":  h.get("categorie", ""),
                "rating":     h.get("rating", 0),
                "localisation": h.get("localisation", ""),
                "piscine":    h.get("piscine", False),
                "vue_mer":    h.get("vue_mer", False),
            })

        df = pd.DataFrame(parsed)

        if df.empty:
            return {"error": "Aucun hôtel parseable"}

        # ── Prix moyen global ────────────────────────────────────────────────
        prix_moyen = round(df["prix"].mean(), 0)
        prix_median = round(df["prix"].median(), 0)
        prix_min = df["prix"].min()
        prix_max = df["prix"].max()

        # ── Segmentation par catégorie (champ du JSON) ───────────────────────
        by_category = df.groupby("categorie").agg(
            count=("prix", "count"),
            prix_moyen=("prix", "mean"),
            prix_min=("prix", "min"),
            prix_max=("prix", "max"),
            rating_moyen=("rating", "mean"),
        ).round(1).reset_index()

        # ── Segmentation par localisation ────────────────────────────────────
        by_location = df.groupby("localisation").agg(
            count=("prix", "count"),
            prix_moyen=("prix", "mean"),
        ).round(0).reset_index()

        # ── Segmentation maison (par tranche de prix) ────────────────────────
        def segment(p):
            if p < 700:    return "économique"
            if p <= 1400:  return "moyen"
            return "luxe"

        df["segment_prix"] = df["prix"].apply(segment)
        by_price_segment = df.groupby("segment_prix").agg(
            count=("prix", "count"),
            prix_moyen=("prix", "mean"),
        ).round(0).reset_index()

        # ── Extras ───────────────────────────────────────────────────────────
        pct_piscine = round(df["piscine"].sum() / len(df) * 100, 1)
        pct_vue_mer = round(df["vue_mer"].sum() / len(df) * 100, 1)
        rating_moyen = round(df["rating"].mean(), 2)

        return {
            "prix": {
                "moyen_mad":   prix_moyen,
                "median_mad":  prix_median,
                "min_mad":     prix_min,
                "max_mad":     prix_max,
            },
            "rating_moyen":        rating_moyen,
            "par_categorie":       by_category.to_dict("records"),
            "par_localisation":    by_location.to_dict("records"),
            "par_segment_prix":    by_price_segment.to_dict("records"),
            "amenites": {
                "pct_avec_piscine": pct_piscine,
                "pct_avec_vue_mer": pct_vue_mer,
            },
        }

    # ────────────────────────────────────────────────────────────────────────
    # PARTIE 7 — TOP ACTIVITÉS (SCORING BAYÉSIEN HYBRIDE)
    # ────────────────────────────────────────────────────────────────────────

    def get_top_activities(self, top_n: int = 5) -> dict:
        """
        Classement bayésien hybride des activités.

        Formule Bayésienne de Wilson (adaptée au tourisme) :

            score = (W_note × note_bayésienne)
                  + (W_pop × popularité_normalisée)
                  + (W_avis × log(nb_avis + 1))
                  + (W_prix × accessibilité_prix)

        Où :
            note_bayésienne = (C × m + n × r) / (C + n)
              C = nombre minimum d'avis pour être "fiable" (prior)
              m = note moyenne globale (prior)
              n = nombre d'avis de l'activité
              r = note réelle de l'activité

        Avantage : une activité avec 4.9/5 sur 2 avis ne bat PAS
        une activité avec 4.5/5 sur 200 avis.
        """
        loader = self.loader

        # ── Note globale comme prior ─────────────────────────────────────────
        all_ratings = [
            a.get("rating", 0)
            for a in loader.activites
            if isinstance(a.get("rating"), (int, float))
        ]
        m_global = sum(all_ratings) / len(all_ratings) if all_ratings else 4.0

        # C = seuil de confiance (minimum d'avis pour être "fiable")
        C = 10

        # ── Compter les clics depuis avis (proxy de popularité) ──────────────
        click_counts: Counter = Counter()
        for avis in loader.avis:
            if avis.get("entite_type") == "activite":
                click_counts[avis.get("entite_nom", "")] += 1

        # ── Calcul du score pour chaque activité ─────────────────────────────
        scored = []
        for act in loader.activites:
            nom   = act.get("nom", "")
            r     = float(act.get("rating") or m_global)
            # Nombre d'avis : on utilise les données avis.json comme proxy
            n_avis = click_counts.get(nom, 0) + 1  # +1 pour éviter log(0)

            # Note bayésienne (formule IMDb adaptée)
            note_baye = (C * m_global + n_avis * r) / (C + n_avis)

            # Prix → accessibilité (prix bas = score accessibilité plus haut)
            prix = DataLoader.parse_price_mad(act.get("prix")) or 300
            accessibilite = max(0, 1 - (prix / 1000))  # normalisé [0, 1]

            # Popularité logarithmique (évite l'effet "rich get richer")
            log_pop = math.log(n_avis + 1) / math.log(50)  # normalisé sur base 50

            # Score hybride pondéré
            score = (
                0.55 * note_baye       # note bayésienne : poids dominant
                + 0.25 * log_pop       # popularité logarithmique
                + 0.15 * accessibilite # accessibilité prix
                + 0.05 * (r / 5.0)    # note brute légère pondération
            )

            scored.append({
                "nom":          nom,
                "type":         act.get("type", ""),
                "budget":       act.get("budget", ""),
                "prix":         act.get("prix", ""),
                "rating":       r,
                "note_bayesienne": round(note_baye, 3),
                "nb_avis":      n_avis,
                "score_hybride": round(score, 4),
                "image":        act.get("image", ""),
                "description":  act.get("description", ""),
                "duree":        act.get("duree", ""),
            })

        # ── Tri par score décroissant ────────────────────────────────────────
        top = sorted(scored, key=lambda x: -x["score_hybride"])[:top_n]

        # Ajout du rang
        for i, item in enumerate(top, 1):
            item["rang"] = i

        return {
            "methode": "Scoring bayésien hybride (note + popularité + accessibilité)",
            "prior_global_m": round(m_global, 3),
            "prior_c": C,
            "poids": {
                "note_bayesienne": 0.55,
                "popularite_log":  0.25,
                "accessibilite":   0.15,
                "note_brute":      0.05,
            },
            "top_activities": top,
        }

    # ────────────────────────────────────────────────────────────────────────
    # PARTIE 8 — PROFIL MOYEN UTILISATEUR
    # ────────────────────────────────────────────────────────────────────────

    def get_user_profile(self) -> dict:
        """
        Calcule le profil moyen de l'utilisateur de la plateforme.

        Utilise Pandas pour les agrégations statistiques.
        """
        df = self.loader.df_utilisateurs

        if df.empty:
            return {"error": "Aucun utilisateur"}

        # ── Type voyageur dominant ───────────────────────────────────────────
        type_counts = df["type_voyageur"].value_counts()
        top_type = type_counts.index[0] if not type_counts.empty else "inconnu"

        # ── Budget moyen ─────────────────────────────────────────────────────
        budget_moyen = round(df["budget_max_mad"].mean(), 0) if "budget_max_mad" in df.columns else 0
        budget_journalier_dist = df["budget_journalier"].value_counts().to_dict()

        # ── Catégories préférées (depuis les scores) ─────────────────────────
        score_cols = [c for c in df.columns if c.startswith("score_")]
        if score_cols:
            scores_moyens = df[score_cols].mean().sort_values(ascending=False)
            categories_preferees = [
                {"categorie": col.replace("score_", ""), "score_moyen": round(val, 2)}
                for col, val in scores_moyens.items()
            ]
        else:
            categories_preferees = []

        # ── Intérêts populaires (depuis la liste interets) ───────────────────
        all_interets = []
        if "interets" in df.columns:
            for interets_list in df["interets"].dropna():
                if isinstance(interets_list, list):
                    all_interets.extend(interets_list)
        top_interets = [
            {"interet": k, "count": v}
            for k, v in Counter(all_interets).most_common(8)
        ]

        # ── Saison préférée ──────────────────────────────────────────────────
        saison_dist = df["saison_visite"].value_counts().to_dict() if "saison_visite" in df.columns else {}
        top_saison = max(saison_dist, key=saison_dist.get) if saison_dist else "été"

        # ── Démographie ──────────────────────────────────────────────────────
        age_moyen = round(df["age"].mean(), 1) if "age" in df.columns else 0
        genre_dist = df["genre"].value_counts().to_dict() if "genre" in df.columns else {}

        # ── Nationalités top 5 ───────────────────────────────────────────────
        top_nationalites = df["nationalite"].value_counts().head(5).to_dict() if "nationalite" in df.columns else {}

        # ── Durée de séjour ──────────────────────────────────────────────────
        duree_moyenne = round(df["duree_sejour_jours"].mean(), 1) if "duree_sejour_jours" in df.columns else 0

        # ── Hébergement préféré ───────────────────────────────────────────────
        hebergement_dist = df["type_hebergement_prefere"].value_counts().head(5).to_dict() if "type_hebergement_prefere" in df.columns else {}

        # ── Transport préféré ────────────────────────────────────────────────
        transport_dist = df["moyen_transport_prefere"].value_counts().to_dict() if "moyen_transport_prefere" in df.columns else {}

        return {
            "profil_type": {
                "type_voyageur":   top_type,
                "age_moyen":       age_moyen,
                "budget_moyen_mad": budget_moyen,
                "duree_sejour_jours": duree_moyenne,
                "saison_preferee": top_saison,
            },
            "demographique": {
                "genre":           genre_dist,
                "top_nationalites": top_nationalites,
            },
            "preferences": {
                "categories":      categories_preferees,
                "top_interets":    top_interets,
                "hebergement":     hebergement_dist,
                "transport":       transport_dist,
            },
            "budget": {
                "moyen_mad":  budget_moyen,
                "distribution": budget_journalier_dist,
            },
            "saisons": {
                "preferee":    top_saison,
                "distribution": saison_dist,
            },
            "total_profils_analyses": len(df),
        }