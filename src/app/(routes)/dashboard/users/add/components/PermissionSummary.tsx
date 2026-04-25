'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionSummaryProps {
  permissions: Permission[];
  selectedPermissions: string[];
}

export default function PermissionSummary({
  permissions,
  selectedPermissions,
}: PermissionSummaryProps) {
  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 rounded-lg p-6 border border-primary-200">
      <div className="flex items-center mb-3">
        <Info className="h-5 w-5 text-primary mr-2" />
        <h3 className="font-semibold text-gray-900">Permission Summary</h3>
      </div>
      <div className="space-y-2">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
          const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
          const percentage = (selectedCount / categoryPermissions.length) * 100;

          return (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{category}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-8">{selectedCount}/{categoryPermissions.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
