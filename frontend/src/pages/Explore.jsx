import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExplore, search } from "../utils/api";
import PostCard from "../components/post/PostCard";
import styles from "./Explore.module.css";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getExplore()
      .then((r) => setPosts(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await search(query);
        setResults(res.data);
      } catch {}
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const handleDelete = (id) => setPosts((p) => p.filter((post) => post.id !== id));

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search developers, skills, posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && <span className={styles.searchSpin} />}
        </div>

        {results ? (
          <div className={styles.results}>
            {results.users.length > 0 && (
              <div>
                <h3 className={styles.sectionTitle}>Developers</h3>
                <div className={styles.userGrid}>
                  {results.users.map((u) => (
                    <div key={u.id} className={styles.userChip} onClick={() => navigate(`/profile/${u.id}`)}>
                      <div className={`avatar ${styles.chipAvatar}`}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.chipName}>@{u.username}</div>
                        {u.skills && <div className={styles.chipSkills}>{u.skills}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {results.posts.length > 0 && (
              <div>
                <h3 className={styles.sectionTitle}>Posts</h3>
                {results.posts.map((p) => (
                  <div key={p.id} className={styles.postResult}>
                    <span className={styles.postAuthor} onClick={() => navigate(`/profile/${p.author.id}`)}>
                      @{p.author.username}
                    </span>
                    <span className={styles.postPreview}>{p.content}</span>
                  </div>
                ))}
              </div>
            )}
            {results.users.length === 0 && results.posts.length === 0 && (
              <p className={styles.noResults}>No results for "{query}"</p>
            )}
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Explore</h2>
              <p className={styles.sub}>Discover what the community is building</p>
            </div>
            {loading ? (
              <div className="spinner" />
            ) : (
              <div className={styles.posts}>
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
