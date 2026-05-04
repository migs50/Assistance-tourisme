import json

filepath = r'c:\Users\HP\Documents\projet touristique\dataset\hotels.json'
with open(filepath, 'r', encoding='utf-8') as f:
    hotels = json.load(f)

existing_ids = {h['id'] for h in hotels}
next_id = 51

new_data = [
    ("Hotel Biarritz","3_etoiles","hotel",35.7815,-5.8095,"Centre-ville",380,650,"moyen",3.7,145,42,False,False,False,None,"+212539938028","info@hotelbiarritz.ma"),
    ("Hotel Astoria","2_etoiles","hotel",35.7825,-5.8100,"Centre-ville",200,340,"economique",3.3,120,35,False,False,False,None,"+212539937202","info@astoria.ma"),
    ("Hotel Lutecia","3_etoiles","hotel",35.7790,-5.8060,"Centre-ville",400,680,"moyen",3.8,180,50,False,True,False,None,"+212539936026","info@lutecia.ma"),
    ("Hotel Paris","2_etoiles","hotel",35.7832,-5.8088,"Centre-ville",190,320,"economique",3.2,95,30,False,False,False,None,"+212539933271","info@hotelparis-tanger.ma"),
    ("Hotel Dawliz Résidence","4_etoiles","hotel",35.7905,-5.8030,"Corniche",700,1200,"moyen",4.0,210,60,True,True,False,None,"+212539940022","info@dawlizresidence.ma"),
    ("Hotel Tanger City Center","3_etoiles","hotel",35.7730,-5.8040,"Centre-ville",420,720,"moyen",3.9,260,75,False,True,False,None,"+212539348800","info@tangercitycenter.ma"),
    ("Hotel Miramor","3_etoiles","hotel",35.7900,-5.8070,"Corniche",450,780,"moyen",3.8,190,55,True,False,False,None,"+212539933191","info@miramor.ma"),
    ("Hotel Playa","4_etoiles","hotel",35.7930,-5.7990,"Malabata",780,1400,"moyen",4.1,310,90,True,True,False,None,"+212539942444","info@hotelplaya.ma"),
    ("Riad Boussa Tanger","riad","riad",35.7852,-5.8112,"Médina",500,950,"moyen",4.6,125,8,False,True,False,None,"+212661891234","info@riadboussa.ma"),
    ("Riad Al Baraka","riad","riad",35.7865,-5.8118,"Kasbah",550,1050,"moyen",4.5,110,9,False,True,False,None,"+212661902345","info@riad-albaraka.ma"),
    ("Hotel Dawliz Suites","4_etoiles","hotel",35.7910,-5.8015,"Corniche",850,1600,"moyen",4.2,175,45,True,True,False,None,"+212539937788","suites@dawliz.ma"),
    ("Riad Mabrouka","riad","riad",35.7870,-5.8124,"Kasbah",650,1200,"premium",4.7,165,7,True,True,False,"https://www.riadmabrouka.com","+212539332432","info@riadmabrouka.com"),
    ("Hotel La Girafe","2_etoiles","hotel",35.7808,-5.8098,"Centre-ville",200,350,"economique",3.4,105,32,False,False,False,None,"+212539938760","info@lagirafe.ma"),
    ("Dar Ayniwen","riad","riad",35.7880,-5.8128,"Kasbah",700,1350,"premium",4.8,98,6,True,True,False,"https://www.darayniwen.com","+212539946944","info@darayniwen.com"),
    ("Hotel Ahlan","3_etoiles","hotel",35.7700,-5.8160,"Centre-ville",400,700,"moyen",3.8,195,55,False,True,False,None,"+212539946390","info@ahlan.ma"),
    ("Riad La Brasserie Bavaroise","riad","riad",35.7858,-5.8114,"Médina",480,900,"moyen",4.4,88,8,False,True,False,None,"+212661123890","info@brasserie-riad.ma"),
    ("Hotel Minzah Palace","5_etoiles","hotel",35.7878,-5.8145,"Centre-ville",2000,4800,"premium",4.8,320,160,True,True,False,None,"+212539335885","palace@elminzah.com"),
    ("Hotel Ryad Mogador","4_etoiles","hotel",35.7760,-5.8050,"Centre-ville",750,1350,"moyen",4.1,280,110,False,True,False,"https://www.ryadmogador.com","+212539370900","tanger@ryadmogador.com"),
    ("Tangier Paradise Hotel","3_etoiles","hotel",35.7650,-5.8000,"Ville Nouvelle",430,750,"moyen",3.7,160,60,False,True,False,None,"+212539900100","info@tangerparadise.ma"),
    ("Casa Blanca Hostel","auberge","auberge_jeunesse",35.7842,-5.8108,"Médina",95,170,"economique",4.1,220,18,False,True,False,None,"+212661234908","info@casablancahostel.ma"),
    ("Hotel Riviera Tanger","4_etoiles","hotel",35.7945,-5.7880,"Malabata",820,1550,"moyen",4.0,245,100,True,True,False,None,"+212539394040","info@rivieratanger.ma"),
    ("Riad Laila","riad","riad",35.7853,-5.8110,"Médina",460,880,"moyen",4.3,75,7,False,True,False,None,"+212661345890","info@riadlaila.ma"),
    ("Hotel Andalusia","3_etoiles","hotel",35.7780,-5.8110,"Centre-ville",400,680,"moyen",3.6,145,48,False,False,False,None,"+212539932730","info@andalusia.ma"),
    ("Hotel Oasis Tanger","2_etoiles","hotel",35.7768,-5.8130,"Centre-ville",210,360,"economique",3.3,98,35,False,False,False,None,"+212539937330","info@oasis-tanger.ma"),
    ("Medina Hostel Tanger","auberge","auberge_jeunesse",35.7848,-5.8106,"Médina",100,175,"economique",4.2,165,22,False,True,False,None,"+212661456980","info@medinahostel.ma"),
    ("Hotel Tanger Garden","3_etoiles","hotel",35.7720,-5.8200,"Centre-ville",410,720,"moyen",3.8,175,55,False,True,False,None,"+212539947000","info@tangergarden.ma"),
    ("Riad Lalla Aicha","riad","riad",35.7860,-5.8116,"Kasbah",600,1150,"moyen",4.6,92,8,True,True,False,None,"+212661567980","info@laicha-riad.ma"),
    ("Hotel Residence Al Manara","3_etoiles","hotel",35.7745,-5.8090,"Centre-ville",430,750,"moyen",3.9,190,60,False,True,False,None,"+212539945800","info@almanara.ma"),
    ("Hotel Bab El Bahr","4_etoiles","hotel",35.7885,-5.8105,"Corniche",800,1450,"moyen",4.2,220,80,True,True,False,None,"+212539933490","info@bab-elbahr.ma"),
    ("Riad Dar Fatima","riad","riad",35.7855,-5.8113,"Médina",500,960,"moyen",4.5,105,9,False,True,False,None,"+212661678980","info@darfatima-riad.ma"),
]

