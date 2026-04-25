import React from 'react';
import { Package, TrendingUp, DollarSign, Tag } from 'lucide-react';

interface StatsCardsProps {
  totalProducts: number;
  activeProducts: number;
  totalValue: number;
  categories: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalProducts,
  activeProducts,
  totalValue,
  categories
}) => {
  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: TrendingUp,
      bgColor: 'bg-blue-100',
      iconColor: 'text-primary-600'
    },
    {
      title: 'Total Value',
      value: `SAR ${totalValue.toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Categories',
      value: categories,
      icon: Tag,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 ${stat.bgColor} rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;