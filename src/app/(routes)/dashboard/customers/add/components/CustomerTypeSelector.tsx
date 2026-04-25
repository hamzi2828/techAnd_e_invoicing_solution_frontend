import React from 'react';
import { User, Building } from 'lucide-react';
import type { CustomerTypeSelectorProps } from '../../types';

const CustomerTypeSelector: React.FC<CustomerTypeSelectorProps> = ({
  customerType,
  onTypeChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Type</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => !disabled && onTypeChange('business')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all ${
            customerType === 'business'
              ? 'border-lime-500 bg-gradient-to-br from-lime-50 to-yellow-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Building className={`h-8 w-8 mx-auto mb-2 ${
            customerType === 'business' ? 'text-lime-600' : 'text-gray-400'
          }`} />
          <p className={`font-medium ${
            customerType === 'business' ? 'text-gray-900' : 'text-gray-600'
          }`}>Business</p>
          <p className="text-xs text-gray-500 mt-1">Company or organization</p>
        </button>
        <button
          onClick={() => !disabled && onTypeChange('individual')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all ${
            customerType === 'individual'
              ? 'border-lime-500 bg-gradient-to-br from-lime-50 to-yellow-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <User className={`h-8 w-8 mx-auto mb-2 ${
            customerType === 'individual' ? 'text-lime-600' : 'text-gray-400'
          }`} />
          <p className={`font-medium ${
            customerType === 'individual' ? 'text-gray-900' : 'text-gray-600'
          }`}>Individual</p>
          <p className="text-xs text-gray-500 mt-1">Personal account</p>
        </button>
      </div>
    </div>
  );
};

export default CustomerTypeSelector;