from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.post import Post, Like, Notification

router = APIRouter()

@router.post("/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    existing = db.query(Like).filter(Like.user_id == current_user.id, Like.post_id == post_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already liked")
    like = Like(user_id=current_user.id, post_id=post_id)
    db.add(like)
    if post.author_id != current_user.id:
        notif = Notification(
            user_id=post.author_id,
            type="like",
            message=f"{current_user.username} liked your post",
            related_id=post_id,
        )
        db.add(notif)
    db.commit()
    return {"message": "Post liked"}

@router.delete("/{post_id}/like")
def unlike_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    like = db.query(Like).filter(Like.user_id == current_user.id, Like.post_id == post_id).first()
    if not like:
        raise HTTPException(status_code=400, detail="Not liked")
    db.delete(like)
    db.commit()
    return {"message": "Post unliked"}
