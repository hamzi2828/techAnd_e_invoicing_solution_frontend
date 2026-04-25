// Moyasar Payment Service - Frontend
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ==================== TYPES ====================

export interface MoyasarPaymentConfig {
  success: boolean;
  publishableKey: string;
  currency: string;
  gateway: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  publishableKey: string;
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string; 
  status?: string;
  amount?: number;
  currency?: string;
  dbPaymentId?: string;
  message?: string;
}

export interface MoyasarPayment {
  id: string;
  moyasarId?: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  planName?: string;
  paymentMethod?: {
    type: string;
    brand?: string;
    last4?: string;
  };
  createdAt: string;
  paidAt?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  payments: MoyasarPayment[];
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: {
    id: string;
    status: string;
    plan: {
      name: string;
      monthlyPrice: number;
      yearlyPrice: number;
      currency: string;
    };
    billingCycle: string;
    unitAmount: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    daysRemaining: number;
    isActive: boolean;
  };
  subscriptions?: Array<{
    id: string;
    status: string;
    plan: {
      name: string;
      monthlyPrice: number;
      yearlyPrice: number;
      currency: string;
    };
    billingCycle: string;
    unitAmount: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    daysRemaining: number;
    isActive: boolean;
  }>;
}

export interface InvoiceResponse {
  success: boolean;
  invoices?: Array<{
    id: string;
    number: string;
    amountPaid: number;
    currency: string;
    status: string;
    paidAt: string;
    planName?: string;
    description?: string;
  }>;
  invoice?: {
    id: string;
    number: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
    planName?: string;
    description?: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    paymentMethod?: {
      type: string;
      brand?: string;
      last4?: string;
    };
    createdAt: string;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Get Moyasar config (public key)
 */
export async function getMoyasarConfig(): Promise<MoyasarPaymentConfig> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/config`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get payment config');
  }

  return res.json();
}

/**
 * Create checkout session for payment
 */
export async function createCheckoutSession(params: {
  paymentPlanId: string;
  amount?: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  billingCycle?: 'monthly' | 'yearly';
  metadata?: Record<string, string>;
}): Promise<CheckoutSessionResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create checkout session');
  }

  return res.json();
}

/**
 * Create a direct payment
 */
export async function createPayment(params: {
  amount: number;
  currency?: string;
  description?: string;
  callbackUrl?: string;
  paymentPlanId?: string;
  metadata?: Record<string, string>;
}): Promise<PaymentResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create payment');
  }

  return res.json();
}

/**
 * Confirm/verify a payment
 */
export async function confirmPayment(paymentId: string): Promise<{
  success: boolean;
  payment: MoyasarPayment;
}> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ paymentId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to confirm payment');
  }

  return res.json();
}

/**
 * Get payment details
 */
export async function getPayment(paymentId: string): Promise<{
  success: boolean;
  payment: MoyasarPayment;
}> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/payment/${paymentId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get payment');
  }

  return res.json();
}

/**
 * Get payment history
 */
export async function getPaymentHistory(limit: number = 10): Promise<PaymentHistoryResponse> {
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

/**
 * Create subscription
 */
export async function createSubscription(params: {
  paymentPlanId: string;
  billingCycle?: 'monthly' | 'yearly';
}): Promise<CheckoutSessionResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create subscription');
  }

  return res.json();
}

/**
 * Cancel subscription
 */
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

/**
 * Get user's subscriptions
 */
export async function getSubscriptions(): Promise<SubscriptionResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/subscriptions`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get subscriptions');
  }

  return res.json();
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/subscription/${subscriptionId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get subscription');
  }

  return res.json();
}

/**
 * Get invoices
 */
export async function getInvoices(limit: number = 10): Promise<InvoiceResponse> {
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

/**
 * Get single invoice
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/invoice/${invoiceId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get invoice');
  }

  return res.json();
}

/**
 * Request refund
 */
export async function requestRefund(paymentId: string, amount?: number): Promise<{
  success: boolean;
  refund: {
    id: string;
    status: string;
    amount: number;
    refunded: number;
  };
}> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const res = await fetch(`${API_BASE_URL}/api/payments/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ paymentId, amount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to request refund');
  }

  return res.json();
}

// ==================== MOYASAR SCRIPT LOADING ====================

/**
 * Load Moyasar script dynamically
 */
export function loadMoyasarScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    // Check if already loaded
    if ((window as unknown as { Moyasar?: unknown }).Moyasar) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="moyasar"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      return;
    }

    // Load Moyasar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';
    document.head.appendChild(link);

    // Load Moyasar JS
    const script = document.createElement('script');
    script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Moyasar script'));
    document.head.appendChild(script);
  });
}

// ==================== MOYASAR FORM INITIALIZATION ====================

export interface MoyasarFormConfig {
  element: string;
  amount: number;
  currency: string;
  description: string;
  publishable_api_key: string;
  callback_url: string;
  methods?: string[];
  metadata?: Record<string, string>;
  on_initiating?: () => void;
  on_completed?: (payment: MoyasarPaymentResult) => void;
  on_failure?: (error: MoyasarError) => void;
}

export interface MoyasarPaymentResult {
  id: string;
  status: string;
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  refunded_at: string | null;
  captured: number;
  captured_at: string | null;
  voided_at: string | null;
  description: string;
  amount_format: string;
  fee_format: string;
  refunded_format: string;
  captured_format: string;
  invoice_id: string | null;
  ip: string | null;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, string>;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    message: string | null;
    transaction_url: string | null;
  };
}

export interface MoyasarError {
  type: string;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Initialize Moyasar payment form
 */
export function initializeMoyasarForm(config: MoyasarFormConfig): void {
  const windowWithMoyasar = window as unknown as {
    Moyasar?: { init: (config: MoyasarFormConfig) => void };
  };

  if (!windowWithMoyasar.Moyasar) {
    throw new Error('Moyasar script not loaded');
  }

  windowWithMoyasar.Moyasar.init({
    element: config.element,
    amount: config.amount,
    currency: config.currency,
    description: config.description,
    publishable_api_key: config.publishable_api_key,
    callback_url: config.callback_url,
    methods: config.methods || ['creditcard', 'applepay', 'stcpay'],
    metadata: config.metadata,
    on_initiating: config.on_initiating,
    on_completed: config.on_completed,
    on_failure: config.on_failure,
  });
}

// ==================== ADMIN API FUNCTIONS ====================

export interface AdminPayment {
  id: string;
  moyasarId?: string;
  customer: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  method: string;
  description?: string;
  date: string;
  paidAt?: string;
}

export interface AdminPaymentsResponse {
  success: boolean;
  payments: AdminPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalRefunded: number;
  };
}

export interface AdminPaymentStatsResponse {
  success: boolean;
  stats: {
    totalPayments: number;
    totalRevenue: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalRefunded: number;
  };
}

/**
 * Get all payments (Admin)
 */
export async function getAdminPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<AdminPaymentsResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const res = await fetch(`${API_BASE_URL}/api/payments/admin/all?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get payments');
  }

  return res.json();
}

/**
 * Get payment stats (Admin)
 */
export async function getAdminPaymentStats(params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<AdminPaymentStatsResponse> {
  if (!API_BASE_URL) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const res = await fetch(`${API_BASE_URL}/api/payments/admin/stats?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to get payment stats');
  }

  return res.json();
}

// ==================== LEGACY COMPATIBILITY ====================

// Keep old function names for compatibility
export const getMoyasarPaymentFormData = createCheckoutSession;
export const verifyMoyasarPayment = confirmPayment;
export const getMoyasarPayment = getPayment;
export const getMoyasarPaymentHistory = getPaymentHistory;
