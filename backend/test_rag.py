from rag.retriever import retrieve

def test_recherche():
    print("🔍 Test du RAG en cours...")
    
    # Question spécifique à ton fichier assurances.json
    query = "Quelles sont les assurances pour les touristes étrangers ?"
    
    try:
        # On teste sans filtre d'abord pour voir si les documents existent
        results = retrieve(query, n_results=3)
        
        if not results:
            print("❌ ÉCHEC : Aucun document trouvé dans la base.")
            return

        print(f"✅ SUCCÈS : {len(results)} documents trouvés !")
        for i, doc in enumerate(results, 1):
            print(f"\n--- Résultat {i} ---")
            print(f"Source: {doc['source']}")
            print(f"Catégorie: {doc['category']}")
            print(f"Texte: {doc['text'][:150]}...") # On affiche les 150 premiers caractères
            print(f"Score: {doc['score']}")

    except Exception as e:
        print(f"⚠️ Erreur lors du test : {e}")

if __name__ == "__main__":
    test_recherche()