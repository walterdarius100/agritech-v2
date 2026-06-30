export type ArticleStatus = "draft" | "published" | "archived";

export type SupabaseArticle = {
  id: string | number;
  title: string | null;
  slug: string | null;
  category: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string | null;
  content: string | null;
  status: ArticleStatus;
  featured: boolean | null;
  reading_time: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover_image_url: string | null;
  author: string;
  content: string;
  status: ArticleStatus;
  featured: boolean;
  reading_time: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleCardViewModel = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readingTime: string;
  featured?: boolean;
};
