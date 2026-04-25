'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { StatsCard, PageHeader, SubscriptionsTable } from '../components';

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);

  // TODO: Replace with actual API data
  const subscriptionStats: Array<{
    title: string;
    value: string;
    change?: number;
    changeType?: 'increase' | 'decrease';
    icon: React.ComponentType;
    color?: string;
  }> = [];
  const subscriptions: Array<{
    id: string;
    customer: {
      name: string;
      email: string;
    };
    status: 'active' | 'paused' | 'cancelled' | 'past_due';
    plan: {
      name: string;
      price: number;
      billing: 'monthly' | 'yearly';
    };
    amount: string;
    nextBilling: string;
    startDate: string;
    totalRevenue: number;
    paymentMethod: string;
  }> = [];

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!sub.customer) return false;

    const matchesSearch = sub.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        subtitle="Manage all customer subscriptions and billing cycles."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionStats.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border p-8">
            <div className="text-center">
              <p className="text-gray-500">Subscription statistics will be available when connected to API</p>
            </div>
          </div>
        ) : (
          subscriptionStats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color="bg-gradient-to-br from-primary-50 to-blue-50"
              showMenu={false}
            />
          ))
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-primary-50 rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-primary-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
              <option value="past_due">Past Due</option>
            </select>
          </div>
          <span className="px-3 py-1.5 bg-gradient-to-r from-primary-100 via-blue-100 to-indigo-100 text-primary-700 text-sm font-medium rounded-full border border-primary-200">
            {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </span>
        </div>
      </div>

      <SubscriptionsTable
        subscriptions={filteredSubscriptions}
        selectedSubscriptions={selectedSubscriptions}
        onSelectionChange={setSelectedSubscriptions}
      />

      {selectedSubscriptions.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedSubscriptions.length} subscription{selectedSubscriptions.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
              Export Selected
            </button>
            <button className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200">
              Pause Selected
            </button>
            <button className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200">
              Cancel Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}