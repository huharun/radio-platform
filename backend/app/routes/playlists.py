from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
import datetime
from .auth import get_current_user

router = APIRouter(prefix="/playlists", tags=["playlists"])

def get_db():
    from ..db import db
    return db

class PlaylistBody(BaseModel):
    name: str
    description: str = ""
    public: bool = True

class AddStationBody(BaseModel):
    station_uuid: str
    station_name: str
    station_country: str
    station_favicon: str
    station_url: str

def serialize(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.get("/")
async def my_playlists(user=Depends(get_current_user)):
    db = get_db()
    playlists = await db.playlists.find({"user_id": user["id"]}).to_list(100)
    return [serialize(p) for p in playlists]

@router.get("/public")
async def public_playlists():
    db = get_db()
    playlists = await db.playlists.find({"public": True}).sort("created_at", -1).to_list(50)
    return [serialize(p) for p in playlists]

@router.get("/{playlist_id}")
async def get_playlist(playlist_id: str):
    db = get_db()
    p = await db.playlists.find_one({"_id": ObjectId(playlist_id)})
    if not p:
        raise HTTPException(404, "Playlist not found")
    return serialize(p)

@router.post("/")
async def create_playlist(body: PlaylistBody, user=Depends(get_current_user)):
    db = get_db()
    result = await db.playlists.insert_one({
        "name": body.name,
        "description": body.description,
        "public": body.public,
        "user_id": user["id"],
        "username": user["username"],
        "stations": [],
        "created_at": datetime.datetime.utcnow()
    })
    p = await db.playlists.find_one({"_id": result.inserted_id})
    return serialize(p)

@router.put("/{playlist_id}")
async def update_playlist(playlist_id: str, body: PlaylistBody, user=Depends(get_current_user)):
    db = get_db()
    p = await db.playlists.find_one({"_id": ObjectId(playlist_id)})
    if not p or p["user_id"] != user["id"]:
        raise HTTPException(403, "Not allowed")
    await db.playlists.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$set": {"name": body.name, "description": body.description, "public": body.public}}
    )
    p = await db.playlists.find_one({"_id": ObjectId(playlist_id)})
    return serialize(p)

@router.delete("/{playlist_id}")
async def delete_playlist(playlist_id: str, user=Depends(get_current_user)):
    db = get_db()
    p = await db.playlists.find_one({"_id": ObjectId(playlist_id)})
    if not p or p["user_id"] != user["id"]:
        raise HTTPException(403, "Not allowed")
    await db.playlists.delete_one({"_id": ObjectId(playlist_id)})
    return {"deleted": True}

@router.post("/{playlist_id}/stations")
async def add_station(playlist_id: str, body: AddStationBody, user=Depends(get_current_user)):
    db = get_db()
    p = await db.playlists.find_one({"_id": ObjectId(playlist_id)})
    if not p or p["user_id"] != user["id"]:
        raise HTTPException(403, "Not allowed")
    # avoid duplicates
    if any(s["station_uuid"] == body.station_uuid for s in p["stations"]):
        return {"already": True}
    await db.playlists.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$push": {"stations": body.model_dump()}}
    )
    return {"added": True}

@router.delete("/{playlist_id}/stations/{station_uuid}")
async def remove_station(playlist_id: str, station_uuid: str, user=Depends(get_current_user)):
    db = get_db()
    p = await db.playlists.find_one({"_id": ObjectId(playlist_id)})
    if not p or p["user_id"] != user["id"]:
        raise HTTPException(403, "Not allowed")
    await db.playlists.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$pull": {"stations": {"station_uuid": station_uuid}}}
    )
    return {"removed": True}