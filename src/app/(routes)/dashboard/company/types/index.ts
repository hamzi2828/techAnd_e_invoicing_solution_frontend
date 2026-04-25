export interface Company {
  _id?: string;
  id?: string;
  userId?: string;
  companyName: string;
  companyNameAr?: string;
  legalForm: 'Limited Liability Company' | 'Joint Stock Company' | 'Partnership' | 'Sole Proprietorship' | 'Branch of Foreign Company' | 'Professional Company';
  commercialRegistrationNumber: string;
  taxIdNumber: string;
  vatNumber?: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  industry: string;
  businessDescription?: string;
  establishedDate: string;
  employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  currency: 'SAR' | 'USD' | 'EUR';
  fiscalYearEnd: string;
  status: 'draft' | 'pending_verification' | 'verified' | 'suspended';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  isDefault?: boolean;
  documents?: CompanyDocument[];
  settings?: {
    invoiceNumberPrefix?: string;
    invoiceNumberStartFrom?: number;
    defaultDueDays?: number;
    logoUrl?: string;
    signature?: string;
    termsAndConditions?: string;
  };
  zakatEligible?: boolean;
  vatRegistered?: boolean;
  vatRate?: number;
  zatcaCredentials?: ZatcaCredentials;
  __v?: number;
  createdAt: string;
  updatedAt: string;
}

// ZATCA Environment Types
export type ZatcaEnvironment = 'sandbox' | 'simulation' | 'production';
export type ZatcaEnvironmentStatus = 'not_started' | 'csr_generated' | 'compliance' | 'test_invoices_submitted' | 'verified';

// Credentials for a specific business type (B2B or B2C) within an environment
export interface BusinessTypeCredentials {
  status: ZatcaEnvironmentStatus;
  hasCSR: boolean;
  hasComplianceCert: boolean;
  hasTestInvoicesSubmitted: boolean;
  hasProductionCSID: boolean;
  onboardedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  hashChainCounter?: number;
  previousInvoiceHash?: string | null;
}

// Environment credentials with B2B/B2C nested structure
export interface ZatcaEnvironmentCredentials {
  b2b?: BusinessTypeCredentials;
  b2c?: BusinessTypeCredentials;
}

export interface ZatcaProgression {
  // B2B progression
  b2bCompletedEnvironments: ZatcaEnvironment[];
  b2bProductionLocked: boolean;
  b2bProductionLockedAt?: string;
  // B2C progression
  b2cCompletedEnvironments: ZatcaEnvironment[];
  b2cProductionLocked: boolean;
  b2cProductionLockedAt?: string;
  // Skipped environments (shared)
  skippedEnvironments: ZatcaEnvironment[];
}

export interface ZatcaCredentials {
  // Active environment for invoicing
  activeEnvironment: ZatcaEnvironment | null;
  // Current business type being onboarded
  currentBusinessType: 'B2B' | 'B2C' | null;
  // Progression tracking per business type
  progression: ZatcaProgression;
  // Per-environment credentials with B2B/B2C nested structure
  environments: {
    sandbox: ZatcaEnvironmentCredentials;
    simulation: ZatcaEnvironmentCredentials;
    production: ZatcaEnvironmentCredentials;
  };
  // Onboarding phase and business type
  onboardingPhase: OnboardingPhase;
  businessType: BusinessType;
  b2bEnabled: boolean;
  b2cEnabled: boolean;
  // Onboarding details (indicates completion)
  onboardingDetails?: OnboardingDetails;
}

export interface CompanyDocument {
  _id?: string;
  documentType: 'commercial_registration' | 'tax_certificate' | 'vat_certificate' | 'bank_certificate' | 'authorized_signatory' | 'company_profile' | 'other';
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface CompanyForm {
  companyName: string;
  companyNameAr?: string;
  legalForm: 'Limited Liability Company' | 'Joint Stock Company' | 'Partnership' | 'Sole Proprietorship' | 'Branch of Foreign Company' | 'Professional Company';
  commercialRegistrationNumber: string;
  taxIdNumber: string;
  vatNumber?: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  industry: string;
  businessDescription?: string;
  establishedDate: string;
  employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  currency?: 'SAR' | 'USD' | 'EUR';
  fiscalYearEnd?: string;
  settings?: {
    invoiceNumberPrefix?: string;
    invoiceNumberStartFrom?: number;
    defaultDueDays?: number;
    termsAndConditions?: string;
  };
  zakatEligible?: boolean;
  vatRegistered?: boolean;
  vatRate?: number;
}

export interface CompanyFilters {
  search?: string;
  status?: 'draft' | 'pending_verification' | 'verified' | 'suspended' | 'all';
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'all';
  industry?: string;
  city?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  createdAfter?: string;
  createdBefore?: string;
}

export interface CompanyStatistics {
  overview: {
    totalCompanies: number;
    activeCompanies: number;
    verifiedCompanies: number;
    pendingVerification: number;
    inactiveCompanies: number;
  };
  industryBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  cityBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

// Constants for form options
export const LEGAL_FORMS = [
  'Limited Liability Company',
  'Joint Stock Company',
  'Partnership',
  'Sole Proprietorship',
  'Branch of Foreign Company',
  'Professional Company'
] as const;

export const SAUDI_CITIES = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar',
  'Dhahran', 'Jubail', 'Tabuk', 'Abha', 'Khamis Mushait',
  'Hail', 'Buraidah', 'Qassim', 'Jazan', 'Najran', 'Al-Ahsa',
  'Yanbu', 'Taif', 'Arar', 'Sakaka', 'Al-Baha'
] as const;

export const SAUDI_PROVINCES = [
  'Riyadh Province', 'Makkah Province', 'Madinah Province',
  'Eastern Province', 'Asir Province', 'Tabuk Province',
  'Qassim Province', 'Ha\'il Province', 'Jazan Province',
  'Najran Province', 'Al-Baha Province', 'Northern Borders Province',
  'Al-Jawf Province'
] as const;

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Education', 'Construction',
  'Manufacturing', 'Retail', 'Finance', 'Real Estate',
  'Transportation', 'Food & Beverage', 'Tourism',
  'Agriculture', 'Energy', 'Consulting', 'Other'
] as const;

