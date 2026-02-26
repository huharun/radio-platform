from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import connect, disconnect
from .config import settings
from .routes.stations import router as stations_router  # ADD

app = FastAPI(title="Radio Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect()

@app.on_event("shutdown")
async def shutdown():
    await disconnect()

app.include_router(stations_router)  # ADD

@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.env}