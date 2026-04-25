import { CreditNote, CreditNoteFilters, CreditNoteStats, ApiResponse, PaginationResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const CREDIT_NOTES_ENDPOINT = `${API_BASE_URL}/api/credit-notes`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export class CreditNoteService {
  /**
   * Get all credit notes with pagination and filtering
   */
  static async getAllCreditNotes(filters?: CreditNoteFilters): Promise<{
    creditNotes: CreditNote[];
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

      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}?${searchParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PaginationResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch credit notes');
      }

      return {
        creditNotes: result.data.creditNotes || result.data.invoices || [],
        pagination: result.data.pagination || {
          current: 1,
          pages: 1,
          total: 0,
          limit: 10
        },
      };
    } catch (error) {
      console.error('Error fetching credit notes:', error);
      return {
        creditNotes: [],
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
   * Get credit note statistics
   */
  static async getCreditNoteStats(): Promise<CreditNoteStats> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ stats: CreditNoteStats }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch credit note stats');
      }

      return result.data.stats;
    } catch (error) {
      console.error('Error fetching credit note stats:', error);
      return {
        totalCreditNotes: 0,
        draftCreditNotes: 0,
        sentCreditNotes: 0,
        paidCreditNotes: 0,
        overdueCreditNotes: 0,
        totalAmount: 0,
        totalOutstanding: 0,
        averageValue: 0
      };
    }
  }

  /**
   * Get credit note by ID
   */
  static async getCreditNoteById(id: string): Promise<CreditNote | null> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ creditNote?: CreditNote; invoice?: CreditNote }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch credit note');
      }

      return result.data.creditNote || result.data.invoice || null;
    } catch (error) {
      console.error('Error fetching credit note by ID:', error);
      return null;
    }
  }

  /**
   * Send credit note
   */
  static async sendCreditNote(id: string): Promise<{
    success: boolean;
    message?: string;
    phase?: number;
    zatca?: {
      status?: string;
      uuid?: string;
      qrCode?: string;
      pdfUrl?: string;
    };
  }> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/${id}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
        phase: result.data?.phase,
        zatca: result.data?.zatca
      };
    } catch (error) {
      console.error('Error sending credit note:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send credit note' };
    }
  }

  /**
   * Validate credit note against ZATCA rules
   */
  static async validateCreditNote(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/${id}/zatca/validate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          isValid: false,
          errors: errorData.errors || [errorData.message || 'Validation failed'],
          warnings: []
        };
      }

      const result = await response.json();

      if (result.success && result.data) {
        return {
          isValid: result.data.isValid,
          errors: result.data.errors || [],
          warnings: result.data.warnings || []
        };
      }

      return {
        isValid: false,
        errors: ['Unexpected response format'],
        warnings: []
      };
    } catch (error) {
      console.error('Error validating credit note:', error);
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: []
      };
    }
  }

  /**
   * Delete credit note
   */
  static async deleteCreditNote(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ message?: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting credit note:', error);
      return false;
    }
  }

  /**
   * Apply credit note to an invoice
   */
  static async applyCreditNote(creditNoteId: string, invoiceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/${creditNoteId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ message?: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error applying credit note:', error);
      return false;
    }
  }

  /**
   * Create a new credit note
   */
  static async createCreditNote(creditNoteData: {
    companyId: string;
    customerId: string;
    creditNoteNumber?: string;
    issueDate?: string;
    currency?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
      discount?: number;
    }>;
    notes?: string;
    termsAndConditions?: string;
    reason: string; // 'return' | 'discount' | 'correction' | 'cancellation' | 'other'
    reasonDescription?: string;
    status?: string;
    originalInvoiceId?: string; // Reference to the original invoice
  }): Promise<{ success: boolean; creditNote?: CreditNote; message?: string }> {
    try {
      const response = await fetch(CREDIT_NOTES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(creditNoteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: result.success,
        creditNote: result.data?.creditNote,
        message: result.message
      };
    } catch (error) {
      console.error('Error creating credit note:', error);
      throw error;
    }
  }

  /**
   * Update an existing credit note
   */
  static async updateCreditNote(id: string, creditNoteData: {
    companyId?: string;
    customerId?: string;
    items?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
      discount?: number;
    }>;
    notes?: string;
    termsAndConditions?: string;
    reason?: string;
  }): Promise<{ success: boolean; creditNote?: CreditNote; message?: string }> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(creditNoteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: result.success,
        creditNote: result.data?.creditNote,
        message: result.message
      };
    } catch (error) {
      console.error('Error updating credit note:', error);
      throw error;
    }
  }

  /**
   * Get all invoices for reference selection (for credit notes)
   */
  static async getInvoicesForReference(companyId?: string): Promise<{
    invoices: Array<{
      _id: string;
      id?: string;
      invoiceNumber: string;
      invoiceDate: string;
      dueDate: string;
      invoiceType?: string;
      status: string;
      paymentStatus: string;
      total: number;
      currency: string;
      subtotal: number;
      totalTax: number;
      notes?: string;
      termsAndConditions?: string;
      paymentTerms?: string;
      companyId: string | { _id: string; companyName?: string };
      customerId: string | {
        _id: string;
        customerName?: string;
        name?: string;
        email?: string;
        phone?: string;
        contactInfo?: { email?: string; phone?: string; contactPerson?: string };
        address?: {
          street?: string;
          city?: string;
          state?: string;
          postalCode?: string;
          country?: string;
        };
        type?: string;
        customerType?: string;
      };
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        taxRate: number;
        taxAmount: number;
        discount?: number;
      }>;
    }>;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('limit', '100');
      if (companyId) {
        searchParams.append('companyId', companyId);
      }

      const response = await fetch(`${API_BASE_URL}/api/invoices?${searchParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch invoices');
      }

      return {
        invoices: result.data.invoices || [],
      };
    } catch (error) {
      console.error('Error fetching invoices for reference:', error);
      return { invoices: [] };
    }
  }

  /**
   * Fetch next credit note number for a company
   */
  static async fetchNextCreditNoteNumber(companyId: string): Promise<string> {
    try {
      const response = await fetch(`${CREDIT_NOTES_ENDPOINT}/next-number/${companyId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data?.creditNoteNumber) {
        return result.data.creditNoteNumber;
      }

      // Fallback
      return `CN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error fetching next credit note number:', error);
      return `CN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    }
  }
}
