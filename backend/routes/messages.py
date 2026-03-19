from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.post import Message
from schemas.schemas import MessageCreate, MessageResponse, UserBase

router = APIRouter()

@router.get("/conversations")
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).all()
    seen = set()
    conversations = []
    for msg in messages:
        other_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        if other_id not in seen:
            seen.add(other_id)
            other = db.query(User).filter(User.id == other_id).first()
            unread = db.query(Message).filter(
                Message.sender_id == other_id,
                Message.receiver_id == current_user.id,
                Message.is_read == False,
            ).count()
            conversations.append({
                "user": {"id": other.id, "username": other.username, "avatar_url": other.avatar_url},
                "last_message": msg.content,
                "unread_count": unread,
            })
    return conversations

@router.get("/{user_id}")
def get_thread(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
        )
    ).order_by(Message.created_at.asc()).all()
    db.query(Message).filter(Message.sender_id == user_id, Message.receiver_id == current_user.id, Message.is_read == False).update({"is_read": True})
    db.commit()
    return [{"id": m.id, "sender_id": m.sender_id, "content": m.content, "is_read": m.is_read, "created_at": m.created_at} for m in messages]

@router.post("")
def send_message(req: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.query(User).filter(User.id == req.receiver_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    msg = Message(sender_id=current_user.id, receiver_id=req.receiver_id, content=req.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "content": msg.content, "created_at": msg.created_at}
