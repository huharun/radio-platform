from fastapi import APIRouter, Depends
from .auth import get_current_user
from ..services.radio import fetch_stations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

def get_db():
    from ..db import db
    return db

@router.get("/similar/{station_uuid}")
async def similar_stations(station_uuid: str):
    """Find stations with similar tags to the given station."""
    from ..services.radio import get_station
    station = await get_station(station_uuid)
    if not station:
        return []
    tags = station.get("tags", "")
    if not tags:
        return await fetch_stations({"countrycode": station.get("countrycode", ""), "limit": 10})
    # use first tag for similarity
    first_tag = tags.split(",")[0].strip()
    return await fetch_stations({"tag": first_tag, "order": "clickcount", "reverse": True})

@router.get("/personalized")
async def personalized(user=Depends(get_current_user)):
    """Recommend based on user's favorite tags."""
    db = get_db()
    favs = await db.favorites.find({"user_id": user["id"]}).to_list(50)
    if not favs:
        return await fetch_stations({"order": "clickcount", "reverse": True})

    # collect all tags from favorites
    tag_counts: dict = {}
    for f in favs:
        name = f.get("station_name", "")
        # we don't store tags in favorites, so recommend by country
        country = f.get("station_country", "")
        if country:
            tag_counts[country] = tag_counts.get(country, 0) + 1

    # most common country
    top_country = max(tag_counts, key=tag_counts.get) if tag_counts else ""
    if top_country:
        return await fetch_stations({"countrycode": top_country, "order": "clickcount", "reverse": True})
    return await fetch_stations({"order": "clickcount", "reverse": True})

@router.get("/trending/{country_code}")
async def trending_by_country(country_code: str):
    return await fetch_stations({
        "countrycode": country_code.upper(),
        "order": "clickcount",
        "reverse": True
    })