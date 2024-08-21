from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
