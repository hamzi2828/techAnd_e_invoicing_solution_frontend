'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Briefcase,
  Star,
  Shield,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import {
  ProfileHeader,
  ProfileTabs,
  OverviewTab,
  ContactTab,
  BusinessTab,
  BrandingTab,
  VerificationTab
} from '../components';
import type { CompanyProfile, TabItem } from '../types';
import { CompanyService } from '../../services/companyService';
import { Company } from '../../types';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

const tabs: TabItem[] = [
  { id: 'overview', name: 'Overview', icon: Building2 },
  { id: 'contact', name: 'Contact Info', icon: MapPin },
  { id: 'business', name: 'Business Details', icon: Briefcase },
  { id: 'branding', name: 'Branding', icon: Star },
  { id: 'verification', name: 'Verification', icon: Shield },
];

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});
  const [companyData, setCompanyData] = useState<Company | null>(null);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();
  const [profile, setProfile] = useState<CompanyProfile>({
    basicInfo: {
      companyName: '',
      tradeName: '',
      registrationNumber: '',
      taxNumber: '',
      industry: '',
      establishedDate: '',
      description: '',
    },
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    businessInfo: {
      businessType: '',
      employeeCount: '',
      annualRevenue: '',
      currency: 'SAR',
      businessHours: '',
      timezone: '',
    },
    branding: {
      logo: null,
      primaryColor: '#84cc16',
      secondaryColor: '#eab308',
      companyTagline: '',
    },
    verification: {
      emailVerified: false,
      phoneVerified: false,
      documentsVerified: false,
      taxVerified: false,
    },
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch company by ID using the service
        const company = await CompanyService.getCompanyById(companyId);

        setCompanyData(company);

        // Transform API data to profile format
        const transformedProfile: CompanyProfile = {
          basicInfo: {
            companyName: company.companyName || '',
            tradeName: company.companyNameAr || '',
            registrationNumber: company.commercialRegistrationNumber || '',
            taxNumber: company.taxIdNumber || '',
            industry: company.industry || '',
            establishedDate: company.establishedDate || '',
            description: company.businessDescription || '',
          },
          contactInfo: {
            email: company.email || '',
            phone: company.phone || '',
            website: company.website || '',
            address: company.address?.street || '',
            city: company.address?.city || '',
            state: company.address?.province || '',
            postalCode: company.address?.postalCode || '',
            country: company.address?.country || 'Saudi Arabia',
          },
          businessInfo: {
            businessType: company.legalForm || '',
            employeeCount: company.employeeCount || '',
            annualRevenue: '',
            currency: company.currency || 'SAR',
            businessHours: '08:00 - 17:00',
            timezone: 'Asia/Riyadh',
          },
          branding: {
            logo: null,
            primaryColor: '#84cc16',
            secondaryColor: '#eab308',
            companyTagline: '',
          },
          verification: {
            emailVerified: company.verificationStatus === 'verified',
            phoneVerified: company.verificationStatus === 'verified',
            documentsVerified: company.documents?.some((doc: { verificationStatus: string }) => doc.verificationStatus === 'verified') || false,
            taxVerified: company.vatRegistered || false,
          },
        };

        setProfile(transformedProfile);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load company data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const handleInputChange = (section: keyof CompanyProfile, field: string, value: string) => {
    setProfile(prev => ({
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
          const newErrors = { ...prev };
          delete newErrors.registrationNumber;
          return newErrors;
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
          const newErrors = { ...prev };
          delete newErrors.taxNumber;
          return newErrors;
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
          const newErrors = { ...prev };
          delete newErrors.postalCode;
          return newErrors;
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
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
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
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  };

  const handleSave = async () => {
    if (!companyData?._id) return;

    try {
      setIsSaving(true);
      setError(null);

      // Validate basic info (step 1 equivalent)
      const basicInfoData = {
        companyName: profile.basicInfo.companyName,
        registrationNumber: profile.basicInfo.registrationNumber,
        taxNumber: profile.basicInfo.taxNumber,
        industry: profile.basicInfo.industry,
      };
      const step1Result = await CompanyService.validateStep(1, basicInfoData);

      if (!step1Result.success) {
        setValidationErrors(step1Result.errors);
        setError('Please fix validation errors in Basic Information');
        setActiveTab('overview');
        return;
      }

      // Validate contact info (step 2 equivalent)
      const contactInfoData = {
        email: profile.contactInfo.email,
        phone: profile.contactInfo.phone,
        address: profile.contactInfo.address,
        district: companyData.address?.district || '',
        city: profile.contactInfo.city,
        state: profile.contactInfo.state,
        postalCode: profile.contactInfo.postalCode,
        country: profile.contactInfo.country,
        website: profile.contactInfo.website,
      };
      const step2Result = await CompanyService.validateStep(2, contactInfoData);

      if (!step2Result.success) {
        setValidationErrors(step2Result.errors);
        setError('Please fix validation errors in Contact Information');
        setActiveTab('contact');
        return;
      }

      // Validate business info (step 3 equivalent)
      const businessInfoData = {
        businessType: profile.businessInfo.businessType,
      };
      const step3Result = await CompanyService.validateStep(3, businessInfoData);

      if (!step3Result.success) {
        setValidationErrors(step3Result.errors);
        setError('Please fix validation errors in Business Details');
        setActiveTab('business');
        return;
      }

      // All validations passed, proceed with update
      // Transform profile data back to API format
      const updateData = {
        companyName: profile.basicInfo.companyName,
        companyNameAr: profile.basicInfo.tradeName,
        commercialRegistrationNumber: profile.basicInfo.registrationNumber,
        taxIdNumber: profile.basicInfo.taxNumber,
        industry: profile.basicInfo.industry,
        establishedDate: profile.basicInfo.establishedDate,
        businessDescription: profile.basicInfo.description,
        email: profile.contactInfo.email,
        phone: profile.contactInfo.phone,
        website: profile.contactInfo.website,
        address: {
          street: profile.contactInfo.address,
          city: profile.contactInfo.city,
          province: profile.contactInfo.state,
          postalCode: profile.contactInfo.postalCode,
          country: profile.contactInfo.country,
          district: companyData.address?.district || ''
        },
        legalForm: profile.businessInfo.businessType as 'Limited Liability Company' | 'Joint Stock Company' | 'Partnership' | 'Sole Proprietorship' | 'Branch of Foreign Company' | 'Professional Company',
        employeeCount: profile.businessInfo.employeeCount as '1-10' | '11-50' | '51-200' | '201-500' | '500+',
        currency: profile.businessInfo.currency as 'SAR' | 'USD' | 'EUR',
      };

      const updatedCompany = await CompanyService.updateCompany(companyData._id, updateData);
      setCompanyData(updatedCompany);
      setIsEditing(false);
      setValidationErrors({});

      // Show success message
      showAlert('Company profile updated successfully!', 'success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company profile';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleBackToList = () => {
    router.push('/admin/company/list');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            profile={profile}
            isEditing={isEditing}
            validationErrors={validationErrors}
            validFields={validFields}
            onInputChange={handleInputChange}
            onEditClick={handleEditToggle}
          />
        );
      case 'contact':
        return (
          <ContactTab
            profile={profile}
            isEditing={isEditing}
            validationErrors={validationErrors}
            validFields={validFields}
            onInputChange={handleInputChange}
          />
        );
      case 'business':
        return (
          <BusinessTab
            profile={profile}
            isEditing={isEditing}
            validationErrors={validationErrors}
            validFields={validFields}
            onInputChange={handleInputChange}
          />
        );
      case 'branding':
        return (
          <BrandingTab
            profile={profile}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
        );
      case 'verification':
        return (
          <VerificationTab
            profile={profile}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !companyData) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Profile</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBackToList}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Companies List</span>
      </button>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <ProfileHeader
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <ProfileTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
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