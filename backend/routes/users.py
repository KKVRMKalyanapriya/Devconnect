from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.post import Follow, Notification
from schemas.schemas import UserProfile, UpdateProfileRequest

router = APIRouter()

@router.get("/{user_id}", response_model=UserProfile)
def get_profile(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    is_following = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first() is not None
    return UserProfile(
        **{c.name: getattr(user, c.name) for c in user.__table__.columns},
        follower_count=len(user.followers),
        following_count=len(user.following),
        post_count=len(user.posts),
        is_following=is_following,
    )

@router.put("/{user_id}", response_model=UserProfile)
def update_profile(user_id: int, req: UpdateProfileRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    for field, value in req.dict(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserProfile(
        **{c.name: getattr(current_user, c.name) for c in current_user.__table__.columns},
        follower_count=len(current_user.followers),
        following_count=len(current_user.following),
        post_count=len(current_user.posts),
        is_following=False,
    )

@router.post("/{user_id}/follow")
def follow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(Follow).filter(Follow.follower_id == current_user.id, Follow.following_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already following")
    follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    notif = Notification(
        user_id=user_id,
        type="follow",
        message=f"{current_user.username} started following you",
        related_id=current_user.id,
    )
    db.add(notif)
    db.commit()
    return {"message": "Followed successfully"}

@router.delete("/{user_id}/follow")
def unfollow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    follow = db.query(Follow).filter(Follow.follower_id == current_user.id, Follow.following_id == user_id).first()
    if not follow:
        raise HTTPException(status_code=400, detail="Not following")
    db.delete(follow)
    db.commit()
    return {"message": "Unfollowed successfully"}

@router.get("/{user_id}/followers")
def get_followers(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return [{"id": f.follower.id, "username": f.follower.username, "avatar_url": f.follower.avatar_url} for f in user.followers]

@router.get("/{user_id}/following")
def get_following(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return [{"id": f.following.id, "username": f.following.username, "avatar_url": f.following.avatar_url} for f in user.following]
