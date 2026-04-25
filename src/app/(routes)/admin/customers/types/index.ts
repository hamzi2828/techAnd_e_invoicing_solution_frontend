// Customer types specific to the customers page module

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string;
  companyName?: string;
}

// Extended customer interface for customers page with additional fields
export interface CustomerDetails extends Customer {
  vatNumber?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive';
  totalInvoices: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  lastInvoiceDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Banking info
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  currency?: string;
  // Compliance
  businessLicense?: string;
  verificationStatus?: string;
  isActive: boolean;
}

// Type aliases for clarity
export type CustomerType = 'individual' | 'business';
export type CustomerStatus = 'active' | 'inactive';

// Backend customer data interface
export interface CustomerData {
  _id: string;
  customerName: string;
  customerType: 'individual' | 'company' | 'organization';
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode?: string;
  currency: string;
  country: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    contactPerson?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  complianceInfo?: {
    taxId?: string;
    businessLicense?: string;
  };
  status: string;
  verificationStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginationResponse {
  customers: CustomerData[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Customer statistics
export interface CustomerStats {
  total: number;
  active: number;
  pending: number;
  verified: number;
  individuals: number;
  companies: number;
  totalPaymentsValue: number;
  averagePaymentValue: number;
}

// Filter and search types
export interface CustomerFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  type?: 'all' | 'individual' | 'company';
  page?: number;
  limit?: number;
}

// Action types for customer operations
export type CustomerAction = 'view' | 'edit' | 'delete' | 'activate' | 'deactivate';

// Bulk operation types
export interface BulkOperation {
  type: 'delete' | 'activate' | 'deactivate';
  customerIds: string[];
}

// Export options
export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  filters?: CustomerFilters;
  fields?: string[];
}

// Form data for customer creation/editing
export interface CustomerFormData {
  // Contact Information
  name: string;
  email: string;
  phone: string;

  // Business and VAT Treatment
  companyName: string;
  country: string;
  taxNumber: string;

  // Address Information
  address: string;
  city: string;
  streetAddress: string;
  buildingNumber: string;
  district: string;
  addressAdditionalNumber: string;
  postalCode: string;

  // Banking Information
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  currency?: string;

  // Compliance
  riskRating?: 'low' | 'medium' | 'high';
  sanctionScreened?: boolean;

  // Status
  status?: string;
  verificationStatus?: string;
  isActive: boolean;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Hook state types
export interface UseCustomersState {
  customers: CustomerDetails[];
  stats: CustomerStats;
  selectedCustomers: string[];
  filters: CustomerFilters;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Hook actions
export interface UseCustomersActions {
  loadCustomers: () => Promise<void>;
  loadStats: () => Promise<void>;
  searchCustomers: (query: string) => void;
  setFilters: (filters: Partial<CustomerFilters>) => void;
  selectCustomer: (id: string) => void;
  selectAllCustomers: () => void;
  clearSelection: () => void;
  deleteCustomer: (id: string) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
  updateCustomerStatus: (id: string, status: string) => Promise<boolean>;
  exportCustomers: (options: ExportOptions) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Additional type exports
export interface ContactInfo {
  email?: string;
  phone?: string;
  contactPerson?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ComplianceInfo {
  taxId?: string;
  businessLicense?: string;
}

export interface Metrics {
  totalInvoices: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  lastInvoiceDate: string | null;
}

// Export all types from addTypes
export type {
  FormData,
  Contact,
  BankAccount,
  Document,
  SettingsData,
  CreditData,
  CustomerTypeSelectorProps,
  BasicInformationFormProps,
  AddressInformationFormProps,
  ContactPersonsFormProps,
  BankingInformationFormProps,
  CustomerSettingsProps,
  CreditLimitsFormProps,
  DocumentsUploadProps,
  ComplianceFormProps,
  PaymentLimitsFormProps,
  CreateCustomerPayload,
  ValidationError,
  Industry,
  CustomerGroup,
  Country,
  CurrencyCode,
  PaymentTerms,
  Department,
  AccountType,
  Bank,
  Source,
  Priority
} from './addTypes';

// Export constants and helpers from addTypes
export {
  INDUSTRY_OPTIONS,
  CUSTOMER_GROUP_OPTIONS,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  DEPARTMENT_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  BANK_OPTIONS,
  SOURCE_OPTIONS,
  PRIORITY_OPTIONS,
  RISK_RATING_OPTIONS,
  STATUS_OPTIONS,
  VERIFICATION_STATUS_OPTIONS,
  validateVATNumber,
  validateEmail,
  validateIBAN,
  formatPhoneNumber,
  formatIBAN,
  generateCustomerReference
} from './addTypes';