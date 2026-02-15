"""
User schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "user"

class UserCreate(UserBase):
    """User creation schema"""
    password: str
    is_verified: bool = False

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_active: bool
    is_verified: bool
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class WorkspaceBase(BaseModel):
    """Base workspace schema"""
    workspace_name: str
    workspace_description: Optional[str] = None
    theme: str = "dark"
    widgets: List[str] = []

class WorkspaceCreate(WorkspaceBase):
    """Workspace creation schema"""
    user_id: Optional[int] = None
    role: str

class WorkspaceUpdate(BaseModel):
    """Workspace update schema"""
    workspace_name: Optional[str] = None
    workspace_description: Optional[str] = None
    theme: Optional[str] = None
    widgets: Optional[List[str]] = None
    layout: Optional[dict] = None

class WorkspaceResponse(WorkspaceBase):
    """Workspace response schema"""
    id: int
    user_id: Optional[int] = None
    role: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChatMessageBase(BaseModel):
    channel: str = "community"
    content: str


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class MediaAssetResponse(BaseModel):
    id: int
    user_id: int
    file_url: str
    file_type: str
    caption: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
