import os
import requests

BASE_URL = "https://api.opendota.com/api"
API_KEY = os.getenv("OPENDOTA_API_KEY", "").strip()
DEFAULT_HEADERS = {
    "User-Agent": "DotaAnalyzerPro/1.0"
}

def _get(url: str, params: dict | None = None, timeout: int = 10):
    merged = dict(params or {})
    if API_KEY and "api_key" not in merged:
        merged["api_key"] = API_KEY
    return requests.get(url, params=merged, headers=DEFAULT_HEADERS, timeout=timeout)

def get_player_matches(account_id: int):
    try:
        response = _get(f"{BASE_URL}/players/{account_id}/matches")
        return response.json() if response.status_code == 200 else []
    except:
        return []

def get_match(match_id: int):
    try:
        response = _get(f"{BASE_URL}/matches/{match_id}")
        return response.json() if response.status_code == 200 else None
    except:
        return None

def get_players_by_rank(limit: int = 10):
    try:
        response = _get(f"{BASE_URL}/playersByRank")
        if response.status_code != 200:
            return []
        data = response.json()
        if isinstance(data, list):
            return data[:max(1, limit)]
        if isinstance(data, dict):
            for key in ("rows", "data", "result", "players"):
                value = data.get(key)
                if isinstance(value, list):
                    return value[:max(1, limit)]
        return []
    except:
        return []

def get_players_by_rank_debug():
    try:
        response = _get(f"{BASE_URL}/playersByRank")
        status = response.status_code
        if status != 200:
            return {"status": status, "count": 0}
        data = response.json()
        if isinstance(data, list):
            return {"status": status, "count": len(data)}
        if isinstance(data, dict):
            for key in ("rows", "data", "result", "players"):
                value = data.get(key)
                if isinstance(value, list):
                    return {"status": status, "count": len(value)}
            return {"status": status, "count": 0, "keys": list(data.keys())[:10]}
        return {"status": status, "count": 0, "type": str(type(data))}
    except Exception as e:
        return {"status": None, "count": 0, "error": str(e)}

def get_pro_players():
    try:
        response = _get(f"{BASE_URL}/proPlayers")
        return response.json() if response.status_code == 200 else []
    except:
        return []

def get_pro_players_debug():
    try:
        response = _get(f"{BASE_URL}/proPlayers")
        status = response.status_code
        if status != 200:
            return {"status": status, "count": 0}
        data = response.json()
        if isinstance(data, list):
            return {"status": status, "count": len(data)}
        if isinstance(data, dict):
            return {"status": status, "count": 0, "keys": list(data.keys())[:10]}
        return {"status": status, "count": 0, "type": str(type(data))}
    except Exception as e:
        return {"status": None, "count": 0, "error": str(e)}

def get_top_pro_players(limit: int = 10):
    players = get_pro_players()
    if not isinstance(players, list):
        return []
    def _mmr(p):
        mmr = p.get("mmr_estimate")
        if isinstance(mmr, dict):
            return mmr.get("estimate") or 0
        if isinstance(mmr, (int, float)):
            return mmr
        return 0
    ranked = [p for p in players if _mmr(p) > 0]
    if ranked:
        ranked.sort(key=_mmr, reverse=True)
        return ranked[:max(1, limit)]
    return players[:max(1, limit)]

def get_hero_stats_last_days(days: int = 8):
    try:
        seconds = max(1, days) * 86400
        sql = f"""
            SELECT
                p.hero_id,
                COUNT(*) AS matches,
                SUM(CASE
                    WHEN (m.radiant_win = true AND p.player_slot < 128)
                      OR (m.radiant_win = false AND p.player_slot >= 128)
                    THEN 1 ELSE 0 END) AS wins
            FROM matches m
            JOIN player_matches p ON p.match_id = m.match_id
            WHERE m.start_time > (EXTRACT(EPOCH FROM NOW()) - {seconds})
            GROUP BY p.hero_id
        """
        response = _get(f"{BASE_URL}/explorer", params={"sql": sql}, timeout=15)
        if response.status_code != 200:
            return []
        data = response.json() or {}
        return data.get("rows", [])
    except:
        return []

def get_player(account_id: int):
    try:
        response = _get(f"{BASE_URL}/players/{account_id}")
        return response.json() if response.status_code == 200 else None
    except:
        return None

def get_player_matches_raw(account_id: int, limit: int = 100):
    try:
        response = _get(f"{BASE_URL}/players/{account_id}/matches", params={"limit": limit})
        return response.json() if response.status_code == 200 else []
    except:
        return []

def get_player_heroes(account_id: int):
    try:
        response = _get(f"{BASE_URL}/players/{account_id}/heroes")
        return response.json() if response.status_code == 200 else []
    except:
        return []

def get_player_wl(account_id: int):
    try:
        response = _get(f"{BASE_URL}/players/{account_id}/wl")
        return response.json() if response.status_code == 200 else None
    except:
        return None

def get_player_counts(account_id: int):
    try:
        response = _get(f"{BASE_URL}/players/{account_id}/counts")
        return response.json() if response.status_code == 200 else {}
    except:
        return {}
