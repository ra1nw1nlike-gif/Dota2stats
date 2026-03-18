from fastapi import APIRouter
from services.opendota import (
    get_hero_stats_last_days,
    get_hero_role_rows_last_days,
    get_teams,
    get_league_matches,
    get_league_teams,
)

router = APIRouter()

@router.get("/meta/heroes")
def meta_heroes(days: int = 8):
    rows = get_hero_stats_last_days(days)
    return {"days": days, "rows": rows}

@router.get("/meta/roles")
def meta_roles(days: int = 8):
    rows = get_hero_role_rows_last_days(days)
    return {"days": days, "rows": rows}

@router.get("/teams")
def teams():
    rows = get_teams()
    result = []
    for team in rows or []:
        result.append({
            "team_id": team.get("team_id") or team.get("teamid") or team.get("id"),
            "name": team.get("name") or team.get("tag") or "Unknown team",
            "tag": team.get("tag"),
            "logo_url": team.get("logo_url") or team.get("logo") or team.get("image_url"),
        })
    return result

@router.get("/tournaments/{league_id}")
def tournament_details(league_id: int):
    matches = get_league_matches(league_id)
    teams = get_league_teams(league_id)
    team_rows = []
    for team in teams or []:
        team_rows.append({
            "team_id": team.get("team_id") or team.get("teamid") or team.get("id"),
            "name": team.get("name") or team.get("tag") or "Unknown team",
            "tag": team.get("tag"),
            "logo_url": team.get("logo_url") or team.get("logo") or team.get("image_url"),
        })
    return {
        "league_id": league_id,
        "matches": matches or [],
        "teams": team_rows,
    }
