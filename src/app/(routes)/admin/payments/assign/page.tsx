'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
  Calendar,
  User,
  Mail,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../components';
import { getAuthToken } from '@/helper/helper';

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionStatus?: string;
  currentPlanId?: {
    _id: string;
    name: string;
  } | null;
}

interface Plan {
  _id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isActive: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AssignSubscriptionPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch users and plans
  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName?.toLowerCase().includes(term) ||
            user.lastName?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // Fetch users and plans in parallel
      const [usersRes, plansRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/all`, { headers }),
        fetch(`${API_BASE_URL}/payments/plans`, { headers }),
      ]);

      if (!usersRes.ok) throw new Error('Failed to fetch users');
      if (!plansRes.ok) throw new Error('Failed to fetch plans');

      const usersData = await usersRes.json();
      const plansData = await plansRes.json();

      // Handle users response (support both old and new format)
      const usersList = usersData.users || usersData.data || [];
      if (Array.isArray(usersList)) {
        setUsers(usersList);
      } else {
        console.error('Invalid users response:', usersData);
        throw new Error('Invalid users data format');
      }

      // Handle plans response
      if (plansData.success && plansData.data) {
        setPlans(plansData.data.filter((p: Plan) => p.isActive));
      } else if (Array.isArray(plansData)) {
        setPlans(plansData.filter((p: Plan) => p.isActive));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignSubscription = async () => {
    if (!selectedUser || !selectedPlan) {
      setError('Please select a user and a plan');
      return;
    }

    try {
      setIsAssigning(true);
      setError(null);
      setSuccess(null);

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/payments/admin/assign-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          planId: selectedPlan,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign subscription');
      }

      setSuccess(
        `Successfully assigned ${plans.find((p) => p._id === selectedPlan)?.name} plan to ${selectedUser.firstName} ${selectedUser.lastName}`
      );

      // Reset form
      setSelectedUser(null);
      setSelectedPlan('');
      setSearchTerm('');

      // Refresh users list
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign subscription');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Canceled
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            No Subscription
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assign Subscription"
          subtitle="Manually assign subscription plans to users"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Subscription"
        subtitle="Manually assign subscription plans to users"
      >
        <button
          onClick={fetchData}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </PageHeader>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Select User
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Users List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedUser?._id === user._id
                        ? 'border-primary bg-primary-50 ring-2 ring-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.firstName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(user.subscriptionStatus)}
                        {user.currentPlanId && (
                          <p className="text-xs text-gray-500 mt-1">
                            {user.currentPlanId.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Plan Selection & Assignment */}
        <div className="space-y-6">
          {/* Selected User Card */}
          {selectedUser && (
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200 p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Selected User</h4>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                  {selectedUser.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Select Plan
            </h3>

            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan._id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPlan === plan._id
                      ? 'border-primary bg-primary-50 ring-2 ring-primary'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{plan.name}</span>
                    <span className="text-sm text-gray-600">
                      {plan.currency}{' '}
                      {billingCycle === 'yearly'
                        ? plan.yearlyPrice
                        : plan.monthlyPrice}
                      /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing Cycle */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Billing Cycle
              </h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Assign Button */}
            <button
              onClick={handleAssignSubscription}
              disabled={!selectedUser || !selectedPlan || isAssigning}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Assign Subscription
                </>
              )}
            </button>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <CreditCard className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                <p className="text-xs text-blue-700">
                  This will create a subscription without payment. Use this for
                  complimentary access, trials, or manual billing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
