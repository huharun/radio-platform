from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
import datetime
from .auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

def get_db():
    from ..db import db
    return db

@router.get("/{username}/profile")
async def get_profile(username: str):
    db = get_db()
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(404, "User not found")
    playlists = await db.playlists.find(
        {"user_id": str(user["_id"]), "public": True}
    ).to_list(50)
    for p in playlists:
        p["id"] = str(p["_id"])
        del p["_id"]
    followers = await db.follows.count_documents({"following_id": str(user["_id"])})
    following = await db.follows.count_documents({"follower_id": str(user["_id"])})
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "followers": followers,
        "following": following,
        "playlists": playlists
    }

@router.post("/{user_id}/follow")
async def follow_user(user_id: str, me=Depends(get_current_user)):
    db = get_db()
    if user_id == me["id"]:
        raise HTTPException(400, "Cannot follow yourself")
    exists = await db.follows.find_one({"follower_id": me["id"], "following_id": user_id})
    if exists:
        return {"already": True}
    await db.follows.insert_one({
        "follower_id": me["id"],
        "following_id": user_id,
        "created_at": datetime.datetime.utcnow()
    })
    return {"following": True}

@router.delete("/{user_id}/follow")
async def unfollow_user(user_id: str, me=Depends(get_current_user)):
    db = get_db()
    await db.follows.delete_one({"follower_id": me["id"], "following_id": user_id})
    return {"unfollowed": True}