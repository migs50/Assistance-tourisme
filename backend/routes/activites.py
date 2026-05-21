from fastapi import APIRouter, Query
import json, os

router = APIRouter()

def load_json(filename: str):
    path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    with open(path, encoding="utf-8") as f:
        return json.load(f)

@router.get("/activites")
def get_activites(
    type:   str = Query(None),
    budget: str = Query(None),
):
    data = load_json("activites.json")
    if type:   data = [a for a in data if a.get("type")   == type]
    if budget: data = [a for a in data if a.get("budget") == budget]
    return data