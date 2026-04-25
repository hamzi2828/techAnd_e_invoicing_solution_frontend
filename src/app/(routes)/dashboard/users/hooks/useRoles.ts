'use client';

import { useState, useEffect, useCallback } from 'react';
import { Role, Permission } from '../types';
import { RolesService } from '../services/rolesService';
import { STATIC_PERMISSIONS } from '../constants/staticPermissions';

interface UseRolesReturn {
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  refreshRoles: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  createRole: (roleData: Partial<Role>) => Promise<Role>;
  updateRole: (id: string, roleData: Partial<Role>) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  getRoleById: (id: string) => Promise<Role>;
}

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all roles (only roles created by the logged-in user)
  const refreshRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRoles = await RolesService.getRolesCreatedByMe(); // Use new endpoint to get only roles created by me
      setRoles(fetchedRoles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
      setError(errorMessage);
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use static permissions instead of fetching from backend
  const refreshPermissions = useCallback(async () => {
    try {
      setError(null);
      // Use static permissions that match Sidebar navigation exactly
      console.log('✅ Using static permissions (34 permissions matching Sidebar)');
      setPermissions(STATIC_PERMISSIONS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load permissions';
      setError(errorMessage);
      console.error('Error loading permissions:', err);
    }
  }, []);

  // Create a new role (using registerRole to track createdBy)
  const createRole = useCallback(async (roleData: Partial<Role>): Promise<Role> => {
    try {
      setError(null);
      const newRole = await RolesService.registerRole(roleData); // Use registerRole to track createdBy
      setRoles(prevRoles => [...prevRoles, newRole]);
      return newRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role';
      setError(errorMessage);
      console.error('Error creating role:', err);
      throw err;
    }
  }, []);

  // Update an existing role
  const updateRole = useCallback(async (id: string, roleData: Partial<Role>): Promise<Role> => {
    try {
      setError(null);
      const updatedRole = await RolesService.updateRole(id, roleData);
      setRoles(prevRoles => 
        prevRoles.map(role => role.id === id ? updatedRole : role)
      );
      return updatedRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      setError(errorMessage);
      console.error('Error updating role:', err);
      throw err;
    }
  }, []);

  // Delete a role
  const deleteRole = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await RolesService.deleteRole(id);
      setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
      setError(errorMessage);
      console.error('Error deleting role:', err);
      throw err;
    }
  }, []);

  // Get role by ID
  const getRoleById = useCallback(async (id: string): Promise<Role> => {
    try {
      setError(null);
      return await RolesService.getRoleById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch role';
      setError(errorMessage);
      console.error('Error fetching role by ID:', err);
      throw err;
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load roles and permissions in parallel
        await Promise.all([
          refreshRoles(),
          refreshPermissions(),
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshRoles, refreshPermissions]);

  return {
    roles,
    permissions,
    loading,
    error,
    refreshRoles,
    refreshPermissions,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
  };
};

export default useRoles;