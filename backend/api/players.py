from fastapi import APIRouter
from services.opendota import (
    get_player_matches,
    get_players_by_rank,
    get_top_pro_players,
    get_players_by_rank_debug,
    get_pro_players_debug,
    get_player,
    get_player_matches_raw,
    get_player_heroes,
    get_player_wl,
    get_player_counts,
)
from services.leaderboards import get_official_leaderboard, get_official_leaderboard_debug
from datetime import datetime, timedelta
import time
from urllib.parse import urlparse
import xml.etree.ElementTree as ET
import requests
import re

router = APIRouter()

@router.get("/player/{account_id}")
def player_matches(account_id: int):
    # Конвертація SteamID64 в Account ID, якщо число занадто велике
    if account_id > 4294967295:
        account_id = account_id - 76561197960265728
    
    matches = get_player_matches(account_id)
    if not matches:
        return []

    result = []
    for match in matches[:10]:
        is_radiant = match["player_slot"] < 128
        won = (is_radiant and match["radiant_win"]) or (not is_radiant and not match["radiant_win"])

        result.append({
            "match_id": match["match_id"],
            "hero_id": match["hero_id"],
            "kills": match["kills"],
            "deaths": match["deaths"],
            "assists": match["assists"],
            "duration": match["duration"],
            "win": won
        })
    return result

@router.get("/top-players")
def top_players(limit: int = 10, region: str | None = None, debug: int = 0):
    debug_info = {"sources": []}
    players = get_players_by_rank(limit)
    debug_info["sources"].append({
        "source": "opendota_playersByRank",
        "count": len(players) if isinstance(players, list) else 0,
        "meta": get_players_by_rank_debug() if debug else None,
    })
    # Official fallback (defaults to Europe if region not provided).
    if not players:
        region_map = {
            "americas": 0,
            "america": 0,
            "na": 0,
            "europe": 1,
            "eu": 1,
            "sea": 2,
            "seasia": 2,
            "southeastasia": 2,
            "china": 3,
            "cn": 3,
        }
        if region:
            div = region_map.get(region.lower().replace(" ", ""))
        else:
            div = 1
        if div is not None:
            players = get_official_leaderboard(div, limit)
        debug_info["sources"].append({
            "source": "dota2_leaderboards",
            "division": div,
            "count": len(players) if isinstance(players, list) else 0,
            "meta": get_official_leaderboard_debug(div) if debug else None,
        })
    if not players:
        players = get_top_pro_players(limit)
        debug_info["sources"].append({
            "source": "opendota_proPlayers",
            "count": len(players) if isinstance(players, list) else 0,
            "meta": get_pro_players_debug() if debug else None,
        })

    result = []
    for p in players or []:
        name = (
            p.get("personaname")
            or p.get("name")
            or p.get("player_name")
            or p.get("pro_name")
        )
        team_tag = p.get("team_tag") or p.get("team")
        if team_tag and name and not name.startswith(team_tag):
            name = f"{team_tag} {name}"
        result.append({
            "account_id": p.get("account_id") or p.get("steamid") or p.get("steam_id"),
            "personaname": name,
            "score": p.get("score") or p.get("rating") or p.get("mmr") or (p.get("mmr_estimate", {}) or {}).get("estimate"),
            "rank_tier": p.get("rank_tier"),
            "leaderboard_rank": p.get("leaderboard_rank") or p.get("rank")
        })
    if debug and not result:
        return {"error": "no_data", "debug": debug_info}
    return result

def _win_from_match(m):
    try:
        slot = m.get("player_slot")
        radiant_win = m.get("radiant_win")
        if slot is None or radiant_win is None:
            return None
        is_radiant = slot < 128
        return (is_radiant and radiant_win) or ((not is_radiant) and (not radiant_win))
    except:
        return None

