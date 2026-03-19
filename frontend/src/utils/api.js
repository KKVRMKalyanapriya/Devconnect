import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

const readStoredToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  const token = raw.trim();
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

API.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      // Avoid redirect loops when already on auth screens.
      if (typeof window !== "undefined") {
        const path = window.location?.pathname || "";
        const isAuthScreen = path.startsWith("/login") || path.startsWith("/register");
        if (!isAuthScreen) window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Users
export const getProfile = (id) => API.get(`/users/${id}`);
export const updateProfile = (id, data) => API.put(`/users/${id}`, data);
export const followUser = (id) => API.post(`/users/${id}/follow`);
export const unfollowUser = (id) => API.delete(`/users/${id}/follow`);
export const getFollowers = (id) => API.get(`/users/${id}/followers`);
export const getFollowing = (id) => API.get(`/users/${id}/following`);

// Posts
export const getFeed = (skip = 0) => API.get(`/posts/feed?skip=${skip}`);
export const getExplore = (skip = 0) => API.get(`/posts/explore?skip=${skip}`);
export const getUserPosts = (id) => API.get(`/posts/user/${id}`);
export const createPost = (data) => API.post("/posts", data);
export const deletePost = (id) => API.delete(`/posts/${id}`);

// Comments
export const getComments = (postId) => API.get(`/posts/${postId}/comments`);
export const addComment = (postId, data) => API.post(`/posts/${postId}/comments`, data);

// Likes
export const likePost = (postId) => API.post(`/posts/${postId}/like`);
export const unlikePost = (postId) => API.delete(`/posts/${postId}/like`);

// Notifications
export const getNotifications = () => API.get("/notifications");
export const markAllRead = () => API.post("/notifications/read-all");
export const getUnreadCount = () => API.get("/notifications/unread-count");

// Search
export const search = (q) => API.get(`/search?q=${encodeURIComponent(q)}`);

// Messages
export const getConversations = () => API.get("/messages/conversations");
export const getThread = (userId) => API.get(`/messages/${userId}`);
export const sendMessage = (data) => API.post("/messages", data);

export default API;
