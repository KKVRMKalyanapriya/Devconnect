from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from routes import auth, users, posts, comments, likes, follows, notifications, search, messages

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DevConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(comments.router, prefix="/posts", tags=["Comments"])
app.include_router(likes.router, prefix="/posts", tags=["Likes"])
app.include_router(follows.router, prefix="/users", tags=["Follows"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(messages.router, prefix="/messages", tags=["Messages"])

@app.get("/health")
def health():
    return {"status": "healthy"}
