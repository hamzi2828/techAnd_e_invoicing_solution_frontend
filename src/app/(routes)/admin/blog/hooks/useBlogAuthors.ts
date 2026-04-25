import { useState, useCallback, useEffect } from 'react';
import { BlogAuthor, AuthorAction } from '../types';
import { BlogAuthorService, BlogAuthorFilters, BlogAuthorStats, BlogAuthorForm } from '../services/blogAuthorService';

interface UseBlogAuthorsState {
  authors: BlogAuthor[];
  stats: BlogAuthorStats | null;
  filters: BlogAuthorFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface UseBlogAuthorsActions {
  loadAuthors: () => Promise<void>;
  loadStats: () => Promise<void>;
  searchAuthors: (query: string) => void;
  setFilters: (filters: Partial<BlogAuthorFilters>) => void;
  createAuthor: (data: BlogAuthorForm) => Promise<BlogAuthor | null>;
  updateAuthor: (id: string, data: Partial<BlogAuthorForm>) => Promise<BlogAuthor | null>;
  handleAuthorAction: (action: AuthorAction, author: BlogAuthor) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const initialState: UseBlogAuthorsState = {
  authors: [],
  stats: null,
  filters: {
    search: '',
    status: '',
    role: '',
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

export const useBlogAuthors = () => {
  const [state, setState] = useState<UseBlogAuthorsState>(initialState);

  // Load authors with current filters
  const loadAuthors = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await BlogAuthorService.getAuthors(state.filters);

      setState(prev => ({
        ...prev,
        authors: result.authors.map(author => ({
          id: author._id || author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          email: author.email,
          avatar: author.avatar || null,
          bio: author.bio || '',
          role: author.role,
          blogCount: author.blogCount || 0,
          totalViews: author.totalViews || 0,
          socialLinks: author.socialLinks || {},
          status: author.status,
          createdAt: author.createdAt,
          updatedAt: author.updatedAt,
        })),
        pagination: result.pagination,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading authors:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load authors',
      }));
    }
  }, [state.filters]);

  // Load author statistics
  const loadStats = useCallback(async () => {
    try {
      const stats = await BlogAuthorService.getAuthorStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error loading author stats:', error);
    }
  }, []);

  // Search authors
  const searchAuthors = useCallback((query: string) => {
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
  const setFilters = useCallback((newFilters: Partial<BlogAuthorFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        page: newFilters.page || 1,
      },
    }));
  }, []);

  // Create author
  const createAuthor = useCallback(async (data: BlogAuthorForm): Promise<BlogAuthor | null> => {
    try {
      const newAuthor = await BlogAuthorService.createAuthor(data);
      await loadAuthors();
      await loadStats();
      return newAuthor;
    } catch (error) {
      console.error('Error creating author:', error);
      throw error;
    }
  }, [loadAuthors, loadStats]);

  // Update author
  const updateAuthor = useCallback(async (id: string, data: Partial<BlogAuthorForm>): Promise<BlogAuthor | null> => {
    try {
      const updatedAuthor = await BlogAuthorService.updateAuthor(id, data);
      await loadAuthors();
      await loadStats();
      return updatedAuthor;
    } catch (error) {
      console.error('Error updating author:', error);
      throw error;
    }
  }, [loadAuthors, loadStats]);

  // Handle author action
  const handleAuthorAction = useCallback(async (action: AuthorAction, author: BlogAuthor): Promise<boolean> => {
    try {
      await BlogAuthorService.handleAuthorAction(action, author);
      await loadAuthors();
      await loadStats();
      return true;
    } catch (error) {
      console.error(`Error performing ${action} on author:`, error);
      return false;
    }
  }, [loadAuthors, loadStats]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadAuthors(), loadStats()]);
  }, [loadAuthors, loadStats]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const actions: UseBlogAuthorsActions = {
    loadAuthors,
    loadStats,
    searchAuthors,
    setFilters,
    createAuthor,
    updateAuthor,
    handleAuthorAction,
    refreshData,
  };

  return {
    ...state,
    actions,
  };
};

export default useBlogAuthors;
