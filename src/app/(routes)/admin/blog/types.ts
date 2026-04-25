export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  blogCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BlogAuthor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  bio: string;
  role: 'admin' | 'editor' | 'author' | 'contributor';
  blogCount: number;
  totalViews: number;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  category: BlogCategory;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt: string | null;
  scheduledAt: string | null;
  views: number;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

export type BlogAction = 'view' | 'edit' | 'delete' | 'publish' | 'unpublish' | 'archive';
export type CategoryAction = 'edit' | 'delete' | 'activate' | 'deactivate';
export type AuthorAction = 'view' | 'edit' | 'delete' | 'activate' | 'deactivate';
