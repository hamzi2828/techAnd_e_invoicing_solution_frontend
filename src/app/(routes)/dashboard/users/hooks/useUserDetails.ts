import { useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { UserService } from '../services/userService';
import { RolesService } from '../services/rolesService';

interface UseUserDetailsReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  availableRoles: Role[];
  updateUserStatus: (status: 'active' | 'inactive' | 'pending') => Promise<void>;
  updateUserRole: (role: string) => Promise<void>;
  updateUserCompany: (companyId: string | null) => Promise<void>;
  saveChanges: (status: 'active' | 'inactive' | 'pending', role: string, companyId?: string | null) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

export const useUserDetails = (userId: string): UseUserDetailsReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  // Fetch user details and available roles
  const fetchUserDetails = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user data and available roles in parallel
      const [userData, roles] = await Promise.all([
        UserService.getUserById(userId),
        RolesService.getRolesCreatedByMe() // Get only roles created by logged-in user
      ]);

      setUser(userData);
      setAvailableRoles(roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update user status
  const updateUserStatus = useCallback(async (status: 'active' | 'inactive' | 'pending') => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      await UserService.updateUserStatus(user.id, status);
      
      // Update local state
      setUser(prevUser => prevUser ? { ...prevUser, status } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Update user role
  const updateUserRole = useCallback(async (role: string) => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      await UserService.updateUserRole(user.id, role);

      // Update local state with new role
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          role: {
            ...prevUser.role,
            name: role,
            color: getRoleColor(role)
          }
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Update user's assigned company
  const updateUserCompany = useCallback(async (companyId: string | null) => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      await UserService.updateUserCompany(user.id, companyId);

      // Update local state with new assigned company ID
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          assignedCompanyId: companyId || undefined
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assigned company');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Save all changes at once
  const saveChanges = useCallback(async (status: 'active' | 'inactive' | 'pending', roleIdOrName: string, companyId?: string | null) => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      // Find the role ID from the selected role (could be ID or name)
      let selectedRoleObj = availableRoles.find(r => r.id === roleIdOrName);

      // If not found by ID, try to find by name
      if (!selectedRoleObj) {
        selectedRoleObj = availableRoles.find(r =>
          r.name.toLowerCase() === roleIdOrName.toLowerCase()
        );
      }

      const roleId = selectedRoleObj ? selectedRoleObj.id : roleIdOrName;

      console.log('Saving changes:', {
        status,
        inputRole: roleIdOrName,
        selectedRole: selectedRoleObj,
        roleId,
        companyId
      });

      // Update status, role and company
      const updates = [
        UserService.updateUserStatus(user.id, status),
        UserService.updateUserRole(user.id, roleId)
      ];

      // Only update company if companyId is explicitly provided (including null to clear)
      if (companyId !== undefined) {
        updates.push(UserService.updateUserCompany(user.id, companyId));
      }

      await Promise.all(updates);

      // Refresh user data
      await fetchUserDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user, availableRoles, fetchUserDetails]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await fetchUserDetails();
  }, [fetchUserDetails]);

  // Update user password
  const updateUserPassword = useCallback(async (newPassword: string) => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      await UserService.updateUserPassword(user.id, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Helper function to get role color
  const getRoleColor = (role: string): string => {
    const roleColors: { [key: string]: string } = {
      'admin': 'bg-purple-100 text-purple-800',
      'moderator': 'bg-blue-100 text-blue-800',
      'user': 'bg-gray-100 text-gray-800',
    };
    
    return roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Initial fetch
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return {
    user,
    loading,
    error,
    saving,
    availableRoles,
    updateUserStatus,
    updateUserRole,
    updateUserCompany,
    saveChanges,
    refreshUser,
    updateUserPassword,
  };
};

export default useUserDetails;