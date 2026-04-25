import { Product } from '../types';
import { getAuthHeader } from '@/helper/helper';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`;

// Backend product interface (full structure from database)
interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
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
  costPrice?: number;
  unit: string;
  taxRate: number;
  stock: number;
  status: string;
  barcode?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

/**
 * Transform backend product to simplified invoice Product format
 */
function transformProductForInvoice(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct._id,
    name: backendProduct.name,
    description: backendProduct.description || backendProduct.shortDescription || '',
    price: backendProduct.price,
    unit: backendProduct.unit,
    taxRate: backendProduct.taxRate,
    category: backendProduct.category.name,
  };
}

export class ProductService {
  /**
   * Search products by name or SKU
   * Used for autocomplete in invoice line items
   */
  static async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      // Only search if query is provided
      if (!query || query.trim().length === 0) {
        return [];
      }

      const queryParams = new URLSearchParams({
        search: query.trim(),
        limit: String(limit),
        status: 'active', // Only show active products
        sortBy: 'name',
        sortOrder: 'asc'
      });

      const response = await fetch(`${PRODUCTS_ENDPOINT}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Product search failed:', errorText);
        // Return empty array instead of throwing to prevent UI disruption
        return [];
      }

      const result: ApiResponse<BackendProduct[]> = await response.json();

      if (!result.success || !result.data) {
        console.error('Product search returned no data');
        return [];
      }

      // Transform backend products to invoice Product format
      return result.data.map(transformProductForInvoice);

    } catch (error) {
      console.error('Error searching products:', error);
      // Return empty array to prevent UI disruption
      return [];
    }
  }

  /**
   * Get all active products (for dropdown/selection)
   */
  static async getActiveProducts(limit: number = 50): Promise<Product[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const queryParams = new URLSearchParams({
        status: 'active',
        limit: String(limit),
        sortBy: 'name',
        sortOrder: 'asc'
      });

      const response = await fetch(`${PRODUCTS_ENDPOINT}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch products (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendProduct[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      return result.data.map(transformProductForInvoice);

    } catch (error) {
      console.error('Error fetching active products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: string): Promise<Product> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch product (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendProduct> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch product');
      }

      return transformProductForInvoice(result.data);

    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categoryId: string, limit: number = 50): Promise<Product[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const queryParams = new URLSearchParams({
        category: categoryId,
        status: 'active',
        limit: String(limit),
        sortBy: 'name',
        sortOrder: 'asc'
      });

      const response = await fetch(`${PRODUCTS_ENDPOINT}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch products (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendProduct[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      return result.data.map(transformProductForInvoice);

    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }
}

export default ProductService;
