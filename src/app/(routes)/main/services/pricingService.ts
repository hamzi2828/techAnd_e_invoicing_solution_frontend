// src/app/(routes)/main/services/pricingService.ts

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
  description?: string;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular: boolean;
  featured: boolean;
  features: PlanFeature[];
  badge?: string;
  currency?: string;
  isActive?: boolean;
}

export interface Feature {
  id: string;
  name: string;
  starter: boolean;
  plus: boolean;
  premium: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function makeApiRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const msg = errorData?.message || errorData?.error || 'API request failed';
    throw new Error(msg);
  }

  return res.json();
}

// Get active payment plans for public display
export async function getPublicPaymentPlans(): Promise<Plan[]> {
  try {
    const response = await makeApiRequest<ApiResponse<Record<string, unknown>[]>>('/payments/plans/active');
    
    if (response.success && response.data) {
      return transformPlansArrayForFrontend(response.data);
    }
    
    // Fallback to default plans if API fails
    return getDefaultPlans();
  } catch (error) {
    console.error('Failed to fetch payment plans:', error);
    // Return default plans as fallback
    return getDefaultPlans();
  }
}

// Transform API data to frontend format
export function transformPlanDataForFrontend(apiData: Record<string, unknown>): Plan | null {
  if (!apiData) return null;

  return {
    id: String(apiData._id || apiData.id || ''),
    name: String(apiData.name || ''),
    monthlyPrice: Number(apiData.monthlyPrice || 0),
    yearlyPrice: Number(apiData.yearlyPrice || 0),
    description: String(apiData.description || 'Subscribe now'),
    featured: Boolean(apiData.featured),
    popular: apiData.name === 'Professional' || apiData.name === 'Plus', // Auto-detect popular plan
    badge: apiData.badge ? String(apiData.badge) : undefined,
    currency: String(apiData.currency || 'SAR'),
    features: Array.isArray(apiData.features) ? apiData.features as PlanFeature[] : [],
    isActive: apiData.isActive !== false,
  };
}

export function transformPlansArrayForFrontend(apiPlansArray: Record<string, unknown>[]): Plan[] {
  if (!Array.isArray(apiPlansArray)) return [];
  
  const plans = apiPlansArray
    .map(plan => transformPlanDataForFrontend(plan))
    .filter(Boolean) as Plan[];
    
  // Sort plans by price (ascending)
  return plans.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
}

// Default fallback plans
export function getDefaultPlans(): Plan[] {
  return [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: 'Perfect for small businesses getting started',
      popular: false,
      featured: false,
      currency: 'SAR',
      features: [
        { name: 'Up to 50 invoices per month', included: true },
        { name: 'Basic templates', included: true },
        { name: 'Email support', included: true },
        { name: 'Basic reporting', included: true },
        { name: 'Multi-currency support', included: false },
        { name: 'API access', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom branding', included: false },
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 99,
      yearlyPrice: 990,
      description: 'Ideal for growing businesses',
      popular: true,
      featured: false,
      badge: 'Most Popular',
      currency: 'SAR',
      features: [
        { name: 'Up to 200 invoices per month', included: true },
        { name: 'Premium templates', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Advanced reporting', included: true },
        { name: 'Multi-currency support', included: true },
        { name: 'Basic API access', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom branding', included: false },
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      description: 'For large businesses with advanced needs',
      popular: false,
      featured: true,
      badge: 'Best Value',
      currency: 'SAR',
      features: [
        { name: 'Unlimited invoices', included: true },
        { name: 'Custom templates', included: true },
        { name: 'Phone & email support', included: true },
        { name: 'Enterprise reporting', included: true },
        { name: 'Multi-currency support', included: true },
        { name: 'Full API access', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom branding', included: true },
      ]
    }
  ];
}

// Get pricing features matrix
export async function getPricingFeatures(): Promise<Feature[]> {
  try {
    // This would typically come from API, but for now return default
    return getDefaultFeatures();
  } catch (error) {
    console.error('Failed to fetch pricing features:', error);
    return getDefaultFeatures();
  }
}

export function getDefaultFeatures(): Feature[] {
  return [
    { id: 'invoices', name: 'Monthly Invoices', starter: true, plus: true, premium: true },
    { id: 'templates', name: 'Templates', starter: true, plus: true, premium: true },
    { id: 'support', name: 'Support', starter: true, plus: true, premium: true },
    { id: 'reporting', name: 'Reporting', starter: true, plus: true, premium: true },
    { id: 'multicurrency', name: 'Multi-currency', starter: false, plus: true, premium: true },
    { id: 'api', name: 'API Access', starter: false, plus: true, premium: true },
    { id: 'analytics', name: 'Advanced Analytics', starter: false, plus: false, premium: true },
    { id: 'branding', name: 'Custom Branding', starter: false, plus: false, premium: true },
  ];
}