from fastapi import APIRouter
from services.opendota import get_hero_stats_last_days

router = APIRouter()

@router.get("/meta/heroes")
def meta_heroes(days: int = 8):
    rows = get_hero_stats_last_days(days)
    return {"days": days, "rows": rows}
