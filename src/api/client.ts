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

export const apiClient = axios.create({
  baseURL: "/api",
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
