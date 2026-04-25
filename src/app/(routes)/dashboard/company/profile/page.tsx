'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Briefcase,
  Star,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  ProfileHeader,
  ProfileTabs,
  OverviewTab,
  ContactTab,
  BusinessTab,
  BrandingTab,
  VerificationTab
} from './components';
import type { CompanyProfile, TabItem } from './types';
import { CompanyService } from '../services/companyService';
import { Company } from '../types';
import { useRouter } from 'next/navigation';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

const tabs: TabItem[] = [
  { id: 'overview', name: 'Overview', icon: Building2 },
  { id: 'contact', name: 'Contact Info', icon: MapPin },
  { id: 'business', name: 'Business Details', icon: Briefcase },
  { id: 'branding', name: 'Branding', icon: Star },
  { id: 'verification', name: 'Verification', icon: Shield },
];

export default function CompanyProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<Company | null>(null);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();
  const [profile, setProfile] = useState<CompanyProfile>({
    basicInfo: {
      companyName: 'TechFlow Solutions LLC',
      tradeName: 'TechFlow',
      registrationNumber: '1010123456',
      taxNumber: '300123456789003',
      industry: 'Technology',
      establishedDate: '2020-01-15',
      description: 'Leading provider of innovative business solutions and digital transformation services.',
    },
    contactInfo: {
      email: 'info@techflow.sa',
      phone: '+966 11 123 4567',
      website: 'https://www.techflow.sa',
      address: 'King Fahd Road, Al Olaya District',
      city: 'Riyadh',
      state: 'Riyadh Province',
      postalCode: '12211',
      country: 'Saudi Arabia',
    },
    businessInfo: {
      businessType: 'LLC',
      employeeCount: '50-100',
      annualRevenue: '5M-10M SAR',
      currency: 'SAR',
      businessHours: '08:00 - 17:00',
      timezone: 'Asia/Riyadh',
    },
    branding: {
      logo: null,
      primaryColor: '#84cc16',
      secondaryColor: '#eab308',
      companyTagline: 'Innovation. Excellence. Growth.',
    },
    verification: {
      emailVerified: true,
      phoneVerified: true,
      documentsVerified: true,
      taxVerified: false,
    },
  });

  // Fetch company data on component mount
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const company = await CompanyService.getUserCompany();
        if (!company) {
          // No company found, redirect to onboarding
          router.push('/admin/company');
          return;
        }

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
            documentsVerified: company.documents?.some(doc => doc.verificationStatus === 'verified') || false,
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

    fetchCompanyData();
  }, [router]);

  const handleInputChange = (section: keyof CompanyProfile, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!companyData?._id) return;

    try {
      setIsSaving(true);
      setError(null);

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
    // Reset to original values if needed
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            profile={profile}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onEditClick={handleEditToggle}
          />
        );
      case 'contact':
        return (
          <ContactTab
            profile={profile}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
        );
      case 'business':
        return (
          <BusinessTab
            profile={profile}
            isEditing={isEditing}
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
  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Profile</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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