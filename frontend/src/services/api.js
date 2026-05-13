/**
 * api.js — Service de communication avec le backend FastAPI
 * Toutes les requêtes vers http://localhost:8000
 */

const BASE_URL = "http://127.0.0.1:8000/api";  // ← plus de localhost:8000

// ── Chat principal ────────────────────────────────────────────────────────────
export async function sendMessage(message, sessionId = "default", language = "fr") {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId, language }),
  });
  if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
  return res.json();
}

// ── Recommandations directes ──────────────────────────────────────────────────
export async function getRecommendations(query, category = null, limit = 5) {
  const res = await fetch(`${BASE_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, category, limit }),
  });
  if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
  return res.json();
}

// ── Catégories disponibles ────────────────────────────────────────────────────
export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
  return res.json();
}

// ── Agents disponibles ────────────────────────────────────────────────────────
export async function getAgents() {
  const res = await fetch(`${BASE_URL}/agents`);
  if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
  return res.json();
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function healthCheck() {
  const res = await fetch("http://localhost:8000/health");
  if (!res.ok) throw new Error("API indisponible");
  return res.json();
}