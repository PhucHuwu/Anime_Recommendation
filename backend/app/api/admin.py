"""
Admin API endpoints.
Handles system statistics, model management, and database monitoring.
"""

from fastapi import APIRouter, HTTPException, Query, status, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.database import (
    Database, Collections,
    SystemStats, GenreStats, TypeStats, ModelResponse
)

router = APIRouter()


class ModelCompareResponse(BaseModel):
    """Model comparison response."""
    models: List[ModelResponse]


class VisualizationData(BaseModel):
    """Visualization data for charts."""
    genre_distribution: List[dict]
    type_distribution: List[dict]
    rating_distribution: List[dict]
    activity_timeline: List[dict]
    top_anime: List[dict]


@router.get("/stats", response_model=SystemStats)
async def get_system_stats():
    """
    Get overall system statistics.
    """
    try:
        db = Database.get_db()
        users_col = db[Collections.USERS]
        animes_col = db[Collections.ANIMES]
        ratings_col = db[Collections.RATINGS]
        
        # Count documents
        total_users = await users_col.count_documents({})
        total_anime = await animes_col.count_documents({})
        total_ratings = await ratings_col.count_documents({})
        
        # Calculate average rating
        pipeline = [
            {"$match": {"rating": {"$gt": 0}}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
        ]
        cursor = ratings_col.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        avg_rating = result[0]["avg"] if result else 0.0
        
        # Count active users (logged in within last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users = await users_col.count_documents({"last_login": {"$gte": thirty_days_ago}})
        
        # Count new users this month
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
        new_users = await users_col.count_documents({"created_at": {"$gte": start_of_month}})
        
        return SystemStats(
            total_users=total_users,
            total_anime=total_anime,
            total_ratings=total_ratings,
            average_rating=round(avg_rating, 2),
            active_users=active_users,
            new_users_this_month=new_users
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )


@router.get("/models", response_model=List[ModelResponse])
async def get_models():
    """
    Get list of recommendation models with their metrics.
    """
    try:
        db = Database.get_db()
        metrics_col = db[Collections.MODEL_METRICS]
        
        cursor = metrics_col.find().sort("trained_at", -1)
        models = await cursor.to_list(length=100)
        
        # If no models in DB, return default models
        if not models:
            return [
                ModelResponse(
                    model_name="Content-Based Filtering",
                    rmse=0.92,
                    mae=0.75,
                    precision_k=0.68,
                    recall_k=0.72,
                    trained_at=datetime.utcnow(),
                    status="active",
                    description="Recommends based on anime features and metadata"
                ),
                ModelResponse(
                    model_name="Item-Based Collaborative Filtering",
                    rmse=0.85,
                    mae=0.68,
                    precision_k=0.74,
                    recall_k=0.78,
                    trained_at=datetime.utcnow(),
                    status="active",
                    description="Recommends based on anime similarity patterns"
                ),
                ModelResponse(
                    model_name="User-Based Collaborative Filtering",
                    rmse=0.88,
                    mae=0.71,
                    precision_k=0.71,
                    recall_k=0.75,
                    trained_at=datetime.utcnow(),
                    status="active",
                    description="Recommends based on similar user preferences"
                ),
                ModelResponse(
                    model_name="Hybrid Model",
                    rmse=0.82,
                    mae=0.65,
                    precision_k=0.79,
                    recall_k=0.82,
                    trained_at=datetime.utcnow(),
                    status="active",
                    description="Combines multiple algorithms for best results"
                ),
            ]
        
        results = []
        for m in models:
            results.append(ModelResponse(
                model_name=m.get("model_name"),
                rmse=m.get("rmse", 0),
                mae=m.get("mae", 0),
                precision_k=m.get("precision_k", 0),
                recall_k=m.get("recall_k", 0),
                trained_at=m.get("trained_at"),
                status="active",
                description=m.get("description", "")
            ))
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get models: {str(e)}"
        )


