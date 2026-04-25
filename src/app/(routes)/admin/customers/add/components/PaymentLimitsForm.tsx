'use client';

import React from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import type { PaymentLimitsFormProps } from '../../types';

export default function PaymentLimitsForm({ formData, onUpdateField }: PaymentLimitsFormProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Payment Limits</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Limit */}
        <div>
          <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Limit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{formData.currency || 'SAR'}</span>
            </div>
            <input
              type="number"
              id="dailyLimit"
              value={formData.dailyLimit}
              onChange={(e) => onUpdateField('dailyLimit', e.target.value)}
              className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximum daily transaction amount</p>
        </div>

        {/* Monthly Limit */}
        <div>
          <label htmlFor="monthlyLimit" className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Limit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{formData.currency || 'SAR'}</span>
            </div>
            <input
              type="number"
              id="monthlyLimit"
              value={formData.monthlyLimit}
              onChange={(e) => onUpdateField('monthlyLimit', e.target.value)}
              className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximum monthly transaction amount</p>
        </div>

        {/* Per Transaction Limit */}
        <div>
          <label htmlFor="perTransactionLimit" className="block text-sm font-medium text-gray-700 mb-2">
            Per Transaction Limit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{formData.currency || 'SAR'}</span>
            </div>
            <input
              type="number"
              id="perTransactionLimit"
              value={formData.perTransactionLimit}
              onChange={(e) => onUpdateField('perTransactionLimit', e.target.value)}
              className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximum single transaction amount</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700 font-medium">Payment Limits Information</p>
            <p className="text-xs text-yellow-600 mt-1">
              These limits help control risk and prevent unauthorized large transactions. Leave empty for no limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}