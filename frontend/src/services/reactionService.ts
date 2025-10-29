import api from './api';
import { Reaction, ReactionCreateData } from '../types';

class ReactionService {
  async getMyReactions(): Promise<Reaction[]> {
    const response = await api.get<Reaction[]>('/reactions/');
    return response.data;
  }

  async getArticleReaction(articleId: number): Promise<Reaction | null> {
    try {
      const response = await api.get<Reaction>(`/articles/${articleId}/reactions/my_reaction/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createOrUpdateReaction(data: ReactionCreateData): Promise<Reaction> {
    const { article, value } = data;
    const response = await api.post<Reaction>(`/articles/${article}/reactions/`, { value });
    return response.data;
  }

  async deleteReaction(articleId: number, reactionId: number): Promise<void> {
    await api.delete(`/articles/${articleId}/reactions/${reactionId}/`);
  }

  // Legacy methods for backward compatibility
  async createReaction(data: ReactionCreateData): Promise<Reaction> {
    return this.createOrUpdateReaction(data);
  }

  async updateReaction(id: number, value: 1 | -1, articleId?: number): Promise<Reaction> {
    if (articleId) {
      const response = await api.patch<Reaction>(`/articles/${articleId}/reactions/${id}/`, { value });
      return response.data;
    }
    const response = await api.patch<Reaction>(`/reactions/${id}/`, { value });
    return response.data;
  }

  // Helper methods for new frontend
  async setArticleReaction(articleId: number, value: 1 | -1): Promise<Reaction> {
    return this.createOrUpdateReaction({ article: articleId, value });
  }

  async removeArticleReaction(articleId: number): Promise<void> {
    try {
      const reaction = await this.getArticleReaction(articleId);
      if (reaction) {
        await this.deleteReaction(articleId, reaction.id);
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  }
}

export default new ReactionService();
