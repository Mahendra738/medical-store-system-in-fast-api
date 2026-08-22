from pydantic import BaseModel, EmailStr, ConfigDict
from app.core.enums import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    password: str
    role: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    phone_number: str
    role: UserRole
    is_active: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse