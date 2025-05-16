// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3005",
});

// ⛔ NÃO faça isso fora do interceptor: localStorage pode estar desatualizado
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
