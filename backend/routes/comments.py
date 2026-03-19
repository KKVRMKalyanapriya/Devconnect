from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.post import Post, Comment, Like, Notification
from schemas.schemas import CommentCreate, CommentResponse, UserBase

router = APIRouter()

@router.post("/{post_id}/comments", response_model=CommentResponse)
def add_comment(post_id: int, req: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = Comment(content=req.content, author_id=current_user.id, post_id=post_id)
    db.add(comment)
    if post.author_id != current_user.id:
        notif = Notification(
            user_id=post.author_id,
            type="comment",
            message=f"{current_user.username} commented on your post",
            related_id=post_id,
        )
        db.add(notif)
    db.commit()
    db.refresh(comment)
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author=UserBase(**{c.name: getattr(current_user, c.name) for c in current_user.__table__.columns}),
        created_at=comment.created_at,
    )

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    return [
        CommentResponse(
            id=c.id,
            content=c.content,
            author=UserBase(**{col.name: getattr(c.author, col.name) for col in c.author.__table__.columns}),
            created_at=c.created_at,
        ) for c in comments
    ]
