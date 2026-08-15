import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "ClimateVerse"
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./climateverse.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "climateverse-demo-secret-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
