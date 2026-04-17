import apiClient from './client';
import { adaptServerAuthToUser } from './adapters';
import type { User, AuthResponse } from '../types/user.types';
import type { ServerAuthResponse, ServerLoginRequest, ServerRegisterRequest } from '../types/server.types';

// Re-export for convenience
export type { AuthResponse } from '../types/user.types';

// API Endpoints
const ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  ADMIN_LOGIN: '/auth/admin/login',
  PROFILE: '/auth/profile',
};

// Auth API Service
export const authApi = {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    city?: string;
  }): Promise<AuthResponse> {
    // Convert UI format to server format
    const serverData: ServerRegisterRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      address: data.city,
    };

    const response = await apiClient.post<ServerAuthResponse>(ENDPOINTS.REGISTER, serverData);
    return adaptServerAuthToUser(response.data, 'customer');
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const serverData: ServerLoginRequest = {
      email: credentials.email,
      password: credentials.password,
    };

    const response = await apiClient.post<ServerAuthResponse>(ENDPOINTS.LOGIN, serverData);
    return adaptServerAuthToUser(response.data, 'customer');
  },

  /**
   * Admin login with email and password
   * POST /api/auth/admin/login
   */
  async adminLogin(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const serverData: ServerLoginRequest = {
      email: credentials.email,
      password: credentials.password,
    };

    const response = await apiClient.post<ServerAuthResponse>(ENDPOINTS.ADMIN_LOGIN, serverData);
    return adaptServerAuthToUser(response.data, 'admin');
  },

  /**
   * Get authenticated user profile
   * GET /api/auth/profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ id: number; name: string; email: string }>(ENDPOINTS.PROFILE);
    const nameParts = (response.data.name || '').split(' ');

    return {
      id: response.data.id.toString(),
      email: response.data.email,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: '',
      role: 'customer',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Logout - clear token from storage
   */
  logout(): void {
    localStorage.removeItem('token');
  },

  /**
   * Save token to storage
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  },

  /**
   * Get token from storage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

// Export endpoints for reference
export { ENDPOINTS as AUTH_ENDPOINTS };
