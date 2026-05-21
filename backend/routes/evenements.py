from fastapi import APIRouter, Query
import json, os

router = APIRouter()

def load_json(filename: str):
    path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    with open(path, encoding="utf-8") as f:
        return json.load(f)

@router.get("/evenements")
def get_evenements(
    category: str = Query(None),
):
    data = load_json("events.json")      # ✅ corrigé
    if category: data = [e for e in data if e.get("category") == category]
    return data