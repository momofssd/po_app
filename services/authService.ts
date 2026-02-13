import { User } from "../types";

const STORAGE_KEY_USER = "wms_session_user";
const STORAGE_KEY_TOKEN = "wms_session_token";
const API_URL = "/api/login";

export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      // Add a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Short timeout for dev fallback

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse JSON error from server
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Login failed: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const user: User = { username: data.username, role: data.role };
      const token = data.token;

      authService.setSession(user, token);
      return user;
    } catch (error: any) {
      console.warn("Backend connection failed. Attempting Dev Mode fallback.");

      // DEV MODE FALLBACK
      // If the backend is not running (common in web previews), allow 'admin'/'password'
      if (
        error.name === "AbortError" ||
        error.message.includes("Network error") ||
        error.message.includes("Failed to fetch")
      ) {
        if (username.toLowerCase() === "admin" && password === "password") {
          const demoUser: User = { username: "admin", role: "admin" };
          // No token in dev fallback, or mock one
          authService.setSession(demoUser, "demo-token");
          return demoUser;
        } else {
          throw new Error(
            "Backend unavailable. For testing, use demo credentials: admin / password",
          );
        }
      }

      // Re-throw other errors
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    window.location.reload();
  },

  setSession: (user: User, token?: string) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
  },

  getSession: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  },

  // Helper to get headers with Auth
  getAuthHeaders: (): HeadersInit => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
