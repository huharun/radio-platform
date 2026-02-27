from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .db import connect, disconnect
from .config import settings
from .routes.stations import router as stations_router
from .routes.auth import router as auth_router
from .routes.favorites import router as favorites_router
from .routes.playlists import router as playlists_router
from .routes.users import router as users_router
from .routes.recommendations import router as recs_router
from .routes.stats import router as stats_router

# rate limiter — uses client IP
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(title="Radio Platform API", version="0.5.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# global error handler — never expose stack traces to users
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."}
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
    return {"status": "ok", "version": "0.5.0", "env": settings.env}