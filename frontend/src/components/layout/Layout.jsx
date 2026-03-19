import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { getUnreadCount } from "../../utils/api";
import styles from "./Layout.module.css";

const NAV = [
  { to: "/feed",          icon: "⬡", label: "Feed" },
  { to: "/explore",       icon: "◎", label: "Explore" },
  { to: "/notifications", icon: "◈", label: "Alerts" },
  { to: "/messages",      icon: "◻", label: "Messages" },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then((r) => setUnread(r.data.count)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then((r) => setUnread(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand} onClick={() => navigate("/feed")}>
          <span className={styles.brandIcon}>{"</>"}</span>
          <span className={styles.brandName}>DevConnect</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.navIcon}>{n.icon}</span>
              <span>{n.label}</span>
              {n.to === "/notifications" && unread > 0 && (
                <span className={styles.badge}>{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div
            className={styles.userCard}
            onClick={() => navigate(`/profile/${user?.id}`)}
          >
            <div className={`avatar ${styles.avatar}`} style={{ width: 38, height: 38, fontSize: 16 }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              ) : (
                user?.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.username}>@{user?.username}</div>
              <div className={styles.userSub}>View profile</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logoutUser} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
