'use client';

import React, { ReactNode } from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { Lock, Zap, AlertTriangle, Crown } from 'lucide-react';
import { getMinPlanForFeature, FEATURE_DESCRIPTIONS } from '@/constants/planFeatures';

// ==================== PLAN GATE ====================

interface PlanGateProps {
  children: ReactNode;

  // Gate conditions (use one or more)
  feature?: string;           // Require specific feature
  minPlan?: string;           // Require minimum plan level
  resourceType?: 'invoice' | 'customer' | 'product' | 'user' | 'company'; // Check resource limit

  // Behavior options
  fallback?: ReactNode;       // Custom fallback UI
  showUpgradePrompt?: boolean; // Show upgrade prompt when blocked (default: true)
  blur?: boolean;             // Blur content instead of hiding
  disabled?: boolean;         // Render children but in disabled state
  hide?: boolean;             // Completely hide when not available
  onUpgradeClick?: () => void; // Custom upgrade handler
}

export function PlanGate({
  children,
  feature,
  minPlan,
  resourceType,
  fallback,
  showUpgradePrompt = true,
  blur = false,
  disabled = false,
  hide = false,
  onUpgradeClick
}: PlanGateProps) {
  const { hasFeature, isPlanAtLeast, canCreate, planInfo, isLoading } = usePlan();

  // Don't block during loading
  if (isLoading) {
    return <>{children}</>;
  }

  // Determine if access is allowed
  let isAllowed = true;
  let blockReason = '';
  let limitInfo: { current: number; limit: number | null; remaining: number | null; percentage: number | null } | null = null;
  let suggestedPlan = '';

  if (feature) {
    isAllowed = hasFeature(feature);
    if (!isAllowed) {
      suggestedPlan = getMinPlanForFeature(feature);
      blockReason = FEATURE_DESCRIPTIONS[feature] || `"${feature}" is not available on your current plan`;
    }
  }

  if (minPlan && isAllowed) {
    isAllowed = isPlanAtLeast(minPlan);
    if (!isAllowed) {
      suggestedPlan = minPlan;
      blockReason = `This feature requires ${minPlan} plan or higher`;
    }
  }

  if (resourceType && isAllowed) {
    const check = canCreate(resourceType);
    isAllowed = check.allowed;
    if (!isAllowed) {
      limitInfo = {
        current: check.current,
        limit: check.limit,
        remaining: check.remaining,
        percentage: check.percentage
      };
      blockReason = `You've reached your ${resourceType} limit`;
    }
  }

  // If allowed, render children normally
  if (isAllowed) {
    return <>{children}</>;
  }

  // Handle hide mode - completely hide content
  if (hide) {
    return null;
  }

  // Handle disabled mode - render but disabled
  if (disabled) {
    return (
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
    );
  }

  // Handle blur mode - blur with overlay
  if (blur) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        {showUpgradePrompt && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <UpgradePrompt
              reason={blockReason}
              currentPlan={planInfo?.currentPlan?.name}
              suggestedPlan={suggestedPlan}
              limitInfo={limitInfo}
              onUpgradeClick={onUpgradeClick}
              compact
            />
          </div>
        )}
      </div>
    );
  }

  // Handle custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: show upgrade prompt
  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        reason={blockReason}
        currentPlan={planInfo?.currentPlan?.name}
        suggestedPlan={suggestedPlan}
        limitInfo={limitInfo}
        onUpgradeClick={onUpgradeClick}
      />
    );
  }

  // Hide completely
  return null;
}

// ==================== UPGRADE PROMPT ====================

interface UpgradePromptProps {
  reason: string;
  currentPlan?: string;
  suggestedPlan?: string;
  limitInfo?: { current: number; limit: number | null; remaining: number | null; percentage: number | null } | null;
  onUpgradeClick?: () => void;
  compact?: boolean;
}

