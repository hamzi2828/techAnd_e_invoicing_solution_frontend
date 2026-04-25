'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useCustomers } from './hooks/useCustomers';
import { CustomerAction, CustomerDetails, ExportOptions } from './types';
import {
  CustomerStats,
  CustomersTable,
  CustomersFilters,
  CustomersPagination,
} from './components';
import { useRouter } from 'next/navigation';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';
import { usePlan } from '@/contexts/PlanContext';

export default function CustomersPage() {
  const router = useRouter();
  const { canCreate, planInfo } = usePlan();
  const {
    customers,
    stats,
    selectedCustomers,
    filters,
    pagination,
    isLoading,
    error,
    actions,
  } = useCustomers();

  // Plan limit check
  const customerCheck = canCreate('customer');

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();

  const handleCustomerAction = async (action: CustomerAction, customer: CustomerDetails) => {
    switch (action) {
      case 'view':
        // TODO: Navigate to customer detail view
        console.log('View customer:', customer.id);
        break;

      case 'edit':
        router.push(`/dashboard/customers/${customer.id}`);
        break;

      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
          const success = await actions.deleteCustomer(customer.id);
          if (!success) {
            showAlert('Failed to delete customer. Please try again.', 'error');
          }
        }
        break;

      case 'activate':
        const activateSuccess = await actions.updateCustomerStatus(customer.id, 'active');
        if (!activateSuccess) {
          showAlert('Failed to activate customer. Please try again.', 'error');
        }
        break;

      case 'deactivate':
        const deactivateSuccess = await actions.updateCustomerStatus(customer.id, 'inactive');
        if (!deactivateSuccess) {
          showAlert('Failed to deactivate customer. Please try again.', 'error');
        }
        break;

      default:
        console.log('Unknown action:', action);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedCustomers.length} customer${
      selectedCustomers.length > 1 ? 's' : ''
    }?`;

    if (window.confirm(confirmMessage)) {
      const success = await actions.bulkDelete(selectedCustomers);
      if (!success) {
        showAlert('Failed to delete customers. Please try again.', 'error');
      }
    }
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      await actions.exportCustomers(options);
    } catch (error) {
      console.error('Export failed:', error);
      showAlert('Failed to export customers. Please try again.', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    actions.setFilters({ page });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your customers and their information
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={() => actions.refreshData()}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <CustomerStats stats={stats} isLoading={isLoading} />

      {/* Filters and Search */}
      <CustomersFilters
        filters={filters}
        selectedCount={selectedCustomers.length}
        onSearchChange={actions.searchCustomers}
        onFilterChange={actions.setFilters}
        onExport={handleExport}
        onBulkDelete={selectedCustomers.length > 0 ? handleBulkDelete : undefined}
        customerCheck={customerCheck}
        currentPlanName={planInfo?.currentPlan?.name}
      />

      {/* Customers Table */}
      <CustomersTable
        customers={customers}
        selectedCustomers={selectedCustomers}
        isLoading={isLoading}
        onSelectCustomer={actions.selectCustomer}
        onSelectAll={actions.selectAllCustomers}
        onCustomerAction={handleCustomerAction}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <CustomersPagination
          currentPage={pagination.current}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}