/**
 * Authentication service
 * Handles all authentication API calls
 */

import axios from '../api/axiosConfig';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  firmName: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  firmId: string;
  firmName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Register new user and firm
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await axios.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  }

  /**
   * Logout and invalidate tokens
   */
  async logout(refreshToken?: string): Promise<void> {
    await axios.post('/auth/logout', { refreshToken });
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await axios.get<User>('/auth/me');
    return response.data;
  }

  /**
   * Set authorization header for axios
   */
  setAuthToken(token: string | null): void {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.setAuthToken(accessToken);
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.setAuthToken(null);
  }

  /**
   * Initialize auth from stored tokens
   */
  initializeAuth(): void {
    const token = this.getAccessToken();
    if (token) {
      this.setAuthToken(token);
    }
  }
}

export default new AuthService();
