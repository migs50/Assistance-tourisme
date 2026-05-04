import json

events_data = [
    # Janvier
    (1, "Nouvel An Amazigh (Yennayer)", "celebration_locale", "tradition", "2025-01-12", "2025-01-13", 2, "Kasbah et Médina", 35.7876, -5.8128, "Kasbah", 0, True),
    (1, "Festival des Arts Visuels de Tanger", "festival_culturel", "arts_plastiques", "2025-01-20", "2025-01-25", 6, "Galeries d'art du Centre-ville", 35.7830, -5.8110, "Centre-ville", 0, True),
    # Février
    (2, "Semi-Marathon International de Tanger", "evenement_sportif", "course", "2025-02-15", "2025-02-15", 1, "Corniche de Tanger", 35.7940, -5.8080, "Corniche", 100, False),
    (2, "Rencontres Théâtrales de Tanger", "festival_culturel", "theatre", "2025-02-22", "2025-02-28", 7, "Cinémathèque Rif", 35.7835, -5.8090, "Grand Socco", 30, False),
    # Mars
    (3, "Festival National du Film", "festival_culturel", "cinema", "2025-03-05", "2025-03-12", 8, "Cinémas de la ville", 35.7800, -5.8100, "Centre-ville", 50, False),
    (3, "Printemps de la Poésie", "festival_culturel", "litterature", "2025-03-21", "2025-03-23", 3, "Institut Français", 35.7845, -5.8110, "Centre-ville", 0, True),
    # Avril
    (4, "Fête de l'Aïd al-Fitr", "evenement_religieux", "celebration", "2025-04-01", "2025-04-02", 2, "Toute la ville", 35.7850, -5.8100, "Tanger", 0, True),
    (4, "Salon du Livre et des Arts", "foire_marche", "litterature", "2025-04-15", "2025-04-20", 6, "Place des Nations", 35.7720, -5.8080, "Centre-ville", 0, True),
    # Mai
    (5, "Festival Tanjalatin", "festival_musique", "musique_latine", "2025-05-10", "2025-05-13", 4, "Corniche et Malabata", 35.7960, -5.7870, "Malabata", 150, False),
    (5, "Moussem de Sidi Kacem", "evenement_religieux", "pelerinage", "2025-05-20", "2025-05-22", 3, "Environs de Tanger", 35.7500, -5.9000, "Périphérie", 0, True),
    # Juin
    (6, "Aïd al-Adha", "evenement_religieux", "celebration", "2025-06-07", "2025-06-09", 3, "Toute la ville", 35.7850, -5.8100, "Tanger", 0, True),
    (6, "Festival Twiza de Tanger", "festival_culturel", "culture_amazighe", "2025-06-25", "2025-06-29", 5, "Différentes places publiques", 35.7830, -5.8110, "Médina", 0, True),
    # Juillet
    (7, "Nuits d'Été de la Corniche", "festival_musique", "concerts_plein_air", "2025-07-15", "2025-07-30", 16, "Plage Municipale", 35.7920, -5.8060, "Corniche", 0, True),
    (7, "Fête du Trône", "celebration_locale", "fete_nationale", "2025-07-30", "2025-07-30", 1, "Places principales", 35.7838, -5.8097, "Grand Socco", 0, True),
    # Août
    (8, "Festival Panafricain de Tanger", "festival_culturel", "musique_arts", "2025-08-10", "2025-08-15", 6, "Palais des Institutions Italiennes", 35.7882, -5.8200, "Marshan", 100, False),
    (8, "Moussem Moulay Idriss d'été", "evenement_religieux", "tradition", "2025-08-20", "2025-08-22", 3, "Marshan et Kasbah", 35.7890, -5.8130, "Kasbah", 0, True),
    # Septembre
    (9, "Tanjazz (Festival de Jazz)", "festival_musique", "jazz", "2025-09-18", "2025-09-22", 5, "Palais des Institutions Italiennes", 35.7882, -5.8200, "Marshan", 300, False),
    (9, "Foire de l'Artisanat Nordiste", "foire_marche", "artisanat", "2025-09-25", "2025-09-30", 6, "Place du 9 Avril", 35.7838, -5.8097, "Centre-ville", 0, True),
    # Octobre
    (10, "Festival International du Cinéma Méditerranéen", "festival_culturel", "cinema", "2025-10-15", "2025-10-22", 8, "Cinémathèque Rif", 35.7835, -5.8090, "Grand Socco", 0, True),
    (10, "Tanger Run", "evenement_sportif", "course", "2025-10-26", "2025-10-26", 1, "Forêt Rmilat", 35.7900, -5.8500, "Rmilat", 50, False),
    # Novembre
    (11, "Fête de l'Indépendance", "celebration_locale", "fete_nationale", "2025-11-18", "2025-11-18", 1, "Corniche et Centre-ville", 35.7800, -5.8100, "Centre-ville", 0, True),
    (11, "Tanger Médina Art", "festival_culturel", "arts_rues", "2025-11-20", "2025-11-24", 5, "Ruelles de la Médina", 35.7850, -5.8120, "Médina", 0, True),
    # Décembre
    (12, "Marché Solidaire de Fin d'Année", "foire_marche", "marche_saisonnier", "2025-12-15", "2025-12-25", 11, "Place des Nations", 35.7720, -5.8080, "Centre-ville", 0, True),
    (12, "Rencontres Musicales Hispano-Marocaines", "festival_musique", "musique_andalouse", "2025-12-20", "2025-12-22", 3, "Consulat d'Espagne", 35.7855, -5.8115, "Médina", 0, True),
]

