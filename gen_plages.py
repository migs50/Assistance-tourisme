import json

data = [
    # (id, nom, cat, scat, lat, lon, qrt, note, avis, gratuit, parasol, transat, long_km, qualite, pavillon, surv, mois, eq, pmr, chiens, tags, saison)
    ("plage_001","Plage Malabata","plage_urbaine","plage_sable",35.8012,-5.7689,"Malabata",4.1,560,True,30,20,3.5,"bonne",False,True,["juin","juillet","août","septembre"],["douches","vestiaires","restaurants","sports_nautiques","parking"],True,False,["plage","famille","sport","mer"],["ete","printemps"]),
    ("plage_002","Plage Municipale de Tanger","plage_urbaine","plage_sable",35.7920,-5.8060,"Centre-ville",3.8,820,True,25,15,1.8,"bonne",False,True,["juin","juillet","août","septembre"],["douches","vestiaires","restaurants","parking","jeux_enfants"],True,False,["plage","urbaine","famille","accessible"],["ete"]),
    ("plage_003","Plage Merkala","plage_urbaine","plage_sable",35.7970,-5.8220,"Marshan",4.3,390,True,0,0,0.8,"bonne",False,False,["juin","juillet","août","septembre"],["restaurants_proches"],False,False,["plage","calme","local","authentique"],["ete","printemps"]),
    ("plage_004","Plage du Detroit","plage_urbaine","plage_galets",35.7910,-5.8120,"Corniche",3.9,210,True,0,0,0.5,"bonne",False,False,["juin","juillet","août","septembre"],["vue_panoramique"],False,False,["plage","panorama","detroit","insolite"],["ete","automne"]),
    ("plage_005","Plage Sidi Kankouch","plage_urbaine","plage_sable",35.7880,-5.8430,"Rmilat",4.4,310,True,0,0,0.6,"excellente",False,False,["juin","juillet","août","septembre"],["nature","calme"],False,False,["plage","calme","sauvage","romantique"],["ete","printemps"]),
    ("plage_006","Plage de la Corniche","plage_urbaine","plage_sable",35.7940,-5.8080,"Corniche",4.0,450,True,20,15,2.0,"bonne",False,True,["juin","juillet","août","septembre"],["restaurants","cafes","parking","promenade"],True,False,["plage","promenade","urbaine","corniche"],["ete"]),
    ("plage_007","Plage Achakkar","plage_naturelle","plage_sable",35.7620,-5.9380,"Cap Spartel",4.7,680,True,0,0,2.5,"excellente",False,False,["juin","juillet","août","septembre"],["surf","nature","parking"],False,False,["surf","sauvage","nature","cap_spartel"],["ete","printemps"]),
    ("plage_008","Plage des Grottes d'Hercule","plage_naturelle","plage_sable",35.7595,-5.9395,"Achakkar",4.6,920,True,0,0,1.2,"excellente",False,False,["juin","juillet","août","septembre"],["grottes","nature","photographie"],False,False,["nature","grottes","mythologie","sauvage"],["ete","printemps","automne"]),
    ("plage_009","Plage Robinson","plage_naturelle","plage_sable",35.7500,-5.9450,"Sud Tanger",4.5,340,True,0,0,1.8,"excellente",False,False,["juin","juillet","août","septembre"],["surf","kitesurf","nature"],False,True,["surf","kitesurf","sauvage","sport"],["ete","printemps"]),
    ("plage_010","Plage Sidi Bou Knadel","plage_naturelle","plage_sable",35.8150,-5.8800,"Nord Tanger",4.3,190,True,0,0,1.5,"bonne",False,False,["juin","juillet","août","septembre"],["nature","calme","parking"],False,True,["sauvage","calme","nature","pecheurs"],["ete","printemps"]),
    ("plage_011","Plage Dalia","plage_naturelle","plage_sable",35.7400,-5.9500,"Côte Atlantique",4.6,280,True,0,0,3.0,"excellente",False,False,["juin","juillet","août","septembre"],["surf","nature","camping"],False,True,["surf","sauvage","atlantique","sport"],["ete","printemps"]),
    ("plage_012","Forêt Diplomatique","parc_foret","foret_cotiere",35.6800,-5.9200,"Sud Tanger",4.5,560,True,0,0,0.0,"","",False,["mars","avril","mai","juin","juillet","août","septembre","octobre"],["pique_nique","parking","chemins","nature"],True,True,["foret","nature","pique_nique","atlantique"],["ete","printemps","automne"]),
    ("plage_013","Forêt de Rmilat (Parc Perdicaris)","parc_foret","foret_urbaine",35.7900,-5.8500,"Rmilat",4.8,1600,True,0,0,0.0,"","",False,["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],["sentiers","parking","nature","aire_pique_nique"],False,True,["foret","randonnee","nature","parc"],["printemps","automne","ete"]),
    ("plage_014","Parc Perdicaris","parc_foret","parc_naturel",35.7905,-5.8490,"Rmilat",4.8,1600,True,0,0,0.0,"","",False,["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],["sentiers_balises","faune","flore","aire_repos"],False,True,["foret","randonnee","famille","nature"],["printemps","automne"]),
    ("plage_015","Forêt du Charf","parc_foret","foret_urbaine",35.7600,-5.7950,"Charf",4.0,180,True,0,0,0.0,"","",False,["mars","avril","mai","juin","juillet","août","septembre","octobre"],["sentiers","vue_panoramique","nature"],False,True,["foret","panorama","calme","promenade"],["printemps","automne"]),
    ("plage_016","Jardin Donabo","parc_foret","jardin_ecologique",35.7680,-5.9050,"Cap Spartel",4.9,450,True,50,0,0.0,"","",False,["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],["cafe","visites_guidees","botanique","sentiers"],False,False,["botanique","ecologie","nature","famille"],["printemps","automne","ete"]),
    ("plage_017","Cap Spartel","site_naturel","cap_oceanique",35.7926,-5.9275,"Cap Spartel",4.8,4500,True,0,0,0.0,"","",False,["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],["phare","parking","vue_panoramique","photographie"],True,False,["panorama","nature","phare","coucher_soleil"],["printemps","ete","automne"]),
    ("plage_018","Détroit de Gibraltar (Rive Marocaine)","site_naturel","detroit",35.7900,-5.8100,"Marshan",4.9,2300,True,0,0,0.0,"","",False,["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],["belvédère","vue_espagne","photographie"],True,False,["panorama","detroid","histoire","spectaculaire"],["printemps","ete","automne","hiver"]),
    ("plage_019","Necropole Phénicienne de Marshan","site_naturel","site_archeologique",35.7920,-5.8230,"Marshan",4.5,1200,True,0,0,0.0,"","",False,["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],["archeologie","vue_mer","photographie"],False,False,["histoire","archeologie","panorama","coucher_soleil"],["printemps","automne"]),
    ("plage_020","Montagne du Charf (Belvédère 360°)","site_naturel","belvédère",35.7610,-5.7950,"Charf",4.3,210,True,0,0,0.0,"","",False,["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],["vue_360","photographie","calme"],False,False,["panorama","360","nature","photography"],["printemps","ete","automne"]),
]

desc_fr = {
    "plage_urbaine": "Plage urbaine très appréciée de Tanger, facilement accessible depuis le centre-ville. Son sable fin et ses eaux claires en font un lieu de détente idéal pour les familles et les touristes. Les équipements de qualité (douches, vestiaires, restaurants) garantissent un séjour confortable. La surveillance saisonnière assure la sécurité des baigneurs. Idéale pour pratiquer des sports nautiques ou simplement profiter du soleil. La vue sur le détroit de Gibraltar et les côtes espagnoles ajoute un charme incomparable à cette plage incontournable.",
    "plage_naturelle": "Plage naturelle préservée aux eaux cristallines et au sable immaculé, l'une des plus belles de la région tangéroise. Sauvage et authentique, elle offre une escapade parfaite loin de l'agitation urbaine. Idéale pour le surf, les sports nautiques ou simplement pour contempler la beauté de la nature. La richesse de l'écosystème marin local en fait également un endroit prisé des amateurs de plongée. Accessible en voiture ou en taxi, elle constitue une destination de choix pour les aventuriers à la recherche d'authenticité.",
    "parc_foret": "Espace naturel exceptionnel aux portes de Tanger, offrant des hectares de verdure et de biodiversité remarquable. Ses sentiers balisés permettent de longues promenades ombragées à travers une flore méditerranéenne variée. La faune locale, notamment les oiseaux migrateurs, enchante les visiteurs. Parfait pour un pique-nique en famille, une randonnée sportive ou une simple promenade méditative. Les vues panoramiques sur la mer et la ville s'ouvrent régulièrement depuis les points culminants, offrant des perspectives inoubliables sur la région.",
    "site_naturel": "Site naturel remarquable et emblématique de la région de Tanger, classé parmi les plus beaux paysages du nord du Maroc. Ce lieu exceptionnel offre des panoramas à couper le souffle sur le détroit de Gibraltar, l'océan Atlantique et les côtes espagnoles par temps clair. Très prisé des photographes, des randonneurs et des amateurs de nature, il représente un patrimoine naturel inestimable. La richesse géologique et biologique du site en fait également un lieu d'intérêt scientifique majeur pour la recherche sur la biodiversité méditerranéenne."
}
desc_en = {
    "plage_urbaine": "A highly popular urban beach in Tangier, easily accessible from the city center. Its fine sand and clear waters make it an ideal relaxation spot for families and tourists. Quality facilities (showers, changing rooms, restaurants) ensure a comfortable visit. Seasonal lifeguard supervision keeps swimmers safe. Perfect for water sports or simply enjoying the sunshine. The view of the Strait of Gibraltar and the Spanish coast adds an incomparable charm to this must-visit beach.",
    "plage_naturelle": "A pristine natural beach with crystal-clear waters and immaculate sand, one of the most beautiful in the Tangier region. Wild and authentic, it offers a perfect escape from the urban hustle. Ideal for surfing, water sports, or simply contemplating the beauty of nature. The richness of the local marine ecosystem also makes it popular with diving enthusiasts. Accessible by car or taxi, it is a destination of choice for adventurers seeking authenticity.",
    "parc_foret": "An exceptional natural space at the gates of Tangier, offering hectares of greenery and remarkable biodiversity. Marked trails allow for long shaded walks through varied Mediterranean flora. Local wildlife, especially migratory birds, enchants visitors. Perfect for a family picnic, a sporting hike, or a simple meditative walk. Panoramic views of the sea and the city open up regularly from the high points, offering unforgettable perspectives over the region.",
    "site_naturel": "A remarkable and iconic natural site in the Tangier region, ranked among the most beautiful landscapes in northern Morocco. This exceptional place offers breathtaking panoramas of the Strait of Gibraltar, the Atlantic Ocean, and the Spanish coasts on clear days. Highly sought after by photographers, hikers, and nature lovers, it represents an invaluable natural heritage. The geological and biological richness of the site also makes it a major scientific area of interest for Mediterranean biodiversity research."
}
desc_ar = {
    "plage_urbaine": "شاطئ حضري يحظى بشعبية كبيرة في طنجة، ويمكن الوصول إليه بسهولة من وسط المدينة. رماله الناعمة ومياهه الصافية تجعله مكاناً مثالياً للاسترخاء للعائلات والسياح. توفر المرافق الجيدة (دشات وغرف تغيير ومطاعم) إقامة مريحة. المراقبة الموسمية تضمن أمان السباحين. مثالي لرياضات المياه أو الاستمتاع بأشعة الشمس. المنظر على مضيق جبل طارق والسواحل الإسبانية يضيف سحراً لا يوصف لهذا الشاطئ الذي لا يمكن تفويته.",
    "plage_naturelle": "شاطئ طبيعي محمي بمياه بلورية ورمال ناصعة البياض، يعد من أجمل شواطئ منطقة طنجة. بري وأصيل يوفر هروباً مثالياً من صخب المدينة. مثالي لركوب الأمواج والرياضات المائية أو التأمل في جمال الطبيعة. ثروة النظام البيئي البحري المحلي تجعله محبوباً لدى عشاق الغوص. يصل إليه بالسيارة أو سيارة الأجرة، وهو وجهة مفضلة للمغامرين.",
    "parc_foret": "فضاء طبيعي استثنائي على أبواب طنجة، يضم هكتارات من الخضرة والتنوع البيولوجي الرائع. المسارات المعلمة تتيح نزهات طويلة مظللة عبر النباتات المتوسطية المتنوعة. الحياة البرية المحلية تبهج الزوار. مثالي لنزهة عائلية أو رحلة مشي رياضية أو تأمل هادئ.",
    "site_naturel": "موقع طبيعي رائع وأيقوني في منطقة طنجة، يصنف ضمن أجمل المناظر الطبيعية في شمال المغرب. يوفر هذا المكان الاستثنائي مناظر بانورامية على مضيق جبل طارق والمحيط الأطلسي والسواحل الإسبانية. يحظى بإقبال كبير من المصورين والرحالة وعشاق الطبيعة، ويمثل تراثاً طبيعياً لا يقدر بثمن."
}

result = []
for row in data:
    id_,nom,cat,scat,lat,lon,qrt,note,avis,gratuit,parasol,transat,long_km,qualite,pavillon,surv,mois,eq,pmr,chiens,tags,saison = row
    entry = {
        "id": id_, "nom": nom, "categorie": cat, "sous_categorie": scat,
        "latitude": lat, "longitude": lon,
        "adresse": f"{nom}, {qrt}, Tanger, Maroc", "quartier": qrt,
        "description_fr": desc_fr[cat],
        "description_en": desc_en[cat],
        "description_ar": desc_ar[cat],
        "note_moyenne": note, "nb_avis": avis, "gratuit": gratuit,
        "prix_parasol_mad": parasol, "prix_transats_mad": transat,
        "longueur_km": long_km, "qualite_eau": qualite,
        "pavilion_bleu": pavillon, "surveillance": surv,
        "mois_baignade": mois, "equipements": eq,
        "accessibilite_pmr": pmr, "chiens_autorises": chiens,
        "tags": tags, "saison_recommandee": saison,
        "image_url": f"https://source.unsplash.com/600x400/?{cat.split('_')[0]},tanger,morocco",
        "source_donnee": "OpenStreetMap + Google Places"
    }
    result.append(entry)

out = r'c:\Users\HP\Documents\projet touristique\dataset\plages.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

cats = {}
for p in result:
    cats[p['categorie']] = cats.get(p['categorie'],0)+1
print(f"Total: {len(result)} entries")
for k,v in sorted(cats.items()): print(f"  {k}: {v}")
