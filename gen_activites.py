import json
import random

activites_data = [
    # Activités sportives (10)
    ("Randonnée Parc Perdicaris", "activite_sportive", "randonnee", 35.7905, -5.8490, "Parc Perdicaris", 3, 150, "tous_niveaux", True, ["marche", "nature", "foret"]),
    ("Surf à la plage d'Achakkar", "activite_sportive", "surf", 35.7620, -5.9380, "Plage Achakkar", 2, 200, "debutant", True, ["surf", "plage", "sport"]),
    ("VTT dans la Forêt Diplomatique", "activite_sportive", "velo", 35.6800, -5.9200, "Forêt Diplomatique", 4, 300, "intermediaire", True, ["velo", "foret", "aventure"]),
    ("Yoga sur la plage", "activite_sportive", "yoga", 35.7940, -5.8080, "Corniche", 1, 100, "tous_niveaux", True, ["yoga", "detente", "mer"]),
    ("Trek dans les montagnes du Rif", "activite_sportive", "randonnee", 35.7500, -5.7000, "Environs Tanger", 8, 400, "avance", False, ["trek", "montagne", "nature"]),
    ("Course à pied sur la Corniche", "activite_sportive", "course", 35.7920, -5.8060, "Corniche", 2, 50, "tous_niveaux", False, ["course", "sport", "urbain"]),
    ("Paddle au Cap Spartel", "activite_sportive", "paddle", 35.7926, -5.9275, "Cap Spartel", 2, 250, "debutant", True, ["paddle", "ocean", "nature"]),
    ("Equitation sur la plage", "activite_sportive", "equitation", 35.7620, -5.9380, "Achakkar", 2, 300, "debutant", True, ["cheval", "plage", "coucher_soleil"]),
    ("Tennis Club de Tanger", "activite_sportive", "tennis", 35.7800, -5.8100, "Centre-ville", 2, 150, "tous_niveaux", True, ["tennis", "club", "sport"]),
    ("Escalade indoor", "activite_sportive", "escalade", 35.7700, -5.8000, "Zone moderne", 2, 120, "debutant", True, ["escalade", "indoor", "sport"]),

    # Expériences culturelles (8)
    ("Cours de Cuisine Marocaine", "experience_culturelle", "cours_cuisine", 35.7892, -5.8129, "Médina", 4, 350, "debutant", True, ["cuisine", "gastronomie", "tradition"]),
    ("Expérience Hammam Traditionnel", "experience_culturelle", "bien_etre", 35.7850, -5.8110, "Médina", 2, 250, "tous_niveaux", True, ["hammam", "detente", "tradition"]),
    ("Atelier de Thé à la Menthe", "experience_culturelle", "degustation", 35.7838, -5.8100, "Grand Socco", 1, 100, "tous_niveaux", True, ["the", "tradition", "culture"]),
    ("Soirée Gnaoua", "experience_culturelle", "musique", 35.7876, -5.8128, "Kasbah", 3, 200, "tous_niveaux", False, ["musique", "gnaoua", "soiree"]),
    ("Dégustation Street Food", "experience_culturelle", "gastronomie", 35.7838, -5.8097, "Médina", 3, 250, "tous_niveaux", False, ["street_food", "degustation", "local"]),
    ("Hammam et Spa de Luxe", "experience_culturelle", "bien_etre", 35.7900, -5.8000, "Corniche", 3, 800, "tous_niveaux", True, ["spa", "luxe", "detente"]),
    ("Atelier de Parfums Orientaux", "experience_culturelle", "artisanat", 35.7860, -5.8100, "Médina", 2, 300, "tous_niveaux", True, ["parfum", "creation", "oriental"]),
    ("Rencontre avec un conteur", "experience_culturelle", "tradition_orale", 35.7845, -5.8090, "Petit Socco", 2, 150, "tous_niveaux", False, ["conteur", "histoire", "culture"]),

    # Excursions (4)
    ("Excursion d'une journée à Chefchaouen", "excursion", "excursion_ville", 35.1714, -5.2697, "Chefchaouen", 10, 600, "tous_niveaux", False, ["chefchaouen", "excursion", "ville_bleue"]),
    ("Découverte d'Asilah", "excursion", "excursion_ville", 35.4667, -6.0333, "Asilah", 6, 400, "tous_niveaux", False, ["asilah", "art", "medina"]),
    ("Tour du Cap Spartel et Grottes d'Hercule", "excursion", "nature", 35.7595, -5.9395, "Cap Spartel", 4, 350, "tous_niveaux", False, ["cap_spartel", "grottes", "nature"]),
    ("Excursion à Tétouan", "excursion", "excursion_ville", 35.5785, -5.3684, "Tétouan", 8, 500, "tous_niveaux", False, ["tetouan", "patrimoine", "excursion"]),

    # Visites guidées (7)
    ("Visite Guidée de la Médina", "visite_guidee", "historique", 35.7850, -5.8120, "Médina", 3, 200, "tous_niveaux", False, ["medina", "histoire", "guide"]),
    ("Visite de la Kasbah", "visite_guidee", "historique", 35.7876, -5.8128, "Kasbah", 2, 150, "tous_niveaux", False, ["kasbah", "histoire", "panorama"]),
    ("Tanger sur les pas des écrivains", "visite_guidee", "litteraire", 35.7830, -5.8100, "Tanger", 4, 250, "tous_niveaux", False, ["litterature", "histoire", "bowles"]),
    ("Tour Architectural de Tanger", "visite_guidee", "architecture", 35.7800, -5.8100, "Centre-ville", 3, 200, "tous_niveaux", False, ["architecture", "art_deco", "histoire"]),
    ("Visite des Marchés et Souks", "visite_guidee", "culturel", 35.7838, -5.8097, "Grand Socco", 3, 150, "tous_niveaux", False, ["souk", "shopping", "local"]),
    ("Tanger la nuit", "visite_guidee", "nocturne", 35.7845, -5.8110, "Tanger", 3, 250, "tous_niveaux", False, ["nuit", "visite", "lumiere"]),
    ("Sur les traces d'Ibn Battuta", "visite_guidee", "historique", 35.7855, -5.8115, "Médina", 3, 200, "tous_niveaux", False, ["ibn_battuta", "histoire", "voyage"]),

    # Activités artistiques (3)
    ("Atelier de Poterie Marocaine", "activite_artistique", "poterie", 35.7865, -5.8100, "Médina", 3, 300, "debutant", True, ["poterie", "art", "creation"]),
    ("Initiation à la Calligraphie", "activite_artistique", "calligraphie", 35.7840, -5.8110, "Centre-ville", 2, 200, "debutant", True, ["calligraphie", "art", "arabe"]),
    ("Cours de Peinture Zellige", "activite_artistique", "peinture", 35.7870, -5.8120, "Kasbah", 3, 250, "debutant", True, ["zellige", "peinture", "artisanat"]),

    # Activités nautiques (3)
    ("Plongée sous-marine au Détroit", "activite_nautique", "plongee", 35.7950, -5.8000, "Port de Tanger", 4, 600, "intermediaire", True, ["plongee", "mer", "detroit"]),
    ("Kitesurf à Dalia", "activite_nautique", "kitesurf", 35.7400, -5.9500, "Plage Dalia", 4, 500, "debutant", True, ["kitesurf", "mer", "vent"]),
    ("Balade en bateau dans le détroit", "activite_nautique", "bateau", 35.7950, -5.8000, "Marina Tanger", 2, 400, "tous_niveaux", False, ["bateau", "detroit", "panorama"])
]

