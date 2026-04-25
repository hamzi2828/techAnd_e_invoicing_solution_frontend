'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  DollarSign,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  Calculator,
  FileEdit,
  Send,
} from 'lucide-react';
import { BarChart3, Activity } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UsageDashboard } from '@/components/UsageDashboard';
import dashboardService, {
  SalesOverview,
  MonthlyRevenue,
  InvoiceDistribution,
  RecentInvoice,
} from './services/dashboardService';
import { CustomerService } from './customers/services/customerService';
import type { CustomerDetails } from './customers/types';
import { InvoiceService } from './sales/all-invoices/services/invoiceService';
import type { InvoiceStats as IInvoiceStats } from './sales/all-invoices/types';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  gradientStyle?: React.CSSProperties;
  loading?: boolean;
}

const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7days' },
  { label: 'Last 30 days', value: '30days' },
  { label: 'Last 3 months', value: '3months' },
  { label: 'Last 6 months', value: '6months' },
  { label: 'Last 12 months', value: '12months' },
];

export default function AdminDashboard() {
  const { gradientFrom, gradientTo } = useTheme();
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Dashboard data states
  const [salesOverview, setSalesOverview] = useState<SalesOverview | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [invoiceDistribution, setInvoiceDistribution] = useState<InvoiceDistribution[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<IInvoiceStats | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setStatsLoading(true);
        setInvoicesLoading(true);
      }

      // Fetch both dashboard data and invoice stats in parallel
      const [data, stats] = await Promise.all([
        dashboardService.getDashboardData({ dateRange }),
        InvoiceService.getInvoiceStats()
      ]);

      setSalesOverview(data.salesOverview);
      setMonthlyRevenue(data.monthlyRevenue);
      setInvoiceDistribution(data.invoiceDistribution);
      setRecentInvoices(data.recentInvoices);
      setInvoiceStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setStatsLoading(false);
      setInvoicesLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true);
      const { customers: customerData } = await CustomerService.getAllCustomers({ limit: 5 });
      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch dashboard data when date range changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Build stats from API data
  const getStats = (): StatCard[] => {
    if (salesOverview) {
      return [
        {
          title: 'Total Revenue',
          value: salesOverview.totalRevenue.formatted,
          change: Math.abs(salesOverview.totalRevenue.change),
          changeType: salesOverview.totalRevenue.changeType,
          icon: DollarSign,
          color: '',
          gradientStyle: { backgroundImage: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` },
          loading: statsLoading,
        },
        {
          title: 'Total Invoices',
          value: salesOverview.totalInvoices.formatted,
          change: Math.abs(salesOverview.totalInvoices.change),
          changeType: salesOverview.totalInvoices.changeType,
          icon: FileText,
          color: '',
          gradientStyle: { backgroundImage: `linear-gradient(to bottom right, ${gradientTo}, ${gradientFrom})` },
          loading: statsLoading,
        },
        {
          title: 'Active Customers',
          value: salesOverview.activeCustomers.formatted,
          change: Math.abs(salesOverview.activeCustomers.change),
          changeType: salesOverview.activeCustomers.changeType,
          icon: Users,
          color: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700',
          loading: statsLoading,
        },
        {
          title: 'Draft',
          value: invoiceStats ? invoiceStats.draftInvoices.toString() : '0',
          change: 0,
          changeType: 'increase',
          icon: FileEdit,
          color: 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700',
          loading: statsLoading,
        },
        {
          title: 'Sent',
          value: invoiceStats ? invoiceStats.sentInvoices.toString() : '0',
          change: 0,
          changeType: 'increase',
          icon: Send,
          color: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700',
          loading: statsLoading,
        },
        {
          title: 'Outstanding',
          value: invoiceStats ? `SAR ${invoiceStats.totalOutstanding.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : 'SAR 0',
          change: 0,
          changeType: 'increase',
          icon: Clock,
          color: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600',
          loading: statsLoading,
        },
        {
          title: 'Average Value',
          value: invoiceStats ? `SAR ${invoiceStats.averageInvoiceValue.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : 'SAR 0',
          change: 0,
          changeType: 'increase',
          icon: Calculator,
          color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
          loading: statsLoading,
        },
      ];
    }

    // Fallback stats if API fails
    return [
      {
        title: 'Total Revenue',
        value: 'SAR 0',
        change: 0,
        changeType: 'increase',
        icon: DollarSign,
        color: '',
        gradientStyle: { backgroundImage: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` },
        loading: statsLoading,
      },
      {
        title: 'Total Invoices',
        value: '0',
        change: 0,
        changeType: 'increase',
        icon: FileText,
        color: '',
        gradientStyle: { backgroundImage: `linear-gradient(to bottom right, ${gradientTo}, ${gradientFrom})` },
        loading: statsLoading,
      },
      {
        title: 'Active Customers',
        value: customers.filter(c => c.status === 'active').length.toString(),
        change: customers.length > 0 ? 8.5 : 0,
        changeType: 'increase',
        icon: Users,
        color: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700',
        loading: customersLoading,
      },
      {
        title: 'Draft',
        value: invoiceStats ? invoiceStats.draftInvoices.toString() : '0',
        change: 0,
        changeType: 'increase',
        icon: FileEdit,
        color: 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700',
        loading: statsLoading,
      },
      {
        title: 'Sent',
        value: invoiceStats ? invoiceStats.sentInvoices.toString() : '0',
        change: 0,
        changeType: 'increase',
        icon: Send,
        color: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700',
        loading: statsLoading,
      },
      {
        title: 'Outstanding',
        value: invoiceStats ? `SAR ${invoiceStats.totalOutstanding.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : 'SAR 0',
        change: 0,
        changeType: 'increase',
        icon: Clock,
        color: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600',
        loading: statsLoading,
      },
      {
        title: 'Average Value',
        value: invoiceStats ? `SAR ${invoiceStats.averageInvoiceValue.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : 'SAR 0',
        change: 0,
        changeType: 'increase',
        icon: Calculator,
        color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
        loading: statsLoading,
      },
    ];
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
    fetchCustomers();
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const selectedDateLabel = DATE_RANGE_OPTIONS.find(opt => opt.value === dateRange)?.label || 'Last 30 days';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {selectedDateLabel}
            </button>
            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      dateRange === option.value ? 'font-medium' : 'text-gray-700'
                    }`}
                    style={dateRange === option.value ? { backgroundColor: `${gradientFrom}15`, color: gradientFrom } : undefined}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {getStats().map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-2 rounded-lg`} style={stat.gradientStyle}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-600">{stat.title}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {stat.loading ? (
                  <span className="animate-pulse bg-gray-200 rounded h-6 w-16 inline-block"></span>
                ) : (
                  stat.value
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Usage Dashboard */}
      <UsageDashboard />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Monthly revenue for the selected period</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          {statsLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-48 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : monthlyRevenue.length > 0 ? (
            (() => {
              const chartData = monthlyRevenue.slice(-6);
              const maxRevenue = Math.max(...chartData.map(d => d.revenue));
              const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
              const yAxisSteps = 5;
              const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
                Math.round((maxRevenue / yAxisSteps) * (yAxisSteps - i))
              );

              const formatValue = (value: number) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              };

              return (
                <div className="h-72">
                  {/* Total Revenue Summary */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        SAR {totalRevenue.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">Total</span>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="flex h-48">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between pr-3 text-right w-16">
                      {yAxisValues.map((value, index) => (
                        <span key={index} className="text-xs text-gray-400 leading-none">
                          {formatValue(value)}
                        </span>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 relative">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {yAxisValues.map((_, index) => (
                          <div key={index} className="border-t border-gray-100 w-full"></div>
                        ))}
                      </div>

                      {/* Bars Container */}
                      <div className="absolute inset-0 flex items-end justify-around gap-3 px-2">
                        {chartData.map((data, index) => {
                          const heightPercent = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                          // Calculate height in pixels (container is 192px / h-48)
                          const heightPx = Math.max((heightPercent / 100) * 180, 8);
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                              {/* Tooltip */}
                              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-lg pointer-events-none">
                                <div className="font-semibold">SAR {data.revenue.toLocaleString()}</div>
                                <div className="text-gray-300">{data.invoices} invoices</div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                              </div>

                              {/* Bar */}
                              <div
                                className="w-full max-w-12 rounded-t-md transition-all duration-500 cursor-pointer shadow-md hover:shadow-lg hover:opacity-90"
                                style={{ height: `${heightPx}px`, minHeight: '8px', backgroundImage: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})` }}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex mt-3 pl-16">
                    <div className="flex-1 flex justify-around gap-2 px-2">
                      {chartData.map((data, index) => (
                        <div key={index} className="flex-1 text-center">
                          <span className="text-xs font-medium text-gray-600">{data.month}</span>
                          {data.year && (
                            <span className="text-xs text-gray-400 block">{data.year}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No revenue data available</p>
                <p className="text-xs text-gray-400 mt-1">Create invoices to see revenue trends</p>
              </div>
            </div>
          )}
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
          {statsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : invoiceDistribution.length > 0 ? (
            <div className="h-64 flex flex-col justify-center">
              <div className="space-y-4">
                {invoiceDistribution.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">{item.status}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.status.toLowerCase() === 'paid'
                              ? 'bg-green-500'
                              : item.status.toLowerCase() === 'pending'
                              ? 'bg-yellow-500'
                              : item.status.toLowerCase() === 'overdue'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No invoice data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
              <Link href="/dashboard/sales/all-invoices" className="text-sm font-medium" style={{ color: gradientFrom }}>
                View all
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {invoicesLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentInvoices.length > 0 ? (
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
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                          {formatStatus(invoice.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent invoices found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Customers</h2>
              <Link href="/dashboard/customers" className="text-sm font-medium" style={{ color: gradientFrom }}>
                View all
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {customersLoading ? (
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
            ) : customers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.slice(0, 5).map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: `${gradientFrom}20` }}>
                              <span className="text-xs font-medium" style={{ color: gradientFrom }}>
                                {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.email || customer.phone || 'No contact'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          customer.type === 'business'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {customer.type === 'business' ? 'Business' : 'Individual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No customers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
