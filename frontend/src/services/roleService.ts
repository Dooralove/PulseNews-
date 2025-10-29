import api from './api';
import { Role } from '../types';

class RoleService {
  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get<Role[]>('/roles/public/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles from API:', error);
      // Fallback to fetching all roles if public endpoint fails
      try {
        const response = await api.get<Role[]>('/roles/');
        // Filter to only reader and editor roles
        return response.data.filter(role => role.name === 'reader' || role.name === 'editor');
      } catch (fallbackError) {
        console.error('Failed to fetch roles:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async getRole(id: number): Promise<Role> {
    const response = await api.get<Role>(`/roles/${id}/`);
    return response.data;
  }
}

export default new RoleService();
