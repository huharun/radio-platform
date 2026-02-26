from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_url: str
    mongo_db: str
    redis_url: str
    secret_key: str
    env: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()