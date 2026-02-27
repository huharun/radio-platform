from fastapi import APIRouter, Depends
from pydantic import BaseModel
from .auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["favorites"])

def get_db():
    from ..db import db
    return db

class FavoriteBody(BaseModel):
    station_uuid: str
    station_name: str
    station_country: str
    station_favicon: str
    station_url: str

@router.get("/")
async def get_favorites(user=Depends(get_current_user)):
    db = get_db()
    favs = await db.favorites.find({"user_id": user["id"]}).to_list(200)
    for f in favs:
        f["id"] = str(f["_id"])
        del f["_id"]
    return favs

@router.post("/")
async def add_favorite(body: FavoriteBody, user=Depends(get_current_user)):
    db = get_db()
    exists = await db.favorites.find_one({"user_id": user["id"], "station_uuid": body.station_uuid})
    if exists:
        return {"already": True}
    await db.favorites.insert_one({**body.model_dump(), "user_id": user["id"]})
    return {"saved": True}

@router.delete("/{station_uuid}")
async def remove_favorite(station_uuid: str, user=Depends(get_current_user)):
    db = get_db()
    await db.favorites.delete_one({"user_id": user["id"], "station_uuid": station_uuid})
    return {"removed": True}