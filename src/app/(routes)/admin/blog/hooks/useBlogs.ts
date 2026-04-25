import { useState, useCallback, useEffect } from 'react';
import { Blog, BlogAction } from '../types';
import { BlogService, BlogFilters, BlogStats } from '../services/blogService';

interface UseBlogsState {
  blogs: Blog[];
  stats: BlogStats | null;
  filters: BlogFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface UseBlogsActions {
  loadBlogs: () => Promise<void>;
  loadStats: () => Promise<void>;
  searchBlogs: (query: string) => void;
  setFilters: (filters: Partial<BlogFilters>) => void;
  handleBlogAction: (action: BlogAction, blog: Blog) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const initialState: UseBlogsState = {
  blogs: [],
  stats: null,
  filters: {
    search: '',
    status: '',
    category: '',
    author: '',
    page: 1,
    limit: 10,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
  isLoading: false,
  error: null,
};

export const useBlogs = () => {
  const [state, setState] = useState<UseBlogsState>(initialState);

  // Load blogs with current filters
  const loadBlogs = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await BlogService.getBlogs(state.filters);

      setState(prev => ({
        ...prev,
        blogs: result.blogs,
        pagination: result.pagination,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading blogs:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load blogs',
      }));
    }
  }, [state.filters]);

  // Load blog statistics
  const loadStats = useCallback(async () => {
    try {
      const stats = await BlogService.getBlogStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error loading blog stats:', error);
    }
  }, []);

  // Search blogs
  const searchBlogs = useCallback((query: string) => {
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
  const setFilters = useCallback((newFilters: Partial<BlogFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        page: newFilters.page || 1,
      },
    }));
  }, []);

  // Handle blog action
  const handleBlogAction = useCallback(async (action: BlogAction, blog: Blog): Promise<boolean> => {
    try {
      await BlogService.handleBlogAction(action, blog);
      await loadBlogs();
      await loadStats();
      return true;
    } catch (error) {
      console.error(`Error performing ${action} on blog:`, error);
      return false;
    }
  }, [loadBlogs, loadStats]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadBlogs(), loadStats()]);
  }, [loadBlogs, loadStats]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const actions: UseBlogsActions = {
    loadBlogs,
    loadStats,
    searchBlogs,
    setFilters,
    handleBlogAction,
    refreshData,
  };

  return {
    ...state,
    actions,
  };
};

export default useBlogs;
