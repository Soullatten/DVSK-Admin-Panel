import axios from "axios";

// This is where we will store the admin's token after they log in
let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
};

// Create the axios instance
export const apiClient = axios.create({
  baseURL: "/api", // The Vite proxy will route this to http://localhost:5000/api
  withCredentials: true,
});

// Interceptor to attach the token to every request
apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});