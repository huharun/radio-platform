from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import from_url
from .config import settings

mongo_client = None
db = None
redis = None

async def connect():
    global mongo_client, db, redis
    mongo_client = AsyncIOMotorClient(settings.mongo_url)
    db = mongo_client[settings.mongo_db]
    redis = await from_url(settings.redis_url)

    # indexes — makes lookups fast at scale
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username")
    await db.favorites.create_index([("user_id", 1), ("station_uuid", 1)], unique=True)
    await db.playlists.create_index("user_id")
    await db.playlists.create_index("public")
    await db.play_history.create_index([("user_id", 1), ("played_at", -1)])
    await db.follows.create_index([("follower_id", 1), ("following_id", 1)], unique=True)

    print("Connected to MongoDB and Redis")

async def disconnect():
    if mongo_client:
        mongo_client.close()
    if redis:
        await redis.close()
    print("🔌 Disconnected")