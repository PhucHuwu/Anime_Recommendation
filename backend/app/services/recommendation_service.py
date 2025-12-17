"""
Recommendation Service.
Provides recommendation logic using various algorithms.
"""

from typing import List, Optional
import logging

from app.database import Database, Collections, AnimeResponse

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service for generating anime recommendations."""
    
    async def get_recommendations(
        self,
        user_id: int,
        n: int = 10,
        model_type: str = "hybrid"
    ) -> List[AnimeResponse]:
        """
        Get personalized recommendations for a user.
        
        Args:
            user_id: The user ID
            n: Number of recommendations to return
            model_type: Model to use (content_based, item_based, user_based, hybrid)
        
        Returns:
            List of recommended anime
        """
        db = Database.get_db()
        ratings_col = db[Collections.RATINGS]
        animes_col = db[Collections.ANIMES]
        
        # Get user's rated anime
        user_ratings = await ratings_col.find(
            {"user_id": user_id, "rating": {"$gt": 0}}
        ).to_list(length=1000)
        
        rated_anime_ids = {r["anime_id"] for r in user_ratings}
        
        if not rated_anime_ids:
            # Cold start - return popular anime
            return await self.get_popular_anime(n)
        
        # For now, use a simple content-based approach
        # Get genres from user's highly rated anime
        liked_genres = {}
        for rating in user_ratings:
            if rating["rating"] >= 7:  # Only consider anime rated 7+
                anime = await animes_col.find_one({"anime_id": rating["anime_id"]})
                if anime:
                    for genre in anime.get("genre", []):
                        liked_genres[genre] = liked_genres.get(genre, 0) + rating["rating"]
        
        if not liked_genres:
            return await self.get_popular_anime(n)
        
        # Get top genres
        top_genres = sorted(liked_genres.items(), key=lambda x: x[1], reverse=True)[:5]
        top_genre_names = [g[0] for g in top_genres]
        
        # Find anime with those genres that user hasn't rated
        pipeline = [
            {"$match": {
                "anime_id": {"$nin": list(rated_anime_ids)},
                "genre": {"$in": top_genre_names},
                "rating": {"$gte": 6.0}  # Only recommend decent anime
            }},
            {"$sort": {"rating": -1}},
            {"$limit": n}
        ]
        
        cursor = animes_col.aggregate(pipeline)
        recommendations = []
        
        async for anime in cursor:
            recommendations.append(AnimeResponse(
                id=str(anime.get("_id")),
                anime_id=anime.get("anime_id"),
                name=anime.get("name", ""),
                genre=anime.get("genre", []),
                type=anime.get("type", ""),
                episodes=anime.get("episodes", 0),
                rating=anime.get("rating", 0.0),
                members=anime.get("members", 0)
            ))
        
        # If not enough recommendations, fill with popular
        if len(recommendations) < n:
            popular = await self.get_popular_anime(n - len(recommendations))
            # Filter out already recommended
            existing_ids = {r.anime_id for r in recommendations}
            for anime in popular:
                if anime.anime_id not in existing_ids and anime.anime_id not in rated_anime_ids:
                    recommendations.append(anime)
                    if len(recommendations) >= n:
                        break
        
        return recommendations
    
    async def get_similar_anime(
        self,
        anime_id: int,
        n: int = 10
    ) -> List[AnimeResponse]:
        """
        Get anime similar to a given anime.
        Uses genre-based similarity.
        
        Args:
            anime_id: The anime ID to find similar anime for
            n: Number of similar anime to return
        
        Returns:
            List of similar anime
        """
        db = Database.get_db()
        animes_col = db[Collections.ANIMES]
        
        # Get the source anime
        source = await animes_col.find_one({"anime_id": anime_id})
        if not source:
            raise ValueError(f"Anime with id {anime_id} not found")
        
        source_genres = source.get("genre", [])
        
        if not source_genres:
            # If no genres, return popular anime
            return await self.get_popular_anime(n)
        
        # Find anime with similar genres
        pipeline = [
            {"$match": {
                "anime_id": {"$ne": anime_id},
                "genre": {"$in": source_genres}
            }},
            {"$addFields": {
                "genre_match_count": {
                    "$size": {"$setIntersection": ["$genre", source_genres]}
                }
            }},
            {"$sort": {"genre_match_count": -1, "rating": -1}},
            {"$limit": n}
        ]
        
        cursor = animes_col.aggregate(pipeline)
        similar = []
        
        async for anime in cursor:
            similar.append(AnimeResponse(
                id=str(anime.get("_id")),
                anime_id=anime.get("anime_id"),
                name=anime.get("name", ""),
                genre=anime.get("genre", []),
                type=anime.get("type", ""),
                episodes=anime.get("episodes", 0),
                rating=anime.get("rating", 0.0),
                members=anime.get("members", 0)
            ))
        
        return similar
    
    async def get_popular_anime(self, n: int = 10) -> List[AnimeResponse]:
        """
        Get popular anime based on rating and members.
        Used as fallback for cold start users.
        
        Args:
            n: Number of anime to return
        
        Returns:
            List of popular anime
        """
        db = Database.get_db()
        animes_col = db[Collections.ANIMES]
        
        # Sort by a combination of rating and popularity (members)
        cursor = animes_col.find(
            {"rating": {"$gte": 7.0}}
        ).sort([
            ("rating", -1),
            ("members", -1)
        ]).limit(n)
        
        popular = []
        async for anime in cursor:
            popular.append(AnimeResponse(
                id=str(anime.get("_id")),
                anime_id=anime.get("anime_id"),
                name=anime.get("name", ""),
                genre=anime.get("genre", []),
                type=anime.get("type", ""),
                episodes=anime.get("episodes", 0),
                rating=anime.get("rating", 0.0),
                members=anime.get("members", 0)
            ))
        
        return popular
