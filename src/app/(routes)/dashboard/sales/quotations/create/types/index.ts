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
  type?: 'business' | 'individual'; // Transformed field for filtering
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
  amount: number;
  taxAmount: number;
  total: number;
}

export interface QuotationData {
  id?: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
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
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
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
