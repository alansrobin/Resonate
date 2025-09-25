from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    name: str
    email: EmailStr
    role: str

class TokenData(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_email: str
    role: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
