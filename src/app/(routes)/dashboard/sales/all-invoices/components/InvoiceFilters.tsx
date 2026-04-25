import React from 'react';
import { Search, Plus } from 'lucide-react';
import { InvoiceFilters } from '../types';
import Link from 'next/link';

interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (filters: InvoiceFilters) => void;
  onSearch: () => void;
  canCreate?: boolean;
}

const InvoiceFiltersComponent: React.FC<InvoiceFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  canCreate = true
}) => {
  const handleInputChange = (field: keyof InvoiceFilters, value: string | number) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="flex space-x-2">
          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <input
            type="date"
            placeholder="End Date"
            value={filters.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFiltersComponent;