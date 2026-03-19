import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAllRead } from "../utils/api";
import { formatDistanceToNow } from "date-fns";
import styles from "./Notifications.module.css";

const ICONS = { like: "♥", comment: "◎", follow: "◈" };
const COLORS = { like: "var(--accent2)", comment: "var(--accent)", follow: "var(--accent3)" };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications()
      .then((r) => setNotifications(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((n) => n.map((notif) => ({ ...notif, is_read: true })));
  };

  const handleClick = (notif) => {
    if (notif.type === "follow") navigate(`/profile/${notif.related_id}`);
    else if (notif.related_id) navigate(`/explore`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Notifications</h2>
            <p className={styles.sub}>Stay up to date with your activity</p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <button className="btn-secondary" onClick={handleMarkAll}>Mark all read</button>
          )}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>◈</div>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`${styles.item} ${!n.is_read ? styles.unread : ""}`}
                onClick={() => handleClick(n)}
              >
                <div
                  className={styles.icon}
                  style={{ color: COLORS[n.type] || "var(--accent)" }}
                >
                  {ICONS[n.type] || "◈"}
                </div>
                <div className={styles.info}>
                  <p className={styles.message}>{n.message}</p>
                  <p className={styles.time}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.is_read && <div className={styles.dot} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
