from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_url: str = "mongodb://mongo:27017"
    mongo_db: str = "radioplatform"
    redis_url: str = "redis://redis:6379"
    secret_key: str = "dev-secret-key"

    class Config:
        env_file = ".env"

settings = Settings()