"""
Module Assurance - Gestion des services d'urgence, assurances et sécurité touristique
API endpoints pour la page Assistance & Sécurité Voyageur
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
from datetime import datetime

router = APIRouter(prefix="/api/assurance", tags=["assurance"])

# ============================================================================
# DONNÉES INTÉGRÉES
# ============================================================================

EMERGENCY_SERVICES = [
    {
        "id": "urg_001",
        "nom": "Préfecture de Police - Centre",
        "type": "commissariat",
        "nom_simple": "Police Secours",
        "telephone_local": "19",
        "description_fr": "Urgences policières, vol, agression, perte de documents",
        "address": "Avenue d'Espagne, Tanger",
        "hours": "24/24",
        "urgences_24h": True,
        "steps": [
            "Appelez le 19 immédiatement",
            "Indiquez votre localisation",
            "Attendez l'arrivée de la police"
        ]
    },
    {
        "id": "urg_002",
        "nom": "Gendarmerie Royale",
        "type": "gendarmerie",
        "nom_simple": "Gendarmerie",
        "telephone_local": "177",
        "description_fr": "Sécurité hors zones urbaines, accidents de route",
        "address": "Route de Rabat, Tanger",
        "hours": "24/24",
        "urgences_24h": True,
        "steps": [
            "Composez le 177",
            "Décrivez l'incident",
            "Restez à l'écoute"
        ]
    },
    {
        "id": "urg_003",
        "nom": "Protection Civile (Pompiers)",
        "type": "pompiers",
        "nom_simple": "Pompiers",
        "telephone_local": "15",
        "description_fr": "Incendies, accidents graves, catastrophes",
        "address": "Avenue Youssef Ibn Tachfine, Tanger",
        "hours": "24/24",
        "urgences_24h": True,
        "steps": [
            "Appelez le 15 pour les urgences",
            "Décrivez la situation (incendie, accident, etc.)",
            "Suivez les instructions de l'opérateur"
        ]
    },
    {
        "id": "urg_004",
        "nom": "SAMU - Service d'Aide Médicale Urgente",
        "type": "samu",
        "nom_simple": "Ambulance / SAMU",
        "telephone_local": "150",
        "description_fr": "Urgences médicales, détresses cardiaques et respiratoires",
        "address": "Centre Hospitalier Mohammed V, Tanger",
        "hours": "24/24",
        "urgences_24h": True,
        "steps": [
            "Appelez le 150 ou contactez directement votre assureur",
            "Décrivez les symptômes",
            "Préparez-vous pour l'ambulance"
        ]
    },
    {
        "id": "urg_005",
        "nom": "Hôpital Mohammed V Tanger",
        "type": "hopital_public",
        "nom_simple": "Hôpital Mohammed V",
        "telephone_local": "0539938080",
        "email": "contact@hmv-tanger.ma",
        "address": "Avenue Mokhtar Ahardan, Tanger 90000",
        "hours": "24/24",
        "urgences_24h": True,
        "services": ["urgences", "chirurgie", "maternite", "pediatrie", "cardiologie"],
        "languages": ["ar", "fr", "es"],
        "website": "https://www.hopital-tanger.ma"
    },
    {
        "id": "urg_006",
        "nom": "Clinique Al Amal",
        "type": "clinique_privee",
        "nom_simple": "Clinique Al Amal",
        "telephone_local": "0539340707",
        "email": "contact@alamal-clinique.ma",
        "address": "Avenue Prince Héritier, Tanger 90000",
        "hours": "24/24",
        "urgences_24h": True,
        "services": ["urgences", "chirurgie", "reanimation", "IRM", "scanner"],
        "languages": ["ar", "fr", "en", "es"],
        "website": "https://www.alamal-clinique.ma"
    },
    {
        "id": "urg_007",
        "nom": "Clinique Tingis",
        "type": "clinique_privee",
        "nom_simple": "Clinique Tingis",
        "telephone_local": "0539323232",
        "email": "contact@tingis-clinic.ma",
        "address": "Boulevard des FAR, Malabata, Tanger 90000",
        "hours": "24/24",
        "urgences_24h": True,
        "services": ["urgences", "cardiologie", "chirurgie"],
        "languages": ["ar", "fr", "en"],
        "website": "https://www.tingis-clinic.ma"
    },
    {
        "id": "urg_008",
        "nom": "Pharmacie Pasteur (Garde)",
        "type": "pharmacie",
        "nom_simple": "Pharmacie Pasteur",
        "telephone_local": "0539931234",
        "address": "Boulevard Pasteur, Centre-ville, Tanger",
        "hours": "24/24",
        "urgences_24h": True,
        "services": ["medicaments", "parapharmacie", "conseil"],
        "languages": ["ar", "fr", "es"]
    }
]

INSURANCE_COMPANIES = [
    {
        "id": "ASS001",
        "nom": "Wafa Assurance",
        "categorie": "assureur_local_marocain",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcXpPwaMfP3o9N-IgcKP7UQTPS1Rr7IxPQ7w&s",
        "coordonnees": {
            "adresse": "12 Rue de la Liberté, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "agence.tanger@wafaassurance.ma",
            "site_web": "https://www.wafaassurance.ma"
        },
        "horaires": {
            "lundi_vendredi": "09:00-18:00",
            "samedi": "09:00-13:00",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": False,
        "couvertures": {
            "frais_medicaux_max_mad": 250000,
            "rapatriement_medical": True,
            "perte_bagages_max_mad": 8000,
            "annulation_voyage": True
        },
        "note_moyenne": 4.1,
        "avis_count": 124,
        "tarif_journalier_moyen_mad": 80,
        "note_rag": "Assureur local marocain. Adapté aux budgets moyens."
    },
    {
        "id": "ASS002",
        "nom": "RMA Assurance",
        "categorie": "assureur_local_marocain",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeWSbp8mXbKMFn3CDObuCUasR8sO4R5EfhKQ&s",
        "coordonnees": {
            "adresse": "45 Avenue des Nations Unies, Malabata, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "agence.tanger@rma.ma",
            "site_web": "https://www.rma.ma"
        },
        "horaires": {
            "lundi_vendredi": "08:30-17:30",
            "samedi": "Fermé",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": False,
        "couvertures": {
            "frais_medicaux_max_mad": 300000,
            "rapatriement_medical": True,
            "perte_bagages_max_mad": 12000,
            "annulation_voyage": True
        },
        "note_moyenne": 4.0,
        "avis_count": 98,
        "tarif_journalier_moyen_mad": 95,
        "note_rag": "Bon choix pour les risques d'agression ou vol."
    },
    {
        "id": "ASS003",
        "nom": "Atlanta Assurance",
        "categorie": "assureur_local_marocain",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj8gWkWVMwodCfVmd9zBT6burGX6ObaKQoC82sOZPUAw&s=10",
        "coordonnees": {
            "adresse": "7 Boulevard Hassan II, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "agence.tanger@atlantasanad.ma",
            "site_web": "https://www.atlantasanad.ma"
        },
        "horaires": {
            "lundi_vendredi": "09:15-18:15",
            "samedi": "09:15-13:00",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": False,
        "couvertures": {
            "frais_medicaux_max_mad": 275000,
            "rapatriement_medical": True,
            "perte_bagages_max_mad": 10000,
            "annulation_voyage": True
        },
        "note_moyenne": 3.9,
        "avis_count": 87,
        "tarif_journalier_moyen_mad": 75,
        "note_rag": "Option économique avec couverture dentaire d'urgence."
    },
    {
        "id": "ASS004",
        "nom": "AXA Assurance",
        "categorie": "assureur_international",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSKAAWGiR2GB6Fa0WjhfUt1mwruqrbH7etMw&s",
        "coordonnees": {
            "adresse": "22 Avenue de la Corniche, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "agence.tanger@axa.ma",
            "site_web": "https://www.axa.ma"
        },
        "horaires": {
            "lundi_vendredi": "08:00-18:00",
            "samedi": "08:00-14:00",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": True,
        "couvertures": {
            "frais_medicaux_max_mad": 850000,
            "rapatriement_medical": True,
            "perte_bagages_max_mad": 25000,
            "annulation_voyage": True
        },
        "note_moyenne": 4.6,
        "avis_count": 240,
        "tarif_journalier_moyen_mad": 140,
        "note_rag": "Assureur international haut de gamme. Permanence 24h garantie."
    },
    {
        "id": "ASS005",
        "nom": "Allianz Travel",
        "categorie": "assureur_international",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QaeaSa_PqeguMo0FW8rkiJH_5a2xJnJm9A&s",
        "coordonnees": {
            "adresse": "3 Rue du Port, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "agence.tanger@allianz.ma",
            "site_web": "https://www.allianz.ma"
        },
        "horaires": {
            "lundi_vendredi": "07:30-17:30",
            "samedi": "09:00-13:00",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": True,
        "couvertures": {
            "frais_medicaux_max_mad": 950000,
            "rapatriement_medical": True,
            "perte_bagages_max_mad": 28000,
            "annulation_voyage": True
        },
        "note_moyenne": 4.7,
        "avis_count": 268,
        "tarif_journalier_moyen_mad": 145,
        "note_rag": "Meilleure note du dataset. Couvre 6 langues. Idéal pour rapatriement d'urgence."
    },
    {
        "id": "ASS006",
        "nom": "Generali Assurance",
        "categorie": "assureur_international",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDNPGBQsHi92p4NO72wfoA5AudXWG1eB3pSg&s",
        "coordonnees": {
            "adresse": "18 Avenue de la République, Ville Nouvelle, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "agence.tanger@generali.ma",
            "site_web": "https://www.generali.ma"
        },
        "horaires": {
            "lundi_vendredi": "08:00-18:00",
            "samedi": "10:00-14:00",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": True,
        "couvertures": {
            "frais_medicaux_max_mad": 920000,
            "rapatriement_medical": True,
            "perte_bagages_max_mad": 30000,
            "annulation_voyage": True
        },
        "note_moyenne": 4.5,
        "avis_count": 195,
        "tarif_journalier_moyen_mad": 138,
        "note_rag": "Forte couverture malaise cardiaque. Plafond bagages le plus élevé."
    },
    {
        "id": "ASS007",
        "nom": "CNOPS – Délégation Tanger",
        "categorie": "mutuelle_sante",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtROBX4Zpe0fnbjPd3I387GlJjVIbhis8JmQ&s",
        "coordonnees": {
            "adresse": "Avenue Ibn Battouta, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "delegation.tanger@cnops.ma",
            "site_web": "https://www.cnops.ma"
        },
        "horaires": {
            "lundi_vendredi": "08:30-16:30",
            "samedi": "Fermé",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": False,
        "couvertures": {
            "frais_medicaux_max_mad": 120000,
            "rapatriement_medical": False,
            "perte_bagages_max_mad": 5000,
            "annulation_voyage": False
        },
        "note_moyenne": 3.8,
        "avis_count": 62,
        "tarif_journalier_moyen_mad": 35,
        "note_rag": "Réservé aux ressortissants marocains affiliés CNOPS. Ne couvre pas les touristes étrangers."
    },
    {
        "id": "ASS008",
        "nom": "CMIM – Espace Mutualiste Tanger",
        "categorie": "mutuelle_sante",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuAXQ_bY3YMkeifdtpXawZ8srIkV9DWh8oOQ&s",
        "coordonnees": {
            "adresse": "Rue Chérif Idrissi, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "espace.tanger@cmim.ma",
            "site_web": "https://www.cmim.ma"
        },
        "horaires": {
            "lundi_vendredi": "09:00-17:00",
            "samedi": "Fermé",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": False,
        "couvertures": {
            "frais_medicaux_max_mad": 110000,
            "rapatriement_medical": False,
            "perte_bagages_max_mad": 5500,
            "annulation_voyage": False
        },
        "note_moyenne": 3.7,
        "avis_count": 58,
        "tarif_journalier_moyen_mad": 30,
        "note_rag": "Délai remboursement le plus court (15 jours). Couvre urgences dentaires. Réservé aux affiliés marocains."
    },
    {
        "id": "ASS009",
        "nom": "Europ Assistance – Centre Tanger",
        "categorie": "assistance_voyage_specialisee",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKB-70b4mEUB0YWAk1u-ubptjLoY_8cN_9aQ&s",
        "coordonnees": {
            "adresse": "Rue des Nations, Tanger 90000",
            "telephone_agence": "+212 539 XXXXXX",
            "email_contact": "agence.tanger@europ-assistance.ma",
            "site_web": "https://www.europ-assistance.com"
        },
        "horaires": {
            "lundi_vendredi": "08:00-19:00",
            "samedi": "09:00-14:00",
            "dimanche": "Fermé"
        },
        "permanence_urgence_24h": True,
        "couvertures": {
            "frais_medicaux_max_mad": 600000,
            "rapatriement_medical": True,
            "perte_bagages_max_mad": 22000,
            "annulation_voyage": True
        },
        "note_moyenne": 4.4,
        "avis_count": 178,
        "tarif_journalier_moyen_mad": 115,
        "note_rag": "Spécialiste assistance voyage. Très bon pour intoxications alimentaires. Ouvert jusqu'à 19h en semaine."
    }
]

# ============================================================================
# SECURITY_SCORES — 29 lieux touristiques
# ============================================================================
SECURITY_SCORES = [
    {"id": "lieu_001", "name": "Kasbah de Tanger",                 "security": 92, "category": "monument_historique", "quartier": "Kasbah"},
    {"id": "lieu_002", "name": "Grande Mosquée de Tanger",         "security": 81, "category": "monument_historique", "quartier": "Médina"},
    {"id": "lieu_003", "name": "Église Saint-Andrew",              "security": 91, "category": "monument_historique", "quartier": "Centre-ville"},
    {"id": "lieu_004", "name": "Phare du Cap Spartel",             "security": 90, "category": "monument_historique", "quartier": "Cap Spartel"},
    {"id": "lieu_005", "name": "Musée de la Kasbah",               "security": 79, "category": "monument_historique", "quartier": "Kasbah"},
    {"id": "lieu_006", "name": "Palais du Mendoub",                "security": 89, "category": "monument_historique", "quartier": "Marshan"},
    {"id": "lieu_007", "name": "Bab Al Fahs",                      "security": 89, "category": "monument_historique", "quartier": "Centre-ville"},
    {"id": "lieu_008", "name": "Bab Kasbah",                       "security": 90, "category": "monument_historique", "quartier": "Kasbah"},
    {"id": "lieu_009", "name": "Mosquée Sidi Bou Abid",            "security": 93, "category": "monument_historique", "quartier": "Centre-ville"},
    {"id": "lieu_010", "name": "Arènes de Tanger",                 "security": 73, "category": "monument_historique", "quartier": "Ville Nouvelle"},
    {"id": "lieu_011", "name": "Muraille de la Médina",            "security": 88, "category": "monument_historique", "quartier": "Médina"},
    {"id": "lieu_012", "name": "Dar el Makhzen",                   "security": 90, "category": "monument_historique", "quartier": "Kasbah"},
    {"id": "lieu_013", "name": "Médina de Tanger",                 "security": 94, "category": "quartier_historique", "quartier": "Médina"},
    {"id": "lieu_014", "name": "Petit Socco",                      "security": 86, "category": "quartier_historique", "quartier": "Médina"},
    {"id": "lieu_015", "name": "Quartier Marshan",                 "security": 84, "category": "quartier_historique", "quartier": "Marshan"},
    {"id": "lieu_016", "name": "Malabata",                         "security": 87, "category": "quartier_historique", "quartier": "Malabata"},
    {"id": "lieu_017", "name": "Quartier de la Kasbah",            "security": 92, "category": "quartier_historique", "quartier": "Kasbah"},
    {"id": "lieu_018", "name": "Terrasse des Paresseux",           "security": 96, "category": "viewpoint",           "quartier": "Centre-ville"},
    {"id": "lieu_019", "name": "Café Hafa",                        "security": 94, "category": "viewpoint",           "quartier": "Marshan"},
    {"id": "lieu_020", "name": "Corniche de Merkala",              "security": 90, "category": "viewpoint",           "quartier": "Merkala"},
    {"id": "lieu_021", "name": "Parc Perdicaris (Forêt Rmilat)",   "security": 91, "category": "parc_espace_vert",    "quartier": "Rmilat"},
    {"id": "lieu_022", "name": "Villa Harris",                     "security": 93, "category": "parc_espace_vert",    "quartier": "Malabata"},
    {"id": "lieu_023", "name": "Donabo Botanical Gardens",         "security": 92, "category": "parc_espace_vert",    "quartier": "Cap Spartel"},
    {"id": "lieu_024", "name": "Jardins de la Légation",           "security": 94, "category": "parc_espace_vert",    "quartier": "Médina"},
    {"id": "lieu_025", "name": "Marché Casa Barata",               "security": 76, "category": "marche_souk",         "quartier": "Beni Makada"},
    {"id": "lieu_026", "name": "Souk des Potiers",                 "security": 83, "category": "marche_souk",         "quartier": "Médina"},
    {"id": "lieu_027", "name": "Grottes d'Hercule",                "security": 88, "category": "site_archeologique",  "quartier": "Achakkar"},
    {"id": "lieu_028", "name": "Galerie d'Art Tanger",             "security": 90, "category": "musee",               "quartier": "Centre-ville"},
    {"id": "lieu_029", "name": "Musée d'Art Contemporain (MACVT)", "security": 91, "category": "musee",               "quartier": "Kasbah"},
]

# ============================================================================
# FAQ GÉNÉRALE — 12 questions liées aux données backend
# ============================================================================
FAQ_GENERALE = [
    {
        "categorie": "urgence",
        "question": "Que faire en cas d'urgence médicale à Tanger ?",
        "reponse_fr": "Appelez immédiatement le 150 (SAMU) ou le 15 (Protection Civile). Prévenez ensuite votre assureur sur son numéro 24h. N'avancez aucune somme sans l'accord préalable de votre compagnie.",
        "conseil": "Gardez le numéro d'urgence de votre assureur enregistré dans votre téléphone avant de partir."
    },
    {
        "categorie": "urgence",
        "question": "Que faire si je suis victime d'une agression ou d'un vol ?",
        "reponse_fr": "1. Mettez-vous en sécurité. 2. Appelez la Police (19) ou la Gendarmerie (177). 3. Déposez une plainte officielle — ce document est indispensable pour votre déclaration de sinistre. 4. Notez le numéro de procès-verbal.",
        "conseil": "Sans procès-verbal de police, votre assureur ne pourra pas traiter le remboursement pour vol."
    },
    {
        "categorie": "urgence",
        "question": "Les urgences dentaires sont-elles couvertes ?",
        "reponse_fr": "Cela dépend de votre contrat. Les assureurs internationaux (AXA, Allianz) couvrent généralement les soins dentaires d'urgence jusqu'à un plafond. Atlanta Assurance et CMIM couvrent aussi les urgences dentaires. Vérifiez votre police avant le départ.",
        "conseil": "Photographiez votre carte d'assurance et vos conditions générales — accessibles même sans connexion."
    },
    {
        "categorie": "urgence",
        "question": "Comment demander un rapatriement médical ?",
        "reponse_fr": "Contactez la centrale d'assistance 24h de votre assureur (numéro sur votre police). Ils coordonnent directement avec les hôpitaux et organisent le transport médicalisé. Ne prenez pas d'initiative de transport sans leur accord — cela peut annuler la prise en charge.",
        "conseil": None
    },
    {
        "categorie": "couverture",
        "question": "Mon assurance européenne couvre-t-elle le Maroc ?",
        "reponse_fr": "Les assurances européennes (carte bancaire Visa/Mastercard Premium, assurances annuelles multi-voyages) couvrent souvent le Maroc. Vérifiez le périmètre géographique de votre contrat. Le Maroc est dans la zone Afrique du Nord pour la plupart des assureurs.",
        "conseil": "Les cartes bancaires basiques ne couvrent généralement que les pays de l'UE ou les pays où le billet a été acheté."
    },
    {
        "categorie": "couverture",
        "question": "Puis-je souscrire une assurance après mon arrivée à Tanger ?",
        "reponse_fr": "Oui, des assureurs locaux comme Wafa Assurance ou Atlanta permettent de souscrire sur place. Les assureurs internationaux (Europ Assistance) ont aussi des agences à Tanger. Notez que la couverture ne s'applique qu'à partir de la souscription, pas rétroactivement.",
        "conseil": None
    },
    {
        "categorie": "couverture",
        "question": "Quelle est la différence entre un assureur local et international ?",
        "reponse_fr": "Les assureurs locaux (Wafa, RMA, Atlanta) proposent des tarifs plus accessibles (30–95 MAD/jour) et sont adaptés aux séjours courts au Maroc. Les internationaux (AXA, Allianz, Generali) offrent des plafonds bien plus élevés (jusqu'à 950 000 MAD de frais médicaux), une couverture multilingue et une permanence 24h garantie.",
        "conseil": None
    },
    {
        "categorie": "sinistre",
        "question": "Comment déclarer un sinistre au Maroc ?",
        "reponse_fr": "1. Appelez votre assureur dans les 24–48h suivant l'incident. 2. Rassemblez tous les justificatifs : factures originales, rapport médical, procès-verbal de police si nécessaire. 3. Remplissez le formulaire de déclaration (disponible en agence ou en ligne). 4. Envoyez les originaux — les copies ne sont pas acceptées.",
        "conseil": "Le délai de remboursement varie de 15 jours (CMIM) à 60 jours (assureurs locaux)."
    },
    {
        "categorie": "sinistre",
        "question": "Que faire si je perds mon passeport à Tanger ?",
        "reponse_fr": "1. Signalez la perte au commissariat le plus proche et obtenez un procès-verbal. 2. Contactez le consulat de votre pays à Tanger. 3. Votre assurance voyage peut couvrir les frais de remplacement des documents — vérifiez votre contrat. 4. Contactez votre ambassade pour un laissez-passer d'urgence.",
        "conseil": "Conservez une copie numérique de vos documents sur un cloud sécurisé."
    },
    {
        "categorie": "sinistre",
        "question": "Les frais de perte de bagages sont-ils remboursés ?",
        "reponse_fr": "Oui, sous conditions. Les plafonds varient de 8 000 MAD (Wafa) à 30 000 MAD (Generali). Vous devez déclarer la perte à la compagnie aérienne et obtenir un rapport officiel (PIR). Gardez toutes les étiquettes de bagages et vos tickets.",
        "conseil": None
    },
    {
        "categorie": "general",
        "question": "Quels organismes régulent les assurances au Maroc ?",
        "reponse_fr": "Le secteur est régulé par l'ACAPS (Autorité de Contrôle des Assurances et de la Prévoyance Sociale). En cas de litige non résolu, vous pouvez les saisir via leur ligne gratuite : 08 00 10 02 00.",
        "conseil": None
    },
    {
        "categorie": "general",
        "question": "Quelle est la meilleure assurance pour un touriste étranger à Tanger ?",
        "reponse_fr": "Pour une couverture optimale : Allianz Travel (note 4.7, 145 MAD/jour, 6 langues) ou AXA Assurance (note 4.6, permanence 24h). Pour un budget serré : Europ Assistance (115 MAD/jour, spécialisée voyage). Les mutuelles CNOPS/CMIM sont réservées aux affiliés marocains.",
        "conseil": None
    }
]

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/emergency-services", response_description="Liste des services d'urgence")
async def get_emergency_services(
    category: Optional[str] = Query(None, description="Filtrer par catégorie")
):
    """
    Retourne tous les services d'urgence à Tanger.
    Catégories: commissariat, gendarmerie, pompiers, samu, hopital_public, clinique_privee, pharmacie
    """
    services = EMERGENCY_SERVICES
    if category:
        services = [s for s in services if s.get("type") == category]
    return {
        "status": "success",
        "count": len(services),
        "data": services
    }


@router.get("/emergency-services/{service_id}", response_description="Détails d'un service d'urgence")
async def get_emergency_service(service_id: str):
    service = next((s for s in EMERGENCY_SERVICES if s["id"] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    return {"status": "success", "data": service}


@router.get("/insurance-companies", response_description="Liste des compagnies d'assurance")
async def get_insurance_companies(
    category: Optional[str] = Query(None, description="Filtrer par catégorie")
):
    """
    Catégories: assureur_local_marocain, assureur_international,
                mutuelle_sante, assistance_voyage_specialisee
    """
    companies = INSURANCE_COMPANIES
    if category:
        companies = [c for c in companies if c.get("categorie") == category]
    companies = sorted(companies, key=lambda x: x.get("note_moyenne", 0), reverse=True)
    return {
        "status": "success",
        "count": len(companies),
        "data": companies
    }


@router.get("/insurance-companies/{company_id}", response_description="Détails d'une compagnie")
async def get_insurance_company(company_id: str):
    company = next((c for c in INSURANCE_COMPANIES if c["id"] == company_id), None)
    if not company:
        raise HTTPException(status_code=404, detail="Compagnie non trouvée")
    return {"status": "success", "data": company}


@router.get("/security-scores", response_description="Scores de sécurité par lieu")
async def get_security_scores(
    min_score: Optional[int] = Query(None, ge=0, le=100, description="Score minimum"),
    category: Optional[str] = Query(None, description="Filtrer par catégorie"),
    quartier: Optional[str] = Query(None, description="Filtrer par quartier")
):
    """
    Retourne les scores de sécurité des 29 lieux touristiques.
    Scores basés sur: statistiques d'insécurité publique, présence policière,
    avis de touristes, évaluation de l'équipe locale.
    """
    scores = SECURITY_SCORES

    if min_score is not None:
        scores = [s for s in scores if s["security"] >= min_score]
    if category:
        scores = [s for s in scores if s.get("category") == category]
    if quartier:
        scores = [s for s in scores if s.get("quartier") == quartier]

    scores = sorted(scores, key=lambda x: x["security"], reverse=True)

    avg_score       = sum(s["security"] for s in scores) / len(scores) if scores else 0
    high_security   = len([s for s in scores if s["security"] >= 85])
    medium_security = len([s for s in scores if 70 <= s["security"] < 85])
    low_security    = len([s for s in scores if s["security"] < 70])

    return {
        "status": "success",
        "count": len(scores),
        "statistics": {
            "average_security": round(avg_score, 1),
            "high_security_count": high_security,
            "medium_security_count": medium_security,
            "low_security_count": low_security
        },
        "data": scores
    }


@router.get("/security-scores/{location_id}", response_description="Score de sécurité d'un lieu")
async def get_location_security(location_id: str):
    location = next((l for l in SECURITY_SCORES if l["id"] == location_id), None)
    if not location:
        raise HTTPException(status_code=404, detail="Lieu non trouvé")
    return {"status": "success", "data": location}


@router.get("/insurance-info", response_description="Informations sur l'assurance au Maroc")
async def get_insurance_info():
    return {
        "status": "success",
        "data": {
            "title": "Comment fonctionne l'assurance au Maroc ?",
            "description": "Au Maroc, le secteur des assurances est réglementé par l'ACAPS. Les touristes peuvent souscrire une assurance voyage avant ou pendant leur séjour.",
            "key_points": [
                {"icon": "check",    "text": "L'assurance voyage n'est pas obligatoire au Maroc, mais fortement recommandée."},
                {"icon": "check",    "text": "Les assureurs locaux (Wafa, RMA, Atlanta) proposent des offres adaptées aux séjours courts."},
                {"icon": "check",    "text": "Les assureurs internationaux (AXA, Allianz, Generali) couvrent souvent plusieurs pays."},
                {"icon": "alert",    "text": "En cas de sinistre, conservez TOUJOURS les originaux des factures et rapports."},
                {"icon": "trending", "text": "Le remboursement peut prendre entre 15 et 60 jours selon la compagnie."}
            ],
            "insurance_types": {
                "voyage":                "Couvre les imprévus liés au déplacement : annulation, retard, perte de bagages.",
                "accident_corporel":     "Indemnise en cas de blessure ou d'invalidité suite à un accident.",
                "hospitalisation":       "Prend en charge les frais d'hospitalisation dans les cliniques partenaires.",
                "rapatriement_medical":  "Organise et finance le transport médicalisé vers le pays d'origine.",
                "responsabilite_civile": "Protège si le touriste cause un dommage à un tiers.",
                "assistance_juridique":  "Fournit un conseil juridique ou un avocat en cas de litige local."
            },
            "emergency_steps": [
                "1. Appelez le numéro d'urgence 24h de votre assureur (indiqué sur votre police).",
                "2. Ne payez rien sans avoir contacté votre assureur au préalable.",
                "3. Obtenez un rapport médical officiel de l'hôpital ou de la clinique.",
                "4. En cas d'agression ou vol, déposez une plainte à la police.",
                "5. Photographiez tous les dommages matériels (bagages, effets personnels).",
                "6. Conservez TOUS les originaux des factures — les copies ne sont pas acceptées."
            ],
            "regulatory_bodies": {
                "ACAPS": {
                    "name": "Autorité de Contrôle des Assurances et de la Prévoyance Sociale",
                    "role": "Régulateur officiel du secteur des assurances au Maroc",
                    "website": "https://www.acaps.ma",
                    "phone": "08 00 10 02 00"
                },
                "FMA": {
                    "name": "Fédération Marocaine des Sociétés d'Assurances",
                    "role": "Représente les compagnies d'assurance marocaines",
                    "website": "https://www.fma.ma"
                }
            },
            "faq_generale": FAQ_GENERALE
        }
    }


@router.get("/faq", response_description="FAQ sur l'assurance et les urgences")
async def get_faq(
    categorie: Optional[str] = Query(None, description="Filtrer par catégorie: urgence, couverture, sinistre, general")
):
    """
    Retourne les questions fréquentes sur l'assurance et les cas urgents.
    Catégories: urgence, couverture, sinistre, general
    """
    faqs = FAQ_GENERALE
    if categorie:
        faqs = [f for f in faqs if f["categorie"] == categorie]
    return {
        "status": "success",
        "count": len(faqs),
        "categories": list({f["categorie"] for f in FAQ_GENERALE}),
        "data": faqs
    }


@router.get("/safety-report", response_description="Rapport de sécurité global")
async def get_safety_report():
    avg_score = sum(s["security"] for s in SECURITY_SCORES) / len(SECURITY_SCORES) if SECURITY_SCORES else 0
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "overall_security_index": round(avg_score, 1),
            "total_locations": len(SECURITY_SCORES),
            "emergency_services": {
                "total": len(EMERGENCY_SERVICES),
                "24h_available": len([s for s in EMERGENCY_SERVICES if s.get("urgences_24h")])
            },
            "insurance_companies": {
                "local":         len([c for c in INSURANCE_COMPANIES if c["categorie"] == "assureur_local_marocain"]),
                "international": len([c for c in INSURANCE_COMPANIES if c["categorie"] == "assureur_international"]),
                "mutuelle":      len([c for c in INSURANCE_COMPANIES if c["categorie"] in ["mutuelle_sante", "assistance_voyage_specialisee"]]),
                "total":         len(INSURANCE_COMPANIES)
            },
            "faq_count": len(FAQ_GENERALE),
            "recommendations": [
                "Souscrire une assurance voyage avant de partir",
                "Consulter les scores de sécurité des lieux avant la visite",
                "Garder avec soi les numéros d'urgence",
                "Conserver tous les originaux des documents médicaux en cas de sinistre"
            ]
        }
    }


@router.post("/report-incident", response_description="Enregistrer un incident de sécurité")
async def report_incident(incident_data: dict):
    return {
        "status": "success",
        "message": "Incident enregistré. Merci pour votre signalement.",
        "incident_id": f"INC_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "data": incident_data
    }


@router.get("/health", response_description="Status API")
async def health_check():
    return {
        "status": "ok",
        "service": "assurance",
        "timestamp": datetime.now().isoformat(),
        "companies_count": len(INSURANCE_COMPANIES),
        "emergency_services_count": len(EMERGENCY_SERVICES),
        "security_locations_count": len(SECURITY_SCORES),
        "faq_count": len(FAQ_GENERALE),
        "endpoints": {
            "emergency_services":  "/api/assurance/emergency-services",
            "insurance_companies": "/api/assurance/insurance-companies",
            "security_scores":     "/api/assurance/security-scores",
            "insurance_info":      "/api/assurance/insurance-info",
            "faq":                 "/api/assurance/faq",
            "safety_report":       "/api/assurance/safety-report"
        }
    }