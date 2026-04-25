import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { CompanyProfile } from '../types';

interface ContactTabProps {
  profile: CompanyProfile;
  isEditing: boolean;
  validationErrors: Record<string, string>;
  validFields: Record<string, boolean>;
  onInputChange: (section: keyof CompanyProfile, field: string, value: string) => void;
}

const ContactTab: React.FC<ContactTabProps> = ({
  profile,
  isEditing,
  validationErrors,
  validFields,
  onInputChange,
}) => {
  const VerificationBadge = ({ verified, label }: { verified: boolean; label: string }) => (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      verified
        ? 'bg-green-100 text-green-800'
        : 'bg-orange-100 text-orange-800'
    }`}>
      {verified ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : (
        <AlertCircle className="h-3 w-3 mr-1" />
      )}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              {isEditing ? (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={profile.contactInfo.email}
                      onChange={(e) => onInputChange('contactInfo', 'email', e.target.value)}
                      className={`flex-1 px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                        validationErrors.email
                          ? 'border-red-500'
                          : validFields.email
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="company@example.com"
                    />
                    <VerificationBadge verified={profile.verification.emailVerified} label="Verified" />
                  </div>
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                  {validFields.email && !validationErrors.email && (
                    <p className="mt-1 text-sm text-green-600">✓ Valid email address</p>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{profile.contactInfo.email}</p>
                  <VerificationBadge verified={profile.verification.emailVerified} label="Verified" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number * (Saudi mobile)</label>
              {isEditing ? (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="tel"
                      value={profile.contactInfo.phone}
                      onChange={(e) => onInputChange('contactInfo', 'phone', e.target.value)}
                      className={`flex-1 px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                        validationErrors.phone
                          ? 'border-red-500'
                          : validFields.phone
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="05XXXXXXXX or +9665XXXXXXXX"
                    />
                    <VerificationBadge verified={profile.verification.phoneVerified} label="Verified" />
                  </div>
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                  {validFields.phone && !validationErrors.phone && (
                    <p className="mt-1 text-sm text-green-600">✓ Valid Saudi mobile number</p>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{profile.contactInfo.phone}</p>
                  <VerificationBadge verified={profile.verification.phoneVerified} label="Verified" />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
              {isEditing ? (
                <>
                  <input
                    type="url"
                    value={profile.contactInfo.website}
                    onChange={(e) => onInputChange('contactInfo', 'website', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      validationErrors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://www.yourcompany.com"
                  />
                  {validationErrors.website && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.website}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Must start with http:// or https://</p>
                </>
              ) : (
                <a href={profile.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-700">
                  {profile.contactInfo.website}
                </a>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
              {isEditing ? (
                <>
                  <textarea
                    value={profile.contactInfo.address}
                    onChange={(e) => onInputChange('contactInfo', 'address', e.target.value)}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      validationErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your street address"
                  />
                  {validationErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.contactInfo.address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={profile.contactInfo.city}
                    onChange={(e) => onInputChange('contactInfo', 'city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      validationErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  {validationErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.contactInfo.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={profile.contactInfo.state}
                    onChange={(e) => onInputChange('contactInfo', 'state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      validationErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter province"
                  />
                  {validationErrors.state && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.contactInfo.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code * (5 digits)</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={profile.contactInfo.postalCode}
                    onChange={(e) => onInputChange('contactInfo', 'postalCode', e.target.value)}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                      validationErrors.postalCode
                        ? 'border-red-500'
                        : validFields.postalCode
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="12345"
                    maxLength={5}
                  />
                  {validationErrors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.postalCode}</p>
                  )}
                  {validFields.postalCode && !validationErrors.postalCode && (
                    <p className="mt-1 text-sm text-green-600">✓ Valid postal code</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.contactInfo.postalCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              {isEditing ? (
                <select
                  value={profile.contactInfo.country}
                  onChange={(e) => onInputChange('contactInfo', 'country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
                  disabled
                >
                  <option value="Saudi Arabia">Saudi Arabia</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.contactInfo.country}</p>
              )}
              {isEditing && (
                <p className="mt-1 text-sm text-gray-500">Currently only Saudi Arabia is supported</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactTab;