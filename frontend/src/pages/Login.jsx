import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, getMe } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./Auth.module.css";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const token = res.data?.access_token;
      if (!token) throw new Error("Missing access token");

      localStorage.setItem("token", token);
      const me = await getMe();

      loginUser(token, me.data);
      navigate("/feed");
    } catch (err) {
      localStorage.removeItem("token");
      toast.error(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>{"</>"}</div>
        <h1 className={styles.title}>DevConnect</h1>
        <p className={styles.sub}>Welcome back, developer</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.switch}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
