import { Product } from '../../products/types';
import { CustomerDetails } from '../../customers/types';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface POSOrder {
  id?: string;
  orderNumber?: string;
  customerId?: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit';

export interface POSCategory {
  id: string;
  name: string;
  icon?: string;
  productsCount?: number;
}

export interface POSProduct extends Product {
  // Extended product for POS-specific needs
}

export interface POSCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'business';
}

export interface POSState {
  products: POSProduct[];
  categories: POSCategory[];
  customers: POSCustomer[];
  cart: CartItem[];
  selectedCustomer: POSCustomer | null;
  selectedCategory: string;
  searchTerm: string;
  discountPercent: number;
  paymentMethod: PaymentMethod;
  isLoading: boolean;
  error: string | null;
}

export interface OrderSummary {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}
