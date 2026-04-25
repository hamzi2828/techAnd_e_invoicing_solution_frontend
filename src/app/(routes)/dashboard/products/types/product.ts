// Frontend product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  slug: string;
  category: {
    id: string;
    name: string;
    icon?: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  price: number;
  costPrice: number;
  unit: string;
  taxRate: number;
  stock: number;
  minStock: number;
  maxStock: number;
  barcode: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: Array<{
    url: string;
    filename: string;
    isPrimary: boolean;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Product form data interface
export interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  category: string;
  subcategory: string;
  price: number;
  costPrice: number;
  unit: string;
  taxRate: number;
  stock: number;
  status: 'active' | 'inactive';
  tags: string[];
  barcode: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: File[];
  attributes: Array<{ name: string; value: string }>;
  // Optional fields (not shown in UI but needed for backend)
  minStock?: number;
  maxStock?: number;
}

// Product statistics interface
export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalValue: number;
  totalCategories: number;
}

// Backend product data structure (for API responses)
export interface BackendProductData {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  slug: string;
  category: {
    _id: string;
    name: string;
    icon?: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  price: number;
  costPrice: number;
  unit: string;
  taxRate: number;
  stock: number;
  minStock: number;
  maxStock: number;
  barcode: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: Array<{
    url: string;
    filename: string;
    isPrimary: boolean;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Pagination interface
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API Response interface
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationData;
}