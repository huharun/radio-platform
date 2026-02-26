from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import from_url
from .config import settings

# These get set when the app starts
mongo_client = None
db = None
redis = None

async def connect():
    global mongo_client, db, redis
    mongo_client = AsyncIOMotorClient(settings.mongo_url)
    db = mongo_client[settings.mongo_db]
    redis = await from_url(settings.redis_url)
    print("✅ Connected to MongoDB and Redis")

async def disconnect():
    if mongo_client:
        mongo_client.close()
    if redis:
        await redis.close()
    print("🔌 Disconnected from databases")