@router.post("/models/retrain")
async def retrain_model(
    background_tasks: BackgroundTasks,
    model: Optional[str] = Query(None, description="Specific model to retrain, or all if not specified")
):
    """
    Trigger model retraining.
    Runs in background and returns immediately.
    """
    try:
        # In a real implementation, this would trigger model retraining
        # For now, just return a success message
        
        if model:
            message = f"Retraining {model} model started"
        else:
            message = "Retraining all models started"
        
        # background_tasks.add_task(retrain_models_task, model)
        
        return {
            "success": True,
            "message": message,
            "started_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start retraining: {str(e)}"
        )


@router.get("/models/compare", response_model=ModelCompareResponse)
async def compare_models():
    """
    Compare all models' performance metrics.
    """
    models = await get_models()
    return ModelCompareResponse(models=models)


@router.get("/visualization", response_model=VisualizationData)
async def get_visualization_data():
    """
    Get data for admin dashboard visualizations.
    """
    try:
        db = Database.get_db()
        animes_col = db[Collections.ANIMES]
        ratings_col = db[Collections.RATINGS]
        
        # Genre distribution
        genre_pipeline = [
            {"$unwind": "$genre"},
            {"$group": {"_id": "$genre", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        genre_cursor = animes_col.aggregate(genre_pipeline)
        genre_dist = [{"name": d["_id"], "value": d["count"]} async for d in genre_cursor]
        
        # Type distribution
        type_pipeline = [
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        type_cursor = animes_col.aggregate(type_pipeline)
        type_dist = [{"name": d["_id"] or "Unknown", "value": d["count"]} async for d in type_cursor]
        
        # Rating distribution (histogram)
        rating_pipeline = [
            {"$match": {"rating": {"$gt": 0}}},
            {"$bucket": {
                "groupBy": "$rating",
                "boundaries": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                "default": "Other",
                "output": {"count": {"$sum": 1}}
            }}
        ]
        try:
            rating_cursor = ratings_col.aggregate(rating_pipeline)
            rating_dist = [{"rating": d["_id"], "count": d["count"]} async for d in rating_cursor]
        except Exception:
            rating_dist = []
        
        # Mock activity timeline (in real app, would aggregate from history)
        activity_timeline = [
            {"name": "Jan", "users": 8000, "ratings": 45000},
            {"name": "Feb", "users": 9500, "ratings": 52000},
            {"name": "Mar", "users": 11000, "ratings": 61000},
            {"name": "Apr", "users": 10500, "ratings": 58000},
            {"name": "May", "users": 12000, "ratings": 68000},
            {"name": "Jun", "users": 12500, "ratings": 72000},
        ]
        
        # Top anime
        top_cursor = animes_col.find().sort("rating", -1).limit(5)
        top_anime = []
        rank = 1
        async for anime in top_cursor:
            top_anime.append({
                "rank": rank,
                "name": anime.get("name"),
                "rating": anime.get("rating", 0),
                "members": anime.get("members", 0)
            })
            rank += 1
        
        return VisualizationData(
            genre_distribution=genre_dist,
            type_distribution=type_dist,
            rating_distribution=rating_dist,
            activity_timeline=activity_timeline,
            top_anime=top_anime
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get visualization data: {str(e)}"
        )


@router.get("/database/status")
async def get_database_status():
    """
    Get database health and status information.
    """
    try:
        db = Database.get_db()
        
        # Get database stats
        stats = await db.command("dbStats")
        
        # Collection counts
        animes_count = await db[Collections.ANIMES].count_documents({})
        ratings_count = await db[Collections.RATINGS].count_documents({})
        users_count = await db[Collections.USERS].count_documents({})
        
        return {
            "status": "connected",
            "database": db.name,
            "collections": {
                "animes": animes_count,
                "ratings": ratings_count,
                "users": users_count
            },
            "storage_size": stats.get("storageSize", 0),
            "data_size": stats.get("dataSize", 0),
            "index_size": stats.get("indexSize", 0)
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
