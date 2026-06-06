"""
Dashboard/analytics.py
Logique métier complète — alignée sur dashboard.py et Dashboard.jsx
"""

import json
import re
import random
from pathlib import Path
from typing import Any, Optional

DATASET_DIR = Path(__file__).resolve().parent.parent / "dataset"
random.seed(42)


# ══════════════════════════════════════════════════════════════════════════════
# UTILITAIRES INTERNES
# ══════════════════════════════════════════════════════════════════════════════

def _load(filename: str) -> list[dict]:
    """Charge un fichier JSON depuis un des emplacements possibles.

    Ordre de recherche :
    1. `backend/dataset/<filename>` (DATASET_DIR)
    2. `<repo_root>/dataset/<filename>`
    3. `backend/data/<filename>`
    4. `<repo_root>/data/<filename>`

    Retourne une liste vide si aucun fichier n'est trouvé.
    """
    repo_root = Path(__file__).resolve().parents[2]
    candidates = [
        DATASET_DIR / filename,
        repo_root / "dataset" / filename,
        Path(__file__).resolve().parent.parent / "data" / filename,
        repo_root / "data" / filename,
    ]

    path = None
    for p in candidates:
        if p.exists():
            path = p
            break
    if path is None:
        return []

    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for v in data.values():
            if isinstance(v, list):
                return v
    return []


def _load_geojson(filename: str) -> dict:
    """Charge un fichier GeoJSON depuis le dossier dataset/.
    Retourne un FeatureCollection vide si le fichier est introuvable.
    """
    repo_root = Path(__file__).resolve().parents[2]
    candidates = [
        DATASET_DIR / filename,
        repo_root / "dataset" / filename,
        Path(__file__).resolve().parent.parent / "data" / filename,
        repo_root / "data" / filename,
    ]
    path = None
    for p in candidates:
        if p.exists():
            path = p
            break
    if path is None:
        return {"type": "FeatureCollection", "features": []}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _name(item: dict) -> str:
    for k in ("nom", "name", "titre", "title", "Nom", "Name",
              "designation", "label"):
        if item.get(k):
            return str(item[k])
    return "—"


def _parse_price(val) -> float:
    if val is None:
        return 0.0
    s = str(val).replace("MAD", "").replace(" ", "").replace("\xa0", "")
    s = s.split("-")[0].split("–")[0].strip()
    s = re.sub(r"[^\d.]", "", s)
    try:
        return float(s)
    except ValueError:
        return 0.0


def _parse_rating(val) -> float:
    try:
        v = float(val)
        return v if v > 0 else 0.0
    except (TypeError, ValueError):
        return 0.0


_TANGER_CENTER = (35.7595, -5.8340)
_SPREAD = 0.04


def _fallback_coords(index: int) -> tuple[float, float]:
    lat = _TANGER_CENTER[0] + random.uniform(-_SPREAD, _SPREAD)
    lng = _TANGER_CENTER[1] + random.uniform(-_SPREAD, _SPREAD)
    return round(lat, 5), round(lng, 5)


def _coords(item: dict) -> tuple[float, float] | None:
    lat = item.get("lat") or item.get("latitude")
    lng = item.get("lng") or item.get("lon") or item.get("longitude")
    if lat and lng:
        try:
            return float(lat), float(lng)
        except (ValueError, TypeError):
            pass
    coord = item.get("coordinates") or item.get("coords") or item.get("coordonnees")
    if isinstance(coord, dict):
        lat = coord.get("lat") or coord.get("latitude")
        lng = coord.get("lng") or coord.get("lon") or coord.get("longitude")
        if lat and lng:
            try:
                return float(lat), float(lng)
            except (ValueError, TypeError):
                pass
    if isinstance(coord, (list, tuple)) and len(coord) >= 2:
        try:
            return float(coord[0]), float(coord[1])
        except (ValueError, TypeError):
            pass
    return None


# ══════════════════════════════════════════════════════════════════════════════
# STATISTICS  →  /api/dashboard/statistics
# ══════════════════════════════════════════════════════════════════════════════

def get_statistics() -> dict[str, int]:
    """Retourne le nombre total d'éléments par catégorie."""
    return {
        "hotels":      len(_load("hotels.json")),
        "restaurants": len(_load("restaurants.json")),
        "plages":      len(_load("plages.json")),
        "musees":      len(_load("musees.json")),
        "activites":   len(_load("activites.json")),
        "evenements":  len(_load("evenements.json")),
        "lieux":       len(_load("lieux_touristiques.json")),
        "transports":  len(_load("transports.json")),
        "itineraires": len(_load("itineraires.json")),
        "assurances":  len(_load("assurances.json")),
        "urgences":    len(_load("services_urgence.json")),
        "faq":         len(_load("faq_part1.json")),
    }


# ══════════════════════════════════════════════════════════════════════════════
# KPI enrichis  →  /api/dashboard/kpis
# ══════════════════════════════════════════════════════════════════════════════

def get_kpis() -> dict[str, Any]:
    """KPI enrichis : totaux + prix moyen + note moyenne."""
    hotels      = _load("hotels.json")
    restaurants = _load("restaurants.json")
    activites   = _load("activites.json")
    lieux       = _load("lieux_touristiques.json")

    prices = [
        p for h in hotels
        for p in [_parse_price(h.get("price") or h.get("prix") or h.get("tarif"))]
        if p > 0
    ]
    ratings = [
        r for rest in restaurants
        for r in [_parse_rating(rest.get("rating") or rest.get("note") or 0)]
        if r > 0
    ]
    free_acts = sum(
        1 for a in activites
        if str(a.get("price", a.get("prix", ""))).lower()
        in ("0", "gratuit", "free", "")
    )
    total_vis = sum(
        int(l.get("visiteurs_annuels") or l.get("visiteurs") or 0)
        for l in lieux
    ) or len(lieux) * 50_000

    stats = get_statistics()
    return {
        **stats,
        "total_hotels":              stats["hotels"],
        "total_restaurants":         stats["restaurants"],
        "total_plages":              stats["plages"],
        "total_musees":              stats["musees"],
        "total_activites":           stats["activites"],
        "total_evenements":          stats["evenements"],
        "total_lieux":               stats["lieux"],
        "total_transports":          stats["transports"],
        "avg_hotel_price":           round(sum(prices) / len(prices), 2) if prices else 0,
        "avg_restaurant_rating":     round(sum(ratings) / len(ratings), 2) if ratings else 0,
        "free_activities":           free_acts,
        "total_visiteurs_annuels":   total_vis,
    }


# ══════════════════════════════════════════════════════════════════════════════
# DONNÉES BRUTES (listes complètes)
# ══════════════════════════════════════════════════════════════════════════════

def get_hotels() -> list[dict]:
    return _load("hotels.json")

def get_restaurants() -> list[dict]:
    return _load("restaurants.json")

def get_plages() -> list[dict]:
    plages = _load("plages.json")
    for i, p in enumerate(plages):
        if "lat" not in p and "latitude" not in p:
            c = _fallback_coords(i + 400)
            p["lat"] = c[0]
            p["lng"] = c[1]
    return plages

def get_musees() -> list[dict]:
    return _load("musees.json")

def get_activites() -> list[dict]:
    acts = _load("activites.json")
    for i, a in enumerate(acts):
        if "lat" not in a and "latitude" not in a:
            c = _fallback_coords(i + 500)
            a["lat"] = c[0]
            a["lng"] = c[1]
    return acts

def get_bus_stops() -> list[dict]:
    """Lit stops.geojson et retourne une liste de dicts avec lat/lng."""
    geojson = _load_geojson("stops.geojson")
    result = []
    for i, feature in enumerate(geojson.get("features", [])):
        props = feature.get("properties", {})
        geom  = feature.get("geometry", {})
        coords = geom.get("coordinates", []) if geom else []
        
        if not coords or len(coords) < 2:
            continue
        
        lon, lat = float(coords[0]), float(coords[1])
        if not lat or not lon:
            continue

        # Parser les lignes depuis local_ref: "L3-L7-L9A" → ["L3","L7","L9A"]
        local_ref = props.get("local_ref", "")
        lines = [l.strip() for l in local_ref.replace(",", "-").split("-") 
                 if l.strip()] if local_ref else []

        result.append({
            "id":        props.get("@id") or feature.get("id") or i,
            "nom":       props.get("name") or f"Arrêt {i+1}",
            "latitude":  lat,
            "longitude": lon,
            "lat":       lat,
            "lng":       lon,
            "lignes":    lines,
            "network":   props.get("network", "ISSAL TANGER"),
            "operateur": props.get("operator", "ISSAL"),
            "horaires":  "06:00 - 22:30",
            "type":      "bus",
        })
    return result

