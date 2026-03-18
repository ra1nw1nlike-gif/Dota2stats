import requests

LEADERBOARD_URL = "https://www.dota2.com/webapi/IDOTA2Leaderboards/GetLeaderboards/v1"
DEFAULT_HEADERS = {
    "User-Agent": "DotaAnalyzerPro/1.0"
}


def _extract_entries(payload):
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("leaderboard", "result", "data"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
            if isinstance(value, dict):
                for nested in ("leaderboard", "entries", "players", "ranks", "data", "result"):
                    inner = value.get(nested)
                    if isinstance(inner, list):
                        return inner
    return []


def get_official_leaderboard(division: int, limit: int = 10):
    try:
        response = requests.get(
            LEADERBOARD_URL,
            params={"division": division},
            headers=DEFAULT_HEADERS,
            timeout=6,
        )
        if response.status_code != 200:
            return []
        data = response.json()
        entries = _extract_entries(data)
        return entries[:max(1, limit)]
    except:
        return []

def get_official_leaderboard_debug(division: int):
    try:
        response = requests.get(
            LEADERBOARD_URL,
            params={"division": division},
            headers=DEFAULT_HEADERS,
            timeout=6,
        )
        status = response.status_code
        if status != 200:
            return {"status": status, "count": 0}
        data = response.json()
        entries = _extract_entries(data)
        return {"status": status, "count": len(entries)}
    except Exception as e:
        return {"status": None, "count": 0, "error": str(e)}
