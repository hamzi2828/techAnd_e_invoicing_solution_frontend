/**
 * Centralized feature names - must match backend constants
 * Use these throughout the frontend for consistency
 */
export const FEATURES = {
  // Companies
  NUMBER_OF_COMPANIES: 'Number of Companies',

  // Invoice Volume
  INVOICE_VOLUME: 'Invoice Volume',

  // ZATCA Compliance
  ZATCA_PHASE_1: 'ZATCA Phase 1 (Generation)',
  ZATCA_PHASE_2: 'ZATCA Phase 2 (Integration)',
  ZATCA_ONBOARDING: 'ZATCA Onboarding',

  // Core Features
  QUOTATION: 'Quotation',
  BULK_IMPORT: 'Bulk Import',

  // Reports
  REPORTS: 'Reports',
  REPORT_SCHEDULING: 'Report Scheduling',

  // Users & Permissions
  MULTIPLE_USERS: 'Multiple Users',
  ROLES_PERMISSIONS: 'Roles & Permissions',

  // Notifications
  EMAIL_NOTIFICATIONS: 'Email Notifications',

  // Support
  SUPPORT: 'Support',

  // Enterprise Features
  API_ACCESS: 'API Access',
  CUSTOM_INTEGRATIONS: 'Custom Integrations',
  DEDICATED_ACCOUNT_MANAGER: 'Dedicated Account Manager'
} as const;

/**
 * Resource types for usage tracking
 */
export const RESOURCE_TYPES = {
  INVOICE: 'invoice',
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  USER: 'user',
  STORAGE: 'storage',
  COMPANY: 'company'
} as const;

/**
 * Plan names
 */
export const PLAN_NAMES = {
  FREE: 'Free',
  BASIC: 'Basic',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise'
} as const;

/**
 * Plan hierarchy for comparison (higher = better)
 */
export const PLAN_HIERARCHY: Record<string, number> = {
  'Free': 0,
  'Basic': 1,
  'Professional': 2,
  'Enterprise': 3
};

// Type exports
export type FeatureName = typeof FEATURES[keyof typeof FEATURES];
export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];
export type PlanName = typeof PLAN_NAMES[keyof typeof PLAN_NAMES];

/**
 * Feature descriptions for UI display
 */
export const FEATURE_DESCRIPTIONS: Record<string, string> = {
  [FEATURES.ZATCA_PHASE_1]: 'Generate ZATCA-compliant invoices',
  [FEATURES.ZATCA_PHASE_2]: 'Direct integration with ZATCA systems',
  [FEATURES.ZATCA_ONBOARDING]: 'Guided setup for ZATCA certificates',
  [FEATURES.QUOTATION]: 'Create and manage quotations',
  [FEATURES.BULK_IMPORT]: 'Import customers, products, and invoices in bulk',
  [FEATURES.REPORTS]: 'View business reports and analytics',
  [FEATURES.REPORT_SCHEDULING]: 'Schedule automated report delivery',
  [FEATURES.MULTIPLE_USERS]: 'Add team members to your account',
  [FEATURES.ROLES_PERMISSIONS]: 'Control access with custom roles',
  [FEATURES.EMAIL_NOTIFICATIONS]: 'Automated email notifications',
  [FEATURES.API_ACCESS]: 'Access our API for custom integrations',
  [FEATURES.CUSTOM_INTEGRATIONS]: 'Connect with ERP and other systems',
  [FEATURES.DEDICATED_ACCOUNT_MANAGER]: 'Personal support manager'
};

/**
 * Plans that include each feature (for upgrade suggestions)
 */
export const FEATURE_AVAILABLE_IN: Record<string, string[]> = {
  [FEATURES.ZATCA_PHASE_1]: ['Free', 'Basic', 'Professional', 'Enterprise'],
  [FEATURES.ZATCA_PHASE_2]: ['Professional', 'Enterprise'],
  [FEATURES.ZATCA_ONBOARDING]: ['Basic', 'Professional', 'Enterprise'],
  [FEATURES.QUOTATION]: ['Free', 'Basic', 'Professional', 'Enterprise'],
  [FEATURES.BULK_IMPORT]: ['Professional', 'Enterprise'],
  [FEATURES.REPORTS]: ['Free', 'Basic', 'Professional', 'Enterprise'],
  [FEATURES.REPORT_SCHEDULING]: ['Professional', 'Enterprise'],
  [FEATURES.MULTIPLE_USERS]: ['Professional', 'Enterprise'],
  [FEATURES.ROLES_PERMISSIONS]: ['Professional', 'Enterprise'],
  [FEATURES.EMAIL_NOTIFICATIONS]: ['Professional', 'Enterprise'],
  [FEATURES.API_ACCESS]: ['Enterprise'],
  [FEATURES.CUSTOM_INTEGRATIONS]: ['Enterprise'],
  [FEATURES.DEDICATED_ACCOUNT_MANAGER]: ['Enterprise']
};

/**
 * Get minimum plan required for a feature
 */
export const getMinPlanForFeature = (featureName: string): string => {
  const plans = FEATURE_AVAILABLE_IN[featureName];
  if (!plans || plans.length === 0) return 'Enterprise';

  // Return the first (lowest tier) plan
  const planOrder = ['Free', 'Basic', 'Professional', 'Enterprise'];
  for (const plan of planOrder) {
    if (plans.includes(plan)) return plan;
  }
  return 'Enterprise';
};
