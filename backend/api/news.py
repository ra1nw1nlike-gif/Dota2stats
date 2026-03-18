from fastapi import APIRouter, HTTPException, Query
import requests

router = APIRouter()

STEAM_NEWS_URL = "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/"
APP_ID = 570  # Dota 2


@router.get("/news")
def get_news(count: int = Query(8, ge=1, le=50), maxlength: int = Query(500, ge=100, le=10000)):
    try:
        res = requests.get(
            STEAM_NEWS_URL,
            params={"appid": APP_ID, "count": count, "maxlength": maxlength},
            timeout=10,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"News upstream error: {exc}")

    if not res.ok:
        raise HTTPException(status_code=502, detail="News upstream error")

    return res.json()
