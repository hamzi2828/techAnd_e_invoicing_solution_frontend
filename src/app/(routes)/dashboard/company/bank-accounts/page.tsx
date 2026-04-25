'use client';

import React, { useState, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  BankAccountCard,
  BankAccountModal,
  BankAccountFilters,
  EmptyState,
  LoadingSpinner
} from './components';
import { BankAccount, BankAccountForm } from './types';
import { useBankAccounts } from './hooks/useBankAccounts';
import { useBankAccountForm } from './hooks/useBankAccountForm';
import { BankAccountFilters as FilterType } from './services/bankAccountService';

export default function BankAccounts() {
  // State for UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [showAccountNumbers, setShowAccountNumbers] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Custom hooks for data management
  const {
    bankAccounts,
    loading,
    error,
    pagination,
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setDefaultBankAccount,
    refreshData
  } = useBankAccounts();

  const {
    formData,
    saudiBanks,
    companies,
    loading: formLoading,
    submitting,
    validationErrors,
    updateField,
    validateIBAN,
    resetForm,
    validateForm,
    setSubmitting
  } = useBankAccountForm(editingAccount);

  const handleInputChange = useCallback((field: keyof BankAccountForm, value: string) => {
    updateField(field, value);

    // Validate IBAN on change
    if (field === 'iban' && value) {
      validateIBAN(value);
    }
  }, [updateField, validateIBAN]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAccount(null);
    resetForm();
  }, [resetForm]);

  const handleOpenModal = useCallback(() => {
    setEditingAccount(null);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      let success = false;

      if (editingAccount) {
        const accountId = editingAccount._id || editingAccount.id;
        if (!accountId) {
          throw new Error('No account ID found for updating');
        }
        success = await updateBankAccount(accountId, formData);
      } else {
        success = await createBankAccount(formData);
      }

      if (success) {
        handleCloseModal();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [editingAccount, formData, validateForm, updateBankAccount, createBankAccount, setSubmitting, handleCloseModal]);

  const handleEdit = useCallback((account: BankAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    await deleteBankAccount(id);
  }, [deleteBankAccount]);

  const handleSetDefault = useCallback(async (id: string) => {
    await setDefaultBankAccount(id);
  }, [setDefaultBankAccount]);

  const toggleAccountVisibility = useCallback((id: string) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleCopyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  // Handle search and filter changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    const filters: FilterType = {
      search: value || undefined,
      status: statusFilter !== 'all' ? statusFilter as 'active' | 'inactive' | 'pending' | 'suspended' : undefined,
      page: 1 // Reset to first page when searching
    };
    fetchBankAccounts(filters);
  }, [statusFilter, fetchBankAccounts]);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    const filters: FilterType = {
      search: searchTerm || undefined,
      status: value !== 'all' ? value as 'active' | 'inactive' | 'pending' | 'suspended' : undefined,
      page: 1 // Reset to first page when filtering
    };
    fetchBankAccounts(filters);
  }, [searchTerm, fetchBankAccounts]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast.success('Data refreshed successfully');
    } catch{
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const filteredAccounts = bankAccounts;

  // Show loading spinner on initial load
  if (loading && bankAccounts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-white via-primary-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-700 bg-clip-text text-transparent">Bank Accounts</h1>
            <p className="text-gray-600 mt-1">Manage your company&apos;s bank accounts and payment methods</p>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
            <button
              onClick={handleOpenModal}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Bank Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <BankAccountFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        accountsCount={filteredAccounts.length}
        totalAccounts={pagination.totalRecords}
        loading={loading}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {/* Bank Accounts Grid or Empty State */}
      {loading && filteredAccounts.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredAccounts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAccounts.map((account) => (
              <BankAccountCard
                key={account._id || account.id}
                account={account}
                showAccountNumber={showAccountNumbers[account._id || account.id || ''] || false}
                onToggleVisibility={toggleAccountVisibility}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                onCopyAccountNumber={(accountNumber) => handleCopyToClipboard(accountNumber)}
                onCopyIBAN={(iban) => handleCopyToClipboard(iban)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex justify-center items-center space-x-4 py-6">
              <span className="text-sm text-gray-600">
                Page {pagination.current} of {pagination.total}
                ({pagination.totalRecords} total accounts)
              </span>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onAddAccount={handleOpenModal}
        />
      )}

      {/* Modal */}
      <BankAccountModal
        isOpen={isModalOpen}
        editingAccount={editingAccount}
        formData={formData}
        saudiBanks={saudiBanks}
        companies={companies}
        loading={formLoading}
        submitting={submitting}
        validationErrors={validationErrors}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
      />
    </div>
  );
}