def get_evenements() -> list[dict]:
    return _load("evenements.json")


def get_lieux() -> list[dict]:
    """Liste brute des lieux touristiques."""
    return _load("lieux_touristiques.json")


def get_transports() -> list[dict]:
    """Liste brute des options de transport. Ajoute un champ `price_display`
    normalisé pour l'affichage frontal.
    """
    transports = _load("transports.json")

    # Prix par défaut pour certains types lorsque l'information détaillée
    # manque dans la source.
    TYPE_PRICE_OVERRIDES = {
        "bus": "4 MAD",
        "petit_taxi": "Selon la distance (environ 10 à 50 MAD)",
        "grand_taxi": "5 à 10 MAD par place",
        "train": "Selon la destination (à partir de 49 MAD)",
        "tgv": "Selon la destination (à partir de 49 MAD)",
        "ferry": "À partir de 300 MAD",
        "vtc": "Selon la distance (environ 15 à 80 MAD)",
        "navette_aeroport": "40 MAD",
        "location_voiture": "250 à 500 MAD / jour",
    }

    result = []
    for t in transports:
        # Prefer explicit textual note provided in dataset
        note = t.get("tarif_note") or t.get("tarif_note_mad") or t.get("tarif_note_fr")
        base = t.get("tarif_base_mad") or t.get("tarif_base") or t.get("tarif")
        maxp = t.get("tarif_max_mad") or t.get("tarif_max")

        # First prefer explicit note, then developer overrides by type,
        # then numeric base/max values.
        price_display = None
        if note:
            price_display = str(note)
        else:
            ttype = (t.get("type") or "").lower()
            override = TYPE_PRICE_OVERRIDES.get(ttype)
            if override:
                price_display = override
            elif base is not None and maxp is not None:
                # Use a French-friendly range separator 'à' to avoid encoding issues
                try:
                    price_display = f"{int(base)} à {int(maxp)} MAD"
                except Exception:
                    price_display = f"{base} à {maxp} MAD"
            elif base is not None:
                price_display = f"{base} MAD"

        if price_display:
            t["price_display"] = price_display

        result.append(t)

    return result


