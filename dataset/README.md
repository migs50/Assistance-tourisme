# Dataset Touristique de Tanger 🇲🇦
# Tourism Dataset for Tangier

## Description

Ce dataset complet est conçu pour alimenter une application web/mobile d'assistance touristique intelligente pour la ville de Tanger. Il couvre tous les aspects nécessaires à l'implémentation de :

- **Recommandation personnalisée** (profils utilisateurs + données riches sur les lieux)
- **Prédiction comportementale** (avis, durées de visite, sentiments, timestamps)
- **Assistance conversationnelle** (FAQ, itinéraires, informations pratiques)

---

## Structure des fichiers

| Fichier | Description | Entrées | Usage IA |
|---------|-------------|---------|----------|
| `lieux_touristiques.json` | Attractions et sites | 50 | Recommandation, géolocalisation |
| `restaurants.json` | Restaurants et cafés | 140 | Recommandation gastronomique |
| `hotels.json` | Hébergements (hôtels, riads, auberges) | 80 | Recommandation logement |
| `activites.json` | Activités et expériences | 35 | Recommandation activités |
| `utilisateurs.json` | Profils touristes | 800 | Prédiction comportementale |
| `avis.json` | Avis et évaluations | 100 | Analyse de sentiment, feedback |
| `services_urgence.json`| Services de santé et sécurité | 15 | Assistance d'urgence, géolocalisation |
| `transports.json` | Moyens de transport | 7 | Planification de déplacements |
| `evenements.json` | Agenda culturel | 24 | Recommandation temporelle |
| `itineraires.json` | Itinéraires types | 4 | Planification de séjour |
| `faq_chatbot.json` | FAQ pour chatbot | 56 | Assistance conversationnelle (multilingue) |

---

## Relations entre les données

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Utilisateurs │────>│    Avis      │<────│    Lieux     │
│  (profils)   │     │ (sentiment)  │     │ (attractions)│
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       v                    v                     v
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Itinéraires  │────>│  Activités   │     │ Restaurants  │
│  (planning)  │     │(expériences) │     │   (dining)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       v                                         v
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Transports  │     │  Événements  │     │   Hôtels     │
│(déplacements)│     │ (festivals)  │     │(hébergement) │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            v
                 ┌──────────────┐   ┌──────────────┐
                 │ FAQ Chatbot  │   │  Urgences    │
                 │ (assistance) │   │ (santé/sécu) │
                 └──────────────┘   └──────────────┘
```

## Champs clés pour l'IA

### Recommandation personnalisée
- `tags` : Correspondance profil/lieu par tags communs
- `budget` + `fourchette_prix` : Filtrage par budget
- `note_moyenne` : Classement par popularité
- `saison_recommandee` : Contexte temporel
- `accessibilite_pmr` : Filtrage accessibilité
- `image_url` : Affichage visuel dans l'interface

### Prédiction comportementale
- `duree_reelle_min` vs `duree_visite_min/max` : Écart prédit/réel
- `heure_visite` : Patterns temporels
- `photos_prises` : Indicateur d'engagement
- `sentiment` : Classification sentimentale
- `score_sentiment` : Score numérique [-1.0 → +1.0]
- `niveau_affluence` : Prédiction de foule

### Assistance conversationnelle
- `faq_chatbot.json` : Base de connaissances
- `intention` : Classification d'intention NLU
- Données trilingues FR/EN/AR pour chatbot multilingue

---

## Exemples d'utilisation

### 1. Recommandation : trouver des lieux pour un profil
```python
# Filtrer les lieux par tags correspondant aux intérêts du touriste
user_interests = user["interets"]  # ex: ["gastronomie", "culture"]
matching = [lieu for lieu in lieux if set(lieu["tags"]) & set(user_interests)]
```

### 2. Prédiction : estimer la durée de visite
```python
# Prédire la durée réelle à partir des données historiques
avg_duration = mean([avis["duree_reelle_min"] for avis in avis_lieu])
```

### 3. Chatbot : répondre à une question
```python
# Chatbot : répondre à une question via RAG + LLM
def chatbot_repondre(question, langue="fr"):
    # Étape 1 : Recherche FAQ pertinente par mots-clés
    faq_key = f"question_{langue}"
    candidats = [f for f in faqs 
                 if any(tag in question.lower() 
                 for tag in f["tags"])]
    
    # Étape 2 : Construction du contexte local
    contexte = candidats[0] if candidats else {}
    
    # Étape 3 : Appel LLM avec contexte injecté (RAG)
    reponse = appel_llm(question, contexte, langue)
    return reponse
```

---

## Licence
Ce dataset est généré à des fins strictement académiques dans le cadre 
d'un Projet de Fin d'Études (PFE) — Licence Data Analytics.
Les données sont synthétiques ou issues de sources publiques.
Aucune donnée personnelle identifiable n'est stockée.
Toute utilisation commerciale est interdite.
