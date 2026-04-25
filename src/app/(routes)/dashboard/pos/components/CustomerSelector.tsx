'use client';

import React, { useState, useEffect } from 'react';
import { User, ChevronDown, Loader2 } from 'lucide-react';
import { POSCustomer } from '../types';

interface CustomerSelectorProps {
  customers: POSCustomer[];
  selectedCustomer: POSCustomer | null;
  onSelectCustomer: (customer: POSCustomer | null) => void;
  onSearchCustomers: (query: string) => void;
  isLoading: boolean;
}

export default function CustomerSelector({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onSearchCustomers,
  isLoading
}: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced customer search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        onSearchCustomers(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearchCustomers]);

  const handleSelect = (customer: POSCustomer | null) => {
    onSelectCustomer(customer);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className={selectedCustomer ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-72 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            <button
              onClick={() => handleSelect(null)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b"
            >
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Walk-in Customer</span>
            </button>
            {isLoading ? (
              <div className="px-4 py-3 text-center text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              </div>
            ) : customers.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500 text-sm">
                No customers found
              </div>
            ) : (
              customers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.email || customer.phone}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
