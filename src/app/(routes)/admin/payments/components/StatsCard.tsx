import React from 'react';
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  color?: string;
  showMenu?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = 'bg-gradient-to-br from-primary via-blue-600 to-indigo-700',
  showMenu = true,
}: StatsCardProps) {
  return (
    <div className="bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`${color} p-3 rounded-xl shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {showMenu && (
          <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-1">{value}</p>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {changeType === 'increase' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ml-1 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-gray-600 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
}
