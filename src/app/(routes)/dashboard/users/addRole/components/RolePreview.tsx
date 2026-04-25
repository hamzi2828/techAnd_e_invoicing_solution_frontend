import React from 'react';
import {
  Shield,
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Building2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SelectedPermissions } from './types';

interface RolePreviewProps {
  roleName: string;
  roleDescription: string;
  selectedCount: number;
  selectedPermissions: SelectedPermissions;
  sortedCategories: string[];
  totalPermissions: number;
}

export const RolePreview: React.FC<RolePreviewProps> = ({
  roleName,
  roleDescription,
  selectedCount,
  selectedPermissions,
  sortedCategories,
  totalPermissions,
}) => {
  // Get icon component for category (matching Sidebar icons)
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'Dashboard': LayoutDashboard,
      'Sales': TrendingUp,
      'Customers': Users,
      'Products & Services': Package,
      'Tax & Compliance': Shield,
      'Reports': BarChart3,
      'Company': Building2,
      'Users & Roles': Shield,
      'Settings': SettingsIcon,
    };
    return iconMap[category] || Shield;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Shield className="h-5 w-5 text-primary mr-2" />
        Role Preview
      </h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 rounded-lg p-4 border border-primary-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {roleName || 'New Role'}
              </p>
              <p className="text-xs text-gray-600 leading-tight">
                {roleDescription || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-600">Total Permissions</span>
            <span className="text-sm font-bold text-primary">{selectedCount}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-600">Categories Selected</span>
            <span className="text-sm font-bold text-primary">
              {Object.values(selectedPermissions).filter(perms => perms.length > 0).length}/{sortedCategories.length}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-medium text-gray-600">Completion</span>
            <span className="text-sm font-bold text-primary">
              {totalPermissions > 0 ? Math.round((selectedCount / totalPermissions) * 100) : 0}%
            </span>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Selected Categories:</p>
            <div className="flex flex-wrap gap-1.5">
              {sortedCategories
                .filter(cat => (selectedPermissions[cat] || []).length > 0)
                .map(cat => {
                  const CategoryIcon = getCategoryIcon(cat);
                  return (
                    <div
                      key={cat}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md"
                      title={cat}
                    >
                      <CategoryIcon className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary-700 font-medium truncate max-w-[80px]">
                        {cat}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
