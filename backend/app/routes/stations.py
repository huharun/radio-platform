from fastapi import APIRouter, Query
from ..services.radio import fetch_stations, get_station, log_play

router = APIRouter(prefix="/stations", tags=["stations"])

@router.get("/search")
async def search_stations(
    name: str = Query(None),
    country: str = Query(None),
    tag: str = Query(None),
    language: str = Query(None),
):
    params = {}
    if name: params["name"] = name
    if country: params["countrycode"] = country
    if tag: params["tag"] = tag
    if language: params["language"] = language
    
    return await fetch_stations(params)

@router.get("/trending")
async def trending_stations():
    return await fetch_stations({"order": "clickcount", "reverse": True})

@router.get("/{station_uuid}")
async def get_station_detail(station_uuid: str):
    return await get_station(station_uuid)

@router.post("/{station_uuid}/play")
async def play_station(station_uuid: str):
    await log_play(station_uuid)
    return {"logged": True}