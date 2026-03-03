from fastapi import APIRouter, Query, HTTPException
from ..services.radio import fetch_stations, get_station, fetch_categories

router = APIRouter(prefix="/stations", tags=["stations"])

@router.get("/trending")
async def trending(limit: int = Query(100), offset: int = Query(0)):
    return await fetch_stations({
        "order": "clickcount", "reverse": "true",
        "limit": str(limit), "offset": str(offset)
    })

@router.get("/search")
async def search(
    name: str = Query(None),
    tag: str = Query(None),
    countrycode: str = Query(None),
    country: str = Query(None),
    language: str = Query(None),
    order: str = "clickcount",
    reverse: str = "true",
    limit: int = Query(100),
    offset: int = Query(0)
):
    params = {"order": order, "reverse": reverse, "limit": str(limit), "offset": str(offset)}
    if name:        params["name"]        = name
    if tag:         params["tag"]         = tag
    if countrycode: params["countrycode"] = countrycode
    if country:     params["country"]     = country
    if language:    params["language"]    = language
    return await fetch_stations(params)

@router.get("/categories/countries")
async def countries():
    return await fetch_categories("countries")

@router.get("/categories/tags")
async def tags():
    return await fetch_categories("tags")

@router.get("/categories/languages")
async def languages():
    return await fetch_categories("languages")

@router.get("/{station_uuid}")
async def station_detail(station_uuid: str):
    s = await get_station(station_uuid)
    if not s:
        raise HTTPException(404, "Station not found")
    return s