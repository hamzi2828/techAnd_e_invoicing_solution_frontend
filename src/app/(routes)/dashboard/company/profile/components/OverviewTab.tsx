import React from 'react';
import Image from 'next/image';
import {
  Building2,
  Edit3,
  Calendar,
  Users,
  CreditCard,
  Shield
} from 'lucide-react';
import { CompanyProfile } from '../types';

interface OverviewTabProps {
  profile: CompanyProfile;
  isEditing: boolean;
  validationErrors: Record<string, string>;
  validFields: Record<string, boolean>;
  onInputChange: (section: keyof CompanyProfile, field: string, value: string) => void;
  onEditClick: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  isEditing,
  validationErrors,
  validFields,
  onInputChange,
  onEditClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-lg p-6 border border-primary-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              {profile.branding.logo ? (
                <Image
                  src={profile.branding.logo}
                  alt="Company Logo"
                  width={64}
                  height={64}
                  className="rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.basicInfo.companyName}</h1>
              <p className="text-primary-700 font-medium">{profile.basicInfo.tradeName}</p>
              <p className="text-gray-600 mt-1">{profile.branding.companyTagline}</p>
            </div>
          </div>
          <button
            onClick={onEditClick}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span className="text-sm font-medium">Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Established</p>
              <p className="font-semibold">{new Date(profile.basicInfo.establishedDate).getFullYear()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Employees</p>
              <p className="font-semibold">{profile.businessInfo.employeeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="font-semibold">{profile.businessInfo.annualRevenue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Verification</p>
              <p className="font-semibold">75% Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={profile.basicInfo.companyName}
                    onChange={(e) => onInputChange('basicInfo', 'companyName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      validationErrors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.companyName}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.basicInfo.companyName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trade Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.basicInfo.tradeName}
                  onChange={(e) => onInputChange('basicInfo', 'tradeName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              ) : (
                <p className="text-gray-900">{profile.basicInfo.tradeName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number * (10 digits)</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={profile.basicInfo.registrationNumber}
                    onChange={(e) => onInputChange('basicInfo', 'registrationNumber', e.target.value)}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                      validationErrors.registrationNumber
                        ? 'border-red-500'
                        : validFields.registrationNumber
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit registration number"
                    maxLength={10}
                  />
                  {validationErrors.registrationNumber && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.registrationNumber}</p>
                  )}
                  {validFields.registrationNumber && !validationErrors.registrationNumber && (
                    <p className="mt-1 text-sm text-green-600">✓ Valid registration number</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.basicInfo.registrationNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Number * (Must start with 3, 15 digits)</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={profile.basicInfo.taxNumber}
                    onChange={(e) => onInputChange('basicInfo', 'taxNumber', e.target.value)}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                      validationErrors.taxNumber
                        ? 'border-red-500'
                        : validFields.taxNumber
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="3XXXXXXXXXXXXXX"
                    maxLength={15}
                  />
                  {validationErrors.taxNumber && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.taxNumber}</p>
                  )}
                  {validFields.taxNumber && !validationErrors.taxNumber && (
                    <p className="mt-1 text-sm text-green-600">✓ Valid tax number</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.basicInfo.taxNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
              {isEditing ? (
                <>
                  <select
                    value={profile.basicInfo.industry}
                    onChange={(e) => onInputChange('basicInfo', 'industry', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      validationErrors.industry ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Construction">Construction</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Finance">Finance</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Energy">Energy</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                  {validationErrors.industry && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.industry}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.basicInfo.industry}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Established Date</label>
              <p className="text-gray-900">{new Date(profile.basicInfo.establishedDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
            {isEditing ? (
              <textarea
                value={profile.basicInfo.description}
                onChange={(e) => onInputChange('basicInfo', 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            ) : (
              <p className="text-gray-900">{profile.basicInfo.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;