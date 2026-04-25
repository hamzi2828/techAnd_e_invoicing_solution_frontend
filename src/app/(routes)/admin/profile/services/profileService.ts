import { UserProfile, UpdateProfileData, ChangePasswordData, ProfileResponse, BackendProfileData } from '../types';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class ProfileService {
  // Get current user profile
  static async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch profile (${response.status}): ${errorText}`);
      }

      const data: ProfileResponse = await response.json();
      if (!data.data) {
        throw new Error('No profile data received');
      }

      return this.transformBackendProfile(data.data);
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData: UpdateProfileData): Promise<UserProfile> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile (${response.status}): ${errorText}`);
      }

      const data: ProfileResponse = await response.json();
      
      if (!data.data) {
        throw new Error('No updated profile data received');
      }

      return this.transformBackendProfile(data.data);
    } catch (error) {
      throw error;
    }
  }

  // Change password
  static async changePassword(passwordData: ChangePasswordData): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to change password (${response.status}): ${errorText}`);
      }

    } catch (error) {
      throw error;
    }
  }

  // Upload profile avatar
  static async uploadAvatar(file: File): Promise<string> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/user/avatar/upload`, {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload avatar (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.avatarUrl || data.data?.avatarUrl || '';
    } catch (error) {
      throw error;
    }
  }

  // Transform backend profile data to frontend format
  private static transformBackendProfile(backendData: BackendProfileData): UserProfile {
    const transformedProfile = {
      id: backendData._id || backendData.id || '',
      firstName: backendData.firstName || '',
      lastName: backendData.lastName || '',
      email: backendData.email || '',
      phone: backendData.phone || '',
      jobTitle: backendData.jobTitle || backendData.role?.name || 'User',
      department: backendData.department || backendData.company || 'General',
      company: backendData.company || 'E-Invoice Solutions',
      bio: backendData.bio || '',
      role: {
        id: backendData.role?._id || backendData.role?.id || '',
        name: backendData.role?.name || 'User',
        color: backendData.role?.color || 'bg-gray-100 text-gray-800'
      },
      avatar: backendData.avatarUrl || backendData.avatar || null,
      isActive: backendData.isActive !== false,
      joinedDate: backendData.createdAt ? new Date(backendData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      lastLogin: backendData.lastLogin ? this.formatDateTime(backendData.lastLogin) : 'Never',
      preferences: {
        timezone: backendData.preferences?.timezone || 'Asia/Riyadh',
        language: backendData.preferences?.language || 'en',
        dateFormat: backendData.preferences?.dateFormat || 'DD/MM/YYYY',
        timeFormat: backendData.preferences?.timeFormat || '24h'
      },
      security: {
        twoFactorEnabled: backendData.twoFactorEnabled || false,
        lastPasswordChange: backendData.lastPasswordChange || '30 days ago'
      },
      connectedAccounts: {
        google: {
          connected: backendData.provider === 'google' && !!backendData.googleId,
          email: backendData.provider === 'google' ? backendData.email : undefined,
          id: backendData.googleId || undefined
        }
      }
    };
    
    return transformedProfile;
  }

  // Format date time consistently
  private static formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Never';
      
      const isoString = date.toISOString();
      const [datePart, timePart] = isoString.split('T');
      const timeWithoutMs = timePart.split('.')[0];
      
      return `${datePart} ${timeWithoutMs}`;
    } catch {
      return 'Never';
    }
  }
}

export default ProfileService;