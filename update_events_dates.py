import json

filepath = r'c:\Users\HP\Documents\projet touristique\dataset\evenements.json'
with open(filepath, 'r', encoding='utf-8') as f:
    events = json.load(f)

for event in events:
    mois = event['mois']
    # If month is July to December, it falls in 2026
    # If month is January to June, it falls in 2027
    year = "2026" if mois >= 7 else "2027"
    
    # Replace the year in date_debut and date_fin
    date_debut = event['date_debut']
    date_fin = event['date_fin']
    
    event['date_debut'] = f"{year}-{date_debut[5:]}"
    event['date_fin'] = f"{year}-{date_fin[5:]}"

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print("Dates des événements mises à jour (2026-2027).")
