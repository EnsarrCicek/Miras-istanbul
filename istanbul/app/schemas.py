from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class KullaniciBase(BaseModel):
    username: str
    email: str

class KullaniciCreate(KullaniciBase):
    password: str

class Kullanici(KullaniciBase):
    id: int
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

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
    password: str
    email: str

class AdminCreate(AdminBase):
    pass

class Admin(AdminBase):
    id: int
    is_superadmin: bool
    created_at: datetime

    class Config:
        orm_mode = True

class CommentBase(BaseModel):
    comment: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    kullanici_id: int
    media_id: int
    username: str
    user_image: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class MediaDetail(BaseModel):
    id: int
    file_path: str
    title: str
    caption: Optional[str]
    author: str
    like_count: int
    comment_count: int
    created_at: datetime
    is_liked: bool
    comments: List[Comment]

    class Config:
        orm_mode = True

class LikeAction(BaseModel):
    action: str  # 'like' veya 'unlike'

class UserBase(BaseModel):
    username: str
    email: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

class UserAdmin(UserBase):
    id: int
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    follower_count: int
    following_count: int

    class Config:
        from_attributes = True
