// User and Authentication Types
export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role?: Role | null;
  bio?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  phone?: string;
  birth_date?: string | null;
  is_verified?: boolean;
  email_notifications?: boolean;
  date_joined?: string;
  created_at?: string;
  can_manage_articles?: boolean;
  can_moderate_content?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  role?: number; // ID роли: 1 - Читатель, 2 - Редактор
}

export interface LoginData {
  username: string;
  password: string;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

// Article Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  author: {
    id: number;
    username: string;
    full_name: string;
  } | null;
  category: Category | null;
  tags: Tag[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  views: number;
  source_url: string | null;
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
}

export interface ArticleCreateData {
  title: string;
  content: string;
  excerpt: string;
  cover_image?: File | null;
  category: number | null;
  tags: number[];
  status: 'draft' | 'published' | 'archived';
}

export interface ArticleUpdateData extends Partial<ArticleCreateData> {}

// Comment Types
export interface Comment {
  id: number;
  article: number;
  author: {
    id: number;
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  parent: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  replies?: Comment[];
}

export interface CommentCreateData {
  article: number;
  content: string;
  parent?: number | null;
}

// Reaction Types
export interface Reaction {
  id: number;
  article: number;
  user: number;
  value: 1 | -1; // 1 for like, -1 for dislike
  created_at: string;
}

export interface ReactionCreateData {
  article: number;
  value: 1 | -1;
}

// Bookmark Types
export interface Bookmark {
  id: number;
  article: Article;
  user: number;
  created_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Error
export interface APIError {
  detail?: string;
  [key: string]: any;
}
