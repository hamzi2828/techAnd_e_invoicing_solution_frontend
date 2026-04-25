import { Blog, BlogAction, BlogCategory, BlogAuthor } from '../types';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface BlogFilters {
  status?: string;
  category?: string;
  author?: string;
  tag?: string;
  isFeatured?: boolean | string;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  scheduledBlogs: number;
  archivedBlogs: number;
  featuredBlogs: number;
  totalViews: number;
  topBlogs: Array<{
    _id: string;
    title: string;
    views: number;
    publishedAt: string;
    category: { name: string };
    author: { firstName: string; lastName: string };
  }>;
  recentBlogs: Array<{
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    category: { name: string };
    author: { firstName: string; lastName: string };
  }>;
}

export interface BlogForm {
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string | null;
  category: string;
  author: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  isFeatured?: boolean;
}

export class BlogService {
  // Create a new blog
  static async createBlog(data: BlogForm): Promise<Blog> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create blog');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create blog');
    }

    return this.transformBlogResponse(result.data);
  }

  // Get all blogs (admin)
  static async getBlogs(filters: BlogFilters = {}): Promise<{
    blogs: Blog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const authHeaders = getAuthHeader();
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/blogs?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blogs');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blogs');
    }

    return {
      blogs: result.data.map(this.transformBlogResponse),
      pagination: result.pagination
    };
  }

  // Get published blogs (public)
  static async getPublishedBlogs(filters: Omit<BlogFilters, 'status'> = {}): Promise<{
    blogs: Blog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/blogs/published?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get published blogs');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get published blogs');
    }

    return {
      blogs: result.data.map(this.transformBlogResponse),
      pagination: result.pagination
    };
  }

  // Get featured blogs
  static async getFeaturedBlogs(limit: number = 5): Promise<Blog[]> {
    const response = await fetch(`${API_BASE_URL}/api/blogs/featured?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get featured blogs');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get featured blogs');
    }

    return result.data.map(this.transformBlogResponse);
  }

  // Get blog by ID
  static async getBlogById(blogId: string): Promise<Blog> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog');
    }

    return this.transformBlogResponse(result.data);
  }

  // Get blog by slug (public)
  static async getBlogBySlug(slug: string, incrementViews: boolean = true): Promise<Blog & { relatedBlogs?: Blog[] }> {
    const response = await fetch(`${API_BASE_URL}/api/blogs/slug/${slug}?incrementViews=${incrementViews}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog');
    }

    return {
      ...this.transformBlogResponse(result.data),
      relatedBlogs: result.data.relatedBlogs?.map(this.transformBlogResponse)
    };
  }

  // Update a blog
  static async updateBlog(blogId: string, data: Partial<BlogForm>): Promise<Blog> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update blog');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update blog');
    }

    return this.transformBlogResponse(result.data);
  }

  // Update blog status
  static async updateBlogStatus(blogId: string, status: 'draft' | 'published' | 'scheduled' | 'archived'): Promise<Blog> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update blog status');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update blog status');
    }

    return this.transformBlogResponse(result.data);
  }

  // Delete a blog
  static async deleteBlog(blogId: string): Promise<void> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete blog');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete blog');
    }
  }

  // Get blog statistics
  static async getBlogStats(): Promise<BlogStats> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blogs/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog statistics');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog statistics');
    }

    return result.data;
  }

  // Get all tags
  static async getAllTags(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/blogs/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get tags');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get tags');
    }

    return result.data;
  }

  // Get blogs by tag
  static async getBlogsByTag(tag: string, filters: { page?: number; limit?: number } = {}): Promise<{
    blogs: Blog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/blogs/tag/${encodeURIComponent(tag)}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blogs by tag');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blogs by tag');
    }

    return {
      blogs: result.data.map(this.transformBlogResponse),
      pagination: result.pagination
    };
  }

  // Handle blog action
  static async handleBlogAction(action: BlogAction, blog: Blog): Promise<Blog | void> {
    switch (action) {
      case 'publish':
        return this.updateBlogStatus(blog.id, 'published');
      case 'unpublish':
        return this.updateBlogStatus(blog.id, 'draft');
      case 'archive':
        return this.updateBlogStatus(blog.id, 'archived');
      case 'delete':
        return this.deleteBlog(blog.id);
      default:
        throw new Error('Invalid action');
    }
  }

  // Transform API response to Blog type
  private static transformBlogResponse(data: Record<string, unknown>): Blog {
    return {
      id: (data._id as string) || (data.id as string),
      title: data.title as string,
      slug: data.slug as string,
      excerpt: (data.excerpt as string) || '',
      content: (data.content as string) || '',
      featuredImage: (data.featuredImage as string) || null,
      category: data.category as BlogCategory,
      author: {
        id: ((data.author as Record<string, unknown>)?._id as string) || ((data.author as Record<string, unknown>)?.id as string) || '',
        name: `${(data.author as Record<string, unknown>)?.firstName || ''} ${(data.author as Record<string, unknown>)?.lastName || ''}`.trim(),
        avatar: ((data.author as Record<string, unknown>)?.avatar as string) || null
      },
      status: (data.status as 'draft' | 'published' | 'scheduled' | 'archived') || 'draft',
      publishedAt: (data.publishedAt as string) || null,
      scheduledAt: (data.scheduledAt as string) || null,
      views: (data.views as number) || 0,
      tags: (data.tags as string[]) || [],
      metaTitle: (data.metaTitle as string) || '',
      metaDescription: (data.metaDescription as string) || '',
      createdAt: (data.createdAt as string) || new Date().toISOString(),
      updatedAt: (data.updatedAt as string) || new Date().toISOString()
    };
  }
}
