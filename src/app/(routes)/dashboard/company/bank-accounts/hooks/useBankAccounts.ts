// src/app/(routes)/admin/company/bank-accounts/hooks/useBankAccounts.ts
import { useState, useEffect, useCallback } from 'react';
import { BankAccountService, BankAccountFilters } from '../services/bankAccountService';
import { BankAccount, BankAccountForm } from '../types';
import toast from 'react-hot-toast';

export interface UseBankAccountsReturn {
  // State
  bankAccounts: BankAccount[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
  };

  // Actions
  fetchBankAccounts: (filters?: BankAccountFilters) => Promise<void>;
  createBankAccount: (data: BankAccountForm) => Promise<boolean>;
  updateBankAccount: (id: string, data: Partial<BankAccountForm>) => Promise<boolean>;
  deleteBankAccount: (id: string) => Promise<boolean>;
  setDefaultBankAccount: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useBankAccounts = (initialFilters: BankAccountFilters = {}) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0
  });
  const [currentFilters, setCurrentFilters] = useState<BankAccountFilters>(initialFilters);

  const fetchBankAccounts = useCallback(async (filters: BankAccountFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const mergedFilters = { ...currentFilters, ...filters };
      setCurrentFilters(mergedFilters);

      const response = await BankAccountService.getBankAccounts(mergedFilters);

      setBankAccounts(response.accounts);
      setPagination(response.pagination);

    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching bank accounts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const createBankAccount = useCallback(async (data: BankAccountForm): Promise<boolean> => {
    try {
      const response = await BankAccountService.createBankAccount(data);

      toast.success('Bank account created successfully');
      await refreshData();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error creating bank account';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const updateBankAccount = useCallback(async (id: string, data: Partial<BankAccountForm>): Promise<boolean> => {
    try {
      const response = await BankAccountService.updateBankAccount(id, data);

      toast.success('Bank account updated successfully');
      await refreshData();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error updating bank account';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const deleteBankAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      await BankAccountService.deleteBankAccount(id);

      toast.success('Bank account deleted successfully');
      await refreshData();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error deleting bank account';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const setDefaultBankAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await BankAccountService.setDefaultBankAccount(id);

      toast.success('Default bank account updated successfully');
      await refreshData();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error setting default bank account';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchBankAccounts(currentFilters);
  }, [fetchBankAccounts, currentFilters]);

  // Initial load
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  return {
    // State
    bankAccounts,
    loading,
    error,
    pagination,

    // Actions
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setDefaultBankAccount,
    refreshData
  } as UseBankAccountsReturn;
};