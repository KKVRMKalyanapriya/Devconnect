import { useState } from "react";
import { updateProfile } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./Settings.module.css";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    avatar_url: user?.avatar_url || "",
    github_url: user?.github_url || "",
    skills: user?.skills || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(user.id, form);
      setUser((u) => ({ ...u, ...res.data }));
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <p className={styles.sub}>Update your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Profile</h3>

            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className="input-field"
                placeholder="Your full name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Bio</label>
              <textarea
                className="input-field"
                placeholder="Tell the community about yourself..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Avatar URL</label>
              <input
                className="input-field"
                placeholder="https://your-avatar-url.com/image.jpg"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              />
              {form.avatar_url && (
                <img
                  src={form.avatar_url}
                  alt="Preview"
                  className={styles.avatarPreview}
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>GitHub URL</label>
              <input
                className="input-field"
                placeholder="https://github.com/yourusername"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Skills</label>
              <input
                className="input-field"
                placeholder="Python, Docker, Kubernetes, React (comma-separated)"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
              <p className={styles.hint}>Separate skills with commas</p>
            </div>
          </div>

          <div className={styles.readonlySection}>
            <h3 className={styles.sectionTitle}>Account</h3>
            <div className={styles.readonlyField}>
              <span className={styles.label}>Username</span>
              <span className={styles.readonlyVal}>@{user?.username}</span>
            </div>
            <div className={styles.readonlyField}>
              <span className={styles.label}>Email</span>
              <span className={styles.readonlyVal}>{user?.email}</span>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: "flex-start", padding: "12px 28px" }}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
