# backend/routes/dashboard.py
"""
Router principal Dashboard — point d'entrée dans routes/
Ce fichier relie main.py au module dashboard/
"""
from fastapi import APIRouter
from dashboard.routers import map_router, stats_router, analytics_router

router = APIRouter()

router.include_router(map_router.router,       prefix="/map",       tags=["🗺️ Carte"])
router.include_router(stats_router.router,     prefix="/stats",     tags=["📊 KPIs"])
router.include_router(analytics_router.router, prefix="/analytics", tags=["🤖 Analytics"])