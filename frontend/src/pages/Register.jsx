import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, getMe } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./Auth.module.css";

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      localStorage.setItem("token", res.data.access_token);
      const me = await getMe();
      loginUser(res.data.access_token, me.data);
      navigate("/feed");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>{"</>"}</div>
        <h1 className={styles.title}>Join DevConnect</h1>
        <p className={styles.sub}>Build. Share. Connect.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className="input-field"
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.switch}>
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