def _build_activity(matches, days: int = 84, tz_offset_minutes: int = 0):
    offset_seconds = tz_offset_minutes * 60
    now = int(time.time()) + offset_seconds
    start_ts = now - days * 86400
    daily = {}
    for m in matches or []:
        ts = m.get("start_time")
        if not ts:
            continue
        ts_local = ts + offset_seconds
        if ts_local < start_ts:
            continue
        day = datetime.utcfromtimestamp(ts_local).date().isoformat()
        win = _win_from_match(m)
        if day not in daily:
            daily[day] = {"wins": 0, "losses": 0}
        if win is True:
            daily[day]["wins"] += 1
        elif win is False:
            daily[day]["losses"] += 1
    start_date = datetime.utcfromtimestamp(start_ts).date()
    weeks = []
    max_count = 0
    for w in range(days // 7):
        week = []
        for d in range(7):
            cur = start_date + timedelta(days=w * 7 + d)
            key = cur.isoformat()
            wins = daily.get(key, {}).get("wins", 0)
            losses = daily.get(key, {}).get("losses", 0)
            count = wins + losses
            max_count = max(max_count, count)
            week.append({"date": key, "count": count, "wins": wins, "losses": losses})
        weeks.append(week)
    return {"weeks": weeks, "max": max_count}

@router.get("/profile/{account_id}")
def profile(account_id: int, tz_offset: int = 0):
    # SteamID64 to account id
    if account_id > 4294967295:
        account_id = account_id - 76561197960265728
    profile = get_player(account_id) or {}
    matches = get_player_matches(account_id) or []
    recent_matches = []
    for m in matches[:10]:
        win = _win_from_match(m)
        recent_matches.append({
            **m,
            "win": True if win is True else False if win is False else None
        })
    matches_raw = get_player_matches_raw(account_id, 300) or []
    heroes = get_player_heroes(account_id) or []
    wl = get_player_wl(account_id) or {}
    counts = get_player_counts(account_id) or {}

    # Top items (from recent matches)
    item_counts = {}
    for m in matches_raw:
        for key in ("item_0", "item_1", "item_2", "item_3", "item_4", "item_5", "item_neutral"):
            item_id = m.get(key)
            if not item_id or item_id == 0:
                continue
            item_counts[item_id] = item_counts.get(item_id, 0) + 1
    top_items = [
        {"item_id": k, "count": v}
        for k, v in sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    ]

    # Trend line (wins/losses over recent matches)
    trend = []
    score = 0
    for m in sorted(matches_raw, key=lambda x: x.get("start_time", 0))[-20:]:
        win = _win_from_match(m)
        if win is True:
            score += 1
        elif win is False:
            score -= 1
        trend.append(score)

    top_heroes = []
    for h in sorted(heroes, key=lambda x: x.get("games", 0), reverse=True)[:5]:
        games = h.get("games") or 0
        win = h.get("win") or 0
        top_heroes.append({
            "hero_id": h.get("hero_id"),
            "games": games,
            "win": win,
            "winrate": round((win / games) * 100, 2) if games else 0
        })

    prof = profile.get("profile", {}) if isinstance(profile, dict) else {}
    return {
        "profile": {
            "account_id": account_id,
            "steamid": prof.get("steamid"),
            "personaname": prof.get("personaname") or prof.get("name"),
            "avatar": prof.get("avatarfull") or prof.get("avatarmedium") or prof.get("avatar"),
        },
        "recent_matches": recent_matches,
        "top_heroes": top_heroes,
        "top_items": top_items,
        "trend": trend,
        "wl": wl,
        "counts": counts,
        "activity": _build_activity(matches_raw, 84, tz_offset),
    }

def _resolve_steam_id(q: str) -> str | None:
    if not q:
        return None
    value = q.strip()

    # Direct numeric SteamID64
    if value.isdigit():
        return value

    # Support short forms like "id/vanity" or "profiles/steam64"
    short_match = re.match(r"^(id|profiles)/([^/?#]+)", value)
    if short_match:
        kind, tail = short_match.group(1), short_match.group(2)
        value = f"https://steamcommunity.com/{kind}/{tail}"

    if "steamcommunity.com" not in value:
        return None

    if not value.startswith("http"):
        value = "https://" + value.lstrip("/")

    try:
        parsed = urlparse(value)
    except Exception:
        return None

    path = (parsed.path or "").strip("/")
    parts = [p for p in path.split("/") if p]
    if len(parts) < 2:
        return None

    if parts[0] == "profiles" and parts[1].isdigit():
        return parts[1]

    if parts[0] == "id" and parts[1]:
        vanity = parts[1]
        try:
            resp = requests.get(f"https://steamcommunity.com/id/{vanity}?xml=1", timeout=10)
            if resp.status_code != 200:
                return None
            root = ET.fromstring(resp.text)
            steam64 = root.findtext("steamID64")
            if steam64 and steam64.isdigit():
                return steam64
        except Exception:
            return None

    return None

@router.get("/resolve-steam")
def resolve_steam(q: str):
    steam_id = _resolve_steam_id(q)
    if not steam_id:
        return {"error": "not_found"}
    return {"steam_id": steam_id}

