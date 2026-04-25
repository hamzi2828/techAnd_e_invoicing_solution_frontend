import { 
  Plan, 
  ApiResponse, 
  PlanStats, 
  PlanMetrics, 
  PaginatedResponse, 
  CreatePlanPayload, 
  PlanFilters,
  PlanFeature,
  PlanLimits
} from '../types';
import { getAuthHeader } from '@/helper/helper';

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
      ...getAuthHeader(),
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

    // If it's a validation error with structured errors, throw the whole object as a string
    // so it can be parsed in the hook
    if (errorData.errors && Array.isArray(errorData.errors)) {
      throw new Error(JSON.stringify(errorData));
    }

    // Otherwise throw the message
    const msg = errorData?.message || errorData?.error || 'API request failed';
    throw new Error(msg);
  }

  return res.json();
}


export async function getActivePaymentPlans(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return makeApiRequest<ApiResponse<Record<string, unknown>[]>>('/payments/plans/active');
}

export async function getAllPaymentPlans(page: number = 1, limit: number = 10, search: string = ''): Promise<ApiResponse<PaginatedResponse<Plan>>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search })
  });

  return makeApiRequest<ApiResponse<PaginatedResponse<Plan>>>(`/payments/plans?${queryParams}`);
}

export async function getPaymentPlanById(id: string): Promise<ApiResponse<Plan>> {
  return makeApiRequest<ApiResponse<Plan>>(`/payments/plans/${id}`);
}

export async function createPaymentPlan(planData: CreatePlanPayload): Promise<ApiResponse<Record<string, unknown>>> {
  return makeApiRequest<ApiResponse<Record<string, unknown>>>('/payments/plans', {
    method: 'POST',
    body: JSON.stringify(planData)
  });
}

