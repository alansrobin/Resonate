# backend/app/core/dependencies.py

from fastapi import Depends, HTTPException, status
from app.core.security import decode_access_token
from app.routers.auth import oauth2_scheme

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not an admin user")
    return current_user