"""
Hybrid Recommendation Model.
Combines multiple recommendation approaches.
"""

from typing import List, Dict, Any, Optional
import logging

from app.models.base_model import BaseRecommender
from app.models.content_based import ContentBasedRecommender
from app.models.item_based import ItemBasedRecommender
from app.models.user_based import UserBasedRecommender

logger = logging.getLogger(__name__)


class HybridRecommender(BaseRecommender):
    """
    Hybrid recommender that combines content-based and collaborative filtering.
    """
    
    def __init__(
        self,
        content_weight: float = 0.3,
        item_cf_weight: float = 0.35,
        user_cf_weight: float = 0.35
    ):
        """
        Initialize hybrid recommender.
        
        Args:
            content_weight: Weight for content-based recommendations
            item_cf_weight: Weight for item-based CF recommendations
            user_cf_weight: Weight for user-based CF recommendations
        """
        super().__init__("Hybrid Model")
        self.content_weight = content_weight
        self.item_cf_weight = item_cf_weight
        self.user_cf_weight = user_cf_weight
        
        # Normalize weights
        total = content_weight + item_cf_weight + user_cf_weight
        self.content_weight /= total
        self.item_cf_weight /= total
        self.user_cf_weight /= total
        
        self.content_model: Optional[ContentBasedRecommender] = None
        self.item_cf_model: Optional[ItemBasedRecommender] = None
        self.user_cf_model: Optional[UserBasedRecommender] = None
        
        self.user_ratings: Dict[int, Dict[int, float]] = {}
    
    def fit(
        self,
        anime_data: List[Dict],
        ratings: List[Dict]
    ) -> 'HybridRecommender':
        """
        Train all component models.
        
        Args:
            anime_data: List of anime dictionaries
            ratings: List of rating dictionaries
        
        Returns:
            Self for chaining
        """
        logger.info("Fitting hybrid model...")
        
        # Store user ratings for content-based recommendations
        for r in ratings:
            if r['rating'] > 0:
                uid = r['user_id']
                if uid not in self.user_ratings:
                    self.user_ratings[uid] = {}
                self.user_ratings[uid][r['anime_id']] = r['rating']
        
        # Fit content-based model
        logger.info("Fitting content-based component...")
        self.content_model = ContentBasedRecommender()
        self.content_model.fit(anime_data)
        
        # Fit item-based CF
        logger.info("Fitting item-based CF component...")
        self.item_cf_model = ItemBasedRecommender()
        self.item_cf_model.fit(ratings)
        
        # Fit user-based CF
        logger.info("Fitting user-based CF component...")
        self.user_cf_model = UserBasedRecommender()
        self.user_cf_model.fit(ratings)
        
        self.is_fitted = True
        logger.info("Hybrid model fitted successfully")
        
        return self
    
    def predict(self, user_id: int, n: int = 20) -> List[int]:
        """
        Get recommendations combining all models.
        
        Args:
            user_id: User ID
            n: Number of recommendations
        
        Returns:
            List of recommended anime IDs
        """
        if not self.is_fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")
        
        # Get recommendations from each model
        recommendations = {}
        
        # Content-based recommendations
        if self.content_model and user_id in self.user_ratings:
            liked_anime = [
                aid for aid, rating in self.user_ratings[user_id].items()
                if rating >= 7
            ]
            if liked_anime:
                content_recs = self.content_model.predict(user_id, n=n * 2, liked_anime_ids=liked_anime)
                for i, anime_id in enumerate(content_recs):
                    score = self.content_weight * (1 - i / len(content_recs))
                    recommendations[anime_id] = recommendations.get(anime_id, 0) + score
        
        # Item-based CF recommendations
        if self.item_cf_model:
            try:
                item_recs = self.item_cf_model.predict(user_id, n=n * 2)
                for i, anime_id in enumerate(item_recs):
                    score = self.item_cf_weight * (1 - i / len(item_recs))
                    recommendations[anime_id] = recommendations.get(anime_id, 0) + score
            except Exception as e:
                logger.warning(f"Item-based CF failed: {e}")
        
        # User-based CF recommendations
        if self.user_cf_model:
            try:
                user_recs = self.user_cf_model.predict(user_id, n=n * 2)
                for i, anime_id in enumerate(user_recs):
                    score = self.user_cf_weight * (1 - i / len(user_recs))
                    recommendations[anime_id] = recommendations.get(anime_id, 0) + score
            except Exception as e:
                logger.warning(f"User-based CF failed: {e}")
        
        # Filter out already rated anime
        rated = set(self.user_ratings.get(user_id, {}).keys())
        recommendations = {k: v for k, v in recommendations.items() if k not in rated}
        
        # Sort by combined score
        sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        
        return [anime_id for anime_id, _ in sorted_recs[:n]]
    
    def predict_rating(self, user_id: int, anime_id: int) -> float:
        """
        Predict rating using weighted average of component models.
        """
        if not self.is_fitted:
            return 5.0
        
        predictions = []
        weights = []
        
        # Content-based prediction
        if self.content_model:
            pred = self.content_model.predict_rating(user_id, anime_id)
            predictions.append(pred)
            weights.append(self.content_weight)
        
        # Item-based CF prediction
        if self.item_cf_model:
            try:
                pred = self.item_cf_model.predict_rating(user_id, anime_id)
                predictions.append(pred)
                weights.append(self.item_cf_weight)
            except Exception:
                pass
        
        # User-based CF prediction
        if self.user_cf_model:
            try:
                pred = self.user_cf_model.predict_rating(user_id, anime_id)
                predictions.append(pred)
                weights.append(self.user_cf_weight)
            except Exception:
                pass
        
        if not predictions:
            return 5.0
        
        # Weighted average
        total_weight = sum(weights)
        return sum(p * w for p, w in zip(predictions, weights)) / total_weight
