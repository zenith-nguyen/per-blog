// Shared domain types — mirror of the SQLite schema (docs/DATABASE.md)

export type PostStatus = "draft" | "published";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // markdown source
  cover_image: string | null;
  status: PostStatus;
  featured: 0 | 1;
  category_id: number | null;
  views: number;
  reading_minutes: number;
  published_at: string | null; // ISO datetime
  created_at: string;
  updated_at: string;
  // joined fields
  category_name?: string | null;
  category_slug?: string | null;
  tags?: Tag[];
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  status: "pending" | "approved" | "spam";
  created_at: string;
  post_title?: string;
  post_slug?: string;
}

export interface SiteSettings {
  site_title: string;
  site_tagline: string;
  site_description: string;
  author_name: string;
  author_bio: string;
  social_github: string;
  social_twitter: string;
  social_email: string;
  posts_per_page: string;
}

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  viewsLast30: number;
  pendingComments: number;
  totalComments: number;
  viewsByDay: { date: string; count: number }[];
  topPosts: { id: number; title: string; slug: string; views: number }[];
  recentComments: Comment[];
}
