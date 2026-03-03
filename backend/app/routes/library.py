from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from .auth import get_current_user
from ..db import get_db

router = APIRouter(tags=["library"])

class StationBody(BaseModel):
    station_uuid: str
    station_name: str
    station_country: str
    station_favicon: str
    station_url: str

@router.get("/favorites/")
async def get_favorites(user=Depends(get_current_user)):
    favs = await get_db().favorites.find({"user_id": user["id"]}).to_list(None)
    for f in favs:
        f["id"] = str(f["_id"]); del f["_id"]
    return favs

@router.post("/favorites/")
async def add_favorite(body: StationBody, user=Depends(get_current_user)):
    exists = await get_db().favorites.find_one({"user_id": user["id"], "station_uuid": body.station_uuid})
    if exists:
        return {"already": True}
    await get_db().favorites.insert_one({**body.model_dump(), "user_id": user["id"]})
    return {"saved": True}

@router.delete("/favorites/{station_uuid}")
async def remove_favorite(station_uuid: str, user=Depends(get_current_user)):
    await get_db().favorites.delete_one({"user_id": user["id"], "station_uuid": station_uuid})
    return {"removed": True}

class PlaylistBody(BaseModel):
    name: str
    description: str = ""
    public: bool = False

@router.get("/playlists/")
async def get_playlists(user=Depends(get_current_user)):
    pls = await get_db().playlists.find({"user_id": user["id"]}).to_list(None)
    for p in pls:
        p["id"] = str(p["_id"]); del p["_id"]
    return pls

@router.post("/playlists/")
async def create_playlist(body: PlaylistBody, user=Depends(get_current_user)):
    result = await get_db().playlists.insert_one({
        **body.model_dump(), "user_id": user["id"],
        "stations": [], "created_at": datetime.utcnow()
    })
    return {"id": str(result.inserted_id), **body.model_dump()}

@router.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str, user=Depends(get_current_user)):
    try:
        oid = ObjectId(playlist_id)
    except InvalidId:
        raise HTTPException(400, "Invalid ID")
    await get_db().playlists.delete_one({"_id": oid, "user_id": user["id"]})
    return {"deleted": True}

@router.post("/playlists/{playlist_id}/stations")
async def add_to_playlist(playlist_id: str, body: StationBody, user=Depends(get_current_user)):
    try:
        oid = ObjectId(playlist_id)
    except InvalidId:
        raise HTTPException(400, "Invalid ID")
    await get_db().playlists.update_one(
        {"_id": oid, "user_id": user["id"]},
        {"$addToSet": {"stations": body.model_dump()}}
    )
    return {"added": True}

@router.delete("/playlists/{playlist_id}/stations/{station_uuid}")
async def remove_from_playlist(playlist_id: str, station_uuid: str, user=Depends(get_current_user)):
    try:
        oid = ObjectId(playlist_id)
    except InvalidId:
        raise HTTPException(400, "Invalid ID")
    await get_db().playlists.update_one(
        {"_id": oid, "user_id": user["id"]},
        {"$pull": {"stations": {"station_uuid": station_uuid}}}
    )
    return {"removed": True}

@router.post("/stats/play")
async def log_play(
    station_uuid: str = Query(...),
    station_name: str = Query(...),
    station_country: str = Query(...),
    user=Depends(get_current_user)
):
    await get_db().play_history.insert_one({
        "user_id": user["id"],
        "station_uuid": station_uuid,
        "station_name": station_name,
        "station_country": station_country,
        "played_at": datetime.utcnow()
    })
    return {"logged": True}

@router.get("/stats/me")
async def my_stats(user=Depends(get_current_user)):
    history = await get_db().play_history.find(
        {"user_id": user["id"]}
    ).sort("played_at", -1).to_list(None)

    station_counts: dict = {}
    country_counts: dict = {}
    for h in history:
        uuid = h["station_uuid"]
        if uuid not in station_counts:
            station_counts[uuid] = {
                "station_uuid": uuid,
                "station_name": h["station_name"],
                "station_country": h["station_country"],
                "plays": 0
            }
        station_counts[uuid]["plays"] += 1
        c = h.get("station_country", "Unknown")
        country_counts[c] = country_counts.get(c, 0) + 1

    top_stations = sorted(station_counts.values(), key=lambda x: x["plays"], reverse=True)[:10]
    top_countries = sorted(
        [{"country": c, "plays": n} for c, n in country_counts.items()],
        key=lambda x: x["plays"], reverse=True
    )[:5]

    seen: set = set()
    recent = []
    for h in history:
        if h["station_uuid"] not in seen:
            seen.add(h["station_uuid"])
            recent.append({
                "station_uuid": h["station_uuid"],
                "station_name": h["station_name"],
                "station_country": h["station_country"],
                "played_at": h["played_at"].isoformat()
            })
        if len(recent) >= 20:
            break

    return {
        "total_plays": len(history),
        "unique_stations": len(station_counts),
        "top_stations": top_stations,
        "top_countries": top_countries,
        "recent": recent
    }