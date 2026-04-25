'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard
} from 'lucide-react';

interface ReportCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

interface MonthlyData {
  month: string;
  revenue: number;
  invoices: number;
  customers: number;
}

interface TopCustomer {
  name: string;
  revenue: number;
  invoices: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

const reportCards: ReportCard[] = [
  {
    title: 'Total Revenue',
    value: 'SAR 1,245,680',
    change: '+15.3%',
    changeType: 'increase',
    icon: DollarSign,
  },
  {
    title: 'Total Invoices',
    value: '1,254',
    change: '+8.7%',
    changeType: 'increase',
    icon: FileText,
  },
  {
    title: 'Active Customers',
    value: '342',
    change: '+12.1%',
    changeType: 'increase',
    icon: Users,
  },
  {
    title: 'Average Invoice',
    value: 'SAR 992',
    change: '-2.4%',
    changeType: 'decrease',
    icon: TrendingUp,
  },
];

const monthlyData: MonthlyData[] = [
  { month: 'Jan', revenue: 98500, invoices: 85, customers: 42 },
  { month: 'Feb', revenue: 112300, invoices: 92, customers: 38 },
  { month: 'Mar', revenue: 125600, invoices: 105, customers: 45 },
  { month: 'Apr', revenue: 108900, invoices: 88, customers: 41 },
  { month: 'May', revenue: 145200, invoices: 118, customers: 52 },
  { month: 'Jun', revenue: 132800, invoices: 101, customers: 48 },
  { month: 'Jul', revenue: 158400, invoices: 125, customers: 56 },
  { month: 'Aug', revenue: 142600, invoices: 112, customers: 49 },
  { month: 'Sep', revenue: 167300, invoices: 135, customers: 61 },
  { month: 'Oct', revenue: 175800, invoices: 142, customers: 58 },
  { month: 'Nov', revenue: 189200, invoices: 158, customers: 64 },
  { month: 'Dec', revenue: 198600, invoices: 168, customers: 67 },
];

const topCustomers: TopCustomer[] = [
  { name: 'Ahmed Al-Rashid Trading Co.', revenue: 45600, invoices: 12 },
  { name: 'Tech Corp Solutions', revenue: 38900, invoices: 8 },
  { name: 'Al-Zahra Business Group', revenue: 32100, invoices: 15 },
  { name: 'Modern Enterprises Ltd.', revenue: 28700, invoices: 9 },
  { name: 'Green Valley Industries', revenue: 24500, invoices: 11 },
];

const topProducts: TopProduct[] = [
  { name: 'Software Development Services', sales: 45, revenue: 225000 },
  { name: 'Web Design Package', sales: 32, revenue: 160000 },
  { name: 'Monthly Maintenance', sales: 58, revenue: 46400 },
  { name: 'Consulting Services', sales: 28, revenue: 84000 },
  { name: 'Mobile App Development', sales: 15, revenue: 112500 },
];

export default function SalesReports() {
  const [dateRange, setDateRange] = useState('12months');

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600">Analyze your sales performance and trends</p>
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
            <option value="custom">Custom Range</option>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Last 12 months</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-3">
            {monthlyData.slice(-6).map((data) => (
              <div key={data.month} className="flex items-center space-x-3">
                <div className="w-8 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                  <div
                    className="h-8 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 rounded-full transition-all duration-300 flex items-center justify-end pr-3"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      SAR {(data.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Status Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Invoice Status Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[
              { status: 'Paid', count: 856, color: 'bg-green-500', percentage: 68 },
              { status: 'Pending', count: 234, color: 'bg-yellow-500', percentage: 19 },
              { status: 'Overdue', count: 98, color: 'bg-red-500', percentage: 8 },
              { status: 'Draft', count: 66, color: 'bg-gray-500', percentage: 5 },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{item.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">{item.count}</span>
                  <span className="text-xs text-gray-500 w-10 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods & Sales Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[
              { method: 'Bank Transfer', amount: 542800, percentage: 44, color: 'bg-blue-500' },
              { method: 'Credit Card', amount: 373704, percentage: 30, color: 'bg-purple-500' },
              { method: 'Cash', amount: 249136, percentage: 20, color: 'bg-green-500' },
              { method: 'Other', amount: 80040, percentage: 6, color: 'bg-gray-500' },
            ].map((item) => (
              <div key={item.method} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.method}</span>
                  <span className="text-sm font-semibold text-gray-900">SAR {item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[
              { category: 'Services', amount: 622840, sales: 178, color: 'bg-indigo-500' },
              { category: 'Products', amount: 373704, sales: 145, color: 'bg-primary-500' },
              { category: 'Consulting', amount: 186852, sales: 89, color: 'bg-amber-500' },
              { category: 'Support', amount: 62284, sales: 56, color: 'bg-cyan-500' },
            ].map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.sales} sales)</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">SAR {item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${(item.amount / 622840) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers by Revenue</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.invoices} invoices</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">SAR {customer.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Products by Revenue</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">SAR {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
