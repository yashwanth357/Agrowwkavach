// services/api.js
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_URL = "http://localhost:5003/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Update the interceptor to use Clerk token
api.interceptors.request.use(async (config) => {
  const { getToken } = useAuth();
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  // Remove login/register methods since Clerk handles authentication

  getCurrentUser: async () => {
    const response = await api.get("/profile");
    return response.data;
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