mois_noms = {1:"janvier", 2:"février", 3:"mars", 4:"avril", 5:"mai", 6:"juin",
             7:"juillet", 8:"août", 9:"septembre", 10:"octobre", 11:"novembre", 12:"décembre"}

desc_fr = {
    "festival_culturel": "Un événement culturel majeur qui réunit des artistes et intellectuels pour célébrer la créativité et le partage. Le programme comprend des expositions, des ateliers, des projections et des débats ouverts au grand public. C'est l'occasion idéale de découvrir la richesse du patrimoine et de la création contemporaine marocaine et internationale dans une ambiance conviviale.",
    "festival_musique": "Un festival musical incontournable qui fait vibrer Tanger au rythme de mélodies venues d'ici et d'ailleurs. Des scènes en plein air et des salles historiques accueillent des musiciens de renom et des talents émergents. Une véritable fête de la musique qui attire des milliers de passionnés venus partager des moments d'émotion pure et de danse.",
    "evenement_religieux": "Une célébration religieuse profondément ancrée dans les traditions locales. Les familles tangéroises se réunissent pour prier, partager des repas traditionnels festifs et perpétuer les coutumes ancestrales. Les rues s'animent de chants spirituels et d'une ferveur collective palpable, offrant aux visiteurs une plongée unique dans l'âme spirituelle du Maroc.",
    "foire_marche": "Un grand rassemblement commercial et festif mettant en valeur le savoir-faire des artisans et producteurs locaux. Les étals regorgent de produits de terroir, de créations artisanales uniques et de spécialités culinaires. C'est l'endroit parfait pour dénicher des souvenirs authentiques tout en soutenant l'économie locale dans une atmosphère joyeuse et animée.",
    "evenement_sportif": "Une compétition sportive d'envergure qui attire des athlètes nationaux et internationaux. Le parcours permet souvent de découvrir les plus beaux paysages de Tanger, entre mer et forêt. C'est un grand moment de dépassement de soi, de célébration du sport et de convivialité pour les participants et les nombreux spectateurs qui viennent les encourager.",
    "celebration_locale": "Une fête populaire et patriotique marquée par des défilés, des concerts publics et souvent des feux d'artifice. La ville entière se pare de ses plus belles couleurs pour célébrer cet événement marquant. Les habitants sortent en masse pour partager la joie collective, témoignant de l'esprit de fraternité et de l'attachement aux traditions marocaines."
}

desc_en = {
    "festival_culturel": "A major cultural event that brings together artists and intellectuals to celebrate creativity and sharing. The program includes exhibitions, workshops, screenings, and debates open to the general public. It's the ideal opportunity to discover the richness of heritage and contemporary Moroccan and international creation in a friendly atmosphere.",
    "festival_musique": "A must-see musical festival that makes Tangier vibrate to the rhythm of melodies from here and elsewhere. Outdoor stages and historic venues host renowned musicians and emerging talents. A true celebration of music that attracts thousands of enthusiasts who come to share moments of pure emotion and dance.",
    "evenement_religieux": "A religious celebration deeply rooted in local traditions. Tangier families gather to pray, share festive traditional meals, and perpetuate ancestral customs. The streets come alive with spiritual songs and a palpable collective fervor, offering visitors a unique dive into the spiritual soul of Morocco.",
    "foire_marche": "A major commercial and festive gathering highlighting the know-how of local artisans and producers. The stalls are overflowing with local products, unique craft creations, and culinary specialties. It's the perfect place to find authentic souvenirs while supporting the local economy in a joyful and lively atmosphere.",
    "evenement_sportif": "A major sports competition that attracts national and international athletes. The route often allows participants to discover the most beautiful landscapes of Tangier, between sea and forest. It is a great moment of self-transcendence, celebration of sport, and conviviality for the participants and the many spectators who come to cheer them on.",
    "celebration_locale": "A popular and patriotic holiday marked by parades, public concerts, and often fireworks. The entire city is adorned with its most beautiful colors to celebrate this milestone event. The inhabitants come out en masse to share the collective joy, witnessing the spirit of fraternity and attachment to Moroccan traditions."
}

