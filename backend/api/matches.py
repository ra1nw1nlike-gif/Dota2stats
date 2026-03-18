from fastapi import APIRouter
from services.opendota import get_match, get_player
from services.analyzer import analyze_match

router = APIRouter()

@router.get("/match/{match_id}")
def match_info(match_id: int):
    match = get_match(match_id)
    if not match or "error" in match:
        return {"error": "Match not found"}

    analysis = analyze_match(match)
    
    # Збір подій
    objectives = []
    if "objectives" in match and match["objectives"]:
        for log in match["objectives"]:
            if log.get("type") in ["chat_roshan_kill", "building_kill", "chat_tormentor_kill"]:
                objectives.append({
                    "time": log.get("time", 0),
                    "type": log.get("type"),
                    "team": "Radiant" if log.get("team") == 2 else "Dire",
                    "detail": log.get("key") or log.get("type")
                })

    players_data = []
    player_cache = {}
    for p in match.get("players", []):
        account_id = p.get("account_id")
        profile = None
        if account_id:
            if account_id in player_cache:
                profile = player_cache[account_id]
            else:
                profile = get_player(account_id) or {}
                player_cache[account_id] = profile

        profile_data = (profile or {}).get("profile") or {}
        players_data.append({
            "hero_id": p["hero_id"],
            "level": p["level"],
            "kills": p["kills"],
            "deaths": p["deaths"],
            "assists": p["assists"],
            "net_worth": p.get("total_gold", 0),
            "gpm": p.get("gold_per_min"),
            "xpm": p.get("xp_per_min"),
            "last_hits": p.get("last_hits"),
            "denies": p.get("denies"),
            "hero_damage": p.get("hero_damage"),
            "tower_damage": p.get("tower_damage"),
            "hero_healing": p.get("hero_healing"),
            "items": [p.get(f"item_{i}") for i in range(6)],
            "is_radiant": p["player_slot"] < 128,
            "account_id": account_id,
            "personaname": profile_data.get("personaname") or p.get("personaname"),
            "avatar": profile_data.get("avatarmedium") or p.get("avatar"),
            "avatarfull": profile_data.get("avatarfull") or p.get("avatarfull"),
            "item_neutral": p.get("item_neutral")
        })

    return {
        "match_id": match_id,
        "radiant_win": match.get("radiant_win"),
        "duration": match.get("duration"),
        "score": {"radiant": match.get("radiant_score"), "dire": match.get("dire_score")},
        "players": players_data,
        "objectives": objectives,
        "analysis": analysis
    }
