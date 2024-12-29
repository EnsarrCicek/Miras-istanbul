from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from datetime import datetime
from .database import Base
from sqlalchemy.orm import relationship

class Followers(Base):
    __tablename__ = "followers"

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey('kullanici.id', ondelete='CASCADE'))
    following_id = Column(Integer, ForeignKey('kullanici.id', ondelete='CASCADE'))
    created_at = Column(DateTime, default=datetime.utcnow)

class Messages(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('kullanici.id', ondelete='CASCADE'))
    receiver_id = Column(Integer, ForeignKey('kullanici.id', ondelete='CASCADE'))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, ForeignKey('kullanici.id', ondelete='CASCADE'))
    media_type = Column(String(10))  # 'photo' veya 'video'
    file_path = Column(String(255))
    caption = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Kullanıcı ilişkisi
    kullanici = relationship("Kullanici", back_populates="media")

class Kullanici(Base):
    __tablename__ = "kullanici"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True)
    password = Column(String(255))
    profile_image = Column(String(255))
    bio = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Medya ilişkisi
    media = relationship("Media", back_populates="kullanici")
    
    # Takipçi ilişkileri
    followers = relationship(
        "Followers",
        foreign_keys=[Followers.following_id],
        backref="following",
        cascade="all, delete-orphan"
    )
    following = relationship(
        "Followers",
        foreign_keys=[Followers.follower_id],
        backref="follower",
        cascade="all, delete-orphan"
    )

    # Mesaj ilişkileri
    sent_messages = relationship(
        "Messages",
        foreign_keys=[Messages.sender_id],
        backref="sender",
        cascade="all, delete-orphan"
    )
    received_messages = relationship(
        "Messages",
        foreign_keys=[Messages.receiver_id],
        backref="receiver",
        cascade="all, delete-orphan"
    )

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    content = Column(String(1000))
    author = Column(String(255))
    image_path = Column(String(255))

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

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    email = Column(String(255), unique=True)
    is_superadmin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
