import React from 'react';
import { Users, Building, DollarSign, FileText } from 'lucide-react';
import { CustomerStats as CustomerStatsType } from '../types';

interface CustomerStatsProps {
  stats: CustomerStatsType;
  isLoading?: boolean;
}

const CustomerStats: React.FC<CustomerStatsProps> = ({ stats, isLoading = false }) => {
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsCards = [
    {
      id: 'total',
      title: 'Total Customers',
      value: stats.total.toLocaleString(),
      icon: Users,
      iconColor: 'text-primary',
      subtitle: 'registered',
    },
    {
      id: 'active',
      title: 'Active Customers',
      value: stats.active.toLocaleString(),
      icon: Building,
      iconColor: 'text-blue-600',
      subtitle: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`,
      subtitleColor: 'text-primary',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: formatCurrency(stats.totalPaymentsValue),
      icon: DollarSign,
      iconColor: 'text-indigo-600',
      subtitle: 'from all customers',
    },
    {
      id: 'average',
      title: 'Avg. Payment',
      value: formatCurrency(stats.averagePaymentValue),
      icon: FileText,
      iconColor: 'text-purple-600',
      subtitle: 'per transaction',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{card.title}</p>
                {isLoading ? (
                  <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                )}
              </div>
              <Icon className={`h-8 w-8 ${card.iconColor}`} />
            </div>
            <div className="mt-3 flex items-center text-sm">
              {isLoading ? (
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              ) : (
                <>
                  {card.subtitleColor && (
                    <span className={`font-medium ${card.subtitleColor}`}>
                      {card.subtitle.split(' ')[0]}
                    </span>
                  )}
                  <span className={`text-gray-600 ${card.subtitleColor ? 'ml-2' : ''}`}>
                    {card.subtitleColor ? card.subtitle.split(' ').slice(1).join(' ') : card.subtitle}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerStats;