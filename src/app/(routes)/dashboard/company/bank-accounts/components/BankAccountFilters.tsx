import React from 'react';
import { Search, Filter } from 'lucide-react';

interface BankAccountFiltersProps {
  searchTerm: string;
  statusFilter: string;
  accountsCount: number;
  totalAccounts: number;
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

const BankAccountFilters: React.FC<BankAccountFiltersProps> = ({
  searchTerm,
  statusFilter,
  accountsCount,
  totalAccounts,
  loading = false,
  onSearchChange,
  onStatusFilterChange,
}) => {
  return (
    <div className="bg-gradient-to-r from-white via-blue-50 to-primary-50 rounded-xl border border-primary-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-4 w-4 text-primary-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
              className="pl-10 pr-4 py-2.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="h-4 w-4 text-primary-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              disabled={loading}
              className="pl-10 pr-8 py-2.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 bg-gradient-to-r from-primary-100 via-blue-100 to-indigo-100 text-primary-700 text-sm font-medium rounded-full border border-primary-200">
            {accountsCount} of {totalAccounts} accounts
          </span>
        </div>
      </div>
    </div>
  );
};

export default BankAccountFilters;
