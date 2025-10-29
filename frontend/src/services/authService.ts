import api from './api';
import {
  LoginData,
  LoginResponse,
  RegisterData,
  User,
  PasswordChangeData,
} from '../types';

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', data);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register/', data);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async updateProfile(data: Partial<User> | FormData): Promise<User> {
    const response = await api.patch<User>('/auth/profile/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    await api.post('/auth/password/change/', data);
  }

  async getUserActivities(): Promise<any[]> {
    const response = await api.get('/users/my_activities/');
    return response.data;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export default new AuthService();
