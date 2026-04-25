import React from 'react';
import Image from 'next/image';
import { Building2, Upload, X } from 'lucide-react';
import { CompanyProfile } from '../types';

interface BrandingTabProps {
  profile: CompanyProfile;
  isEditing: boolean;
  onInputChange: (section: keyof CompanyProfile, field: string, value: string) => void;
}

const BrandingTab: React.FC<BrandingTabProps> = ({
  profile,
  isEditing,
  onInputChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Company Branding</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
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
                {isEditing && (
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <X className="h-4 w-4" />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={profile.branding.primaryColor}
                  onChange={(e) => onInputChange('branding', 'primaryColor', e.target.value)}
                  disabled={!isEditing}
                  className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-gray-900">{profile.branding.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={profile.branding.secondaryColor}
                  onChange={(e) => onInputChange('branding', 'secondaryColor', e.target.value)}
                  disabled={!isEditing}
                  className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-gray-900">{profile.branding.secondaryColor}</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Tagline</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.branding.companyTagline}
                  onChange={(e) => onInputChange('branding', 'companyTagline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your company tagline"
                />
              ) : (
                <p className="text-gray-900">{profile.branding.companyTagline}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingTab;