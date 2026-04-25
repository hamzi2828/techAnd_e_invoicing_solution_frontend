'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertCircle,
  Gift,
  Check,
  Lock,
  Star,
  Crown,
  Users,
  FileText,
  Building2,
  Shield,
  Mail,
  Headphones,
  Zap,
  Download,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../components';
import { useLanguage } from '../contexts/LanguageContext';

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
  limit?: number;
}

interface Plan {
  _id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: PlanFeature[];
  limits: {
    invoicesPerMonth: number | null;
    customers: number | null;
    products: number | null;
    users: number | null;
    storage: number | null;
    companies: number | null;
  };
  isActive: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  metadata?: {
    color?: string;
    badge?: string;
    targetAudience?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PlansManagement() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/payments/plans`);
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      const data = await response.json();
      if (data.success) {
        // Sort plans by sortOrder or price
        const sortedPlans = (data.data || []).sort((a: Plan, b: Plan) =>
          (a.monthlyPrice || 0) - (b.monthlyPrice || 0)
        );
        setPlans(sortedPlans);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const getFeatureIcon = (featureName: string) => {
    const name = featureName.toLowerCase();
    if (name.includes('compan')) return Building2;
    if (name.includes('invoice') || name.includes('quotation')) return FileText;
    if (name.includes('pos')) return Zap;
    if (name.includes('user') || name.includes('role')) return Users;
    if (name.includes('zatca') || name.includes('phase')) return Shield;
    if (name.includes('email') || name.includes('notification')) return Mail;
    if (name.includes('support')) return Headphones;
    if (name.includes('report')) return Download;
    if (name.includes('bulk') || name.includes('import')) return Zap;
    if (name.includes('api') || name.includes('integration')) return Zap;
    return Check;
  };

  const formatLimit = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'Unlimited';
    return value.toLocaleString();
  };

  const getPlanColor = (plan: Plan) => {
    const colors: Record<string, string> = {
      'Free': 'from-gray-500 to-gray-600',
      'Basic': 'from-blue-500 to-blue-600',
      'Professional': 'from-green-500 to-emerald-600',
      'Enterprise': 'from-purple-500 to-indigo-600',
    };
    return colors[plan.name] || 'from-primary to-blue-600';
  };

  const getPlanBgColor = (plan: Plan) => {
    const colors: Record<string, string> = {
      'Free': 'bg-gray-50 border-gray-200',
      'Basic': 'bg-blue-50 border-blue-200',
      'Professional': 'bg-green-50 border-green-200',
      'Enterprise': 'bg-purple-50 border-purple-200',
    };
    return colors[plan.name] || 'bg-primary-50 border-primary-200';
  };

  // Key features to highlight
  const keyFeatures = [
    'Number of Companies',
    'Invoice Volume',
    'ZATCA Phase 1 (Generation)',
    'ZATCA Phase 2 (Integration)',
    'ZATCA Onboarding',
    'Quotation',
    'Bulk Import',
    'POS Access',
    'Reports',
    'Report Scheduling',
    'Multiple Users',
    'Roles & Permissions',
    'Email Notifications',
    'Support',
    'API Access',
    'Custom Integrations',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.payments.plans.title')}
        subtitle="View subscription plans (managed via seeder)"
        showActions={false}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={loadPlans}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </PageHeader>

      {/* Billing Toggle */}
      <div className="bg-gradient-to-r from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                style={{ backgroundColor: isYearly ? '#37469E' : '#e5e7eb' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
            </div>
            {isYearly && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1 rounded-full border border-green-200">
                <span className="text-xs font-medium text-green-800 flex items-center">
                  <Gift className="h-3 w-3 mr-1" />
                  Save up to 17%
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Plans are managed via database seeder
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Error</p>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadPlans}
                className="mt-2 text-sm text-red-800 underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-500 mr-3" />
            <span className="text-primary-600 font-medium">Loading plans...</span>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl ${
                plan.isFeatured || plan.isPopular
                  ? 'border-primary-400 ring-2 ring-primary-200'
                  : getPlanBgColor(plan)
              } ${!plan.isActive ? 'opacity-60' : ''}`}
            >
              {/* Popular Badge */}
              {(plan.isPopular || plan.isFeatured) && plan.isActive && (
                <div className="absolute top-0 left-0 right-0">
                  <div className={`bg-gradient-to-r ${getPlanColor(plan)} text-white text-center py-1.5 text-xs font-bold`}>
                    <Crown className="h-3 w-3 inline mr-1" />
                    {plan.metadata?.badge || 'Most Popular'}
                  </div>
                </div>
              )}

              {/* Inactive Badge */}
              {!plan.isActive && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gray-500 text-white text-center py-1.5 text-xs font-bold">
                    Inactive
                  </div>
                </div>
              )}

              <div className={`p-6 ${(plan.isPopular || plan.isFeatured || !plan.isActive) ? 'pt-10' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

                  <div className="mt-4">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${getPlanColor(plan)} bg-clip-text text-transparent`}>
                      {plan.currency} {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 text-sm">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>

                  {plan.metadata?.targetAudience && (
                    <p className="text-xs text-gray-400 mt-2 italic">
                      Best for: {plan.metadata.targetAudience}
                    </p>
                  )}
                </div>

                {/* Limits */}
                <div className="bg-white/60 rounded-lg p-3 mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Limits</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Companies</span>
                      <span className="font-medium">{formatLimit(plan.limits.companies)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoices/mo</span>
                      <span className="font-medium">{formatLimit(plan.limits.invoicesPerMonth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customers</span>
                      <span className="font-medium">{formatLimit(plan.limits.customers)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users</span>
                      <span className="font-medium">{formatLimit(plan.limits.users)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage</span>
                      <span className="font-medium">
                        {plan.limits.storage ? `${plan.limits.storage} MB` : 'Unlimited'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase">Features</h4>
                  {plan.features
                    .filter(f => keyFeatures.includes(f.name))
                    .slice(0, 10)
                    .map((feature, idx) => {
                      const Icon = getFeatureIcon(feature.name);
                      return (
                        <div
                          key={idx}
                          className={`flex items-center text-sm ${
                            feature.included ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        >
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-300 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">{feature.name}</span>
                          {feature.limit && (
                            <span className="ml-1 text-xs text-gray-400">
                              ({feature.limit})
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Comparison Table */}
      {!isLoading && !error && plans.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
            <p className="text-sm text-gray-500 mt-1">Detailed comparison of all plan features</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan._id} className={`px-6 py-4 text-center text-sm font-semibold ${!plan.isActive ? 'text-gray-400' : 'text-gray-900'}`}>
                      {plan.name}
                      {!plan.isActive && <span className="block text-xs font-normal">(Inactive)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keyFeatures.map((featureName, idx) => (
                  <tr key={featureName} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">{featureName}</td>
                    {plans.map((plan) => {
                      const feature = plan.features.find(f => f.name === featureName);
                      const isIncluded = feature?.included ?? false;
                      return (
                        <td key={plan._id} className="px-6 py-3 text-center">
                          {isIncluded ? (
                            <div className="flex items-center justify-center">
                              <Check className="h-5 w-5 text-green-500" />
                              {feature?.limit && (
                                <span className="ml-1 text-xs text-gray-500">
                                  ({feature.limit})
                                </span>
                              )}
                            </div>
                          ) : (
                            <Lock className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
