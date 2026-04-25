'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { BarChart3, Activity } from 'lucide-react';
import { UserService } from './users/services/userService';
import type { User } from './users/types';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}

const getStats = (users: User[]): StatCard[] => [
  {
    title: 'Total Revenue',
    value: 'SAR 125,432',
    change: 12.5,
    changeType: 'increase',
    icon: DollarSign,
    color: 'bg-gradient-to-br from-primary via-blue-600 to-indigo-700',
  },
  {
    title: 'Total Invoices',
    value: '1,234',
    change: 8.2,
    changeType: 'increase',
    icon: FileText,
    color: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700',
  },
  {
    title: 'Active Users',
    value: users.filter(user => user.status === 'active').length.toString(),
    change: users.length > 0 ? 8.5 : 0,
    changeType: 'increase',
    icon: Users,
    color: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700',
  },
  {
    title: 'Products Sold',
    value: '789',
    change: 15.3,
    changeType: 'increase',
    icon: Package,
    color: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700',
  },
];

const recentInvoices = [
  { id: 'INV-2024-001', customer: 'Ahmed Al-Rashid', amount: 'SAR 5,432', status: 'Paid', date: '2024-01-15' },
  { id: 'INV-2024-002', customer: 'Sara Abdullah', amount: 'SAR 3,210', status: 'Pending', date: '2024-01-14' },
  { id: 'INV-2024-003', customer: 'Mohammed Hassan', amount: 'SAR 8,765', status: 'Paid', date: '2024-01-13' },
  { id: 'INV-2024-004', customer: 'Fatima Al-Zahrani', amount: 'SAR 2,345', status: 'Overdue', date: '2024-01-12' },
  { id: 'INV-2024-005', customer: 'Khalid Ibrahim', amount: 'SAR 6,789', status: 'Draft', date: '2024-01-11' },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userData = await UserService.getAllUsers();
        setUsers(userData);

      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here &apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStats(users).map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading && stat.title === 'Active Users' ? (
                  <span className="animate-pulse bg-gray-200 rounded h-8 w-16 inline-block"></span>
                ) : (
                  stat.value
                )}
              </p>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{stat.change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">{stat.change}%</span>
                </>
              )}
              <span className="text-sm text-gray-600 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Monthly revenue for the last 6 months</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Invoice Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Status</h2>
              <p className="text-sm text-gray-600 mt-1">Current invoice status distribution</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Status chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
              <a href="/admin/invoices" className="text-sm text-primary hover:text-primary-700 font-medium">
                View all
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : invoice.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <a href="/admin/users" className="text-sm text-primary hover:text-primary-700 font-medium">
                View all
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.slice(0, 5).map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-800">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role.color}`}>
                          {user.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
