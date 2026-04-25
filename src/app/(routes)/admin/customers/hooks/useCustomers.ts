import { useState, useCallback, useEffect } from 'react';
import {
  CustomerDetails,
  CustomerStats,
  CustomerFilters,
  UseCustomersState,
  UseCustomersActions,
  ExportOptions
} from '../types';
import { CustomerService } from '../services/customerService';

const initialState: UseCustomersState = {
  customers: [],
  stats: {
    total: 0,
    active: 0,
    pending: 0,
    verified: 0,
    individuals: 0,
    companies: 0,
    totalPaymentsValue: 0,
    averagePaymentValue: 0,
  },
  selectedCustomers: [],
  filters: {
    search: '',
    status: 'all',
    type: 'all',
    page: 1,
    limit: 10,
  },
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  isLoading: false,
  error: null,
};

export const useCustomers = () => {
  const [state, setState] = useState<UseCustomersState>(initialState);

  // Load customers with current filters
  const loadCustomers = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await CustomerService.getAllCustomers(state.filters);

      setState(prev => ({
        ...prev,
        customers: result.customers,
        pagination: result.pagination,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading customers:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load customers',
      }));
    }
  }, [state.filters]);

  // Load customer statistics
  const loadStats = useCallback(async () => {
    try {
      const stats = await CustomerService.getCustomerStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error loading customer stats:', error);
    }
  }, []);

  // Search customers
  const searchCustomers = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        search: query,
        page: 1, // Reset to first page on search
      },
    }));
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<CustomerFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        page: newFilters.page || 1, // Reset to first page when changing filters (except page)
      },
    }));
  }, []);

  // Select/deselect customer
  const selectCustomer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedCustomers: prev.selectedCustomers.includes(id)
        ? prev.selectedCustomers.filter(customerId => customerId !== id)
        : [...prev.selectedCustomers, id],
    }));
  }, []);

  // Select all customers on current page
  const selectAllCustomers = useCallback(() => {
    setState(prev => {
      const allCurrentPageIds = prev.customers.map(c => c.id);
      const allSelected = allCurrentPageIds.every(id => prev.selectedCustomers.includes(id));

      if (allSelected) {
        // Deselect all from current page
        return {
          ...prev,
          selectedCustomers: prev.selectedCustomers.filter(id => !allCurrentPageIds.includes(id)),
        };
      } else {
        // Select all from current page
        const newSelection = Array.from(new Set([...prev.selectedCustomers, ...allCurrentPageIds]));
        return {
          ...prev,
          selectedCustomers: newSelection,
        };
      }
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedCustomers: [] }));
  }, []);

  // Delete single customer
  const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await CustomerService.deleteCustomer(id);
      if (success) {
        // Remove from selected customers if it was selected
        setState(prev => ({
          ...prev,
          selectedCustomers: prev.selectedCustomers.filter(customerId => customerId !== id),
        }));
        // Reload customers
        await loadCustomers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  }, [loadCustomers]);

  // Bulk delete customers
  const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      const success = await CustomerService.bulkDelete(ids);
      if (success) {
        // Clear selections and reload
        clearSelection();
        await loadCustomers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error bulk deleting customers:', error);
      return false;
    }
  }, [loadCustomers, clearSelection]);

  // Update customer status
  const updateCustomerStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    try {
      const updatedCustomer = await CustomerService.updateCustomerStatus(id, status);
      if (updatedCustomer) {
        // Update customer in state
        setState(prev => ({
          ...prev,
          customers: prev.customers.map(customer =>
            customer.id === id ? updatedCustomer : customer
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating customer status:', error);
      return false;
    }
  }, []);

  // Export customers
  const exportCustomers = useCallback(async (options: ExportOptions): Promise<void> => {
    try {
      const blob = await CustomerService.exportCustomers(options.format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = options.format === 'json' ? 'json' : 'csv';
      a.download = `customers-${timestamp}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw error;
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadCustomers(), loadStats()]);
  }, [loadCustomers, loadStats]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const actions: UseCustomersActions = {
    loadCustomers,
    loadStats,
    searchCustomers,
    setFilters,
    selectCustomer,
    selectAllCustomers,
    clearSelection,
    deleteCustomer,
    bulkDelete,
    updateCustomerStatus,
    exportCustomers,
    refreshData,
  };

  return {
    ...state,
    actions,
  };
};

export default useCustomers;