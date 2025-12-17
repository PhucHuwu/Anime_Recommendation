"""
Anime API endpoints.
Handles anime listing, search, and details.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from pydantic import BaseModel

from app.database import Database, Collections, AnimeResponse, AnimeDetail

router = APIRouter()


class AnimePaginatedResponse(BaseModel):
    """Paginated anime list response."""
    items: List[AnimeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


@router.get("", response_model=AnimePaginatedResponse)
async def get_anime_list(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    type: Optional[str] = Query(None, description="Filter by type (TV, Movie, OVA, etc.)"),
    sort: str = Query("rating", description="Sort by: rating, name, members"),
    order: str = Query("desc", description="Sort order: asc, desc")
):
    """
    Get paginated list of anime with optional filters.
    """
    try:
        db = Database.get_db()
        collection = db[Collections.ANIMES]
        
        # Build query filter
        query = {}
        if type:
            query["type"] = type
        
        # Build sort
        sort_field = sort if sort in ["rating", "name", "members"] else "rating"
        sort_order = -1 if order == "desc" else 1
        
        # Get total count
        total = await collection.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * page_size
        total_pages = (total + page_size - 1) // page_size
        
        # Get anime list
        cursor = collection.find(query).sort(sort_field, sort_order).skip(skip).limit(page_size)
        anime_list = await cursor.to_list(length=page_size)
        
        # Convert to response model
        items = []
        for anime in anime_list:
            items.append(AnimeResponse(
                id=str(anime.get("_id")),
                anime_id=anime.get("anime_id"),
                name=anime.get("name", ""),
                genre=anime.get("genre", []),
                type=anime.get("type", ""),
                episodes=anime.get("episodes", 0),
                rating=anime.get("rating", 0.0),
                members=anime.get("members", 0)
            ))
        
        return AnimePaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch anime: {str(e)}"
        )



@router.get("/search", response_model=List[AnimeResponse])
async def search_anime(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Maximum results")
):
    """
    Search anime by name.
    Uses regex for partial matching.
    """
    try:
        db = Database.get_db()
        collection = db[Collections.ANIMES]
        
        # Search by name (case-insensitive)
        query = {"name": {"$regex": q, "$options": "i"}}
        
        cursor = collection.find(query).sort("rating", -1).limit(limit)
        anime_list = await cursor.to_list(length=limit)
        
        results = []
        for anime in anime_list:
            results.append(AnimeResponse(
                id=str(anime.get("_id")),
                anime_id=anime.get("anime_id"),
                name=anime.get("name", ""),
                genre=anime.get("genre", []),
                type=anime.get("type", ""),
                episodes=anime.get("episodes", 0),
                rating=anime.get("rating", 0.0),
                members=anime.get("members", 0)
            ))
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.get("/top", response_model=List[AnimeResponse])
async def get_top_anime(
    n: int = Query(10, ge=1, le=100, description="Number of top anime to return"),
    by: str = Query("rating", description="Sort by: rating or members")
):
    """
    Get top anime sorted by rating or members.
    """
    try:
        db = Database.get_db()
        collection = db[Collections.ANIMES]
        
        sort_field = "rating" if by == "rating" else "members"
        
        cursor = collection.find().sort(sort_field, -1).limit(n)
        anime_list = await cursor.to_list(length=n)
        
        results = []
        for anime in anime_list:
            results.append(AnimeResponse(
                id=str(anime.get("_id")),
                anime_id=anime.get("anime_id"),
                name=anime.get("name", ""),
                genre=anime.get("genre", []),
                type=anime.get("type", ""),
                episodes=anime.get("episodes", 0),
                rating=anime.get("rating", 0.0),
                members=anime.get("members", 0)
            ))
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch top anime: {str(e)}"
        )


@router.get("/{anime_id}", response_model=AnimeDetail)
async def get_anime_detail(anime_id: int):
    """
    Get detailed information about a specific anime.
    """
    try:
        db = Database.get_db()
        collection = db[Collections.ANIMES]
        ratings_collection = db[Collections.RATINGS]
        
        # Find anime
        anime = await collection.find_one({"anime_id": anime_id})
        
        if not anime:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Anime with id {anime_id} not found"
            )
        
        # Count ratings for this anime
        rating_count = await ratings_collection.count_documents({"anime_id": anime_id})
        
        return AnimeDetail(
            id=str(anime.get("_id")),
            anime_id=anime.get("anime_id"),
            name=anime.get("name", ""),
            genre=anime.get("genre", []),
            type=anime.get("type", ""),
            episodes=anime.get("episodes", 0),
            rating=anime.get("rating", 0.0),
            members=anime.get("members", 0),
            japanese_name=anime.get("japanese_name"),
            synopsis=anime.get("synopsis"),
            status=anime.get("status"),
            aired=anime.get("aired"),
            season=anime.get("season"),
            studios=anime.get("studios", []),
            source=anime.get("source"),
            duration=anime.get("duration"),
            rating_count=rating_count
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch anime details: {str(e)}"
        )
