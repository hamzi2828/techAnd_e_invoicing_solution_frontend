'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Calendar,
  DollarSign,
  Trash2,
  FileCheck
} from 'lucide-react';
import { QuotationListService, QuotationListItem, QuotationStats } from './services';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

const statusOptions = ['all', 'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'];

export default function Quotations() {
  const { user, hasPermission } = useCurrentUser();

  // Permission checks
  const permissions = {
    canCreate: !user?.createdBy || hasPermission('sales-create-quotation'),
    canView: !user?.createdBy || hasPermission('sales-view-quotations'),
    canEdit: !user?.createdBy || hasPermission('sales-edit-quotation'),
    canDelete: !user?.createdBy || hasPermission('sales-delete-quotation'),
    canSend: !user?.createdBy || hasPermission('sales-send-quotation'),
    canConvert: !user?.createdBy || hasPermission('sales-convert-quotation'),
  };

  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [stats, setStats] = useState<QuotationStats>({
    totalQuotations: 0,
    totalValue: 0,
    draftCount: 0,
    sentCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    expiredCount: 0,
    convertedCount: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();

  const loadQuotations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await QuotationListService.getQuotations({
        status: statusFilter,
        search: searchQuery,
        limit: 100
      });

      if (result.success) {
        setQuotations(result.quotations);
      } else {
        setError('Failed to load quotations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotations');
      console.error('Error loading quotations:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await QuotationListService.getQuotationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Load quotations and stats on mount and when filters change
  useEffect(() => {
    loadQuotations();
    loadStats();
  }, [loadQuotations, loadStats]);

  const handleDelete = async (quotationId: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      await QuotationListService.deleteQuotation(quotationId);
      loadQuotations();
      loadStats();
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to delete quotation', 'error');
    }
  };

  const handleSend = async (quotationId: string) => {
    if (!confirm('Are you sure you want to send this quotation to the customer?')) {
      return;
    }

    try {
      await QuotationListService.sendQuotation(quotationId);
      loadQuotations();
      loadStats();
      showAlert('Quotation sent successfully!', 'success');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to send quotation', 'error');
    }
  };

  const handleConvertToInvoice = async (quotationId: string) => {
    if (!confirm('Convert this quotation to an invoice? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await QuotationListService.convertToInvoice(quotationId);
      if (result.success) {
        loadQuotations();
        loadStats();
        if (confirm('Quotation converted to invoice successfully! Would you like to view the invoice?')) {
          window.location.href = `/dashboard/sales/invoice/${result.invoiceId}`;
        }
      }
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to convert quotation', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCounts = () => {
    return {
      all: stats.totalQuotations,
      draft: stats.draftCount,
      sent: stats.sentCount,
      accepted: stats.acceptedCount,
      rejected: stats.rejectedCount,
      expired: stats.expiredCount,
      converted: stats.convertedCount
    };
  };

  const statusCounts = getStatusCounts();

  if (loading && quotations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (error && quotations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadQuotations}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600">Create and manage sales quotations</p>
        </div>
        {permissions.canCreate && (
          <Link
            href="/dashboard/sales/quotations/create"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">New Quotation</span>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quotations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalQuotations}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats.acceptedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.sentCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                SAR {stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search quotations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Status Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-100 text-primary-700 border border-primary-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status as keyof typeof statusCounts] || 0})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quotation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotations.map((quotation) => {
                const quotationId = quotation._id || quotation.id || '';
                return (
                  <tr key={quotationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{quotation.quoteNumber}</div>
                        <div className="text-sm text-gray-600">{quotation.items.length} items</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{quotation.customerInfo.name}</div>
                        <div className="text-sm text-gray-600">{quotation.customerInfo.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {quotation.currency} {quotation.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(quotation.validUntil).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/sales/quotations/${quotationId}`}
                          className="p-1 text-gray-400 hover:text-gray-600 tooltip"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {permissions.canEdit && (
                          <Link
                            href={`/dashboard/sales/quotations/edit/${quotationId}`}
                            className="p-1 text-gray-400 hover:text-gray-600 tooltip"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {permissions.canSend && (
                          <button
                            onClick={() => handleSend(quotationId)}
                            className="p-1 text-gray-400 hover:text-blue-600 tooltip"
                            title="Send"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {permissions.canConvert && (
                          <button
                            onClick={() => handleConvertToInvoice(quotationId)}
                            className="p-1 text-gray-400 hover:text-green-600 tooltip"
                            title="Convert to Invoice"
                          >
                            <FileCheck className="h-4 w-4" />
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button
                            onClick={() => handleDelete(quotationId)}
                            className="p-1 text-gray-400 hover:text-red-600 tooltip"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {quotations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first quotation'}
            </p>
            {permissions.canCreate && (
              <Link
                href="/dashboard/sales/quotations/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Create Quotation</span>
              </Link>
            )}
          </div>
        )}
      </div>

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
