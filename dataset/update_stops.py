import json
import time
import requests
import os

file_path = 'issal_tanger_30lignes.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

headers = {
    'User-Agent': 'TangerBusDatasetUpdater/1.0 (contact@example.com)'
}

def reverse_geocode(lat, lon):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        result = response.json()
        address = result.get('address', {})
        
        # Try to find a meaningful name
        name = address.get('road') or address.get('pedestrian') or address.get('suburb') or address.get('neighbourhood') or address.get('village') or address.get('city_district')
        if name:
            return name
        return "Arrêt Inconnu"
    except Exception as e:
        print(f"Error for {lat}, {lon}: {e}")
        return None

count = 0
for ligne in data['lignes']:
    for arret in ligne['arrets']:
        if arret['nom'].startswith('Arrêt L'):
            lat = arret['latitude']
            lon = arret['longitude']
            print(f"Geocoding {lat}, {lon} for {arret['nom']}...")
            
            new_name = reverse_geocode(lat, lon)
            if new_name and new_name != "Arrêt Inconnu":
                arret['nom'] = new_name
                arret['nom_en'] = f"{new_name} Station"
                arret['nom_ar'] = f"محطة {new_name}"
            else:
                arret['nom'] = f"Avenue/Rue (Proche {arret.get('quartier', 'Tanger')})"
                arret['nom_en'] = f"{arret['nom']} Station"
                arret['nom_ar'] = f"محطة {arret['nom']}"
                
            count += 1
            time.sleep(1.1)  # Respect Nominatim limits

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {count} stops.")
