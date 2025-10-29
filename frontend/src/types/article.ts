export interface Tag {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  title: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  published_at?: string;
  created_at: string;
  views: number;
  tags?: Tag[];
}

export interface Comment {
  id: number;
  content: string;
  author: string;
  created_at: string;
  article_id: number;
}
