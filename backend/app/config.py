"""
Configuration module for the Anime Recommendation System.
Loads environment variables and provides settings for the application.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB
    mongodb_url: str = Field(default="mongodb://localhost:27017")
    mongodb_database: str = Field(default="anime_recommendation_db")
    
    # Server
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    debug: bool = Field(default=True)
    
    # CORS
    frontend_url: str = Field(default="http://localhost:3000")
    
    # Data Paths
    data_raw_path: str = Field(default="./data/raw")
    data_processed_path: str = Field(default="./data/processed")
    models_path: str = Field(default="./trained_models")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
    
    @property
    def raw_data_dir(self) -> Path:
        """Get raw data directory path."""
        path = Path(self.data_raw_path)
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    @property
    def processed_data_dir(self) -> Path:
        """Get processed data directory path."""
        path = Path(self.data_processed_path)
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    @property
    def models_dir(self) -> Path:
        """Get trained models directory path."""
        path = Path(self.models_path)
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Export settings instance
settings = get_settings()
