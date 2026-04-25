'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader,
  AlertCircle
} from 'lucide-react';
import { CustomerService } from '../services/customerService';
import {
  CustomerTypeSelector,
  BasicInformationForm,
  AddressInformationForm,
  ContactPersonsForm,
  BankingInformationForm,
  CustomerSettings,
  DocumentsUpload,
  ComplianceForm,
  PaymentLimitsForm
} from '../add/components';
import type {
  FormData,
  Contact,
  BankAccount,
  Document,
  SettingsData
  } from '../types';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [customerType, setCustomerType] = useState<'individual' | 'business'>('business');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    // Basic Information
    customerName: '',
    customerType: 'business',
    commercialRegistrationNumber: '',
    industry: '',
    vatNumber: '',
    taxId: '',
    email: '',
    phone: '',
    contactPerson: '',
    website: '',
    customerGroup: 'Regular',

    // Address
    streetAddress: '',
    buildingNumber: '',
    additionalNumber: '',
    district: '',
    city: '',
    postalCode: '',
    state: '',
    country: 'Saudi Arabia',

    // Banking
    bankName: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    currency: 'SAR',

    // Payment Limits
    dailyLimit: '',
    monthlyLimit: '',
    perTransactionLimit: '',


    // Compliance
    riskRating: 'medium',
    sanctionScreened: false,

    // Status
    status: 'active',
    verificationStatus: 'pending',
    isActive: true,

    // Additional
    notes: '',
    tags: [],
    referenceNumber: '',
    source: '',
    assignedTo: '',
    priority: 'Normal',
  });

  const [settings, setSettings] = useState<SettingsData>({
    isActive: true,
    dataProcessingConsent: false,
    termsAccepted: true,
    privacyPolicyAccepted: true,
  });


  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setIsLoading(true);
      const response = await CustomerService.getCustomerById(customerId);

      // Extract customer from the nested response structure
      const customer = response?.data?.customer;

      if (customer) {
        console.log('Loaded customer data:', customer);

        // Set customer type
        setCustomerType(customer.customerType || 'business');

        setFormData({
          // Basic Information
          customerName: customer.customerName || '',
          customerType: customer.customerType || 'business',
          commercialRegistrationNumber: customer.commercialRegistrationNumber || '',
          industry: customer.industry || '',
          vatNumber: customer.complianceInfo?.taxId || customer.taxNumber || '',
          taxId: customer.complianceInfo?.taxId || '',
          email: customer.contactInfo?.email || customer.email || '',
          phone: customer.contactInfo?.phone || customer.phone || '',
          contactPerson: customer.contactInfo?.contactPerson || '',
          website: customer.website || '',
          customerGroup: customer.customerGroup || 'Regular',

          // Address - mapping from structured address object
          streetAddress: customer.address?.street || '',
          buildingNumber: customer.address?.buildingNumber || '',
          additionalNumber: customer.address?.addressAdditionalNumber || '',
          district: customer.address?.district || '',
          city: customer.address?.city || customer.city || '',
          postalCode: customer.address?.postalCode || '',
          state: customer.address?.state || '',
          country: customer.address?.country === 'SA' ? 'Saudi Arabia' : customer.address?.country || customer.country || 'Saudi Arabia',

          // Banking - from structured bankInfo
          bankName: customer.bankInfo?.bankName || customer.bankName || '',
          accountNumber: customer.bankInfo?.accountNumber || customer.accountNumber || '',
          iban: customer.bankInfo?.iban || customer.iban || '',
          swiftCode: customer.bankInfo?.swiftCode || customer.swiftCode || '',
          currency: customer.bankInfo?.currency || customer.currency || 'SAR',

          // Payment Limits - from structured paymentLimits
          dailyLimit: customer.paymentLimits?.dailyLimit?.toString() || '',
          monthlyLimit: customer.paymentLimits?.monthlyLimit?.toString() || '',
          perTransactionLimit: customer.paymentLimits?.perTransactionLimit?.toString() || '',

          // Compliance - from structured complianceInfo
          riskRating: customer.complianceInfo?.riskRating || 'medium',
          sanctionScreened: customer.complianceInfo?.sanctionScreened || false,

          // Status
          status: customer.status || 'active',
          verificationStatus: customer.verificationStatus || 'pending',
          isActive: customer.isActive !== undefined ? customer.isActive : true,

          // Additional Information
          notes: customer.notes || '',
          tags: customer.tags || [],
          referenceNumber: customer.referenceNumber || '',
          source: customer.source || '',
          assignedTo: customer.assignedTo || '',
          priority: customer.priority || 'Normal',
        });

        // Set settings
        setSettings(prev => ({
          ...prev,
          isActive: customer.isActive,
        }));

        // Set bank accounts from structured bankInfo
        const bankInfo = customer.bankInfo || customer;
        if (bankInfo.bankName || bankInfo.accountNumber || bankInfo.iban) {
          setBankAccounts([{
            bankName: bankInfo.bankName || '',
            accountNumber: bankInfo.accountNumber || '',
            accountType: 'checking',
            iban: bankInfo.iban || '',
            swiftCode: bankInfo.swiftCode || '',
            currency: bankInfo.currency || 'SAR',
            isPrimary: true,
          }]);
        }

        // Set contacts for business customers from structured contactInfo
        if (customer.customerType === 'business' || customer.customerType === 'company') {
          const contactInfo = customer.contactInfo || customer;
          setContacts([{
            name: contactInfo.contactPerson || customer.customerName || '',
            position: '',
            email: contactInfo.email || '',
            phone: contactInfo.phone || '',
            department: '',
            isPrimary: true,
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      setSubmitError('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError(null);
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateSettings = (field: keyof SettingsData, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };


  const validateForm = () => {
    const errors: Record<string, string> = {};
    let firstError = '';

    const requiredFields = ['customerName', 'vatNumber', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        errors[field] = `${fieldName} is required`;
        if (!firstError) firstError = `${fieldName} is required`;
      }
    }

    // Validate VAT number format
    if (formData.vatNumber && !/^\d{15}$/.test(formData.vatNumber)) {
      errors.vatNumber = 'VAT number must be 15 digits';
      if (!firstError) firstError = 'VAT number must be 15 digits';
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
      if (!firstError) firstError = 'Invalid email format';
    }

    // Validate required settings
    if (!settings.termsAccepted || !settings.privacyPolicyAccepted) {
      errors.settings = 'Please accept the Terms of Service and Privacy Policy';
      if (!firstError) firstError = 'Please accept the Terms of Service and Privacy Policy';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length > 0 ? firstError : null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare customer data for API in structured format
      const customerData = {
        customerName: formData.customerName,
        customerType: customerType,

        // Basic Information
        commercialRegistrationNumber: formData.commercialRegistrationNumber,
        industry: formData.industry,
        website: formData.website,
        customerGroup: formData.customerGroup,

        // Contact Information
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          contactPerson: contacts[0]?.name || formData.contactPerson
        },

        // Address Information
        address: {
          street: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country === 'Saudi Arabia' ? 'SA' : formData.country,
          buildingNumber: formData.buildingNumber,
          district: formData.district,
          addressAdditionalNumber: formData.additionalNumber
        },

        // Compliance Information
        complianceInfo: {
          taxId: formData.vatNumber || formData.taxId,
          riskRating: formData.riskRating,
          sanctionScreened: formData.sanctionScreened
        },

        // Banking Information
        bankInfo: {
          bankName: bankAccounts[0]?.bankName || formData.bankName,
          accountNumber: bankAccounts[0]?.accountNumber || formData.accountNumber,
          iban: bankAccounts[0]?.iban || formData.iban,
          swiftCode: bankAccounts[0]?.swiftCode || formData.swiftCode,
          currency: bankAccounts[0]?.currency || formData.currency
        },

        // Payment Limits
        paymentLimits: {
          dailyLimit: formData.dailyLimit,
          monthlyLimit: formData.monthlyLimit,
          perTransactionLimit: formData.perTransactionLimit
        },

        // Additional Information
        notes: formData.notes,
        tags: formData.tags,
        referenceNumber: formData.referenceNumber,
        source: formData.source,
        assignedTo: formData.assignedTo,
        priority: formData.priority,

        // Status Information
        status: formData.status,
        verificationStatus: formData.verificationStatus,
        isActive: settings.isActive
      };

      // Call update API
      await CustomerService.updateCustomer(customerId, customerData);
      router.push('/admin/customers');
    } catch (error) {
      console.error('Error updating customer:', error);

      // Handle backend validation errors
      if (error instanceof Error) {
        const errorMessage = error.message;
        const validationErrors = (error as import('../types').ValidationErrorResponse).validationErrors;

        // If we have specific validation errors, map them to fields
        if (validationErrors && Array.isArray(validationErrors)) {
          const errors: Record<string, string> = {};

          validationErrors.forEach((errorText: string) => {
            // Map common backend validation errors to field names
            if (errorText.includes('Invalid email format') || errorText.includes('email')) {
              errors.email = errorText;
            } else if (errorText.includes('VAT number') || errorText.includes('vat')) {
              errors.vatNumber = errorText;
            } else if (errorText.includes('Customer name') || errorText.includes('name')) {
              errors.customerName = errorText;
            } else if (errorText.includes('Phone') || errorText.includes('phone')) {
              errors.phone = errorText;
            } else if (errorText.includes('IBAN') || errorText.includes('iban')) {
              errors.iban = errorText;
            }
          });

          setFieldErrors(errors);
        } else {
          // Fallback to parsing the error message for field errors
          const errors: Record<string, string> = {};

          if (errorMessage.includes('Invalid email format')) {
            errors.email = 'Invalid email format';
          }
          if (errorMessage.includes('VAT number')) {
            errors.vatNumber = 'Invalid VAT number format';
          }
          if (errorMessage.includes('Customer name') && errorMessage.includes('required')) {
            errors.customerName = 'Customer name is required';
          }
          if (errorMessage.includes('phone') && errorMessage.includes('required')) {
            errors.phone = 'Phone number is required';
          }

          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          }
        }

        setSubmitError(errorMessage);
      } else {
        setSubmitError('Failed to update customer. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-sm text-gray-600 mt-1">Update customer information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/admin/customers')}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Customer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error updating customer</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerTypeSelector
            customerType={customerType}
            onTypeChange={setCustomerType}
            disabled={true}
          />

          <BasicInformationForm
            customerType={customerType}
            formData={formData}
            onUpdateField={updateField}
            fieldErrors={fieldErrors}
          />

          <AddressInformationForm
            formData={formData}
            onUpdateField={updateField}
          />

          <ContactPersonsForm
            customerType={customerType}
            contacts={contacts}
            onUpdateContacts={setContacts}
          />

          <BankingInformationForm
            bankAccounts={bankAccounts}
            onUpdateBankAccounts={setBankAccounts}
          />

          <PaymentLimitsForm
            formData={formData}
            onUpdateField={updateField}
          />

          <ComplianceForm
            formData={formData}
            onUpdateField={updateField}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CustomerSettings
            settings={settings}
            onUpdateSettings={updateSettings}
            readOnly={true}
          />

          <DocumentsUpload
            documents={documents}
            onUpdateDocuments={setDocuments}
          />
        </div>
      </div>
    </div>
  );
}