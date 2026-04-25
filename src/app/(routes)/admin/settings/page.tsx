'use client';

import React, { useState } from 'react';
import {
  Settings,
  FileText,
  Bell,
  Database,
  Save,
  Download,
  RefreshCw,
  CheckCircle,
  Hash,
  Activity,
  User,
  Shield
} from 'lucide-react';

const recentActivity = [
  { action: 'Logged in from new device', timestamp: '30 minutes ago', type: 'login' },
  { action: 'Created invoice INV-2024-001234', timestamp: '1 hour ago', type: 'invoice' },
  { action: 'Updated user permissions for John Doe', timestamp: '2 hours ago', type: 'admin' },
  { action: 'Added new customer: ABC Trading Co.', timestamp: '4 hours ago', type: 'customer' },
  { action: 'Generated monthly sales report', timestamp: '6 hours ago', type: 'export' },
  { action: 'Updated payment method settings', timestamp: '8 hours ago', type: 'settings' },
  { action: 'Created new role: Accountant', timestamp: '12 hours ago', type: 'role' },
  { action: 'Approved invoice INV-2024-001233', timestamp: '1 day ago', type: 'invoice' },
  { action: 'Exported customer list', timestamp: '1 day ago', type: 'export' },
  { action: 'Updated company profile information', timestamp: '2 days ago', type: 'settings' },
  { action: 'Deleted product: Old Service Package', timestamp: '2 days ago', type: 'product' },
  { action: 'Created backup of customer data', timestamp: '3 days ago', type: 'backup' },
  { action: 'Updated tax settings', timestamp: '3 days ago', type: 'settings' },
  { action: 'Logged in from mobile app', timestamp: '4 days ago', type: 'login' },
  { action: 'Generated quarterly report', timestamp: '5 days ago', type: 'export' }
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    securityAlerts: true,
    maintenanceAlerts: true
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return CheckCircle;
      case 'admin': return Shield;
      case 'role': return User;
      case 'export': return Download;
      case 'settings': return Settings;
      case 'invoice': return FileText;
      case 'customer': return User;
      case 'product': return Hash;
      case 'backup': return Database;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-green-600';
      case 'admin': return 'text-blue-600';
      case 'role': return 'text-purple-600';
      case 'export': return 'text-primary';
      case 'settings': return 'text-orange-600';
      case 'invoice': return 'text-indigo-600';
      case 'customer': return 'text-cyan-600';
      case 'product': return 'text-yellow-600';
      case 'backup': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'activity', name: 'Recent Activity', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Configure your e-invoicing system settings</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'emailNotifications' && 'Receive email notifications for important events'}
                          {key === 'smsNotifications' && 'Receive SMS notifications for urgent matters'}
                          {key === 'pushNotifications' && 'Receive browser push notifications'}
                          {key === 'systemAlerts' && 'Get notified about system updates and maintenance'}
                          {key === 'securityAlerts' && 'Critical security notifications (always enabled)'}
                          {key === 'maintenanceAlerts' && 'Scheduled maintenance and downtime notices'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleNotificationChange(key, e.target.checked)}
                          disabled={key === 'securityAlerts'}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${key === 'securityAlerts' ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white border rounded-lg p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      const colorClass = getActivityColor(activity.type);

                      return (
                        <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('-600', '-100')}`}>
                            <Icon className={`h-4 w-4 ${colorClass}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load More Activity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
