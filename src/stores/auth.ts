import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import baseApi from '../services/base.api';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const sessionId = ref<string | null>(null);
  const csrfToken = ref<string | null>(null);
  const jwtToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);

  // Computed property to get user permissions
  const permissions = computed(() => {
    if (!user.value?.user_role?.role) {
      return [];
    }
    return user.value.user_role.role.permissions.map((rp) => rp.permission);
  });

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
      jwtToken.value = response.access_token;
      refreshToken.value = response.refresh_token;
      user.value = response.user;
      isAuthenticated.value = true;

      // Store tokens in localStorage
      localStorage.setItem('jwt_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Refresh access token
  async function refreshAccessToken(): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    try {
      const tokens = await baseApi.refreshToken(refreshToken.value);
      jwtToken.value = tokens.access_token;
      refreshToken.value = tokens.refresh_token;

      // Update localStorage
      localStorage.setItem('jwt_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      return tokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Logout
  async function logout() {
    try {
      // Call logout endpoint if we have a token
      if (jwtToken.value) {
        await baseApi.logout();
      }
    } catch (error) {
      console.error('Logout endpoint failed:', error);
      // Continue with local logout even if endpoint fails
    } finally {
      // Clear all auth state
      jwtToken.value = null;
      refreshToken.value = null;
      csrfToken.value = null;
      sessionId.value = null;
      user.value = null;
      isAuthenticated.value = false;

      // Clear localStorage
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // Initialize auth state from localStorage
  async function initializeAuth() {
    const storedToken = localStorage.getItem('jwt_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      jwtToken.value = storedToken;
      isAuthenticated.value = true;
    }

    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken;
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
      }
    }

    // Initialize session ID if not already set (generate a new one)
    if (!sessionId.value) {
      sessionId.value = Math.random().toString(36).substring(2, 15);
    }

    // Fetch CSRF token if user is authenticated (needed for all API requests)
    if (isAuthenticated.value && !csrfToken.value) {
      try {
        await fetchCsrfToken();
      } catch (error) {
        console.error('Failed to fetch CSRF token on initialization:', error);
      }
    }
  }

  return {
    sessionId,
    csrfToken,
    jwtToken,
    refreshToken,
    user,
    isAuthenticated,
    permissions,
    setSessionId,
    fetchCsrfToken,
    login,
    refreshAccessToken,
    logout,
    initializeAuth,
  };
});
