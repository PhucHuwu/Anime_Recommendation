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
    
    def __init__(self, k_neighbors: int = 50, popularity_weight: float = 0.3):
        super().__init__("Item-Based Collaborative Filtering")
        self.k_neighbors = k_neighbors
        self.popularity_weight = popularity_weight  # Weight for popularity bias
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
        
        # Calculate item-item similarity (increase threshold for larger datasets)
        if n_items <= 15000:
            logger.info(f"Computing item similarity matrix ({n_items}x{n_items})...")
            # Transpose to get items x users
            item_user_matrix = self.rating_matrix.T.tocsr()
            self.item_similarity = cosine_similarity(item_user_matrix, dense_output=False)
            logger.info("Computed full item similarity matrix")
        else:
            self.item_similarity = None
            logger.warning(f"Dataset too large ({n_items} items) for full similarity matrix, will compute on-demand")
        
        self.is_fitted = True
        logger.info("Item-based model fitted successfully")
        
        return self
    
    def _get_item_similarities(self, item_idx: int) -> np.ndarray:
        """Get similarities for a specific item using sparse operations."""
        if self.item_similarity is not None:
            # Sử dụng getrow() để lấy sparse row, chỉ convert khi cần
            return self.item_similarity.getrow(item_idx).toarray().ravel()
        else:
            # Compute on-demand với sparse input
            item_vector = self.rating_matrix.T.getrow(item_idx)
            return cosine_similarity(item_vector, self.rating_matrix.T).ravel()
    
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
        
        # Sử dụng sparse operations - tránh toarray()
        user_ratings_sparse = self.rating_matrix.getrow(user_idx)
        rated_indices = user_ratings_sparse.indices
        rated_values = user_ratings_sparse.data
        
        if len(rated_indices) == 0:
            return []
        
        # TốI ƯU QUAN TRỌNG: Đảo ngược logic - iterate qua RATED items
        # thay vì iterate qua TẤT CẢ items
        # Độ phức tạp: O(rated × k_neighbors) thay vì O(n_items)
        n_items = len(self.anime_id_to_idx)
        predictions = np.zeros(n_items)
        sim_sums = np.zeros(n_items)
        
        rated_set = set(rated_indices)
        
        # Với mỗi item user đã rate, tìm similar items và tích lũy
        for i, rated_idx in enumerate(rated_indices):
            user_rating = rated_values[i]
            
            if self.item_similarity is not None:
                # Lấy sparse row từ similarity matrix
                sim_row = self.item_similarity.getrow(rated_idx)
                similar_indices = sim_row.indices
                similar_values = sim_row.data
                
                # Chỉ lấy top-k neighbors nếu cần
                if len(similar_indices) > self.k_neighbors:
                    top_k_positions = similar_values.argsort()[::-1][:self.k_neighbors]
                    similar_indices = similar_indices[top_k_positions]
                    similar_values = similar_values[top_k_positions]
                
                # Tích lũy weighted sum cho mỗi similar item
                for j, sim_idx in enumerate(similar_indices):
                    if sim_idx in rated_set:
                        continue  # Bỏ qua items đã rate
                    sim = similar_values[j]
                    if sim > 0:
                        predictions[sim_idx] += sim * user_rating
                        sim_sums[sim_idx] += sim
            else:
                # Compute similarity on-demand
                similarities = self._get_item_similarities(rated_idx)
                top_k_idx = similarities.argsort()[::-1][:self.k_neighbors]
                
                for sim_idx in top_k_idx:
                    if sim_idx in rated_set:
                        continue
                    sim = similarities[sim_idx]
                    if sim > 0:
                        predictions[sim_idx] += sim * user_rating
                        sim_sums[sim_idx] += sim
        
        # Normalize predictions
        valid_mask = sim_sums > 0
        predictions[valid_mask] /= sim_sums[valid_mask]
        
        # Add popularity bias to boost popular items (improves P@K)
        if self.popularity_weight > 0:
            item_popularity = np.array(self.rating_matrix.sum(axis=0)).flatten()
            if item_popularity.max() > 0:
                item_popularity = item_popularity / item_popularity.max()  # Normalize 0-1
                # Blend: (1-weight) * similarity + weight * popularity
                max_pred = predictions.max() if predictions.max() > 0 else 1.0
                sim_weight = 1.0 - self.popularity_weight
                predictions[valid_mask] = sim_weight * predictions[valid_mask] + self.popularity_weight * item_popularity[valid_mask] * max_pred
        
        # Get top N (exclude items đã rate)
        predictions[rated_indices] = 0
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
        
        # Sử dụng sparse operations
        user_ratings_sparse = self.rating_matrix.getrow(user_idx)
        rated_indices = user_ratings_sparse.indices
        rated_values = user_ratings_sparse.data
        
        if len(rated_indices) == 0:
            return self.item_means[item_idx]
        
        # Lấy similarities cho target item
        similarities = self._get_item_similarities(item_idx)
        
        # Tìm top-k similar items mà user đã rate
        rated_sims = []
        for i, rated_idx in enumerate(rated_indices):
            sim = similarities[rated_idx]
            if sim > 0:
                rated_sims.append((rated_values[i], sim))
        
        rated_sims.sort(key=lambda x: x[1], reverse=True)
        top_k = rated_sims[:self.k_neighbors]
        
        if not top_k:
            return self.item_means[item_idx]
        
        numerator = sum(sim * rating for rating, sim in top_k)
        denominator = sum(sim for _, sim in top_k)
        
        if denominator > 0:
            return numerator / denominator
        return self.item_means[item_idx]
