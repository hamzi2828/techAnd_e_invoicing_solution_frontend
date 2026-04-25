'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  FileText,
  ArrowRight,
  PieChart,
  Activity
} from 'lucide-react';

interface ReportCategory {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  stats: {
    label: string;
    value: string;
  }[];
  color: string;
  bgColor: string;
}

const reportCategories: ReportCategory[] = [
  {
    title: 'Sales Reports',
    description: 'Analyze revenue, invoices, and sales performance trends',
    href: '/admin/reports/sales',
    icon: TrendingUp,
    stats: [
      { label: 'Total Revenue', value: 'SAR 1.2M' },
      { label: 'Total Invoices', value: '1,254' },
      { label: 'Avg. Invoice', value: 'SAR 992' },
    ],
    color: 'text-primary',
    bgColor: 'bg-primary-50',
  },
  {
    title: 'Customer Reports',
    description: 'Track customer activity, purchases, and engagement',
    href: '/admin/reports/customers',
    icon: Users,
    stats: [
      { label: 'Active Customers', value: '342' },
      { label: 'New This Month', value: '45' },
      { label: 'Retention Rate', value: '87%' },
    ],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Product Reports',
    description: 'Monitor product performance, inventory, and sales',
    href: '/admin/reports/products',
    icon: Package,
    stats: [
      { label: 'Total Products', value: '156' },
      { label: 'Top Performer', value: 'Software Dev' },
      { label: 'Low Stock', value: '12' },
    ],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

interface QuickStat {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  changeType: 'positive' | 'negative';
}

const quickStats: QuickStat[] = [
  {
    label: 'Total Revenue',
    value: 'SAR 1,245,680',
    change: '+15.3%',
    icon: DollarSign,
    changeType: 'positive',
  },
  {
    label: 'Total Invoices',
    value: '1,254',
    change: '+8.7%',
    icon: FileText,
    changeType: 'positive',
  },
  {
    label: 'Active Customers',
    value: '342',
    change: '+12.1%',
    icon: Users,
    changeType: 'positive',
  },
  {
    label: 'Products Sold',
    value: '2,456',
    change: '+6.3%',
    icon: Package,
    changeType: 'positive',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="12months">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary-50 to-blue-50">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {reportCategories.map((category, index) => (
          <Link
            key={index}
            href={category.href}
            className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${category.bgColor}`}>
                <category.icon className={`h-8 w-8 ${category.color}`} />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              {category.stats.map((stat, statIndex) => (
                <div key={statIndex} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="text-sm font-medium text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                action: 'New invoice created',
                details: 'Invoice #INV-2024-1254 - SAR 5,680',
                time: '5 minutes ago',
                color: 'bg-green-100 text-green-600',
              },
              {
                action: 'Customer added',
                details: 'Modern Tech Solutions LLC',
                time: '1 hour ago',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                action: 'Product updated',
                details: 'Software Development Services',
                time: '2 hours ago',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                action: 'Payment received',
                details: 'Invoice #INV-2024-1250 - SAR 12,340',
                time: '3 hours ago',
                color: 'bg-green-100 text-green-600',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              Quick Insights
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">Best Selling Product</h4>
                <Package className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Software Development Services</p>
              <p className="text-lg font-bold text-gray-900">45 Sales</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">Top Customer</h4>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Ahmed Al-Rashid Trading Co.</p>
              <p className="text-lg font-bold text-gray-900">SAR 45,600</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">Revenue Growth</h4>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Month over Month</p>
              <p className="text-lg font-bold text-gray-900">+15.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Actions */}
      <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 rounded-lg border border-primary-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Custom Reports?</h3>
            <p className="text-sm text-gray-600">
              Generate custom reports tailored to your specific business needs
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg">
            Create Custom Report
          </button>
        </div>
      </div>
    </div>
  );
}
