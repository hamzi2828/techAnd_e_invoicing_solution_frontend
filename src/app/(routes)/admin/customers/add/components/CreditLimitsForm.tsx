import React from 'react';
import { DollarSign } from 'lucide-react';
import type { CreditData, CreditLimitsFormProps } from '../../types';

const CreditLimitsForm: React.FC<CreditLimitsFormProps> = ({
  creditData,
  onUpdateCreditData,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Credit Limits & Terms</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Limit (SAR)
          </label>
          <input
            type="number"
            value={creditData.creditLimit}
            onChange={(e) => onUpdateCreditData('creditLimit', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter credit limit"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Terms (Days)
          </label>
          <select
            value={creditData.paymentTerms}
            onChange={(e) => onUpdateCreditData('paymentTerms', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Payment Terms</option>
            <option value="0">Cash on Delivery</option>
            <option value="7">7 Days</option>
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
            <option value="45">45 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Early Payment Discount (%)
          </label>
          <input
            type="number"
            value={creditData.discountPercentage}
            onChange={(e) => onUpdateCreditData('discountPercentage', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Discount percentage"
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Days
          </label>
          <input
            type="number"
            value={creditData.discountDays}
            onChange={(e) => onUpdateCreditData('discountDays', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Days for early payment discount"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Late Fee Percentage (%)
          </label>
          <input
            type="number"
            value={creditData.lateFeePercentage}
            onChange={(e) => onUpdateCreditData('lateFeePercentage', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Late payment fee percentage"
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grace Period (Days)
          </label>
          <input
            type="number"
            value={creditData.gracePeriodDays}
            onChange={(e) => onUpdateCreditData('gracePeriodDays', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Grace period before late fees apply"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default CreditLimitsForm;