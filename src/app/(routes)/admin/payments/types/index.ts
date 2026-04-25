export interface PaymentStats {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}

export interface Payment {
  id: string;
  customer: string;
  amount: string;
  plan: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Cancelled';
  date: string;
  method: string;
}

export interface Customer {
  name: string;
  email: string;
  avatar?: string;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  subtitle: string;
  featured: boolean;
  badge?: string;
  currency?: string;
  features?: PlanFeature[];
  limits?: PlanLimits;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
  description?: string;
}

export interface PlanLimits {
  invoicesPerMonth?: number;
  customers?: number;
  storage?: number;
}

export interface Feature {
  id: string;
  name: string;
  starter: boolean;
  plus: boolean;
  premium: boolean;
  isActive?: boolean;
}

export interface Subscription {
  id: string;
  customer: Customer;
  plan: {
    name: string;
    price: number;
    billing: 'monthly' | 'yearly';
  };
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  startDate: string;
  nextBilling: string;
  totalRevenue: number;
  paymentMethod: string;
}

export interface SubscriptionStats {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

// API Response Types
export interface ValidationError {
  type: string;
  value: unknown;
  msg: string;
  path: string;
  location: string;
}

// Helper interface for frontend error mapping
export interface FormValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PlanStats {
  totalPlans: number;
  activePlans: number;
  featuredPlans: number;
  popularPlans: number;
  avgMonthlyPrice: number;
  avgYearlyPrice: number;
}

export interface PlanMetrics {
  subscriptions: number;
  revenue: number;
  conversionRate: number;
  popularity: number;
}

export interface PaginatedResponse<T> {
  plans: T[];
  total: number;
  page: number;
  pages: number;
}

export interface CreatePlanPayload {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  featured?: boolean;
  isFeatured?: boolean;
  badge?: string;
  currency?: string;
  features?: PlanFeature[];
  limits?: PlanLimits;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PlanFilters {
  isActive?: boolean;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}