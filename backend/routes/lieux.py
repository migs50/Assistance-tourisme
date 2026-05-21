from fastapi import APIRouter
import json, os

router = APIRouter()

def load_json(filename: str):
    path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    with open(path, encoding="utf-8") as f:
        return json.load(f)

@router.get("/lieux")
def get_lieux():
    return load_json("lieux_touristiques.json")   # ✅ corrigé