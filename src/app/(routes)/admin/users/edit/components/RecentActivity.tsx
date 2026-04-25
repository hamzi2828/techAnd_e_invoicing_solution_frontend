import React from 'react';
import Link from 'next/link';
import { CheckCircle, FileText, Activity } from 'lucide-react';

const RecentActivity: React.FC = () => {
  // Mock activity data - in real app this would come from props or API
  const activities = [
    {
      id: '1',
      action: 'Logged in successfully',
      time: '2 hours ago',
      type: 'login',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: '2',
      action: 'Created invoice INV-2024-001',
      time: '5 hours ago',
      type: 'invoice',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: '3',
      action: 'Viewed dashboard analytics',
      time: '1 day ago',
      type: 'view',
      icon: Activity,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-1 rounded ${activity.color}`}>
                <IconComponent className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <Link 
        href="/admin/users/activity"
        className="block mt-4 text-center text-sm text-primary hover:text-primary-700 font-medium"
      >
        View Full Activity Log
      </Link>
    </div>
  );
};

export default RecentActivity;