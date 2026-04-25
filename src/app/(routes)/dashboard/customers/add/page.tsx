'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader,
  AlertCircle,
  Lock,
  Zap,
  Crown,
  Users
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
} from './components';
import type {
  FormData,
  Contact,
  BankAccount,
  Document,
  SettingsData
} from '../types';
import { usePlan } from '@/contexts/PlanContext';

export default function AddCustomerPage() {
  const router = useRouter();
  const { canCreate, planInfo, isLoading: isPlanLoading, incrementLocalUsage } = usePlan();
  const [customerType, setCustomerType] = useState<'individual' | 'business'>('business');

  // Plan limit check
  const customerCheck = canCreate('customer');
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
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });



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
      // Prepare customer data for API
      const customerData = {
        customerName: formData.customerName,
        customerType: customerType,
        name: customerType === 'business' ? formData.contactPerson || formData.customerName : formData.customerName,
        companyName: customerType === 'business' ? formData.customerName : '',
        email: formData.email,
        phone: formData.phone,
        contactPerson: formData.contactPerson,
        country: formData.country === 'Saudi Arabia' ? 'SA' : formData.country,
        taxNumber: formData.vatNumber,

        // Basic Information (missing fields)
        commercialRegistrationNumber: formData.commercialRegistrationNumber,
        industry: formData.industry,
        taxId: formData.taxId,
        website: formData.website,
        customerGroup: formData.customerGroup,

        // Address fields
        address: formData.streetAddress,
        city: formData.city,
        streetAddress: formData.streetAddress,
        buildingNumber: formData.buildingNumber,
        district: formData.district,
        addressAdditionalNumber: formData.additionalNumber,
        postalCode: formData.postalCode,
        state: formData.state,

        // Banking fields
        bankName: formData.bankName || 'Not specified',
        accountNumber: formData.accountNumber || '',
        iban: formData.iban || '',
        swiftCode: formData.swiftCode || '',
        currency: formData.currency || 'SAR',

        // Payment Limits (missing fields)
        dailyLimit: formData.dailyLimit,
        monthlyLimit: formData.monthlyLimit,
        perTransactionLimit: formData.perTransactionLimit,

        // Compliance
        riskRating: formData.riskRating,
        sanctionScreened: formData.sanctionScreened,

        // Status
        status: formData.status,
        verificationStatus: formData.verificationStatus,
        isActive: formData.isActive,

        // Additional fields (missing fields)
        notes: formData.notes,
        tags: formData.tags,
        referenceNumber: formData.referenceNumber,
        source: formData.source,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
      };

      await CustomerService.addCustomer(customerData);

      // Update local usage count
      incrementLocalUsage('customer');

      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Error creating customer:', error);

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
        setSubmitError('Failed to create customer. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking plan
  if (isPlanLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-12">
          <div className="flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show blocked UI if customer limit reached
  if (!customerCheck.allowed && !customerCheck.unlimited) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header with back button */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-amber-50 via-orange-50 to-red-50">
            <Link
              href="/dashboard/customers"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Customers
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Limit Reached</h1>
            <p className="text-gray-600">You&apos;ve reached the maximum number of customers for your current plan.</p>
          </div>

          {/* Limit reached content */}
          <div className="px-6 py-12">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-amber-100 rounded-full mb-6">
                <Lock className="h-10 w-10 text-amber-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Upgrade to Add More Customers
              </h2>

              <p className="text-gray-600 mb-6 max-w-md">
                Your <span className="font-medium">{planInfo?.currentPlan?.name || 'Free'}</span> plan allows up to {customerCheck.limit} customers.
                Upgrade your plan to add more customers and unlock additional features.
              </p>

              {/* Usage indicator */}
              <div className="w-full max-w-xs mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Customers Used</span>
                  <span className="font-medium">{customerCheck.current} / {customerCheck.limit}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Plan comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 w-full max-w-2xl">
                {[
                  { name: 'Free', limit: 20, current: planInfo?.currentPlan?.name === 'Free' },
                  { name: 'Basic', limit: 100, current: planInfo?.currentPlan?.name === 'Basic' },
                  { name: 'Professional', limit: 1000, current: planInfo?.currentPlan?.name === 'Professional' },
                  { name: 'Enterprise', limit: null, current: planInfo?.currentPlan?.name === 'Enterprise' }
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      plan.current
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {plan.current && <Crown className="h-4 w-4 text-primary mr-1" />}
                      <span className={`text-sm font-medium ${plan.current ? 'text-primary' : 'text-gray-700'}`}>
                        {plan.name}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {plan.limit === null ? 'Unlimited' : plan.limit.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">customers</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/dashboard/customers')}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View My Customers
                </button>
                <button
                  onClick={() => router.push('/dashboard/settings?tab=subscription')}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
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
            href="/dashboard/customers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-sm text-gray-600 mt-1">Create a new customer profile</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Usage indicator */}
          {!customerCheck.unlimited && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {customerCheck.current} / {customerCheck.limit} customers
              </span>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard/customers')}
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
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Customer
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
              <h3 className="text-sm font-medium text-red-800">Error creating customer</h3>
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