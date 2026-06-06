#!/usr/bin/env python3
import json
from pathlib import Path

from Dashboard import analytics

root = Path(__file__).resolve().parents[1]
dst = root / "dataset"
dst.mkdir(parents=True, exist_ok=True)

def write(name, data):
    p = dst / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("wrote:", p)

# Basic stats
write('statistics.json', analytics.get_statistics())
write('kpis.json', analytics.get_kpis())

# Charts
write('charts_lieux_par_categorie.json', analytics.get_charts_lieux_par_categorie())
write('charts_hotels_par_etoiles.json', analytics.get_charts_hotels_par_etoiles())
write('charts_visiteurs_par_lieu.json', analytics.get_charts_visiteurs_par_lieu())
write('charts_prix_hotels.json', analytics.get_charts_prix_hotels())
write('charts_restaurants_par_cuisine.json', analytics.get_charts_restaurants_par_cuisine())
write('charts_activites_par_saison.json', analytics.get_charts_activites_par_saison())
write('charts_budget_activites.json', analytics.get_charts_budget_activites())
write('charts_evenements_par_type.json', analytics.get_charts_evenements_par_type())

# Maps
write('map_lieux.json', analytics.get_map_lieux())
write('map_hotels.json', analytics.get_map_hotels())
write('map_restaurants.json', analytics.get_map_restaurants())
write('map_services.json', analytics.get_map_services())

# Raw lists
write('hotels.json', analytics.get_hotels())
write('restaurants.json', analytics.get_restaurants())
write('plages.json', analytics.get_plages())
write('musees.json', analytics.get_musees())
write('activites.json', analytics.get_activites())
write('evenements.json', analytics.get_evenements())
write('lieux_touristiques.json', analytics.get_lieux())
write('transports.json', analytics.get_transports())
write('itineraires.json', analytics.get_itineraries())

# AI & transport & overview
write('ai_insights.json', analytics.get_ai_insights())
write('transport.json', analytics.get_transport())
write('overview.json', analytics.get_full_overview())

print('Export complete')
