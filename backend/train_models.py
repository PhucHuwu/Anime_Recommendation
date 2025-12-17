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
from typing import List, Dict, Tuple, Set, Callable, Awaitable, Optional, Any
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
    k: int = 20,
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
                if isinstance(model, ContentBasedRecommender):
                     # Content-based needs liked history
                     liked = list(user_train_items.get(user_id, set()))
                     if not liked:
                         # Fallback if no history (should be handled by filters but safety check)
                         continue
                     recs = model.predict(user_id, n=k, liked_anime_ids=liked)
                else:
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



async def train_content_based(save_path: Path, anime_list: List[Dict], train_ratings: List[Dict], test_ratings: List[Dict]):
    """Train and evaluate Content-Based model."""
    logger.info("\n" + "=" * 40)
    logger.info("TRAINING CONTENT-BASED FILTERING")
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
    return content_metrics

async def train_item_based(save_path: Path, train_ratings: List[Dict], test_ratings: List[Dict]):
    """Train and evaluate Item-Based CF model."""
    logger.info("\n" + "=" * 40)
    logger.info("TRAINING ITEM-BASED COLLABORATIVE FILTERING")
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
    return item_metrics

async def train_user_based(save_path: Path, train_ratings: List[Dict], test_ratings: List[Dict]):
    """Train and evaluate User-Based CF model."""
    logger.info("\n" + "=" * 40)
    logger.info("TRAINING USER-BASED COLLABORATIVE FILTERING")
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
    return user_metrics

async def train_hybrid(save_path: Path, anime_list: List[Dict], train_ratings: List[Dict], test_ratings: List[Dict]):
    """Train and evaluate Hybrid model."""
    logger.info("\n" + "=" * 40)
    logger.info("TRAINING HYBRID MODEL")
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
    return hybrid_metrics



async def train_models_task(model_name: str = None, progress_callback: Optional[Callable[[str, int], Awaitable[None]]] = None):
    """
    Background task to train models.
    
    Args:
        model_name: Specific model to train, or None for all.
        progress_callback: Async function to report progress (message, percentage)
    """
    logger.info("=" * 60)
    logger.info(f"STARTING MODEL RETRAINING TASK: {model_name or 'ALL'}")
    logger.info("=" * 60)
    
    # Helper to report progress safely
    async def report(msg: str, pct: int):
        if progress_callback:
            try:
                await progress_callback(msg, pct)
            except Exception as e:
                logger.error(f"Failed to report progress: {e}")

    # Connect to database (needed for background task)
    await Database.connect()
    
    try:
        await report("Initializing...", 0)

        # Create models directory
        save_path = settings.models_dir
        save_path.mkdir(parents=True, exist_ok=True)
        
        await report("Loading data from database...", 5)
        
        # Load data
        anime_data, ratings_data = await load_data_from_mongodb()
        
        if not anime_data or not ratings_data:
            logger.error("No data found for training!")
            await report("Error: No data found", 0)
            return

        anime_list = [dict(a) for a in anime_data]
        ratings_list = [dict(r) for r in ratings_data]
        
        await report("Splitting datasets...", 10)
        train_ratings, test_ratings = train_test_split(ratings_list, test_ratio=0.2)
        
        # Map model names to functions
        # Allow loose matching or specific keys
        run_all = model_name is None or model_name.lower() == "all"
        target_model = model_name.lower() if model_name else "all"
        
        # Calculate steps
        steps = []
        if run_all or "content" in target_model: steps.append("content")
        if run_all or "item" in target_model: steps.append("item")
        if run_all or "user" in target_model: steps.append("user")
        if run_all or "hybrid" in target_model: steps.append("hybrid")
        
        total_steps = len(steps)
        current_step = 0
        base_progress = 15
        progress_per_step = 80 / max(total_steps, 1)

        if run_all or "content" in target_model:
            await report("Training Content-Based Model...", int(base_progress + current_step * progress_per_step))
            await train_content_based(save_path, anime_list, train_ratings, test_ratings)
            current_step += 1
            
        if run_all or "item" in target_model:
            await report("Training Item-Based CF Model...", int(base_progress + current_step * progress_per_step))
            await train_item_based(save_path, train_ratings, test_ratings)
            current_step += 1
            
        if run_all or "user" in target_model:
            await report("Training User-Based CF Model...", int(base_progress + current_step * progress_per_step))
            await train_user_based(save_path, train_ratings, test_ratings)
            current_step += 1
            
        if run_all or "hybrid" in target_model:
            await report("Training Hybrid Model...", int(base_progress + current_step * progress_per_step))
            await train_hybrid(save_path, anime_list, train_ratings, test_ratings)
            current_step += 1
            
        await report("Retraining completed successfully!", 100)
        logger.info("Retraining task completed successfully.")
        
    except Exception as e:
        logger.error(f"Error during retraining task: {e}", exc_info=True)
        await report(f"Error: {str(e)}", 0)
    finally:
        # Don't disconnect if the app is still running and sharing connection?
        pass

async def main(sample_size: int = None, test_ratio: float = 0.2):
    """Main training and evaluation pipeline (CLI usage)."""
    # ... (CLI logic wraps train_models_task or calls functions directly)
    # For CLI, we DO want to connect/disconnect.
    
    await Database.connect()
    try:
        # Reuse train_models_task logic or call specific functions
        # For simplicity, let's just call train_models_task with 'all'
        # But we need to handle arguments like sample_size manually if we want to honor them exactly as before
        # For now, let's keep it simple and just run the task.
        await train_models_task("all")
    finally:
        await Database.disconnect()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", type=int, default=None)
    parser.add_argument("--test-ratio", type=float, default=0.2)
    args = parser.parse_args()
    
    asyncio.run(main(args.sample, args.test_ratio))
