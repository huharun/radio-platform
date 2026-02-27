from fastapi import APIRouter, Depends
from .auth import get_current_user
import datetime

router = APIRouter(prefix="/stats", tags=["stats"])

def get_db():
    from ..db import db
    return db

@router.post("/play")
async def log_play(station_uuid: str, station_name: str, station_country: str, user=Depends(get_current_user)):
    db = get_db()
    await db.play_history.insert_one({
        "user_id": user["id"],
        "station_uuid": station_uuid,
        "station_name": station_name,
        "station_country": station_country,
        "played_at": datetime.datetime.utcnow()
    })
    return {"logged": True}

@router.get("/me")
async def my_stats(user=Depends(get_current_user)):
    db = get_db()
    history = await db.play_history.find(
        {"user_id": user["id"]}
    ).sort("played_at", -1).to_list(500)

    if not history:
        return {"total_plays": 0, "top_stations": [], "top_countries": [], "recent": []}

    # count plays per station
    station_counts: dict = {}
    country_counts: dict = {}
    for h in history:
        name = h["station_name"]
        country = h["station_country"]
        station_counts[name] = station_counts.get(name, 0) + 1
        country_counts[country] = country_counts.get(country, 0) + 1

    top_stations = sorted(station_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    recent = []
    seen = set()
    for h in history:
        if h["station_uuid"] not in seen:
            seen.add(h["station_uuid"])
            recent.append({
                "station_uuid": h["station_uuid"],
                "station_name": h["station_name"],
                "station_country": h["station_country"],
            })
        if len(recent) >= 10:
            break

    return {
        "total_plays": len(history),
        "top_stations": [{"name": n, "count": c} for n, c in top_stations],
        "top_countries": [{"country": c, "count": n} for c, n in top_countries],
        "recent": recent
    }