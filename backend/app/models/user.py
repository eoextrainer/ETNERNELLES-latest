"""
User model for KCD Platform
"""
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user", nullable=False)  # admin, manager, moderator, user
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    subscription_tier = Column(String, default="free")  # free, premium, demo, admin, manager, moderator
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Profile metadata
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    user_metadata = Column(JSON, default={})
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class Workspace(Base):
    """User workspace configuration"""
    __tablename__ = "workspaces"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    user_email = Column(String, nullable=True, index=True)
    role = Column(String, nullable=False)
    workspace_name = Column(String, nullable=False)
    workspace_description = Column(String, nullable=True)
    theme = Column(String, default="aura")  # aura, atelier, ivory, noir
    widgets = Column(JSON, default=[])
    layout = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Workspace(id={self.id}, workspace_name={self.workspace_name})>"


class ChatMessage(Base):
    """Chat message model"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String, nullable=False)
    channel = Column(String, default="community", nullable=False)  # community, moderator
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, user_id={self.user_id}, channel={self.channel})>"


class MediaAsset(Base):
    """Portfolio media asset"""
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # image, video
    caption = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<MediaAsset(id={self.id}, user_id={self.user_id}, file_type={self.file_type})>"
