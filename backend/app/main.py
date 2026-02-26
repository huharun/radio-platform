from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import connect, disconnect
from .config import settings

app = FastAPI(title="Radio Platform API", version="0.1.0")

# Allow frontend to talk to backend
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

@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.env}