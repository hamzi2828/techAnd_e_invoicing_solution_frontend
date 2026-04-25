'use client';

import React from 'react';
import { PageHeader, UsersTable } from './components';
import { useUsers } from './hooks';
import { usePlan } from '@/contexts/PlanContext';

export default function UsersPage() {
  const { users, loading, error, refreshUsers } = useUsers();
  const { canCreate, planInfo } = usePlan();

  // Plan limit check
  const userCheck = canCreate('user');


  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          subtitle="Manage users, roles, and permissions across your organization."
          userCheck={userCheck}
          currentPlanName={planInfo?.currentPlan?.name}
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          subtitle="Manage users, roles, and permissions across your organization."
          userCheck={userCheck}
          currentPlanName={planInfo?.currentPlan?.name}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={refreshUsers}
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
      <PageHeader
        title="User Management"
        subtitle="Manage users, roles, and permissions across your organization."
        userCheck={userCheck}
        currentPlanName={planInfo?.currentPlan?.name}
      />




      <UsersTable users={users} />
    </div>
  );
}