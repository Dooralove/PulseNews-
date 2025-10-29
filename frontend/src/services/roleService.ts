import api from './api';
import { Role } from '../types';

class RoleService {
  async getRoles(): Promise<Role[]> {
    // Return hardcoded roles for reliability
    console.log('Returning hardcoded roles');
    return [
      { id: 2, name: 'reader', display_name: 'Читатель', description: 'Может просматривать статьи и оставлять комментарии' },
      { id: 3, name: 'editor', display_name: 'Редактор', description: 'Может создавать и редактировать статьи' }
    ];
  }

  async getRole(id: number): Promise<Role> {
    // Return hardcoded role based on ID
    const roles = [
      { id: 2, name: 'reader', display_name: 'Читатель', description: 'Может просматривать статьи и оставлять комментарии' },
      { id: 3, name: 'editor', display_name: 'Редактор', description: 'Может создавать и редактировать статьи' }
    ];
    return roles.find(r => r.id === id) || roles[0];
  }
}

export default new RoleService();
