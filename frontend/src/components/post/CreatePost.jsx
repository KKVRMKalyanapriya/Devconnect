import { useState } from "react";
import { createPost } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./CreatePost.module.css";

export default function CreatePost({ onPost }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await createPost({
        content,
        code_snippet: code || null,
        language: language || null,
      });
      onPost?.(res.data);
      setContent(""); setCode(""); setLanguage(""); setShowCode(false);
      toast.success("Posted!");
    } catch {
      toast.error("Failed to post");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <div className={`avatar ${styles.avatar}`}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          ) : (
            user?.username?.[0]?.toUpperCase()
          )}
        </div>
        <textarea
          className={`input-field ${styles.textarea}`}
          placeholder="Share something with the dev community..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
      </div>

      {showCode && (
        <div className={styles.codeSection}>
          <input
            className="input-field"
            placeholder="Language (e.g. python, javascript)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <textarea
            className={`input-field ${styles.codeInput}`}
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={5}
          />
        </div>
      )}

      <div className={styles.footer}>
        <button
          type="button"
          className={`btn-secondary ${styles.codeBtn}`}
          onClick={() => setShowCode((v) => !v)}
        >
          {"</>"}  {showCode ? "Remove code" : "Add code"}
        </button>
        <button type="submit" className="btn-primary" disabled={loading || !content.trim()}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
