export interface Customer {
  _id?: string; // MongoDB ID from backend
  id: string; // Transformed ID for frontend
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string;
  vatNumber?: string;
  companyName?: string;
  customerType?: 'company' | 'individual'; // Raw backend field
  type?: 'business' | 'individual'; // Transformed field for auto-selecting invoice type (B2B/B2C)
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  taxRate: number;
  category: string;
}

export interface LineItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  taxRate: number;
  vatCategoryCode: VatCategoryCode; // ZATCA VAT Category (S, Z, E, O)
  taxExemptionReasonCode?: TaxExemptionReasonCode; // Required for Z, E, O categories
  taxExemptionReasonText?: string; // Optional custom reason text
  amount: number;
  taxAmount: number;
  total: number;
}

// ZATCA E-Invoicing Data
export interface ZatcaInvoiceData {
  status: 'pending' | 'cleared' | 'reported' | 'rejected';
  uuid?: string;
  hash?: string;
  qrCode?: string;
  signedXML?: string;
  pdfUrl?: string;
  clearedAt?: string;
  reportedAt?: string;
  errors?: string[];
  warnings?: string[];
}

// ZATCA Invoice Type Codes
export type ZatcaInvoiceTypeCode =
  | 'SI'  // Simplified Tax Invoice (B2C)
  | 'CI'  // Tax Invoice (B2B)
  | 'SP'  // Simplified Prepayment (B2C)
  | 'CP'  // Prepayment (B2B)
  | 'SD'  // Simplified Debit Note (B2C)
  | 'CD'  // Tax Debit Note (B2B)
  | 'SN'  // Simplified Credit Note (B2C)
  | 'CN'  // Tax Credit Note (B2B)
  | '';

// ZATCA VAT Category Codes (as per E-Invoicing Guidelines)
export type VatCategoryCode =
  | 'S'   // Standard Rate (15%)
  | 'Z'   // Zero Rate
  | 'E'   // Exempt from VAT
  | 'O';  // Not Subject to VAT (Out of Scope)

// VAT Category Labels for UI
export const VAT_CATEGORY_OPTIONS: { code: VatCategoryCode; label: string; rate: number; requiresReason: boolean }[] = [
  { code: 'S', label: 'Standard Rate (15%)', rate: 15, requiresReason: false },
  { code: 'Z', label: 'Zero Rate (0%)', rate: 0, requiresReason: true },
  { code: 'E', label: 'Exempt from VAT', rate: 0, requiresReason: true },
  { code: 'O', label: 'Not Subject to VAT', rate: 0, requiresReason: true },
];

// ZATCA Tax Exemption Reason Codes
export type TaxExemptionReasonCode =
  | 'VATEX-SA-29'      // Financial services (Article 29)
  | 'VATEX-SA-29-7'    // Life insurance (Article 29)
  | 'VATEX-SA-30'      // Real estate transactions (Article 30)
  | 'VATEX-SA-32'      // Export of goods
  | 'VATEX-SA-33'      // Export of services
  | 'VATEX-SA-34-1'    // International transport of goods
  | 'VATEX-SA-34-2'    // International transport of passengers
  | 'VATEX-SA-34-3'    // Services related to transport
  | 'VATEX-SA-34-4'    // Supply of means of transport
  | 'VATEX-SA-34-5'    // Maintenance of means of transport
  | 'VATEX-SA-35'      // Medicines and medical equipment
  | 'VATEX-SA-36'      // Supplies to diplomats
  | 'VATEX-SA-EDU'     // Private education
  | 'VATEX-SA-HEA'     // Private healthcare
  | 'VATEX-SA-MLTRY'   // Qualified military goods
  | '';

// Tax Exemption Reason Options for UI
export const TAX_EXEMPTION_REASONS: { code: TaxExemptionReasonCode; label: string; applicableTo: VatCategoryCode[] }[] = [
  { code: 'VATEX-SA-29', label: 'Financial services (Article 29)', applicableTo: ['E'] },
  { code: 'VATEX-SA-29-7', label: 'Life insurance services (Article 29)', applicableTo: ['E'] },
  { code: 'VATEX-SA-30', label: 'Real estate transactions (Article 30)', applicableTo: ['E'] },
  { code: 'VATEX-SA-32', label: 'Export of goods', applicableTo: ['Z'] },
  { code: 'VATEX-SA-33', label: 'Export of services', applicableTo: ['Z'] },
  { code: 'VATEX-SA-34-1', label: 'International transport of goods', applicableTo: ['Z'] },
  { code: 'VATEX-SA-34-2', label: 'International transport of passengers', applicableTo: ['Z'] },
  { code: 'VATEX-SA-34-3', label: 'Services related to transport', applicableTo: ['Z'] },
  { code: 'VATEX-SA-34-4', label: 'Supply of means of transport', applicableTo: ['Z'] },
  { code: 'VATEX-SA-34-5', label: 'Maintenance of means of transport', applicableTo: ['Z'] },
  { code: 'VATEX-SA-35', label: 'Medicines and medical equipment', applicableTo: ['Z'] },
  { code: 'VATEX-SA-36', label: 'Supplies to diplomats and international organizations', applicableTo: ['Z'] },
  { code: 'VATEX-SA-EDU', label: 'Private education services', applicableTo: ['E'] },
  { code: 'VATEX-SA-HEA', label: 'Private healthcare services', applicableTo: ['E'] },
  { code: 'VATEX-SA-MLTRY', label: 'Qualified military goods', applicableTo: ['Z'] },
];

export interface InvoiceData {
  _id?: string; // MongoDB ID from backend
  id?: string; // Transformed ID for frontend
  invoiceNumber: string;
  invoiceType: 'standard' | 'simplified' | 'credit_note' | 'debit_note' | ''; // Customer type (B2B/B2C)
  zatcaInvoiceTypeCode: ZatcaInvoiceTypeCode; // ZATCA invoice type code
  isAdvancePayment?: boolean; // True for prepayment invoices (SP/CP type codes)
  issueDate: string;
  dueDate: string;
  currency: string;
  companyId: string;
  customerId: string;
  lineItems: LineItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  notes: string;
  termsAndConditions: string;
  paymentTerms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  zatca?: ZatcaInvoiceData;
}

export interface NewCustomerForm {
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

  // Invoicing Information - Contact Defaults

  // Selling Defaults
  defaultRevenueAccount: string;
  defaultRevenueCostCenter: string;
  defaultRevenueTaxRate: string;

  // Purchasing Defaults
  defaultExpenseAccount: string;
  defaultExpenseCostCenter: string;
  defaultExpenseTaxRate: string;

  // Payment Information (can be extended later if needed)
  // paymentMethods?: PaymentMethod[];
}

// Note: Beneficiary interface has been replaced with Customer interface above
// Banking/payment details are now handled separately in the backend

// Optional: Payment method interface for future use
export interface PaymentMethod {
  id: string;
  customerName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode?: string;
  currency: string;
  isPreferred: boolean;
}