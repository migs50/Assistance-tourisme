"""
main.py
Point d'entrée de l'application FastAPI — Assistance Touristique Tanger.
Lance avec : uvicorn main:app --reload
"""

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.chat      import router as chat_router
from routes.recommend  import router as recommend_router
from rag.embedder     import build_index
from routes.recommandation import router as recommandation_router
from routes.dashboard import router as dashboard_router
from routes.activites      import router as activites_router
from routes.evenements     import router as evenements_router
from routes.lieux          import router as lieux_router


# Chargement des variables d'environnement (.env)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Événements de démarrage et d'arrêt de l'application.
    L'index RAG est construit au démarrage si nécessaire.
    """
    print(" Démarrage de l'API Assistance Touristique Tanger...")

    # Vérifie que la clé Groq est présente
    if not os.getenv("GROQ_API_KEY"):
        raise EnvironmentError(" GROQ_API_KEY manquante dans le fichier .env")

    # Construction de l'index RAG (ne fait rien si déjà indexé)
    print("Vérification de l'index RAG...")
    build_index(force_rebuild=False)

    print(" API prête !\n")
    yield
    print(" Arrêt de l'API.")


# Création de l'application FastAPI
app = FastAPI(
    title="Assistance Touristique Tanger",
    description="Système multi-agents intelligent pour le tourisme à Tanger (RAG + Llama 3)",
    version="1.0.0",
    lifespan=lifespan,
)

# Configuration CORS — autorise les requêtes depuis React (port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative React
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(chat_router)
app.include_router(recommend_router)
app.include_router(recommandation_router, prefix="/api/recommandation", tags=["Recommandation"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(activites_router,  prefix="/api", tags=["Activités"])
app.include_router(evenements_router, prefix="/api", tags=["Événements"])
app.include_router(lieux_router,      prefix="/api", tags=["Lieux"])
# ─── Endpoints de base ────────────────────────────────────────────────────────

@app.get("/", tags=["Général"])
async def root():
    return {
        "message": "Bienvenue sur l'API Assistance Touristique Tanger 🇲🇦",
        "docs":    "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Général"])
async def health():
    """Vérifie que l'API est opérationnelle."""
    return {"status": "ok", "groq_key_set": bool(os.getenv("GROQ_API_KEY"))}
