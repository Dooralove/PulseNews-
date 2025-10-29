import api from './api';
import { Bookmark, PaginatedResponse } from '../types';

class BookmarkService {
  async getBookmarks(): Promise<Bookmark[]> {
    const response = await api.get<PaginatedResponse<Bookmark> | Bookmark[]>('/bookmarks/');
    // Проверяем, является ли ответ пагинированным
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return response.data.results;
    }
    // Если это массив, возвращаем как есть
    return Array.isArray(response.data) ? response.data : [];
  }

  async checkBookmark(articleId: number): Promise<boolean> {
    const response = await api.get<{ is_bookmarked: boolean }>('/bookmarks/check/', {
      params: { article_id: articleId }
    });
    return response.data.is_bookmarked;
  }

  async addBookmark(articleId: number): Promise<Bookmark> {
    const response = await api.post<Bookmark>('/bookmarks/', {
      article_id: articleId
    });
    return response.data;
  }

  async removeBookmark(bookmarkId: number): Promise<void> {
    await api.delete(`/bookmarks/${bookmarkId}/`);
  }

  async toggleBookmark(articleId: number): Promise<{ added: boolean; bookmark?: Bookmark }> {
    try {
      const bookmark = await this.addBookmark(articleId);
      return { added: true, bookmark };
    } catch (error: any) {
      // If error is about bookmark being removed, it was a toggle-off
      if (error.response?.data?.detail === 'Bookmark removed') {
        return { added: false };
      }
      throw error;
    }
  }
}

export default new BookmarkService();
