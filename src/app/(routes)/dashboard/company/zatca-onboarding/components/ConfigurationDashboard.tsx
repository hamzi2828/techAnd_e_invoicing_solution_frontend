'use client';

import React, { useState } from 'react';
import {
  Settings, CheckCircle, Key, FileKey, Lock, Copy, Eye, EyeOff,
  Shield, Building2, Users, Globe, FileText, Award, BadgeCheck, AlertCircle
} from 'lucide-react';
import { ConfigurationResponse, ZatcaStatusResponse, Company, KeyType, ZatcaEnvironment } from '../../types';

interface ConfigurationDashboardProps {
  configuration: ConfigurationResponse | null;
  zatcaStatus: ZatcaStatusResponse | null;
  company: Company | null;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

type BusinessTypeTab = 'B2B' | 'B2C';

// Interface for business type credentials with actual values
interface BusinessTypeCredentialsData {
  status?: string;
  csr?: string;
  privateKey?: string;
  complianceCertificate?: string;
  complianceSecret?: string;
  complianceRequestId?: string;
  productionCSID?: string;
  productionSecret?: string;
  onboardedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  hashChainCounter?: number;
  previousInvoiceHash?: string | null;
}

export default function ConfigurationDashboard({
  configuration,
  zatcaStatus,
  company
}: ConfigurationDashboardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [activeBusinessType, setActiveBusinessType] = useState<BusinessTypeTab>('B2B');

  const activeEnv = zatcaStatus?.activeEnvironment;

  // Get credentials from company data (zatcaCredentials)
  const credentials = (company as any)?.zatcaCredentials || {};
  const environments = credentials.environments || {};

  // Get B2B and B2C credentials for the active environment
  const getBusinessTypeCredentials = (env: ZatcaEnvironment, type: BusinessTypeTab): BusinessTypeCredentialsData | null => {
    const envData = environments[env];
    if (!envData) return null;
    return type === 'B2B' ? envData.b2b : envData.b2c;
  };

  // Get current tab credentials
  const b2bCredentials = activeEnv ? getBusinessTypeCredentials(activeEnv, 'B2B') : null;
  const b2cCredentials = activeEnv ? getBusinessTypeCredentials(activeEnv, 'B2C') : null;

  // Get status color
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50';
      case 'test_invoices_submitted': return 'text-blue-600 bg-blue-50';
      case 'compliance': return 'text-amber-600 bg-amber-50';
      case 'csr_generated': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Format status text
  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Not Started';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle field visibility
  const toggleVisibility = (fieldName: string) => {
    setVisibleFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldName)) {
        newSet.delete(fieldName);
      } else {
        newSet.add(fieldName);
      }
      return newSet;
    });
  };

  // Truncate text for display
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Credential field component
  const CredentialField = ({
    label,
    value,
    fieldName,
    isSecret = false,
    multiline = false
  }: {
    label: string;
    value: string | undefined;
    fieldName: string;
    isSecret?: boolean;
    multiline?: boolean;
  }) => {
    const isVisible = visibleFields.has(fieldName);
    const displayValue = !value ? '-' : (isSecret && !isVisible) ? '••••••••••••••••' : value;

    return (
      <div className={multiline ? 'col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <div className="relative">
          <div className={`text-gray-900 bg-gray-50 px-3 py-2 rounded-lg font-mono text-sm ${multiline ? 'min-h-[80px] max-h-[200px] overflow-auto whitespace-pre-wrap break-all' : 'truncate'}`}>
            {multiline ? displayValue : truncateText(displayValue, 60)}
          </div>
          {value && (
            <div className="absolute right-2 top-2 flex gap-1">
              {isSecret && (
                <button
                  onClick={() => toggleVisibility(fieldName)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  title={isVisible ? 'Hide' : 'Show'}
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={() => copyToClipboard(value, fieldName)}
                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                title="Copy"
              >
                {copiedField === fieldName ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Key type config
  const KEY_TYPE_CONFIG: Record<KeyType, { label: string; icon: React.ReactNode; bgColor: string }> = {
    signing: {
      label: 'Signing Key',
      icon: <FileKey className="h-5 w-5 text-purple-600" />,
      bgColor: 'bg-purple-50'
    },
    encryption: {
      label: 'Encryption Key',
      icon: <Lock className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-50'
    },
    authentication: {
      label: 'Authentication Key',
      icon: <Shield className="h-5 w-5 text-green-600" />,
      bgColor: 'bg-green-50'
    }
  };

  const keys = configuration?.keys || [];

  // Render credentials section for a business type with actual values
  const renderCredentialsSection = (creds: BusinessTypeCredentialsData | null, type: BusinessTypeTab) => {
    if (!creds || creds.status === 'not_started') {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            {type} Onboarding Not Started
          </h4>
          <p className="text-gray-500">
            Complete the {type} onboarding process to see credentials here.
          </p>
        </div>
      );
    }

    const prefix = `${type.toLowerCase()}_${activeEnv}_`;

    return (
      <div className="space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {type === 'B2B' ? (
                <Building2 className="h-6 w-6 text-indigo-600" />
              ) : (
                <Users className="h-6 w-6 text-purple-600" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">
                  {type === 'B2B' ? 'B2B (Standard Invoice)' : 'B2C (Simplified Invoice)'}
                </h4>
                <p className="text-sm text-gray-500">
                  Invoice Type Code: {type === 'B2B' ? '0100000' : '0200000'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(creds.status)}`}>
              {formatStatus(creds.status)}
            </span>
          </div>
        </div>

        {/* CSR & Private Key */}
        {creds.csr && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-gray-900">CSR & Private Key</h4>
              <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Generated</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <CredentialField
                label="Certificate Signing Request (CSR)"
                value={creds.csr}
                fieldName={`${prefix}csr`}
                multiline
              />
              <CredentialField
                label="Private Key (Encrypted)"
                value={creds.privateKey}
                fieldName={`${prefix}privateKey`}
                isSecret
                multiline
              />
            </div>
            {creds.createdAt && (
              <div className="px-6 pb-4">
                <p className="text-xs text-gray-500">
                  Created: {new Date(creds.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Compliance Certificate */}
        {creds.complianceCertificate && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              <h4 className="font-medium text-gray-900">Compliance Certificate</h4>
              <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Obtained</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <CredentialField
                label="Compliance Certificate (Base64)"
                value={creds.complianceCertificate}
                fieldName={`${prefix}complianceCertificate`}
                multiline
              />
              <div className="space-y-4">
                <CredentialField
                  label="Compliance Request ID"
                  value={creds.complianceRequestId}
                  fieldName={`${prefix}complianceRequestId`}
                />
                <CredentialField
                  label="Compliance Secret (Encrypted)"
                  value={creds.complianceSecret}
                  fieldName={`${prefix}complianceSecret`}
                  isSecret
                />
              </div>
            </div>
          </div>
        )}

        {/* Production CSID */}
        {creds.productionCSID && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Production CSID</h4>
              <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <CredentialField
                label="Production CSID (Base64)"
                value={creds.productionCSID}
                fieldName={`${prefix}productionCSID`}
                multiline
              />
              <CredentialField
                label="Production Secret (Encrypted)"
                value={creds.productionSecret}
                fieldName={`${prefix}productionSecret`}
                isSecret
                multiline
              />
            </div>
          </div>
        )}

        {/* Hash Chain Info */}
        {(creds.hashChainCounter !== undefined || creds.previousInvoiceHash) && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Key className="h-5 w-5 text-cyan-600" />
              <h4 className="font-medium text-gray-900">Hash Chain</h4>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Invoice Counter:</span>
                <span className="font-mono font-medium text-gray-900">{creds.hashChainCounter || 0}</span>
              </div>
              {creds.previousInvoiceHash && (
                <div>
                  <span className="text-sm text-gray-500">Previous Invoice Hash:</span>
                  <p className="font-mono text-xs mt-1 break-all bg-gray-50 p-2 rounded">
                    {creds.previousInvoiceHash}
                  </p>
                </div>
              )}
              {creds.updatedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Updated:</span>
                  <span className="text-sm text-gray-700">
                    {new Date(creds.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Date */}
        {creds.onboardedAt && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{type} Onboarding Completed</p>
                <p className="text-sm text-green-700">
                  Completed on {new Date(creds.onboardedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Onboarding Configuration</h3>
        <p className="text-sm text-gray-600">
          View your ZATCA onboarding credentials for B2B and B2C separately.
        </p>
      </div>

      {/* Global Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-500">Active Environment</span>
          </div>
          <p className="font-medium text-gray-900 capitalize">
            {credentials.activeEnvironment || 'Not Set'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Phase</span>
          </div>
          <p className="font-medium text-gray-900 capitalize">
            {credentials.onboardingPhase?.replace('_', ' ').replace('phase', 'Phase ') || 'Not Set'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            <span className="text-sm text-gray-500">B2B Status</span>
          </div>
          <p className={`font-medium ${b2bCredentials?.status === 'verified' ? 'text-green-600' : 'text-gray-900'}`}>
            {formatStatus(b2bCredentials?.status)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-500">B2C Status</span>
          </div>
          <p className={`font-medium ${b2cCredentials?.status === 'verified' ? 'text-green-600' : 'text-gray-900'}`}>
            {formatStatus(b2cCredentials?.status)}
          </p>
        </div>
      </div>

      {/* B2B / B2C Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveBusinessType('B2B')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeBusinessType === 'B2B'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span>B2B (Standard Invoice - 0100000)</span>
            {b2bCredentials?.status === 'verified' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </button>
          <button
            onClick={() => setActiveBusinessType('B2C')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeBusinessType === 'B2C'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>B2C (Simplified Invoice - 0200000)</span>
            {b2cCredentials?.status === 'verified' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeBusinessType === 'B2B' && renderCredentialsSection(b2bCredentials, 'B2B')}
          {activeBusinessType === 'B2C' && renderCredentialsSection(b2cCredentials, 'B2C')}
        </div>
      </div>

      {/* Environment Status Overview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Environment Status Overview</h4>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Environment</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      B2B
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      B2C
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(['sandbox', 'simulation', 'production'] as ZatcaEnvironment[]).map((env) => {
                  const envB2B = getBusinessTypeCredentials(env, 'B2B');
                  const envB2C = getBusinessTypeCredentials(env, 'B2C');
                  const isActive = activeEnv === env;

                  return (
                    <tr key={env} className={`border-b border-gray-100 ${isActive ? 'bg-blue-50' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 capitalize">{env}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(envB2B?.status)}`}>
                          {envB2B?.status === 'verified' && <CheckCircle className="h-3 w-3" />}
                          {formatStatus(envB2B?.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(envB2C?.status)}`}>
                          {envB2C?.status === 'verified' && <CheckCircle className="h-3 w-3" />}
                          {formatStatus(envB2C?.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stored Configuration Keys */}
      {keys.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Configuration Keys</h4>
            </div>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
              {keys.length} key{keys.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {keys.map((key) => {
              const typeConfig = KEY_TYPE_CONFIG[key.keyType] || KEY_TYPE_CONFIG.signing;
              return (
                <div key={key.keyId} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                      {typeConfig.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{key.keyName}</p>
                      <p className="text-xs text-gray-500">{typeConfig.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Key ID</p>
                      <p className="text-sm font-mono text-gray-700">{key.keyId.slice(0, 12)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm text-gray-700">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      key.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {key.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TLU Token Status */}
      {credentials.tluData && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">TLU Token</h4>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Attached to API:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                credentials.tluData.attachedToAPI
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {credentials.tluData.attachedToAPI ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
