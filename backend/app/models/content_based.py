"""
Content-Based Filtering Model.
Recommends anime based on content similarity (genres, type, etc.).
"""

from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

from app.models.base_model import BaseRecommender

logger = logging.getLogger(__name__)


class ContentBasedRecommender(BaseRecommender):
    """
    Content-based filtering using TF-IDF on genres.
    """
    
    def __init__(self):
        super().__init__("Content-Based Filtering")
        self.tfidf_vectorizer = TfidfVectorizer()
        self.tfidf_matrix = None
        self.anime_ids: List[int] = []
        self.anime_id_to_idx: Dict[int, int] = {}
        self.anime_data: Dict[int, Dict] = {}
    
    def fit(self, anime_data: List[Dict]) -> 'ContentBasedRecommender':
        """
        Train the model on anime data.
        
        Args:
            anime_data: List of anime dictionaries with 'anime_id', 'genre', etc.
        
        Returns:
            Self for chaining
        """
        logger.info(f"Fitting content-based model with {len(anime_data)} anime")
        
        # Store anime data
        self.anime_ids = [a['anime_id'] for a in anime_data]
        self.anime_id_to_idx = {aid: idx for idx, aid in enumerate(self.anime_ids)}
        self.anime_data = {a['anime_id']: a for a in anime_data}
        
        # Create genre strings for TF-IDF
        genre_strings = []
        for anime in anime_data:
            genres = anime.get('genre', [])
            if isinstance(genres, list):
                genre_str = ' '.join(genres)
            else:
                genre_str = str(genres) if genres else ''
            genre_strings.append(genre_str)
        
        # Fit TF-IDF
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(genre_strings)
        
        self.is_fitted = True
        logger.info("Content-based model fitted successfully")
        
        return self
    
    def get_similar_anime(self, anime_id: int, n: int = 10) -> List[int]:
        """
        Get anime similar to a given anime.
        
        Args:
            anime_id: Source anime ID
            n: Number of similar anime to return
        
        Returns:
            List of similar anime IDs
        """
        if not self.is_fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")
        
        if anime_id not in self.anime_id_to_idx:
            return []
        
        idx = self.anime_id_to_idx[anime_id]
        
        # Sử dụng getrow() để giữ sparse format - hiệu quả hơn
        anime_vector = self.tfidf_matrix.getrow(idx)
        similarities = cosine_similarity(anime_vector, self.tfidf_matrix).ravel()
        
        # Get top N similar (excluding self)
        similar_indices = similarities.argsort()[::-1][1:n+1]
        
        return [self.anime_ids[i] for i in similar_indices]
    
    def predict(self, user_id: int, n: int = 10, liked_anime_ids: Optional[List[int]] = None) -> List[int]:
        """
        Get recommendations for a user based on their liked anime.
        
        Args:
            user_id: User ID (unused, needed for interface)
            n: Number of recommendations
            liked_anime_ids: List of anime IDs the user liked
        
        Returns:
            List of recommended anime IDs
        """
        if not self.is_fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")
        
        if not liked_anime_ids:
            return []
        
        # Get similar anime for each liked anime
        recommendations = {}
        for anime_id in liked_anime_ids:
            similar = self.get_similar_anime(anime_id, n=20)
            for sim_id in similar:
                if sim_id not in liked_anime_ids:
                    recommendations[sim_id] = recommendations.get(sim_id, 0) + 1
        
        # Sort by frequency and return top N
        sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        return [aid for aid, _ in sorted_recs[:n]]
    
    def predict_rating(self, user_id: int, anime_id: int) -> float:
        """
        Predict rating (not applicable for content-based).
        Returns the anime's average rating.
        """
        if anime_id in self.anime_data:
            return self.anime_data[anime_id].get('rating', 5.0)
        return 5.0