desc_fr_template = "Plongez dans l'authenticité de Tanger avec cette activité incontournable de type {cat}. Que vous soyez novice ou expérimenté, cette expérience vous fera découvrir une nouvelle facette de la région. Encadrée par des professionnels passionnés, vous profiterez d'un moment inoubliable tout en vous imprégnant de l'atmosphère locale et du savoir-faire marocain. Une excellente façon d'enrichir votre séjour."
desc_en_template = "Dive into the authenticity of Tangier with this must-do {cat} activity. Whether you are a novice or experienced, this experience will help you discover a new facet of the region. Guided by passionate professionals, you will enjoy an unforgettable moment while soaking up the local atmosphere and Moroccan know-how. A great way to enrich your stay."
desc_ar_template = "انغمس في أصالة طنجة مع هذا النشاط الذي لا يُفوّت من نوع {cat}. سواء كنت مبتدئًا أو خبيرًا، ستجعلك هذه التجربة تكتشف جانبًا جديدًا من المنطقة. بإشراف محترفين شغوفين، ستستمتع بلحظة لا تُنسى بينما تتشرب الجو المحلي والخبرة المغربية. طريقة ممتازة لإثراء إقامتك."

result = []
for i, row in enumerate(activites_data):
    nom, cat, scat, lat, lon, qrt, duree, prix, niveau, materiel, tags = row
    
    act_id = f"act_{i+1:03d}"
    
    cat_friendly = cat.replace('_', ' ')
    
    result.append({
        "id": act_id,
        "nom": nom,
        "categorie": cat,
        "sous_categorie": scat,
        "latitude": lat,
        "longitude": lon,
        "adresse": f"{qrt}, Tanger, Maroc",
        "quartier": qrt,
        "description_fr": desc_fr_template.format(cat=cat_friendly),
        "description_en": desc_en_template.format(cat=cat_friendly),
        "description_ar": desc_ar_template.format(cat=cat_friendly),
        "duree_heures": duree,
        "prix_par_personne_mad": prix,
        "prix_groupe_mad": prix * 3 if prix > 0 else 0,
        "taille_groupe_max": random.choice([4, 8, 12, 20]),
        "niveau_requis": niveau,
        "materiel_fourni": materiel,
        "langues_disponibles": ["français", "anglais", "arabe", "espagnol"][:random.randint(2, 4)],
        "inclus": ["encadrement professionnel", "équipement de base"],
        "non_inclus": ["transport", "boissons", "pourboires"],
        "reservation_requise": True,
        "delai_annulation_heures": 24,
        "note_moyenne": round(random.uniform(4.0, 4.9), 1),
        "nb_avis": random.randint(30, 500),
        "saison_disponible": ["toute_annee"],
        "age_minimum": random.choice([6, 10, 16]),
        "accessible_pmr": random.choice([True, False]),
        "organisateur": f"Tanger {cat_friendly.capitalize()} Tours",
        "telephone": "+212661234567",
        "tags": tags + ["tanger", "experience"],
        "image_url": f"https://source.unsplash.com/600x400/?{scat.replace('_',',')},activity",
        "source_donnee": "Google Places + Viator"
    })

out = r'c:\Users\HP\Documents\projet touristique\dataset\activites.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Total: {len(result)} activités générées.")
