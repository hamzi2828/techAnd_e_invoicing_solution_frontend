'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo
} from 'react';
import { getAuthHeader } from '@/helper/helper';

// ==================== TYPES ====================

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
  limit?: number | null;
}

interface PlanLimits {
  invoicesPerMonth: number | null;
  customers: number | null;
  products: number | null;
  users: number | null;
  storage: number | null;
  companies?: number | null;
}

interface Usage {
  invoicesCreated: number;
  customersCreated: number;
  productsCreated: number;
  usersCreated: number;
  storageUsedMB: number;
  companiesCreated: number;
  zatcaSubmissions: number;
  bulkImports: number;
  reportsGenerated: number;
}

interface UsagePercentages {
  invoices: number | null;
  customers: number | null;
  products: number | null;
  users: number | null;
  storage: number | null;
  companies: number | null;
}

interface Subscription {
  id: string;
  subscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused';
  billingCycle: 'monthly' | 'yearly';
  unitAmount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  daysRemaining: number;
  isActive: boolean;
  isTrialing: boolean;
}

interface CurrentPlan {
  id: string | null;
  name: string;
  description: string;
  features: PlanFeature[];
  limits: PlanLimits;
  metadata?: Record<string, unknown>;
}

interface AvailablePlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular: boolean;
  isFeatured: boolean;
  badge?: string;
  isCurrentPlan: boolean;
}

interface PlanInfo {
  currentPlan: CurrentPlan;
  subscription: Subscription | null;
  usage: {
    current: Usage;
    limits: PlanLimits;
    period: { month: number; year: number };
    percentages: UsagePercentages;
  };
  availablePlans: AvailablePlan[];
}

interface ResourceCheck {
  allowed: boolean;
  current: number;
  limit: number | null;
  remaining: number | null;
  percentage: number | null;
  unlimited: boolean;
}

interface PlanContextType {
  // State
  planInfo: PlanInfo | null;
  isLoading: boolean;
  error: string | null;

  // Plan helpers
  hasFeature: (featureName: string) => boolean;
  getFeatureLimit: (featureName: string) => number | null;
  isPlanAtLeast: (planName: string) => boolean;

  // Resource/limit helpers
  canCreate: (resourceType: ResourceType) => ResourceCheck;
  getUsagePercentage: (resourceType: ResourceType) => number | null;

  // Actions
  refreshPlanInfo: () => Promise<void>;
  incrementLocalUsage: (resourceType: ResourceType) => void;
  decrementLocalUsage: (resourceType: ResourceType) => void;
}

type ResourceType = 'invoice' | 'customer' | 'product' | 'user' | 'storage' | 'company';

// ==================== CONSTANTS ====================

const PLAN_HIERARCHY: Record<string, number> = {
  'Free': 0,
  'Basic': 1,
  'Professional': 2,
  'Enterprise': 3
};

const RESOURCE_MAP: Record<ResourceType, {
  usage: keyof Usage;
  limit: keyof PlanLimits;
  percentage: keyof UsagePercentages;
}> = {
  invoice: { usage: 'invoicesCreated', limit: 'invoicesPerMonth', percentage: 'invoices' },
  customer: { usage: 'customersCreated', limit: 'customers', percentage: 'customers' },
  product: { usage: 'productsCreated', limit: 'products', percentage: 'products' },
  user: { usage: 'usersCreated', limit: 'users', percentage: 'users' },
  storage: { usage: 'storageUsedMB', limit: 'storage', percentage: 'storage' },
  company: { usage: 'companiesCreated', limit: 'companies', percentage: 'companies' }
};

// ==================== CONTEXT ====================

const PlanContext = createContext<PlanContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface PlanProviderProps {
  children: ReactNode;
}

