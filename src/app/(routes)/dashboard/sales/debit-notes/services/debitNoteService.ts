import { DebitNote, DebitNoteFilters, DebitNoteStats, ApiResponse, PaginationResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const DEBIT_NOTES_ENDPOINT = `${API_BASE_URL}/api/debit-notes`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export class DebitNoteService {
  /**
   * Get all debit notes with pagination and filtering
   */
  static async getAllDebitNotes(filters?: DebitNoteFilters): Promise<{
    debitNotes: DebitNote[];
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

      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}?${searchParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PaginationResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch debit notes');
      }

      return {
        debitNotes: result.data.debitNotes || result.data.invoices || [],
        pagination: result.data.pagination || {
          current: 1,
          pages: 1,
          total: 0,
          limit: 10
        },
      };
    } catch (error) {
      console.error('Error fetching debit notes:', error);
      return {
        debitNotes: [],
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
   * Get debit note statistics
   */
  static async getDebitNoteStats(): Promise<DebitNoteStats> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ stats: DebitNoteStats }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch debit note stats');
      }

      return result.data.stats;
    } catch (error) {
      console.error('Error fetching debit note stats:', error);
      return {
        totalDebitNotes: 0,
        draftDebitNotes: 0,
        sentDebitNotes: 0,
        paidDebitNotes: 0,
        overdueDebitNotes: 0,
        totalAmount: 0,
        totalOutstanding: 0,
        averageValue: 0
      };
    }
  }

  /**
   * Get debit note by ID
   */
  static async getDebitNoteById(id: string): Promise<DebitNote | null> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ debitNote?: DebitNote; invoice?: DebitNote }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch debit note');
      }

      return result.data.debitNote || result.data.invoice || null;
    } catch (error) {
      console.error('Error fetching debit note by ID:', error);
      return null;
    }
  }

  /**
   * Send debit note
   */
  static async sendDebitNote(id: string): Promise<{
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
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/${id}/send`, {
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
      console.error('Error sending debit note:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send debit note' };
    }
  }

  /**
   * Validate debit note against ZATCA rules
   */
  static async validateDebitNote(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/${id}/zatca/validate`, {
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
      console.error('Error validating debit note:', error);
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: []
      };
    }
  }

  /**
   * Delete debit note
   */
  static async deleteDebitNote(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ message?: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting debit note:', error);
      return false;
    }
  }

  /**
   * Add payment to debit note
   */
  static async addPayment(id: string, paymentData: {
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/${id}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ message?: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error adding payment:', error);
      return false;
    }
  }

  /**
   * Update debit note status
   */
  static async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ message?: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating debit note status:', error);
      return false;
    }
  }

  /**
   * Create a new debit note
   */
  static async createDebitNote(debitNoteData: {
    companyId: string;
    customerId: string;
    debitNoteNumber?: string;
    debitNoteType?: string;
    issueDate?: string;
    dueDate?: string;
    currency?: string;
    paymentTerms?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
      discount?: number;
    }>;
    notes?: string;
    termsAndConditions?: string;
    reason: string; // 'additional_charge' | 'price_adjustment' | 'correction' | 'service_fee' | 'other'
    reasonDescription?: string;
    status?: string;
    originalInvoiceId?: string; // Reference to the original invoice
  }): Promise<{ success: boolean; debitNote?: DebitNote; message?: string }> {
    try {
      const response = await fetch(DEBIT_NOTES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(debitNoteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: result.success,
        debitNote: result.data?.debitNote,
        message: result.message
      };
    } catch (error) {
      console.error('Error creating debit note:', error);
      throw error;
    }
  }

  /**
   * Update an existing debit note
   */
  static async updateDebitNote(id: string, debitNoteData: {
    companyId?: string;
    customerId?: string;
    debitNoteType?: string;
    dueDate?: string;
    paymentTerms?: string;
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
  }): Promise<{ success: boolean; debitNote?: DebitNote; message?: string }> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(debitNoteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: result.success,
        debitNote: result.data?.debitNote,
        message: result.message
      };
    } catch (error) {
      console.error('Error updating debit note:', error);
      throw error;
    }
  }

  /**
   * Get all invoices for reference selection (for debit notes)
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
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const searchParams = new URLSearchParams();
      searchParams.append('limit', '100'); // Get more invoices for selection
      if (companyId) {
        searchParams.append('companyId', companyId);
      }
      // Only get sent/paid invoices (not draft) for reference
      // searchParams.append('status', 'sent');

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
   * Fetch next debit note number for a company
   */
  static async fetchNextDebitNoteNumber(companyId: string): Promise<string> {
    try {
      const response = await fetch(`${DEBIT_NOTES_ENDPOINT}/next-number/${companyId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data?.debitNoteNumber) {
        return result.data.debitNoteNumber;
      }

      // Fallback
      return `DN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error fetching next debit note number:', error);
      return `DN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    }
  }
}
