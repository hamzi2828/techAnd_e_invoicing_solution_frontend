// src/app/(routes)/admin/company/bank-accounts/hooks/useBankAccountForm.ts
import { useState, useEffect, useCallback } from 'react';
import { BankAccountService } from '../services/bankAccountService';
import { CompanyService } from '../../services/companyService';
import { BankAccountForm, BankAccount } from '../types';
import toast from 'react-hot-toast';

export interface Company {
  _id?: string;
  id?: string;
  companyName: string;
}

export interface SaudiBank {
  name: string;
  code: string;
}

export interface UseBankAccountFormReturn {
  // Form state
  formData: BankAccountForm;
  saudiBanks: SaudiBank[];
  companies: Company[];
  loading: boolean;
  submitting: boolean;
  validationErrors: Record<string, string>;

  // Actions
  updateField: (field: keyof BankAccountForm, value: string) => void;
  validateIBAN: (iban: string) => Promise<boolean>;
  resetForm: () => void;
  setFormData: (data: BankAccountForm) => void;
  loadBanks: () => Promise<void>;
}

const initialFormData: BankAccountForm = {
  companyId: '',
  accountName: '',
  accountNumber: '',
  iban: '',
  bankName: '',
  bankCode: '',
  branchName: '',
  branchCode: '',
  currency: 'SAR',
  accountType: 'business',
};

export const useBankAccountForm = (editingAccount?: BankAccount | null) => {
  const [formData, setFormDataState] = useState<BankAccountForm>(initialFormData);
  const [saudiBanks, setSaudiBanks] = useState<SaudiBank[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load Saudi banks and companies on mount
  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      const [banksResponse, companiesResponse] = await Promise.all([
        BankAccountService.getSaudiBanks(),
        CompanyService.getCompaniesCreatedByMe()
      ]);
      setSaudiBanks(banksResponse);
      setCompanies(companiesResponse);
    } catch (error: unknown) {
      console.error('Error loading data:', error);
      toast.error('Failed to load bank list or companies');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update form field
  const updateField = useCallback((field: keyof BankAccountForm, value: string) => {
    setFormDataState(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Auto-fill bank code when bank name is selected
      if (field === 'bankName') {
        const bank = saudiBanks.find(b => b.name === value);
        if (bank) {
          newFormData.bankCode = bank.code;
        }
      }

      return newFormData;
    });

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [saudiBanks, validationErrors]);

  // Validate IBAN
  const validateIBAN = useCallback(async (iban: string): Promise<boolean> => {
    if (!iban) return false;

    try {
      const response = await BankAccountService.validateIBAN(iban);
      const { valid, message } = response;

      if (!valid) {
        setValidationErrors(prev => ({
          ...prev,
          iban: message
        }));
        return false;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.iban;
          return newErrors;
        });
        return true;
      }
    } catch (error: any) {
      setValidationErrors(prev => ({
        ...prev,
        iban: 'Error validating IBAN'
      }));
      return false;
    }
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormDataState(initialFormData);
    setValidationErrors({});
  }, []);

  // Set form data (for editing)
  const setFormData = useCallback((data: BankAccountForm) => {
    setFormDataState(data);
    setValidationErrors({});
  }, []);

  // Load form data when editing account changes
  useEffect(() => {
    if (editingAccount) {
      setFormData({
        companyId: editingAccount.companyId || '',
        accountName: editingAccount.accountName,
        accountNumber: editingAccount.accountNumber,
        iban: editingAccount.iban,
        bankName: editingAccount.bankName,
        bankCode: editingAccount.bankCode,
        branchName: editingAccount.branchName || '',
        branchCode: editingAccount.branchCode || '',
        currency: editingAccount.currency,
        accountType: editingAccount.accountType,
      });
    } else {
      resetForm();
    }
  }, [editingAccount, resetForm, setFormData]);

  // Load banks on mount
  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  // Client-side validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyId) {
      errors.companyId = 'Company is required';
    }

    if (!formData.accountName.trim()) {
      errors.accountName = 'Account name is required';
    }

    if (!formData.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^[0-9]{10,20}$/.test(formData.accountNumber)) {
      errors.accountNumber = 'Account number must be 10-20 digits';
    }

    if (!formData.iban.trim()) {
      errors.iban = 'IBAN is required';
    } else if (!/^SA[0-9]{22}$/.test(formData.iban.replace(/\s/g, ''))) {
      errors.iban = 'Invalid IBAN format. Saudi IBAN should be SA followed by 22 digits';
    }

    if (!formData.bankName) {
      errors.bankName = 'Bank name is required';
    }

    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }

    if (!formData.accountType) {
      errors.accountType = 'Account type is required';
    }

    if (formData.branchCode && !/^[0-9]{3,4}$/.test(formData.branchCode)) {
      errors.branchCode = 'Branch code must be 3-4 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  return {
    // Form state
    formData,
    saudiBanks,
    companies,
    loading,
    submitting,
    validationErrors,

    // Actions
    updateField,
    validateIBAN,
    resetForm,
    setFormData,
    loadBanks,
    validateForm,
    setSubmitting
  } as UseBankAccountFormReturn & { validateForm: () => boolean; setSubmitting: (value: boolean) => void };
};