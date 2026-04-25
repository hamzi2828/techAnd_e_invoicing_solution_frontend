'use client';

import { useState, useEffect } from 'react';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface UserRole {
  _id: string;
  name: string;
  permissions: Array<{
    _id: string;
    id: string;
    name: string;
    category: string;
  }>;
  permissionIds: string[];
}

export interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdBy: string | null;
  isActive: boolean;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const authHeaders = getAuthHeader();
        if (!authHeaders.Authorization) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        console.log('Current user data:', data);
        setUser(data.data || data.user || data);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Helper function to check if user has a specific permission
  const hasPermission = (permissionId: string): boolean => {
    if (!user || !user.role) return false;

    // Super admin or admin has all permissions
    if (user.role.name.toLowerCase() === 'super admin' ||
        user.role.name.toLowerCase() === 'admin') {
      return true;
    }

    // Check if user has the specific permission
    return user.role.permissionIds?.includes(permissionId) || false;
  };

  // Helper function to check if user has any of the permissions
  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (!user || !user.role) return false;

    // Super admin or admin has all permissions
    if (user.role.name.toLowerCase() === 'super admin' ||
        user.role.name.toLowerCase() === 'admin') {
      return true;
    }

    return permissionIds.some(id => user.role.permissionIds?.includes(id));
  };

  return {
    user,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
  };
};
