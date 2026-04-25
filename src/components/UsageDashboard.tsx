'use client';

import React from 'react';
import { usePlan } from '@/contexts/PlanContext';
import {
  FileText,
  Users,
  Package,
  UserPlus,
  HardDrive,
  Building2,
  TrendingUp,
  Zap,
  Crown,
  Calendar,
  RefreshCw
} from 'lucide-react';

// ==================== USAGE ITEM ====================

interface UsageItemProps {
  label: string;
  icon: React.ElementType;
  current: number;
  limit: number | null;
  percentage: number | null;
  color: string;
  bgColor: string;
}

function UsageItem({ label, icon: Icon, current, limit, percentage, color, bgColor }: UsageItemProps) {
  const isUnlimited = limit === null;
  const isWarning = percentage !== null && percentage >= 80 && percentage < 100;
  const isCritical = percentage !== null && percentage >= 100;

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {isUnlimited ? (
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              Unlimited
            </span>
          ) : (
            `${current} / ${limit}`
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="space-y-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, percentage || 0)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className={`font-medium ${
              isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500'
            }`}>
              {percentage}% used
            </span>
            {limit && limit - current > 0 && (
              <span className="text-gray-400">
                {limit - current} remaining
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

interface UsageDashboardProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export function UsageDashboard({ showUpgradeButton = true, compact = false }: UsageDashboardProps) {
  const { planInfo, isLoading, refreshPlanInfo } = usePlan();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!planInfo) {
    return null;
  }

  const { usage, currentPlan, subscription } = planInfo;

  const usageItems = [
    {
      label: 'Invoices',
      icon: FileText,
      current: usage.current.invoicesCreated,
      limit: usage.limits.invoicesPerMonth,
      percentage: usage.percentages.invoices,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Customers',
      icon: Users,
      current: usage.current.customersCreated,
      limit: usage.limits.customers,
      percentage: usage.percentages.customers,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Products',
      icon: Package,
      current: usage.current.productsCreated,
      limit: usage.limits.products,
      percentage: usage.percentages.products,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Users',
      icon: UserPlus,
      current: usage.current.usersCreated,
      limit: usage.limits.users,
      percentage: usage.percentages.users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Storage',
      icon: HardDrive,
      current: usage.current.storageUsedMB,
      limit: usage.limits.storage,
      percentage: usage.percentages.storage,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      label: 'Companies',
      icon: Building2,
      current: usage.current.companiesCreated,
      limit: usage.limits.companies,
      percentage: usage.percentages.companies,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  // Plan color mapping
  const planColors: Record<string, { bg: string; text: string; border: string }> = {
    'Free': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    'Basic': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'Professional': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    'Enterprise': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
  };

  const planColor = planColors[currentPlan.name] || planColors['Free'];

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${planColor.bg} ${planColor.text}`}>
              <Crown className="h-3 w-3" />
              {currentPlan.name}
            </span>
          </div>
          <button
            onClick={() => refreshPlanInfo()}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {usageItems.slice(0, 3).map(item => (
            <div key={item.label} className="text-center">
              <div className={`inline-flex p-1.5 rounded-lg ${item.bgColor} mb-1`}>
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              </div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900">
                {item.limit === null ? (
                  <span className="text-green-600 text-xs">Unlimited</span>
                ) : (
                  `${item.current}/${item.limit}`
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${planColor.bg} ${planColor.text} border ${planColor.border}`}>
              <Crown className="h-3.5 w-3.5" />
              {currentPlan.name} Plan
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {subscription ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {subscription.daysRemaining} days remaining in billing period
              </span>
            ) : (
              'Free plan - Upgrade for more features'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshPlanInfo()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh usage"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {showUpgradeButton && currentPlan.name !== 'Enterprise' && (
            <button
              onClick={() => window.location.href = '/dashboard/settings?tab=subscription'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg hover:from-primary-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              <Zap className="h-4 w-4" />
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Usage Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {usageItems.map(item => (
          <UsageItem key={item.label} {...item} />
        ))}
      </div>

      {/* Period Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Usage resets monthly • Current period: {usage.period.month}/{usage.period.year}
        </p>
      </div>
    </div>
  );
}

// ==================== MINI USAGE WIDGET ====================

interface MiniUsageWidgetProps {
  resourceType: 'invoice' | 'customer' | 'product' | 'user' | 'storage' | 'company';
}

export function MiniUsageWidget({ resourceType }: MiniUsageWidgetProps) {
  const { canCreate, getUsagePercentage } = usePlan();
  const check = canCreate(resourceType);
  const percentage = getUsagePercentage(resourceType);

  if (check.unlimited) {
    return (
      <span className="text-xs text-green-600 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Unlimited
      </span>
    );
  }

  const isWarning = percentage !== null && percentage >= 80;
  const isCritical = percentage !== null && percentage >= 100;

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, percentage || 0)}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${
        isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500'
      }`}>
        {check.current}/{check.limit}
      </span>
    </div>
  );
}
