"""
AnalyticsService — Tracking anonyme SANS login
===============================================

Stockage des événements dans SQLite (analytics.db).
Conçu pour tracker :
  • recommandations générées
  • recherches utilisateur
  • clics sur éléments
  • requêtes chatbot

Philosophie : Privacy-first. Aucun cookie, aucun identifiant personnel.
Chaque événement est associé à un session_token anonyme (UUID généré côté client).
"""

import json
import logging
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

logger = logging.getLogger("tanger.analytics")

DB_PATH = Path(__file__).parent.parent / "data" / "analytics.db"


class AnalyticsService:
    """Service de tracking anonyme basé sur SQLite."""

    def __init__(self):
        self._init_db()

    # ── Initialisation DB ────────────────────────────────────────────────────

    def _init_db(self):
        """Crée les tables si elles n'existent pas."""
        with self._conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS recommendations (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id  TEXT,
                    category    TEXT,
                    budget      TEXT,
                    activity    TEXT,
                    items       TEXT,          -- JSON array des items retournés
                    created_at  TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS searches (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id  TEXT,
                    query       TEXT NOT NULL,
                    filters     TEXT,          -- JSON des filtres appliqués
                    results_count INTEGER,
                    created_at  TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS clicks (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id  TEXT,
                    item_type   TEXT,          -- hotel, restaurant, activite...
                    item_id     TEXT,
                    item_name   TEXT,
                    created_at  TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS chatbot_queries (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id  TEXT,
                    query       TEXT NOT NULL,
                    intent      TEXT,          -- culture, budget, transport...
                    response_ms INTEGER,       -- temps de réponse
                    created_at  TEXT DEFAULT (datetime('now'))
                );

                -- Index pour les requêtes analytiques fréquentes
                CREATE INDEX IF NOT EXISTS idx_rec_category ON recommendations(category);
                CREATE INDEX IF NOT EXISTS idx_rec_budget   ON recommendations(budget);
                CREATE INDEX IF NOT EXISTS idx_search_query ON searches(query);
                CREATE INDEX IF NOT EXISTS idx_click_type   ON clicks(item_type);
                CREATE INDEX IF NOT EXISTS idx_chat_intent  ON chatbot_queries(intent);
            """)
        logger.info(f"✅ SQLite analytics initialisé : {DB_PATH}")

    # ── Connexion ────────────────────────────────────────────────────────────

    @contextmanager
    def _conn(self):
        """Context manager pour connexions SQLite thread-safe."""
        conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    # ── Enregistrement des événements ────────────────────────────────────────

    def track_recommendation(
        self,
        session_id: str,
        category: str,
        budget: str,
        activity: str = "",
        items: list[str] = None,
    ) -> None:
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO recommendations (session_id, category, budget, activity, items) VALUES (?,?,?,?,?)",
                (session_id, category, budget, activity, json.dumps(items or [])),
            )
        logger.debug(f"Recommendation tracked: {category}/{budget} for {session_id}")

    def track_search(
        self,
        session_id: str,
        query: str,
        filters: dict = None,
        results_count: int = 0,
    ) -> None:
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO searches (session_id, query, filters, results_count) VALUES (?,?,?,?)",
                (session_id, query.lower().strip(), json.dumps(filters or {}), results_count),
            )

    def track_click(
        self,
        session_id: str,
        item_type: str,
        item_id: str,
        item_name: str,
    ) -> None:
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO clicks (session_id, item_type, item_id, item_name) VALUES (?,?,?,?)",
                (session_id, item_type, item_id, item_name),
            )

    def track_chatbot(
        self,
        session_id: str,
        query: str,
        intent: str = "",
        response_ms: int = 0,
    ) -> None:
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO chatbot_queries (session_id, query, intent, response_ms) VALUES (?,?,?,?)",
                (session_id, query, intent, response_ms),
            )

    # ── Analytics Recommandations ────────────────────────────────────────────

    def get_recommendation_stats(self) -> dict:
        """KPIs du système de recommandation."""
        with self._conn() as conn:
            # Totaux
            total = conn.execute("SELECT COUNT(*) as c FROM recommendations").fetchone()["c"]

            # Catégorie la plus populaire
            top_cat = conn.execute("""
                SELECT category, COUNT(*) as cnt
                FROM recommendations
                WHERE category IS NOT NULL AND category != ''
                GROUP BY category ORDER BY cnt DESC LIMIT 1
            """).fetchone()

            # Activité la plus demandée
            top_act = conn.execute("""
                SELECT activity, COUNT(*) as cnt
                FROM recommendations
                WHERE activity IS NOT NULL AND activity != ''
                GROUP BY activity ORDER BY cnt DESC LIMIT 1
            """).fetchone()

            # Budget préféré
            top_budget = conn.execute("""
                SELECT budget, COUNT(*) as cnt
                FROM recommendations
                WHERE budget IS NOT NULL AND budget != ''
                GROUP BY budget ORDER BY cnt DESC LIMIT 1
            """).fetchone()

            # Distribution catégories
            cat_dist = conn.execute("""
                SELECT category, COUNT(*) as cnt
                FROM recommendations
                WHERE category IS NOT NULL AND category != ''
                GROUP BY category ORDER BY cnt DESC
            """).fetchall()

            # Distribution budgets
            budget_dist = conn.execute("""
                SELECT budget, COUNT(*) as cnt
                FROM recommendations
                WHERE budget IS NOT NULL AND budget != ''
                GROUP BY budget ORDER BY cnt DESC
            """).fetchall()

            # Tendance 7 derniers jours
            trend_7d = conn.execute("""
                SELECT DATE(created_at) as day, COUNT(*) as cnt
                FROM recommendations
                WHERE created_at >= datetime('now', '-7 days')
                GROUP BY day ORDER BY day
            """).fetchall()

        return {
            "total_recommendations": total,
            "top_category": dict(top_cat) if top_cat else None,
            "top_activity": dict(top_act) if top_act else None,
            "preferred_budget": dict(top_budget) if top_budget else None,
            "category_distribution": [dict(r) for r in cat_dist],
            "budget_distribution": [dict(r) for r in budget_dist],
            "trend_7_days": [dict(r) for r in trend_7d],
        }

    # ── Analytics Recherches ─────────────────────────────────────────────────

    def get_search_stats(self) -> dict:
        """KPIs des recherches utilisateurs."""
        with self._conn() as conn:
            total = conn.execute("SELECT COUNT(*) as c FROM searches").fetchone()["c"]

            # Top 10 requêtes
            top_queries = conn.execute("""
                SELECT query, COUNT(*) as cnt
                FROM searches
                WHERE query IS NOT NULL AND query != ''
                GROUP BY query ORDER BY cnt DESC LIMIT 10
            """).fetchall()

            # Moyenne résultats
            avg_results = conn.execute(
                "SELECT AVG(results_count) as avg FROM searches"
            ).fetchone()["avg"]

            # Recherches par heure (dernières 24h)
            hourly = conn.execute("""
                SELECT strftime('%H', created_at) as hour, COUNT(*) as cnt
                FROM searches
                WHERE created_at >= datetime('now', '-24 hours')
                GROUP BY hour ORDER BY hour
            """).fetchall()

        return {
            "total_searches": total,
            "top_10_queries": [dict(r) for r in top_queries],
            "avg_results_per_search": round(avg_results or 0, 1),
            "hourly_distribution_24h": [dict(r) for r in hourly],
        }

    # ── Analytics Chatbot ────────────────────────────────────────────────────

    def get_chatbot_stats(self) -> dict:
        """KPIs du chatbot RAG."""
        with self._conn() as conn:
            total = conn.execute("SELECT COUNT(*) as c FROM chatbot_queries").fetchone()["c"]

            # Intents les plus fréquents
            top_intents = conn.execute("""
                SELECT intent, COUNT(*) as cnt
                FROM chatbot_queries
                WHERE intent IS NOT NULL AND intent != ''
                GROUP BY intent ORDER BY cnt DESC LIMIT 10
            """).fetchall()

            # Temps de réponse moyen
            avg_response = conn.execute(
                "SELECT AVG(response_ms) as avg FROM chatbot_queries WHERE response_ms > 0"
            ).fetchone()["avg"]

            # Requêtes récentes (dernières 24h)
            recent = conn.execute("""
                SELECT COUNT(*) as cnt FROM chatbot_queries
                WHERE created_at >= datetime('now', '-24 hours')
            """).fetchone()["cnt"]

        return {
            "total_queries": total,
            "queries_last_24h": recent,
            "top_intents": [dict(r) for r in top_intents],
            "avg_response_ms": round(avg_response or 0, 1),
        }

    # ── Analytics Clics ──────────────────────────────────────────────────────

    def get_click_stats(self) -> dict:
        with self._conn() as conn:
            total = conn.execute("SELECT COUNT(*) as c FROM clicks").fetchone()["c"]
            by_type = conn.execute("""
                SELECT item_type, COUNT(*) as cnt
                FROM clicks GROUP BY item_type ORDER BY cnt DESC
            """).fetchall()
            top_items = conn.execute("""
                SELECT item_name, item_type, COUNT(*) as cnt
                FROM clicks GROUP BY item_name ORDER BY cnt DESC LIMIT 10
            """).fetchall()
        return {
            "total_clicks": total,
            "by_type": [dict(r) for r in by_type],
            "top_clicked_items": [dict(r) for r in top_items],
        }