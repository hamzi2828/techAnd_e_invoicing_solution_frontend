export interface Invoice {
  _id: string;
  id?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  invoiceType?: 'standard' | 'proforma' | 'recurring' | 'credit_note' | 'debit_note';
  paymentTerms?: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  total: number;
  currency: string;
  customerInfo: {
    customerId: string;  // Reference to Customer model
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
  subtotal: number;
  totalTax: number;
  paidAmount: number;
  remainingAmount: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  notes?: string;
  termsAndConditions?: string;
  items: InvoiceItem[];
  zatca?: {
    status?: 'cleared' | 'reported' | 'pending';
    uuid?: string;
    hash?: string;
    qrCode?: string;
    pdfUrl?: string;
    signedXML?: string;
    clearedAt?: string | Date;
    errors?: string[];
    warnings?: string[];
    validationStatus?: 'pending' | 'valid' | 'invalid';
    lastValidatedAt?: string | Date;
    // Hash chain tracking
    hashChainNumber?: number;
    previousInvoiceHash?: string;
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
}

export interface InvoiceFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceStats {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalOutstanding: number;
  averageInvoiceValue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationResponse {
  invoices: Invoice[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}