'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Edit,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StatsCard, ActivityTable } from '../components';
import { recentActivity } from '../data/users';







export default function ActivityLogPage() {
  const activityStats = [
    {
      title: 'Total Activities',
      value: '2,456',
      icon: Activity,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    {
      title: 'Login Events',
      value: '834',
      icon: CheckCircle,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    },
    {
      title: 'Failed Attempts',
      value: '23',
      icon: AlertTriangle,
      color: 'bg-gradient-to-br from-red-500 to-pink-500',
    },
    {
      title: 'Data Changes',
      value: '1,245',
      icon: Edit,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/users"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Log & Audit Trail</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor user activities and system events</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activityStats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <ActivityTable activities={recentActivity} />
    </div>
  );
}