'use client';

import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  PersonalInformation,
  SecuritySettings,
  AccountSummary,
  ConnectedAccounts,
  DangerZone,
  ProfileHeader
} from './components';
import { useAdminProfile } from './hooks';


export default function AdminProfilePage() {
  // Unified admin profile hook
  const {
    profile,
    loading,
    error,
    updating,
    changingPassword,
    isEditing,
    updateProfile,
    changePassword,
    enableEdit,
    disableEdit,
    markAsChanged,
    clearError
  } = useAdminProfile();
  
  // Form data state to capture updated values from PersonalInformation
  const [formProfile, setFormProfile] = React.useState(profile);

  // Update form profile when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormProfile(profile);
    }
  }, [profile]);
  

  // Handle save profile
  const handleSave = async () => {
    if (!formProfile) return;
    
    const payload = {
      firstName: formProfile.firstName,
      lastName: formProfile.lastName,
      email: formProfile.email,
      phone: formProfile.phone,
      bio: formProfile.bio,
      preferences: {
        timezone: formProfile.preferences?.timezone || 'Asia/Riyadh',
        language: formProfile.preferences?.language || 'en',
        timeFormat: formProfile.preferences?.timeFormat || '24h'
      }
    };

    const success = await updateProfile(payload);
    
    if (success) {
      alert('Profile updated successfully!');
      disableEdit();
    }
  };

  // Handle password change
  const handlePasswordChange = async (passwordData: { newPassword: string; confirmPassword: string }) => {
    const success = await changePassword(passwordData);
    if (success) {
      alert('Password changed successfully!');
    }
    return success;
  };


  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">
            {error || 'Failed to load profile'}
          </span>
        </div>
        {error && (
          <button 
            onClick={clearError}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Clear error
          </button>
        )}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <ProfileHeader 
        isEditing={isEditing}
        onToggleEdit={isEditing ? disableEdit : enableEdit}
        onSave={handleSave}
        saving={updating}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformation 
            profile={{
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              phone: profile.phone || '',
              jobTitle: profile.jobTitle || '',
              department: profile.department || '',
              bio: profile.bio || '',
              role: profile.role.name
            }}
            preferences={{
              timezone: profile.preferences.timezone,
              language: profile.preferences.language,
              timeFormat: profile.preferences.timeFormat
            }}
            isEditing={isEditing}
            onChange={(updatedData) => {
              setFormProfile(prev => {
                if (!prev) return prev;
                
                const newProfile = { ...prev };
                
                // Handle preferences update
                if ('preferences' in updatedData) {
                  newProfile.preferences = {
                    ...prev.preferences,
                    ...updatedData.preferences
                  };
                } else {
                  // Handle regular profile fields (but exclude role since it's read-only)
                  const profileData = updatedData as Partial<{
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone: string;
                    bio: string;
                    jobTitle: string;
                    department: string;
                  }>;
                  // Only update fields that are actually editable
                  if (profileData.firstName !== undefined) newProfile.firstName = profileData.firstName;
                  if (profileData.lastName !== undefined) newProfile.lastName = profileData.lastName;
                  if (profileData.phone !== undefined) newProfile.phone = profileData.phone;
                  if (profileData.bio !== undefined) newProfile.bio = profileData.bio;
                }
                
                return newProfile;
              });
              markAsChanged();
            }}
          />
          
          <SecuritySettings 
            onPasswordChange={handlePasswordChange}
            changingPassword={changingPassword}
            twoFactorEnabled={profile.security.twoFactorEnabled}
            lastPasswordChange={profile.security.lastPasswordChange}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AccountSummary 
            profile={{
              id: profile.id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              joinedDate: profile.joinedDate,
              lastLogin: profile.lastLogin,
              role: profile.role.name
            }}
            avatar={profile.avatar}
          />
          <ConnectedAccounts 
            isGoogleConnected={profile.connectedAccounts.google.connected}
            googleEmail={profile.connectedAccounts.google.email}
          />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}