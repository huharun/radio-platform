import httpx
from ..db import db
import json

RADIO_API = "https://de1.api.radio-browser.info/json"

async def get_redis():
    from ..db import redis
    return redis

async def fetch_stations(params: dict) -> list:
    cache_key = f"stations:{json.dumps(params, sort_keys=True)}"
    
    r = await get_redis()
    cached = await r.get(cache_key)
    if cached:
        return json.loads(cached)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{RADIO_API}/stations/search",
            params={**params, "limit": 50, "hidebroken": True},
            headers={"User-Agent": "RadioPlatform/1.0"}
        )
        stations = response.json()
    
    await r.setex(cache_key, 600, json.dumps(stations))
    return stations

async def get_station(station_uuid: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{RADIO_API}/stations/byuuid/{station_uuid}",
            headers={"User-Agent": "RadioPlatform/1.0"}
        )
        stations = response.json()
        return stations[0] if stations else None

async def log_play(station_uuid: str):
    async with httpx.AsyncClient() as client:
        await client.get(
            f"{RADIO_API}/url/{station_uuid}",
            headers={"User-Agent": "RadioPlatform/1.0"}
        )