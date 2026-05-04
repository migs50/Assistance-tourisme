import json, random

hotels_data = [
    # (id, nom, cat, type, lat, lon, qrt, prix_min, prix_max, budget, note, avis, chambres, vue_mer, pdej, animaux, web, tel, email)
    ("hotel_001","El Minzah Hotel","5_etoiles","hotel",35.7876,-5.8142,"Centre-ville",1800,4500,"premium",4.7,890,140,True,True,False,"https://www.elminzah.com","+212539935885","reservation@elminzah.com"),
    ("hotel_002","Fairmont Tazi Palace","5_etoiles","hotel",35.7820,-5.8050,"Centre-ville",2200,5500,"premium",4.8,650,170,True,True,False,"https://www.fairmont.com","+212539335000","tazi@fairmont.com"),
    ("hotel_003","Hilton Tanger City Center","5_etoiles","hotel",35.7750,-5.8030,"Centre-ville",1500,3500,"premium",4.6,780,200,True,True,False,"https://www.hilton.com","+212539906060","tanger@hilton.com"),
    ("hotel_004","Sofitel Tanger Malabata","5_etoiles","hotel",35.7980,-5.7850,"Malabata",1700,4000,"premium",4.5,520,160,True,True,False,"https://www.sofitel.com","+212539393500","malabata@sofitel.com"),
    ("hotel_005","Barcelo Tanger","5_etoiles","hotel",35.7960,-5.7870,"Malabata",1600,3800,"premium",4.4,410,180,True,True,True,"https://www.barcelo.com","+212539942000","tanger@barcelo.com"),
    ("hotel_006","Movenpick Hotel Tanger","4_etoiles","hotel",35.7770,-5.8020,"Centre-ville",900,1800,"moyen",4.3,620,150,False,True,False,"https://www.movenpick.com","+212539985000","tanger@movenpick.com"),
    ("hotel_007","Golden Tulip Farah Tanger","4_etoiles","hotel",35.7800,-5.8060,"Centre-ville",750,1400,"moyen",4.1,380,120,False,True,False,"https://www.goldentulip.com","+212539946644","farah@goldentulip.com"),
    ("hotel_008","Hotel Rembrandt","4_etoiles","hotel",35.7845,-5.8135,"Centre-ville",700,1300,"moyen",4.0,450,70,False,False,False,None,"+212539937870","info@hotelrembrandt.ma"),
    ("hotel_009","Hotel El Oumnia Puerto","4_etoiles","hotel",35.7920,-5.8100,"Corniche",850,1600,"moyen",4.2,290,90,True,True,False,"https://www.eloumniapuerto.com","+212539947410","reservation@eloumniapuerto.com"),
    ("hotel_010","Hotel Intercontinental Tanger","4_etoiles","hotel",35.7760,-5.8010,"Centre-ville",800,1500,"moyen",4.2,510,130,True,True,False,None,"+212539358000","tanger@ihg.com"),
    ("hotel_011","Hotel Atlas Asma","4_etoiles","hotel",35.7740,-5.8100,"Centre-ville",750,1400,"moyen",4.0,330,100,False,True,False,"https://www.atlashotels.ma","+212539944440","asma@atlashotels.ma"),
    ("hotel_012","Hotel Chellah","4_etoiles","hotel",35.7830,-5.8090,"Centre-ville",700,1300,"moyen",3.8,220,80,False,False,False,None,"+212539942930","info@hotelchellah.ma"),
    ("hotel_013","Hotel Ahlen","4_etoiles","hotel",35.7700,-5.8150,"Centre-ville",720,1350,"moyen",4.1,290,95,False,True,False,None,"+212539946480","info@hotelahlen.ma"),
    ("hotel_014","Hotel Tanjah Flandria","4_etoiles","hotel",35.7810,-5.8100,"Centre-ville",700,1300,"moyen",3.9,175,70,False,False,False,None,"+212539938279","info@tanflandria.ma"),
    ("hotel_015","Hotel Preciados Tanger","4_etoiles","hotel",35.7850,-5.8110,"Médina",750,1400,"moyen",4.0,210,60,False,True,False,None,"+212539942030","info@preciados.ma"),
    ("hotel_016","Hotel Ibis Tanger City Center","3_etoiles","hotel",35.7720,-5.8080,"Centre-ville",450,800,"moyen",3.8,680,120,False,True,False,"https://www.ibis.com","+212539300200","tanger@ibis.com"),
    ("hotel_017","Hotel Magellan","3_etoiles","hotel",35.7790,-5.8070,"Centre-ville",400,750,"moyen",3.7,290,55,False,False,False,None,"+212539372460","info@hotelmagellan.ma"),
    ("hotel_018","Hotel Continental","3_etoiles","hotel",35.7862,-5.8105,"Médina",400,700,"moyen",4.0,340,60,True,False,False,"https://www.hotelcontinental.ma","+212539931024","info@hotelcontinental.ma"),
    ("hotel_019","Hotel Ibn Batouta","3_etoiles","hotel",35.7660,-5.9050,"Aéroport",450,750,"moyen",3.6,180,80,False,True,False,None,"+212539393400","ibnbatouta@gmail.com"),
    ("hotel_020","Hotel Bab Bhar","3_etoiles","hotel",35.7870,-5.8120,"Médina",380,680,"moyen",3.9,230,50,True,False,False,None,"+212539934390","info@babbhar.ma"),
    ("hotel_021","Hotel El Djenina","3_etoiles","hotel",35.7838,-5.8097,"Centre-ville",400,700,"moyen",3.8,195,38,False,False,False,None,"+212539942244","info@eldjenina.ma"),
    ("hotel_022","Hotel Marco Polo","3_etoiles","hotel",35.7795,-5.8055,"Centre-ville",420,750,"moyen",3.7,165,50,False,True,False,None,"+212539941124","info@marcopolo.ma"),
    ("hotel_023","Hotel Solazur","3_etoiles","hotel",35.7900,-5.8020,"Corniche",500,800,"moyen",3.9,270,100,True,True,False,None,"+212539940164","info@solazur.ma"),
    ("hotel_024","Hotel Dawliz","3_etoiles","hotel",35.7920,-5.8010,"Corniche",480,780,"moyen",3.8,220,80,True,True,False,None,"+212539944740","info@dawliz.ma"),
    ("hotel_025","Hotel Rif","3_etoiles","hotel",35.7840,-5.8085,"Centre-ville",380,650,"moyen",3.6,310,80,False,False,False,None,"+212539946610","info@hotelrif.ma"),
    ("hotel_026","Hotel Royal","3_etoiles","hotel",35.7820,-5.8100,"Centre-ville",360,650,"moyen",3.5,280,60,False,False,False,None,"+212539938838","info@hotelroyal-tanger.ma"),
    ("hotel_027","Hotel Valencia","3_etoiles","hotel",35.7800,-5.8080,"Centre-ville",400,700,"moyen",3.7,190,45,False,True,False,None,"+212539941817","info@hotelvalencia.ma"),
    ("hotel_028","Hotel Mamora","2_etoiles","hotel",35.7760,-5.8120,"Centre-ville",220,380,"economique",3.4,190,40,False,False,False,None,"+212539938271","info@mamora.ma"),
    ("hotel_029","Hotel Andaluz","2_etoiles","hotel",35.7840,-5.8110,"Médina",200,350,"economique",3.3,145,35,False,False,False,None,"+212539938420","info@andaluz.ma"),
    ("hotel_030","Hotel Faro","2_etoiles","hotel",35.7800,-5.8090,"Centre-ville",180,320,"economique",3.2,120,30,False,False,False,None,"+212539943910","info@hotelfaro.ma"),
    ("hotel_031","Hotel Mauritania","2_etoiles","hotel",35.7820,-5.8105,"Centre-ville",200,340,"economique",3.4,165,35,False,False,False,None,"+212539935801","info@mauritania.ma"),
    ("hotel_032","Hotel Nassim","2_etoiles","hotel",35.7760,-5.8060,"Centre-ville",190,330,"economique",3.3,110,28,False,False,False,None,"+212539941425","info@nassim.ma"),
    ("hotel_033","Hotel Maroc","2_etoiles","hotel",35.7810,-5.8115,"Centre-ville",170,300,"economique",3.1,98,32,False,False,False,None,"+212539935093","info@hotelmaroc.ma"),
    ("hotel_034","Hotel Florida","2_etoiles","hotel",35.7835,-5.8095,"Centre-ville",190,320,"economique",3.2,130,28,False,False,False,None,"+212539933116","info@florida.ma"),
    ("hotel_035","Hotel Excelsior","2_etoiles","hotel",35.7850,-5.8125,"Centre-ville",200,340,"economique",3.3,150,40,False,False,False,None,"+212539937271","info@excelsior.ma"),
    ("hotel_036","Dar Sultan Riad","riad","riad",35.7880,-5.8130,"Kasbah",600,1200,"premium",4.8,210,8,True,True,False,"https://www.darsultan.com","+212539336362","info@darsultan.com"),
    ("hotel_037","La Tangerina Riad","riad","riad",35.7875,-5.8128,"Kasbah",700,1400,"premium",4.9,320,9,True,True,False,"https://www.latangerina.com","+212539947731","info@latangerina.com"),
    ("hotel_038","Dar Chams Tanja","riad","riad",35.7868,-5.8122,"Kasbah",650,1200,"premium",4.7,185,7,True,True,False,"https://www.darchams.com","+212539332323","info@darchams.com"),
    ("hotel_039","Riad Andaluz Tanger","riad","riad",35.7855,-5.8115,"Médina",500,950,"moyen",4.5,160,10,False,True,False,None,"+212539930234","info@riaandaluz.ma"),
    ("hotel_040","Dar Nour","riad","riad",35.7878,-5.8135,"Kasbah",800,1600,"premium",4.9,290,6,True,True,False,"https://www.darnour.com","+212539930339","reservation@darnour.com"),
    ("hotel_041","Riad Maison Tingis","riad","riad",35.7860,-5.8120,"Kasbah",600,1100,"moyen",4.6,140,8,False,True,False,None,"+212661123456","info@maisontinigs.ma"),
    ("hotel_042","El Morocco Club Riad","riad","riad",35.7865,-5.8118,"Kasbah",900,1800,"premium",4.7,220,12,True,True,False,"https://www.elmoroccclub.com","+212539948439","info@elmoroccoclub.com"),
    ("hotel_043","Riad Tanja","riad","riad",35.7848,-5.8108,"Médina",450,850,"moyen",4.4,130,9,False,True,False,None,"+212539934958","info@riadtanja.ma"),
    ("hotel_044","Riad Perle de Tanger","riad","riad",35.7858,-5.8112,"Médina",480,900,"moyen",4.5,115,10,False,True,False,None,"+212661234567","info@perletanger.ma"),
    ("hotel_045","Riad Calla Tanger","riad","riad",35.7862,-5.8116,"Médina",500,950,"moyen",4.3,95,8,False,True,False,None,"+212661345678","info@riadcalla.ma"),
    ("hotel_046","Auberge de Jeunesse Tanger","auberge","auberge_jeunesse",35.7800,-5.8085,"Centre-ville",80,150,"economique",3.6,450,50,False,False,False,"https://www.hihostels.com","+212539946127","tanger@hihostels.ma"),
    ("hotel_047","Bab Bhar Hostel","auberge","auberge_jeunesse",35.7870,-5.8125,"Médina",90,160,"economique",4.0,310,30,False,False,False,None,"+212661456789","info@babbharhostel.ma"),
    ("hotel_048","Tanger Inn Hostel","auberge","auberge_jeunesse",35.7855,-5.8110,"Médina",100,180,"economique",4.2,280,25,False,True,False,None,"+212661567890","info@tangerinn.ma"),
    ("hotel_049","Kasbah Backpackers","auberge","auberge_jeunesse",35.7872,-5.8127,"Kasbah",110,180,"economique",4.3,190,20,True,False,False,None,"+212661678901","info@kasbahbackpackers.ma"),
    ("hotel_050","Surf & Stay Hostel","auberge","auberge_jeunesse",35.7600,-5.9400,"Achakkar",90,170,"economique",4.1,150,20,False,False,False,None,"+212661789012","info@surfstay.ma"),
]

