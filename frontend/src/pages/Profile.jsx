import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfile, getUserPosts, followUser, unfollowUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/post/PostCard";
import toast from "react-hot-toast";
import styles from "./Profile.module.css";

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProfile(id), getUserPosts(id)])
      .then(([p, po]) => { setProfile(p.data); setPosts(po.data); })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await unfollowUser(id);
        setProfile((p) => ({ ...p, is_following: false, follower_count: p.follower_count - 1 }));
      } else {
        await followUser(id);
        setProfile((p) => ({ ...p, is_following: true, follower_count: p.follower_count + 1 }));
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Action failed");
    }
    setFollowLoading(false);
  };

  const handleDelete = (postId) => setPosts((p) => p.filter((post) => post.id !== postId));

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!profile) return <div className={styles.page}><p style={{ color: "var(--text2)" }}>User not found.</p></div>;

  const isMe = me?.id === parseInt(id);
  const skills = profile.skills ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className={styles.page}>
      {/* Cover */}
      <div className={styles.cover}>
        <div className={styles.coverPattern} />
      </div>

      <div className={styles.content}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={`avatar ${styles.avatar}`}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              profile.username[0].toUpperCase()
            )}
          </div>

          <div className={styles.headerRight}>
            <div className={styles.nameRow}>
              <div>
                <h1 className={styles.name}>{profile.full_name || profile.username}</h1>
                <p className={styles.username}>@{profile.username}</p>
              </div>
              {isMe ? (
                <button className="btn-secondary" onClick={() => navigate("/settings")}>Edit Profile</button>
              ) : (
                <button
                  className={profile.is_following ? "btn-secondary" : "btn-primary"}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? "..." : profile.is_following ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>

            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className={styles.github}>
                ⎇ GitHub
              </a>
            )}

            {skills.length > 0 && (
              <div className={styles.skills}>
                {skills.map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            )}

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{profile.post_count}</span>
                <span className={styles.statLabel}>Posts</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{profile.follower_count}</span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{profile.following_count}</span>
                <span className={styles.statLabel}>Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className={styles.postsSection}>
          <h3 className={styles.postsTitle}>Posts</h3>
          {posts.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: 40, opacity: 0.2, marginBottom: 12 }}>◎</div>
              <p>No posts yet</p>
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
    </div>
  );
}
