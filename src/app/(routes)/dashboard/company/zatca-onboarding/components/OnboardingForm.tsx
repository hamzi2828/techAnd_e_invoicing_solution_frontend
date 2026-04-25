'use client';

import React, { useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { OnboardingDetails, BusinessType } from '../../types';

interface OnboardingFormProps {
  businessType: BusinessType;
  initialData?: OnboardingDetails | null;
  onSubmit: (data: OnboardingDetails) => Promise<void>;
  isLoading?: boolean;
}

export default function OnboardingForm({
  businessType,
  initialData,
  onSubmit,
  isLoading
}: OnboardingFormProps) {
  const [formData, setFormData] = useState<OnboardingDetails>({
    sellerName: initialData?.sellerName || '',
    sellerNumber: initialData?.sellerNumber || '',
    totalAmount: initialData?.totalAmount || 0,
    buyerDetails: initialData?.buyerDetails || {
      name: '',
      vatNumber: '',
      address: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const showBuyerDetails = businessType === 'B2B' || businessType === 'both';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sellerName.trim()) {
      newErrors.sellerName = 'Seller name is required';
    }

    if (!formData.sellerNumber.trim()) {
      newErrors.sellerNumber = 'Seller number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.sellerNumber.replace(/\s/g, ''))) {
      newErrors.sellerNumber = 'Invalid seller number format';
    }

    if (showBuyerDetails && formData.buyerDetails) {
      if (businessType === 'B2B' && !formData.buyerDetails.vatNumber?.trim()) {
        newErrors.buyerVatNumber = 'Buyer VAT number is required for B2B';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBuyerChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      buyerDetails: {
        ...prev.buyerDetails,
        [field]: value
      }
    }));
    // Clear error when user starts typing
    const errorKey = `buyer${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboarding Details</h3>
        <p className="text-sm text-gray-600">
          Provide the required information for ZATCA onboarding.
        </p>
      </div>

      {/* Seller Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Seller Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seller Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seller Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.sellerName}
              onChange={(e) => handleInputChange('sellerName', e.target.value)}
              placeholder="Enter seller/company name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.sellerName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.sellerName && (
              <p className="mt-1 text-sm text-red-500">{errors.sellerName}</p>
            )}
          </div>

          {/* Seller Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seller Number (VAT/CR) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.sellerNumber}
              onChange={(e) => handleInputChange('sellerNumber', e.target.value)}
              placeholder="Enter VAT or CR number"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.sellerNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.sellerNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.sellerNumber}</p>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sample Invoice Amount (SAR)
            </label>
            <input
              type="number"
              value={formData.totalAmount}
              onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Used for test invoice generation</p>
          </div>
        </div>
      </div>

      {/* Buyer Information (for B2B) */}
      {showBuyerDetails && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-medium text-gray-900">Buyer Information</h4>
            {businessType === 'both' && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                For B2B invoices
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buyer Name
              </label>
              <input
                type="text"
                value={formData.buyerDetails?.name || ''}
                onChange={(e) => handleBuyerChange('name', e.target.value)}
                placeholder="Enter buyer/customer name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Buyer VAT Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buyer VAT Number {businessType === 'B2B' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.buyerDetails?.vatNumber || ''}
                onChange={(e) => handleBuyerChange('vatNumber', e.target.value)}
                placeholder="Enter buyer VAT number"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.buyerVatNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.buyerVatNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.buyerVatNumber}</p>
              )}
            </div>

            {/* Buyer Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buyer Address
              </label>
              <input
                type="text"
                value={formData.buyerDetails?.address || ''}
                onChange={(e) => handleBuyerChange('address', e.target.value)}
                placeholder="Enter buyer address"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Why is this information needed?</p>
          <p>
            This information is used to generate test invoices during the onboarding process.
            It helps verify that your ZATCA integration is working correctly before going live.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-300"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
}
