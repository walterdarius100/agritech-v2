export type ArticleStatus = "draft" | "published" | "archived";

export type Article = {
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string | null;
  content: string | null;
  status: ArticleStatus;
  featured: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};
