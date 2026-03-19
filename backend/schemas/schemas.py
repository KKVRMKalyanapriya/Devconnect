from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User ──────────────────────────────────────────────
class UserBase(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    github_url: Optional[str]
    skills: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfile(UserBase):
    follower_count: int = 0
    following_count: int = 0
    post_count: int = 0
    is_following: bool = False

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    skills: Optional[str] = None


# ── Post ──────────────────────────────────────────────
class PostCreate(BaseModel):
    content: str
    code_snippet: Optional[str] = None
    language: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    content: str
    code_snippet: Optional[str]
    language: Optional[str]
    author: UserBase
    like_count: int = 0
    comment_count: int = 0
    is_liked: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# ── Comment ───────────────────────────────────────────
class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    author: UserBase
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notification ──────────────────────────────────────
class NotificationResponse(BaseModel):
    id: int
    type: str
    message: str
    is_read: bool
    related_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Message ───────────────────────────────────────────
class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender: UserBase
    receiver: UserBase
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationUser(BaseModel):
    user: UserBase
    last_message: str
    unread_count: int
