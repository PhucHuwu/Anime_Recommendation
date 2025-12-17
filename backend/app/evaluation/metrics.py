"""
Evaluation Metrics Module.
Provides functions to evaluate recommendation model performance.
"""

import numpy as np
from typing import List, Dict, Tuple, Any
from scipy.sparse import csr_matrix
import logging

logger = logging.getLogger(__name__)


def rmse(predictions: List[Tuple[float, float]]) -> float:
    """
    Calculate Root Mean Square Error.
    
    Args:
        predictions: List of (actual, predicted) tuples
    
    Returns:
        RMSE value
    """
    if not predictions:
        return 0.0
    
    squared_errors = [(actual - predicted) ** 2 for actual, predicted in predictions]
    return np.sqrt(np.mean(squared_errors))


def mae(predictions: List[Tuple[float, float]]) -> float:
    """
    Calculate Mean Absolute Error.
    
    Args:
        predictions: List of (actual, predicted) tuples
    
    Returns:
        MAE value
    """
    if not predictions:
        return 0.0
    
    absolute_errors = [abs(actual - predicted) for actual, predicted in predictions]
    return np.mean(absolute_errors)


def precision_at_k(recommended: List[int], relevant: List[int], k: int) -> float:
    """
    Calculate Precision@K.
    
    Args:
        recommended: List of recommended item IDs
        relevant: List of relevant (actually liked) item IDs
        k: Number of recommendations to consider
    
    Returns:
        Precision@K value
    """
    if k <= 0:
        return 0.0
    
    recommended_k = set(recommended[:k])
    relevant_set = set(relevant)
    
    if not recommended_k:
        return 0.0
    
    hits = len(recommended_k & relevant_set)
    return hits / k


def recall_at_k(recommended: List[int], relevant: List[int], k: int) -> float:
    """
    Calculate Recall@K.
    
    Args:
        recommended: List of recommended item IDs
        relevant: List of relevant (actually liked) item IDs
        k: Number of recommendations to consider
    
    Returns:
        Recall@K value
    """
    if not relevant:
        return 0.0
    
    recommended_k = set(recommended[:k])
    relevant_set = set(relevant)
    
    hits = len(recommended_k & relevant_set)
    return hits / len(relevant_set)


def f1_at_k(recommended: List[int], relevant: List[int], k: int) -> float:
    """
    Calculate F1@K (harmonic mean of Precision@K and Recall@K).
    
    Args:
        recommended: List of recommended item IDs
        relevant: List of relevant (actually liked) item IDs
        k: Number of recommendations to consider
    
    Returns:
        F1@K value
    """
    p = precision_at_k(recommended, relevant, k)
    r = recall_at_k(recommended, relevant, k)
    
    if p + r == 0:
        return 0.0
    
    return 2 * (p * r) / (p + r)


def ndcg_at_k(recommended: List[int], relevant: List[int], k: int) -> float:
    """
    Calculate Normalized Discounted Cumulative Gain at K.
    
    Args:
        recommended: List of recommended item IDs
        relevant: List of relevant (actually liked) item IDs
        k: Number of recommendations to consider
    
    Returns:
        NDCG@K value
    """
    if not recommended or not relevant:
        return 0.0
    
    relevant_set = set(relevant)
    
    # Calculate DCG
    dcg = 0.0
    for i, item in enumerate(recommended[:k]):
        if item in relevant_set:
            # Using binary relevance (1 if relevant, 0 otherwise)
            dcg += 1.0 / np.log2(i + 2)  # +2 because positions start at 1
    
    # Calculate ideal DCG (all relevant items at top)
    ideal_length = min(k, len(relevant))
    idcg = sum(1.0 / np.log2(i + 2) for i in range(ideal_length))
    
    if idcg == 0:
        return 0.0
    
    return dcg / idcg


def coverage(recommended_items: List[List[int]], all_items: set) -> float:
    """
    Calculate catalog coverage (percentage of items that can be recommended).
    
    Args:
        recommended_items: List of recommendation lists for all users
        all_items: Set of all item IDs in the catalog
    
    Returns:
        Coverage percentage (0-100)
    """
    if not all_items:
        return 0.0
    
    recommended_set = set()
    for recs in recommended_items:
        recommended_set.update(recs)
    
    return (len(recommended_set) / len(all_items)) * 100


def diversity(recommended: List[int], item_features: Dict[int, List[str]]) -> float:
    """
    Calculate intra-list diversity based on feature overlap.
    
    Args:
        recommended: List of recommended item IDs
        item_features: Dictionary mapping item ID to list of features (e.g., genres)
    
    Returns:
        Average dissimilarity (0-1, higher is more diverse)
    """
    if len(recommended) < 2:
        return 0.0
    
    total_dissimilarity = 0
    pair_count = 0
    
    for i in range(len(recommended)):
        for j in range(i + 1, len(recommended)):
            item1 = recommended[i]
            item2 = recommended[j]
            
            if item1 in item_features and item2 in item_features:
                features1 = set(item_features[item1])
                features2 = set(item_features[item2])
                
                if features1 | features2:
                    # Jaccard dissimilarity
                    similarity = len(features1 & features2) / len(features1 | features2)
                    dissimilarity = 1 - similarity
                    total_dissimilarity += dissimilarity
            else:
                total_dissimilarity += 0.5  # Default for missing features
            
            pair_count += 1
    
    return total_dissimilarity / pair_count if pair_count > 0 else 0.0


class Evaluator:
    """Evaluator class to assess recommendation model performance."""
    
    def __init__(self, k: int = 20, threshold: float = 7.0):
        """
        Initialize evaluator.
        
        Args:
            k: Number of recommendations for @K metrics (default: 20)
            threshold: Rating threshold to consider as "relevant" (default: 7.0)
        """
        self.k = k
        self.threshold = threshold
    
    def evaluate_rating_predictions(
        self,
        predictions: List[Tuple[float, float]]
    ) -> Dict[str, float]:
        """
        Evaluate rating prediction accuracy.
        
        Args:
            predictions: List of (actual, predicted) rating tuples
        
        Returns:
            Dictionary of metrics
        """
        return {
            'rmse': rmse(predictions),
            'mae': mae(predictions)
        }
    
    def evaluate_recommendations(
        self,
        user_recommendations: Dict[int, List[int]],
        user_relevant: Dict[int, List[int]]
    ) -> Dict[str, float]:
        """
        Evaluate recommendation quality.
        
        Args:
            user_recommendations: Dict mapping user_id to list of recommended item IDs
            user_relevant: Dict mapping user_id to list of relevant item IDs
        
        Returns:
            Dictionary of average metrics across users
        """
        precisions = []
        recalls = []
        f1s = []
        ndcgs = []
        
        for user_id in user_recommendations:
            if user_id not in user_relevant:
                continue
            
            recs = user_recommendations[user_id]
            relevant = user_relevant[user_id]
            
            precisions.append(precision_at_k(recs, relevant, self.k))
            recalls.append(recall_at_k(recs, relevant, self.k))
            f1s.append(f1_at_k(recs, relevant, self.k))
            ndcgs.append(ndcg_at_k(recs, relevant, self.k))
        
        return {
            f'precision@{self.k}': np.mean(precisions) if precisions else 0.0,
            f'recall@{self.k}': np.mean(recalls) if recalls else 0.0,
            f'f1@{self.k}': np.mean(f1s) if f1s else 0.0,
            f'ndcg@{self.k}': np.mean(ndcgs) if ndcgs else 0.0
        }
