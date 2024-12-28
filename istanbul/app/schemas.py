from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class PostCreate(BaseModel):
    title: str
    content: str
    author: str

class ConcertCreate(BaseModel):
    title: str
    venue: str
    date: str
    price: float
    description: Optional[str] = None
    lineup: Optional[str] = None

class Concert(ConcertCreate):
    id: int
    image_path: str
    created_at: datetime

    class Config:
        orm_mode = True

class AdminBase(BaseModel):
    username: str
    email: str

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: int
    is_superadmin: bool
    created_at: datetime

    class Config:
        orm_mode = True
