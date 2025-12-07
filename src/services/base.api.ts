import axios, { type AxiosInstance } from 'axios';

import { useAuthStore } from '../stores/auth';

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

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth state and redirect to login
          const authStore = useAuthStore();
          const currentPath = window.location.pathname;

          // Only redirect if not already on login page
          if (currentPath !== '/login') {
            authStore.logout();
            // Use router for navigation instead of window.location
            // This will be handled by the router guard
            setTimeout(() => {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }, 0);
          } else {
            authStore.logout();
          }
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
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string }> {
    const response = await this.api.post('/auth/login', credentials);
    const token = response.data.data.access_token;
    return { token };
  }
}

export default new BaseApiService();
