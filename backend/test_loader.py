from rag.loader import load_all_documents

# On charge tout
docs = load_all_documents()

# On affiche le premier document pour voir si la normalisation est belle
if docs:
    print("--- EXEMPLE DE DOCUMENT NORMALISÉ ---")
    print(f"Catégorie : {docs[0]['_category']}")
    print(f"Texte pour l'IA : {docs[0]['_text']}")