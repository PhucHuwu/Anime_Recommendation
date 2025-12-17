"""
Base Recommender Model.
Abstract base class for all recommendation models.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pathlib import Path
import pickle
import logging

logger = logging.getLogger(__name__)


class BaseRecommender(ABC):
    """Abstract base class for recommendation models."""
    
    def __init__(self, name: str):
        """
        Initialize the recommender.
        
        Args:
            name: Model name
        """
        self.name = name
        self.is_fitted = False
        self.metrics: Dict[str, float] = {}
    
    @abstractmethod
    def fit(self, data: Any) -> 'BaseRecommender':
        """
        Train the model on data.
        
        Args:
            data: Training data (format depends on specific model)
        
        Returns:
            Self for chaining
        """
        pass
    
    @abstractmethod
    def predict(self, user_id: int, n: int = 10) -> List[int]:
        """
        Get recommendations for a user.
        
        Args:
            user_id: User ID
            n: Number of recommendations
        
        Returns:
            List of recommended anime IDs
        """
        pass
    
    @abstractmethod
    def predict_rating(self, user_id: int, anime_id: int) -> float:
        """
        Predict rating for a user-anime pair.
        
        Args:
            user_id: User ID
            anime_id: Anime ID
        
        Returns:
            Predicted rating
        """
        pass
    
    def save(self, path: str) -> None:
        """
        Save model to disk.
        
        Args:
            path: Path to save the model
        """
        save_path = Path(path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(save_path, 'wb') as f:
            pickle.dump(self, f)
        
        logger.info(f"Model saved to {save_path}")
    
    @classmethod
    def load(cls, path: str) -> 'BaseRecommender':
        """
        Load model from disk.
        
        Args:
            path: Path to the saved model
        
        Returns:
            Loaded model
        """
        with open(path, 'rb') as f:
            model = pickle.load(f)
        
        logger.info(f"Model loaded from {path}")
        return model
    
    def set_metrics(self, metrics: Dict[str, float]) -> None:
        """
        Set evaluation metrics.
        
        Args:
            metrics: Dictionary of metric name to value
        """
        self.metrics = metrics
    
    def get_metrics(self) -> Dict[str, float]:
        """
        Get evaluation metrics.
        
        Returns:
            Dictionary of metrics
        """
        return self.metrics
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name='{self.name}', is_fitted={self.is_fitted})"
