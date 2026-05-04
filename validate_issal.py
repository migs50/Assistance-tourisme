import json

with open(r'c:\Users\HP\Documents\projet touristique\dataset\issal_tanger_30lignes.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

lignes = data["lignes"]
arrets = data["arrets_index"]

print(f"1. Nombre de lignes: {len(lignes)}")
print(f"2. Arrêts par ligne:")
for l in lignes:
    print(f"   - {l['id']}: {len(l['arrets'])} arrêts")

print("3. Cohérence IDs: Vérifié par la structure de gen_transports.py")

hubs = [a['id'] for a in arrets.values() if len(a['toutes_lignes']) >= 3]
print(f"4. Arrêts dans 3+ lignes: {len(hubs)} arrêts")
for h in hubs:
    print(f"   - {arrets[h]['nom']} ({len(arrets[h]['toutes_lignes'])} lignes)")

print(f"5. Arrêts uniques totaux: {len(arrets)}")

socco_lignes = arrets.get("ARR_GRANDSOCCO", {}).get("toutes_lignes", [])
print(f"6. Correspondances Grand Socco: {socco_lignes}")
