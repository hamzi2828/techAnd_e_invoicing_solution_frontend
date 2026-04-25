import { BlogCategory, CategoryAction } from '../types';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface BlogCategoryFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogCategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalBlogs: number;
}

export interface BlogCategoryForm {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export class BlogCategoryService {
  // Create a new blog category
  static async createCategory(data: BlogCategoryForm): Promise<BlogCategory> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create blog category');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create blog category');
    }

    return result.data;
  }

  // Get all blog categories
  static async getCategories(filters: BlogCategoryFilters = {}): Promise<{
    categories: BlogCategory[];
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

    const response = await fetch(`${API_BASE_URL}/api/blog-categories?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog categories');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog categories');
    }

    return {
      categories: result.data,
      pagination: result.pagination
    };
  }

  // Get category by ID
  static async getCategoryById(categoryId: string): Promise<BlogCategory> {
    const response = await fetch(`${API_BASE_URL}/api/blog-categories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog category');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog category');
    }

    return result.data;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<BlogCategory> {
    const response = await fetch(`${API_BASE_URL}/api/blog-categories/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blog category');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get blog category');
    }

    return result.data;
  }

  // Update a blog category
  static async updateCategory(categoryId: string, data: Partial<BlogCategoryForm>): Promise<BlogCategory> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update blog category');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update blog category');
    }

    return result.data;
  }

  // Update category status
  static async updateCategoryStatus(categoryId: string, status: 'active' | 'inactive'): Promise<BlogCategory> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-categories/${categoryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category status');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update category status');
    }

    return result.data;
  }

  // Delete a blog category
  static async deleteCategory(categoryId: string): Promise<void> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete blog category');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete blog category');
    }
  }

  // Get category statistics
  static async getCategoryStats(): Promise<BlogCategoryStats> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/blog-categories/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get category statistics');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get category statistics');
    }

    return result.data;
  }

  // Handle category action
  static async handleCategoryAction(action: CategoryAction, category: BlogCategory): Promise<BlogCategory | void> {
    switch (action) {
      case 'activate':
        return this.updateCategoryStatus(category.id, 'active');
      case 'deactivate':
        return this.updateCategoryStatus(category.id, 'inactive');
      case 'delete':
        return this.deleteCategory(category.id);
      default:
        throw new Error('Invalid action');
    }
  }
}
