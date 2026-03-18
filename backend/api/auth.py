from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
import requests

router = APIRouter()

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"

@router.get("/steam/return")
def steam_return(request: Request):
    params = dict(request.query_params)
    if not params:
        return JSONResponse({"error": "Missing OpenID params"}, status_code=400)

    # Validate with Steam OpenID
    check_params = {**params, "openid.mode": "check_authentication"}
    try:
        resp = requests.post(STEAM_OPENID_URL, data=check_params, timeout=10)
        body = resp.text
        if "is_valid:true" not in body:
            return JSONResponse({"error": "OpenID validation failed"}, status_code=401)
    except Exception:
        return JSONResponse({"error": "Steam validation error"}, status_code=502)

    claimed_id = params.get("openid.claimed_id", "")
    steam_id = claimed_id.rsplit("/", 1)[-1] if claimed_id else ""
    redirect_url = f"/?auth_steam_id={steam_id}" if steam_id else "/"
    return RedirectResponse(url=redirect_url)

@router.get("/steam/profile/{steam_id}")
def steam_profile(steam_id: str):
    # OpenDota can resolve Steam profiles without needing a Steam Web API key
    try:
        account_id = None
        try:
            steam64 = int(steam_id)
            account_id = steam64 - 76561197960265728
        except Exception:
            account_id = None

        target_id = account_id if account_id and account_id > 0 else steam_id
        resp = requests.get(f"https://api.opendota.com/api/players/{target_id}", timeout=10)
        if resp.status_code != 200:
            return JSONResponse({"error": "Profile not found"}, status_code=404)
        data = resp.json() or {}
        profile = data.get("profile") or {}
        return {
            "steam_id": steam_id,
            "personaname": profile.get("personaname"),
            "avatarfull": profile.get("avatarfull"),
            "avatar": profile.get("avatarmedium") or profile.get("avatar")
        }
    except Exception:
        return JSONResponse({"error": "Profile lookup failed"}, status_code=502)
