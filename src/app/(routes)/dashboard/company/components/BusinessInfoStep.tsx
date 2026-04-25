import React from 'react';
import { CompanyData, ValidationErrors } from './types';
import { ValidationMessage } from './ValidationMessage';

interface BusinessInfoStepProps {
  data: CompanyData['businessInfo'];
  validationErrors: ValidationErrors;
  onChange: (field: string, value: string) => void;
}

export const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  data,
  validationErrors,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            value={data.businessType}
            onChange={(e) => onChange('businessType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.businessType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Business Type</option>
            <option value="corporation">Corporation</option>
            <option value="llc">Limited Liability Company (LLC)</option>
            <option value="partnership">Partnership</option>
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="nonprofit">Non-Profit Organization</option>
          </select>
          <ValidationMessage error={validationErrors.businessType} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee Count
          </label>
          <select
            value={data.employeeCount}
            onChange={(e) => onChange('employeeCount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select Employee Count</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-100">51-100 employees</option>
            <option value="101-500">101-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Revenue
          </label>
          <select
            value={data.annualRevenue}
            onChange={(e) => onChange('annualRevenue', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select Annual Revenue</option>
            <option value="under_100k">Under 100K SAR</option>
            <option value="100k_500k">100K - 500K SAR</option>
            <option value="500k_1m">500K - 1M SAR</option>
            <option value="1m_5m">1M - 5M SAR</option>
            <option value="5m_plus">5M+ SAR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Currency *
          </label>
          <select
            value={data.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="SAR">SAR - Saudi Riyal</option>
            <option value="AED">AED - UAE Dirham</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>
      </div>
    </div>
  );
};
