import axios, { type AxiosInstance } from 'axios';

import { useAlertStore } from '../stores/alert';
import { useAuthStore } from '../stores/auth';
import type { User } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://staging-api.danlebrown.com/tripple-t/v1';
const API_APP_BASE_URL =
  import.meta.env.VITE_API_APP_BASE_URL ||
  'https://staging-api.danlebrown.com/tripple-t';

class BaseApiService {
  public readonly api: AxiosInstance;
  public readonly appApi: AxiosInstance;

  constructor() {
    // API instance for v1 endpoints
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // App instance for non-v1 endpoints (CSRF, health, etc.)
    this.appApi = axios.create({
      baseURL: API_APP_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for v1 API endpoints
    this.api.interceptors.request.use(
      async (config) => {
        const authStore = useAuthStore();

        // Add Session ID to all requests
        if (authStore.sessionId) {
          config.headers['X-Session-ID'] = authStore.sessionId;
        }

        // Add CSRF token to all requests
        if (authStore.csrfToken) {
          config.headers['X-CSRF-TOKEN'] = authStore.csrfToken;
        }

        // Add JWT token if available
        if (authStore.jwtToken) {
          config.headers.Authorization = `Bearer ${authStore.jwtToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Request interceptor for app API endpoints (CSRF, health, etc.)
    this.appApi.interceptors.request.use(
      async (config) => {
        const authStore = useAuthStore();

        // Add Session ID to all requests
        if (authStore.sessionId) {
          config.headers['X-Session-ID'] = authStore.sessionId;
        }

        // Add CSRF token to all requests (except when fetching CSRF token itself)
        if (authStore.csrfToken && !config.url?.includes('/csrf-token')) {
          config.headers['X-CSRF-TOKEN'] = authStore.csrfToken;
        }

        // Add JWT token if available
        if (authStore.jwtToken) {
          config.headers.Authorization = `Bearer ${authStore.jwtToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor to handle errors and token refresh
    let isRefreshing = false;
    let failedQueue: Array<{
      resolve: (value?: string) => void;
      reject: (error?: unknown) => void;
    }> = [];

    const processQueue = (
      error: unknown | null,
      token: string | null = null,
    ) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token ?? undefined);
        }
      });
      failedQueue = [];
    };

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const alertStore = useAlertStore();

        // Show error alert for non-401 errors
        if (error.response && error.response.status !== 401) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Request failed: ${error.response.statusText}`;
          alertStore.error(errorMessage);
        }

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const authStore = useAuthStore();

          // Try to refresh the token
          if (authStore.refreshToken) {
            try {
              const tokens = await authStore.refreshAccessToken();
              processQueue(null, tokens.access_token);
              originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
              return this.api(originalRequest);
            } catch (refreshError) {
              // Refresh failed - clear tokens immediately and redirect to login
              processQueue(refreshError, null);

              // Clear localStorage immediately (synchronously) before any redirects
              localStorage.removeItem('jwt_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');

              // Then call logout to clear store state
              await authStore.logout();

              const currentPath = window.location.pathname;
              if (currentPath !== '/login') {
                setTimeout(() => {
                  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                }, 0);
              }
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // No refresh token - clear tokens immediately and redirect to login
            isRefreshing = false;

            // Clear localStorage immediately (synchronously) before any redirects
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');

            // Then call logout to clear store state
            await authStore.logout();

            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
              setTimeout(() => {
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
              }, 0);
            }
            return Promise.reject(error);
          }
        }

        // Handle network errors or other errors without response
        if (!error.response) {
          alertStore.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
      },
    );
  }

  // CSRF Token
  // Note: X-Session-ID header is automatically added by the request interceptor
  // The sessionId must be set in the auth store before calling this method
  async getCsrfToken(): Promise<{ token: string }> {
    const response = await this.appApi.get('/csrf-token');
    return { token: response.data.data.csrf_token };
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<{
    user: User;
    access_token: string;
    refresh_token: string;
    is_first_login: boolean;
  }> {
    const response = await this.api.post('/auth/login', credentials);
    return {
      user: response.data.data.user,
      access_token: response.data.data.access_token,
      refresh_token: response.data.data.refresh_token,
      is_first_login: response.data.data.is_first_login,
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const response = await this.api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return {
      access_token: response.data.data.access_token,
      refresh_token: response.data.data.refresh_token,
    };
  }

  // Change password (for first-time login)
  async changePassword(data: { new_password: string }): Promise<void> {
    await this.api.post('/auth/change-password', data);
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Even if logout endpoint fails, we should still clear local state
      console.error('Logout endpoint failed:', error);
    }
  }
}

export default new BaseApiService();
