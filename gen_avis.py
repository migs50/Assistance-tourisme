import json
import random
from datetime import datetime, timedelta

# Configuration
TOTAL = 100
CONFIG = {
    "lieu_touristique": {"count": 40, "pos": 24, "neu": 10, "neg": 6, "prefix": "lieu"},
    "restaurant": {"count": 25, "pos": 15, "neu": 6, "neg": 4, "prefix": "resto"},
    "hotel": {"count": 20, "pos": 12, "neu": 5, "neg": 3, "prefix": "hotel"},
    "activite": {"count": 15, "pos": 9, "neu": 4, "neg": 2, "prefix": "act"}
}

def random_date(start, end):
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start + timedelta(seconds=random_second)

d1 = datetime.strptime('2023-01-01', '%Y-%m-%d')
d2 = datetime.strptime('2025-03-31', '%Y-%m-%d')

def get_saison(m):
    if m in [3,4,5]: return "printemps"
    if m in [6,7,8]: return "ete"
    if m in [9,10,11]: return "automne"
    return "hiver"

positive_fr = [
    "Une expérience absolument fantastique et mémorable que je recommande vivement à tous ceux qui visitent la ville. L'ambiance était incroyable, le service impeccable et l'authenticité des lieux m'a vraiment marqué. Nous avons passé un moment inoubliable, plein de découvertes et de belles surprises à chaque coin. C'est définitivement un endroit où je reviendrai lors de mon prochain voyage ici.",
    "J'ai été totalement charmé par cet endroit exceptionnel. Tout était parfait, depuis l'accueil chaleureux jusqu'aux moindres détails de l'expérience. Les couleurs, les odeurs et l'atmosphère générale sont tout simplement magiques et très représentatives de la culture locale. Si vous cherchez un endroit unique pour vous imprégner de l'esprit de la ville, ne cherchez pas plus loin. À faire absolument !",
    "C'est de loin l'une des meilleures expériences que j'ai eues pendant mon séjour. L'endroit est magnifique, très bien entretenu et le personnel est d'une gentillesse rare. J'ai particulièrement apprécié l'attention portée aux détails et la qualité de la prestation proposée. Je n'hésiterai pas une seconde à recommander cette adresse à mes amis et à ma famille qui prévoient de venir."
]

positive_en = [
    "An absolutely fantastic and memorable experience that I highly recommend to anyone visiting the city. The atmosphere was incredible, the service impeccable, and the authenticity of the place really left a mark on me. We had an unforgettable time, full of discoveries and beautiful surprises at every corner. It's definitely a place I'll return to on my next trip here.",
    "I was totally charmed by this exceptional place. Everything was perfect, from the warm welcome to the smallest details of the experience. The colors, the smells, and the overall atmosphere are simply magical and very representative of the local culture. If you are looking for a unique place to soak up the spirit of the city, look no further. A must do!",
    "This is by far one of the best experiences I've had during my stay. The place is beautiful, very well maintained, and the staff is exceptionally kind. I particularly appreciated the attention to detail and the quality of the service provided. I will not hesitate for a second to recommend this address to my friends and family planning to visit."
]

neutral_fr = [
    "L'expérience était correcte dans l'ensemble, mais il y a certainement des points à améliorer. Bien que le lieu ait du charme et un certain potentiel, j'ai trouvé que le service était un peu lent et désorganisé à certains moments. Le prix me semble légèrement élevé par rapport à la qualité globale de la prestation. C'est une visite intéressante, mais ce n'est pas un incontournable absolu selon moi.",
    "C'était une visite agréable, sans plus. L'endroit est sympathique et correspond plus ou moins à ce que l'on peut attendre, mais je n'ai pas été particulièrement émerveillé. Il y avait pas mal de monde, ce qui a un peu gâché l'authenticité du moment. Je pense que c'est bien de le voir une fois si vous avez le temps, mais ne faites pas un grand détour spécialement pour ça."
]

neutral_en = [
    "The experience was okay overall, but there are definitely areas for improvement. While the place has charm and potential, I found the service to be a bit slow and disorganized at times. The price seems slightly high compared to the overall quality of the service. It's an interesting visit, but not an absolute must-do in my opinion.",
    "It was a pleasant visit, nothing more. The place is nice and roughly matches expectations, but I wasn't particularly amazed. There were quite a few people, which somewhat spoiled the authenticity of the moment. I think it's good to see it once if you have the time, but don't go out of your way specifically for it."
]

negative_fr = [
    "Je suis extrêmement déçu par cette expérience qui n'a pas du tout été à la hauteur de mes attentes. Le service était vraiment médiocre, le personnel semblait peu intéressé et l'endroit manquait cruellement d'entretien. De plus, j'ai trouvé que c'était un véritable attrape-touristes avec des prix exorbitants pour ce qui est réellement proposé. Je vous conseille vivement de passer votre chemin et de chercher mieux ailleurs.",
    "Une vraie perte de temps et d'argent. Dès notre arrivée, nous avons été mal accueillis et l'ambiance était désagréable. Les informations données étaient incorrectes et nous avons eu l'impression d'être pressés tout le temps. L'endroit est surcoté et ne correspond pas du tout aux belles descriptions qu'on peut lire sur internet. Très mauvaise expérience globale, je ne recommande absolument pas cet endroit."
]

