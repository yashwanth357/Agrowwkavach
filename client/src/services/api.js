// services/api.js
import axios from "axios";

const API_URL = "http://localhost:5003/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    localStorage.setItem("token", response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};

export const postsAPI = {
  createPost: async (formData) => {
    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getPosts: async () => {
    const response = await api.get("/posts");
    return response.data;
  },

  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
};

export const profileAPI = {
  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/profile", profileData);
    return response.data;
  },
};

export default api;
