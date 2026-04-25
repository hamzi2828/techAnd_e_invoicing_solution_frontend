'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { Activity } from '../types';

interface ActivityTableProps {
  activities: Activity[];
}

const statusConfig = {
  success: { label: 'Success', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', icon: XCircle, color: 'bg-red-100 text-red-800' },
  warning: { label: 'Warning', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
};

export default function ActivityTable({ activities }: ActivityTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-600">Latest user actions and system events</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {activities.map((activity) => {
              const statusInfo = statusConfig[activity.status];
              const StatusIcon = statusInfo.icon;
              
              return (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium text-xs">
                        {getInitials(activity.user.name)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user.name}
                        </p>
                        <p className="text-xs text-gray-500">ID: {activity.user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{activity.target || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 font-mono">{activity.ip || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      {activity.timestamp}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}