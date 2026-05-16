"""
models/schemas.py
Modèles Pydantic pour les requêtes et réponses de l'API.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AgentType(str, Enum):
    LEISURE   = "leisure"
    LOGISTICS = "logistics"
    EMERGENCY = "emergency"
    GENERAL   = "general"


# ─── Requêtes ─────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:    str            = Field(..., min_length=1, max_length=2000,
                                       description="Message de l'utilisateur")
    session_id: str            = Field(default="default",
                                       description="Identifiant de session")
    language:   str            = Field(default="fr",
                                       description="Langue de réponse : fr | en | ar")


class RecommendRequest(BaseModel):
    query:    str              = Field(..., min_length=1,
                                       description="Ce que l'utilisateur cherche")
    category: Optional[str]   = Field(default=None,
                                       description="Filtrer par catégorie (hotel, restaurant…)")
    limit:    int              = Field(default=5, ge=1, le=20,
                                       description="Nombre max de résultats")


# ─── Réponses ─────────────────────────────────────────────────────────────────

class Source(BaseModel):
    text:     str
    category: str
    source:   str
    score:    float


class ChatResponse(BaseModel):
    agent:      AgentType
    response:   str
    sources:    list[Source] = []
    session_id: str


class RecommendResponse(BaseModel):
    query:   str
    results: list[Source]
    total:   int


# ─── Santé ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status:       str
    groq_key_set: bool
    rag_indexed:  bool = False