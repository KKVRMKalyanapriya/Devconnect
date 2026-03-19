from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.post import Post

router = APIRouter()

@router.get("")
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).filter(
        or_(User.username.ilike(f"%{q}%"), User.full_name.ilike(f"%{q}%"), User.skills.ilike(f"%{q}%"))
    ).limit(10).all()
    posts = db.query(Post).filter(Post.content.ilike(f"%{q}%")).order_by(Post.created_at.desc()).limit(10).all()
    return {
        "users": [{"id": u.id, "username": u.username, "full_name": u.full_name, "avatar_url": u.avatar_url, "skills": u.skills} for u in users],
        "posts": [{"id": p.id, "content": p.content[:100], "author": {"id": p.author.id, "username": p.author.username}} for p in posts],
    }
