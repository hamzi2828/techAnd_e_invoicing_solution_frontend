'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useUserDetails } from '../../hooks/useUserDetails';
import { CompanyService } from '../../../company/services/companyService';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  UserInformation,
  AccountStatus,
  RoleAssignment,
  UserProfile,
  AccountDetails,
  RecentActivity,
  SecurityNotice
} from '../components';

interface Company {
  _id?: string;
  id?: string;
  companyName: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const {
    user,
    loading,
    error,
    saving,
    availableRoles,
    saveChanges,
    updateUserPassword
  } = useUserDetails(userId);
  
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userStatus, setUserStatus] = useState<'active' | 'inactive' | 'pending'>('active');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await CompanyService.getCompaniesCreatedByMe();
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  React.useEffect(() => {
    if (user && availableRoles.length > 0) {
      setUserStatus(user.status as 'active' | 'inactive' | 'pending');

      // Set assigned company if user has one
      if (user.assignedCompanyId) {
        setSelectedCompany(user.assignedCompanyId);
      }

      // Find the role ID from available roles that matches the user's current role
      const currentRole = availableRoles.find(r =>
        r.name.toLowerCase() === user.role.name.toLowerCase() ||
        r.id === user.role.name.toLowerCase()
      );

      if (currentRole) {
        // Store the role ID for the backend (which expects "user", "admin", "moderator")
        setSelectedRole(currentRole.id || currentRole.name.toLowerCase());
      } else {
        // Fallback to user's role name
        setSelectedRole(user.role.name.toLowerCase());
      }

      console.log('User setup:', {
        userRole: user.role.name,
        selectedRole: currentRole?.id || user.role.name.toLowerCase(),
        availableRoles: availableRoles.map(r => ({ id: r.id, name: r.name })),
        assignedCompanyId: user.assignedCompanyId,
        selectedCompany
      });
    }
  }, [user, availableRoles]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleSaveChanges = async () => {
    try {
      console.log('HandleSaveChanges - Current state:', {
        userStatus,
        selectedRole,
        assignedCompanyId: selectedCompany,
        availableRoles: availableRoles.map(r => ({ id: r.id, name: r.name }))
      });

      // Pass selectedCompany as null if empty string, otherwise as is
      const assignedCompanyId = selectedCompany || null;
      await saveChanges(userStatus, selectedRole, assignedCompanyId);
      alert('User updated successfully!');
    } catch (err) {
      alert('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleUpdatePassword = async (newPassword: string) => {
    try {
      await updateUserPassword(newPassword);
      alert('Password updated successfully!');
    } catch (err) {
      alert('Failed to update password');
      console.error('Error updating password:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-blue-800">User not found</span>
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
            href="/admin/users"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details: {user.firstName} {user.lastName}</h1>
            <p className="text-sm text-gray-600 mt-1">View and manage user information and role</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => router.push('/admin/users')}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveChanges}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <UserInformation user={user} />
          <AccountStatus
            userStatus={userStatus}
            onStatusChange={(status) => setUserStatus(status)}
            showResetPassword={showResetPassword}
            onToggleResetPassword={() => setShowResetPassword(!showResetPassword)}
            onUpdatePassword={handleUpdatePassword}
          />
          <RoleAssignment
            availableRoles={availableRoles}
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
          />

          {/* Assigned Company */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Company</h3>
            <p className="text-sm text-gray-600 mb-4">
              Assign a company (from companies you created) to this user
              {selectedCompany && companies.length > 0 && (
                <span className="block mt-1 text-xs text-green-600">
                  ✓ Currently assigned to: {companies.find(c => (c._id || c.id) === selectedCompany)?.companyName}
                </span>
              )}
            </p>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              disabled={companies.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">No Company Assigned</option>
              {companies.map((company) => (
                <option key={company._id || company.id} value={company._id || company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
            {companies.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">No companies available. Create a company first to assign.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <UserProfile user={user} userStatus={userStatus} />
          <AccountDetails user={user} />
          <RecentActivity />
          <SecurityNotice />
        </div>
      </div>
    </div>
  );
}