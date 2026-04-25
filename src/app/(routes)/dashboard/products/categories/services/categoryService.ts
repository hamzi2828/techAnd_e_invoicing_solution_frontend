import { Category, Subcategory } from '../../types';
import { getAuthHeader } from '@/helper/helper';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const CATEGORIES_ENDPOINT = `${API_BASE_URL}/api/categories`;

// API Response Interfaces
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  parentCategories: number;
  subcategories: number;
  totalProducts: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder?: number;
}

// Backend category data structure
interface BackendCategoryData {
  _id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  productsCount?: number;
  status: 'active' | 'inactive';
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  subcategories?: BackendCategoryData[];
}

// Pagination interface
interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Transform backend category to frontend format
function transformCategory(backendCategory: BackendCategoryData): Category | Subcategory {
  const baseCategory = {
    id: backendCategory._id,
    name: backendCategory.name,
    description: backendCategory.description,
    slug: backendCategory.slug,
    icon: backendCategory.icon || 'tag',
    productsCount: backendCategory.productsCount || 0,
    status: backendCategory.status as 'active' | 'inactive',
    createdAt: new Date(backendCategory.createdAt).toISOString().split('T')[0],
    updatedAt: new Date(backendCategory.updatedAt).toISOString().split('T')[0]
  };

  if (backendCategory.parentId) {
    // This is a subcategory
    return {
      ...baseCategory,
      parentId: backendCategory.parentId
    } as Subcategory;
  } else {
    // This is a parent category
    return baseCategory as Category;
  }
}

class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories(filters?: {
    status?: string;
    parentId?: string | null;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ categories: Category[]; subcategories: Subcategory[]; pagination?: PaginationData }> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.parentId !== undefined) queryParams.append('parentId', String(filters.parentId));
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));

      const response = await fetch(`${CATEGORIES_ENDPOINT}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch categories (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendCategoryData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch categories');
      }

      const categories: Category[] = [];
      const subcategories: Subcategory[] = [];

      // Process categories and subcategories
      result.data?.forEach((item) => {
        const transformed = transformCategory(item);

        if ('parentId' in transformed) {
          subcategories.push(transformed as Subcategory);
        } else {
          categories.push(transformed as Category);
        }

        // Add subcategories from nested structure
        if (item.subcategories && Array.isArray(item.subcategories)) {
          item.subcategories.forEach((sub: BackendCategoryData) => {
            const transformedSub = transformCategory(sub) as Subcategory;
            subcategories.push(transformedSub);
          });
        }
      });

      return {
        categories,
        subcategories,
        pagination: result.pagination
      };

    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get category tree structure
   */
  static async getCategoryTree(): Promise<BackendCategoryData[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${CATEGORIES_ENDPOINT}/tree`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch category tree (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendCategoryData[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch category tree');
      }

      return result.data;

    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats(): Promise<CategoryStats> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${CATEGORIES_ENDPOINT}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch category stats (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<CategoryStats> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch category statistics');
      }

      return result.data;

    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: string): Promise<Category | Subcategory> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${CATEGORIES_ENDPOINT}/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch category (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendCategoryData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch category');
      }

      return transformCategory(result.data);

    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryData: CategoryFormData): Promise<Category | Subcategory> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(CATEGORIES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create category (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendCategoryData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to create category');
      }

      return transformCategory(result.data);

    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update a category
   */
  static async updateCategory(categoryId: string, categoryData: Partial<CategoryFormData>): Promise<Category | Subcategory> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${CATEGORIES_ENDPOINT}/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update category (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendCategoryData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update category');
      }

      return transformCategory(result.data);

    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${CATEGORIES_ENDPOINT}/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete category (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<null> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete category');
      }

    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Reorder categories
   */
  static async reorderCategories(categoryOrders: Array<{ categoryId: string; sortOrder: number }>): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${CATEGORIES_ENDPOINT}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          categoryOrders
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reorder categories (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<null> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to reorder categories');
      }

    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }
}

export default CategoryService;
