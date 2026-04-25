// src/app/(routes)/admin/company/bank-accounts/services/bankAccountService.ts
import { BankAccount, BankAccountForm } from '../types';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: {
    accounts: T[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalRecords: number;
    };
  };
}

export interface BankAccountFilters {
  status?: 'all' | 'active' | 'inactive' | 'pending' | 'suspended';
  currency?: 'SAR' | 'USD' | 'EUR' | 'AED';
  accountType?: 'checking' | 'savings' | 'business' | 'investment';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'accountName' | 'bankName' | 'balance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BankAccountStats {
  totalAccounts: number;
  activeAccounts: number;
  pendingAccounts: number;
  verifiedAccounts: number;
  totalBalance: number;
  currencies: string[];
}

export interface SaudiBank {
  name: string;
  code: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface IBANValidation {
  valid: boolean;
  message: string;
}

export class BankAccountService {
  // Create a new bank account
  static async createBankAccount(data: BankAccountForm): Promise<BankAccount> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.errors) {
          const errorMessages = errorData.errors.map((err: { message: string }) => err.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<BankAccount> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to create bank account');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all bank accounts with filters
  static async getBankAccounts(filters: BankAccountFilters = {}): Promise<{
    accounts: BankAccount[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalRecords: number;
    };
  }> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: PaginationResponse<BankAccount> = await response.json();
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch bank accounts');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Get a specific bank account by ID
  static async getBankAccountById(id: string): Promise<BankAccount> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<BankAccount> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Bank account not found');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Update a bank account
  static async updateBankAccount(id: string, data: Partial<BankAccountForm>): Promise<BankAccount> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.errors) {
          const errorMessages = errorData.errors.map((err: { message: string }) => err.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<BankAccount> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update bank account');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete a bank account
  static async deleteBankAccount(id: string): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<void> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete bank account');
      }
    } catch (error) {
      throw error;
    }
  }

  // Set a bank account as default
  static async setDefaultBankAccount(id: string): Promise<BankAccount> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/${id}/set-default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<BankAccount> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to set default bank account');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Get the default bank account
  static async getDefaultBankAccount(): Promise<BankAccount | null> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/default`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<BankAccount | null> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch default bank account');
      }

      return result.data || null;
    } catch (error) {
      throw error;
    }
  }

  // Get bank account statistics
  static async getBankAccountStats(): Promise<BankAccountStats> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<BankAccountStats> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch bank account statistics');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Update verification status (admin only)
  static async updateVerificationStatus(
    id: string,
    status: 'verified' | 'pending' | 'failed',
    adminNotes?: string
  ): Promise<BankAccount> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/${id}/verification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<BankAccount> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update verification status');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Validate IBAN format
  static async validateIBAN(iban: string): Promise<IBANValidation> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/validate-iban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iban }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<IBANValidation> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to validate IBAN');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Get list of Saudi banks
  static async getSaudiBanks(): Promise<SaudiBank[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/saudi-banks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<SaudiBank[]> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch Saudi banks');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Get supported currencies
  static async getSupportedCurrencies(): Promise<Currency[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bank-accounts/currencies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed (${response.status})`);
      }

      const result: ApiResponse<Currency[]> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch currencies');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance for compatibility
export const bankAccountService = BankAccountService;
export default BankAccountService;