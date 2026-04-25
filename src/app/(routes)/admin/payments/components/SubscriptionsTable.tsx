import React from 'react';
import {
  Calendar,
  Mail,
  Eye,
  Edit3,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Crown,
  Star,
} from 'lucide-react';
import { Subscription } from '../types';

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  selectedSubscriptions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export default function SubscriptionsTable({
  subscriptions,
  selectedSubscriptions,
  onSelectionChange,
}: SubscriptionsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanBadge = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return <Crown className="h-3 w-3 text-purple-600 mr-1" />;
      case 'plus':
        return <Star className="h-3 w-3 text-blue-600 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary-50 to-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange(subscriptions.map(s => s.id));
                    } else {
                      onSelectionChange([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Billing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedSubscriptions.includes(subscription.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectionChange([...selectedSubscriptions, subscription.id]);
                      } else {
                        onSelectionChange(selectedSubscriptions.filter(id => id !== subscription.id));
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <span className="text-sm font-medium text-primary-700">
                        {subscription.customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.customer.name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {subscription.customer.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {subscription.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getPlanBadge(subscription.plan.name)}
                    <span className="text-sm font-medium text-gray-900">
                      {subscription.plan.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    SAR {subscription.plan.price}/{subscription.plan.billing === 'yearly' ? 'year' : 'month'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                    {getStatusIcon(subscription.status)}
                    <span className="ml-1 capitalize">{subscription.status.replace('_', ' ')}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    {subscription.nextBilling}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  SAR {subscription.totalRevenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit subscription"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {subscription.status === 'active' ? (
                      <button
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Pause subscription"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    ) : subscription.status === 'paused' ? (
                      <button
                        className="text-green-600 hover:text-green-700"
                        title="Resume subscription"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button
                      className="text-gray-600 hover:text-gray-700"
                      title="Contact customer"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}