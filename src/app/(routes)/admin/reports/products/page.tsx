'use client';

import React, { useState } from 'react';
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  AlertCircle,
  Star,
  Layers,
  Box,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface ReportCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  avgPrice: number;
  stock: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

interface CategoryPerformance {
  category: string;
  products: number;
  revenue: number;
  percentage: number;
  color: string;
}

interface InventoryAlert {
  product: string;
  sku: string;
  currentStock: number;
  status: 'critical' | 'low' | 'warning';
  reorderPoint: number;
}

const reportCards: ReportCard[] = [
  {
    title: 'Total Products',
    value: '156',
    change: '+8 new',
    changeType: 'increase',
    icon: Package,
  },
  {
    title: 'Total Revenue',
    value: 'SAR 628,500',
    change: '+12.4%',
    changeType: 'increase',
    icon: DollarSign,
  },
  {
    title: 'Units Sold',
    value: '2,456',
    change: '+6.3%',
    changeType: 'increase',
    icon: ShoppingCart,
  },
  {
    title: 'Avg. Product Price',
    value: 'SAR 256',
    change: '-3.2%',
    changeType: 'decrease',
    icon: TrendingUp,
  },
];

const topProducts: ProductPerformance[] = [
  {
    id: '1',
    name: 'Software Development Services',
    category: 'Services',
    sku: 'SRV-001',
    unitsSold: 45,
    revenue: 225000,
    avgPrice: 5000,
    stock: 999,
    trend: 'up',
    changePercent: 15.3,
  },
  {
    id: '2',
    name: 'Web Design Package',
    category: 'Services',
    sku: 'SRV-002',
    unitsSold: 32,
    revenue: 160000,
    avgPrice: 5000,
    stock: 999,
    trend: 'up',
    changePercent: 8.7,
  },
  {
    id: '3',
    name: 'Monthly Maintenance',
    category: 'Subscriptions',
    sku: 'SUB-001',
    unitsSold: 58,
    revenue: 46400,
    avgPrice: 800,
    stock: 999,
    trend: 'stable',
    changePercent: 2.1,
  },
  {
    id: '4',
    name: 'Consulting Services',
    category: 'Services',
    sku: 'SRV-003',
    unitsSold: 28,
    revenue: 84000,
    avgPrice: 3000,
    stock: 999,
    trend: 'up',
    changePercent: 12.5,
  },
  {
    id: '5',
    name: 'Mobile App Development',
    category: 'Services',
    sku: 'SRV-004',
    unitsSold: 15,
    revenue: 112500,
    avgPrice: 7500,
    stock: 999,
    trend: 'down',
    changePercent: -5.2,
  },
];

const categoryPerformance: CategoryPerformance[] = [
  { category: 'Services', products: 48, revenue: 456200, percentage: 45, color: 'bg-blue-500' },
  { category: 'Products', products: 62, revenue: 324800, percentage: 32, color: 'bg-green-500' },
  { category: 'Subscriptions', products: 28, revenue: 156400, percentage: 15, color: 'bg-purple-500' },
  { category: 'Consulting', products: 18, revenue: 81100, percentage: 8, color: 'bg-orange-500' },
];

const inventoryAlerts: InventoryAlert[] = [
  { product: 'Premium Widget Pro', sku: 'PRD-125', currentStock: 5, status: 'critical', reorderPoint: 20 },
  { product: 'Standard Package', sku: 'PRD-089', currentStock: 12, status: 'low', reorderPoint: 25 },
  { product: 'Basic Service Kit', sku: 'PRD-156', currentStock: 18, status: 'warning', reorderPoint: 30 },
  { product: 'Advanced Tools Set', sku: 'PRD-203', currentStock: 8, status: 'low', reorderPoint: 15 },
];

const monthlyTrend = [
  { month: 'Jan', sales: 185, revenue: 92500 },
  { month: 'Feb', sales: 198, revenue: 108300 },
  { month: 'Mar', sales: 215, revenue: 125600 },
  { month: 'Apr', sales: 192, revenue: 118900 },
  { month: 'May', sales: 235, revenue: 145200 },
  { month: 'Jun', sales: 218, revenue: 132800 },
];

export default function ProductReports() {
  const [dateRange, setDateRange] = useState('12months');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const maxRevenue = Math.max(...monthlyTrend.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reports</h1>
          <p className="text-gray-600">Monitor product performance, inventory, and sales</p>
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

      {/* Inventory Alerts */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Inventory Alerts
          </h3>
          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
            {inventoryAlerts.length} Products Need Attention
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {inventoryAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.status === 'critical'
                  ? 'bg-red-50 border-red-300'
                  : alert.status === 'low'
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <Box className={`h-5 w-5 ${
                  alert.status === 'critical' ? 'text-red-600' : alert.status === 'low' ? 'text-orange-600' : 'text-yellow-600'
                }`} />
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  alert.status === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : alert.status === 'low'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {alert.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{alert.product}</p>
              <p className="text-xs text-gray-600 mb-2">SKU: {alert.sku}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Stock:</span>
                <span className="font-semibold text-gray-900">{alert.currentStock} units</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-600">Reorder at:</span>
                <span className="font-semibold text-gray-900">{alert.reorderPoint} units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance by Category</h3>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Categories</option>
            <option value="services">Services</option>
            <option value="products">Products</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="consulting">Consulting</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryPerformance.map((category, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <Layers className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-gray-600">{category.percentage}%</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{category.category}</h4>
              <p className="text-xs text-gray-600 mb-2">{category.products} products</p>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-gray-900">SAR</span>
                <span className="text-2xl font-bold text-gray-900 ml-1">
                  {(category.revenue / 1000).toFixed(0)}k
                </span>
              </div>
              <div className={`mt-3 h-2 rounded-full ${category.color}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Sales Trend</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {monthlyTrend.map((data,) => (
              <div key={data.month} className="flex items-center space-x-3">
                <div className="w-8 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                  <div
                    className="h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-300 flex items-center justify-between px-3"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">{data.sales} units</span>
                    <span className="text-xs font-medium text-white">
                      SAR {(data.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Best Seller</span>
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Software Development</p>
              <p className="text-xs text-gray-600 mt-1">45 units sold • SAR 225,000</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Fastest Growing</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Consulting Services</p>
              <p className="text-xs text-green-600 mt-1">+15.3% growth rate</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Needs Attention</span>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Mobile App Dev</p>
              <p className="text-xs text-red-600 mt-1">-5.2% decline in sales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Products by Revenue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.unitsSold}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      SAR {product.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">SAR {product.avgPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      ) : product.trend === 'down' ? (
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                      ) : (
                        <div className="h-1 w-4 bg-gray-400 mr-1"></div>
                      )}
                      <span
                        className={`text-sm font-medium ${
                          product.trend === 'up'
                            ? 'text-green-600'
                            : product.trend === 'down'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {product.trend === 'stable' ? '0%' : `${product.changePercent > 0 ? '+' : ''}${product.changePercent}%`}
                      </span>
                    </div>
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
