"""
Train and evaluate all recommendation models.
Loads data from MongoDB, splits into train/test, trains models, 
evaluates performance, and saves metrics to MongoDB.
"""

import asyncio
import logging
import random
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple, Set
from collections import defaultdict

from app.database import Database, Collections
from app.models import (
    ContentBasedRecommender,
    ItemBasedRecommender,
    UserBasedRecommender,
    HybridRecommender
)
from app.evaluation import rmse, mae, precision_at_k, recall_at_k, f1_at_k, ndcg_at_k
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def load_data_from_mongodb():
    """Load anime and ratings data from MongoDB."""
    db = Database.get_db()
    
    # Load anime data
    logger.info("Loading anime data from MongoDB...")
    animes_cursor = db[Collections.ANIMES].find()
    anime_data = await animes_cursor.to_list(length=50000)
    logger.info(f"Loaded {len(anime_data)} anime records")
    
    # Load ratings data
    logger.info("Loading ratings data from MongoDB...")
    ratings_cursor = db[Collections.RATINGS].find({"rating": {"$gt": 0}})
    ratings_data = await ratings_cursor.to_list(length=10000000)
    logger.info(f"Loaded {len(ratings_data)} rating records")
    
    return anime_data, ratings_data


def train_test_split(ratings: List[Dict], test_ratio: float = 0.2, min_ratings: int = 5) -> Tuple[List[Dict], List[Dict]]:
    """
    Split ratings into train and test sets.
    Ensures each user in test set has at least min_ratings in train set (avoid cold start).
    
    Args:
        ratings: List of rating dictionaries
        test_ratio: Ratio of data for test set
        min_ratings: Minimum ratings per user in train set
    
    Returns:
        (train_ratings, test_ratings)
    """
    logger.info(f"Splitting data with test_ratio={test_ratio}, min_ratings={min_ratings}")
    
    # Group ratings by user
    user_ratings = defaultdict(list)
    for r in ratings:
        user_ratings[r['user_id']].append(r)
    
    train = []
    test = []
    
    for user_id, user_r in user_ratings.items():
        if len(user_r) <= min_ratings:
            # Not enough ratings, all go to train
            train.extend(user_r)
        else:
            # Shuffle and split
            random.shuffle(user_r)
            n_test = max(1, int(len(user_r) * test_ratio))
            n_train = len(user_r) - n_test
            
            # Ensure at least min_ratings in train
            if n_train < min_ratings:
                n_train = min_ratings
                n_test = len(user_r) - n_train
            
            train.extend(user_r[:n_train])
            test.extend(user_r[n_train:])
    
    logger.info(f"Train set: {len(train)} ratings, Test set: {len(test)} ratings")
    return train, test


def evaluate_model(
    model, 
    test_ratings: List[Dict], 
    train_ratings: List[Dict],
    k: int = 10,
    threshold: float = 7.0
) -> Dict[str, float]:
    """
    Evaluate a recommendation model.
    
    Args:
        model: Trained recommendation model
        test_ratings: Test set ratings
        train_ratings: Train set ratings (to know what user has seen)
        k: K for Precision@K, Recall@K
        threshold: Rating threshold for "relevant" items
    
    Returns:
        Dictionary of metrics
    """
    logger.info(f"Evaluating model with {len(test_ratings)} test ratings...")
    
    # Build user -> rated items from train
    user_train_items = defaultdict(set)
    for r in train_ratings:
        user_train_items[r['user_id']].add(r['anime_id'])
    
    # Build user -> relevant items from test (ratings >= threshold)
    user_relevant = defaultdict(list)
    for r in test_ratings:
        if r['rating'] >= threshold:
            user_relevant[r['user_id']].append(r['anime_id'])
    
    # Collect predictions for RMSE/MAE
    rating_predictions = []
    
    # Collect recommendations for Precision/Recall
    all_precisions = []
    all_recalls = []
    all_f1s = []
    all_ndcgs = []
    
    # Sample users for evaluation (too many users = too slow)
    users_to_evaluate = list(user_relevant.keys())
    if len(users_to_evaluate) > 1000:
        users_to_evaluate = random.sample(users_to_evaluate, 1000)
    
    for user_id in users_to_evaluate:
        relevant = user_relevant[user_id]
        if not relevant:
            continue
        
        try:
            # Get recommendations
            if hasattr(model, 'predict'):
                recs = model.predict(user_id, n=k)
            else:
                continue
            
            if recs:
                # Calculate ranking metrics
                all_precisions.append(precision_at_k(recs, relevant, k))
                all_recalls.append(recall_at_k(recs, relevant, k))
                all_f1s.append(f1_at_k(recs, relevant, k))
                all_ndcgs.append(ndcg_at_k(recs, relevant, k))
        except Exception as e:
            continue
    
    # Calculate rating prediction accuracy (sample)
    test_sample = random.sample(test_ratings, min(5000, len(test_ratings)))
    for r in test_sample:
        try:
            pred = model.predict_rating(r['user_id'], r['anime_id'])
            rating_predictions.append((r['rating'], pred))
        except Exception:
            continue
    
    # Calculate metrics
    metrics = {
        'rmse': round(rmse(rating_predictions), 4) if rating_predictions else 0.0,
        'mae': round(mae(rating_predictions), 4) if rating_predictions else 0.0,
        'precision_k': round(sum(all_precisions) / len(all_precisions), 4) if all_precisions else 0.0,
        'recall_k': round(sum(all_recalls) / len(all_recalls), 4) if all_recalls else 0.0,
        'f1_k': round(sum(all_f1s) / len(all_f1s), 4) if all_f1s else 0.0,
        'ndcg_k': round(sum(all_ndcgs) / len(all_ndcgs), 4) if all_ndcgs else 0.0,
    }
    
    logger.info(f"Metrics: RMSE={metrics['rmse']}, MAE={metrics['mae']}, "
                f"P@{k}={metrics['precision_k']}, R@{k}={metrics['recall_k']}")
    
    return metrics


async def save_metrics_to_mongodb(model_name: str, metrics: dict, description: str):
    """Save model metrics to MongoDB."""
    db = Database.get_db()
    metrics_col = db[Collections.MODEL_METRICS]
    
    doc = {
        "model_name": model_name,
        "trained_at": datetime.utcnow(),
        "rmse": metrics.get('rmse', 0),
        "mae": metrics.get('mae', 0),
        "precision_k": metrics.get('precision_k', 0),
        "recall_k": metrics.get('recall_k', 0),
        "f1_k": metrics.get('f1_k', 0),
        "ndcg_k": metrics.get('ndcg_k', 0),
        "description": description
    }
    
    # Upsert
    await metrics_col.update_one(
        {"model_name": model_name},
        {"$set": doc},
        upsert=True
    )
    logger.info(f"Saved metrics for {model_name} to MongoDB")


async def main(sample_size: int = None, test_ratio: float = 0.2):
    """Main training and evaluation pipeline."""
    logger.info("=" * 60)
    logger.info("ANIME RECOMMENDATION MODELS - TRAINING & EVALUATION")
    logger.info("=" * 60)
    
    # Connect to database
    await Database.connect()
    
    # Create models directory
    save_path = settings.models_dir
    save_path.mkdir(parents=True, exist_ok=True)
    logger.info(f"Models will be saved to: {save_path}")
    
    try:
        # Load data
        anime_data, ratings_data = await load_data_from_mongodb()
        
        if not anime_data:
            logger.error("No anime data found! Run data loader first.")
            return
        
        if not ratings_data:
            logger.error("No ratings data found! Run data loader first.")
            return
        
        # Sample if requested
        if sample_size and len(ratings_data) > sample_size:
            ratings_data = random.sample(ratings_data, sample_size)
            logger.info(f"Sampled {sample_size} ratings for training")
        
        # Convert to dicts
        anime_list = [dict(a) for a in anime_data]
        ratings_list = [dict(r) for r in ratings_data]
        
        # Train/Test split
        train_ratings, test_ratings = train_test_split(ratings_list, test_ratio)
        
        # ============================================
        # 1. CONTENT-BASED MODEL
        # ============================================
        logger.info("\n" + "=" * 40)
        logger.info("1. CONTENT-BASED FILTERING")
        logger.info("=" * 40)
        
        content_model = ContentBasedRecommender()
        content_model.fit(anime_list)
        content_model.save(save_path / "content_based.pkl")
        
        content_metrics = evaluate_model(content_model, test_ratings, train_ratings)
        await save_metrics_to_mongodb(
            "Content-Based Filtering", 
            content_metrics,
            "Recommends based on anime features (genres) using TF-IDF and cosine similarity"
        )
        
        # ============================================
        # 2. ITEM-BASED CF
        # ============================================
        logger.info("\n" + "=" * 40)
        logger.info("2. ITEM-BASED COLLABORATIVE FILTERING")
        logger.info("=" * 40)
        
        item_model = ItemBasedRecommender(k_neighbors=20)
        item_model.fit(train_ratings)
        item_model.save(save_path / "item_based.pkl")
        
        item_metrics = evaluate_model(item_model, test_ratings, train_ratings)
        await save_metrics_to_mongodb(
            "Item-Based Collaborative Filtering",
            item_metrics,
            "Recommends based on item-item similarity using user rating patterns"
        )
        
        # ============================================
        # 3. USER-BASED CF
        # ============================================
        logger.info("\n" + "=" * 40)
        logger.info("3. USER-BASED COLLABORATIVE FILTERING")
        logger.info("=" * 40)
        
        user_model = UserBasedRecommender(k_neighbors=20)
        user_model.fit(train_ratings)
        user_model.save(save_path / "user_based.pkl")
        
        user_metrics = evaluate_model(user_model, test_ratings, train_ratings)
        await save_metrics_to_mongodb(
            "User-Based Collaborative Filtering",
            user_metrics,
            "Recommends based on similar user preferences using KNN"
        )
        
        # ============================================
        # 4. HYBRID MODEL
        # ============================================
        logger.info("\n" + "=" * 40)
        logger.info("4. HYBRID MODEL")
        logger.info("=" * 40)
        
        hybrid_model = HybridRecommender()
        hybrid_model.fit(anime_list, train_ratings)
        hybrid_model.save(save_path / "hybrid.pkl")
        
        hybrid_metrics = evaluate_model(hybrid_model, test_ratings, train_ratings)
        await save_metrics_to_mongodb(
            "Hybrid Model",
            hybrid_metrics,
            "Combines Content-Based and Collaborative Filtering with weighted scoring"
        )
        
        # ============================================
        # SUMMARY
        # ============================================
        logger.info("\n" + "=" * 60)
        logger.info("TRAINING & EVALUATION COMPLETE!")
        logger.info("=" * 60)
        
        print("\n📊 MODEL COMPARISON:")
        print("-" * 70)
        print(f"{'Model':<35} {'RMSE':<8} {'MAE':<8} {'P@10':<8} {'R@10':<8}")
        print("-" * 70)
        print(f"{'Content-Based':<35} {content_metrics['rmse']:<8} {content_metrics['mae']:<8} "
              f"{content_metrics['precision_k']:<8} {content_metrics['recall_k']:<8}")
        print(f"{'Item-Based CF':<35} {item_metrics['rmse']:<8} {item_metrics['mae']:<8} "
              f"{item_metrics['precision_k']:<8} {item_metrics['recall_k']:<8}")
        print(f"{'User-Based CF':<35} {user_metrics['rmse']:<8} {user_metrics['mae']:<8} "
              f"{user_metrics['precision_k']:<8} {user_metrics['recall_k']:<8}")
        print(f"{'Hybrid':<35} {hybrid_metrics['rmse']:<8} {hybrid_metrics['mae']:<8} "
              f"{hybrid_metrics['precision_k']:<8} {hybrid_metrics['recall_k']:<8}")
        print("-" * 70)
        
        print(f"\n✅ Models saved to: {save_path}")
        print("✅ Metrics saved to MongoDB")
    
    finally:
        await Database.disconnect()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Train and evaluate recommendation models")
    parser.add_argument(
        "--sample", 
        type=int, 
        default=None,
        help="Sample size for ratings (for faster training). Default: use all data."
    )
    parser.add_argument(
        "--test-ratio",
        type=float,
        default=0.2,
        help="Test set ratio (default: 0.2)"
    )
    args = parser.parse_args()
    
    print("\n" + "=" * 60)
    print("ANIME RECOMMENDATION - MODEL TRAINING")
    print("=" * 60)
    print(f"Sample size: {args.sample or 'Full data'}")
    print(f"Test ratio: {args.test_ratio}")
    print("This may take a while for large datasets...")
    print("=" * 60 + "\n")
    
    asyncio.run(main(sample_size=args.sample, test_ratio=args.test_ratio))
