// Types for Add Customer Page

export interface FormData {
  // Basic Information
  customerName: string;
  customerType: 'individual' | 'business';
  commercialRegistrationNumber: string;
  industry: string;
  vatNumber: string;
  taxId: string;
  email: string;
  phone: string;
  contactPerson: string;
  website: string;
  customerGroup: string;

  // Address
  streetAddress: string;
  buildingNumber: string;
  additionalNumber: string;
  district: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;

  // Banking
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  currency: string;

  // Payment Limits
  dailyLimit: string;
  monthlyLimit: string;
  perTransactionLimit: string;


  // Compliance
  riskRating: 'low' | 'medium' | 'high';
  sanctionScreened: boolean;

  // Status
  status: string;
  verificationStatus: string;
  isActive: boolean;

  // Additional
  notes: string;
  tags: string[];
  referenceNumber: string;
  source: string;
  assignedTo: string;
  priority: string;
}

export interface Contact {
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  isPrimary: boolean;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountType: string;
  iban: string;
  swiftCode: string;
  currency: string;
  isPrimary: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
}

export interface SettingsData {
  isActive: boolean;
  dataProcessingConsent: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}



// Props Types for Components

export interface CustomerTypeSelectorProps {
  customerType: 'individual' | 'business';
  onTypeChange: (type: 'individual' | 'business') => void;
  disabled?: boolean;
}

export interface BasicInformationFormProps {
  customerType: 'individual' | 'business';
  formData: Pick<FormData,
    'customerName' |
    'commercialRegistrationNumber' |
    'industry' |
    'vatNumber' |
    'taxId' |
    'email' |
    'phone' |
    'website' |
    'customerGroup'
  >;
  onUpdateField: (field: keyof FormData, value: string) => void;
  fieldErrors?: Record<string, string>;
}

export interface AddressInformationFormProps {
  formData: Pick<FormData,
    'streetAddress' |
    'buildingNumber' |
    'additionalNumber' |
    'district' |
    'city' |
    'postalCode' |
    'country'
  >;
  onUpdateField: (field: keyof FormData, value: string) => void;
}

export interface ContactPersonsFormProps {
  customerType: 'individual' | 'business';
  contacts: Contact[];
  onUpdateContacts: (contacts: Contact[]) => void;
}

export interface BankingInformationFormProps {
  bankAccounts: BankAccount[];
  onUpdateBankAccounts: (accounts: BankAccount[]) => void;
}

export interface CustomerSettingsProps {
  settings: SettingsData;
  onUpdateSettings: (field: keyof SettingsData, value: boolean) => void;
  readOnly?: boolean;
}


export interface DocumentsUploadProps {
  documents: Document[];
  onUpdateDocuments: (documents: Document[]) => void;
}

export interface ComplianceFormProps {
  formData: Pick<FormData, 'riskRating' | 'sanctionScreened' | 'status' | 'verificationStatus' | 'isActive'>;
  onUpdateField: (field: keyof FormData, value: string | boolean) => void;
}

export interface PaymentLimitsFormProps {
  formData: Pick<FormData, 'dailyLimit' | 'monthlyLimit' | 'perTransactionLimit' | 'currency'>;
  onUpdateField: (field: keyof FormData, value: string) => void;
}


