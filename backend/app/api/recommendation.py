"""
Recommendation API endpoints.
Handles personalized recommendations and similar anime.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from pydantic import BaseModel

from app.database import Database, Collections, AnimeResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter()


class RecommendationResponse(BaseModel):
    """Recommendation response with source model info."""
    items: List[AnimeResponse]
    model: str
    user_id: Optional[int] = None


@router.get("", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: int = Query(..., description="User ID for personalized recommendations"),
    n: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    model: str = Query("hybrid", description="Model to use: content_based, item_based, user_based, hybrid")
):
    """
    Get personalized anime recommendations for a user.
    Uses the specified recommendation model.
    """
    try:
        service = RecommendationService()
        recommendations = await service.get_recommendations(
            user_id=user_id,
            n=n,
            model_type=model
        )
        
        return RecommendationResponse(
            items=recommendations,
            model=model,
            user_id=user_id
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )


@router.get("/similar/{anime_id}", response_model=RecommendationResponse)
async def get_similar_anime(
    anime_id: int,
    n: int = Query(10, ge=1, le=50, description="Number of similar anime")
):
    """
    Get anime similar to a specific anime.
    Uses content-based filtering.
    """
    try:
        service = RecommendationService()
        similar = await service.get_similar_anime(
            anime_id=anime_id,
            n=n
        )
        
        return RecommendationResponse(
            items=similar,
            model="content_based"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get similar anime: {str(e)}"
        )


@router.get("/popular", response_model=RecommendationResponse)
async def get_popular_recommendations(
    n: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get popular anime recommendations (fallback for new users).
    Uses overall popularity metrics.
    """
    try:
        service = RecommendationService()
        popular = await service.get_popular_anime(n=n)
        
        return RecommendationResponse(
            items=popular,
            model="popularity"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get popular anime: {str(e)}"
        )


@router.get("/realtime", response_model=RecommendationResponse)
async def get_realtime_recommendations(
    user_id: int = Query(..., description="User ID"),
    context_anime_id: Optional[int] = Query(None, description="Current anime being viewed"),
    n: int = Query(5, ge=1, le=20, description="Number of recommendations")
):
    """
    Get real-time recommendations based on current user context.
    Takes into account the anime currently being viewed.
    """
    try:
        service = RecommendationService()
        
        if context_anime_id:
            # Get similar to current anime
            recommendations = await service.get_similar_anime(
                anime_id=context_anime_id,
                n=n
            )
            model_used = "context_similar"
        else:
            # Get personalized recommendations
            recommendations = await service.get_recommendations(
                user_id=user_id,
                n=n,
                model_type="hybrid"
            )
            model_used = "hybrid"
        
        return RecommendationResponse(
            items=recommendations,
            model=model_used,
            user_id=user_id
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get realtime recommendations: {str(e)}"
        )
