import axios from "axios";

const TOKEN_KEY = "dvsk_admin_token";

let currentToken: string | null = localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token: string | null) => {
  currentToken = token;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = () => currentToken;

export const clearAuthToken = () => {
  currentToken = null;
  localStorage.removeItem(TOKEN_KEY);
};

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = currentToken || localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});