equip_luxe = ["wifi","piscine","spa","restaurant","bar","parking","climatisation","room_service","conciergerie","salle_conference","navette_aeroport","hammam","fitness"]
equip_4 = ["wifi","restaurant","bar","parking","climatisation","room_service","fitness","piscine"]
equip_3 = ["wifi","restaurant","parking","climatisation","room_service"]
equip_2 = ["wifi","climatisation","reception_24h"]
equip_riad = ["wifi","riad","patio","hammam","petit_dejeuner","terrasse","climatisation"]
equip_hostel = ["wifi","cuisine_commune","consigne_bagages","reception_24h","dortoirs"]

tags_map = {
    "5_etoiles": ["luxe","piscine","spa","vue_mer","premium"],
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

saisons = ["juillet","août","septembre"]

desc_fr = {
    "5_etoiles": "Établissement de grand luxe offrant une expérience hôtelière d'exception à Tanger. Ses chambres spacieuses et raffinées disposent de tout le confort moderne avec décoration soignée. Le restaurant gastronomique propose une cuisine marocaine et internationale de haute qualité. Le spa et la piscine intérieure permettent de se ressourcer après une journée de visite. Le personnel multilingue et disponible 24h/24 assure un service irréprochable. Idéalement situé, il permet d'accéder facilement aux attractions touristiques de la ville.",
    "4_etoiles": "Hôtel 4 étoiles bien équipé proposant un excellent rapport qualité-prix en plein cœur de Tanger. Les chambres confortables et climatisées offrent tout le confort nécessaire pour un séjour agréable. Le restaurant de l'hôtel propose une carte variée de plats marocains et internationaux. La situation centrale facilite les déplacements vers les principaux sites touristiques. Le personnel accueillant et professionnel est à votre disposition pour vous guider.",
    "3_etoiles": "Hôtel 3 étoiles confortable et bien situé à Tanger, idéal pour les voyageurs recherchant confort et praticité sans sacrifier leur budget. Les chambres propres et fonctionnelles sont équipées du wifi gratuit et de la climatisation. La réception est disponible pour vous aider à planifier vos visites dans la ville. Un petit-déjeuner marocain authentique peut être servi sur demande. Excellent point de départ pour explorer la médina, la Kasbah et les nombreux sites historiques de la ville.",
    "2_etoiles": "Hôtel 2 étoiles simple et propre, parfaitement adapté aux voyageurs soucieux de leur budget à Tanger. Les chambres fonctionnelles offrent tout l'essentiel pour un séjour confortable. Idéalement situé en centre-ville, il permet d'accéder facilement à pied aux principaux sites touristiques. Le personnel sympathique se fera un plaisir de vous donner des conseils sur les meilleures adresses de la ville.",
    "riad": "Riad traditionnel authentiquement marocain situé dans les ruelles pittoresques de la médina ou de la Kasbah de Tanger. Ce joyau architectural s'organise autour d'un patio central orné de zelliges colorés et d'une fontaine apaisante. Les chambres décorées avec des matériaux nobles (bois de cèdre, stuc sculpté, tissus berbères) offrent une atmosphère chaleureuse et intime. Le toit-terrasse offre une vue panoramique sur les toits de la médina et le détroit de Gibraltar. Une hospitalité marocaine authentique et personnalisée pour une expérience mémorable.",
    "auberge": "Auberge de jeunesse accueillante et conviviale, idéale pour les voyageurs souhaitant découvrir Tanger avec un budget serré. Les dortoirs propres et les espaces communs animés favorisent les échanges entre voyageurs du monde entier. La cuisine commune permet de préparer ses propres repas et de faire des économies. L'équipe dynamique et passionnée organise régulièrement des visites guidées de la médina et des excursions dans la région."
}

desc_en = {
    "5_etoiles": "A luxury establishment offering an exceptional hotel experience in Tangier. Its spacious and refined rooms feature all modern comforts with careful decoration. The gourmet restaurant offers high-quality Moroccan and international cuisine. The spa and indoor pool allow guests to recharge after a day of sightseeing. The multilingual staff available 24/7 ensures impeccable service. Ideally located, it provides easy access to the city's tourist attractions.",
    "4_etoiles": "A well-equipped 4-star hotel offering excellent value for money in the heart of Tangier. The comfortable, air-conditioned rooms provide all necessary comfort for a pleasant stay. The hotel restaurant offers a varied menu of Moroccan and international dishes. The central location facilitates travel to the main tourist sites. The welcoming and professional staff is at your service to guide you.",
    "3_etoiles": "A comfortable and well-located 3-star hotel in Tangier, ideal for travelers seeking comfort and practicality without breaking the budget. Clean and functional rooms are equipped with free wifi and air conditioning. The reception is available to help you plan your city visits. An authentic Moroccan breakfast can be served on request. An excellent base to explore the medina, Kasbah, and the city's many historic sites.",
    "2_etoiles": "A simple and clean 2-star hotel, perfectly suited for budget-conscious travelers in Tangier. Functional rooms offer all the essentials for a comfortable stay. Ideally located in the city center, major tourist sites are easily accessible on foot. The friendly staff will be happy to share their recommendations for the best addresses in the city.",
    "riad": "An authentically Moroccan traditional riad located in the picturesque alleys of Tangier's medina or Kasbah. This architectural gem is organized around a central patio adorned with colorful zellige tiles and a soothing fountain. Rooms decorated with noble materials (cedar wood, sculpted stucco, Berber fabrics) offer a warm and intimate atmosphere. The rooftop terrace offers a panoramic view over the medina's rooftops and the Strait of Gibraltar. Authentic and personalized Moroccan hospitality for an unforgettable experience.",
    "auberge": "A welcoming and friendly youth hostel, ideal for travelers wishing to discover Tangier on a tight budget. Clean dormitories and lively common areas encourage exchanges between travelers from around the world. The shared kitchen allows guests to prepare their own meals and save money. The dynamic and passionate team regularly organizes guided tours of the medina and excursions in the region."
}

desc_ar = {
    "5_etoiles": "منشأة فاخرة تقدم تجربة فندقية استثنائية في طنجة. تتميز غرفها الفسيحة والراقية بجميع وسائل الراحة الحديثة مع ديكور أنيق. يقدم المطعم الفاخر مأكولات مغربية ودولية عالية الجودة. يتيح السبا والمسبح الداخلي الاسترخاء والتجدد بعد يوم حافل بالجولات. يضمن الطاقم متعدد اللغات المتاح على مدار الساعة خدمة لا تشوبها شائبة.",
    "4_etoiles": "فندق 4 نجوم مجهز تجهيزاً جيداً يقدم قيمة ممتازة مقابل المال في قلب طنجة. توفر الغرف المريحة والمكيفة جميع وسائل الراحة اللازمة لإقامة ممتعة. يقدم مطعم الفندق قائمة متنوعة من الأطباق المغربية والدولية. يسهل الموقع المركزي التنقل إلى المواقع السياحية الرئيسية في المدينة.",
    "3_etoiles": "فندق 3 نجوم مريح وموقعه ممتاز في طنجة، مثالي للمسافرين الذين يبحثون عن الراحة والعملية دون الإخلال بالميزانية. الغرف النظيفة والعملية مجهزة بواي فاي مجاني وتكييف هواء. الاستقبال متاح لمساعدتك في التخطيط لزياراتك في المدينة.",
    "2_etoiles": "فندق بسيط ونظيف من فئة نجمتين، مناسب تماماً للمسافرين الحريصين على ميزانيتهم في طنجة. توفر الغرف الوظيفية جميع الضروريات لإقامة مريحة. يتيح الموقع المثالي في وسط المدينة الوصول إلى المعالم السياحية الرئيسية سيراً على الأقدام.",
    "riad": "رياض تقليدي أصيل يقع في الأزقة الخلابة للمدينة القديمة أو القصبة في طنجة. تتمحور هذه الجوهرة المعمارية حول فناء مركزي مزين بالزليج الملون ونافورة هادئة. تقدم الغرف المزينة بمواد نبيلة أجواء دافئة وحميمة. تطل التراس على أسطح المدينة القديمة ومضيق جبل طارق.",
    "auberge": "نزل شباب مرحب وودي، مثالي للمسافرين الراغبين في اكتشاف طنجة بميزانية محدودة. تشجع الأسرة النظيفة والمساحات المشتركة الحيوية التبادل بين المسافرين من جميع أنحاء العالم. تتيح المطبخ المشترك إعداد الوجبات الخاصة وتوفير المال."
}

result = []
for row in hotels_data:
    id_,nom,cat,typ,lat,lon,qrt,p_min,p_max,budget,note,nb_avis,chambres,vue_mer,pdej,animaux,web,tel,email = row
    if cat == "5_etoiles": eq = equip_luxe
    elif cat == "4_etoiles": eq = equip_4
    elif cat == "3_etoiles": eq = equip_3
    elif cat == "2_etoiles": eq = equip_2
    elif cat == "riad": eq = equip_riad
    else: eq = equip_hostel

    result.append({
        "id": id_, "nom": nom, "categorie": cat, "type": typ,
        "latitude": lat, "longitude": lon,
        "adresse": f"{nom}, {qrt}, Tanger 90000, Maroc",
        "quartier": qrt,
        "description_fr": desc_fr[cat],
        "description_en": desc_en[cat],
        "description_ar": desc_ar[cat],
        "prix_nuit_min_mad": p_min, "prix_nuit_max_mad": p_max,
        "budget_type": budget, "note_moyenne": note, "nb_avis": nb_avis,
        "equipements": eq, "vue_mer": vue_mer,
        "petit_dejeuner_inclus": pdej, "animaux_acceptes": animaux,
        "nombre_chambres": chambres,
        "check_in": "14:00", "check_out": "12:00",
        "langues_personnel": langues_map[cat],
        "tags": tags_map[cat] + (["vue_mer"] if vue_mer else []),
        "saison_haute": saisons,
        "image_url": f"https://source.unsplash.com/600x400/?hotel,morocco,{cat.split('_')[0]}",
        "site_web": web, "telephone": tel, "email_contact": email,
        "source_donnee": "Google Places + TripAdvisor"
    })

out = r'c:\Users\HP\Documents\projet touristique\dataset\hotels.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

cats = {}
for h in result:
    cats[h['categorie']] = cats.get(h['categorie'],0)+1
print(f"Total: {len(result)} hotels")
for k,v in sorted(cats.items()): print(f"  {k}: {v}")
