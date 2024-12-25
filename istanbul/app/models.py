from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(255))
    password = Column(String(255))


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    content = Column(String(1000))
    author = Column(String(255))
    image_path = Column(String(255))  # Fotoğrafın kaydedileceği yol


class Concert(Base):
    __tablename__ = "concerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    venue = Column(String(255), nullable=False)
    date = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String(1000))
    image_path = Column(String(255))
    lineup = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
