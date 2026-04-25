import React, { useState } from 'react';
import { Search, Filter, Download, Upload, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { CustomerFilters, ExportOptions } from '../types';

interface CustomersFiltersProps {
  filters: CustomerFilters;
  selectedCount: number;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: Partial<CustomerFilters>) => void;
  onExport: (options: ExportOptions) => void;
  onBulkDelete?: () => void;
}

const CustomersFilters: React.FC<CustomersFiltersProps> = ({
  filters,
  selectedCount,
  onSearchChange,
  onFilterChange,
  onExport,
  onBulkDelete,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleStatusFilter = (status: CustomerFilters['status']) => {
    onFilterChange({ status });
    setShowFilterDropdown(false);
  };

  const handleTypeFilter = (type: CustomerFilters['type']) => {
    onFilterChange({ type });
    setShowFilterDropdown(false);
  };

  const handleExport = (format: 'csv' | 'json') => {
    onExport({
      format,
      filters,
    });
    setShowExportDropdown(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.search) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or VAT number..."
                value={filters.search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Bulk Actions (show only when items selected) */}
            {selectedCount > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200">
                <span className="text-sm text-primary-800 font-medium">
                  {selectedCount} selected
                </span>
                {onBulkDelete && (
                  <button
                    onClick={onBulkDelete}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                  <div className="py-2">
                    {/* Status Filters */}
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">
                      Status
                    </div>
                    <button
                      onClick={() => handleStatusFilter('all')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filters.status === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      All Customers
                    </button>
                    <button
                      onClick={() => handleStatusFilter('active')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filters.status === 'active' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Active Only
                    </button>
                    <button
                      onClick={() => handleStatusFilter('inactive')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filters.status === 'inactive' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Inactive Only
                    </button>

                    {/* Type Filters */}
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b border-t mt-2">
                      Type
                    </div>
                    <button
                      onClick={() => handleTypeFilter('all')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filters.type === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => handleTypeFilter('company')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filters.type === 'company' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Business Only
                    </button>
                    <button
                      onClick={() => handleTypeFilter('individual')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filters.type === 'individual' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Individual Only
                    </button>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                      <>
                        <div className="border-t mt-2 pt-2">
                          <button
                            onClick={() => {
                              onFilterChange({ status: 'all', type: 'all', search: '' });
                              setShowFilterDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>

              {/* Export Dropdown */}
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                  <div className="py-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Import Button */}
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>

            {/* Add Customer Button */}
            <Link
              href="/admin/customers/add"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Active filters:</span>
            {filters.status && filters.status !== 'all' && (
              <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-md">
                Status: {filters.status}
              </span>
            )}
            {filters.type && filters.type !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md">
                Type: {filters.type}
              </span>
            )}
            {filters.search && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                Search: "{filters.search}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersFilters;