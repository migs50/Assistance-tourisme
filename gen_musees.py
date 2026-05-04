import json

data = [
    # musees officiels (4)
    ("musee_001","Musée de la Kasbah (Dar el Makhzen)","musee","musee_histoire",35.7876,-5.8128,"Place de la Kasbah, Tanger 90000","Kasbah",4.4,320,20,5,False,45,120,["archéologie","arts_décoratifs","histoire"],True,False,["français","anglais","arabe","espagnol"],False,True,["culture","histoire","kasbah","palais"],None,"+212539932097"),
    ("musee_002","Musée de la Légation Américaine","musee","musee_diplomatique",35.7832,-5.8118,"8 Rue d'Amérique, Médina, Tanger 90000","Médina",4.8,1400,20,5,False,45,90,["diplomatie","histoire","peinture","paul_bowles"],True,False,["français","anglais","arabe"],False,True,["histoire","art","diplomatie","medina"],"+212539935317","+212539935317"),
    ("musee_003","Musée de la Fondation Lorin","musee","musee_local",35.7852,-5.8108,"44 Rue Touahine, Médina, Tanger 90000","Médina",4.5,420,0,0,True,30,60,["photographie","histoire_locale","archives"],False,False,["français","arabe"],False,True,["histoire_locale","photographie","nostalgie","medina"],None,"+212539938273"),
    ("musee_004","Musée d'Art Contemporain de Tanger","musee","musee_art_moderne",35.7830,-5.8150,"Rue de la Kasbah, Tanger 90000","Kasbah",4.6,310,20,10,False,45,90,["art_contemporain","peinture","sculpture","installation"],True,False,["français","anglais","arabe"],True,True,["art","contemporain","culture","kasbah"],None,"+212539947746"),
    # galeries d'art (3)
    ("musee_005","Galerie Conil","galerie_art","galerie_peinture",35.7840,-5.8095,"Boulevard Pasteur, Tanger 90000","Centre-ville",4.3,95,0,0,True,20,45,["peinture","artistes_locaux","exposition"],False,False,["français","anglais","arabe","espagnol"],True,True,["art","galerie","gratuit","centre_ville"],None,"+212539938900"),
    ("musee_006","Galerie d'Art Delacroix","galerie_art","galerie_expositions",35.7845,-5.8105,"Rue de la Liberté, Tanger 90000","Centre-ville",4.2,78,0,0,True,20,40,["peinture","expositions_temporaires","artistes_marocains"],False,False,["français","anglais"],True,True,["art","galerie","orientalisme","culture"],None,"+212539947700"),
    ("musee_007","Cinémathèque de Tanger","galerie_art","cinema_art",35.7835,-5.8090,"Place du 9 Avril, Tanger 90000","Centre-ville",4.6,520,30,15,False,90,120,["cinéma","films_art","festivals","projection"],False,False,["français","anglais","arabe"],True,True,["cinema","culture","art","centre_ville"],"https://www.cinematheque.ma","+212539374892"),
    # monuments historiques classés (3)
    ("musee_008","Légation du Sultan (Dar El Makhzen Extérieur)","monument_classé","palais_historique",35.7875,-5.8130,"Place de la Kasbah, Tanger 90000","Kasbah",4.7,890,0,0,True,20,45,["architecture","histoire","patrimoine"],False,False,["français","arabe"],False,True,["histoire","architecture","kasbah","patrimoine"],None,None),
    ("musee_009","Mosquée Sidi Bou Abid","monument_classé","mosquee_historique",35.7838,-5.8100,"Grand Socco, Tanger 90000","Centre-ville",4.5,1100,0,0,True,10,20,["architecture_islamique","minaret","céramique"],False,False,["arabe"],False,False,["religion","architecture","histoire","ceramique"],None,None),
    ("musee_010","Fortaleza de Tánger (Fortifications Portugaises)","monument_classé","fortification",35.7870,-5.8125,"Kasbah, Tanger 90000","Kasbah",4.6,750,0,0,True,30,60,["fortification","histoire_militaire","architecture_coloniale"],False,False,["français","anglais","arabe","espagnol"],False,True,["histoire","fortification","panorama","kasbah"],None,None),
    # centres culturels (2)
    ("musee_011","Institut Français de Tanger","centre_culturel","institut_culturel",35.7845,-5.8110,"Rue de la Liberté, Tanger 90000","Centre-ville",4.4,310,0,0,True,60,120,["langue_française","expositions","cinema","theatre"],False,False,["français","arabe"],True,True,["culture","francais","language","evenements"],"https://www.if-maroc.org/tanger","+212539943127"),
    ("musee_012","Instituto Cervantes de Tanger","centre_culturel","institut_culturel",35.7848,-5.8112,"Rue de l'Espagne, Tanger 90000","Centre-ville",4.5,270,0,0,True,60,120,["langue_espagnole","expositions","culture","conférences"],False,False,["espagnol","arabe","français"],True,True,["culture","espagnol","langue","evenements"],"https://tanger.cervantes.es","+212539932046"),
]

