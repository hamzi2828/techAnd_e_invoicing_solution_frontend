'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Shield,
  Crown,
  Settings
 
} from 'lucide-react';
import { StatsCard, RolesTable } from '../components';
import { useRoles } from '../hooks';

export default function RolesPage() {
  const { roles, permissions, loading, error, refreshRoles } = useRoles();
  const router = useRouter();

  const handleCreateRole = () => {
    router.push('/dashboard/users/addRole');
  };

  const roleStats = [
    {
      title: 'Total Roles',
      value: roles.length.toString(),
      change: 0,
      changeType: 'increase' as const,
      icon: Shield,
      color: 'bg-gradient-to-br from-purple-500 to-violet-500',
    },
    {
      title: 'Active Roles',
      value: roles.filter(r => r.name !== 'Inactive').length.toString(),
      change: 0,
      changeType: 'increase' as const,
      icon: Crown,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      title: 'Total Permissions',
      value: permissions.length.toString(),
      change: 0,
      changeType: 'increase' as const,
      icon: Settings,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    },
  ];

  if (loading) {
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
              <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="text-sm text-gray-600 mt-1">Manage user roles and their permissions</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
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
              <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="text-sm text-gray-600 mt-1">Manage user roles and their permissions</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading roles</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={refreshRoles}
                className="mt-2 text-sm text-red-600 underline hover:text-red-500"
              >
                Try again
              </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-sm text-gray-600 mt-1">Manage user roles and their permissions</p>
          </div>
        </div>
        <button
          onClick={handleCreateRole}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-500 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <RolesTable roles={roles} />
    </div>
  );
}