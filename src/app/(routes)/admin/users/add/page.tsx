'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Info,
  Key,
  Settings,
  Users,
  FileText,
  Package,
  BarChart3
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

const roles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full access to all system features and settings',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    permissions: ['all']
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access with some restrictions',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    permissions: ['invoices.manage', 'customers.manage', 'reports.view', 'users.view']
  },
  {
    id: '3',
    name: 'Invoice Manager',
    description: 'Full invoice management capabilities',
    color: 'bg-green-100 text-green-800 border-green-200',
    permissions: ['invoices.create', 'invoices.edit', 'invoices.send', 'customers.view']
  },
  {
    id: '4',
    name: 'Accountant',
    description: 'Financial reporting and invoice viewing',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    permissions: ['invoices.view', 'reports.view', 'customers.view', 'payments.view']
  },
  {
    id: '5',
    name: 'Sales Rep',
    description: 'Customer and invoice creation access',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    permissions: ['invoices.create', 'customers.view', 'products.view']
  },
  {
    id: '6',
    name: 'Viewer',
    description: 'Read-only access to basic features',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    permissions: ['invoices.view', 'customers.view']
  }
];

const permissions: Permission[] = [
  // Invoice Permissions
  { id: 'invoices.view', name: 'View Invoices', description: 'Can view invoice list and details', category: 'Invoices' },
  { id: 'invoices.create', name: 'Create Invoices', description: 'Can create new invoices', category: 'Invoices' },
  { id: 'invoices.edit', name: 'Edit Invoices', description: 'Can modify existing invoices', category: 'Invoices' },
  { id: 'invoices.delete', name: 'Delete Invoices', description: 'Can delete invoices', category: 'Invoices' },
  { id: 'invoices.send', name: 'Send Invoices', description: 'Can send invoices to customers', category: 'Invoices' },
  
  // Customer Permissions
  { id: 'customers.view', name: 'View Customers', description: 'Can view customer list and details', category: 'Customers' },
  { id: 'customers.create', name: 'Create Customers', description: 'Can add new customers', category: 'Customers' },
  { id: 'customers.edit', name: 'Edit Customers', description: 'Can modify customer information', category: 'Customers' },
  { id: 'customers.delete', name: 'Delete Customers', description: 'Can remove customers', category: 'Customers' },
  
  // Product Permissions
  { id: 'products.view', name: 'View Products', description: 'Can view product catalog', category: 'Products' },
  { id: 'products.create', name: 'Create Products', description: 'Can add new products/services', category: 'Products' },
  { id: 'products.edit', name: 'Edit Products', description: 'Can modify product information', category: 'Products' },
  { id: 'products.delete', name: 'Delete Products', description: 'Can remove products', category: 'Products' },
  
  // Reports Permissions
  { id: 'reports.view', name: 'View Reports', description: 'Can access reporting dashboard', category: 'Reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export reports to files', category: 'Reports' },
  { id: 'reports.advanced', name: 'Advanced Reports', description: 'Can create custom reports', category: 'Reports' },
  
  // User Management
  { id: 'users.view', name: 'View Users', description: 'Can view user list', category: 'Users' },
  { id: 'users.create', name: 'Create Users', description: 'Can add new users', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can modify user accounts', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can remove users', category: 'Users' },
  
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'Can view system settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Can modify system settings', category: 'Settings' },
  { id: 'settings.company', name: 'Company Settings', description: 'Can manage company profile', category: 'Settings' }
];

const categoryIcons = {
  'Invoices': FileText,
  'Customers': Users,
  'Products': Package,
  'Reports': BarChart3,
  'Users': User,
  'Settings': Settings
};

export default function AddUserPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customPermissions, setCustomPermissions] = useState(false);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    const role = roles.find(r => r.id === roleId);
    if (role) {
      if (role.permissions.includes('all')) {
        setSelectedPermissions(permissions.map(p => p.id));
      } else {
        setSelectedPermissions(role.permissions);
      }
    }
    setCustomPermissions(false);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
    setCustomPermissions(true);
    setSelectedRole('');
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

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
            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
            <p className="text-sm text-gray-600 mt-1">Create a new user account and assign permissions</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => router.push('/admin/users')}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm">
            <Save className="h-4 w-4 mr-2" />
            Create User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="user@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+966 XX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select Department</option>
                  <option value="it">IT</option>
                  <option value="finance">Finance</option>
                  <option value="sales">Sales</option>
                  <option value="accounting">Accounting</option>
                  <option value="hr">Human Resources</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter job title"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters with uppercase, lowercase, number and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending Verification</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role Assignment */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-primary bg-gradient-to-br from-primary-50 to-blue-50'
                      : customPermissions
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !customPermissions && handleRoleChange(role.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Shield className={`h-5 w-5 ${
                      selectedRole === role.id ? 'text-primary' : 'text-gray-400'
                    }`} />
                    {selectedRole === role.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <h3 className={`font-medium mb-1 ${
                    customPermissions ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {role.name}
                  </h3>
                  <p className={`text-xs ${
                    customPermissions ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
            
            {customPermissions && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Custom permissions are selected. Choose a role above to reset.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
              <span className="text-sm text-gray-500">
                {selectedPermissions.length} of {permissions.length} selected
              </span>
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                const selectedInCategory = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
                
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="font-medium text-gray-900">{category}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedInCategory}/{categoryPermissions.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-start space-x-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                            <p className="text-xs text-gray-600">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
            <div className="text-center">
              <div className="h-24 w-24 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary hover:text-primary-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, or GIF. Max 2MB.
              </p>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Send welcome email</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary mr-3" />
                <span className="text-sm text-gray-700">Force password change on first login</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Enable two-factor authentication</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Send email notifications</span>
              </label>
            </div>
          </div>

          {/* Permission Summary */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
            <div className="flex items-center mb-3">
              <Info className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Permission Summary</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
                const percentage = (selectedCount / categoryPermissions.length) * 100;
                
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
                      <span className="text-xs text-gray-600 w-8">{selectedCount}/{categoryPermissions.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Security Notice</h3>
                <p className="text-sm text-gray-600">
                  Always follow the principle of least privilege. Only grant permissions that are necessary for the user&apos;s role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}