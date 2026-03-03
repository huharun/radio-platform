from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, field_validator
from ..services.auth import hash_password, verify_password, create_token, decode_token
from ..db import get_db
from bson import ObjectId
import datetime

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        raise HTTPException(401, "Not authenticated")
    user_id = decode_token(creds.credentials)
    if not user_id:
        raise HTTPException(401, "Invalid token")
    user = await get_db().users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(401, "User not found")
    user["id"] = str(user["_id"])
    return user

class RegisterBody(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("username")
    def username_valid(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Username must be at least 2 characters")
        return v.strip()

    @field_validator("password")
    def password_valid(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class LoginBody(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(body: RegisterBody):
    db = get_db()
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(400, "Email already registered")
    result = await db.users.insert_one({
        "username": body.username,
        "email": body.email,
        "password": hash_password(body.password),
        "created_at": datetime.datetime.utcnow()
    })
    token = create_token(str(result.inserted_id))
    return {"token": token, "username": body.username, "email": body.email}

@router.post("/login")
async def login(body: LoginBody):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(str(user["_id"]))
    return {"token": token, "username": user["username"], "email": user["email"]}

@router.get("/me")
async def me(user=Depends(get_current_user)):
    return {"id": user["id"], "username": user["username"], "email": user["email"]}