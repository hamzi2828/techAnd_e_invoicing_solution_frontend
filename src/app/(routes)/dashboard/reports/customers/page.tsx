'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock
} from 'lucide-react';

interface ReportCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  revenue: number;
  color: string;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  invoices: number;
  lastPurchase: string;
  status: 'active' | 'inactive';
}

interface CustomerActivity {
  month: string;
  newCustomers: number;
  activeCustomers: number;
  churnedCustomers: number;
}

const reportCards: ReportCard[] = [
  {
    title: 'Total Customers',
    value: '342',
    change: '+12.1%',
    changeType: 'increase',
    icon: Users,
  },
  {
    title: 'New This Month',
    value: '45',
    change: '+8.4%',
    changeType: 'increase',
    icon: UserPlus,
  },
  {
    title: 'Avg. Customer Value',
    value: 'SAR 3,642',
    change: '+5.3%',
    changeType: 'increase',
    icon: DollarSign,
  },
  {
    title: 'Retention Rate',
    value: '87%',
    change: '-2.1%',
    changeType: 'decrease',
    icon: TrendingUp,
  },
];

const customerSegments: CustomerSegment[] = [
  { segment: 'VIP Customers', count: 28, percentage: 8, revenue: 456000, color: 'bg-purple-500' },
  { segment: 'Regular Customers', count: 145, percentage: 42, revenue: 523400, color: 'bg-blue-500' },
  { segment: 'Occasional Buyers', count: 102, percentage: 30, revenue: 186800, color: 'bg-green-500' },
  { segment: 'New Customers', count: 67, percentage: 20, revenue: 79480, color: 'bg-yellow-500' },
];

const topCustomers: TopCustomer[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid Trading Co.',
    email: 'contact@ahmed-trading.sa',
    phone: '+966 50 123 4567',
    totalSpent: 456000,
    invoices: 48,
    lastPurchase: '2 days ago',
    status: 'active',
  },
  {
    id: '2',
    name: 'Tech Corp Solutions',
    email: 'info@techcorp.com',
    phone: '+966 55 987 6543',
    totalSpent: 389000,
    invoices: 36,
    lastPurchase: '5 days ago',
    status: 'active',
  },
  {
    id: '3',
    name: 'Al-Zahra Business Group',
    email: 'sales@alzahra.sa',
    phone: '+966 50 246 8135',
    totalSpent: 321000,
    invoices: 52,
    lastPurchase: '1 week ago',
    status: 'active',
  },
  {
    id: '4',
    name: 'Modern Enterprises Ltd.',
    email: 'contact@modern-ent.com',
    phone: '+966 54 321 9876',
    totalSpent: 287000,
    invoices: 29,
    lastPurchase: '3 days ago',
    status: 'active',
  },
  {
    id: '5',
    name: 'Green Valley Industries',
    email: 'info@greenvalley.sa',
    phone: '+966 50 555 4444',
    totalSpent: 245000,
    invoices: 41,
    lastPurchase: '1 day ago',
    status: 'active',
  },
];

const customerActivity: CustomerActivity[] = [
  { month: 'Jan', newCustomers: 12, activeCustomers: 245, churnedCustomers: 8 },
  { month: 'Feb', newCustomers: 18, activeCustomers: 255, churnedCustomers: 5 },
  { month: 'Mar', newCustomers: 22, activeCustomers: 272, churnedCustomers: 7 },
  { month: 'Apr', newCustomers: 15, activeCustomers: 280, churnedCustomers: 6 },
  { month: 'May', newCustomers: 28, activeCustomers: 302, churnedCustomers: 4 },
  { month: 'Jun', newCustomers: 19, activeCustomers: 317, churnedCustomers: 9 },
];

export default function CustomerReports() {
  const [dateRange, setDateRange] = useState('12months');
  const [customerSegment, setCustomerSegment] = useState('all');

  const maxActiveCustomers = Math.max(...customerActivity.map(d => d.activeCustomers));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reports</h1>
          <p className="text-gray-600">Track customer activity, purchases, and engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="12months">Last 12 months</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg">
            <Download className="h-4 w-4" />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'}`}>
                <card.icon className={`h-6 w-6 ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {card.changeType === 'increase' ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Segmentation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Customer Segmentation</h3>
          <select
            value={customerSegment}
            onChange={(e) => setCustomerSegment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Segments</option>
            <option value="vip">VIP Only</option>
            <option value="regular">Regular Only</option>
            <option value="occasional">Occasional Only</option>
            <option value="new">New Only</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {customerSegments.map((segment, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                <span className="text-sm font-medium text-gray-600">{segment.percentage}%</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{segment.segment}</h4>
              <p className="text-2xl font-bold text-gray-900 mb-1">{segment.count}</p>
              <p className="text-xs text-gray-600">SAR {segment.revenue.toLocaleString()} revenue</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Growth</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {customerActivity.map((data) => (
              <div key={data.month} className="flex items-center space-x-3">
                <div className="w-8 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                  <div
                    className="h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 flex items-center justify-end pr-3"
                    style={{ width: `${(data.activeCustomers / maxActiveCustomers) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {data.activeCustomers}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium w-8">+{data.newCustomers}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Lifecycle */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Lifecycle</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[
              { stage: 'New Customers', count: 67, percentage: 20, color: 'bg-green-500', desc: 'First purchase made' },
              { stage: 'Active Customers', count: 247, percentage: 72, color: 'bg-blue-500', desc: 'Regular purchases' },
              { stage: 'At Risk', count: 18, percentage: 5, color: 'bg-yellow-500', desc: 'No purchase in 60 days' },
              { stage: 'Churned', count: 10, percentage: 3, color: 'bg-red-500', desc: 'No purchase in 90+ days' },
            ].map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                    <p className="text-xs text-gray-500">{stage.desc}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stage.color}`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customers by City</h3>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[
              { city: 'Riyadh', customers: 145, percentage: 42 },
              { city: 'Jeddah', customers: 89, percentage: 26 },
              { city: 'Dammam', customers: 52, percentage: 15 },
              { city: 'Makkah', customers: 34, percentage: 10 },
              { city: 'Madinah', customers: 22, percentage: 7 },
            ].map((location) => (
              <div key={location.city} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-900">{location.city}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-blue-600"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">{location.customers}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Engagement */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Engagement Metrics</h3>
            <Star className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Average Order Value</span>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">SAR 3,642</p>
              <p className="text-xs text-green-600 mt-1">+5.3% from last month</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Purchase Frequency</span>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">3.7x/year</p>
              <p className="text-xs text-blue-600 mt-1">+0.4 from last year</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Customer Lifetime</span>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">2.3 years</p>
              <p className="text-xs text-purple-600 mt-1">Average tenure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoices
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Purchase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      SAR {customer.totalSpent.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.invoices}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{customer.lastPurchase}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
