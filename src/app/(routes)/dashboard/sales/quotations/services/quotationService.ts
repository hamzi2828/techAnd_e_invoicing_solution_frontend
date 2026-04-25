// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const QUOTATIONS_ENDPOINT = `${API_BASE_URL}/api/quotations`;

// Utility function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export interface QuotationListItem {
  _id?: string;
  id?: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';
  total: number;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationStats {
  totalQuotations: number;
  totalValue: number;
  draftCount: number;
  sentCount: number;
  acceptedCount: number;
  rejectedCount: number;
  expiredCount: number;
  convertedCount: number;
}

export class QuotationListService {
  /**
   * Get all quotations with filters
   */
  static async getQuotations(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    quotations: QuotationListItem[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const url = `${QUOTATIONS_ENDPOINT}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch quotations');
      }

      return {
        success: true,
        quotations: result.data.quotations || [],
        pagination: result.data.pagination
      };
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return {
        success: false,
        quotations: []
      };
    }
  }

  /**
   * Get quotation statistics
   */
  static async getQuotationStats(): Promise<QuotationStats> {
    try {
      const response = await fetch(`${QUOTATIONS_ENDPOINT}/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch statistics');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching quotation stats:', error);
      return {
        totalQuotations: 0,
        totalValue: 0,
        draftCount: 0,
        sentCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        expiredCount: 0,
        convertedCount: 0
      };
    }
  }

  /**
   * Delete a quotation
   */
  static async deleteQuotation(quotationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${QUOTATIONS_ENDPOINT}/${quotationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: result.success,
        message: result.message || 'Quotation deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  }

  /**
   * Send a quotation
   */
  static async sendQuotation(quotationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${QUOTATIONS_ENDPOINT}/${quotationId}/send`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: result.success,
        message: result.message || 'Quotation sent successfully'
      };
    } catch (error) {
      console.error('Error sending quotation:', error);
      throw error;
    }
  }

  /**
   * Convert quotation to invoice
   */
  static async convertToInvoice(quotationId: string): Promise<{ success: boolean; message: string; invoiceId?: string }> {
    try {
      const response = await fetch(`${QUOTATIONS_ENDPOINT}/${quotationId}/convert`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: result.success,
        message: result.message || 'Quotation converted to invoice successfully',
        invoiceId: result.data?.invoice?._id || result.data?.invoice?.id
      };
    } catch (error) {
      console.error('Error converting quotation:', error);
      throw error;
    }
  }
}