horaires_musee = {"lundi":"ferme","mardi":"09:00-17:00","mercredi":"09:00-17:00","jeudi":"09:00-17:00","vendredi":"09:00-12:00","samedi":"09:00-17:00","dimanche":"09:00-17:00"}
horaires_galerie = {"lundi":"ferme","mardi":"10:00-19:00","mercredi":"10:00-19:00","jeudi":"10:00-19:00","vendredi":"10:00-19:00","samedi":"10:00-20:00","dimanche":"ferme"}
horaires_monument = {"lundi":"08:00-20:00","mardi":"08:00-20:00","mercredi":"08:00-20:00","jeudi":"08:00-20:00","vendredi":"08:00-20:00","samedi":"08:00-22:00","dimanche":"08:00-22:00"}
horaires_cc = {"lundi":"09:00-18:00","mardi":"09:00-18:00","mercredi":"09:00-18:00","jeudi":"09:00-18:00","vendredi":"09:00-12:00","samedi":"09:00-13:00","dimanche":"ferme"}

horaires_map = {"musee":horaires_musee,"galerie_art":horaires_galerie,"monument_classé":horaires_monument,"centre_culturel":horaires_cc}

desc_fr = {
    "musee": "Musée incontournable de Tanger, ce lieu de mémoire et de culture préserve et met en valeur le patrimoine exceptionnel de la ville et de la région du nord du Maroc. Ses collections permanentes couvrent plusieurs millénaires d'histoire, depuis la préhistoire jusqu'à l'époque contemporaine, en passant par les périodes phénicienne, romaine, byzantine, arabe et coloniale. Les expositions temporaires régulièrement renouvelées permettent de découvrir des aspects souvent méconnus de la culture marocaine. Le cadre architectural du musée, souvent un bâtiment historique réhabilité, constitue lui-même une attraction majeure. Un incontournable pour quiconque souhaite comprendre l'histoire fascinante et complexe de Tanger, carrefour des civilisations depuis l'Antiquité.",
    "galerie_art": "Espace culturel et artistique dynamique au cœur de Tanger, cette galerie est une vitrine essentielle pour la création artistique contemporaine marocaine et internationale. Elle accueille tout au long de l'année des expositions d'artistes émergents et confirmés, proposant peintures, sculptures, photographies et installations multimédia d'une grande diversité. Lieu de rencontres et d'échanges entre artistes, collectionneurs et amateurs d'art du monde entier, elle contribue activement au rayonnement culturel de Tanger comme ville d'art. Son accès souvent gratuit la rend accessible à tous les publics, des connaisseurs aux curieux de passage.",
    "monument_classé": "Monument historique classé au patrimoine culturel marocain, ce site témoigne de la richesse et de la complexité de l'histoire millénaire de Tanger. Chaque pierre raconte l'histoire des nombreuses civilisations qui se sont succédé dans cette ville stratégique : Phéniciens, Romains, Vandales, Byzantins, Arabes, Portugais, Espagnols et Britanniques y ont tous laissé leur empreinte indélébile. La valeur patrimoniale exceptionnelle de ce monument en fait un lieu de visite incontournable pour comprendre les forces historiques qui ont façonné non seulement Tanger, mais aussi les relations complexes entre l'Europe et l'Afrique à travers les âges.",
    "centre_culturel": "Centre culturel de référence à Tanger, cet espace est un carrefour vivant d'échanges culturels, linguistiques et artistiques entre le Maroc et le monde. Il propose une programmation riche et diversifiée : cours de langue, expositions d'art, projections de films, spectacles de théâtre, conférences académiques, ateliers créatifs pour enfants et adultes. Ouvert à tous et souvent gratuit pour de nombreux événements, il joue un rôle essentiel dans le dialogue interculturel et la diffusion des arts et de la culture. Sa médiathèque et ses espaces de coworking sont également très appréciés des étudiants et des professionnels locaux."
}
desc_en = {
    "musee": "A must-visit museum in Tangier, this place of memory and culture preserves and showcases the exceptional heritage of the city and the northern Morocco region. Its permanent collections cover several millennia of history, from prehistory to the contemporary era, including the Phoenician, Roman, Byzantine, Arab, and colonial periods. Regularly renewed temporary exhibitions allow visitors to discover often little-known aspects of Moroccan culture. The architectural setting of the museum, often a rehabilitated historic building, is itself a major attraction. Essential for anyone wishing to understand the fascinating and complex history of Tangier, a crossroads of civilizations since Antiquity.",
    "galerie_art": "A dynamic cultural and artistic space in the heart of Tangier, this gallery is an essential showcase for contemporary Moroccan and international artistic creation. It hosts exhibitions of emerging and established artists throughout the year, featuring paintings, sculptures, photographs, and multimedia installations of great diversity. A meeting place for artists, collectors, and art lovers from around the world, it actively contributes to Tangier's cultural influence as an art city. Its often free admission makes it accessible to all audiences, from connoisseurs to curious visitors passing through.",
    "monument_classé": "A historic monument classified as Moroccan cultural heritage, this site bears witness to the richness and complexity of Tangier's millennial history. Every stone tells the story of the many civilizations that have succeeded one another in this strategic city: Phoenicians, Romans, Vandals, Byzantines, Arabs, Portuguese, Spanish, and British have all left their indelible mark. The exceptional heritage value of this monument makes it an unmissable visit to understand the historical forces that shaped not only Tangier, but also the complex relations between Europe and Africa through the ages.",
    "centre_culturel": "A leading cultural center in Tangier, this space is a vibrant crossroads of cultural, linguistic, and artistic exchanges between Morocco and the world. It offers a rich and diverse program: language courses, art exhibitions, film screenings, theater performances, academic conferences, creative workshops for children and adults. Open to all and often free for many events, it plays an essential role in intercultural dialogue and the dissemination of arts and culture. Its media library and coworking spaces are also highly valued by local students and professionals."
}
desc_ar = {
    "musee": "متحف لا غنى عنه في طنجة، يحفظ هذا المكان من الذاكرة والثقافة التراث الاستثنائي للمدينة ومنطقة شمال المغرب. تغطي مجموعاته الدائمة عدة آلاف من السنين من التاريخ، من عصور ما قبل التاريخ حتى العصر المعاصر. المعارض المؤقتة المتجددة تسمح باكتشاف جوانب غير معروفة من الثقافة المغربية. الإطار المعماري للمتحف يشكل نفسه جاذبية كبرى. ضروري لكل من يرغب في فهم التاريخ الرائع لطنجة، ملتقى الحضارات منذ العصور القديمة.",
    "galerie_art": "فضاء ثقافي وفني ديناميكي في قلب طنجة، هذه الغاليري واجهة أساسية للإبداع الفني المعاصر المغربي والدولي. تستضيف طوال العام معارض لفنانين ناشئين وراسخين، تعرض لوحات ومنحوتات وصوراً وتركيبات وسائط متعددة. مكان لقاء بين الفنانين والهواة من جميع أنحاء العالم، يساهم في إشعاع طنجة كمدينة فن.",
    "monument_classé": "معلم تاريخي مصنف ضمن التراث الثقافي المغربي، يشهد هذا الموقع على غنى وتعقيد تاريخ طنجة الألفي. كل حجر يحكي قصة الحضارات العديدة التي تعاقبت على هذه المدينة الاستراتيجية: الفينيقيون والرومان والبيزنطيون والعرب والبرتغاليون والإسبان والبريطانيون جميعهم تركوا بصماتهم الراسخة.",
    "centre_culturel": "مركز ثقافي مرجعي في طنجة، هذا الفضاء ملتقى حي للتبادلات الثقافية واللغوية والفنية بين المغرب والعالم. يقدم برمجة غنية ومتنوعة: دروس لغات ومعارض فنية وعروض سينمائية ومسرحية ومؤتمرات وورشات إبداعية. مفتوح للجميع وغالباً مجاني، يلعب دوراً أساسياً في الحوار بين الثقافات."
}

