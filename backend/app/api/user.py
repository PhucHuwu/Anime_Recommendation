"""
User API endpoints.
Handles user profile, ratings, and history.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import (
    Database, Collections, 
    UserProfile, RatingCreate, RatingResponse, RatingInDB,
    UserHistoryInDB
)

router = APIRouter()


class RatingHistoryItem(BaseModel):
    """Rating history item with anime info."""
    anime_id: int
    anime_name: str
    rating: int
    genres: List[str]
    date: str


class UserProfileResponse(BaseModel):
    """Complete user profile response."""
    user_id: int
    join_date: str
    total_anime_watched: int
    total_ratings: int
    average_rating: float
    favorite_genres: List[dict]
    monthly_activity: List[dict]


class RatingHistoryResponse(BaseModel):
    """Paginated rating history."""
    items: List[RatingHistoryItem]
    total: int


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: int):
    """
    Get user profile with statistics.
    """
    try:
        db = Database.get_db()
        users_col = db[Collections.USERS]
        ratings_col = db[Collections.RATINGS]
        animes_col = db[Collections.ANIMES]
        
        # Get user
        user = await users_col.find_one({"user_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        
        # Get user ratings
        ratings_cursor = ratings_col.find({"user_id": user_id, "rating": {"$gt": 0}})
        ratings = await ratings_cursor.to_list(length=10000)
        
        total_ratings = len(ratings)
        avg_rating = sum(r["rating"] for r in ratings) / total_ratings if total_ratings > 0 else 0
        
        # Calculate genre preferences
        genre_counts = {}
        for rating in ratings:
            anime = await animes_col.find_one({"anime_id": rating["anime_id"]})
            if anime:
                for genre in anime.get("genre", []):
                    genre_counts[genre] = genre_counts.get(genre, 0) + 1
        
        total_genre_count = sum(genre_counts.values())
        favorite_genres = [
            {
                "genre": genre,
                "count": count,
                "percentage": round(count / total_genre_count * 100, 1) if total_genre_count > 0 else 0
            }
            for genre, count in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Calculate monthly activity (mock for now)
        monthly_activity = [
            {"month": "Jan", "count": 10},
            {"month": "Feb", "count": 12},
            {"month": "Mar", "count": 15},
            {"month": "Apr", "count": 8},
            {"month": "May", "count": 20},
            {"month": "Jun", "count": 14},
        ]
        
        # Format join date
        join_date = user.get("created_at", datetime.utcnow())
        if isinstance(join_date, datetime):
            join_date_str = join_date.strftime("%B %Y")
        else:
            join_date_str = "Unknown"
        
        return UserProfileResponse(
            user_id=user_id,
            join_date=join_date_str,
            total_anime_watched=total_ratings,
            total_ratings=total_ratings,
            average_rating=round(avg_rating, 1),
            favorite_genres=favorite_genres,
            monthly_activity=monthly_activity
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )


@router.get("/{user_id}/ratings", response_model=RatingHistoryResponse)
async def get_user_ratings(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = Query("recent", description="Sort by: recent or rating")
):
    """
    Get user's rating history.
    """
    try:
        db = Database.get_db()
        ratings_col = db[Collections.RATINGS]
        animes_col = db[Collections.ANIMES]
        
        # Build query
        query = {"user_id": user_id, "rating": {"$gt": 0}}
        
        # Sort
        sort_field = "timestamp" if sort == "recent" else "rating"
        sort_order = -1
        
        # Get total count
        total = await ratings_col.count_documents(query)
        
        # Get ratings
        skip = (page - 1) * page_size
        cursor = ratings_col.find(query).sort(sort_field, sort_order).skip(skip).limit(page_size)
        ratings = await cursor.to_list(length=page_size)
        
        # Build response with anime info
        items = []
        for rating in ratings:
            anime = await animes_col.find_one({"anime_id": rating["anime_id"]})
            
            timestamp = rating.get("timestamp", datetime.utcnow())
            if isinstance(timestamp, datetime):
                date_str = timestamp.strftime("%Y-%m-%d")
            else:
                date_str = "Unknown"
            
            items.append(RatingHistoryItem(
                anime_id=rating["anime_id"],
                anime_name=anime.get("name", "Unknown") if anime else "Unknown",
                rating=rating["rating"],
                genres=anime.get("genre", []) if anime else [],
                date=date_str
            ))
        
        return RatingHistoryResponse(
            items=items,
            total=total
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user ratings: {str(e)}"
        )


@router.post("/{user_id}/rate")
async def rate_anime(user_id: int, rating_data: RatingCreate):
    """
    Rate an anime.
    Creates or updates rating for the user-anime pair.
    """
    try:
        db = Database.get_db()
        ratings_col = db[Collections.RATINGS]
        animes_col = db[Collections.ANIMES]
        history_col = db[Collections.USER_HISTORY]
        
        # Verify anime exists
        anime = await animes_col.find_one({"anime_id": rating_data.anime_id})
        if not anime:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Anime {rating_data.anime_id} not found"
            )
        
        # Check if rating already exists
        existing = await ratings_col.find_one({
            "user_id": user_id,
            "anime_id": rating_data.anime_id
        })
        
        now = datetime.utcnow()
        
        if existing:
            # Update existing rating
            old_rating = existing.get("rating", 0)
            await ratings_col.update_one(
                {"_id": existing["_id"]},
                {"$set": {"rating": rating_data.rating, "timestamp": now}}
            )
            action = "updated"
        else:
            # Create new rating
            new_rating = RatingInDB(
                user_id=user_id,
                anime_id=rating_data.anime_id,
                rating=rating_data.rating,
                timestamp=now
            )
            await ratings_col.insert_one(new_rating.model_dump(by_alias=True, exclude={"id"}))
            action = "created"
            old_rating = None
        
        # Log to history
        history_entry = UserHistoryInDB(
            user_id=user_id,
            anime_id=rating_data.anime_id,
            action="rate",
            timestamp=now,
            details={"rating": rating_data.rating, "previous": old_rating}
        )
        await history_col.insert_one(history_entry.model_dump(by_alias=True, exclude={"id"}))
        
        return {
            "success": True,
            "action": action,
            "user_id": user_id,
            "anime_id": rating_data.anime_id,
            "rating": rating_data.rating
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rate anime: {str(e)}"
        )


@router.get("/{user_id}/rating/{anime_id}")
async def get_user_anime_rating(user_id: int, anime_id: int):
    """
    Get user's rating for a specific anime.
    """
    try:
        db = Database.get_db()
        ratings_col = db[Collections.RATINGS]
        
        rating = await ratings_col.find_one({
            "user_id": user_id,
            "anime_id": anime_id
        })
        
        if rating:
            return {
                "has_rated": True,
                "rating": rating["rating"],
                "timestamp": rating.get("timestamp")
            }
        else:
            return {
                "has_rated": False,
                "rating": None
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get rating: {str(e)}"
        )


@router.get("/{user_id}/history")
async def get_user_history(
    user_id: int,
    limit: int = Query(50, ge=1, le=100),
    action: Optional[str] = Query(None, description="Filter by action: view, rate, search")
):
    """
    Get user's activity history.
    """
    try:
        db = Database.get_db()
        history_col = db[Collections.USER_HISTORY]
        
        query = {"user_id": user_id}
        if action:
            query["action"] = action
        
        cursor = history_col.find(query).sort("timestamp", -1).limit(limit)
        history = await cursor.to_list(length=limit)
        
        items = []
        for h in history:
            items.append({
                "anime_id": h["anime_id"],
                "action": h["action"],
                "timestamp": h.get("timestamp"),
                "details": h.get("details", {})
            })
        
        return {"items": items, "total": len(items)}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get history: {str(e)}"
        )
