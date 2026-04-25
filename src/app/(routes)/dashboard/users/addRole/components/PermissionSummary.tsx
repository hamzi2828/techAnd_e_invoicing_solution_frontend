import React from 'react';
import {
  Info,
  Shield,
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Building2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SelectedPermissions, CategoryPermissions } from './types';

interface PermissionSummaryProps {
  sortedCategories: string[];
  groupedPermissions: CategoryPermissions;
  selectedPermissions: SelectedPermissions;
}

export const PermissionSummary: React.FC<PermissionSummaryProps> = ({
  sortedCategories,
  groupedPermissions,
  selectedPermissions,
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
    <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 rounded-lg p-6 border border-primary-200 shadow-sm">
      <div className="flex items-center mb-4">
        <Info className="h-5 w-5 text-primary mr-2" />
        <h3 className="font-semibold text-gray-900">Permission Summary</h3>
      </div>
      {sortedCategories.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No permissions available</p>
      ) : (
        <div className="space-y-3">
          {sortedCategories.map((category) => {
            const categoryPermissions = groupedPermissions[category];
            const selectedCount = (selectedPermissions[category] || []).length;
            const totalCount = categoryPermissions.length;
            const percentage = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;
            const CategoryIcon = getCategoryIcon(category);
            const isFullySelected = selectedCount === totalCount;

            return (
              <div key={category} className="bg-white rounded-lg p-3 border border-primary-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className={`h-4 w-4 ${
                      isFullySelected ? 'text-primary' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isFullySelected ? 'text-primary-700' : 'text-gray-700'
                    }`}>
                      {category}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isFullySelected
                      ? 'bg-primary-100 text-primary-700'
                      : selectedCount > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedCount}/{totalCount}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      percentage === 100
                        ? 'bg-gradient-to-r from-primary via-blue-600 to-indigo-700'
                        : percentage > 0
                        ? 'bg-gradient-to-r from-primary-400 to-blue-500'
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
