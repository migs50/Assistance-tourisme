import os
import sys
from dotenv import load_dotenv

# ── 0. CHARGEMENT PRIORITAIRE ────────────────────────────────────────────────
# On charge l'environnement AVANT tout import de nos propres modules
load_dotenv()

# ── 1. Vérifie les imports ────────────────────────────────────────────────────
print("=" * 55)
print(" TEST DU SYSTÈME MULTI-AGENTS — TANGER TOURISME")
print("=" * 55)

errors = []

def check(label, fn):
    try:
        fn()
        print(f"  ✅  {label}")
    except Exception as e:
        print(f"  ❌  {label} → {e}")
        errors.append(label)

# Maintenant les imports passeront car la clé est dans l'environnement
check("Import models.schemas",      lambda: __import__("models.schemas"))
check("Import agents.base_agent",    lambda: __import__("agents.base_agent"))
check("Import agents.leisure_agent", lambda: __import__("agents.leisure_agent"))
check("Import agents.logistics_agent",lambda:__import__("agents.logistics_agent"))
check("Import agents.emergency_agent",lambda:__import__("agents.emergency_agent"))
check("Import agents.general_agent", lambda: __import__("agents.general_agent"))
check("Import agents.orchestrator",  lambda: __import__("agents.orchestrator"))
check("Import routes.chat",          lambda: __import__("routes.chat"))
check("Import routes.recommend",     lambda: __import__("routes.recommend"))

# ── 2. Vérifie la clé Groq ────────────────────────────────────────────────────
print()
key = os.getenv("GROQ_API_KEY", "")
if key and key.startswith("gsk_"):
    print("  ✅  GROQ_API_KEY trouvée et valide")
else:
    print("  ❌  GROQ_API_KEY manquante ou invalide")
    errors.append("GROQ_API_KEY")

# ── 3. Vérifie l'index RAG ────────────────────────────────────────────────────
print()
try:
    from rag.embedder import get_chroma_client, get_collection
    client     = get_chroma_client()
    collection = get_collection(client)
    count      = collection.count()
    if count > 0:
        print(f"  ✅  ChromaDB indexé ({count} documents)")
    else:
        print("  ⚠️   ChromaDB vide — lance : python -m rag.embedder")
        errors.append("RAG vide")
except Exception as e:
    print(f"  ❌  ChromaDB inaccessible → {e}")
    errors.append("ChromaDB")

# ── 4. Test de routage de l'orchestrateur ─────────────────────────────────────
print()
print("  Test de détection d'intention :")
try:
    from agents.orchestrator import Orchestrator
    orch = Orchestrator()
    tests = [
        ("urgence médicale ambulance",  "emergency"),
        ("meilleur restaurant Tanger",  "leisure"),
        ("comment aller à Tétouan bus", "logistics"),
        ("météo à Tanger",              "general"),
    ]
    for msg, expected in tests:
        detected = orch._detect_agent(msg).value
        ok = "✅" if detected == expected else "❌"
        print(f"    {ok}  '{msg}' → {detected} (attendu: {expected})")
        if detected != expected:
            errors.append(f"Routage '{msg}'")
except Exception as e:
    print(f"    Erreur orchestrateur → {e}")
    errors.append("Orchestrateur")

# ── 5. TEST RÉEL DU LLM (Llama 3) ───────────────────────────────────────────
print()
print("  Test de réponse Llama 3 (Groq) :")
try:
    # On teste une petite question via l'orchestrateur
    # Note : Cela consomme quelques tokens, c'est pour ça qu'on ne le fait qu'à la fin
    response = orch.handle("Bonjour, qui es-tu ?", language="fr")
    print(f"    ✅ L'IA répond : '{response.response[:50]}...'")
except Exception as e:
    print(f"    ❌ Échec de l'appel LLM → {e}")
    errors.append("Test LLM")

# ── Résumé ────────────────────────────────────────────────────────────────────
print()
print("=" * 55)
if not errors:
    print("  Tous les tests sont passés — SYSTÈME OPÉRATIONNEL !")
else:
    print(f"    {len(errors)} problème(s) à corriger :")
    for e in errors:
        print(f"       • {e}")
print("=" * 55)