negative_en = [
    "I am extremely disappointed with this experience which completely failed to meet my expectations. The service was really poor, the staff seemed uninterested, and the place was sorely lacking in maintenance. Moreover, I found it to be a real tourist trap with exorbitant prices for what is actually offered. I highly advise you to skip it and look for something better elsewhere.",
    "A real waste of time and money. From the moment we arrived, we were poorly received, and the atmosphere was unpleasant. The information provided was incorrect, and we felt rushed the entire time. The place is overrated and does not match the beautiful descriptions you read online at all. Very bad overall experience, I absolutely do not recommend this place."
]

aspects = {
    "positif": ["ambiance", "authenticite", "qualite", "service", "proprete", "vue", "accueil", "guide", "prix_correct"],
    "neutre": ["attente", "foule", "prix_eleve", "moyen", "correct"],
    "negatif": ["service_lent", "attrape_touriste", "bruyant", "cher", "sale", "mauvais_accueil"]
}

# Distribute generating reviews
avis_list = []
avis_id_counter = 1

def generate_avis(entite_type, entite_prefix, sentiment_cat, pos_score_range, note_range):
    global avis_id_counter
    
    idx = random.randint(0, len(eval(f"positive_fr"))-1) if sentiment_cat == "positif" else random.randint(0, len(eval(f"neutral_fr"))-1) if sentiment_cat == "neutre" else random.randint(0, len(eval(f"negative_fr"))-1)
    
    if sentiment_cat == "positif":
        cfr = positive_fr[idx]
        cen = positive_en[idx]
        titre = random.choice(["Une expérience inoubliable !", "Fantastique !", "À faire absolument", "Magnifique découverte", "Parfait du début à la fin"])
        asp_pos = random.sample(aspects["positif"], random.randint(2, 4))
        asp_neg = []
        rec = True
        ret = True
    elif sentiment_cat == "neutre":
        cfr = neutral_fr[idx]
        cen = neutral_en[idx]
        titre = random.choice(["Correct mais sans plus", "Mitigé", "Peut mieux faire", "Expérience moyenne", "Agréable mais cher"])
        asp_pos = random.sample(aspects["positif"], random.randint(1, 2))
        asp_neg = random.sample(aspects["neutre"], random.randint(1, 2))
        rec = random.choice([True, False])
        ret = random.choice([True, False])
    else:
        cfr = negative_fr[idx]
        cen = negative_en[idx]
        titre = random.choice(["Très décevant", "À éviter", "Perte de temps", "Passez votre chemin", "Surcoté et cher"])
        asp_pos = []
        asp_neg = random.sample(aspects["negatif"], random.randint(2, 4))
        rec = False
        ret = False

    date_v = random_date(d1, d2)
    saison = get_saison(date_v.month)
    score = round(random.uniform(*pos_score_range), 2)
    note = random.randint(*note_range)
    
    # Adding a small random string to make descriptions unique
    unique_suffix_fr = f" Visite effectuée le {date_v.strftime('%d/%m/%Y')}."
    unique_suffix_en = f" Visit done on {date_v.strftime('%m/%d/%Y')}."
    cfr += unique_suffix_fr
    cen += unique_suffix_en
    
    avis_list.append({
        "id": f"avis_{avis_id_counter:03d}",
        "utilisateur_id": f"user_{random.randint(1, 50):03d}",
        "entite_type": entite_type,
        "entite_id": f"{entite_prefix}_{random.randint(1, 15):03d}",
        "entite_nom": f"Nom générique {entite_type} {random.randint(1, 15)}",
        "note": note,
        "titre_fr": titre,
        "commentaire_fr": cfr,
        "commentaire_en": cen,
        "sentiment": sentiment_cat,
        "score_sentiment": score,
        "aspects_positifs": asp_pos,
        "aspects_negatifs": asp_neg,
        "duree_reelle_min": random.randint(30, 180),
        "heure_visite": f"{random.randint(9, 21):02d}:{random.choice(['00', '15', '30', '45'])}",
        "date_visite": date_v.strftime("%Y-%m-%d"),
        "saison_visite": saison,
        "photos_prises": random.randint(0, 50),
        "niveau_affluence": random.choice(["faible", "moyen", "eleve"]),
        "recommande": rec,
        "visite_en": random.choice(["solo", "couple", "famille", "amis", "groupe"]),
        "budget_depense_mad": random.randint(50, 800),
        "retournerait": ret,
        "conseille_a": random.sample(["couples", "familles", "amis", "passionnes_histoire", "aventuriers", "amateurs_art"], random.randint(1, 3)),
        "source_donnee": "donnees_synthetiques_nlp"
    })
    avis_id_counter += 1

for e_type, conf in CONFIG.items():
    prefix = conf["prefix"]
    # Positifs
    for _ in range(conf["pos"]): generate_avis(e_type, prefix, "positif", (0.30, 1.00), (4, 5))
    # Neutres
    for _ in range(conf["neu"]): generate_avis(e_type, prefix, "neutre", (-0.10, 0.29), (3, 3))
    # Negatifs
    for _ in range(conf["neg"]): generate_avis(e_type, prefix, "negatif", (-1.00, -0.11), (1, 2))

random.shuffle(avis_list)

# Renumber IDs after shuffle to keep them sequential
for i, av in enumerate(avis_list):
    av["id"] = f"avis_{i+1:03d}"

# Save
with open(r'c:\Users\HP\Documents\projet touristique\dataset\avis.json', 'w', encoding='utf-8') as f:
    json.dump(avis_list, f, ensure_ascii=False, indent=2)

print(f"{len(avis_list)} avis générés.")
