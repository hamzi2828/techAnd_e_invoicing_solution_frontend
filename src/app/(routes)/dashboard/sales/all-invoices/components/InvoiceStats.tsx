import React from 'react';
import { FileText, Send, CheckCircle, AlertCircle, TrendingUp, Clock, Calculator } from 'lucide-react';
import { InvoiceStats } from '../types';

interface InvoiceStatsProps {
  stats: InvoiceStats;
  isLoading: boolean;
}

const InvoiceStatsComponent: React.FC<InvoiceStatsProps> = ({ stats, isLoading }) => {
  const formatCurrency = (amount: number) => {
    // Handle null, undefined, or NaN values
    const numAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const statsCards = [
    {
      label: 'Total Invoices',
      value: stats.totalInvoices || 0,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Draft',
      value: stats.draftInvoices || 0,
      icon: FileText,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700'
    },
    {
      label: 'Sent',
      value: stats.sentInvoices || 0,
      icon: Send,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      label: 'Paid',
      value: stats.paidInvoices || 0,
      icon: CheckCircle,
      color: 'bg-primary',
      bgColor: 'bg-blue-50',
      textColor: 'text-primary-700'
    },
    {
      label: 'Overdue',
      value: stats.overdueInvoices || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: TrendingUp,
      color: 'bg-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      label: 'Outstanding',
      value: formatCurrency(stats.totalOutstanding || 0),
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      label: 'Average Value',
      value: formatCurrency(stats.averageInvoiceValue || 0),
      icon: Calculator,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceStatsComponent;