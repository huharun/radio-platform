from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import connect, disconnect
from .config import settings
from .routes.stations import router as stations_router
from .routes.auth import router as auth_router
from .routes.favorites import router as favorites_router
from .routes.playlists import router as playlists_router
from .routes.users import router as users_router
from .routes.recommendations import router as recs_router
from .routes.stats import router as stats_router

app = FastAPI(title="Radio Platform API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect()

@app.on_event("shutdown")
async def shutdown():
    await disconnect()

app.include_router(stations_router)
app.include_router(auth_router)
app.include_router(favorites_router)
app.include_router(playlists_router)
app.include_router(users_router)
app.include_router(recs_router)
app.include_router(stats_router)

@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.env}