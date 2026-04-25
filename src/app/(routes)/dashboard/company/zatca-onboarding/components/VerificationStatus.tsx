'use client';

import React, { useState } from 'react';
import {
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw,
  Building2, Users, Link2, Phone, Key, Shield
} from 'lucide-react';
import { VerificationStatusResponse, APIVerificationStatus } from '../../types';

interface VerificationStatusProps {
  status: VerificationStatusResponse | null;
  onVerifyAPI: () => Promise<{ success: boolean; message: string }>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<APIVerificationStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  not_verified: {
    label: 'Not Verified',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: <AlertCircle className="h-4 w-4" />
  },
  pending: {
    label: 'Pending',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: <Loader2 className="h-4 w-4 animate-spin" />
  },
  verified: {
    label: 'Verified',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="h-4 w-4" />
  },
  failed: {
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <XCircle className="h-4 w-4" />
  }
};

interface StatusItemProps {
  label: string;
  value: boolean;
  icon: React.ReactNode;
}

function StatusItem({ label, value, icon }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
          {icon}
        </div>
        <span className="text-gray-700">{label}</span>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}>
        {value ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Enabled
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            Disabled
          </>
        )}
      </div>
    </div>
  );
}

export default function VerificationStatus({
  status,
  onVerifyAPI,
  onRefresh,
  isLoading: externalLoading
}: VerificationStatusProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleVerifyAPI = async () => {
    setIsVerifying(true);
    setError(null);
    setMessage(null);

    try {
      const result = await onVerifyAPI();
      if (result.success) {
        setMessage(result.message);
        await onRefresh();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify API connection');
    } finally {
      setIsVerifying(false);
    }
  };

  const isLoading = externalLoading || isVerifying;
  const apiStatus = status?.apiVerificationStatus || 'not_verified';
  const statusConfig = STATUS_CONFIG[apiStatus];

  if (!status) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Verification Status</h3>
          <p className="text-sm text-gray-600">
            Monitor your ZATCA integration status and API verification.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error/Message Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {message && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* API Verification Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Link2 className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">API Connection</h4>
              <p className="text-sm text-gray-500">ZATCA API Integration Status</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm text-gray-500">Active Environment</span>
            <p className="font-medium text-gray-900 capitalize">
              {status.activeEnvironment || 'None'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Environment Status</span>
            <p className="font-medium text-gray-900 capitalize">
              {status.environmentStatus.replace('_', ' ')}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Last Verified</span>
            <p className="font-medium text-gray-900">
              {status.apiVerifiedAt ? new Date(status.apiVerifiedAt).toLocaleString() : 'Never'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Last Check</span>
            <p className="font-medium text-gray-900">
              {status.lastAPICheckAt ? new Date(status.lastAPICheckAt).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>

        <button
          onClick={handleVerifyAPI}
          disabled={isLoading || !status.activeEnvironment}
          className="w-full py-2.5 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-300"
        >
          {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
          <Shield className="h-4 w-4" />
          {isVerifying ? 'Verifying...' : 'Verify API Connection'}
        </button>
      </div>

      {/* Feature Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Feature Status</h4>
        <div>
          <StatusItem
            label="B2B Invoicing (Standard)"
            value={status.b2bEnabled}
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatusItem
            label="B2C Invoicing (Simplified)"
            value={status.b2cEnabled}
            icon={<Users className="h-4 w-4" />}
          />
          <StatusItem
            label="Phone Verification"
            value={status.otpVerified}
            icon={<Phone className="h-4 w-4" />}
          />
          <StatusItem
            label="TLU Token Attached"
            value={status.tluAttached}
            icon={<Key className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Onboarding Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Onboarding Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Phase</p>
            <p className="font-medium text-gray-900 capitalize">
              {status.onboardingPhase.replace('_', ' ')}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Business Type</p>
            <p className="font-medium text-gray-900">{status.businessType}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Environment</p>
            <p className="font-medium text-gray-900 capitalize">
              {status.activeEnvironment || 'None'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Production Lock</p>
            <div className="space-y-1">
              <p className={`text-xs font-medium ${status.b2bProductionLocked ? 'text-green-600' : 'text-gray-500'}`}>
                B2B: {status.b2bProductionLocked ? 'Locked' : 'Unlocked'}
              </p>
              <p className={`text-xs font-medium ${status.b2cProductionLocked ? 'text-green-600' : 'text-gray-500'}`}>
                B2C: {status.b2cProductionLocked ? 'Locked' : 'Unlocked'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Lock Notice */}
      {(status.b2bProductionLocked || status.b2cProductionLocked) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Production Environment Active</p>
              <p className="text-sm text-green-700 mt-1">
                {status.b2bProductionLocked && status.b2cProductionLocked ? (
                  'Your ZATCA integration is fully operational for both B2B and B2C. All invoices will be submitted to the production ZATCA environment.'
                ) : status.b2bProductionLocked ? (
                  'B2B (Standard Invoice) production is active. B2C onboarding can still be completed separately.'
                ) : (
                  'B2C (Simplified Invoice) production is active. B2B onboarding can still be completed separately.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
