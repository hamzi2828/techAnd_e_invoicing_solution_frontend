import React from 'react';
import { CreditCard, Plus } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: string;
  onAddAccount: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  statusFilter,
  onAddAccount,
}) => {
  const hasFilters = searchTerm || statusFilter !== 'all';

  return (
    <div className="bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl border border-primary-200 p-12 text-center shadow-sm">
      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
        <CreditCard className="h-8 w-8 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold bg-gradient-to-r from-primary via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
        No bank accounts found
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {hasFilters
          ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
          : 'Add your first bank account to start managing payments and transactions'
        }
      </p>
      {!hasFilters && (
        <button
          onClick={onAddAccount}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Bank Account</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
