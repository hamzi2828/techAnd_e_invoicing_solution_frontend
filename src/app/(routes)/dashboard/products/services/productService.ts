import {
  Product,
  ProductFormData,
  ProductStats,
  BackendProductData,
  PaginationData,
  ApiResponse
} from '../types';
import { getAuthHeader } from '@/helper/helper';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`;

// Transform backend product to frontend format
function transformProduct(backendProduct: BackendProductData): Product {
  // Handle category - provide default if null/undefined
  const category = backendProduct.category ? {
    id: backendProduct.category._id,
    name: backendProduct.category.name,
    icon: backendProduct.category.icon
  } : {
    id: 'uncategorized',
    name: 'Uncategorized',
    icon: '📦'
  };

  return {
    id: backendProduct._id,
    name: backendProduct.name,
    description: backendProduct.description,
    shortDescription: backendProduct.shortDescription,
    sku: backendProduct.sku,
    slug: backendProduct.slug,
    category: category,
    subcategory: backendProduct.subcategory ? {
      id: backendProduct.subcategory._id,
      name: backendProduct.subcategory.name
    } : undefined,
    price: backendProduct.price,
    costPrice: backendProduct.costPrice,
    unit: backendProduct.unit,
    taxRate: backendProduct.taxRate,
    stock: backendProduct.stock,
    minStock: backendProduct.minStock,
    maxStock: backendProduct.maxStock,
    barcode: backendProduct.barcode,
    status: backendProduct.status,
    tags: backendProduct.tags,
    weight: backendProduct.weight,
    dimensions: backendProduct.dimensions,
    images: backendProduct.images,
    attributes: backendProduct.attributes,
    createdAt: new Date(backendProduct.createdAt).toISOString().split('T')[0],
    updatedAt: new Date(backendProduct.updatedAt).toISOString().split('T')[0]
  };
}

class ProductService {
  /**
   * Get all products
   */
  static async getProducts(filters?: {
    status?: string;
    category?: string;
    subcategory?: string;
    search?: string;
    stockStatus?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; pagination?: PaginationData }> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.subcategory) queryParams.append('subcategory', filters.subcategory);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.stockStatus) queryParams.append('stockStatus', filters.stockStatus);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));

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

      const result: ApiResponse<BackendProductData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      const products = result.data?.map(transformProduct) || [];

      return {
        products,
        pagination: result.pagination
      };

    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  static async getProductStats(): Promise<ProductStats> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${PRODUCTS_ENDPOINT}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch product stats (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<ProductStats> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch product statistics');
      }

      return result.data;

    } catch (error) {
      console.error('Error fetching product stats:', error);
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

      const result: ApiResponse<BackendProductData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch product');
      }

      return transformProduct(result.data);

    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      // Transform frontend data to backend format
      const backendData = {
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription,
        sku: productData.sku,
        category: productData.category,
        subcategory: productData.subcategory || null,
        price: productData.price,
        costPrice: productData.costPrice,
        unit: productData.unit,
        taxRate: productData.taxRate,
        stock: productData.stock,
        minStock: productData.minStock || 0,
        maxStock: productData.maxStock || 1000,
        barcode: productData.barcode,
        status: productData.status,
        tags: productData.tags,
        weight: productData.weight,
        dimensions: productData.dimensions,
        attributes: productData.attributes,
        // Note: Images will need to be uploaded separately via file upload endpoint
        images: []
      };

      const response = await fetch(PRODUCTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create product (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendProductData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to create product');
      }

      return transformProduct(result.data);

    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  static async updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<Product> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update product (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendProductData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update product');
      }

      return transformProduct(result.data);

    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete product (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<null> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete product');
      }

    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts(limit: number = 10): Promise<Product[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${PRODUCTS_ENDPOINT}/low-stock?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch low stock products (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendProductData[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch low stock products');
      }

      return result.data.map(transformProduct);

    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  /**
   * Update product stock
   */
  static async updateStock(productId: string, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set'): Promise<Product> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ quantity, operation })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update stock (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<BackendProductData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update stock');
      }

      return transformProduct(result.data);

    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  /**
   * Bulk delete products
   */
  static async bulkDeleteProducts(productIds: string[]): Promise<{ deletedCount: number }> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${PRODUCTS_ENDPOINT}/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ productIds })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to bulk delete products (${response.status}): ${errorText}`);
      }

      const result: ApiResponse<{ deletedCount: number }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to bulk delete products');
      }

      return result.data;

    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  }
}

export default ProductService;
