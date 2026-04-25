import { BlogAuthor, AuthorAction } from '../types';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface BlogAuthorFilters {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogAuthorStats {
  totalAuthors: number;
  activeAuthors: number;
  inactiveAuthors: number;
  totalViews: number;
  totalBlogs: number;
  roleDistribution: Record<string, number>;
}

export interface BlogAuthorForm {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  role?: 'admin' | 'editor' | 'author' | 'contributor';
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  status?: 'active' | 'inactive';
}

export class BlogAuthorService {
  // Create a new blog author
  static async createAuthor(data: BlogAuthorForm): Promise<BlogAuthor> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-authors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create blog author');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create blog author');
    }

    return result.data;
  }

  // Get all blog authors
  static async getAuthors(filters: BlogAuthorFilters = {}): Promise<{
    authors: BlogAuthor[];
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

    const response = await fetch(`${API_BASE_URL}/api/blog-authors?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog authors');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog authors');
    }

    return {
      authors: result.data,
      pagination: result.pagination
    };
  }

  // Get active authors for blog creation
  static async getActiveAuthors(): Promise<BlogAuthor[]> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-authors/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get active authors');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get active authors');
    }

    return result.data;
  }

  // Get author by ID
  static async getAuthorById(authorId: string): Promise<BlogAuthor & { recentBlogs?: Array<{ title: string; slug: string; status: string; publishedAt: string; views: number }> }> {
    const response = await fetch(`${API_BASE_URL}/api/blog-authors/${authorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog author');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog author');
    }

    return result.data;
  }

  // Update a blog author
  static async updateAuthor(authorId: string, data: Partial<BlogAuthorForm>): Promise<BlogAuthor> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-authors/${authorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update blog author');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update blog author');
    }

    return result.data;
  }

  // Update author status
  static async updateAuthorStatus(authorId: string, status: 'active' | 'inactive'): Promise<BlogAuthor> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-authors/${authorId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update author status');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update author status');
    }

    return result.data;
  }

  // Delete a blog author
  static async deleteAuthor(authorId: string): Promise<void> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-authors/${authorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete blog author');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete blog author');
    }
  }

  // Get author statistics
  static async getAuthorStats(): Promise<BlogAuthorStats> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-authors/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get author statistics');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get author statistics');
    }

    return result.data;
  }

  // Handle author action
  static async handleAuthorAction(action: AuthorAction, author: BlogAuthor): Promise<BlogAuthor | void> {
    switch (action) {
      case 'activate':
        return this.updateAuthorStatus(author.id, 'active');
      case 'deactivate':
        return this.updateAuthorStatus(author.id, 'inactive');
      case 'delete':
        return this.deleteAuthor(author.id);
      default:
        throw new Error('Invalid action');
    }
  }
}
