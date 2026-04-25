import {
  CustomerDetails,
  CustomerData,
  CustomerStats,
  ApiResponse,
  PaginationResponse,
  CustomerFilters,
  CustomerFormData,
} from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const CUSTOMERS_ENDPOINT = `${API_BASE_URL}/api/customers`;


// Utility function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token'); // Adjust based on your auth implementation
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Interface for customer metrics
interface CustomerMetrics {
  totalOrders?: number;
  lastOrderDate?: string | null;
  totalInvoices?: number;
  totalRevenue?: number;
  averageInvoiceValue?: number;
  // Add other metric fields as needed
}

// Transform backend customer data to detailed customer interface for customers page
function transformCustomerDetails(customerData: CustomerData, metrics?: CustomerMetrics): CustomerDetails {
  // Get contact info from either contactInfo object or direct properties
  const email = customerData.contactInfo?.email || '';
  const phone = customerData.contactInfo?.phone || '';
  const address = customerData.address?.street || '';
  const city = customerData.address?.city || '';
  const country = customerData.address?.country || customerData.country || '';
  const taxNumber = customerData.complianceInfo?.taxId || '';
  const isCompany = customerData.customerType === 'company' || customerData.customerType === 'organization';
  
  return {
    // Base Customer interface fields
    id: customerData._id,
    name: customerData.customerName,
    email,
    phone,
    address,
    city,
    country,
    taxNumber,
    companyName: isCompany ? customerData.customerName : '',
    
    // Extended CustomerDetails fields
    vatNumber: taxNumber, // Using taxId as VAT number if available
    type: customerData.customerType === 'individual' ? 'individual' : 'business',
    status: customerData.isActive ? 'active' : 'inactive',
    totalInvoices: metrics?.totalInvoices || 0,
    totalRevenue: metrics?.totalRevenue || 0,
    averageInvoiceValue: metrics?.averageInvoiceValue || 0,
    lastInvoiceDate: metrics?.lastOrderDate || null,
    
    // Additional fields from CustomerData
    createdAt: customerData.createdAt,
    updatedAt: customerData.updatedAt,
    bankName: customerData.bankName,
    accountNumber: customerData.accountNumber,
    iban: customerData.iban,
    swiftCode: customerData.swiftCode,
    currency: customerData.currency,
    businessLicense: customerData.complianceInfo?.businessLicense,
    verificationStatus: customerData.verificationStatus,
    isActive: customerData.isActive,
  };
}

export class CustomerService {
  /**
   * Get all customers with pagination and filtering
   */
  static async getAllCustomers(filters?: CustomerFilters): Promise<{
    customers: CustomerDetails[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (filters?.page) searchParams.append('page', filters.page.toString());
      if (filters?.limit) searchParams.append('limit', filters.limit.toString());
      if (filters?.search) searchParams.append('search', filters.search);
      if (filters?.status && filters.status !== 'all') searchParams.append('status', filters.status);
      if (filters?.type && filters.type !== 'all') searchParams.append('customerType', filters.type);

      const response = await fetch(`${CUSTOMERS_ENDPOINT}?${searchParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PaginationResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch customers');
      }

      return {
        customers: result.data.customers.map(customer => transformCustomerDetails(customer)),
        pagination: result.data.pagination,
      };
    } catch (error) {
      console.error('Error fetching all customers:', error);
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(): Promise<CustomerStats> {
    try {
      const response = await fetch(`${CUSTOMERS_ENDPOINT}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ stats: CustomerStats }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch customer stats');
      }

      return result.data.stats;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID with detailed information
   */
  static async getCustomerById(id: string): Promise<any | null> {
    try {
      const response = await fetch(`${CUSTOMERS_ENDPOINT}/${id}/details`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ customer: CustomerData }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch customer');
      }

      // Return the entire result so frontend can extract customer data
      return result;
    } catch (error) {
      console.error('Error fetching customer by ID:', error);
      throw error;
    }
  }

