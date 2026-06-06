#!/usr/bin/env python3
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
src = root / "data"
dst = root / "dataset"

dst.mkdir(parents=True, exist_ok=True)

files = [
    "hotels.json",
    "restaurants.json",
    "plages.json",
    "musees.json",
    "activites.json",
    "evenements.json",
    "lieux_touristiques.json",
    "transports.json",
    "itineraires.json",
    "assurances.json",
    "services_urgence.json",
    "faq_part1.json",
]

copied = 0
for f in files:
    s = src / f
    d = dst / f
    if s.exists():
        shutil.copyfile(s, d)
        print("copied:", f)
        copied += 1
    else:
        print("missing:", f)

print(f"Done. {copied}/{len(files)} files copied to {dst}")
