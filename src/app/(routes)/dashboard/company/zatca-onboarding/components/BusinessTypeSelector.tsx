'use client';

import React from 'react';
import { Building2, Users, CheckCircle, Briefcase } from 'lucide-react';
import { BusinessType } from '../../types';

interface BusinessTypeSelectorProps {
  selectedType: BusinessType | null;
  onSelectType: (type: BusinessType) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const BUSINESS_TYPE_CONFIG: Record<BusinessType, {
  label: string;
  description: string;
  invoiceType: string;
  details: string[];
  icon: React.ReactNode;
}> = {
  B2B: {
    label: 'B2B (Standard)',
    description: 'Business-to-Business invoicing',
    invoiceType: 'Standard Tax Invoice',
    details: [
      'Full buyer information required',
      'VAT registration number mandatory',
      'Invoice clearance with ZATCA',
      'Suitable for business customers'
    ],
    icon: <Building2 className="h-6 w-6" />
  },
  B2C: {
    label: 'B2C (Simplified)',
    description: 'Business-to-Consumer invoicing',
    invoiceType: 'Simplified Tax Invoice',
    details: [
      'Minimal buyer information',
      'QR code for verification',
      'Invoice reporting to ZATCA',
      'Suitable for retail and consumers'
    ],
    icon: <Users className="h-6 w-6" />
  },
  both: {
    label: 'Both (B2B + B2C)',
    description: 'Support for all invoice types',
    invoiceType: 'Standard & Simplified',
    details: [
      'Full flexibility for all customers',
      'Automatic invoice type selection',
      'Both clearance and reporting',
      'Recommended for most businesses'
    ],
    icon: <Briefcase className="h-6 w-6" />
  }
};

export default function BusinessTypeSelector({
  selectedType,
  onSelectType,
  isLoading,
  disabled
}: BusinessTypeSelectorProps) {
  const types: BusinessType[] = ['B2B', 'B2C', 'both'];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Business Type</h3>
        <p className="text-sm text-gray-600">
          Choose the type of invoicing that matches your business model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map((type) => {
          const config = BUSINESS_TYPE_CONFIG[type];
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => !disabled && !isLoading && onSelectType(type)}
              disabled={disabled || isLoading}
              className={`
                relative p-5 rounded-xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-primary bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                }
                ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              )}

              {/* Icon and label */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {config.icon}
                </div>
                <div>
                  <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {config.label}
                  </h4>
                  <span className="text-xs text-gray-500">{config.invoiceType}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3">
                {config.description}
              </p>

              {/* Details list */}
              <ul className="space-y-1.5">
                {config.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-primary' : 'bg-gray-400'}`} />
                    {detail}
                  </li>
                ))}
              </ul>

              {/* Recommended badge for 'both' */}
              {type === 'both' && (
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Recommended
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> Your selection determines which invoice types you can generate.
          Choose &quot;Both&quot; for maximum flexibility, or select a specific type if you only serve one market segment.
        </p>
      </div>
    </div>
  );
}
