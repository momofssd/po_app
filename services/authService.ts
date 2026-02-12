import { User } from '../types';

const SESSION_COOKIE_NAME = 'wms_session_user';
// Using localhost. If this fails on some systems, try http://127.0.0.1:3001
const API_URL = 'http://localhost:3001/api/login';

export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      // Add a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Short timeout for dev fallback

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse JSON error from server
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
      }

      const user = await response.json();
      authService.setSession(user);
      return user;

    } catch (error: any) {
      console.warn("Backend connection failed. Attempting Dev Mode fallback.");

      // DEV MODE FALLBACK
      // If the backend is not running (common in web previews), allow 'admin'/'password'
      if (
        (error.name === 'AbortError' || 
         error.message.includes('Network error') || 
         error.message.includes('Failed to fetch'))
      ) {
        if (username.toLowerCase() === 'admin' && password === 'password') {
          const demoUser: User = { username: 'admin', role: 'admin' };
          authService.setSession(demoUser);
          return demoUser;
        } else {
           throw new Error("Backend unavailable. For testing, use demo credentials: admin / password");
        }
      }

      // Re-throw other errors
      throw error;
    }
  },

  logout: () => {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    window.location.reload();
  },

  setSession: (user: User) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000)); // 1 day
    const cookieValue = JSON.stringify(user);
    document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/`;
  },

  getSession: (): User | null => {
    const nameEQ = SESSION_COOKIE_NAME + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(decodeURIComponent(c.substring(nameEQ.length)));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
};