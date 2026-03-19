import { useState, useEffect } from "react";
import { getFeed } from "../utils/api";
import PostCard from "../components/post/PostCard";
import CreatePost from "../components/post/CreatePost";
import styles from "./Feed.module.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeed()
      .then((r) => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePost = (newPost) => setPosts((p) => [newPost, ...p]);
  const handleDelete = (id) => setPosts((p) => p.filter((post) => post.id !== id));

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Feed</h2>
          <p className={styles.sub}>Posts from developers you follow</p>
        </div>
        <CreatePost onPost={handlePost} />
        {loading ? (
          <div className="spinner" />
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◎</div>
            <p>Your feed is empty. Follow some developers!</p>
          </div>
        ) : (
          <div className={styles.posts}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
