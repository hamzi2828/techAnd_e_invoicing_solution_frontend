export interface DebitNote {
  _id: string;
  id?: string;
  // Support both old and new field names
  debitNoteNumber?: string;
  invoiceNumber?: string;
  issueDate?: string;
  invoiceDate?: string;
  dueDate: string;
  debitNoteType?: 'standard' | 'simplified';
  invoiceType?: 'debit_note';
  paymentTerms?: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'refunded';
  total: number;
  currency: string;
  reason?: 'additional_charge' | 'price_adjustment' | 'correction' | 'service_fee' | 'other';
  reasonDescription?: string;
  customerInfo: {
    customerId: string;
  };
  companyId: string | {
    _id: string;
    companyName?: string;
    companyNameAr?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      district?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    taxIdNumber?: string;
    vatNumber?: string;
  };
  customerId: string | {
    _id: string;
    customerName?: string;
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
  };
  // Reference to original invoice
  originalInvoiceId?: string | {
    _id: string;
    invoiceNumber: string;
  };
  subtotal: number;
  totalTax: number;
  paidAmount: number;
  remainingAmount: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  notes?: string;
  termsAndConditions?: string;
  items: DebitNoteItem[];
  zatca?: {
    uuid?: string;
    hash?: string;
    qrCode?: string;
    pdfUrl?: string;
    signedXML?: string;
    clearedAt?: string | Date;
    reportedAt?: string | Date;
    status?: 'pending' | 'cleared' | 'reported' | 'rejected';
    validationStatus?: 'valid' | 'invalid';
    lastValidatedAt?: string | Date;
    errors?: string[];
    warnings?: string[];
  };
}

// ZATCA VAT Category Codes
export type VatCategoryCode = 'S' | 'Z' | 'E' | 'O';

// ZATCA Tax Exemption Reason Codes
export type TaxExemptionReasonCode =
  | 'VATEX-SA-29' | 'VATEX-SA-29-7' | 'VATEX-SA-30' | 'VATEX-SA-32' | 'VATEX-SA-33'
  | 'VATEX-SA-34-1' | 'VATEX-SA-34-2' | 'VATEX-SA-34-3' | 'VATEX-SA-34-4' | 'VATEX-SA-34-5'
  | 'VATEX-SA-35' | 'VATEX-SA-36' | 'VATEX-SA-EDU' | 'VATEX-SA-HEA' | 'VATEX-SA-MLTRY' | '';

export interface DebitNoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  vatCategoryCode?: VatCategoryCode; // ZATCA VAT Category (S, Z, E, O)
  taxExemptionReasonCode?: TaxExemptionReasonCode; // Required for Z, E, O categories
  taxExemptionReasonText?: string; // Optional custom reason text
}

export interface DebitNoteFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DebitNoteStats {
  totalDebitNotes: number;
  draftDebitNotes: number;
  sentDebitNotes: number;
  paidDebitNotes: number;
  overdueDebitNotes: number;
  totalAmount: number;
  totalOutstanding: number;
  averageValue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationResponse {
  invoices?: DebitNote[];
  debitNotes?: DebitNote[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}
