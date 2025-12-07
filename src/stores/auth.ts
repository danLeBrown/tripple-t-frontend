import { defineStore } from 'pinia';
import { ref } from 'vue';

import baseApi from '../services/base.api';

export const useAuthStore = defineStore('auth', () => {
  const sessionKey = ref<string | null>(null);
  const csrfToken = ref<string | null>(null);
  const jwtToken = ref<string | null>(null);
  const isAuthenticated = ref(false);

  // Initialize session key (can be set from external source)
  function setSessionKey(key: string) {
    sessionKey.value = key;
  }

  // Fetch CSRF token using session key
  async function fetchCsrfToken(): Promise<string | null> {
    if (!sessionKey.value) {
      throw new Error('Session key is required to fetch CSRF token');
    }

    try {
      const response = await baseApi.getCsrfToken(sessionKey.value);
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
  }

  return {
    sessionKey,
    csrfToken,
    jwtToken,
    isAuthenticated,
    setSessionKey,
    fetchCsrfToken,
    login,
    logout,
    initializeAuth,
  };
});
