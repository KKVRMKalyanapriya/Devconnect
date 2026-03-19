import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = typeof window !== "undefined" ? window.location?.pathname || "" : "";
    const isAuthScreen = path.startsWith("/login") || path.startsWith("/register");

    const raw = localStorage.getItem("token");
    const token = raw ? raw.trim() : "";
    const hasValidToken = token && token !== "null" && token !== "undefined";

    // On auth screens we don't need to fetch /me; doing so can create noisy 401s.
    if (isAuthScreen) {
      if (raw && !hasValidToken) localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    if (hasValidToken) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      if (raw) localStorage.removeItem("token");
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
