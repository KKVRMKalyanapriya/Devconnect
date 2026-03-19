from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.post import Post, Follow, Like
from schemas.schemas import PostCreate, PostResponse, UserBase

router = APIRouter()

def build_post_response(post: Post, current_user: User, db: Session) -> PostResponse:
    is_liked = db.query(Like).filter(Like.user_id == current_user.id, Like.post_id == post.id).first() is not None
    return PostResponse(
        id=post.id,
        content=post.content,
        code_snippet=post.code_snippet,
        language=post.language,
        author=UserBase(**{c.name: getattr(post.author, c.name) for c in post.author.__table__.columns}),
        like_count=len(post.likes),
        comment_count=len(post.comments),
        is_liked=is_liked,
        created_at=post.created_at,
    )

@router.get("/feed", response_model=List[PostResponse])
def get_feed(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    following_ids = [f.following_id for f in current_user.following]
    following_ids.append(current_user.id)
    posts = db.query(Post).filter(Post.author_id.in_(following_ids)).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return [build_post_response(p, current_user, db) for p in posts]

@router.get("/explore", response_model=List[PostResponse])
def explore(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return [build_post_response(p, current_user, db) for p in posts]

@router.post("", response_model=PostResponse)
def create_post(req: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = Post(content=req.content, code_snippet=req.code_snippet, language=req.language, author_id=current_user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return build_post_response(post, current_user, db)

@router.get("/user/{user_id}", response_model=List[PostResponse])
def get_user_posts(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    posts = db.query(Post).filter(Post.author_id == user_id).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return [build_post_response(p, current_user, db) for p in posts]

@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}
