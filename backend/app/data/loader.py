"""
Data Loader Module.
Loads processed data into MongoDB.
"""

import pandas as pd
from typing import Optional
from datetime import datetime
import logging
import asyncio

from app.database import Database, Collections
from app.config import settings

logger = logging.getLogger(__name__)


class DataLoader:
    """Loads data into MongoDB."""
    
    async def load_anime_to_mongodb(self, anime_df: pd.DataFrame) -> int:
        """
        Load anime DataFrame into MongoDB.
        
        Args:
            anime_df: Cleaned anime DataFrame
        
        Returns:
            Number of documents inserted
        """
        db = Database.get_db()
        collection = db[Collections.ANIMES]
        
        # Clear existing data
        await collection.delete_many({})
        logger.info("Cleared existing anime data")
        
        # Convert DataFrame to list of dicts
        records = anime_df.to_dict('records')
        
        # Insert in batches
        batch_size = 1000
        inserted = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            result = await collection.insert_many(batch)
            inserted += len(result.inserted_ids)
            logger.info(f"Inserted {inserted}/{len(records)} anime records")
        
        # Create indexes
        await collection.create_index("anime_id", unique=True)
        await collection.create_index("name")
        await collection.create_index("genre")
        await collection.create_index("rating")
        await collection.create_index("type")
        
        logger.info(f"Total anime loaded: {inserted}")
        return inserted
    
    async def load_ratings_to_mongodb(self, ratings_df: pd.DataFrame) -> int:
        """
        Load ratings DataFrame into MongoDB.
        
        Args:
            ratings_df: Cleaned ratings DataFrame
        
        Returns:
            Number of documents inserted
        """
        db = Database.get_db()
        collection = db[Collections.RATINGS]
        
        # Clear existing data
        await collection.delete_many({})
        logger.info("Cleared existing rating data")
        
        # Add timestamp
        records = ratings_df.to_dict('records')
        now = datetime.utcnow()
        for record in records:
            record['timestamp'] = now
        
        # Insert in batches
        batch_size = 10000
        inserted = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            result = await collection.insert_many(batch)
            inserted += len(result.inserted_ids)
            logger.info(f"Inserted {inserted}/{len(records)} rating records")
        
        # Create indexes
        await collection.create_index([("user_id", 1), ("anime_id", 1)], unique=True)
        await collection.create_index("user_id")
        await collection.create_index("anime_id")
        await collection.create_index("rating")
        
        logger.info(f"Total ratings loaded: {inserted}")
        return inserted
    
    async def create_users_from_ratings(self, ratings_df: pd.DataFrame) -> int:
        """
        Create user documents from unique users in ratings.
        
        Args:
            ratings_df: Ratings DataFrame
        
        Returns:
            Number of users created
        """
        db = Database.get_db()
        collection = db[Collections.USERS]
        
        # Clear existing data
        await collection.delete_many({})
        
        # Get unique users
        unique_users = ratings_df['user_id'].unique()
        
        # Create user documents
        now = datetime.utcnow()
        users = [
            {
                "user_id": int(uid),
                "created_at": now,
                "last_login": None,
                "preferences": {}
            }
            for uid in unique_users
        ]
        
        # Insert in batches
        batch_size = 5000
        inserted = 0
        
        for i in range(0, len(users), batch_size):
            batch = users[i:i + batch_size]
            result = await collection.insert_many(batch)
            inserted += len(result.inserted_ids)
            logger.info(f"Created {inserted}/{len(users)} users")
        
        # Create index
        await collection.create_index("user_id", unique=True)
        
        logger.info(f"Total users created: {inserted}")
        return inserted


async def run_data_pipeline(anime_csv: str, rating_csv: str, sample_ratings: Optional[int] = None):
    """
    Run the complete data loading pipeline.
    
    Args:
        anime_csv: Path to anime.csv
        rating_csv: Path to rating.csv
        sample_ratings: Optional sample size for ratings
    """
    from app.data.cleaner import DataCleaner
    
    # Connect to database
    await Database.connect()
    
    cleaner = DataCleaner()
    loader = DataLoader()
    
    # Clean and load anime
    logger.info("Processing anime data...")
    anime_df = cleaner.load_and_clean_anime(anime_csv)
    await loader.load_anime_to_mongodb(anime_df)
    
    # Clean and load ratings
    logger.info("Processing rating data...")
    ratings_df = cleaner.load_and_clean_ratings(rating_csv, sample_size=sample_ratings)
    await loader.load_ratings_to_mongodb(ratings_df)
    
    # Create users
    logger.info("Creating users...")
    await loader.create_users_from_ratings(ratings_df)
    
    # Disconnect
    await Database.disconnect()
    
    logger.info("Data pipeline complete!")


if __name__ == "__main__":
    import sys
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    anime_csv = sys.argv[1] if len(sys.argv) > 1 else "./data/raw/anime.csv"
    rating_csv = sys.argv[2] if len(sys.argv) > 2 else "./data/raw/rating.csv"
    sample_size = int(sys.argv[3]) if len(sys.argv) > 3 else None
    
    asyncio.run(run_data_pipeline(anime_csv, rating_csv, sample_size))
