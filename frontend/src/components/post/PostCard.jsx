import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { likePost, unlikePost, deletePost, getComments, addComment } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import styles from "./PostCard.module.css";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const toggleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const res = await getComments(post.id);
        setComments(res.data);
      } catch {}
      setLoadingComments(false);
    }
    setShowComments((v) => !v);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await addComment(post.id, { content: commentText });
      setComments((c) => [...c, res.data]);
      setCommentText("");
    } catch {
      toast.error("Failed to comment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post.id);
      toast.success("Post deleted");
      onDelete?.(post.id);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className={`${styles.card} fade-in`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.authorInfo} onClick={() => navigate(`/profile/${post.author.id}`)}>
          <div className={`avatar ${styles.avatar}`}>
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} alt="" />
            ) : (
              post.author.username[0].toUpperCase()
            )}
          </div>
          <div>
            <div className={styles.authorName}>{post.author.full_name || post.author.username}</div>
            <div className={styles.authorMeta}>
              @{post.author.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        {user?.id === post.author.id && (
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        )}
      </div>

      {/* Content */}
      <p className={styles.content}>{post.content}</p>
      {post.code_snippet && (
        <pre>
          {post.language && <span className={styles.langTag}>{post.language}</span>}
          {"\n"}{post.code_snippet}
        </pre>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
          onClick={toggleLike}
        >
          {liked ? "♥" : "♡"} <span>{likeCount}</span>
        </button>
        <button className={styles.actionBtn} onClick={toggleComments}>
          ◎ <span>{post.comment_count}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className={styles.comments}>
          {loadingComments ? (
            <div className="spinner" style={{ margin: "16px auto" }} />
          ) : (
            <>
              {comments.map((c) => (
                <div key={c.id} className={styles.comment}>
                  <span
                    className={styles.commentAuthor}
                    onClick={() => navigate(`/profile/${c.author.id}`)}
                  >
                    @{c.author.username}
                  </span>
                  <span className={styles.commentText}>{c.content}</span>
                </div>
              ))}
              <form onSubmit={submitComment} className={styles.commentForm}>
                <input
                  className="input-field"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn-primary">Post</button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