desc_ar = {
    "festival_culturel": "حدث ثقافي كبير يجمع الفنانين والمثقفين للاحتفال بالإبداع والمشاركة. يتضمن البرنامج معارض وورش عمل وعروض سينمائية ومناقشات مفتوحة للجمهور. إنها فرصة مثالية لاكتشاف ثراء التراث والإبداع المعاصر المغربي والدولي في جو ودي.",
    "festival_musique": "مهرجان موسيقي لا غنى عنه يجعل طنجة تهتز على إيقاع ألحان من الداخل والخارج. تستضيف المسارح في الهواء الطلق والقاعات التاريخية موسيقيين مشهورين ومواهب صاعدة. احتفال حقيقي بالموسيقى يجذب آلاف المتحمسين.",
    "evenement_religieux": "احتفال ديني متجذر بعمق في التقاليد المحلية. تجتمع العائلات الطنجاوية للصلاة ومشاركة الوجبات الاحتفالية التقليدية وإدامة العادات القديمة. تنبض الشوارع بالأغاني الروحية والحماس الجماعي.",
    "foire_marche": "تجمع تجاري واحتفالي كبير يسلط الضوء على خبرة الحرفيين والمنتجين المحليين. تفيض الأكشاك بالمنتجات المحلية والإبداعات الحرفية الفريدة. إنه المكان المثالي للعثور على هدايا تذكارية أصلية.",
    "evenement_sportif": "مسابقة رياضية كبرى تجذب الرياضيين الوطنيين والدوليين. يسمح المسار في كثير من الأحيان باكتشاف أجمل المناظر الطبيعية في طنجة، بين البحر والغابة. لحظة رائعة لتجاوز الذات والاحتفال بالرياضة.",
    "celebration_locale": "عطلة شعبية ووطنية تتميز بالمسيرات والحفلات الموسيقية العامة وغالباً الألعاب النارية. تتزين المدينة بأكملها بأجمل ألوانها للاحتفال بهذا الحدث الهام. يخرج السكان بأعداد كبيرة للمشاركة في الفرح الجماعي."
}

result = []
for i, row in enumerate(events_data):
    mois_num, nom, cat, scat, dt_debut, dt_fin, duree, lieu, lat, lon, qrt, prix, gratuit = row
    event_id = f"event_{i+1:03d}"
    
    result.append({
        "id": event_id,
        "nom": nom,
        "categorie": cat,
        "sous_categorie": scat,
        "mois": mois_num,
        "mois_nom": mois_noms[mois_num],
        "date_debut": dt_debut,
        "date_fin": dt_fin,
        "duree_jours": duree,
        "recurrence": "annuelle",
        "lieu": lieu,
        "latitude": lat,
        "longitude": lon,
        "quartier": qrt,
        "description_fr": desc_fr[cat],
        "description_en": desc_en[cat],
        "description_ar": desc_ar[cat],
        "prix_entree_mad": prix,
        "gratuit": gratuit,
        "public_cible": ["touristes", "familles", "locaux"],
        "langues_event": ["français", "anglais", "arabe"],
        "site_web": "https://www.tanger-tourisme.ma",
        "telephone": "+212539948050",
        "image_url": f"https://source.unsplash.com/600x400/?{cat.split('_')[1]},{scat},event",
        "tags": [cat.split('_')[1], scat, "tanger", "evenement"],
        "conseils_fr": "Vérifiez les dates précises quelques jours avant l'événement. Prévoyez de venir en avance si l'événement est gratuit pour garantir votre place.",
        "source_donnee": "Office du Tourisme Tanger + données publiques"
    })

out = r'c:\Users\HP\Documents\projet touristique\dataset\evenements.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Total: {len(result)} événements générés")