// Customer creation payload type
export interface CreateCustomerPayload {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  country: string;
  taxNumber: string;
  address: string;
  city: string;
  streetAddress: string;
  buildingNumber?: string;
  additionalNumber?: string;
  district?: string;
  postalCode?: string;
  state?: string;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  currency?: string;
  isActive: boolean;
  contacts?: Contact[];
  creditLimit?: number;
  paymentTerms?: string;
  tags?: string[];
  notes?: string;
  referenceNumber?: string;
  source?: string;
  assignedTo?: string;
  priority?: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Custom error type for backend validation errors
export interface ValidationErrorResponse extends Error {
  validationErrors?: string[];
}

// Industry options
export const INDUSTRY_OPTIONS = [
  'Technology',
  'Retail',
  'Manufacturing',
  'Healthcare',
  'Construction',
  'Finance',
  'Education',
  'Transportation',
  'Hospitality',
  'Real Estate',
  'Other',
] as const;

export type Industry = typeof INDUSTRY_OPTIONS[number];

// Customer Group options
export const CUSTOMER_GROUP_OPTIONS = [
  'Regular',
  'VIP',
  'Premium',
  'Wholesale',
  'Corporate',
  'Government',
] as const;

export type CustomerGroup = typeof CUSTOMER_GROUP_OPTIONS[number];

// Country options
export const COUNTRY_OPTIONS = [
  'Saudi Arabia',
  'United Arab Emirates',
  'Kuwait',
  'Qatar',
  'Bahrain',
  'Oman',
  'Egypt',
  'Jordan',
  'Lebanon',
] as const;

export type Country = typeof COUNTRY_OPTIONS[number];

// Currency options
export const CURRENCY_OPTIONS = [
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
] as const;

export type CurrencyCode = typeof CURRENCY_OPTIONS[number]['code'];

// Payment Terms options
export const PAYMENT_TERMS_OPTIONS = [
  { value: '0', label: 'Cash on Delivery' },
  { value: '7', label: '7 Days' },
  { value: '15', label: '15 Days' },
  { value: '30', label: '30 Days' },
  { value: '45', label: '45 Days' },
  { value: '60', label: '60 Days' },
  { value: '90', label: '90 Days' },
] as const;

export type PaymentTerms = typeof PAYMENT_TERMS_OPTIONS[number]['value'];

// Department options
export const DEPARTMENT_OPTIONS = [
  'Management',
  'Sales',
  'Finance',
  'Operations',
  'Human Resources',
  'Information Technology',
  'Marketing',
  'Customer Service',
  'Procurement',
  'Legal',
  'Other',
] as const;

export type Department = typeof DEPARTMENT_OPTIONS[number];

// Account Type options
export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'business', label: 'Business Account' },
  { value: 'current', label: 'Current Account' },
] as const;

export type AccountType = typeof ACCOUNT_TYPE_OPTIONS[number]['value'];

// Bank options for Saudi Arabia
export const BANK_OPTIONS = [
  'Saudi National Bank',
  'Al Rajhi Bank',
  'Riyad Bank',
  'Banque Saudi Fransi',
  'Saudi Investment Bank',
  'Arab National Bank',
  'Bank AlBilad',
  'Bank AlJazira',
  'Alinma Bank',
  'Saudi British Bank (SABB)',
  'Bank Albilad',
  'Gulf International Bank',
  'Other',
] as const;

export type Bank = typeof BANK_OPTIONS[number];

// Source options
export const SOURCE_OPTIONS = [
  'Website',
  'Phone Call',
  'Email Inquiry',
  'Referral',
  'Walk-in',
  'Social Media',
  'Trade Show',
  'Advertisement',
  'Partner',
  'Other',
] as const;

export type Source = typeof SOURCE_OPTIONS[number];

// Priority options
export const PRIORITY_OPTIONS = [
  'Low',
  'Normal',
  'High',
  'Critical',
] as const;

export type Priority = typeof PRIORITY_OPTIONS[number];

export const RISK_RATING_OPTIONS = [
  'low',
  'medium',
  'high',
] as const;

export type RiskRating = typeof RISK_RATING_OPTIONS[number];

export const STATUS_OPTIONS = [
  'active',
  'pending',
  'inactive',
  'suspended',
] as const;

export type Status = typeof STATUS_OPTIONS[number];

export const VERIFICATION_STATUS_OPTIONS = [
  'pending',
  'verified',
  'rejected',
  'under_review',
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUS_OPTIONS[number];

// Helper function to validate VAT number
export const validateVATNumber = (vatNumber: string): boolean => {
  // Saudi VAT number should be 15 digits
  return /^\d{15}$/.test(vatNumber);
};

// Helper function to validate email
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper function to validate IBAN
export const validateIBAN = (iban: string): boolean => {
  // Basic IBAN validation (Saudi IBAN starts with SA and has 24 characters)
  return /^SA\d{22}$/.test(iban.replace(/\s/g, ''));
};

// Helper function to format phone number
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Format as Saudi phone number if it starts with 966
  if (cleaned.startsWith('966')) {
    const number = cleaned.substring(3);
    if (number.length === 9) {
      return `+966 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
  }

  return phone;
};

// Helper function to format IBAN
export const formatIBAN = (iban: string): string => {
  // Remove all spaces and uppercase
  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  // Add spaces every 4 characters
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
};

// Helper function to generate customer reference
export const generateCustomerReference = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `CUST-${timestamp}-${random}`.toUpperCase();
};