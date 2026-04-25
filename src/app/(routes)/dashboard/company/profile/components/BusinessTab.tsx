import React from 'react';
import { CompanyProfile } from '../types';

interface BusinessTabProps {
  profile: CompanyProfile;
  isEditing: boolean;
  validationErrors: Record<string, string>;
  validFields: Record<string, boolean>;
  onInputChange: (section: keyof CompanyProfile, field: string, value: string) => void;
}

const BusinessTab: React.FC<BusinessTabProps> = ({
  profile,
  isEditing,
  validationErrors,
  validFields,
  onInputChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
              {isEditing ? (
                <>
                  <select
                    value={profile.businessInfo.businessType}
                    onChange={(e) => onInputChange('businessInfo', 'businessType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      validationErrors.businessType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Business Type</option>
                    <option value="Limited Liability Company">Limited Liability Company</option>
                    <option value="Joint Stock Company">Joint Stock Company</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Branch of Foreign Company">Branch of Foreign Company</option>
                    <option value="Professional Company">Professional Company</option>
                  </select>
                  {validationErrors.businessType && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.businessType}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.businessInfo.businessType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
              {isEditing ? (
                <select
                  value={profile.businessInfo.employeeCount}
                  onChange={(e) => onInputChange('businessInfo', 'employeeCount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Employee Count</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.businessInfo.employeeCount}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue</label>
              {isEditing ? (
                <select
                  value={profile.businessInfo.annualRevenue}
                  onChange={(e) => onInputChange('businessInfo', 'annualRevenue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="Under 100K SAR">Under 100K SAR</option>
                  <option value="100K-500K SAR">100K-500K SAR</option>
                  <option value="500K-1M SAR">500K-1M SAR</option>
                  <option value="1M-5M SAR">1M-5M SAR</option>
                  <option value="5M-10M SAR">5M-10M SAR</option>
                  <option value="10M+ SAR">10M+ SAR</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.businessInfo.annualRevenue}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Currency *</label>
              {isEditing ? (
                <select
                  value={profile.businessInfo.currency}
                  onChange={(e) => onInputChange('businessInfo', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.businessInfo.currency}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.businessInfo.businessHours}
                  onChange={(e) => onInputChange('businessInfo', 'businessHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 08:00 - 17:00"
                />
              ) : (
                <p className="text-gray-900">{profile.businessInfo.businessHours}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              {isEditing ? (
                <select
                  value={profile.businessInfo.timezone}
                  onChange={(e) => onInputChange('businessInfo', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                  <option value="Asia/Kuwait">Asia/Kuwait (GMT+3)</option>
                  <option value="Asia/Qatar">Asia/Qatar (GMT+3)</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.businessInfo.timezone}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTab;