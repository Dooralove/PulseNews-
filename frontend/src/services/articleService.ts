import api from './api';
import {
  Article,
  ArticleCreateData,
  ArticleUpdateData,
  PaginatedResponse,
  Category,
  Tag,
} from '../types';

class ArticleService {
  async getArticles(params?: {
    page?: number;
    search?: string;
    category?: string;
    tags?: string;
    author?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<Article>> {
    const response = await api.get<PaginatedResponse<Article>>('/articles/', { params });
    return response.data;
  }

  async getArticle(id: number): Promise<Article> {
    const response = await api.get<Article>(`/articles/${id}/`);
    return response.data;
  }

  async createArticle(data: ArticleCreateData): Promise<Article> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('excerpt', data.excerpt);
    formData.append('status', data.status);
    
    if (data.category) {
      formData.append('category', data.category.toString());
    }
    
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image);
    }
    
    data.tags.forEach(tagId => {
      formData.append('tags', tagId.toString());
    });

    const response = await api.post<Article>('/articles/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateArticle(id: number, data: ArticleUpdateData): Promise<Article> {
    const formData = new FormData();
    
    // Always include required fields if they exist (even if empty string)
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.excerpt !== undefined) formData.append('excerpt', data.excerpt);
    if (data.status !== undefined) formData.append('status', data.status);
    
    // Optional fields
    if (data.category !== undefined && data.category !== null) {
      formData.append('category', data.category.toString());
    }
    
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image);
    }
    
    // Tags - always send if defined (even if empty array)
    if (data.tags !== undefined) {
      data.tags.forEach(tagId => {
        formData.append('tags', tagId.toString());
      });
    }

    const response = await api.patch<Article>(`/articles/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteArticle(id: number): Promise<void> {
    await api.delete(`/articles/${id}/`);
  }

  async publishArticle(id: number): Promise<Article> {
    const response = await api.post<Article>(`/articles/${id}/publish/`);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories/');
    return response.data;
  }

  async getTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>('/tags/');
    return response.data;
  }
}

export default new ArticleService();
