import { useState, useCallback, useEffect } from 'react';
import { BlogCategory, CategoryAction } from '../types';
import { BlogCategoryService, BlogCategoryFilters, BlogCategoryStats } from '../services/blogCategoryService';

interface UseBlogCategoriesState {
  categories: BlogCategory[];
  stats: BlogCategoryStats | null;
  filters: BlogCategoryFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface UseBlogCategoriesActions {
  loadCategories: () => Promise<void>;
  loadStats: () => Promise<void>;
  searchCategories: (query: string) => void;
  setFilters: (filters: Partial<BlogCategoryFilters>) => void;
  createCategory: (data: { name: string; description?: string; status?: 'active' | 'inactive' }) => Promise<BlogCategory | null>;
  updateCategory: (id: string, data: { name?: string; description?: string; status?: 'active' | 'inactive' }) => Promise<BlogCategory | null>;
  handleCategoryAction: (action: CategoryAction, category: BlogCategory) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const initialState: UseBlogCategoriesState = {
  categories: [],
  stats: null,
  filters: {
    search: '',
    status: '',
    page: 1,
    limit: 50,
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  },
  isLoading: false,
  error: null,
};

export const useBlogCategories = () => {
  const [state, setState] = useState<UseBlogCategoriesState>(initialState);

  // Load categories with current filters
  const loadCategories = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await BlogCategoryService.getCategories(state.filters);

      setState(prev => ({
        ...prev,
        categories: result.categories.map(cat => ({
          id: cat._id || cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          blogCount: cat.blogCount || 0,
          status: cat.status,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        })),
        pagination: result.pagination,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load categories',
      }));
    }
  }, [state.filters]);

  // Load category statistics
  const loadStats = useCallback(async () => {
    try {
      const stats = await BlogCategoryService.getCategoryStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error loading category stats:', error);
    }
  }, []);

  // Search categories
  const searchCategories = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        search: query,
        page: 1,
      },
    }));
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<BlogCategoryFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        page: newFilters.page || 1,
      },
    }));
  }, []);

  // Create category
  const createCategory = useCallback(async (data: { name: string; description?: string; status?: 'active' | 'inactive' }): Promise<BlogCategory | null> => {
    try {
      const newCategory = await BlogCategoryService.createCategory(data);
      await loadCategories();
      await loadStats();
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }, [loadCategories, loadStats]);

  // Update category
  const updateCategory = useCallback(async (id: string, data: { name?: string; description?: string; status?: 'active' | 'inactive' }): Promise<BlogCategory | null> => {
    try {
      const updatedCategory = await BlogCategoryService.updateCategory(id, data);
      await loadCategories();
      await loadStats();
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }, [loadCategories, loadStats]);

  // Handle category action
  const handleCategoryAction = useCallback(async (action: CategoryAction, category: BlogCategory): Promise<boolean> => {
    try {
      await BlogCategoryService.handleCategoryAction(action, category);
      await loadCategories();
      await loadStats();
      return true;
    } catch (error) {
      console.error(`Error performing ${action} on category:`, error);
      return false;
    }
  }, [loadCategories, loadStats]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadCategories(), loadStats()]);
  }, [loadCategories, loadStats]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const actions: UseBlogCategoriesActions = {
    loadCategories,
    loadStats,
    searchCategories,
    setFilters,
    createCategory,
    updateCategory,
    handleCategoryAction,
    refreshData,
  };

  return {
    ...state,
    actions,
  };
};

export default useBlogCategories;
