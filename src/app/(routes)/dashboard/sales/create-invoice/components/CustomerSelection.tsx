import React, { useState } from 'react';
import { Search, Mail, Phone, X, PlusCircle } from 'lucide-react';
import { Customer } from '../types';
import QuickCustomerModal from './QuickCustomerModal';

interface CustomerSelectionProps {
  selectedCustomer: Customer | null;
  customerSearch: string;
  customerSearchOpen: boolean;
  filteredCustomers: Customer[];
  onCustomerSearchChange: (value: string) => void;
  onCustomerSearchFocus: () => void;
  onCustomerSelect: (customer: Customer) => void;
  onCustomerClear: () => void;
  onSearchOpenChange: (open: boolean) => void;
  isB2C?: boolean; // Show "Add New" button only for B2C customers
  disabled?: boolean; // Disable the component when company is not onboarded
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  selectedCustomer,
  customerSearch,
  customerSearchOpen,
  filteredCustomers,
  onCustomerSearchChange,
  onCustomerSearchFocus,
  onCustomerSelect,
  onCustomerClear,
  onSearchOpenChange,
  isB2C = false,
  disabled = false,
}) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleQuickCustomerCreated = (newCustomer: Customer) => {
    onCustomerSelect(newCustomer);
    setIsQuickAddOpen(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
        {isB2C && (
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Quick add B2C customer"
            disabled={disabled}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {!selectedCustomer ? (
        <div className="relative">
          <div className="space-y-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => {
                  onCustomerSearchChange(e.target.value);
                  onSearchOpenChange(true);
                }}
                onFocus={() => {
                  onCustomerSearchFocus();
                  onSearchOpenChange(true);
                }}
                className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={disabled}
              />
            </div>
          </div>

          {customerSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">No customers found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer._id || customer.id}
                    onClick={() => onCustomerSelect(customer)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    {customer.companyName && (
                      <div className="text-sm text-gray-600">{customer.companyName}</div>
                    )}
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedCustomer.name}</h4>
              {selectedCustomer.companyName && (
                <p className="text-sm text-gray-600">{selectedCustomer.companyName}</p>
              )}
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3" />
                  <span>{selectedCustomer.phone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onCustomerClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      <QuickCustomerModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCustomerCreated={handleQuickCustomerCreated}
      />
    </div>
  );
};

export default CustomerSelection;