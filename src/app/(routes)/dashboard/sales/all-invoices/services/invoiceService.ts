import { Invoice, InvoiceFilters, InvoiceStats, ApiResponse, PaginationResponse } from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const INVOICES_ENDPOINT = `${API_BASE_URL}/api/invoices`;

// Utility function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export class InvoiceService {
  /**
   * Get all invoices with pagination and filtering
   */
  static async getAllInvoices(filters?: InvoiceFilters): Promise<{
    invoices: Invoice[];
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
      if (filters?.paymentStatus && filters.paymentStatus !== 'all') searchParams.append('paymentStatus', filters.paymentStatus);
      if (filters?.startDate) searchParams.append('startDate', filters.startDate);
      if (filters?.endDate) searchParams.append('endDate', filters.endDate);
      if (filters?.customerId) searchParams.append('customerId', filters.customerId);

      const response = await fetch(`${INVOICES_ENDPOINT}?${searchParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PaginationResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch invoices');
      }

      return {
        invoices: result.data.invoices || [],
        pagination: result.data.pagination || {
          current: 1,
          pages: 1,
          total: 0,
          limit: 10
        },
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Return empty data on error
      return {
        invoices: [],
        pagination: {
          current: 1,
          pages: 1,
          total: 0,
          limit: 10
        }
      };
    }
  }

  /**
   * Get invoice statistics
   */
  static async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ stats: InvoiceStats }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch invoice stats');
      }

      return result.data.stats;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      // Return default stats on error
      return {
        totalInvoices: 0,
        draftInvoices: 0,
        sentInvoices: 0,
        paidInvoices: 0,
        overdueInvoices: 0,
        totalRevenue: 0,
        totalOutstanding: 0,
        averageInvoiceValue: 0
      };
    }
  }

  /**
   * Get invoice by ID
   */
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      console.log('Fetching invoice from:', `${INVOICES_ENDPOINT}/${id}`);
      const response = await fetch(`${INVOICES_ENDPOINT}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.error('Invoice not found (404)');
          return null;
        }
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ invoice: Invoice }> = await response.json();
      console.log('API result:', result);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch invoice');
      }

      return result.data.invoice;
    } catch (error) {
      console.error('Error fetching invoice by ID:', error);
      return null;
    }
  }

  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(id: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ invoice?: Invoice }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return false;
    }
  }

  /**
   * Send invoice
   */
  static async sendInvoice(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${id}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ message?: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending invoice:', error);
      return false;
    }
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ message?: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  /**
   * Add payment to invoice
   */
  static async addPayment(id: string, paymentData: {
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${id}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ payment?: { amount: number; date: Date } }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error adding payment:', error);
      return false;
    }
  }

  /**
   * Update invoice
   */
  static async updateInvoice(id: string, invoiceData: any): Promise<boolean> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        console.error('Update invoice error:', errorResult);
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ invoice?: Invoice }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating invoice:', error);
      return false;
    }
  }

  /**
   * Validate invoice against ZATCA rules (without submitting)
   */
  static async validateInvoice(id: string): Promise<{
    success: boolean;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    message?: string;
  }> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${id}/zatca/validate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      // Handle HTTP errors
      if (!response.ok) {
        return {
          success: false,
          isValid: false,
          errors: result.errors || result.data?.errors || [result.message || 'Validation failed'],
          warnings: result.data?.warnings || [],
          message: result.message
        };
      }

      // Handle business logic errors (success: false with 200 status)
      if (!result.success) {
        return {
          success: false,
          isValid: false,
          errors: result.data?.errors || [result.message || 'Validation failed'],
          warnings: result.data?.warnings || [],
          message: result.message
        };
      }

      return {
        success: true,
        isValid: result.data?.isValid ?? false,
        errors: result.data?.errors || [],
        warnings: result.data?.warnings || [],
        message: result.message
      };
    } catch (error) {
      console.error('Error validating invoice:', error);
      return {
        success: false,
        isValid: false,
        errors: ['Failed to connect to validation service'],
        warnings: []
      };
    }
  }
}