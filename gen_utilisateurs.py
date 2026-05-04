import json
import random

nationalites_config = [
    ("Français", "FR", "Europe", "fr", ["fr", "en"], 150),
    ("Espagnol", "ES", "Europe", "es", ["es", "en"], 180),
    ("Britannique", "GB", "Europe", "en", ["en"], 30),
    ("Allemand", "DE", "Europe", "de", ["de", "en"], 50),
    ("Américain", "US", "Amerique du Nord", "en", ["en", "es"], 120),
    ("Italien", "IT", "Europe", "it", ["it", "en"], 30),
    ("Japonais", "JP", "Asie", "ja", ["ja", "en"], 130),
    ("Brésilien", "BR", "Amerique du Sud", "pt", ["pt", "en"], 20),
    ("Canadien", "CA", "Amerique du Nord", "en", ["en", "fr"], 60),
    ("Néerlandais", "NL", "Europe", "nl", ["nl", "en"], 30),
]

budgets_config = [
    ("economique", 320, 300, 500),
    ("moyen", 320, 600, 1200),
    ("premium", 160, 1500, 5000),
]

voyageurs_config = [
    ("solo", 240, 1, 1),
    ("couple", 240, 2, 2),
    ("famille", 200, 3, 6),
    ("groupe", 120, 4, 12),
]

all_nationalites = []
for nat, code, cont, lang_pref, langs, count in nationalites_config:
    for _ in range(count):
        all_nationalites.append((nat, code, cont, lang_pref, langs))

all_budgets = []
for b_type, count, b_min, b_max in budgets_config:
    for _ in range(count):
        all_budgets.append((b_type, b_min, b_max))

all_voyageurs = []
for v_type, count, p_min, p_max in voyageurs_config:
    for _ in range(count):
        all_voyageurs.append((v_type, p_min, p_max))

random.shuffle(all_nationalites)
random.shuffle(all_budgets)
random.shuffle(all_voyageurs)

interets_possibles = ["gastronomie", "histoire", "architecture", "nature", "plage", "aventure", "shopping", "art", "vie_nocturne", "bien_etre", "sport", "artisanat"]
regimes = ["standard"] * 70 + ["vegetarien"] * 15 + ["vegan"] * 5 + ["sans_gluten"] * 5 + ["halal"] * 5
transports = ["taxi", "location_voiture", "marche", "bus"]
hebergements = ["hotel_3_etoiles", "hotel_4_etoiles", "hotel_5_etoiles", "riad", "auberge", "appartement"]
inspirations = ["instagram", "tiktok", "blog_voyage", "agence", "amis"]

def get_saison(mois):
    if 3 <= mois <= 5: return "printemps"
    if 6 <= mois <= 8: return "ete"
    if 9 <= mois <= 11: return "automne"
    return "hiver"

users = []
for i in range(800):
    nat, code, cont, lang_pref, langs = all_nationalites[i]
    b_type, b_min, b_max = all_budgets[i]
    v_type, p_min, p_max = all_voyageurs[i]
    
    mois_visite = random.randint(1, 12)
    saison_visite = get_saison(mois_visite)
    premier_voyage = random.choice([True, False])
    
    # Adjust budget max somewhat randomly within the bounds
    budget_max_mad = random.randint(b_min // 100, b_max // 100) * 100
    
    # Adjust preferences based on budget
    heb = random.choice(hebergements)
    if b_type == "premium":
        heb = random.choice(["hotel_5_etoiles", "riad", "hotel_4_etoiles"])
    elif b_type == "economique":
        heb = random.choice(["auberge", "hotel_3_etoiles", "appartement"])
    
    users.append({
        "id": f"user_{i+1:03d}",
        "nationalite": nat,
        "code_pays": code,
        "continent": cont,
        "age": random.randint(22, 72),
        "genre": random.choices(["M", "F", "Autre"], weights=[48, 50, 2])[0],
        "langue_preferee": lang_pref,
        "langues_parlees": langs,
        "budget_journalier": b_type,
        "budget_max_mad": budget_max_mad,
        "interets": random.sample(interets_possibles, random.randint(2, 5)),
        "type_voyageur": v_type,
        "nb_personnes": random.randint(p_min, p_max),
        "duree_sejour_jours": random.randint(2, 14),
        "saison_visite": saison_visite,
        "mois_visite": mois_visite,
        "premier_voyage_maroc": premier_voyage,
        "nb_voyages_maroc": 1 if premier_voyage else random.randint(2, 10),
        "mobilite_reduite": random.random() < 0.05,
        "regime_alimentaire": random.choice(regimes),
        "moyen_transport_prefere": random.choice(transports),
        "type_hebergement_prefere": heb,
        "source_inspiration": random.choice(inspirations),
        "score_aventure": round(random.uniform(0.1, 1.0), 2),
        "score_culture": round(random.uniform(0.3, 1.0), 2),
        "score_gastronomie": round(random.uniform(0.4, 1.0), 2),
        "score_nature": round(random.uniform(0.1, 1.0), 2),
        "score_shopping": round(random.uniform(0.1, 0.9), 2),
        "source_donnee": "donnees_synthetiques_python"
    })

filepath = r"c:\Users\HP\Documents\projet touristique\dataset\utilisateurs.json"
with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(users, f, ensure_ascii=False, indent=2)

print("800 profils utilisateurs générés.")