  /**
   * Update customer status
   */
  static async updateCustomerStatus(id: string, status: string): Promise<CustomerDetails | null> {
    try {
      const response = await fetch(`${CUSTOMERS_ENDPOINT}/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ customer: CustomerData }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update customer status');
      }

      return transformCustomerDetails(result.data.customer);
    } catch (error) {
      console.error('Error updating customer status:', error);
      throw error;
    }
  }

  /**
   * Delete customer
   */
  static async deleteCustomer(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${CUSTOMERS_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ success: boolean }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  }

  /**
   * Export customers
   */
  static async exportCustomers(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`${CUSTOMERS_ENDPOINT}/export?format=${format}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw error;
    }
  }

  /**
   * Search customers
   */
  static async searchCustomers(query: string, filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    customers: CustomerDetails[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }> {
    try {
      const searchParams = new URLSearchParams({ q: query });
      if (filters?.status) searchParams.append('status', filters.status);
      if (filters?.type) searchParams.append('type', filters.type);
      if (filters?.page) searchParams.append('page', filters.page.toString());
      if (filters?.limit) searchParams.append('limit', filters.limit.toString());

      const response = await fetch(`${CUSTOMERS_ENDPOINT}/search?${searchParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PaginationResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to search customers');
      }

      return {
        customers: result.data.customers.map(customer => transformCustomerDetails(customer)),
        pagination: result.data.pagination,
      };
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  static async bulkUpdateStatus(customerIds: string[], status: string): Promise<boolean> {
    try {
      const response = await fetch(`${CUSTOMERS_ENDPOINT}/bulk/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ customerIds, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ success: boolean }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error bulk updating customer status:', error);
      return false;
    }
  }

  static async bulkDelete(customerIds: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${CUSTOMERS_ENDPOINT}/bulk/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ customerIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ success: boolean }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error bulk deleting customers:', error);
      return false;
    }
  }

  /**
   * Add new customer
   */
  static async addCustomer(customerData: any): Promise<CustomerDetails> {
    try {
      // Transform form data to backend format
      const transformedData = {
        customerName: customerData.customerName,
        customerType: customerData.customerType === 'business' ? 'company' : customerData.customerType,

        // Basic Information
        commercialRegistrationNumber: customerData.commercialRegistrationNumber,
        industry: customerData.industry,
        website: customerData.website,
        customerGroup: customerData.customerGroup,

        contactInfo: {
          email: customerData.email,
          phone: customerData.phone,
          contactPerson: customerData.contactPerson,
        },
        address: {
          street: customerData.streetAddress || customerData.address,
          city: customerData.city,
          state: customerData.state,
          postalCode: customerData.postalCode,
          country: customerData.country === 'Saudi Arabia' ? 'SA' : customerData.country,
          buildingNumber: customerData.buildingNumber,
          district: customerData.district,
          addressAdditionalNumber: customerData.addressAdditionalNumber,
        },
        complianceInfo: {
          taxId: customerData.taxNumber || customerData.vatNumber || customerData.taxId,
          riskRating: customerData.riskRating,
          sanctionScreened: customerData.sanctionScreened,
        },

        // Banking Information
        bankInfo: {
          bankName: customerData.bankName || 'Not specified',
          accountNumber: customerData.accountNumber || '',
          iban: customerData.iban || '',
          swiftCode: customerData.swiftCode || '',
          currency: customerData.currency || 'SAR',
        },

        // Payment Limits
        paymentLimits: {
          dailyLimit: customerData.dailyLimit || '0',
          monthlyLimit: customerData.monthlyLimit || '0',
          perTransactionLimit: customerData.perTransactionLimit || '0',
        },

        // Additional Information
        notes: customerData.notes || '',
        tags: customerData.tags || [],
        referenceNumber: customerData.referenceNumber || '',
        source: customerData.source || '',
        assignedTo: customerData.assignedTo || '',
        priority: customerData.priority || 'Normal',

        country: customerData.country === 'Saudi Arabia' ? 'SA' : customerData.country,
        status: customerData.status || 'active',
        verificationStatus: customerData.verificationStatus || 'pending',
        isActive: customerData.isActive !== undefined ? customerData.isActive : true,
      };

      const response = await fetch(CUSTOMERS_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        // For validation errors, include the errors array in the message
        if (errorResult.errors && Array.isArray(errorResult.errors)) {
          const errorMessage = `${errorResult.message}: ${errorResult.errors.join(', ')}`;
          const error = new Error(errorMessage) as any;
          error.validationErrors = errorResult.errors;
          throw error;
        }
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ customer: CustomerData }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to add customer');
      }

      return transformCustomerDetails(result.data.customer);
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }

  /**
   * Update existing customer
   */
  static async updateCustomer(id: string, customerData: any): Promise<any> {
    try {
      console.log('CustomerService updateCustomer received data:', customerData);

      // The customerData is already in the correct structured format from frontend
      // Just pass it directly to the backend
      const transformedData = customerData;

      console.log('Transformed data being sent to backend:', transformedData);
      console.log('Compliance info specifically:', transformedData.complianceInfo);

      const response = await fetch(`${CUSTOMERS_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        // For validation errors, include the errors array in the message
        if (errorResult.errors && Array.isArray(errorResult.errors)) {
          const errorMessage = `${errorResult.message}: ${errorResult.errors.join(', ')}`;
          const error = new Error(errorMessage) as any;
          error.validationErrors = errorResult.errors;
          throw error;
        }
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ customer: CustomerData }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update customer');
      }

      return result.data.customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }
}