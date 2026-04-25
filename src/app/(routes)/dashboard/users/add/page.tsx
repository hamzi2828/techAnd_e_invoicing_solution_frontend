'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lock, Zap, Crown, Users, Loader2 } from 'lucide-react';
import {
  PersonalInformationForm,
  AccountSettingsForm,
  RoleSelector,
  ProfilePictureUpload,
  QuickSettings,
  PermissionSummary,
  SecurityNotice,
} from './components';
import { permissions } from '../data/users';
import { UserService } from './service/userService';
import { RolesService } from '../services/rolesService';
import { CompanyService } from '../../company/services/companyService';
import { Role, Permission } from '../types';
import { usePlan } from '@/contexts/PlanContext';

interface Company {
  _id?: string;
  id?: string;
  companyName: string;
}

export default function AddUserPage() {
  const router = useRouter();
  const { canCreate, planInfo, isLoading: isPlanLoading, incrementLocalUsage } = usePlan();

  // Plan limit check
  const userCheck = canCreate('user');

  // Roles, permissions and companies from API
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [apiPermissions, setApiPermissions] = useState<Permission[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState('active');
  const [language, setLanguage] = useState('en');

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customPermissions, setCustomPermissions] = useState(false);

  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [enableTwoFactor, setEnableTwoFactor] = useState(true);
  const [sendEmailNotifications, setSendEmailNotifications] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch roles, permissions and companies on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingRoles(true);
        const [rolesData, permissionsData, companiesData] = await Promise.all([
          RolesService.getRolesCreatedByMe(), // Get only roles created by logged-in user
          RolesService.getAllPermissions(),
          CompanyService.getCompaniesCreatedByMe(),
        ]);
        setRoles(rolesData);
        setApiPermissions(permissionsData);
        setCompanies(companiesData);
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    const role = roles.find(r => r.id === roleId);
    if (role) {
      // Use API permissions if available, fallback to local permissions
      const permissionsToUse = apiPermissions.length > 0 ? apiPermissions : permissions;

      if (role.permissions.includes('all')) {
        setSelectedPermissions(permissionsToUse.map(p => p.id));
      } else {
        setSelectedPermissions(role.permissions);
      }
    }
    setCustomPermissions(false);
  };

  const handleProfileUpload = (file: File) => {
    // Handle profile picture upload
    console.log('Profile picture uploaded:', file);
  };

  const handleCreateUser = async () => {
    setError(null);
    setValidationErrors([]);

    // Prepare user data
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      role: selectedRole,
      companyId: selectedCompany || undefined,
      accountStatus,
      language,
      sendWelcomeEmail,
      forcePasswordChange,
      enableTwoFactor,
      sendEmailNotifications,
    };

    // Validate data
    const errors = UserService.validateUserData(userData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await UserService.createUser(userData);
      console.log('User created successfully:', response);

      // Update local usage count
      incrementLocalUsage('user');

      // Show success message and redirect
      alert('User created successfully!');
      router.push('/dashboard/users');
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching roles or plan
  if (loadingRoles || isPlanLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/users"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
              <p className="text-sm text-gray-600 mt-1">Create a new user account and assign permissions</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show blocked UI if user limit reached
  if (!userCheck.allowed && !userCheck.unlimited) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header with back button */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-amber-50 via-orange-50 to-red-50">
            <Link
              href="/dashboard/users"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Users
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Limit Reached</h1>
            <p className="text-gray-600">You&apos;ve reached the maximum number of users for your current plan.</p>
          </div>

          {/* Limit reached content */}
          <div className="px-6 py-12">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-amber-100 rounded-full mb-6">
                <Lock className="h-10 w-10 text-amber-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Upgrade to Add More Users
              </h2>

              <p className="text-gray-600 mb-6 max-w-md">
                Your <span className="font-medium">{planInfo?.currentPlan?.name || 'Free'}</span> plan allows up to {userCheck.limit} {userCheck.limit === 1 ? 'user' : 'users'}.
                Upgrade your plan to add more users and unlock additional features.
              </p>

              {/* Usage indicator */}
              <div className="w-full max-w-xs mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Users Used</span>
                  <span className="font-medium">{userCheck.current} / {userCheck.limit}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Plan comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 w-full max-w-2xl">
                {[
                  { name: 'Free', limit: 1, current: planInfo?.currentPlan?.name === 'Free' },
                  { name: 'Basic', limit: 1, current: planInfo?.currentPlan?.name === 'Basic' },
                  { name: 'Professional', limit: 5, current: planInfo?.currentPlan?.name === 'Professional' },
                  { name: 'Enterprise', limit: null, current: planInfo?.currentPlan?.name === 'Enterprise' }
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      plan.current
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {plan.current && <Crown className="h-4 w-4 text-primary mr-1" />}
                      <span className={`text-sm font-medium ${plan.current ? 'text-primary' : 'text-gray-700'}`}>
                        {plan.name}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {plan.limit === null ? 'Unlimited' : plan.limit}
                    </p>
                    <p className="text-xs text-gray-500">{plan.limit === 1 ? 'user' : 'users'}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/dashboard/users')}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View My Users
                </button>
                <button
                  onClick={() => router.push('/dashboard/settings?tab=subscription')}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
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
            href="/dashboard/users"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
            <p className="text-sm text-gray-600 mt-1">Create a new user account and assign permissions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Usage indicator */}
          {!userCheck.unlimited && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {userCheck.current} / {userCheck.limit} users
              </span>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard/users')}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-500 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {(error || validationErrors.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error ? 'Error' : 'Validation Errors'}
              </h3>
              {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
              {validationErrors.length > 0 && (
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformationForm
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
          />

          <AccountSettingsForm
            password={password}
            confirmPassword={confirmPassword}
            accountStatus={accountStatus}
            language={language}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onAccountStatusChange={setAccountStatus}
            onLanguageChange={setLanguage}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            onToggleShowConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <RoleSelector
            roles={roles}
            selectedRole={selectedRole}
            customPermissions={customPermissions}
            onRoleSelect={handleRoleChange}
          />

          {/* Assign Company */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Company to User</h3>
            <p className="text-sm text-gray-600 mb-4">Assign one of your companies to this user (optional)</p>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">No Company Assigned</option>
              {companies.map((company) => (
                <option key={company._id || company.id} value={company._id || company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProfilePictureUpload onUpload={handleProfileUpload} />

          <QuickSettings
            sendWelcomeEmail={sendWelcomeEmail}
            forcePasswordChange={forcePasswordChange}
            enableTwoFactor={enableTwoFactor}
            sendEmailNotifications={sendEmailNotifications}
            onSendWelcomeEmailChange={setSendWelcomeEmail}
            onForcePasswordChangeChange={setForcePasswordChange}
            onEnableTwoFactorChange={setEnableTwoFactor}
            onSendEmailNotificationsChange={setSendEmailNotifications}
          />

          <PermissionSummary
            permissions={apiPermissions.length > 0 ? apiPermissions : permissions}
            selectedPermissions={selectedPermissions}
          />

          <SecurityNotice />
        </div>
      </div>
    </div>
  );
}