export const EMPLOYEE_COUNTS = [
  '1-10', '11-50', '51-200', '201-500', '500+'
] as const;

export const CURRENCIES = ['SAR', 'USD', 'EUR'] as const;

export const FISCAL_YEAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const DOCUMENT_TYPES = [
  'commercial_registration',
  'tax_certificate',
  'vat_certificate',
  'bank_certificate',
  'authorized_signatory',
  'company_profile',
  'other'
] as const;

// ZATCA Types
export interface CSRRequest {
  companyName: string;
  serialNumber: string;
  vatNumber: string;
  organizationUnit: string;
  invoiceType: 'Standard' | 'Simplified';
  address: string;
  industry: string;
}

export interface ZatcaHistoryEntry {
  environment: ZatcaEnvironment;
  businessType?: 'B2B' | 'B2C';
  action:
    | 'csr_generated'
    | 'compliance_obtained'
    | 'test_invoices_submitted'
    | 'production_csid_obtained'
    | 'environment_skipped'
    | 'environment_activated'
    | 'migrated_from_legacy'
    | 'b2b_csr_generated'
    | 'b2b_compliance_obtained'
    | 'b2b_test_invoices_submitted'
    | 'b2b_production_csid_obtained'
    | 'b2c_csr_generated'
    | 'b2c_compliance_obtained'
    | 'b2c_test_invoices_submitted'
    | 'b2c_production_csid_obtained'
    | 'business_type_set'
    | 'business_type_reset';
  timestamp: string;
  metadata?: Record<string, unknown>;
  performedBy?: string;
}

// Onboarding Phase Types
export type OnboardingPhase = 'phase1_generation' | 'phase2_integration';
export type BusinessType = 'B2B' | 'B2C' | 'both';
export type KeyType = 'signing' | 'encryption' | 'authentication';
export type APIVerificationStatus = 'not_verified' | 'pending' | 'verified' | 'failed';

// Onboarding Details
export interface OnboardingDetails {
  sellerName: string;
  sellerNumber: string;
  totalAmount?: number;
  buyerDetails?: {
    name?: string;
    vatNumber?: string;
    address?: string;
  };
  submittedAt?: string;
}

// TLU Data
export interface TLUData {
  tokenId: string;
  base64Encoded: string;
  generatedAt: string;
  expiresAt: string;
  environment: ZatcaEnvironment;
  attachedToAPI: boolean;
  attachedAt?: string;
}

export interface TLUStatus {
  hasToken: boolean;
  status: 'not_generated' | 'valid' | 'expiring' | 'expiring_soon' | 'invalid';
  tokenId?: string;
  environment?: ZatcaEnvironment;
  generatedAt?: string;
  expiresAt?: string;
  remainingHours?: number;
  attachedToAPI?: boolean;
  error?: string;
}

// Configuration Key
export interface ConfigurationKey {
  keyId: string;
  keyType: KeyType;
  keyName: string;
  isActive: boolean;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
}

// OTP Verification
export interface OTPVerification {
  phoneNumber?: string;
  verified: boolean;
  verifiedAt?: string;
  attemptsCount?: number;
  cooldownUntil?: string;
}

// Verification Status Response
export interface VerificationStatusResponse {
  b2bEnabled: boolean;
  b2cEnabled: boolean;
  businessType: BusinessType;
  apiVerificationStatus: APIVerificationStatus;
  apiVerifiedAt?: string;
  lastAPICheckAt?: string;
  activeEnvironment?: ZatcaEnvironment;
  environmentStatus: ZatcaEnvironmentStatus;
  otpVerified: boolean;
  tluAttached: boolean;
  onboardingPhase: OnboardingPhase;
  b2bProductionLocked: boolean;
  b2cProductionLocked: boolean;
}

// Configuration Response
export interface ConfigurationResponse {
  phase: OnboardingPhase;
  businessType: BusinessType;
  b2bEnabled: boolean;
  b2cEnabled: boolean;
  keys: ConfigurationKey[];
  tluStatus: TLUStatus;
  otpVerification: {
    verified: boolean;
    verifiedAt?: string;
  };
  apiVerificationStatus: APIVerificationStatus;
  activeEnvironment?: ZatcaEnvironment | null;
  onboardingDetails?: OnboardingDetails | null;
}

// OTP Response Types
export interface OTPSendResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  cooldownRemaining?: number;
  devOTP?: string; // Only in development mode
}

export interface OTPVerifyResponse {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
  cooldownRemaining?: number;
}

export interface ZatcaStatusResponse {
  // Active environment for invoicing
  activeEnvironment: ZatcaEnvironment | null;
  // Current business type being onboarded
  currentBusinessType: 'B2B' | 'B2C' | null;
  // Per-environment credentials with B2B/B2C nested structure
  environments: {
    sandbox: ZatcaEnvironmentCredentials;
    simulation: ZatcaEnvironmentCredentials;
    production: ZatcaEnvironmentCredentials;
  };
  // Progression tracking per business type
  progression: ZatcaProgression;
  // Environments that can be skipped to
  canSkipTo: ZatcaEnvironment[];
  // B2B/B2C enablement
  b2bEnabled: boolean;
  b2cEnabled: boolean;
}