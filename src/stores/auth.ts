import { defineStore } from 'pinia';
import { ref } from 'vue';

import baseApi from '../services/base.api';

export const useAuthStore = defineStore('auth', () => {
  const sessionId = ref<string | null>(null);
  const csrfToken = ref<string | null>(null);
  const jwtToken = ref<string | null>(null);
  const isAuthenticated = ref(false);

  // Initialize session key (can be set from external source)
  function setSessionId(id: string) {
    sessionId.value = id;
  }

  // Fetch CSRF token using session key
  async function fetchCsrfToken(): Promise<string | null> {
    if (!sessionId.value) {
      // set session key to a random string
      sessionId.value = Math.random().toString(36).substring(2, 15);
    }

    try {
      const response = await baseApi.getCsrfToken();
      csrfToken.value = response.token;
      return response.token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      throw error;
    }
  }

  // Login with credentials
  async function login(credentials: {
    email: string;
    password: string;
  }): Promise<void> {
    try {
      // Ensure we have CSRF token before login
      if (!csrfToken.value) {
        await fetchCsrfToken();
      }

      const response = await baseApi.login(credentials);
      jwtToken.value = response.token;
      isAuthenticated.value = true;

      // Store JWT in localStorage
      if (response.token) {
        localStorage.setItem('jwt_token', response.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Logout
  function logout() {
    jwtToken.value = null;
    csrfToken.value = null;
    sessionId.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('jwt_token');
  }

  // Initialize auth state from localStorage
  function initializeAuth() {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      jwtToken.value = storedToken;
      isAuthenticated.value = true;
    }

    // Initialize session ID if not already set (generate a new one)
    if (!sessionId.value) {
      sessionId.value = Math.random().toString(36).substring(2, 15);
    }
  }

  return {
    sessionId,
    csrfToken,
    jwtToken,
    isAuthenticated,
    setSessionId,
    fetchCsrfToken,
    login,
    logout,
    initializeAuth,
  };
});
