'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, Edit } from 'lucide-react';
import { useRoles } from '../hooks';
import { getCategoryOrder, normalizeCategoryName } from '../constants/staticPermissions';
import {
  RoleInformationForm,
  PermissionsSection,
  PermissionSummary,
  RolePreview,
  BestPracticesGuide,
  SelectedPermissions,
} from './components';

export default function AddRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { permissions, createRole, updateRole, getRoleById } = useRoles();
  
  // Check if editing existing role
  const editRoleId = searchParams.get('edit');
  const isEditing = !!editRoleId;
  
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<SelectedPermissions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const loadExistingRole = useCallback(async (roleId: string) => {
    try {
      setInitialLoading(true);
      const role = await getRoleById(roleId);

      console.log('Loaded role for editing:', role);
      console.log('Role permissions:', role.permissions);
      console.log('Available permissions:', permissions);

      setRoleName(role.name);
      setRoleDescription(role.description || '');

      // Group permissions by category for the role
      const grouped: SelectedPermissions = {};

      // Check if role has "all" permissions
      if (role.permissions.includes('all')) {
        console.log('Role has "all" permissions, selecting all available permissions');
        // Select all available permissions
        permissions.forEach(permission => {
          // Normalize the category name to match Sidebar structure
          const category = normalizeCategoryName(permission.category);
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(permission.id);
        });
      } else {
        console.log('Role has specific permissions, mapping to available permissions');
        // Select specific permissions
        role.permissions.forEach(permissionId => {
          const permission = permissions.find(p => p.id === permissionId);
          if (permission) {
            // Normalize the category name to match Sidebar structure
            const category = normalizeCategoryName(permission.category);
            if (!grouped[category]) {
              grouped[category] = [];
            }
            grouped[category].push(permissionId);
          } else {
            console.log('Permission not found for ID:', permissionId);
          }
        });
      }

      console.log('Grouped permissions for selection:', grouped);
      setSelectedPermissions(grouped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load role');
    } finally {
      setInitialLoading(false);
    }
  }, [getRoleById, permissions]);

  // Load existing role data if editing
  useEffect(() => {
    if (isEditing && editRoleId && permissions.length > 0) {
      loadExistingRole(editRoleId);
    }
  }, [isEditing, editRoleId, permissions, loadExistingRole]);

  // Group permissions by category with normalized names
  const groupedPermissions = permissions.reduce((acc, permission) => {
    // Normalize the category name to match Sidebar structure
    const category = normalizeCategoryName(permission.category);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  // Sort categories by the defined order from Sidebar structure
  const sortedCategories = Object.keys(groupedPermissions).sort((a, b) => {
    return getCategoryOrder(a) - getCategoryOrder(b);
  });

  // Get all selected permission IDs
  const getAllSelectedPermissionIds = (): string[] => {
    return Object.values(selectedPermissions).flat();
  };

  // Calculate counts
  const selectedCount = getAllSelectedPermissionIds().length;
  const totalPermissions = permissions.length;

  // Handle select all / deselect all
  const handleSelectAll = () => {
    const allPermissionsByCategory: SelectedPermissions = {};
    Object.entries(groupedPermissions).forEach(([category, categoryPermissions]) => {
      allPermissionsByCategory[category] = categoryPermissions.map(p => p.id);
    });
    setSelectedPermissions(allPermissionsByCategory);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions({});
  };

  const isAllPermissionsSelected = selectedCount === totalPermissions;

  // Handle permission toggle
  const handlePermissionToggle = (category: string, permissionId: string) => {
    setSelectedPermissions(prev => {
      const categoryPermissions = prev[category] || [];
      const isSelected = categoryPermissions.includes(permissionId);
      
      if (isSelected) {
        return {
          ...prev,
          [category]: categoryPermissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          [category]: [...categoryPermissions, permissionId]
        };
      }
    });
  };

  // Handle category select all/none
  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = groupedPermissions[category]?.map(p => p.id) || [];
    const currentSelected = selectedPermissions[category] || [];
    
    if (currentSelected.length === categoryPermissions.length) {
      // Deselect all
      setSelectedPermissions(prev => ({
        ...prev,
        [category]: []
      }));
    } else {
      // Select all
      setSelectedPermissions(prev => ({
        ...prev,
        [category]: categoryPermissions
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const roleData = {
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: getAllSelectedPermissionIds()
      };

      if (isEditing && editRoleId) {
        await updateRole(editRoleId, roleData);
        console.log('Role updated successfully');
      } else {
        await createRole(roleData);
        console.log('Role created successfully');
      }

      router.push('/dashboard/users/roles');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/users/roles" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loading Role...</h1>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/users/roles"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? (
                <span className="flex items-center">
                  <Edit className="h-6 w-6 mr-2" />
                  Edit Role
                </span>
              ) : (
                'Create New Role'
              )}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Edit role details and permissions' : 'Create a new role and assign permissions'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => router.push('/dashboard/users/roles')}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !roleName.trim()}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-600 hover:to-primary text-white rounded-lg text-sm font-medium transition-all duration-500 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Role' : 'Create Role')}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <RoleInformationForm
            roleName={roleName}
            roleDescription={roleDescription}
            onRoleNameChange={setRoleName}
            onRoleDescriptionChange={setRoleDescription}
          />

          {/* Permissions Section */}
          <PermissionsSection
            sortedCategories={sortedCategories}
            groupedPermissions={groupedPermissions}
            selectedPermissions={selectedPermissions}
            selectedCount={selectedCount}
            totalPermissions={totalPermissions}
            isAllPermissionsSelected={isAllPermissionsSelected}
            onCategoryToggle={handleCategoryToggle}
            onPermissionToggle={handlePermissionToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PermissionSummary
            sortedCategories={sortedCategories}
            groupedPermissions={groupedPermissions}
            selectedPermissions={selectedPermissions}
          />

          <RolePreview
            roleName={roleName}
            roleDescription={roleDescription}
            selectedCount={selectedCount}
            selectedPermissions={selectedPermissions}
            sortedCategories={sortedCategories}
            totalPermissions={totalPermissions}
          />

          <BestPracticesGuide />
        </div>
      </div>
    </div>
  );
}