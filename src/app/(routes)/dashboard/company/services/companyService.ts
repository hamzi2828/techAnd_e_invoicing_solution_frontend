import {
  Company, CompanyForm, CompanyFilters, CompanyStatistics, CompanyDocument,
  ZatcaStatusResponse, ZatcaEnvironment, ZatcaHistoryEntry,
  OnboardingPhase, BusinessType, OnboardingDetails, TLUStatus,
  ConfigurationKey, ConfigurationResponse, VerificationStatusResponse,
  OTPSendResponse, OTPVerifyResponse
} from '../types';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export class CompanyService {
  // Create a new company
  static async createCompany(data: CompanyForm): Promise<Company> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create company');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create company');
    }

    return result.data;
  }

  // Get company by ID
  static async getCompanyById(companyId: string): Promise<Company> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data after reset
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get company');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get company');
    }

    return result.data;
  }

  // Get user's company
  static async getUserCompany(): Promise<Company | null> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data after reset
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No company found
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to get company');
    }

    const result = await response.json();
    if (!result.success) {
      if (result.message === 'No company profile found') {
        return null;
      }
      throw new Error(result.message || 'Failed to get company');
    }

    return result.data;
  }

  // Update company
  static async updateCompany(companyId: string, data: Partial<CompanyForm>): Promise<Company> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update company');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update company');
    }

    return result.data;
  }

  // Delete company
  static async deleteCompany(companyId: string): Promise<void> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete company');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete company');
    }
  }

  // Upload document
  static async uploadDocument(
    companyId: string,
    documentData: {
      documentType: string;
      documentName: string;
      documentUrl: string;
    }
  ): Promise<CompanyDocument> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(documentData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload document');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to upload document');
    }

    return result.data;
  }

  // Remove document
  static async removeDocument(companyId: string, documentId: string): Promise<void> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove document');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to remove document');
    }
  }

  // Check company name availability
  static async checkNameAvailability(companyName: string, excludeId?: string): Promise<{ available: boolean; suggestion?: string }> {
    const authHeaders = getAuthHeader();
    const params = new URLSearchParams({ companyName });
    if (excludeId) {
      params.append('excludeId', excludeId);
    }

    const response = await fetch(`${API_BASE_URL}/api/companies/check-name?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check name availability');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to check name availability');
    }

    return result.data;
  }

  // Validate registration details
  static async validateRegistrationDetails(
    commercialRegistrationNumber?: string,
    taxIdNumber?: string,
    excludeId?: string
  ): Promise<{ errors: Record<string, string> }> {
    const authHeaders = getAuthHeader();
    const payload: {
      commercialRegistrationNumber?: string;
      taxIdNumber?: string;
      excludeId?: string;
    } = {};

    if (commercialRegistrationNumber) payload.commercialRegistrationNumber = commercialRegistrationNumber;
    if (taxIdNumber) payload.taxIdNumber = taxIdNumber;
    if (excludeId) payload.excludeId = excludeId;

    const response = await fetch(`${API_BASE_URL}/api/companies/validate-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate registration details');
    }

    const result = await response.json();
    return result.data;
  }

  // Get companies created by the logged-in user
  static async getCompaniesCreatedByMe(): Promise<Company[]> {
    const authHeaders = getAuthHeader();
    if (!authHeaders.Authorization) {
      throw new Error('No authentication token found. Please login.');
    }

    console.log('Fetching companies created by me from:', `${API_BASE_URL}/api/companies/created-by-me`);

    const response = await fetch(`${API_BASE_URL}/api/companies/created-by-me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data after reset
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch companies created by you (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response data:', result);

    if (!result.success) {
      throw new Error(result.message || 'Failed to get companies created by you');
    }

    return result.data || [];
  }

  // Get all companies with filters (admin only)
  static async getAllCompanies(filters: CompanyFilters = {}): Promise<{
    companies: Company[];
    pagination: {
      current: number;
      total: number;
      totalRecords: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const authHeaders = getAuthHeader();
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/companies?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get companies');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get companies');
    }

    return {
      companies: result.data,
      pagination: result.pagination
    };
  }

  // Get company statistics (admin only)
  static async getCompanyStatistics(): Promise<CompanyStatistics> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get statistics');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get statistics');
    }

    return result.data;
  }

  // Update company status (admin only)
  static async updateCompanyStatus(
    companyId: string,
    status?: string,
    verificationStatus?: string
  ): Promise<Company> {
    const authHeaders = getAuthHeader();
    const payload: {
      status?: string;
      verificationStatus?: string;
    } = {};

    if (status) payload.status = status;
    if (verificationStatus) payload.verificationStatus = verificationStatus;

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update company status');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update company status');
    }

    return result.data;
  }

  // Batch update companies (admin only)
  static async batchUpdateCompanies(
    companyIds: string[],
    updates: { status?: string; verificationStatus?: string }
  ): Promise<Array<{ companyId: string; success: boolean; data?: Company; error?: string }>> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/batch-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ companyIds, updates })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to batch update companies');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to batch update companies');
    }

    return result.data;
  }

  // Export companies data (admin only)
  static async exportCompanies(filters: CompanyFilters = {}): Promise<Company[]> {
    const authHeaders = getAuthHeader();
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/companies/export?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export companies');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to export companies');
    }

    return result.data;
  }

  // ========== ZATCA E-Invoicing Methods ==========

  /**
   * Generate CSR and Private Key (Step 1 of ZATCA onboarding)
   * @param companyId - The company ID
   * @param company - The company data
   * @param environment - Target environment (sandbox, simulation, production)
   * @param businessType - Business type (B2B, B2C, or both)
   */
  static async generateCSR(
    companyId: string,
    company: Company,
    environment: ZatcaEnvironment = 'sandbox',
    businessType: BusinessType = 'both'
  ): Promise<{ success: boolean; message: string; data?: { csr: string; environment: ZatcaEnvironment } }> {
    const authHeaders = getAuthHeader();

    // Generate serial number in required format: 1-TST|2-TST|3-ED...
    const crNum = company.commercialRegistrationNumber.substring(0, 10);
    const envPrefix = environment === 'production' ? 'PRD' : 'TST';
    const serialNumber = `1-${envPrefix}|2-${envPrefix}|3-${crNum}`;

    // Determine invoice type based on business type
    // 1000 = Standard (B2B only), 0100 = Simplified (B2C only), 1100 = Both
    let invoiceType = '1100'; // Default: both
    if (businessType === 'B2B') {
      invoiceType = '1000';
    } else if (businessType === 'B2C') {
      invoiceType = '0100';
    }

    // Map environment to environmentType number (matching AL code)
    let environmentType = 2; // Default: Simulation
    if (environment === 'sandbox') {
      environmentType = 1;
    } else if (environment === 'simulation') {
      environmentType = 2;
    } else if (environment === 'production') {
      environmentType = 3;
    }

    const csrRequestData = {
      request: {
        commonName: company.companyName,
        serialNumber: serialNumber,
        organizationIdentifier: company.taxIdNumber,
        organizationUnitName: company.industry,
        organizationName: company.companyName,
        countryName: 'SA',
        invoiceType: invoiceType,
        locationAddress: `${company.address.city}, Saudi Arabia`,
        industryBusinessCategory: company.industry
      },
      environment: environment, // Pass environment string directly
      environmentType: environmentType,
      businessType: businessType, // Pass business type for separate B2B/B2C onboarding
      pemFormat: true
    };

    // Debug logging
    console.log('=== CSR Generation Request (Frontend) ===');
    console.log('Company ID:', companyId);
    console.log('Company Name:', company.companyName);
    console.log('Tax ID:', company.taxIdNumber);
    console.log('Environment (string):', environment);
    console.log('Environment Type (number):', environmentType);
    console.log('Business Type:', businessType, '-> invoiceType:', invoiceType);
    console.log('Serial Number:', serialNumber);
    console.log('Full request data:', JSON.stringify(csrRequestData, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/generate-csr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(csrRequestData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('=== CSR Generation Error ===');
      console.error('Status:', response.status);
      console.error('Error response:', error);
      throw new Error(error.message || 'Failed to generate CSR');
    }

    const result = await response.json();
    console.log('=== CSR Generation Success ===');
    console.log('Result:', result);
    return result;
  }

  /**
   * Get Compliance Certificate (Step 2 of ZATCA onboarding)
   * @param companyId - The company ID
   * @param otp - One-time password from ZATCA
   * @param environment - Target environment (sandbox, simulation, production)
   * @param businessType - Business type (B2B or B2C)
   */
  static async getComplianceCertificate(
    companyId: string,
    otp: string,
    environment?: ZatcaEnvironment,
    businessType?: 'B2B' | 'B2C'
  ): Promise<{ success: boolean; message: string; data?: { status: string; environment: ZatcaEnvironment; businessType?: 'B2B' | 'B2C' } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/compliance-cert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ otp, environment, businessType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get compliance certificate');
    }

    const result = await response.json();
    return result;
  }

  /**
   * Submit Test Invoices (Step 3 of ZATCA onboarding)
   * @param companyId - The company ID
   * @param environment - Target environment (sandbox, simulation, production)
   * @param businessType - Business type (B2B or B2C)
   */
  static async submitTestInvoices(
    companyId: string,
    environment?: ZatcaEnvironment,
    businessType?: 'B2B' | 'B2C'
  ): Promise<{ success: boolean; message: string; errors?: string[]; warnings?: string[]; data?: { environment: ZatcaEnvironment; businessType?: 'B2B' | 'B2C' } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/submit-test-invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ environment, businessType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit test invoices');
    }

    const result = await response.json();
    return result;
  }

  /**
   * Get Production CSID (Step 4 of ZATCA onboarding)
   * @param companyId - The company ID
   * @param environment - Target environment (sandbox, simulation, production)
   * @param businessType - Business type (B2B or B2C)
   */
  static async getProductionCSID(
    companyId: string,
    environment?: ZatcaEnvironment,
    businessType?: 'B2B' | 'B2C'
  ): Promise<{ success: boolean; message: string; data?: { status: string; environment: ZatcaEnvironment; businessType?: 'B2B' | 'B2C'; onboardedAt: string; b2bProductionLocked: boolean; b2cProductionLocked: boolean } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/production-csid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ environment, businessType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get production CSID');
    }

    const result = await response.json();
    return result;
  }

  /**
   * Get ZATCA Status - Returns multi-environment status
   * @param companyId - The company ID
   */
  static async getZatcaStatus(companyId: string): Promise<ZatcaStatusResponse> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get ZATCA status');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get ZATCA status');
    }

    return result.data;
  }

  /**
   * Skip to a higher environment
   * @param companyId - The company ID
   * @param targetEnvironment - The environment to skip to
   */
  static async skipToEnvironment(
    companyId: string,
    targetEnvironment: ZatcaEnvironment
  ): Promise<{ success: boolean; message: string; data?: { activeEnvironment: ZatcaEnvironment; skippedEnvironments: ZatcaEnvironment[] } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/skip-environment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ targetEnvironment })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to skip environment');
    }

    const result = await response.json();
    return result;
  }

  /**
   * Set active environment for invoicing
   * @param companyId - The company ID
   * @param environment - The environment to set as active
   */
  static async setActiveEnvironment(
    companyId: string,
    environment: ZatcaEnvironment
  ): Promise<{ success: boolean; message: string; data?: { activeEnvironment: ZatcaEnvironment } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/set-active-environment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ environment })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set active environment');
    }

    const result = await response.json();
    return result;
  }

  /**
   * Reset ZATCA onboarding - Clears all ZATCA credentials and restarts the onboarding process
   * @param companyId - The company ID
   * @param environment - Optional: Reset only specific environment, or all if not provided
   * @param businessType - Optional: Reset only specific business type (B2B or B2C)
   */
  static async resetZatcaOnboarding(
    companyId: string,
    environment?: ZatcaEnvironment,
    businessType?: 'B2B' | 'B2C'
  ): Promise<{ success: boolean; message: string }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/reset-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ environment, businessType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset ZATCA onboarding');
    }

    const result = await response.json();
    return result;
  }

  /**
   * Get ZATCA onboarding history
   * @param companyId - The company ID
   * @param environment - Optional filter by environment
   * @param businessType - Optional filter by business type (B2B or B2C)
   */
  static async getZatcaHistory(
    companyId: string,
    environment?: ZatcaEnvironment,
    businessType?: 'B2B' | 'B2C'
  ): Promise<{ history: ZatcaHistoryEntry[]; total: number }> {
    const authHeaders = getAuthHeader();

    const params = new URLSearchParams();
    if (environment) {
      params.append('environment', environment);
    }
    if (businessType) {
      params.append('businessType', businessType);
    }

    const url = `${API_BASE_URL}/api/companies/${companyId}/zatca/history${params.toString() ? `?${params}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data after reset
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get ZATCA history');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get ZATCA history');
    }

    return result.data;
  }

  /**
   * Set current business type for onboarding
   * @param companyId - The company ID
   * @param businessType - Business type to set as current (B2B or B2C)
   */
  static async setCurrentBusinessType(
    companyId: string,
    businessType: 'B2B' | 'B2C'
  ): Promise<{ success: boolean; message: string; data?: { currentBusinessType: 'B2B' | 'B2C' } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/set-current-business-type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ businessType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set current business type');
    }

    return response.json();
  }

  // Validate step data before proceeding
  static async validateStep(step: number, data: Record<string, string | boolean>): Promise<{
    success: boolean;
    errors: Record<string, string>;
    warnings?: string[];
  }> {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/companies/validate-step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ step, data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate step');
    }

    const result = await response.json();
    return {
      success: result.success,
      errors: result.data?.errors || {},
      warnings: result.data?.warnings || []
    };
  }

  // ========== NEW Onboarding Management Methods ==========

  /**
   * Set onboarding phase (Phase 1 or Phase 2)
   */
  static async setOnboardingPhase(
    companyId: string,
    phase: OnboardingPhase
  ): Promise<{ success: boolean; message: string; data: { phase: OnboardingPhase } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/set-phase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ phase })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set onboarding phase');
    }

    return response.json();
  }

  /**
   * Set business type (B2B, B2C, or both)
   */
  static async setBusinessType(
    companyId: string,
    businessType: BusinessType
  ): Promise<{ success: boolean; message: string; data: { businessType: BusinessType; b2bEnabled: boolean; b2cEnabled: boolean } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/set-business-type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ businessType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set business type');
    }

    return response.json();
  }

  /**
   * Submit onboarding details
   */
  static async submitOnboardingDetails(
    companyId: string,
    details: OnboardingDetails
  ): Promise<{ success: boolean; message: string; data: OnboardingDetails }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/submit-onboarding-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(details)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit onboarding details');
    }

    return response.json();
  }

  /**
   * Get onboarding details
   */
  static async getOnboardingDetails(
    companyId: string
  ): Promise<{
    phase: OnboardingPhase;
    businessType: BusinessType;
    onboardingDetails: OnboardingDetails | null;
    b2bEnabled: boolean;
    b2cEnabled: boolean;
  }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/onboarding-details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get onboarding details');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Generate TLU token
   */
  static async generateTLU(
    companyId: string,
    environment?: ZatcaEnvironment
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      tokenId: string;
      base64Encoded: string;
      generatedAt: string;
      expiresAt: string;
      environment: ZatcaEnvironment;
    };
  }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/generate-tlu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ environment })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate TLU token');
    }

    return response.json();
  }

  /**
   * Get TLU status
   */
  static async getTLUStatus(companyId: string): Promise<TLUStatus> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/tlu-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data after reset
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get TLU status');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Attach TLU to API
   */
  static async attachTLUToAPI(
    companyId: string
  ): Promise<{ success: boolean; message: string; data: { attachedAt: string; tokenId: string } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/attach-tlu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to attach TLU token');
    }

    return response.json();
  }

  /**
   * Send OTP for phone verification
   */
  static async sendOTP(companyId: string, phoneNumber: string): Promise<OTPSendResponse> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ phoneNumber })
    });

    const result = await response.json();
    if (!response.ok && response.status !== 429) {
      throw new Error(result.message || 'Failed to send OTP');
    }

    return result;
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(companyId: string, otp: string): Promise<OTPVerifyResponse> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ otp })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Resend OTP
   */
  static async resendOTP(companyId: string): Promise<OTPSendResponse> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    const result = await response.json();
    if (!response.ok && response.status !== 429) {
      throw new Error(result.message || 'Failed to resend OTP');
    }

    return result;
  }

  /**
   * Get configuration
   */
  static async getConfiguration(companyId: string): Promise<ConfigurationResponse> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/configuration`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get configuration');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Create configuration key
   */
  static async createConfigurationKey(
    companyId: string,
    keyType: 'signing' | 'encryption' | 'authentication',
    keyName?: string
  ): Promise<{ success: boolean; message: string; data: ConfigurationKey }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/configuration/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ keyType, keyName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create configuration key');
    }

    return response.json();
  }

  /**
   * Activate configuration key
   */
  static async activateConfigurationKey(
    companyId: string,
    keyId: string
  ): Promise<{ success: boolean; message: string; data: ConfigurationKey }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/configuration/keys/${keyId}/activate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate configuration key');
    }

    return response.json();
  }

  /**
   * Delete configuration key
   */
  static async deleteConfigurationKey(
    companyId: string,
    keyId: string
  ): Promise<{ success: boolean; message: string }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/configuration/keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete configuration key');
    }

    return response.json();
  }

  /**
   * Get verification status
   */
  static async getVerificationStatus(companyId: string): Promise<VerificationStatusResponse> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/verification-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data after reset
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get verification status');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Verify API connection
   */
  static async verifyAPIConnection(
    companyId: string
  ): Promise<{ success: boolean; message: string; data: { verified: boolean; apiVerificationStatus: string; verifiedAt?: string } }> {
    const authHeaders = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/zatca/verify-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify API connection');
    }

    return response.json();
  }

  // Set a company as default
  static async setDefaultCompany(companyId: string): Promise<Company> {
    const authHeaders = getAuthHeader();
    if (!authHeaders.Authorization) {
      throw new Error('No authentication token found. Please login.');
    }

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/set-default`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || `Failed to set default company (${response.status})`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to set default company');
    }

    return result.data;
  }

  // Get the default company
  static async getDefaultCompany(): Promise<Company | null> {
    const authHeaders = getAuthHeader();
    if (!authHeaders.Authorization) {
      throw new Error('No authentication token found. Please login.');
    }

    const response = await fetch(`${API_BASE_URL}/api/companies/default`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      cache: 'no-store' // Prevent caching to get fresh data after reset
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || `Failed to get default company (${response.status})`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get default company');
    }

    return result.data || null;
  }
}