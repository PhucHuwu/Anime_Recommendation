"""
Pydantic schemas for MongoDB documents.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    """Custom type for MongoDB ObjectId."""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")


# ============= Anime Schemas =============

class AnimeBase(BaseModel):
    """Base anime schema."""
    anime_id: int
    name: str
    genre: List[str] = []
    type: str = ""
    episodes: int = 0
    rating: float = 0.0
    members: int = 0


class AnimeInDB(AnimeBase):
    """Anime schema for database storage."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    genre_vector: Optional[List[float]] = None
    embedding: Optional[List[float]] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class AnimeResponse(AnimeBase):
    """Anime response schema for API."""
    id: Optional[str] = None
    
    class Config:
        from_attributes = True


class AnimeDetail(AnimeResponse):
    """Detailed anime response with additional fields."""
    japanese_name: Optional[str] = None
    synopsis: Optional[str] = None
    status: Optional[str] = None
    aired: Optional[str] = None
    season: Optional[str] = None
    studios: List[str] = []
    source: Optional[str] = None
    duration: Optional[str] = None
    rating_count: int = 0


# ============= Rating Schemas =============

class RatingBase(BaseModel):
    """Base rating schema."""
    user_id: int
    anime_id: int
    rating: int = Field(ge=-1, le=10)


class RatingInDB(RatingBase):
    """Rating schema for database storage."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class RatingCreate(BaseModel):
    """Schema for creating a new rating."""
    anime_id: int
    rating: int = Field(ge=1, le=10)


class RatingResponse(RatingBase):
    """Rating response schema for API."""
    timestamp: Optional[datetime] = None
    anime_name: Optional[str] = None


# ============= User Schemas =============

class UserBase(BaseModel):
    """Base user schema."""
    user_id: int


class UserInDB(UserBase):
    """User schema for database storage."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    preferences: dict = {}
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class UserProfile(UserBase):
    """User profile response schema."""
    created_at: Optional[datetime] = None
    total_ratings: int = 0
    average_rating: float = 0.0
    favorite_genres: List[dict] = []
    monthly_activity: List[dict] = []


# ============= User History Schemas =============

class UserHistoryBase(BaseModel):
    """Base user history schema."""
    user_id: int
    anime_id: int
    action: str  # "view", "rate", "search"
    details: dict = {}


class UserHistoryInDB(UserHistoryBase):
    """User history schema for database storage."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============= Model Metrics Schemas =============

class ModelMetricsBase(BaseModel):
    """Base model metrics schema."""
    model_name: str
    rmse: float = 0.0
    mae: float = 0.0
    precision_k: float = 0.0
    recall_k: float = 0.0
    f1_k: float = 0.0
    ndcg_k: float = 0.0


class ModelMetricsInDB(ModelMetricsBase):
    """Model metrics schema for database storage."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    trained_at: datetime = Field(default_factory=datetime.utcnow)
    config: dict = {}
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ModelResponse(ModelMetricsBase):
    """Model response for API."""
    trained_at: Optional[datetime] = None
    status: str = "active"
    description: Optional[str] = None


# ============= Statistics Schemas =============

class SystemStats(BaseModel):
    """System statistics schema."""
    total_users: int = 0
    total_anime: int = 0
    total_ratings: int = 0
    average_rating: float = 0.0
    active_users: int = 0
    new_users_this_month: int = 0


class GenreStats(BaseModel):
    """Genre statistics schema."""
    genre: str
    count: int
    percentage: float


class TypeStats(BaseModel):
    """Type statistics schema."""
    type: str
    count: int
    percentage: float
