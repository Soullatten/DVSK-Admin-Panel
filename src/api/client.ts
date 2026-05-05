import axios from "axios";
import { auth } from "../lib/firebase";

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

/**
 * Pulls a fresh Firebase ID token. Firebase SDK auto-refreshes the token
 * internally if it's close to expiry, so this is safe to call on every request.
 * Falls back to the cached token if no current Firebase user (e.g. during
 * initial bootstrap before onAuthStateChanged has fired).
 */
async function getFreshToken(forceRefresh = false): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (user) {
      const fresh = await user.getIdToken(forceRefresh);
      if (fresh) {
        currentToken = fresh;
        localStorage.setItem(TOKEN_KEY, fresh);
        return fresh;
      }
    }
  } catch (err) {
    console.warn("[apiClient] getIdToken failed:", err);
  }
  return currentToken || localStorage.getItem(TOKEN_KEY);
}

// In dev (Vite at localhost:5172) we hit "/api" and Vite proxies to localhost:5000.
// In the packaged Electron app, there is no Vite proxy and the page is loaded
// from file://, so we must hit the backend at its absolute URL.
const isElectronFile =
  typeof window !== "undefined" &&
  window.location.protocol === "file:" &&
  Boolean((window as unknown as { dvskApp?: unknown }).dvskApp);

// You can override the backend URL at build time with VITE_API_URL.
const ELECTRON_API_URL =
  (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: isElectronFile ? ELECTRON_API_URL : "/api",
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getFreshToken(false);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 from a backend that uses Firebase Admin verification, force-refresh
// the ID token once and retry the original request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;
    if (status === 401 && original && !original._retried) {
      original._retried = true;
      const fresh = await getFreshToken(true);
      if (fresh) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${fresh}`;
        return apiClient.request(original);
      }
    }
    return Promise.reject(error);
  }
);