def get_charts_lieux_par_categorie() -> list[dict]:
    """Retourne la distribution des lieux par catégorie (pour les charts)."""
    counts: dict[str, int] = {}
    for l in _load("lieux_touristiques.json"):
        cat = l.get("categorie") or l.get("category") or l.get("type") or "Autre"
        counts[cat] = counts.get(cat, 0) + 1
    return [{"name": k, "value": v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]

def get_charts_hotels_par_etoiles() -> list[dict]:
    """Retourne les hôtels groupés par étoiles avec count ET avgPrice.
    Gère le format "5_etoiles", "4_etoiles", etc. du champ 'categorie'.
    """
    hotels = _load("hotels.json")

    star_map: dict[int, dict] = {
        s: {"count": 0, "total_price": 0.0} for s in range(1, 6)
    }

    def _extract_stars(h: dict) -> int:
        # Format principal : categorie = "5_etoiles", "4_etoiles", etc.
        cat = str(h.get("categorie") or "").lower().strip()
        if "_etoiles" in cat:
            try:
                return int(cat.replace("_etoiles", "").replace("etoiles", "").strip())
            except ValueError:
                pass
        # Fallback : autres champs numériques
        for field in ("etoiles", "stars", "nb_etoiles", "classement"):
            val = h.get(field)
            if val is not None:
                try:
                    return int(float(str(val).replace("★", "").strip()))
                except (ValueError, TypeError):
                    pass
        return 0

    for h in hotels:
        stars_int = _extract_stars(h)
        if stars_int < 1 or stars_int > 5:
            continue

        star_map[stars_int]["count"] += 1

        prix = _parse_price(
            h.get("prix_nuit_min_mad") or h.get("prix_nuit_max_mad") or
            h.get("prix_min") or h.get("prix") or h.get("price") or
            h.get("tarif") or 0
        )
        if prix > 0:
            star_map[stars_int]["total_price"] += prix

    result = []
    for s in range(1, 6):
        entry = star_map[s]
        count = entry["count"]
        avg_price = round(entry["total_price"] / count) if count > 0 else 0
        result.append({
            "name":     f"{s}★",
            "stars":    s,
            "count":    count,
            "avgPrice": avg_price,
            "value":    count,
        })
    return result

def get_charts_visiteurs_par_lieu() -> list[dict]:
    result = []
    for l in _load("lieux_touristiques.json"):
        vis = int(l.get("visiteurs_annuels") or l.get("visiteurs") or 50_000)
        result.append({"name": _name(l)[:20], "visiteurs": vis})
    return sorted(result, key=lambda x: -x["visiteurs"])[:10]


def get_charts_prix_hotels() -> list[dict]:
    result = []
    for h in _load("hotels.json"):
        prix_min = _parse_price(h.get("prix_min") or h.get("price") or h.get("prix") or 0)
        prix_max = _parse_price(h.get("prix_max") or prix_min * 1.5)
        if prix_min > 0:
            result.append({
                "name": _name(h)[:18],
                "prix_min": round(prix_min),
                "prix_max": round(prix_max),
            })
    return result[:10]


def get_charts_restaurants_par_cuisine() -> list[dict]:
    counts: dict[str, int] = {}
    for r in _load("restaurants.json"):
        cuis = r.get("cuisine") or r.get("type_cuisine") or r.get("type") or "Autre"
        counts[cuis] = counts.get(cuis, 0) + 1
    return [{"name": k, "value": v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]


def get_charts_activites_par_saison() -> list[dict]:
    seasons = {"Printemps": 0, "Été": 0, "Automne": 0, "Hiver": 0}
    keywords = {
        "Printemps": ["printemps", "mars", "avril", "mai", "spring"],
        "Été":       ["été", "juin", "juillet", "août", "summer", "ete"],
        "Automne":   ["automne", "septembre", "octobre", "novembre", "autumn"],
        "Hiver":     ["hiver", "décembre", "janvier", "février", "winter"],
    }
    for a in _load("activites.json"):
        text = (str(a.get("saison", "")) + " " + str(a.get("description", ""))).lower()
        matched = False
        for saison, kws in keywords.items():
            if any(k in text for k in kws):
                seasons[saison] += 1
                matched = True
                break
        if not matched:
            seasons["Été"] += 1
    return [{"name": k, "value": v} for k, v in seasons.items()]


def get_charts_budget_activites() -> list[dict]:
    result = [
        {"name": _name(a)[:20], "prix": round(_parse_price(a.get("price") or a.get("prix") or 0))}
        for a in _load("activites.json")
    ]
    return sorted([r for r in result if r["prix"] > 0], key=lambda x: -x["prix"])[:10]


def get_charts_evenements_par_type() -> list[dict]:
    counts: dict[str, int] = {}
    for e in _load("evenements.json"):
        typ = e.get("type") or e.get("categorie") or e.get("category") or "Autre"
        counts[typ] = counts.get(typ, 0) + 1
    return [{"name": k, "value": v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]


# ══════════════════════════════════════════════════════════════════════════════
# MAP  →  /api/dashboard/map/*
# ══════════════════════════════════════════════════════════════════════════════

def get_map_lieux() -> list[dict]:
    result = []
    for i, l in enumerate(_load("lieux_touristiques.json")):
        c = _coords(l) or _fallback_coords(i)
        result.append({
            "id":          l.get("id") or i,
            "nom":         _name(l),
            "lat":         c[0],
            "lng":         c[1],
            "categorie":   l.get("categorie") or l.get("category") or l.get("type") or "",
            "visiteurs":   int(l.get("visiteurs_annuels") or l.get("visiteurs") or 0),
            "description": (l.get("description") or l.get("description_fr") or "")[:120],
            "image":       l.get("image") or l.get("image_url") or l.get("photo") or "",
        })
    return result


def get_map_hotels() -> list[dict]:
    result = []
    for i, h in enumerate(_load("hotels.json")):
        c = _coords(h) or _fallback_coords(i + 100)
        result.append({
            "id":       h.get("id") or i,
            "nom":      _name(h),
            "lat":      c[0],
            "lng":      c[1],
            "etoiles":  int(h.get("etoiles") or h.get("stars") or 0),
            "prix_min": round(_parse_price(h.get("prix_min") or h.get("price") or h.get("prix"))),
            "note":     _parse_rating(h.get("note") or h.get("rating")),
            "image":    h.get("image") or h.get("image_url") or h.get("photo") or "",
        })
    return result


def get_map_restaurants() -> list[dict]:
    result = []
    for i, r in enumerate(_load("restaurants.json")):
        c = _coords(r) or _fallback_coords(i + 200)
        result.append({
            "id":        r.get("id") or i,
            "nom":       _name(r),
            "lat":       c[0],
            "lng":       c[1],
            "cuisine":   r.get("cuisine") or r.get("type_cuisine") or r.get("type") or "",
            "note":      _parse_rating(r.get("rating") or r.get("note")),
            "prix_moyen": round(_parse_price(r.get("prix_moyen") or r.get("prix") or 0)),
            "image":     r.get("image") or r.get("image_url") or r.get("photo") or "",
        })
    return result


def get_map_services() -> list[dict]:
    result = []
    for i, s in enumerate(_load("services_urgence.json")):
        c = _coords(s) or _fallback_coords(i + 300)
        result.append({
            "id":        s.get("id") or i,
            "nom":       s.get("nom") or s.get("name") or s.get("service") or "Service",
            "lat":       c[0],
            "lng":       c[1],
            "type":      s.get("type") or s.get("categorie") or "urgence",
            "telephone": s.get("telephone") or s.get("phone") or s.get("tel") or "—",
            "adresse":   s.get("adresse") or s.get("address") or "",
        })
    return result


# ══════════════════════════════════════════════════════════════════════════════
# AI INSIGHTS  →  /api/dashboard/ai-insights
# ══════════════════════════════════════════════════════════════════════════════

def get_ai_insights() -> list[dict]:
    lieux       = _load("lieux_touristiques.json")
    restaurants = _load("restaurants.json")
    activites   = _load("activites.json")
    hotels      = _load("hotels.json")
    plages      = _load("plages.json")

    best_rest  = max(restaurants, key=lambda r: _parse_rating(r.get("rating") or r.get("note") or 0), default={})
    free_count = sum(1 for a in activites if _parse_price(a.get("price") or a.get("prix") or 0) == 0)
    cheapest   = min(hotels, key=lambda h: _parse_price(h.get("prix_min") or h.get("price") or h.get("prix") or 9999), default={})
    top_lieu   = max(lieux, key=lambda l: int(l.get("visiteurs_annuels") or l.get("visiteurs") or 0), default={})

    return [
        {
            "icone": "🏆", "titre": "Destination Phare", "priorite": "haute",
            "contenu": f"Tanger compte {len(lieux)} sites touristiques. "
                       f"{'Site le plus visité : ' + _name(top_lieu) + '.' if top_lieu else ''} "
                       "La Médina, Cap Spartel et les Grottes d'Hercule attirent le plus de visiteurs.",
        },
        {
            "icone": "🍽️", "titre": "Gastronomie Locale", "priorite": "moyenne",
            "contenu": f"Avec {len(restaurants)} restaurants répertoriés. "
                       f"{'Meilleur établissement : ' + _name(best_rest) + '.' if best_rest else ''} "
                       "La cuisine marocaine traditionnelle domine l'offre.",
        },
        {
            "icone": "🎯", "titre": "Activités & Loisirs", "priorite": "moyenne",
            "contenu": f"{len(activites)} activités disponibles dont {free_count} gratuites. "
                       "Surf, randonnées, visites guidées et excursions culturelles sont les plus populaires.",
        },
        {
            "icone": "🏨", "titre": "Hébergement", "priorite": "haute",
            "contenu": f"{len(hotels)} hôtels disponibles. "
                       f"{'Option la plus abordable : ' + _name(cheapest) + '.' if cheapest else ''} "
                       "Réservez à l'avance pour la haute saison (juillet–août).",
        },
        {
            "icone": "🏖️", "titre": "Plages & Côte", "priorite": "basse",
            "contenu": f"{len(plages)} plages répertoriées. "
                       "Malabata, Rmilat et Achakkar sont idéales pour la baignade et les sports nautiques.",
        },
        {
            "icone": "🌅", "titre": "Meilleure Période", "priorite": "basse",
            "contenu": "Avril–juin et septembre–octobre offrent le meilleur climat (20–26°C). "
                       "Tarifs réduits et peu de touristes hors saison.",
        },
    ]


# ══════════════════════════════════════════════════════════════════════════════
# TRANSPORT  →  /api/dashboard/transport
# ══════════════════════════════════════════════════════════════════════════════

def get_transport() -> dict[str, Any]:
    transports = _load("transports.json")
    types: dict[str, int] = {}
    prix_par_type: dict[str, list[float]] = {}
    for t in transports:
        typ = t.get("type") or t.get("Type") or t.get("mode") or "Autre"
        types[typ] = types.get(typ, 0) + 1
        prix = _parse_price(t.get("prix") or t.get("price") or t.get("tarif") or 0)
        if prix > 0:
            prix_par_type.setdefault(typ, []).append(prix)
    prix_moyen = {k: round(sum(v)/len(v), 1) for k, v in prix_par_type.items()}
    return {
        "total_options":       len(transports),
        "types_disponibles":   types,
        "prix_moyen_par_type": prix_moyen,
        "transports":          transports,
    }


# ══════════════════════════════════════════════════════════════════════════════
# FAQ  →  /api/dashboard/faq
# ══════════════════════════════════════════════════════════════════════════════

def get_faq(filter_ids: Optional[list[str]] = None) -> list[dict]:
    """Retourne la liste des FAQ normalisées.

    Si `filter_ids` est fourni (liste de str), ne renvoie que les entrées
    dont l'`id` correspond à l'une des valeurs demandées.
    """
    items = _load("faq_part1.json")

    # Build a mapping id -> first occurrence to remove duplicates while
    # preserving the first seen value from the dataset.
    by_id: dict[str, dict] = {}
    for i, item in enumerate(items):
        orig_id = item.get("id") or item.get("ID") or item.get("Id")
        if orig_id is not None:
            orig_id = str(orig_id)
        else:
            orig_id = f"faq_{i+1:03d}"

        q = (
            item.get("question") or item.get("Question") or
            item.get("question_fr") or item.get("question_en") or
            item.get("q") or item.get("titre") or ""
        )
        r = (
            item.get("reponse") or item.get("réponse") or item.get("reponse_fr") or
            item.get("reponse_en") or item.get("Réponse") or
            item.get("answer") or item.get("response") or item.get("a") or
            item.get("contenu") or ""
        )

        if not q:
            continue

        # keep only the first occurrence for a given id
        if orig_id not in by_id:
            by_id[orig_id] = {"id": orig_id, "question": q, "reponse": r}

    if filter_ids is None:
        # preserve dataset order: iterate original list and pick unique ids
        seen = set()
        result: list[dict] = []
        for i, item in enumerate(items):
            orig_id = item.get("id") or item.get("ID") or item.get("Id")
            if orig_id is not None:
                orig_id = str(orig_id)
            else:
                orig_id = f"faq_{i+1:03d}"
            if orig_id in seen:
                continue
            seen.add(orig_id)
            if orig_id in by_id:
                result.append(by_id[orig_id])
        return result

    # If filter_ids provided, return in the same order as requested,
    # including only ids that exist in the dataset (duplicates removed).
    ordered: list[dict] = []
    for fid in filter_ids:
        if fid in by_id:
            ordered.append(by_id[fid])
    return ordered


# ══════════════════════════════════════════════════════════════════════════════
# SERVICES D'URGENCE  →  /api/dashboard/services-urgence
# ══════════════════════════════════════════════════════════════════════════════

def get_services_urgence() -> list[dict]:
    result = []
    for i, s in enumerate(_load("services_urgence.json")):
        result.append({
            "id":        i,
            "nom":       s.get("nom") or s.get("name") or s.get("service") or "Service",
            "type":      s.get("type") or s.get("categorie") or "urgence",
            "telephone": s.get("telephone") or s.get("phone") or s.get("tel") or "—",
            "adresse":   s.get("adresse") or s.get("address") or s.get("location") or "",
        })
    return result


# ══════════════════════════════════════════════════════════════════════════════
# ASSURANCES  →  /api/dashboard/assurances
# ══════════════════════════════════════════════════════════════════════════════

def get_assurances() -> list[dict]:
    result = []
    for i, a in enumerate(_load("assurances.json")):
        result.append({
            "id":          i,
            "nom":         _name(a),
            "operateur":   a.get("operateur") or a.get("operator") or a.get("compagnie") or "",
            "description": a.get("description") or a.get("couverture") or a.get("coverage") or "",
            "prix_annuel": round(_parse_price(a.get("prix_annuel") or a.get("prix") or a.get("price") or 0)),
            "telephone":   a.get("telephone") or a.get("phone") or a.get("contact") or "",
            "duree":       a.get("duree") or a.get("duration") or a.get("validite") or "",
        })
    return result


# ══════════════════════════════════════════════════════════════════════════════
# ITINÉRAIRES  →  /api/dashboard/itineraries
# ══════════════════════════════════════════════════════════════════════════════

def get_itineraries() -> list[dict]:
    result = []
    for it in _load("itineraires.json"):
        result.append({
            "nom":         _name(it),
            "duree":       it.get("duree") or it.get("duration") or "",
            "etapes":      it.get("etapes") or it.get("steps") or it.get("lieux") or [],
            "description": it.get("description") or "",
            "niveau":      it.get("niveau") or it.get("difficulty") or "Facile",
        })
    return result


# ══════════════════════════════════════════════════════════════════════════════
# OVERVIEW COMPLET  →  /api/dashboard/overview
# ══════════════════════════════════════════════════════════════════════════════

def get_full_overview() -> dict[str, Any]:
    return {
        "statistics":  get_statistics(),
        "kpi":         get_kpis(),
        "emergency":   get_services_urgence(),
        "insurances":  get_assurances(),
        "faq":         get_faq(),
        "itineraries": get_itineraries(),
    }


# ══════════════════════════════════════════════════════════════════════════════
# BUS GEOJSON  →  /api/dashboard/bus-routes  &  /api/dashboard/bus-stops-geojson
# ══════════════════════════════════════════════════════════════════════════════

def get_bus_routes_geojson() -> dict:
    """Renvoie le GeoJSON des lignes de bus (routes.geojson)."""
    data = _load_geojson("routes.geojson")
    # Enrichir chaque feature avec une couleur selon le ref de ligne
    line_colors = {
        "L1": "#e74c3c", "L1B": "#c0392b", "L2": "#3498db", "L2A": "#2980b9",
        "L3": "#2ecc71", "L4": "#27ae60", "L5": "#f39c12", "L6": "#e67e22",
        "L7": "#9b59b6", "L8": "#8e44ad", "L9A": "#1abc9c", "L10": "#16a085",
        "L11": "#d35400", "L12": "#c0392b", "L13": "#2c3e50", "L14": "#7f8c8d",
        "L15": "#f1c40f", "L16": "#e74c3c", "L17": "#3498db", "L18": "#2ecc71",
        "L19": "#9b59b6", "L20": "#1abc9c", "L21": "#e67e22", "L22": "#f39c12",
        "L23": "#27ae60", "L26": "#8e44ad", "L27": "#16a085", "L30": "#c0392b",
        "LI1": "#e74c3c", "LI2": "#3498db", "LI3": "#2ecc71", "LI4": "#f39c12",
        "LI5": "#9b59b6", "LI6": "#1abc9c", "LI7": "#e67e22", "LI8": "#8e44ad",
        "LI9": "#d35400", "LI10": "#2c3e50", "LI11": "#27ae60", "LI12": "#16a085",
        "LI13": "#f1c40f", "LI14": "#c0392b", "LI16": "#7f8c8d", "LI17": "#3498db",
        "LI24": "#e74c3c",
    }
    default_color = "#f97316"
    for feature in data.get("features", []):
        ref = feature.get("properties", {}).get("ref", "")
        feature["properties"]["color"] = line_colors.get(ref, default_color)
    return data


def get_bus_stops_geojson() -> dict:
    """Renvoie le GeoJSON des arrêts de bus (stops.geojson).
    Enrichit chaque arrêt avec un tableau de lignes parsé depuis local_ref.
    """
    data = _load_geojson("stops.geojson")
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        local_ref = props.get("local_ref", "")
        if local_ref:
            # local_ref = "L3-L7-L9A-L11" → ["L3", "L7", "L9A", "L11"]
            props["lines"] = [l.strip() for l in local_ref.replace(",", "-").split("-") if l.strip()]
        else:
            props["lines"] = []
        # Note par défaut (non disponible dans OSM)
        if "rating" not in props:
            props["rating"] = None
        if "reviews" not in props:
            props["reviews"] = 0
    return data