export function UpgradePrompt({
  reason,
  currentPlan,
  suggestedPlan,
  limitInfo,
  onUpgradeClick,
  compact = false
}: UpgradePromptProps) {
  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      window.location.href = '/dashboard/settings?tab=subscription';
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-lg border border-amber-200">
        <Lock className="h-5 w-5 text-amber-500" />
        <p className="text-sm text-gray-600 text-center max-w-[200px]">{reason}</p>
        <button
          onClick={handleUpgradeClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
        >
          <Zap className="h-3.5 w-3.5" />
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-center">
      <div className="p-3 bg-amber-100 rounded-full mb-4">
        <Lock className="h-6 w-6 text-amber-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Upgrade Required
      </h3>

      <p className="text-sm text-gray-600 mb-4 max-w-xs">
        {reason}
      </p>

      {limitInfo && limitInfo.limit !== null && (
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Usage</span>
            <span>{limitInfo.current} / {limitInfo.limit}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                (limitInfo.percentage ?? 0) >= 100
                  ? 'bg-red-500'
                  : (limitInfo.percentage ?? 0) >= 80
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, limitInfo.percentage ?? 0)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        {currentPlan && (
          <span>Current: <span className="font-medium">{currentPlan}</span></span>
        )}
        {suggestedPlan && currentPlan !== suggestedPlan && (
          <>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-amber-500" />
              Recommended: <span className="font-medium text-amber-600">{suggestedPlan}</span>
            </span>
          </>
        )}
      </div>

      <button
        onClick={handleUpgradeClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
      >
        <Zap className="h-4 w-4" />
        Upgrade Plan
      </button>
    </div>
  );
}

// ==================== USAGE LIMIT WARNING ====================

interface UsageLimitWarningProps {
  resourceType: 'invoice' | 'customer' | 'product' | 'user' | 'company';
  showAt?: number; // Show warning when percentage reaches this value (default: 80)
}

export function UsageLimitWarning({ resourceType, showAt = 80 }: UsageLimitWarningProps) {
  const { canCreate, getUsagePercentage, planInfo } = usePlan();
  const check = canCreate(resourceType);
  const percentage = getUsagePercentage(resourceType);

  // Don't show if unlimited or below threshold
  if (check.unlimited || percentage === null || percentage < showAt) {
    return null;
  }

  const isLimitReached = !check.allowed;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${
      isLimitReached
        ? 'bg-red-50 border border-red-200'
        : 'bg-amber-50 border border-amber-200'
    }`}>
      <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${isLimitReached ? 'text-red-500' : 'text-amber-500'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isLimitReached ? 'text-red-700' : 'text-amber-700'}`}>
          {isLimitReached
            ? `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} limit reached`
            : `${percentage}% of ${resourceType} limit used`}
        </p>
        <p className="text-xs text-gray-500">
          {check.current} of {check.limit} used
          {check.remaining !== null && check.remaining > 0 && ` • ${check.remaining} remaining`}
        </p>
      </div>
      <button
        onClick={() => window.location.href = '/dashboard/settings?tab=subscription'}
        className={`text-xs font-medium px-2 py-1 rounded ${
          isLimitReached
            ? 'text-red-700 hover:bg-red-100'
            : 'text-amber-700 hover:bg-amber-100'
        } transition-colors`}
      >
        Upgrade
      </button>
    </div>
  );
}

// ==================== FEATURE BADGE ====================

interface FeatureBadgeProps {
  feature: string;
  showLock?: boolean;
}

export function FeatureBadge({ feature, showLock = true }: FeatureBadgeProps) {
  const { hasFeature } = usePlan();
  const available = hasFeature(feature);

  if (available) return null;

  const minPlan = getMinPlanForFeature(feature);

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
      {showLock && <Lock className="h-3 w-3" />}
      {minPlan}+
    </span>
  );
}

// ==================== PLAN BADGE ====================

interface PlanBadgeProps {
  className?: string;
}

export function PlanBadge({ className = '' }: PlanBadgeProps) {
  const { planInfo } = usePlan();
  const planName = planInfo?.currentPlan?.name || 'Free';

  const colorMap: Record<string, string> = {
    'Free': 'bg-gray-100 text-gray-700',
    'Basic': 'bg-blue-100 text-blue-700',
    'Professional': 'bg-green-100 text-green-700',
    'Enterprise': 'bg-purple-100 text-purple-700'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${colorMap[planName] || colorMap['Free']} ${className}`}>
      <Crown className="h-3 w-3" />
      {planName}
    </span>
  );
}
