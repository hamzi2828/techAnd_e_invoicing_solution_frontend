'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Shield,
  Check,
  AlertCircle,
  Info,
  Edit
} from 'lucide-react';
import { useRoles } from '../hooks';

interface SelectedPermissions {
  [category: string]: string[];
}

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
          const category = permission.category;
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
            const category = permission.category;
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

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

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

  // Get all selected permission IDs
  const getAllSelectedPermissionIds = (): string[] => {
    return Object.values(selectedPermissions).flat();
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

      router.push('/admin/users/roles');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = getAllSelectedPermissionIds().length;
  const totalPermissions = permissions.length;

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users/roles" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
            href="/admin/users/roles"
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
            onClick={() => router.push('/admin/users/roles')}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !roleName.trim()}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter role name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter role description"
                />
              </div>

            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assign Permissions</h2>
              <span className="text-sm text-gray-500">
                {selectedCount} of {totalPermissions} selected
              </span>
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                const selectedInCategory = selectedPermissions[category] || [];
                const isAllSelected = selectedInCategory.length === categoryPermissions.length;
                
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className={`flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors ${
                            isAllSelected ? 'text-primary' : 'text-gray-700'
                          }`}
                        >
                          <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                            isAllSelected ? 'bg-primary-500 border-primary' : 'border-gray-300 hover:border-primary'
                          }`}>
                            {isAllSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span>{category}</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedInCategory.length}/{categoryPermissions.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => {
                        const isSelected = selectedInCategory.includes(permission.id);
                        
                        return (
                          <button
                            key={permission.id}
                            type="button"
                            onClick={() => handlePermissionToggle(category, permission.id)}
                            className="flex items-start space-x-3 text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className={`mt-1 w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-primary-500 border-primary' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                              <p className="text-xs text-gray-600">{permission.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permission Summary */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
            <div className="flex items-center mb-3">
              <Info className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Permission Summary</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                const selectedCount = (selectedPermissions[category] || []).length;
                const totalCount = categoryPermissions.length;
                const percentage = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">{selectedCount}/{totalCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Preview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Role Preview</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  {roleName || 'New Role'}
                </span>
              </div>
              <p className="text-sm text-gray-600 pl-7">
                {roleDescription || 'No description provided'}
              </p>
              <div className="flex items-center justify-end pl-7">
                <span className="text-xs text-gray-500">{selectedCount} permissions</span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Best Practices</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use descriptive role names</li>
                  <li>• Follow the principle of least privilege</li>
                  <li>• Set appropriate role levels</li>
                  <li>• Test roles before assigning to users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}