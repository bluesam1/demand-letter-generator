import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for refresh tokens
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// List of endpoints that don't require authentication (exact match at end of URL)
const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/health'];

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    // Check if endpoint matches exactly (not just contains)
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url === endpoint || config.url?.endsWith(endpoint)
    );

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!token && !isPublicEndpoint) {
      // No token and trying to access protected endpoint - cancel request
      // The ProtectedRoute will handle the redirect
      const cancelError = new Error('No access token available') as Error & {
        response: { status: number };
        config: typeof config;
        __CANCEL__: boolean;
      };
      cancelError.response = { status: 401 };
      cancelError.config = config;
      cancelError.__CANCEL__ = true;
      return Promise.reject(cancelError);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { __CANCEL__?: boolean }) => {
    // If request was cancelled due to missing token, just reject without further processing
    if (error.__CANCEL__) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      // If no refresh token, don't attempt refresh - just let the ProtectedRoute handle redirect
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Don't redirect here - let ProtectedRoute handle it
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Permission denied
      console.error('Access forbidden:', error);
    }

    return Promise.reject(error);
  }
);

export default api;
