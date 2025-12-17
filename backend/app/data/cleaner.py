"""
Data Cleaner Module.
Handles data preprocessing and cleaning.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class DataCleaner:
    """Handles data cleaning and preprocessing."""
    
    def __init__(self):
        pass
    
    def load_and_clean_anime(self, csv_path: str) -> pd.DataFrame:
        """
        Load and clean anime.csv.
        
        Args:
            csv_path: Path to anime.csv
        
        Returns:
            Cleaned DataFrame
        """
        logger.info(f"Loading anime data from {csv_path}")
        
        # Load data
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} anime records")
        
        # Handle missing values
        df['name'] = df['name'].fillna('Unknown')
        df['genre'] = df['genre'].fillna('')
        df['type'] = df['type'].fillna('Unknown')
        df['episodes'] = df['episodes'].replace('Unknown', np.nan)
        df['episodes'] = pd.to_numeric(df['episodes'], errors='coerce').fillna(0).astype(int)
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(0.0)
        df['members'] = pd.to_numeric(df['members'], errors='coerce').fillna(0).astype(int)
        
        # Convert genre to list
        df['genre'] = df['genre'].apply(lambda x: [g.strip() for g in x.split(',')] if x else [])
        
        # Remove duplicates
        df = df.drop_duplicates(subset=['anime_id'])
        
        # Remove anime with invalid IDs
        df = df[df['anime_id'] > 0]
        
        # Handle outliers in rating (should be 0-10)
        df['rating'] = df['rating'].clip(0, 10)
        
        logger.info(f"Cleaned data: {len(df)} records remaining")
        
        return df
    
    def load_and_clean_ratings(self, csv_path: str, sample_size: Optional[int] = None) -> pd.DataFrame:
        """
        Load and clean rating.csv.
        
        Args:
            csv_path: Path to rating.csv
            sample_size: If provided, sample this many ratings (for memory efficiency)
        
        Returns:
            Cleaned DataFrame
        """
        logger.info(f"Loading rating data from {csv_path}")
        
        # Load data (may be very large)
        if sample_size:
            # Read in chunks and sample
            chunks = pd.read_csv(csv_path, chunksize=100000)
            sampled_chunks = []
            for chunk in chunks:
                sampled = chunk.sample(min(len(chunk), sample_size // 100))
                sampled_chunks.append(sampled)
                if sum(len(c) for c in sampled_chunks) >= sample_size:
                    break
            df = pd.concat(sampled_chunks, ignore_index=True)[:sample_size]
        else:
            df = pd.read_csv(csv_path)
        
        logger.info(f"Loaded {len(df)} rating records")
        
        # Handle missing values
        df = df.dropna(subset=['user_id', 'anime_id'])
        
        # Convert to proper types
        df['user_id'] = df['user_id'].astype(int)
        df['anime_id'] = df['anime_id'].astype(int)
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(-1).astype(int)
        
        # Handle rating = -1 (watched but not rated)
        # Keep these as they're useful for collaborative filtering
        
        # Remove duplicates (keep latest if there are duplicates)
        df = df.drop_duplicates(subset=['user_id', 'anime_id'], keep='last')
        
        # Remove invalid ratings (outside -1 to 10)
        df = df[(df['rating'] >= -1) & (df['rating'] <= 10)]
        
        logger.info(f"Cleaned data: {len(df)} records remaining")
        
        return df
    
    def normalize_ratings(self, ratings_df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize ratings to 0-1 scale.
        
        Args:
            ratings_df: DataFrame with ratings
        
        Returns:
            DataFrame with normalized ratings
        """
        df = ratings_df.copy()
        
        # Only normalize positive ratings (1-10)
        mask = df['rating'] > 0
        df.loc[mask, 'normalized_rating'] = (df.loc[mask, 'rating'] - 1) / 9
        df.loc[~mask, 'normalized_rating'] = np.nan
        
        return df
    
    def get_user_stats(self, ratings_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate user statistics.
        
        Args:
            ratings_df: DataFrame with ratings
        
        Returns:
            DataFrame with user statistics
        """
        positive_ratings = ratings_df[ratings_df['rating'] > 0]
        
        stats = positive_ratings.groupby('user_id').agg({
            'rating': ['count', 'mean', 'std'],
            'anime_id': 'nunique'
        }).reset_index()
        
        stats.columns = ['user_id', 'rating_count', 'avg_rating', 'rating_std', 'unique_anime']
        stats['rating_std'] = stats['rating_std'].fillna(0)
        
        return stats
    
    def get_anime_stats(self, ratings_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate anime statistics from ratings.
        
        Args:
            ratings_df: DataFrame with ratings
        
        Returns:
            DataFrame with anime statistics
        """
        positive_ratings = ratings_df[ratings_df['rating'] > 0]
        
        stats = positive_ratings.groupby('anime_id').agg({
            'rating': ['count', 'mean', 'std'],
            'user_id': 'nunique'
        }).reset_index()
        
        stats.columns = ['anime_id', 'rating_count', 'avg_user_rating', 'rating_std', 'unique_users']
        stats['rating_std'] = stats['rating_std'].fillna(0)
        
        return stats
