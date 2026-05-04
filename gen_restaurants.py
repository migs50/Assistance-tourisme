import json
import random

categories_config = [
    {"type": "marocaine", "count": 40, "base_names": ["Dar", "Palais", "Chez", "Saveurs de", "Le Ksar"], "words": ["Médina", "Tanja", "Zellige", "Atlas", "Safran"]},
    {"type": "poissons", "count": 20, "base_names": ["Le Pêcheur", "Océan", "La Marée", "Poisson", "Perle de Mer"], "words": ["Bleu", "Frais", "Grill", "Atlantique", "Port"]},
    {"type": "mediterraneenne", "count": 20, "base_names": ["La Casa", "El Pescador", "Tapas", "Paella", "Bella"], "words": ["España", "Andalucia", "Roma", "Napoli", "Ibiza"]},
    {"type": "internationale", "count": 10, "base_names": ["The Globe", "Le Continental", "Fusion", "Bistro", "Avenue"], "words": ["Gourmet", "Lounge", "Grill", "Resto", "Chef"]},
    {"type": "cafe", "count": 20, "base_names": ["Café", "Salon de Thé", "La Menthe", "Le Tanjawi", "L'Oriental"], "words": ["Hafa", "Socco", "Tingis", "Central", "Kasbah"]},
    {"type": "fast_food", "count": 20, "base_names": ["Snack", "Tacos", "Burger", "Chawarma", "Sandwicherie"], "words": ["Express", "City", "Star", "King", "Miam"]},
    {"type": "rooftop", "count": 10, "base_names": ["Rooftop", "La Terrasse", "Sky", "Panorama", "Vue Mer"], "words": ["Lounge", "Club", "Bar", "360", "Chill"]}
]

quartiers = ["Kasbah", "Médina", "Centre-ville", "Malabata", "Corniche", "Marshan"]

restaurants = []
resto_id_counter = 1

desc_fr_template = "Découvrez ce magnifique {type} situé dans le quartier de {quartier}. Une expérience culinaire inoubliable avec des plats savoureux et un service de qualité. Idéal pour partager un repas convivial en famille ou entre amis."
desc_en_template = "Discover this magnificent {type} located in the {quartier} district. An unforgettable culinary experience with tasty dishes and quality service. Ideal for sharing a friendly meal with family or friends."
desc_ar_template = "اكتشف هذا الـ {type} الرائع الواقع في حي {quartier}. تجربة طهي لا تُنسى مع أطباق لذيذة وخدمة عالية الجودة. مثالي لمشاركة وجبة ودية مع العائلة أو الأصدقاء."

for config in categories_config:
    for i in range(config["count"]):
        nom = f"{random.choice(config['base_names'])} {random.choice(config['words'])} {i+1}"
        quartier = random.choice(quartiers)
        
        is_marocain = config["type"] == "marocaine"
        is_poisson = config["type"] == "poissons"
        is_cafe = config["type"] == "cafe"
        is_fastfood = config["type"] == "fast_food"
        is_rooftop = config["type"] == "rooftop"
        
        fourchette_prix = random.choice(["economique", "moyen", "premium"])
        if is_fastfood:
            fourchette_prix = "economique"
        elif is_rooftop:
            fourchette_prix = "premium"
            
        if fourchette_prix == "economique":
            p_min, p_max = 20, 80
        elif fourchette_prix == "moyen":
            p_min, p_max = 80, 200
        else:
            p_min, p_max = 200, 600
            
        restaurants.append({
            "id": f"resto_{resto_id_counter:03d}",
            "nom": nom,
            "categorie": "cafe" if is_cafe else "fast_food" if is_fastfood else "restaurant",
            "type_cuisine": config["type"],
            "sous_type": "traditionnel",
            "latitude": 35.7891 + random.uniform(-0.05, 0.05),
            "longitude": -5.8134 + random.uniform(-0.05, 0.05),
            "adresse": f"Rue {random.randint(1, 100)}, {quartier}, Tanger 90000",
            "quartier": quartier,
            "description_fr": desc_fr_template.format(type=config["type"], quartier=quartier),
            "description_en": desc_en_template.format(type=config["type"], quartier=quartier),
            "description_ar": desc_ar_template.format(type=config["type"], quartier=quartier),
            "fourchette_prix": fourchette_prix,
            "prix_moyen_mad": (p_min + p_max) // 2,
            "prix_min_mad": p_min,
            "prix_max_mad": p_max,
            "note_moyenne": round(random.uniform(3.5, 5.0), 1),
            "nb_avis": random.randint(50, 1000),
            "halal": True,
            "vegetarien": random.choice([True, False]),
            "vegan": random.choice([True, False]),
            "sans_gluten": random.choice([True, False]),
            "terrasse": random.choice([True, False]),
            "vue_mer": is_rooftop or random.choice([True, False]),
            "rooftop": is_rooftop,
            "reservation_requise": fourchette_prix == "premium",
            "livraison": is_fastfood or random.choice([True, False]),
            "horaires_ouverture": "12:00-23:00",
            "jours_fermeture": [random.choice(["lundi", "mardi", "dimanche"])],
            "capacite_personnes": random.randint(20, 150),
            "plats_signature": ["Plat 1", "Plat 2", "Plat 3"],
            "langues_menu": ["français", "arabe", "anglais"],
            "tags": ["gastronomie", config["type"]],
            "saison_recommandee": ["printemps", "automne", "ete"],
            "image_url": "https://source.unsplash.com/600x400/?food,restaurant",
            "telephone": f"+212539{random.randint(100000, 999999)}",
            "instagram": f"@{nom.replace(' ', '').lower()}",
            "source_donnee": "Google Places + TripAdvisor"
        })
        resto_id_counter += 1

with open(r'c:\Users\HP\Documents\projet touristique\dataset\restaurants.json', 'w', encoding='utf-8') as f:
    json.dump(restaurants, f, ensure_ascii=False, indent=2)

print(f"Total restaurants generated: {len(restaurants)}")