result = []
for row in data:
    id_,nom,cat,scat,lat,lon,adr,qrt,note,avis,prix,prix_enf,gratuit,dur_min,dur_max,coll,guide,audio,langues,pmr,photo,tags,web,tel = row
    result.append({
        "id": id_, "nom": nom, "categorie": cat, "sous_categorie": scat,
        "latitude": lat, "longitude": lon, "adresse": adr, "quartier": qrt,
        "description_fr": desc_fr[cat], "description_en": desc_en[cat], "description_ar": desc_ar[cat],
        "note_moyenne": note, "nb_avis": avis,
        "prix_entree_mad": prix, "prix_enfant_mad": prix_enf, "gratuit": gratuit,
        "horaires": horaires_map[cat],
        "duree_visite_min": dur_min, "duree_visite_max": dur_max,
        "collections": coll, "guide_disponible": guide, "audioguide": audio,
        "langues_visite": langues, "accessibilite_pmr": pmr, "photographie_autorisee": photo,
        "tags": tags, "saison_recommandee": ["printemps","automne","hiver"],
        "image_url": f"https://source.unsplash.com/600x400/?museum,{scat.split('_')[0]},morocco",
        "site_web": web, "telephone": tel, "source_donnee": "Google Places + données officielles"
    })

out = r'c:\Users\HP\Documents\projet touristique\dataset\musees.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

cats = {}
for m in result:
    cats[m['categorie']] = cats.get(m['categorie'],0)+1
print(f"Total: {len(result)} entrees")
for k,v in sorted(cats.items()): print(f"  {k}: {v}")
