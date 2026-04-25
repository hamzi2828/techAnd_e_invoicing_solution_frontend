import React from 'react';
import { Mail, Phone, Crown, Globe } from 'lucide-react';

interface PersonalInformationProps {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    department: string;
    bio: string;
    role: string | { id: string; name: string; color: string };
  };
  preferences?: {
    timezone: string;
    language: string;
    timeFormat: string;
  };
  isEditing: boolean;
  onChange?: (updatedData: Partial<PersonalInformationProps['profile']> | { preferences: Partial<PersonalInformationProps['preferences']> }) => void;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({ 
  profile, 
  preferences,
  isEditing, 
  onChange 
}) => {
  // Helper function to get role display value
  const getRoleDisplayValue = (role: string | { id: string; name: string; color: string }): string => {
    return typeof role === 'string' ? role : role.name;
  };
  const [formData, setFormData] = React.useState(() => ({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    role: profile ? getRoleDisplayValue(profile.role) : ''
  }));

  // Only update form data when profile initially loads (when going from null/undefined to having data)
  React.useEffect(() => {
    if (profile && (!formData.firstName || !formData.email)) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        role: getRoleDisplayValue(profile.role) || ''
      });
    }
  }, [profile, formData.firstName, formData.email]);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
        {getRoleDisplayValue(profile.role) === 'Super Admin' && (
          <div className="flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            <Crown className="h-3 w-3 mr-1" />
            {getRoleDisplayValue(profile.role)}
          </div>
        )}
      </div>

      <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {profile.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {profile.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{getRoleDisplayValue(profile.role)}</p>
            </div>
          </div>

          {/* Preferences Section */}
          {preferences && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-md font-medium text-gray-900 mb-4">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  {isEditing ? (
                    <select 
                      value={preferences.timezone}
                      onChange={(e) => onChange && onChange({ preferences: { ...preferences, timezone: e.target.value }})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
                      <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                      <option value="Asia/Kuwait">Asia/Kuwait (UTC+3)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      {preferences.timezone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  {isEditing ? (
                    <select 
                      value={preferences.language}
                      onChange={(e) => onChange && onChange({ preferences: { ...preferences, language: e.target.value }})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {preferences.language === 'en' ? 'English' : 'Arabic'}
                    </p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Bio Section */}
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {isEditing ? (
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.bio}</p>
            )}
          </div>
      </div>
    </div>
  );
};

export default PersonalInformation;