"""
Item-Based Collaborative Filtering Model.
Recommends anime based on item-item similarity.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
import logging

from app.models.base_model import BaseRecommender

logger = logging.getLogger(__name__)


class ItemBasedRecommender(BaseRecommender):
    """
    Item-based collaborative filtering using user-item rating matrix.
    """
    
    def __init__(self, k_neighbors: int = 20):
        super().__init__("Item-Based Collaborative Filtering")
        self.k_neighbors = k_neighbors
        self.item_similarity: np.ndarray = None
        self.rating_matrix: csr_matrix = None
        self.user_id_to_idx: Dict[int, int] = {}
        self.anime_id_to_idx: Dict[int, int] = {}
        self.idx_to_anime_id: Dict[int, int] = {}
        self.item_means: np.ndarray = None
    
    def fit(self, ratings: List[Dict]) -> 'ItemBasedRecommender':
        """
        Train the model on rating data.
        
        Args:
            ratings: List of rating dictionaries with 'user_id', 'anime_id', 'rating'
        
        Returns:
            Self for chaining
        """
        logger.info(f"Fitting item-based model with {len(ratings)} ratings")
        
        # Build user and item mappings
        users = sorted(set(r['user_id'] for r in ratings))
        items = sorted(set(r['anime_id'] for r in ratings))
        
        self.user_id_to_idx = {uid: idx for idx, uid in enumerate(users)}
        self.anime_id_to_idx = {aid: idx for idx, aid in enumerate(items)}
        self.idx_to_anime_id = {idx: aid for aid, idx in self.anime_id_to_idx.items()}
        
        n_users = len(users)
        n_items = len(items)
        
        # Build sparse rating matrix (users x items)
        row_indices = []
        col_indices = []
        values = []
        
        for r in ratings:
            if r['rating'] > 0:  # Only use actual ratings
                user_idx = self.user_id_to_idx[r['user_id']]
                item_idx = self.anime_id_to_idx[r['anime_id']]
                row_indices.append(user_idx)
                col_indices.append(item_idx)
                values.append(r['rating'])
        
        self.rating_matrix = csr_matrix(
            (values, (row_indices, col_indices)),
            shape=(n_users, n_items)
        )
        
        logger.info(f"Rating matrix shape: {self.rating_matrix.shape}")
        
        # Calculate item means
        item_sums = np.array(self.rating_matrix.sum(axis=0)).flatten()
        item_counts = np.array((self.rating_matrix > 0).sum(axis=0)).flatten()
        self.item_means = np.divide(
            item_sums, item_counts,
            out=np.zeros_like(item_sums, dtype=float),
            where=item_counts > 0
        )
        
        # Calculate item-item similarity (only if dataset is small enough)
        if n_items <= 5000:
            # Transpose to get items x users
            item_user_matrix = self.rating_matrix.T.tocsr()
            self.item_similarity = cosine_similarity(item_user_matrix, dense_output=False)
            logger.info("Computed full item similarity matrix")
        else:
            self.item_similarity = None
            logger.info("Dataset too large for full similarity matrix, will compute on-demand")
        
        self.is_fitted = True
        logger.info("Item-based model fitted successfully")
        
        return self
    
    def _get_item_similarities(self, item_idx: int) -> np.ndarray:
        """Get similarities for a specific item."""
        if self.item_similarity is not None:
            return self.item_similarity[item_idx].toarray().flatten()
        else:
            # Compute on-demand
            item_vector = self.rating_matrix.T[item_idx]
            return cosine_similarity(item_vector, self.rating_matrix.T).flatten()
    
    def predict(self, user_id: int, n: int = 10) -> List[int]:
        """
        Get recommendations for a user.
        
        Args:
            user_id: User ID
            n: Number of recommendations
        
        Returns:
            List of recommended anime IDs
        """
        if not self.is_fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")
        
        if user_id not in self.user_id_to_idx:
            return []
        
        user_idx = self.user_id_to_idx[user_id]
        user_ratings = self.rating_matrix[user_idx].toarray().flatten()
        
        # Items the user has rated
        rated_items = np.where(user_ratings > 0)[0]
        
        if len(rated_items) == 0:
            return []
        
        # Calculate predicted ratings for unrated items
        n_items = len(self.anime_id_to_idx)
        predictions = np.zeros(n_items)
        
        for item_idx in range(n_items):
            if user_ratings[item_idx] > 0:
                continue  # Skip already rated
            
            similarities = self._get_item_similarities(item_idx)
            
            # Get top-k similar items that user has rated
            rated_sims = [(i, similarities[i]) for i in rated_items if similarities[i] > 0]
            rated_sims.sort(key=lambda x: x[1], reverse=True)
            top_k = rated_sims[:self.k_neighbors]
            
            if top_k:
                numerator = sum(sim * user_ratings[idx] for idx, sim in top_k)
                denominator = sum(sim for _, sim in top_k)
                if denominator > 0:
                    predictions[item_idx] = numerator / denominator
        
        # Get top N recommendations
        top_indices = predictions.argsort()[::-1][:n]
        return [self.idx_to_anime_id[idx] for idx in top_indices if predictions[idx] > 0]
    
    def predict_rating(self, user_id: int, anime_id: int) -> float:
        """
        Predict rating for a user-anime pair.
        """
        if not self.is_fitted:
            return 5.0
        
        if user_id not in self.user_id_to_idx or anime_id not in self.anime_id_to_idx:
            return self.item_means.mean() if len(self.item_means) > 0 else 5.0
        
        user_idx = self.user_id_to_idx[user_id]
        item_idx = self.anime_id_to_idx[anime_id]
        
        user_ratings = self.rating_matrix[user_idx].toarray().flatten()
        rated_items = np.where(user_ratings > 0)[0]
        
        if len(rated_items) == 0:
            return self.item_means[item_idx]
        
        similarities = self._get_item_similarities(item_idx)
        
        rated_sims = [(i, similarities[i]) for i in rated_items if similarities[i] > 0]
        rated_sims.sort(key=lambda x: x[1], reverse=True)
        top_k = rated_sims[:self.k_neighbors]
        
        if not top_k:
            return self.item_means[item_idx]
        
        numerator = sum(sim * user_ratings[idx] for idx, sim in top_k)
        denominator = sum(sim for _, sim in top_k)
        
        if denominator > 0:
            return numerator / denominator
        return self.item_means[item_idx]
