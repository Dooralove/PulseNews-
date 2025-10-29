import api from './api';
import { Comment, CommentCreateData } from '../types';

class CommentService {
  async getComments(articleId: number): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/articles/${articleId}/comments/`);
    return response.data;
  }

  async createComment(data: CommentCreateData): Promise<Comment> {
    const { article, ...commentData } = data;
    const response = await api.post<Comment>(`/articles/${article}/comments/`, commentData);
    return response.data;
  }

  async deleteComment(commentId: number, articleId?: number): Promise<void> {
    // Try to use the nested route if articleId is provided, otherwise use the standalone route
    if (articleId) {
      await api.delete(`/articles/${articleId}/comments/${commentId}/`);
    } else {
      await api.delete(`/comments/${commentId}/`);
    }
  }
}

export default new CommentService();