export function PlanProvider({ children }: PlanProviderProps) {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch plan info from API
  const fetchPlanInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        // Not authenticated, skip fetch
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/plan-info`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - user needs to login
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch plan info');
      }

      const data = await response.json();

      if (data.success) {
        setPlanInfo(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch plan info');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Plan fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  // Check if user has a specific feature
  const hasFeature = useCallback((featureName: string): boolean => {
    if (!planInfo?.currentPlan?.features) return false;

    const feature = planInfo.currentPlan.features.find(
      f => f.name.toLowerCase() === featureName.toLowerCase()
    );

    return feature?.included === true;
  }, [planInfo]);

  // Get limit for a specific feature
  const getFeatureLimit = useCallback((featureName: string): number | null => {
    if (!planInfo?.currentPlan?.features) return null;

    const feature = planInfo.currentPlan.features.find(
      f => f.name.toLowerCase() === featureName.toLowerCase()
    );

    return feature?.limit ?? null;
  }, [planInfo]);

  // Check if current plan is at least the specified level
  const isPlanAtLeast = useCallback((planName: string): boolean => {
    const currentPlanName = planInfo?.currentPlan?.name || 'Free';
    const currentLevel = PLAN_HIERARCHY[currentPlanName] ?? 0;
    const requiredLevel = PLAN_HIERARCHY[planName] ?? 0;
    return currentLevel >= requiredLevel;
  }, [planInfo]);

  // Check if user can create a resource
  const canCreate = useCallback((resourceType: ResourceType): ResourceCheck => {
    const defaultResult: ResourceCheck = {
      allowed: true,
      current: 0,
      limit: null,
      remaining: null,
      percentage: null,
      unlimited: true
    };

    if (!planInfo?.usage) return defaultResult;

    const mapping = RESOURCE_MAP[resourceType];
    if (!mapping) return defaultResult;

    const current = planInfo.usage.current[mapping.usage] ?? 0;
    const limit = planInfo.usage.limits[mapping.limit];
    const percentage = planInfo.usage.percentages[mapping.percentage];

    // null limit means unlimited
    if (limit === null || limit === undefined) {
      return {
        allowed: true,
        current,
        limit: null,
        remaining: null,
        percentage: null,
        unlimited: true
      };
    }

    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      percentage,
      unlimited: false
    };
  }, [planInfo]);

  // Get usage percentage for a resource type
  const getUsagePercentage = useCallback((resourceType: ResourceType): number | null => {
    if (!planInfo?.usage?.percentages) return null;

    const mapping = RESOURCE_MAP[resourceType];
    if (!mapping) return null;

    return planInfo.usage.percentages[mapping.percentage];
  }, [planInfo]);

  // Optimistically increment local usage
  const incrementLocalUsage = useCallback((resourceType: ResourceType) => {
    setPlanInfo(prev => {
      if (!prev) return prev;

      const mapping = RESOURCE_MAP[resourceType];
      if (!mapping) return prev;

      const newCurrent = { ...prev.usage.current };
      newCurrent[mapping.usage] = (newCurrent[mapping.usage] || 0) + 1;

      const newPercentages = { ...prev.usage.percentages };
      const limit = prev.usage.limits[mapping.limit];
      if (limit !== null && limit !== undefined) {
        newPercentages[mapping.percentage] = Math.round((newCurrent[mapping.usage] / limit) * 100);
      }

      return {
        ...prev,
        usage: {
          ...prev.usage,
          current: newCurrent,
          percentages: newPercentages
        }
      };
    });
  }, []);

  // Optimistically decrement local usage
  const decrementLocalUsage = useCallback((resourceType: ResourceType) => {
    setPlanInfo(prev => {
      if (!prev) return prev;

      const mapping = RESOURCE_MAP[resourceType];
      if (!mapping) return prev;

      const newCurrent = { ...prev.usage.current };
      newCurrent[mapping.usage] = Math.max(0, (newCurrent[mapping.usage] || 0) - 1);

      const newPercentages = { ...prev.usage.percentages };
      const limit = prev.usage.limits[mapping.limit];
      if (limit !== null && limit !== undefined) {
        newPercentages[mapping.percentage] = Math.round((newCurrent[mapping.usage] / limit) * 100);
      }

      return {
        ...prev,
        usage: {
          ...prev.usage,
          current: newCurrent,
          percentages: newPercentages
        }
      };
    });
  }, []);

  // Memoize context value
  const value = useMemo<PlanContextType>(() => ({
    planInfo,
    isLoading,
    error,
    hasFeature,
    getFeatureLimit,
    isPlanAtLeast,
    canCreate,
    getUsagePercentage,
    refreshPlanInfo: fetchPlanInfo,
    incrementLocalUsage,
    decrementLocalUsage
  }), [
    planInfo,
    isLoading,
    error,
    hasFeature,
    getFeatureLimit,
    isPlanAtLeast,
    canCreate,
    getUsagePercentage,
    fetchPlanInfo,
    incrementLocalUsage,
    decrementLocalUsage
  ]);

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

// ==================== HOOKS ====================

/**
 * Main hook to access plan context
 */
export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}

/**
 * Hook to check a specific feature
 */
export function useFeature(featureName: string) {
  const { hasFeature, getFeatureLimit, isPlanAtLeast, planInfo } = usePlan();

  return useMemo(() => ({
    hasFeature: hasFeature(featureName),
    limit: getFeatureLimit(featureName),
    currentPlan: planInfo?.currentPlan?.name || 'Free',
    isPlanAtLeast
  }), [hasFeature, getFeatureLimit, isPlanAtLeast, featureName, planInfo?.currentPlan?.name]);
}

/**
 * Hook to check resource limits
 */
export function useResourceLimit(resourceType: ResourceType) {
  const { canCreate, getUsagePercentage, incrementLocalUsage, decrementLocalUsage } = usePlan();

  const check = useMemo(() => canCreate(resourceType), [canCreate, resourceType]);
  const percentage = useMemo(() => getUsagePercentage(resourceType), [getUsagePercentage, resourceType]);

  return useMemo(() => ({
    ...check,
    usagePercentage: percentage,
    incrementUsage: () => incrementLocalUsage(resourceType),
    decrementUsage: () => decrementLocalUsage(resourceType)
  }), [check, percentage, incrementLocalUsage, decrementLocalUsage, resourceType]);
}

/**
 * Hook to get subscription status
 */
export function useSubscription() {
  const { planInfo, isLoading } = usePlan();

  return useMemo(() => ({
    subscription: planInfo?.subscription || null,
    isActive: planInfo?.subscription?.isActive || false,
    isTrialing: planInfo?.subscription?.isTrialing || false,
    daysRemaining: planInfo?.subscription?.daysRemaining || 0,
    status: planInfo?.subscription?.status || null,
    isLoading
  }), [planInfo?.subscription, isLoading]);
}

/**
 * Hook to get available plans for upgrade
 */
export function useAvailablePlans() {
  const { planInfo, isLoading } = usePlan();

  return useMemo(() => ({
    plans: planInfo?.availablePlans || [],
    currentPlanId: planInfo?.currentPlan?.id,
    currentPlanName: planInfo?.currentPlan?.name || 'Free',
    isLoading
  }), [planInfo?.availablePlans, planInfo?.currentPlan, isLoading]);
}
