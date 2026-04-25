'use client';

import React, { useState, useEffect } from 'react';
import { Building2, MapPin, FileText, CreditCard, Loader2, AlertCircle, Lock, Zap, Crown, ArrowLeft } from 'lucide-react';
import { CompanyService } from './services/companyService';
import { CompanyForm } from './types';
import { useRouter } from 'next/navigation';
import {
  StepIndicator,
  BasicInfoStep,
  ContactInfoStep,
  BusinessInfoStep,
  DocumentsStep,
  type CompanyData,
  type StepConfig
} from './components';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';
import { usePlan } from '@/contexts/PlanContext';

const steps: StepConfig[] = [
  { id: 1, name: 'Basic Information', icon: Building2 },
  { id: 2, name: 'Contact Details', icon: MapPin },
  { id: 3, name: 'Business Information', icon: CreditCard },
  { id: 4, name: 'Documents & Verification', icon: FileText },
];

export default function CompanyOnboarding() {
  const router = useRouter();
  const { canCreate, planInfo, isLoading: isPlanLoading, incrementLocalUsage } = usePlan();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});

  // Plan limit check
  const companyCheck = canCreate('company');
  const [companyData, setCompanyData] = useState<CompanyData>({
    basicInfo: {
      companyName: '',
      tradeName: '',
      registrationNumber: '',
      taxNumber: '',
      industry: '',
      establishedDate: '',
    },
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      address: '',
      district: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Saudi Arabia',
    },
    businessInfo: {
      businessType: '',
      employeeCount: '',
      annualRevenue: '',
      currency: 'SAR',
    },
    documents: {
      logo: null,
      commercialRegister: null,
      taxCertificate: null,
    },
  });

  const handleInputChange = (section: keyof CompanyData, field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Real-time validation for registration number
    if (field === 'registrationNumber') {
      const isValid = /^\d{10}$/.test(value);
      setValidFields(prev => ({
        ...prev,
        registrationNumber: isValid
      }));

      // Clear error if valid
      if (isValid && validationErrors.registrationNumber) {
        setValidationErrors(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { registrationNumber, ...rest } = prev;
          return rest as Record<string, string>;
        });
      }
    }

    // Real-time validation for tax number
    if (field === 'taxNumber') {
      const isValid = /^3\d{14}$/.test(value);
      setValidFields(prev => ({
        ...prev,
        taxNumber: isValid
      }));

      // Clear error if valid
      if (isValid && validationErrors.taxNumber) {
        setValidationErrors(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { taxNumber, ...rest } = prev;
          return rest as Record<string, string>;
        });
      }
    }

    // Real-time validation for postal code
    if (field === 'postalCode') {
      const isValid = /^\d{5}$/.test(value);
      setValidFields(prev => ({
        ...prev,
        postalCode: isValid
      }));

      // Clear error if valid
      if (isValid && validationErrors.postalCode) {
        setValidationErrors(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { postalCode, ...rest } = prev;
          return rest as Record<string, string>;
        });
      }
    }

    // Real-time validation for phone number
    if (field === 'phone') {
      const cleanPhone = value.replace(/[\s-]/g, '');
      const isValid = /^(\+966|966|0)?5[0-9]{8}$/.test(cleanPhone);
      setValidFields(prev => ({
        ...prev,
        phone: isValid
      }));

      // Clear error if valid
      if (isValid && validationErrors.phone) {
        setValidationErrors(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { phone, ...rest } = prev;
          return rest as Record<string, string>;
        });
      }
    }

    // Real-time validation for email
    if (field === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setValidFields(prev => ({
        ...prev,
        email: isValid
      }));

      // Clear error if valid
      if (isValid && validationErrors.email) {
        setValidationErrors(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { email, ...rest } = prev;
          return rest as Record<string, string>;
        });
      }
    }
  };

  const handleFileUpload = async (field: keyof CompanyData['documents'], file: File | null) => {
    if (!file) {
      setCompanyData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: file
        }
      }));
      return;
    }

    // For now, we'll store the file object and handle upload during form submission
    // In a real implementation, you might want to upload files immediately to a cloud storage
    setCompanyData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  // Convert file to base64 for API submission (temporary solution)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Upload documents after company creation
  const uploadDocuments = async (companyId: string) => {
    const { documents } = companyData;
    const uploadPromises = [];

    if (documents.logo) {
      const base64 = await fileToBase64(documents.logo);
      uploadPromises.push(
        CompanyService.uploadDocument(companyId, {
          documentType: 'company_profile',
          documentName: documents.logo.name,
          documentUrl: base64
        })
      );
    }

    if (documents.commercialRegister) {
      const base64 = await fileToBase64(documents.commercialRegister);
      uploadPromises.push(
        CompanyService.uploadDocument(companyId, {
          documentType: 'commercial_registration',
          documentName: documents.commercialRegister.name,
          documentUrl: base64
        })
      );
    }

    if (documents.taxCertificate) {
      const base64 = await fileToBase64(documents.taxCertificate);
      uploadPromises.push(
        CompanyService.uploadDocument(companyId, {
          documentType: 'tax_certificate',
          documentName: documents.taxCertificate.name,
          documentUrl: base64
        })
      );
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }
  };

  // Convert frontend data structure to backend API format
  const transformToApiFormat = (data: CompanyData): CompanyForm => {
    return {
      companyName: data.basicInfo.companyName,
      legalForm: 'Limited Liability Company', // Default, could be made dynamic
      commercialRegistrationNumber: data.basicInfo.registrationNumber,
      taxIdNumber: data.basicInfo.taxNumber,
      email: data.contactInfo.email,
      phone: data.contactInfo.phone,
      website: data.contactInfo.website,
      address: {
        street: data.contactInfo.address,
        district: data.contactInfo.district,
        city: data.contactInfo.city,
        province: data.contactInfo.state,
        postalCode: data.contactInfo.postalCode,
        country: data.contactInfo.country
      },
      industry: data.basicInfo.industry,
      establishedDate: data.basicInfo.establishedDate,
      employeeCount: data.businessInfo.employeeCount || undefined,
      currency: data.businessInfo.currency,
      businessDescription: '', // Not captured in current form
      fiscalYearEnd: 'December' // Default
    };
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!companyData.basicInfo.companyName.trim()) {
          errors.companyName = 'Company name is required';
        }
        if (!companyData.basicInfo.registrationNumber.trim()) {
          errors.registrationNumber = 'Registration number is required';
        }
        if (!companyData.basicInfo.taxNumber.trim()) {
          errors.taxNumber = 'Tax number is required';
        }
        if (!companyData.basicInfo.industry) {
          errors.industry = 'Industry is required';
        }
        break;

      case 2:
        if (!companyData.contactInfo.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.contactInfo.email)) {
          errors.email = 'Please enter a valid email';
        }
        if (!companyData.contactInfo.phone.trim()) {
          errors.phone = 'Phone number is required';
        }
        if (!companyData.contactInfo.address.trim()) {
          errors.address = 'Address is required';
        }
        if (!companyData.contactInfo.city.trim()) {
          errors.city = 'City is required';
        }
        break;

      case 3:
        if (!companyData.businessInfo.businessType) {
          errors.businessType = 'Business type is required';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit company data
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiData = transformToApiFormat(companyData);
      const result = await CompanyService.createCompany(apiData);

      // Upload documents if any
      const companyId = result._id || result.id;
      if (companyId) {
        await uploadDocuments(companyId);
      }

      // Update local usage count
      incrementLocalUsage('company');

      // Show success message and redirect to companies list
      showAlert('Company profile created successfully!', 'success');
      router.push('/dashboard/company/list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiData = transformToApiFormat(companyData);
      // You might want to add a separate endpoint for saving drafts
      // For now, we'll use the same create endpoint
      await CompanyService.createCompany(apiData);
      showAlert('Draft saved successfully!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    // First validate frontend
    if (!validateStep(currentStep)) {
      return;
    }

    // Then validate backend
    setIsLoading(true);
    setError(null);

    try {
      let stepData: Record<string, string | boolean> = {};

      // Prepare data for backend validation based on current step
      switch (currentStep) {
        case 1:
          stepData = {
            companyName: companyData.basicInfo.companyName,
            registrationNumber: companyData.basicInfo.registrationNumber,
            taxNumber: companyData.basicInfo.taxNumber,
            industry: companyData.basicInfo.industry,
          };
          break;
        case 2:
          stepData = {
            email: companyData.contactInfo.email,
            phone: companyData.contactInfo.phone,
            address: companyData.contactInfo.address,
            district: companyData.contactInfo.district,
            city: companyData.contactInfo.city,
            state: companyData.contactInfo.state,
            postalCode: companyData.contactInfo.postalCode,
            country: companyData.contactInfo.country,
            website: companyData.contactInfo.website,
          };
          break;
        case 3:
          stepData = {
            businessType: companyData.businessInfo.businessType,
          };
          break;
        case 4:
          stepData = {
            logo: companyData.documents.logo ? true : false,
            commercialRegister: companyData.documents.commercialRegister ? true : false,
            taxCertificate: companyData.documents.taxCertificate ? true : false,
          };
          break;
      }

      const result = await CompanyService.validateStep(currentStep, stepData);

      if (!result.success) {
        setValidationErrors(result.errors);
        setError('Please fix the validation errors before continuing');
      } else {
        // Validation passed, move to next step
        if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1);
          setValidationErrors({});
          setError(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate step');
    } finally {
      setIsLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Helper function to handle onChange for different sections
  const handleSectionChange = (section: keyof CompanyData) => (field: string, value: string) => {
    handleInputChange(section, field, value);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={companyData.basicInfo}
            validationErrors={validationErrors}
            validFields={validFields}
            onChange={handleSectionChange('basicInfo')}
          />
        );

      case 2:
        return (
          <ContactInfoStep
            data={companyData.contactInfo}
            validationErrors={validationErrors}
            validFields={validFields}
            onChange={handleSectionChange('contactInfo')}
          />
        );

      case 3:
        return (
          <BusinessInfoStep
            data={companyData.businessInfo}
            validationErrors={validationErrors}
            onChange={handleSectionChange('businessInfo')}
          />
        );

      case 4:
        return (
          <DocumentsStep
            data={companyData.documents}
            onFileUpload={handleFileUpload}
          />
        );

      default:
        return null;
    }
  };

  // Show loading state while checking plan
  if (isPlanLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show blocked UI if company limit reached
  if (!companyCheck.allowed && !companyCheck.unlimited) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header with back button */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-amber-50 via-orange-50 to-red-50">
            <button
              onClick={() => router.push('/dashboard/company/list')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Companies
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Limit Reached</h1>
            <p className="text-gray-600">You&apos;ve reached the maximum number of companies for your current plan.</p>
          </div>

          {/* Limit reached content */}
          <div className="px-6 py-12">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-amber-100 rounded-full mb-6">
                <Lock className="h-10 w-10 text-amber-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Upgrade to Add More Companies
              </h2>

              <p className="text-gray-600 mb-6 max-w-md">
                Your <span className="font-medium">{planInfo?.currentPlan?.name || 'Free'}</span> plan allows up to {companyCheck.limit} {companyCheck.limit === 1 ? 'company' : 'companies'}.
                Upgrade your plan to create and manage more companies.
              </p>

              {/* Usage indicator */}
              <div className="w-full max-w-xs mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Companies Used</span>
                  <span className="font-medium">{companyCheck.current} / {companyCheck.limit}</span>
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
                  { name: 'Free', limit: 1, current: planInfo?.currentPlan?.name === 'Free' },
                  { name: 'Basic', limit: 1, current: planInfo?.currentPlan?.name === 'Basic' },
                  { name: 'Professional', limit: 3, current: planInfo?.currentPlan?.name === 'Professional' },
                  { name: 'Enterprise', limit: 10, current: planInfo?.currentPlan?.name === 'Enterprise' }
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
                      {plan.name === 'Enterprise' ? '10+' : plan.limit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {plan.limit === 1 ? 'company' : 'companies'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/dashboard/company/list')}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View My Companies
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
            {/* Usage indicator */}
            {!companyCheck.unlimited && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {companyCheck.current} / {companyCheck.limit} companies
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600">Create a new company profile. You can manage multiple companies from your account.</p>
        </div>

        {/* Progress Steps */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Form Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStep === 1
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </button>
            {currentStep === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}