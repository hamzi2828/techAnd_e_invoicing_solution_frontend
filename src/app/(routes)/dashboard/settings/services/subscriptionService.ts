// Subscription Service for Dashboard Settings
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Types
export interface PlanLimits {
  invoicesPerMonth: number | null;
  customers: number | null;
  products: number | null;
  users: number | null;
  storage: number | null;
  companies: number | null;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: PlanFeature[];
  limits?: PlanLimits;
  popular?: boolean;
  featured?: boolean;
  badge?: string;
  currency?: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  plan: {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    features?: PlanFeature[];
  };
  billingCycle: 'monthly' | 'yearly';
  unitAmount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  daysRemaining: number;
  isActive: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: Subscription;
  subscriptions?: Subscription[];
  message?: string;
}

export interface PlansResponse {
  success: boolean;
  data?: Plan[];
  message?: string;
}

// Get all available plans
export async function getAvailablePlans(): Promise<Plan[]> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/payments/plans/active`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get plans');
  }

  const response = await res.json();

  if (response.success && response.data) {
    return response.data.map((plan: Record<string, unknown>) => ({
      id: plan._id || plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      description: plan.description,
      features: plan.features || [],
      limits: plan.limits as PlanLimits | undefined,
      popular: plan.isPopular || plan.popular || plan.name === 'Professional',
      featured: plan.isFeatured || plan.featured,
      badge: (plan.metadata as Record<string, unknown>)?.badge as string | undefined,
      currency: plan.currency || 'SAR',
    }));
  }

  return [];
}

// Get user's current subscription
export async function getCurrentSubscription(): Promise<Subscription | null> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/subscriptions`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get subscription');
  }

  const response = await res.json();

  if (response.success && response.subscriptions && response.subscriptions.length > 0) {
    // Map the subscription data to our expected format
    const mapSubscription = (sub: Record<string, unknown>): Subscription => {
      const plan = sub.plan as Record<string, unknown> | null;
      return {
        id: String(sub.id || sub._id),
        status: sub.status as Subscription['status'],
        plan: {
          id: plan?._id ? String(plan._id) : String(plan?.id || ''),
          name: String(plan?.name || 'Unknown Plan'),
          monthlyPrice: Number(plan?.monthlyPrice || 0),
          yearlyPrice: Number(plan?.yearlyPrice || 0),
          currency: String(plan?.currency || 'SAR'),
        },
        billingCycle: sub.billingCycle as 'monthly' | 'yearly',
        unitAmount: Number(sub.unitAmount || 0),
        currency: String(sub.currency || 'SAR'),
        currentPeriodStart: String(sub.currentPeriodStart),
        currentPeriodEnd: String(sub.currentPeriodEnd),
        cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
        canceledAt: sub.canceledAt ? String(sub.canceledAt) : undefined,
        daysRemaining: Number(sub.daysRemaining || 0),
        isActive: Boolean(sub.isActive),
      };
    };

    // Return the most recent active subscription
    const subscriptions = response.subscriptions.map(mapSubscription);
    const activeSubscription = subscriptions.find((s: Subscription) => s.status === 'active' || s.status === 'trialing');
    return activeSubscription || subscriptions[0];
  }

  return null;
}

// Change subscription plan (initiates checkout for new plan)
export async function changePlan(params: {
  newPlanId: string;
  billingCycle: 'monthly' | 'yearly';
}): Promise<{
  success: boolean;
  checkoutUrl?: string;
  publishableKey?: string;
  amount?: number;
  currency?: string;
  description?: string;
  callbackUrl?: string;
  metadata?: Record<string, string>;
  message?: string;
  isFree?: boolean;
  subscription?: Subscription;
}> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      paymentPlanId: params.newPlanId,
      billingCycle: params.billingCycle,
      successUrl: `${window.location.origin}/payment/callback`,
      cancelUrl: `${window.location.origin}/dashboard/settings?tab=subscription`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to initiate plan change');
  }

  const result = await res.json();

  // If this is a free plan, activate it directly
  if (result.success && result.isFree) {
    return activateFreePlan({
      planId: params.newPlanId,
      billingCycle: params.billingCycle,
    });
  }

  return result;
}

// Activate a free plan (no payment required)
export async function activateFreePlan(params: {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
}): Promise<{
  success: boolean;
  subscription?: Subscription;
  message?: string;
  isFree?: boolean;
}> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/subscribe/free`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      paymentPlanId: params.planId,
      billingCycle: params.billingCycle,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to activate free plan');
  }

  const result = await res.json();
  return {
    ...result,
    isFree: true,
  };
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/subscription/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to cancel subscription');
  }

  return res.json();
}

// Get payment history
export async function getPaymentHistory(limit: number = 10): Promise<{
  success: boolean;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    planName?: string;
    createdAt: string;
    paidAt?: string;
  }>;
}> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/history?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get payment history');
  }

  return res.json();
}

// Get invoices
export async function getInvoices(limit: number = 10): Promise<{
  success: boolean;
  invoices: Array<{
    id: string;
    number: string;
    amountPaid: number;
    currency: string;
    status: string;
    paidAt: string;
    planName?: string;
  }>;
}> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/invoices?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get invoices');
  }

  return res.json();
}
