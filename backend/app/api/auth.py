"""
Authentication API endpoints.
Simple user authentication by user_id (no password required).
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.database import Database, Collections, UserInDB

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request schema."""
    user_id: int


class LoginResponse(BaseModel):
    """Login response schema."""
    success: bool
    user_id: int
    message: str


class LogoutResponse(BaseModel):
    """Logout response schema."""
    success: bool
    message: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login by user_id.
    Creates a new user if not exists.
    No password required as per requirements.
    """
    try:
        db = Database.get_db()
        users_collection = db[Collections.USERS]
        
        # Check if user exists
        existing_user = await users_collection.find_one({"user_id": request.user_id})
        
        if existing_user:
            # Update last login
            await users_collection.update_one(
                {"user_id": request.user_id},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            message = "Login successful"
        else:
            # Create new user
            new_user = UserInDB(
                user_id=request.user_id,
                created_at=datetime.utcnow(),
                last_login=datetime.utcnow()
            )
            await users_collection.insert_one(new_user.model_dump(by_alias=True, exclude={"id"}))
            message = "New user created and logged in"
        
        return LoginResponse(
            success=True,
            user_id=request.user_id,
            message=message
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout():
    """
    Logout endpoint.
    Since we don't use sessions/tokens, this just returns success.
    Frontend handles clearing localStorage.
    """
    return LogoutResponse(
        success=True,
        message="Logout successful"
    )


@router.get("/verify/{user_id}")
async def verify_user(user_id: int):
    """
    Verify if a user exists in the database.
    """
    try:
        db = Database.get_db()
        users_collection = db[Collections.USERS]
        
        user = await users_collection.find_one({"user_id": user_id})
        
        if user:
            return {
                "exists": True,
                "user_id": user_id,
                "created_at": user.get("created_at"),
                "last_login": user.get("last_login")
            }
        else:
            return {
                "exists": False,
                "user_id": user_id
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )
