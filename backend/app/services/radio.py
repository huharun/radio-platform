import httpx
import json

RADIO_API = "https://de1.api.radio-browser.info/json"
HEADERS = {"User-Agent": "RadioPlatform/1.0"}

async def _redis():
    from ..db import redis
    return redis

async def fetch_stations(params: dict) -> list:
    cache_key = f"stations:{json.dumps(params, sort_keys=True)}"
    r = await _redis()
    cached = await r.get(cache_key)
    if cached:
        return json.loads(cached)
    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.get(
            f"{RADIO_API}/stations/search",
            params={**params, "hidebroken": "true"},
            headers=HEADERS
        )
        data = res.json()
    await r.setex(cache_key, 600, json.dumps(data))
    return data

async def get_station(uuid: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(f"{RADIO_API}/stations/byuuid/{uuid}", headers=HEADERS)
        data = res.json()
        return data[0] if data else {}

async def fetch_categories(category: str) -> list:
    cache_key = f"categories:{category}"
    r = await _redis()
    cached = await r.get(cache_key)
    if cached:
        return json.loads(cached)
    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.get(
            f"{RADIO_API}/{category}",
            params={"order": "stationcount", "reverse": "true", "limit": "500"},
            headers=HEADERS
        )
        data = res.json()
        # For countries, return both name and code so frontend can use code
        if category == "countries":
            result = [
                {"name": d["name"], "code": d.get("iso_3166_1", ""), "count": d["stationcount"]}
                for d in data if d.get("name") and int(d.get("stationcount", 0)) > 0
            ]
        else:
            result = [
                {"name": d["name"], "count": d["stationcount"]}
                for d in data if d.get("name") and int(d.get("stationcount", 0)) > 0
            ]
    await r.setex(cache_key, 3600, json.dumps(result))
    return result