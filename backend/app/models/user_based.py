"""
User-Based Collaborative Filtering Model.
Recommends anime based on similar users' preferences.
"""

from typing import List, Dict, Any
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
import logging

from app.models.base_model import BaseRecommender

logger = logging.getLogger(__name__)


class UserBasedRecommender(BaseRecommender):
    """
    User-based collaborative filtering using user-user similarity.
    """
    
    def __init__(self, k_neighbors: int = 50):
        super().__init__("User-Based Collaborative Filtering")
        self.k_neighbors = k_neighbors
        self.rating_matrix: csr_matrix = None
        self.user_similarity: np.ndarray = None
        self.user_id_to_idx: Dict[int, int] = {}
        self.idx_to_user_id: Dict[int, int] = {}
        self.anime_id_to_idx: Dict[int, int] = {}
        self.idx_to_anime_id: Dict[int, int] = {}
        self.user_means: np.ndarray = None
    
    def fit(self, ratings: List[Dict]) -> 'UserBasedRecommender':
        """
        Train the model on rating data.
        
        Args:
            ratings: List of rating dictionaries with 'user_id', 'anime_id', 'rating'
        
        Returns:
            Self for chaining
        """
        logger.info(f"Fitting user-based model with {len(ratings)} ratings")
        
        # Build user and item mappings
        users = sorted(set(r['user_id'] for r in ratings))
        items = sorted(set(r['anime_id'] for r in ratings))
        
        self.user_id_to_idx = {uid: idx for idx, uid in enumerate(users)}
        self.idx_to_user_id = {idx: uid for uid, idx in self.user_id_to_idx.items()}
        self.anime_id_to_idx = {aid: idx for idx, aid in enumerate(items)}
        self.idx_to_anime_id = {idx: aid for aid, idx in self.anime_id_to_idx.items()}
        
        n_users = len(users)
        n_items = len(items)
        
        # Build sparse rating matrix (users x items)
        row_indices = []
        col_indices = []
        values = []
        
        for r in ratings:
            if r['rating'] > 0:
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
        
        # Calculate user means
        user_sums = np.array(self.rating_matrix.sum(axis=1)).flatten()
        user_counts = np.array((self.rating_matrix > 0).sum(axis=1)).flatten()
        self.user_means = np.divide(
            user_sums, user_counts,
            out=np.zeros_like(user_sums, dtype=float),
            where=user_counts > 0
        )
        
        # Calculate user-user similarity (increase threshold for larger datasets)
        if n_users <= 20000:
            logger.info(f"Computing user similarity matrix ({n_users}x{n_users})...")
            self.user_similarity = cosine_similarity(self.rating_matrix, dense_output=False)
            logger.info("Computed full user similarity matrix")
        else:
            self.user_similarity = None
            logger.warning(f"Dataset too large ({n_users} users) for full similarity matrix, will compute on-demand")
        
        self.is_fitted = True
        logger.info("User-based model fitted successfully")
        
        return self
    
    def _get_user_similarities(self, user_idx: int) -> np.ndarray:
        """Get similarities for a specific user using sparse operations."""
        if self.user_similarity is not None:
            # Sử dụng getrow() để lấy sparse row, chỉ convert khi cần
            return self.user_similarity.getrow(user_idx).toarray().ravel()
        else:
            # Compute on-demand với sparse input
            user_vector = self.rating_matrix.getrow(user_idx)
            return cosine_similarity(user_vector, self.rating_matrix).ravel()
    
    def predict(self, user_id: int, n: int = 20) -> List[int]:
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
        
        # Sử dụng sparse row trực tiếp - tránh toarray()
        user_ratings_sparse = self.rating_matrix.getrow(user_idx)
        rated_items = set(user_ratings_sparse.indices)  # Chỉ lấy non-zero indices
        
        # Get similar users
        similarities = self._get_user_similarities(user_idx)
        
        # Get top-k similar users (excluding self)
        similar_users_idx = similarities.argsort()[::-1][1:self.k_neighbors + 1]
        
        # Aggregate ratings from similar users using sparse operations
        predictions = {}
        
        for sim_user_idx in similar_users_idx:
            sim = similarities[sim_user_idx]
            if sim <= 0:
                continue
            
            # Sử dụng sparse row thay vì toarray() - tiết kiệm bộ nhớ đáng kể
            sim_user_sparse = self.rating_matrix.getrow(sim_user_idx)
            
            # Iterate chỉ qua non-zero elements (indices và data)
            for idx, item_idx in enumerate(sim_user_sparse.indices):
                if item_idx in rated_items:
                    continue
                
                rating = sim_user_sparse.data[idx]
                if item_idx not in predictions:
                    predictions[item_idx] = {'weighted_sum': 0.0, 'sim_sum': 0.0}
                
                predictions[item_idx]['weighted_sum'] += sim * rating
                predictions[item_idx]['sim_sum'] += sim
        
        # Calculate predicted ratings
        pred_ratings = []
        for item_idx, data in predictions.items():
            if data['sim_sum'] > 0:
                pred = data['weighted_sum'] / data['sim_sum']
                pred_ratings.append((item_idx, pred))
        
        # Sort by predicted rating and return top N
        pred_ratings.sort(key=lambda x: x[1], reverse=True)
        return [self.idx_to_anime_id[idx] for idx, _ in pred_ratings[:n]]
    
    def predict_rating(self, user_id: int, anime_id: int) -> float:
        """
        Predict rating for a user-anime pair.
        """
        if not self.is_fitted:
            return 5.0
        
        if user_id not in self.user_id_to_idx or anime_id not in self.anime_id_to_idx:
            return self.user_means.mean() if len(self.user_means) > 0 else 5.0
        
        user_idx = self.user_id_to_idx[user_id]
        item_idx = self.anime_id_to_idx[anime_id]
        
        # Get similar users
        similarities = self._get_user_similarities(user_idx)
        similar_users_idx = similarities.argsort()[::-1][1:self.k_neighbors + 1]
        
        weighted_sum = 0.0
        sim_sum = 0.0
        
        for sim_user_idx in similar_users_idx:
            sim = similarities[sim_user_idx]
            if sim <= 0:
                continue
            
            # Truy cập trực tiếp từ sparse matrix - hiệu quả hơn
            sim_user_rating = self.rating_matrix[sim_user_idx, item_idx]
            if sim_user_rating > 0:
                weighted_sum += sim * sim_user_rating
                sim_sum += sim
        
        if sim_sum > 0:
            return weighted_sum / sim_sum
        
        return self.user_means[user_idx] if self.user_means[user_idx] > 0 else 5.0
