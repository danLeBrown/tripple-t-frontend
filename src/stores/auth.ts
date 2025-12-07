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
  }): Promise<{ is_first_login: boolean }> {
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

      return { is_first_login: response.is_first_login };
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
    // Store token before clearing (needed for logout API call)
    const tokenToLogout = jwtToken.value;

    // Clear localStorage FIRST (synchronously) to prevent redirect loops
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Clear all auth state
    jwtToken.value = null;
    refreshToken.value = null;
    csrfToken.value = null;
    sessionId.value = null;
    user.value = null;
    isAuthenticated.value = false;

    // Then try to call logout endpoint (don't block on this)
    if (tokenToLogout) {
      try {
        await baseApi.logout();
      } catch (error) {
        console.error('Logout endpoint failed:', error);
        // Already cleared local state, so we're done
      }
    }
  }

  // Initialize auth state from localStorage
  async function initializeAuth() {
    const storedToken = localStorage.getItem('jwt_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');

    // Only set authenticated if we have both token and refresh token
    // This prevents issues with expired tokens
    if (storedToken && storedRefreshToken) {
      jwtToken.value = storedToken;
      refreshToken.value = storedRefreshToken;
      isAuthenticated.value = true;
    } else {
      // If tokens are incomplete, clear everything
      if (storedToken || storedRefreshToken) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
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
        // If CSRF fetch fails, user might not be authenticated, clear state
        if (!storedRefreshToken) {
          isAuthenticated.value = false;
          jwtToken.value = null;
        }
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
