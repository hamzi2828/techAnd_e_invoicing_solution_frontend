'use client';

import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { RISK_RATING_OPTIONS, VERIFICATION_STATUS_OPTIONS, STATUS_OPTIONS } from '../../types';
import type { ComplianceFormProps } from '../../types';

export default function ComplianceForm({ formData, onUpdateField }: ComplianceFormProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Shield className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Compliance Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Rating */}
        <div>
          <label htmlFor="riskRating" className="block text-sm font-medium text-gray-700 mb-2">
            Risk Rating *
          </label>
          <select
            id="riskRating"
            value={formData.riskRating}
            onChange={(e) => onUpdateField('riskRating', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            {RISK_RATING_OPTIONS.map((rating) => (
              <option key={rating} value={rating}>
                {rating.charAt(0).toUpperCase() + rating.slice(1)} Risk
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => onUpdateField('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <label htmlFor="verificationStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Status
          </label>
          <select
            id="verificationStatus"
            value={formData.verificationStatus}
            onChange={(e) => onUpdateField('verificationStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {VERIFICATION_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sanction Screening */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sanctionScreened"
            checked={formData.sanctionScreened}
            onChange={(e) => onUpdateField('sanctionScreened', e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="sanctionScreened" className="ml-2 block text-sm text-gray-700">
            <span className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
              Sanction Screened
            </span>
          </label>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => onUpdateField('isActive', e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active Customer
          </label>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <Shield className="h-4 w-4 inline mr-1" />
          Compliance information is used for risk assessment and regulatory reporting.
        </p>
      </div>
    </div>
  );
}