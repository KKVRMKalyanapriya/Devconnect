import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConversations, getThread, sendMessage } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import styles from "./Messages.module.css";

export default function Messages() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getConversations().then((r) => setConversations(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;
    getThread(userId).then((r) => setThread(r.data)).catch(() => {});
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await sendMessage({ receiver_id: parseInt(userId), content: text });
      setThread((t) => [...t, { ...res.data, sender_id: me.id }]);
      setText("");
    } catch {
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  const activeConv = conversations.find((c) => c.user.id === parseInt(userId));

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.title}>Messages</h2>
        </div>
        {conversations.length === 0 ? (
          <div className={styles.empty}>
            <p>No conversations yet</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Follow developers and start chatting!</p>
          </div>
        ) : (
          conversations.map((c) => (
            <div
              key={c.user.id}
              className={`${styles.convItem} ${c.user.id === parseInt(userId) ? styles.active : ""}`}
              onClick={() => navigate(`/messages/${c.user.id}`)}
            >
              <div className={`avatar ${styles.convAvatar}`}>
                {c.user.avatar_url ? (
                  <img src={c.user.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                ) : c.user.username[0].toUpperCase()}
              </div>
              <div className={styles.convInfo}>
                <div className={styles.convName}>@{c.user.username}</div>
                <div className={styles.convLast}>{c.last_message}</div>
              </div>
              {c.unread_count > 0 && (
                <span className={styles.unread}>{c.unread_count}</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Thread */}
      <div className={styles.thread}>
        {!userId ? (
          <div className={styles.noThread}>
            <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>◻</div>
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            <div className={styles.threadHeader}>
              <div className={`avatar ${styles.threadAvatar}`}>
                {activeConv?.user?.avatar_url ? (
                  <img src={activeConv.user.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                ) : (activeConv?.user?.username?.[0]?.toUpperCase() || "?")}
              </div>
              <span className={styles.threadName}>@{activeConv?.user?.username || "..."}</span>
            </div>

            <div className={styles.messages}>
              {thread.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.bubble} ${m.sender_id === me.id ? styles.mine : styles.theirs}`}
                >
                  <div className={styles.bubbleText}>{m.content}</div>
                  <div className={styles.bubbleTime}>
                    {m.created_at ? formatDistanceToNow(new Date(m.created_at), { addSuffix: true }) : ""}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className={styles.inputRow}>
              <input
                className="input-field"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={sending || !text.trim()}>
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
