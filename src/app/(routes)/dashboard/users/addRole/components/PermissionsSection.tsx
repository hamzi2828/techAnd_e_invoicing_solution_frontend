import React from 'react';
import {
  Shield,
  AlertCircle,
  CheckSquare,
  Square,
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Building2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SelectedPermissions, CategoryPermissions } from './types';
import { PermissionCategoryCard } from './PermissionCategoryCard';

interface PermissionsSectionProps {
  sortedCategories: string[];
  groupedPermissions: CategoryPermissions;
  selectedPermissions: SelectedPermissions;
  selectedCount: number;
  totalPermissions: number;
  isAllPermissionsSelected: boolean;
  onCategoryToggle: (category: string) => void;
  onPermissionToggle: (category: string, permissionId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  sortedCategories,
  groupedPermissions,
  selectedPermissions,
  selectedCount,
  totalPermissions,
  isAllPermissionsSelected,
  onCategoryToggle,
  onPermissionToggle,
  onSelectAll,
  onDeselectAll,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Assign Permissions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Select permissions based on Sidebar navigation sections
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-600">
            {selectedCount} of {totalPermissions} selected
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onSelectAll}
              disabled={isAllPermissionsSelected}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Select All
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              disabled={selectedCount === 0}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="h-3.5 w-3.5 mr-1" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No permissions available</p>
          <p className="text-sm text-gray-400 mt-1">Please contact your administrator</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => {
            const categoryPermissions = groupedPermissions[category];
            const selectedInCategory = selectedPermissions[category] || [];
            const CategoryIcon = getCategoryIcon(category);

            return (
              <PermissionCategoryCard
                key={category}
                category={category}
                categoryPermissions={categoryPermissions}
                selectedInCategory={selectedInCategory}
                CategoryIcon={CategoryIcon}
                onCategoryToggle={onCategoryToggle}
                onPermissionToggle={onPermissionToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
