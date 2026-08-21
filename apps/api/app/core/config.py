from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "Land AI Platform"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database & Cache
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/land_ai"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    JWT_SECRET: str = "default_jwt_secret_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AI API Keys
    SARVAM_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Storage
    UPLOAD_DIR: str = "data/uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @property
    def upload_path(self) -> Path:
        """Resolve absolute path to uploads directory."""
        # Check if running from apps/api or project root
        p = Path(self.UPLOAD_DIR)
        if not p.is_absolute():
            # If relative, check root data directory
            root_candidate = Path(__file__).resolve().parent.parent.parent.parent / self.UPLOAD_DIR
            if root_candidate.parent.exists():
                return root_candidate
            return Path.cwd() / self.UPLOAD_DIR
        return p


settings = Settings()
