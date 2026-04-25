'use client';

import React, { useState, useEffect } from 'react';
import { Key, Loader2, CheckCircle, AlertCircle, Clock, RefreshCw, Link2 } from 'lucide-react';
import { TLUStatus, ZatcaEnvironment } from '../../types';

interface TLUGeneratorProps {
  companyId: string;
  environment: ZatcaEnvironment;
  tluStatus: TLUStatus | null;
  onGenerateTLU: (environment: ZatcaEnvironment) => Promise<{ success: boolean; message: string; data?: TLUStatus }>;
  onAttachTLU: () => Promise<{ success: boolean; message: string }>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export default function TLUGenerator({
  environment,
  tluStatus,
  onGenerateTLU,
  onAttachTLU,
  onRefresh,
  isLoading: externalLoading
}: TLUGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Auto-refresh when token is expiring
  useEffect(() => {
    if (tluStatus?.status === 'expiring_soon' || tluStatus?.status === 'expiring') {
      // Notify user
    }
  }, [tluStatus?.status]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const result = await onGenerateTLU(environment);
      if (result.success) {
        setMessage(result.message);
        await onRefresh();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate TLU token');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAttach = async () => {
    setIsAttaching(true);
    setError(null);
    setMessage(null);

    try {
      const result = await onAttachTLU();
      if (result.success) {
        setMessage(result.message);
        await onRefresh();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to attach TLU token');
    } finally {
      setIsAttaching(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50';
      case 'expiring':
        return 'text-amber-600 bg-amber-50';
      case 'expiring_soon':
        return 'text-red-600 bg-red-50';
      case 'invalid':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5" />;
      case 'expiring':
      case 'expiring_soon':
        return <Clock className="h-5 w-5" />;
      case 'invalid':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Key className="h-5 w-5" />;
    }
  };

  const isLoading = externalLoading || isGenerating || isAttaching;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">TLU Token Generation</h3>
        <p className="text-sm text-gray-600">
          Generate and manage your Token Lifecycle Unit (TLU) for ZATCA API integration.
        </p>
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

      {/* TLU Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Key className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">TLU Token</h4>
              <p className="text-sm text-gray-500">Environment: {environment}</p>
            </div>
          </div>

          {tluStatus?.hasToken && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(tluStatus.status)}`}>
              {getStatusIcon(tluStatus.status)}
              <span className="capitalize">{tluStatus.status.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Token Details */}
        {tluStatus?.hasToken && tluStatus.status !== 'not_generated' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Token ID:</span>
                <p className="font-mono text-gray-900 truncate">{tluStatus.tokenId}</p>
              </div>
              <div>
                <span className="text-gray-500">Environment:</span>
                <p className="text-gray-900 capitalize">{tluStatus.environment}</p>
              </div>
              <div>
                <span className="text-gray-500">Generated:</span>
                <p className="text-gray-900">
                  {tluStatus.generatedAt ? new Date(tluStatus.generatedAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Expires:</span>
                <p className={`${tluStatus.status === 'expiring_soon' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {tluStatus.expiresAt ? new Date(tluStatus.expiresAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Remaining:</span>
                <p className={`font-medium ${tluStatus.remainingHours && tluStatus.remainingHours < 6 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {tluStatus.remainingHours ? `${tluStatus.remainingHours.toFixed(1)} hours` : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">API Attached:</span>
                <p className={tluStatus.attachedToAPI ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  {tluStatus.attachedToAPI ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {!tluStatus.attachedToAPI && (
                <button
                  onClick={handleAttach}
                  disabled={isLoading || tluStatus.status === 'invalid'}
                  className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  {isAttaching && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Link2 className="h-4 w-4" />
                  Attach to API
                </button>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
            </div>

            {/* Expiring Warning */}
            {(tluStatus.status === 'expiring' || tluStatus.status === 'expiring_soon') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Your TLU token is about to expire.
                  Regenerate it to continue using the ZATCA API.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Key className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">No TLU Token Generated</h4>
            <p className="text-sm text-gray-500 mb-4">
              Generate a TLU token to enable ZATCA API integration.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-300 mx-auto"
            >
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate TLU Token
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>About TLU Tokens:</strong> The Token Lifecycle Unit (TLU) is used for secure communication with ZATCA APIs.
          Tokens are valid for 24 hours and must be attached to API requests for authentication.
        </p>
      </div>
    </div>
  );
}
