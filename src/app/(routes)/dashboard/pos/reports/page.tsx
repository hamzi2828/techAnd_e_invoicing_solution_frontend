'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Download,
  Package,
  Receipt,
  Banknote,
  CreditCard,
  QrCode,
  Clock,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { POSOrder } from '../types';

type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalItems: number;
  totalDiscount: number;
  totalTax: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  cashRevenue: number;
  cardRevenue: number;
  transferRevenue: number;
}

interface TopProduct {
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
}

interface HourlySales {
  hour: string;
  sales: number;
  revenue: number;
}

interface DailySales {
  date: string;
  sales: number;
  revenue: number;
}

export default function POSReportsPage() {
  const [sales, setSales] = useState<POSOrder[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load sales from localStorage
  const loadSales = () => {
    setIsLoading(true);
    const savedSales = localStorage.getItem('pos_sales_history');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      setSales([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSales();
  }, []);

  // Get date range boundaries
  const getDateBoundaries = (): { start: Date; end: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

    switch (dateRange) {
      case 'today':
        return { start: today, end: endOfToday };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekAgo, end: endOfToday };
      case 'month':
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return { start: monthAgo, end: endOfToday };
      case 'year':
        const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return { start: yearAgo, end: endOfToday };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : monthAgo,
          end: customEndDate ? new Date(customEndDate + 'T23:59:59') : endOfToday
        };
      default:
        return { start: today, end: endOfToday };
    }
  };

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    const { start, end } = getDateBoundaries();
    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt || '');
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, dateRange, customStartDate, customEndDate]);

  // Calculate stats
  const stats: SalesStats = useMemo(() => {
    const cashSalesData = filteredSales.filter(s => s.paymentMethod === 'cash');
    const cardSalesData = filteredSales.filter(s => s.paymentMethod === 'card');
    const transferSalesData = filteredSales.filter(s => s.paymentMethod === 'transfer');

    return {
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
      avgOrderValue: filteredSales.length > 0
        ? filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length
        : 0,
      totalItems: filteredSales.reduce((sum, s) =>
        sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
      totalDiscount: filteredSales.reduce((sum, s) => sum + s.discountAmount, 0),
      totalTax: filteredSales.reduce((sum, s) => sum + s.taxAmount, 0),
      cashSales: cashSalesData.length,
      cardSales: cardSalesData.length,
      transferSales: transferSalesData.length,
      cashRevenue: cashSalesData.reduce((sum, s) => sum + s.total, 0),
      cardRevenue: cardSalesData.reduce((sum, s) => sum + s.total, 0),
      transferRevenue: transferSalesData.reduce((sum, s) => sum + s.total, 0),
    };
  }, [filteredSales]);

  // Previous period comparison
  const previousPeriodStats = useMemo(() => {
    const { start, end } = getDateBoundaries();
    const duration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(start.getTime() - 1);

    const prevSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt || '');
      return saleDate >= prevStart && saleDate <= prevEnd;
    });

    return {
      totalSales: prevSales.length,
      totalRevenue: prevSales.reduce((sum, s) => sum + s.total, 0),
    };
  }, [sales, dateRange, customStartDate, customEndDate]);

  // Calculate growth percentages
  const salesGrowth = previousPeriodStats.totalSales > 0
    ? ((stats.totalSales - previousPeriodStats.totalSales) / previousPeriodStats.totalSales) * 100
    : stats.totalSales > 0 ? 100 : 0;

  const revenueGrowth = previousPeriodStats.totalRevenue > 0
    ? ((stats.totalRevenue - previousPeriodStats.totalRevenue) / previousPeriodStats.totalRevenue) * 100
    : stats.totalRevenue > 0 ? 100 : 0;

  // Top selling products
  const topProducts: TopProduct[] = useMemo(() => {
    const productMap = new Map<string, TopProduct>();

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productMap.set(item.productId, {
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            revenue: item.total
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales]);

  // Hourly sales distribution (for today/yesterday)
  const hourlySales: HourlySales[] = useMemo(() => {
    if (dateRange !== 'today' && dateRange !== 'yesterday') return [];

    const hourlyMap = new Map<number, { sales: number; revenue: number }>();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { sales: 0, revenue: 0 });
    }

    filteredSales.forEach(sale => {
      const hour = new Date(sale.createdAt || '').getHours();
      const existing = hourlyMap.get(hour)!;
      existing.sales += 1;
      existing.revenue += sale.total;
    });

    return Array.from(hourlyMap.entries()).map(([hour, data]) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: data.sales,
      revenue: data.revenue
    }));
  }, [filteredSales, dateRange]);

  // Daily sales distribution (for week/month/year)
  const dailySales: DailySales[] = useMemo(() => {
    if (dateRange === 'today' || dateRange === 'yesterday') return [];

    const dailyMap = new Map<string, { sales: number; revenue: number }>();

    filteredSales.forEach(sale => {
      const date = new Date(sale.createdAt || '').toISOString().split('T')[0];
      const existing = dailyMap.get(date);
      if (existing) {
        existing.sales += 1;
        existing.revenue += sale.total;
      } else {
        dailyMap.set(date, { sales: 1, revenue: sale.total });
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        sales: data.sales,
        revenue: data.revenue
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales, dateRange]);

  // Export report
  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Date', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment Method'];
    const rows = filteredSales.map(sale => [
      sale.orderNumber,
      new Date(sale.createdAt || '').toLocaleString(),
      sale.customerName,
      sale.items.reduce((sum, item) => sum + item.quantity, 0),
      sale.subtotal.toFixed(2),
      sale.discountAmount.toFixed(2),
      sale.taxAmount.toFixed(2),
      sale.total.toFixed(2),
      sale.paymentMethod
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pos-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const maxDailyRevenue = Math.max(...dailySales.map(d => d.revenue), 1);
  const maxHourlyRevenue = Math.max(...hourlySales.map(h => h.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your walk-in sales performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredSales.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={loadSales}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Period:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'year', label: 'Last Year' },
              { value: 'custom', label: 'Custom' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as DateRange)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {salesGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(salesGrowth).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{stats.totalSales}</p>
          <p className="text-sm text-gray-600">Total Sales</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">SAR {stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">SAR {stats.avgOrderValue.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Avg Order Value</p>
        </div>

        {/* Items Sold */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{stats.totalItems}</p>
          <p className="text-sm text-gray-600">Items Sold</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-600" />
            Payment Methods
          </h3>
          <div className="space-y-4">
            {/* Cash */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Cash</span>
                </div>
                <span className="text-sm text-gray-600">{stats.cashSales} sales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.totalRevenue > 0 ? (stats.cashRevenue / stats.totalRevenue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-28 text-right">SAR {stats.cashRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Card */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Card</span>
                </div>
                <span className="text-sm text-gray-600">{stats.cardSales} sales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${stats.totalRevenue > 0 ? (stats.cardRevenue / stats.totalRevenue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-28 text-right">SAR {stats.cardRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Transfer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Transfer</span>
                </div>
                <span className="text-sm text-gray-600">{stats.transferSales} sales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${stats.totalRevenue > 0 ? (stats.transferRevenue / stats.totalRevenue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-28 text-right">SAR {stats.transferRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Discount</p>
              <p className="text-lg font-bold text-green-600">SAR {stats.totalDiscount.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Total VAT</p>
              <p className="text-lg font-bold text-blue-600">SAR {stats.totalTax.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            Top Selling Products
          </h3>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No sales data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} sold</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">SAR {product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales Trend Chart */}
      {(dateRange === 'today' || dateRange === 'yesterday') && hourlySales.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Hourly Sales Distribution
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] h-48 flex items-end gap-1">
              {hourlySales.map((hour, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary/80 hover:bg-primary rounded-t transition-colors"
                    style={{ height: `${(hour.revenue / maxHourlyRevenue) * 100}%`, minHeight: hour.revenue > 0 ? '4px' : '0' }}
                    title={`${hour.hour}: ${hour.sales} sales, SAR ${hour.revenue.toFixed(2)}`}
                  />
                  <span className="text-xs text-gray-500 mt-1">{hour.hour.split(':')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(dateRange !== 'today' && dateRange !== 'yesterday') && dailySales.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            Daily Sales Trend
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] h-48 flex items-end gap-1">
              {dailySales.slice(-30).map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary/80 hover:bg-primary rounded-t transition-colors cursor-pointer"
                    style={{ height: `${(day.revenue / maxDailyRevenue) * 100}%`, minHeight: day.revenue > 0 ? '4px' : '0' }}
                    title={`${day.date}: ${day.sales} sales, SAR ${day.revenue.toFixed(2)}`}
                  />
                  {dailySales.length <= 14 && (
                    <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left whitespace-nowrap">
                      {new Date(day.date).toLocaleDateString('en-SA', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {dailySales.length > 14 && (
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{new Date(dailySales[Math.max(0, dailySales.length - 30)].date).toLocaleDateString()}</span>
                <span>{new Date(dailySales[dailySales.length - 1].date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Top Products Table */}
      {topProducts.length > 5 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              All Products Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty Sold</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-right">{product.quantity}</td>
                    <td className="px-4 py-3 text-sm font-bold text-right">SAR {product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSales.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data for selected period</h3>
          <p className="text-gray-600">
            {sales.length === 0
              ? 'Make some sales from the POS Terminal to see reports here.'
              : 'Try selecting a different date range to see sales data.'}
          </p>
        </div>
      )}
    </div>
  );
}
