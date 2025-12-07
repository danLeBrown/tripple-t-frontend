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
    // Request interceptor to add CSRF token and JWT
    this.api.interceptors.request.use(
      async (config) => {
        const authStore = useAuthStore();

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

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth state
          const authStore = useAuthStore();
          authStore.logout();
        }
        return Promise.reject(error);
      },
    );
  }

  // CSRF Token
  async getCsrfToken(sessionKey: string): Promise<{ token: string }> {
    const response = await this.appApi.post('/csrf-token', { sessionKey });
    return response.data;
  }

  // Auth
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string }> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }
}

export default new BaseApiService();