export async function updatePaymentPlan(id: string, updateData: Partial<CreatePlanPayload>): Promise<ApiResponse<Record<string, unknown>>> {
  return makeApiRequest<ApiResponse<Record<string, unknown>>>(`/payments/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
}

export async function deletePaymentPlan(id: string): Promise<ApiResponse<void>> {
  return makeApiRequest<ApiResponse<void>>(`/payments/plans/${id}`, {
    method: 'DELETE'
  });
}

export async function togglePaymentPlanStatus(id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return makeApiRequest<ApiResponse<Record<string, unknown>>>(`/payments/plans/${id}/toggle-status`, {
    method: 'PATCH'
  });
}

export async function getPaymentPlanStats(): Promise<ApiResponse<PlanStats>> {
  return makeApiRequest<ApiResponse<PlanStats>>('/payments/plans/stats');
}

export async function duplicatePaymentPlan(id: string, newName: string): Promise<ApiResponse<Record<string, unknown>>> {
  return makeApiRequest<ApiResponse<Record<string, unknown>>>(`/payments/plans/${id}/duplicate`, {
    method: 'POST',
    body: JSON.stringify({ newName })
  });
}

export async function searchPaymentPlans(searchQuery: string, filters: PlanFilters = {}): Promise<ApiResponse<Plan[]>> {
  const queryParams = new URLSearchParams({
    search: searchQuery,
    ...Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)]))
  });

  return makeApiRequest<ApiResponse<Plan[]>>(`/payments/plans/search?${queryParams}`);
}

export async function getPaymentPlanMetrics(id: string): Promise<ApiResponse<PlanMetrics>> {
  return makeApiRequest<ApiResponse<PlanMetrics>>(`/payments/plans/${id}/metrics`);
}

export function transformPlanDataForFrontend(apiData: Record<string, unknown>): Plan | null {
  if (!apiData) return null;

  return {
    id: String(apiData._id || apiData.id || ''),
    name: String(apiData.name || ''),
    monthlyPrice: Number(apiData.monthlyPrice || 0),
    yearlyPrice: Number(apiData.yearlyPrice || 0),
    subtitle: String(apiData.description || 'Subscribe now'),
    featured: Boolean(apiData.isFeatured || apiData.featured),
    badge: apiData.badge ? String(apiData.badge) : undefined,
    currency: String(apiData.currency || 'SAR'),
    features: Array.isArray(apiData.features) ? apiData.features as PlanFeature[] : undefined,
    limits: (apiData.limits && typeof apiData.limits === 'object') ? apiData.limits as PlanLimits : undefined,
    isActive: apiData.isActive !== false,
    createdAt: apiData.createdAt ? String(apiData.createdAt) : undefined,
    updatedAt: apiData.updatedAt ? String(apiData.updatedAt) : undefined
  };
}

export function transformPlansArrayForFrontend(apiPlansArray: Record<string, unknown>[]): Plan[] {
  if (!Array.isArray(apiPlansArray)) return [];
  return apiPlansArray.map(plan => transformPlanDataForFrontend(plan)).filter(Boolean) as Plan[];
}

export function transformPlanDataForAPI(frontendData: Partial<Plan>): CreatePlanPayload {
  // Validate required fields
  if (!frontendData.name || frontendData.name.trim().length === 0) {
    throw new Error('Plan name is required');
  }
  if (frontendData.monthlyPrice === undefined || frontendData.monthlyPrice < 0) {
    throw new Error('Valid monthly price is required');
  }
  if (frontendData.yearlyPrice === undefined || frontendData.yearlyPrice < 0) {
    throw new Error('Valid yearly price is required');
  }

  const payload: CreatePlanPayload = {
    name: frontendData.name.trim(),
    monthlyPrice: frontendData.monthlyPrice,
    yearlyPrice: frontendData.yearlyPrice
  };

  // Optional fields
  if (frontendData.subtitle && frontendData.subtitle.trim().length > 0) {
    payload.description = frontendData.subtitle.trim();
  }

  if (frontendData.featured !== undefined) {
    payload.isFeatured = frontendData.featured;
  }

  if (frontendData.badge && frontendData.badge.trim().length > 0) {
    payload.badge = frontendData.badge.trim();
  }

  if (frontendData.currency && frontendData.currency.trim().length > 0) {
    payload.currency = frontendData.currency;
  }

  if (frontendData.features && Array.isArray(frontendData.features)) {
    payload.features = frontendData.features;
  }

  if (frontendData.limits && typeof frontendData.limits === 'object') {
    payload.limits = frontendData.limits;
  }

  if (frontendData.isActive !== undefined) {
    payload.isActive = frontendData.isActive;
  }

  return payload;
}

export function transformPartialPlanDataForAPI(frontendData: Partial<Plan>): Partial<CreatePlanPayload> {
  const payload: Partial<CreatePlanPayload> = {};

  if (frontendData.name !== undefined && frontendData.name.trim().length > 0) {
    payload.name = frontendData.name.trim();
  }

  if (frontendData.monthlyPrice !== undefined && frontendData.monthlyPrice >= 0) {
    payload.monthlyPrice = frontendData.monthlyPrice;
  }

  if (frontendData.yearlyPrice !== undefined && frontendData.yearlyPrice >= 0) {
    payload.yearlyPrice = frontendData.yearlyPrice;
  }

  if (frontendData.subtitle !== undefined && frontendData.subtitle.trim().length > 0) {
    payload.description = frontendData.subtitle.trim();
  }

  if (frontendData.featured !== undefined) {
    payload.isFeatured = frontendData.featured;
  }

  if (frontendData.badge !== undefined) {
    payload.badge = frontendData.badge?.trim();
  }

  if (frontendData.currency !== undefined && frontendData.currency.trim().length > 0) {
    payload.currency = frontendData.currency;
  }

  if (frontendData.features !== undefined && Array.isArray(frontendData.features)) {
    payload.features = frontendData.features;
  }

  if (frontendData.limits !== undefined && typeof frontendData.limits === 'object') {
    payload.limits = frontendData.limits;
  }

  if (frontendData.isActive !== undefined) {
    payload.isActive = frontendData.isActive;
  }

  return payload;
}