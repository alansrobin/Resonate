from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import timedelta
from motor.core import AgnosticDatabase
import os

from app.core.db import get_database
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenData, PasswordResetRequest, PasswordResetConfirm
from app.services.email import send_password_reset_email

router = APIRouter(tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup_user(user: UserCreate, db: AgnosticDatabase = Depends(get_database)):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_data = user.model_dump()
    user_data["hashed_password"] = hashed_password
    del user_data["password"]

    await db.users.insert_one(user_data)
    return user_data

@router.post("/login", response_model=TokenData)
async def login_for_access_token(user_data: UserLogin, db: AgnosticDatabase = Depends(get_database)):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=30)
    
    # CORRECTED: The user's role is now included in the token payload.
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return TokenData(
        access_token=access_token, 
        token_type="bearer", 
        user_name=user.get("name"), 
        user_email=user.get("email"), 
        role=user.get("role")
    )

@router.post("/forgot-password")
async def forgot_password(req: PasswordResetRequest, db: AgnosticDatabase = Depends(get_database)):
    user = await db.users.find_one({"email": req.email})
    if not user:
        # Explicitly tell client to sign up
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not registered. Please sign up.")

    # Create a short-lived reset token
    reset_token = create_access_token(
        data={"sub": req.email, "action": "reset"},
        expires_delta=timedelta(minutes=30)
    )

    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
    reset_url = f"{frontend_base}/reset-password?token={reset_token}"

    # Send email (dev logs)
    send_password_reset_email(req.email, reset_url)

    # Return message (and reset_url to ease local testing)
    return {"message": "Password reset link sent to your email.", "reset_url": reset_url}

@router.post("/reset-password")
async def reset_password(body: PasswordResetConfirm, db: AgnosticDatabase = Depends(get_database)):
    payload = decode_access_token(body.token)
    if not payload or payload.get("action") != "reset" or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    email = payload["sub"]
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_hashed = get_password_hash(body.new_password)
    await db.users.update_one({"email": email}, {"$set": {"hashed_password": new_hashed}})

    return {"message": "Password updated successfully"}
