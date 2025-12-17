"""
Database module initialization.
"""

from app.database.mongodb import Database, Collections, get_database
from app.database.schemas import (
    AnimeBase, AnimeInDB, AnimeResponse, AnimeDetail,
    RatingBase, RatingInDB, RatingCreate, RatingResponse,
    UserBase, UserInDB, UserProfile,
    UserHistoryBase, UserHistoryInDB,
    ModelMetricsBase, ModelMetricsInDB, ModelResponse,
    SystemStats, GenreStats, TypeStats
)

__all__ = [
    "Database",
    "Collections", 
    "get_database",
    "AnimeBase", "AnimeInDB", "AnimeResponse", "AnimeDetail",
    "RatingBase", "RatingInDB", "RatingCreate", "RatingResponse",
    "UserBase", "UserInDB", "UserProfile",
    "UserHistoryBase", "UserHistoryInDB",
    "ModelMetricsBase", "ModelMetricsInDB", "ModelResponse",
    "SystemStats", "GenreStats", "TypeStats"
]
