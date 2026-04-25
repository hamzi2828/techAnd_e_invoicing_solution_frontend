import { useState, useEffect, useCallback } from 'react';
import { UserProfile, UpdateProfileData, ChangePasswordData } from '../types';
import ProfileService from '../services/profileService';

export const useAdminProfile = () => {
  // Profile data state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Action states
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await ProfileService.getCurrentUserProfile();
      setProfile(profileData);
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedProfile = await ProfileService.updateProfile(data);
      setProfile(updatedProfile);
      setHasUnsavedChanges(false);
      
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (passwordData: ChangePasswordData): Promise<boolean> => {
    try {
      setChangingPassword(true);
      setError(null);
      
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return false;
      }

      // Validate password strength (basic)
      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      
      await ProfileService.changePassword(passwordData);
      
      // Update the security info in profile
      if (profile) {
        setProfile({
          ...profile,
          security: {
            ...profile.security,
            lastPasswordChange: 'Just now'
          }
        });
      }
      
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      return false;
    } finally {
      setChangingPassword(false);
    }
  }, [profile]);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    try {
      setUploadingAvatar(true);
      setError(null);

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return false;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return false;
      }
      
      const avatarUrl = await ProfileService.uploadAvatar(file);
      
      // Update the avatar in profile
      if (profile) {
        setProfile({
          ...profile,
          avatar: avatarUrl
        });
      }
      
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return false;
    } finally {
      setUploadingAvatar(false);
    }
  }, [profile]);

  // Edit mode functions
  const enableEdit = useCallback(() => {
    setIsEditing(true);
    setHasUnsavedChanges(false);
  }, []);

  const disableEdit = useCallback(() => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
  }, []);

  const toggleEdit = useCallback(() => {
    if (isEditing) {
      disableEdit();
    } else {
      enableEdit();
    }
  }, [isEditing, enableEdit, disableEdit]);

  const markAsChanged = useCallback(() => {
    if (isEditing) {
      setHasUnsavedChanges(true);
    }
  }, [isEditing]);

  const canLeave = useCallback(() => {
    if (!hasUnsavedChanges) {
      return true;
    }
    
    return window.confirm('You have unsaved changes. Are you sure you want to leave?');
  }, [hasUnsavedChanges]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    // Profile data
    profile,
    loading,
    error,
    
    // Action states
    updating,
    changingPassword,
    uploadingAvatar,
    
    // Edit mode
    isEditing,
    hasUnsavedChanges,
    
    // Actions
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    
    // Edit mode actions
    enableEdit,
    disableEdit,
    toggleEdit,
    markAsChanged,
    canLeave,
    
    // Utilities
    clearError,
  };
};