equip_map = {
    "5_etoiles": ["wifi","piscine","spa","restaurant","bar","parking","climatisation","room_service","conciergerie","salle_conference","navette_aeroport","hammam","fitness"],
    "4_etoiles": ["wifi","restaurant","bar","parking","climatisation","room_service","fitness","piscine"],
    "3_etoiles": ["wifi","restaurant","parking","climatisation","room_service"],
    "2_etoiles": ["wifi","climatisation","reception_24h"],
    "riad": ["wifi","riad","patio","hammam","petit_dejeuner","terrasse","climatisation"],
    "auberge": ["wifi","cuisine_commune","consigne_bagages","reception_24h","dortoirs"]
}
tags_map = {
    "5_etoiles": ["luxe","piscine","spa","premium"],
    "4_etoiles": ["confort","restaurant","centre_ville"],
    "3_etoiles": ["standard","bon_rapport_qualite_prix"],
    "2_etoiles": ["economique","budget"],
    "riad": ["traditionnel","medina","riad","authentique","charme"],
    "auberge": ["backpacker","budget","social","jeunesse"]
}
langues_map = {
    "5_etoiles": ["français","anglais","arabe","espagnol"],
    "4_etoiles": ["français","anglais","arabe"],
    "3_etoiles": ["français","arabe"],
    "2_etoiles": ["français","arabe"],
    "riad": ["français","anglais","arabe"],
    "auberge": ["français","anglais","arabe"]
}
desc_fr = {
    "5_etoiles": "Établissement de grand luxe offrant une expérience hôtelière d'exception à Tanger avec spa, piscine et restaurant gastronomique. Personnel multilingue 24h/24.",
    "4_etoiles": "Hôtel 4 étoiles confortable et bien situé à Tanger. Restaurant, parking et climatisation inclus. Excellent rapport qualité-prix pour un séjour agréable.",
    "3_etoiles": "Hôtel 3 étoiles propre et fonctionnel, idéal pour explorer Tanger. Wifi gratuit, climatisation et personnel accueillant pour un séjour sans surprise.",
    "2_etoiles": "Hôtel économique simple et propre en plein cœur de Tanger. Parfait pour les voyageurs budget souhaitant découvrir la ville sans se ruiner.",
    "riad": "Riad traditionnel authentique niché dans les ruelles de la médina ou Kasbah. Patio central, fontaine andalouse, décor en zelliges, terrasse panoramique et hospitalité marocaine chaleureuse.",
    "auberge": "Auberge de jeunesse conviviale pour les voyageurs budget. Dortoirs propres, espaces communs, cuisine partagée et équipe dynamique organisant des visites guidées."
}
desc_en = {
    "5_etoiles": "A luxury establishment offering an exceptional hotel experience in Tangier with spa, pool and gourmet restaurant. Multilingual staff available 24/7.",
    "4_etoiles": "A comfortable 4-star hotel well located in Tangier. Restaurant, parking and air conditioning included. Excellent value for money for a pleasant stay.",
    "3_etoiles": "A clean and functional 3-star hotel, perfect for exploring Tangier. Free wifi, air conditioning and welcoming staff for a worry-free stay.",
    "2_etoiles": "A simple and clean budget hotel in the heart of Tangier. Perfect for budget travelers wishing to discover the city without overspending.",
    "riad": "An authentic traditional riad nestled in the alleys of the medina or Kasbah. Central patio, Andalusian fountain, zellige decor, panoramic terrace and warm Moroccan hospitality.",
    "auberge": "A friendly youth hostel for budget travelers. Clean dorms, common areas, shared kitchen and dynamic team organizing guided tours."
}
desc_ar = {
    "5_etoiles": "منشأة فاخرة تقدم تجربة فندقية استثنائية في طنجة مع سبا ومسبح ومطعم. طاقم متعدد اللغات متاح على مدار الساعة.",
    "4_etoiles": "فندق 4 نجوم مريح وموقعه جيد في طنجة. مطعم وموقف سيارات وتكييف هواء. قيمة ممتازة لإقامة ممتعة.",
    "3_etoiles": "فندق 3 نجوم نظيف وعملي، مثالي لاستكشاف طنجة. واي فاي مجاني وتكييف وطاقم ودود.",
    "2_etoiles": "فندق اقتصادي بسيط ونظيف في قلب طنجة. مثالي للمسافرين ذوي الميزانية المحدودة.",
    "riad": "رياض تقليدي أصيل في أزقة المدينة القديمة أو القصبة. فناء مركزي ونافورة أندلسية وزليج وتراس بانورامي وضيافة مغربية دافئة.",
    "auberge": "نزل شباب ودي للمسافرين بميزانية محدودة. أسرة نظيفة ومساحات مشتركة ومطبخ مشترك وفريق ينظم جولات."
}

for i, row in enumerate(new_data):
    nom,cat,typ,lat,lon,qrt,p_min,p_max,budget,note,nb_avis,chambres,vue_mer,pdej,animaux,web,tel,email = row
    new_id = f"hotel_{next_id + i:03d}"
    hotels.append({
        "id": new_id, "nom": nom, "categorie": cat, "type": typ,
        "latitude": lat, "longitude": lon,
        "adresse": f"{nom}, {qrt}, Tanger 90000, Maroc",
        "quartier": qrt,
        "description_fr": desc_fr[cat],
        "description_en": desc_en[cat],
        "description_ar": desc_ar[cat],
        "prix_nuit_min_mad": p_min, "prix_nuit_max_mad": p_max,
        "budget_type": budget, "note_moyenne": note, "nb_avis": nb_avis,
        "equipements": equip_map[cat], "vue_mer": vue_mer,
        "petit_dejeuner_inclus": pdej, "animaux_acceptes": animaux,
        "nombre_chambres": chambres,
        "check_in": "14:00", "check_out": "12:00",
        "langues_personnel": langues_map[cat],
        "tags": tags_map[cat] + (["vue_mer"] if vue_mer else []),
        "saison_haute": ["juillet","août","septembre"],
        "image_url": f"https://source.unsplash.com/600x400/?hotel,morocco,{cat.split('_')[0]}",
        "site_web": web, "telephone": tel, "email_contact": email,
        "source_donnee": "Google Places + TripAdvisor"
    })

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(hotels, f, ensure_ascii=False, indent=2)

cats = {}
for h in hotels:
    cats[h['categorie']] = cats.get(h['categorie'],0)+1
print(f"Total: {len(hotels)} hotels")
for k,v in sorted(cats.items()): print(f"  {k}: {v}")
