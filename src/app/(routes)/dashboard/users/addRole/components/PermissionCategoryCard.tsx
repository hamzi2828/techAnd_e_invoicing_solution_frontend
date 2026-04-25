import React from 'react';
import { Check,  } from 'lucide-react';
import { Permission } from '../../types';

interface PermissionCategoryCardProps {
  category: string;
  categoryPermissions: Permission[];
  selectedInCategory: string[];
  CategoryIcon: React.ElementType;
  onCategoryToggle: (category: string) => void;
  onPermissionToggle: (category: string, permissionId: string) => void;
}

export const PermissionCategoryCard: React.FC<PermissionCategoryCardProps> = ({
  category,
  categoryPermissions,
  selectedInCategory,
  CategoryIcon,
  onCategoryToggle,
  onPermissionToggle,
}) => {
  const isAllSelected = selectedInCategory.length === categoryPermissions.length;
  const hasPartialSelection = selectedInCategory.length > 0 && !isAllSelected;

  // Separate permissions: those without subcategory (level 2) and those with subcategory (level 3)
  const level2Permissions = categoryPermissions.filter(p => !p.subcategory);
  const level3Permissions = categoryPermissions.filter(p => p.subcategory);

  // Group level 3 permissions by subcategory
  const groupedBySubcategory = level3Permissions.reduce((acc, permission) => {
    const subcategory = permission.subcategory!;
    if (!acc[subcategory]) {
      acc[subcategory] = [];
    }
    acc[subcategory].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const subcategories = Object.keys(groupedBySubcategory);

  // Handle subcategory toggle
  const handleSubcategoryToggle = (subcategory: string) => {
    const subcategoryPermissions = groupedBySubcategory[subcategory];
    const allSelected = subcategoryPermissions.every(p => selectedInCategory.includes(p.id));

    subcategoryPermissions.forEach(permission => {
      const isSelected = selectedInCategory.includes(permission.id);
      if (allSelected && isSelected) {
        // Deselect all in subcategory
        onPermissionToggle(category, permission.id);
      } else if (!allSelected && !isSelected) {
        // Select all in subcategory
        onPermissionToggle(category, permission.id);
      }
    });
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        isAllSelected
          ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-blue-100'
          : hasPartialSelection
          ? 'border-primary-200 bg-gradient-to-br from-primary-50/50 to-blue-50'
          : 'border-gray-200 hover:border-primary-200'
      }`}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => onCategoryToggle(category)}
          className={`flex items-center space-x-3 text-base font-semibold hover:text-primary transition-colors group ${
            isAllSelected ? 'text-primary' : 'text-gray-800'
          }`}
        >
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
            isAllSelected
              ? 'bg-gradient-to-br from-primary via-blue-600 to-indigo-700 border-primary'
              : hasPartialSelection
              ? 'bg-primary-200 border-primary-400'
              : 'border-gray-300 group-hover:border-primary'
          }`}>
            {isAllSelected ? (
              <Check className="w-4 h-4 text-white" />
            ) : hasPartialSelection ? (
              <div className="w-2 h-2 bg-primary rounded-sm" />
            ) : null}
          </div>
          <CategoryIcon className={`h-5 w-5 ${
            isAllSelected ? 'text-primary' : 'text-gray-500'
          }`} />
          <span>{category}</span>
        </button>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
            isAllSelected
              ? 'bg-primary-100 text-primary-700'
              : hasPartialSelection
              ? 'bg-primary-50 text-primary-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {selectedInCategory.length}/{categoryPermissions.length}
          </span>
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        {/* Level 2 permissions (no subcategory) */}
        {level2Permissions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {level2Permissions.map((permission) => {
              const isSelected = selectedInCategory.includes(permission.id);

              return (
                <button
                  key={permission.id}
                  type="button"
                  onClick={() => onPermissionToggle(category, permission.id)}
                  className={`flex items-start space-x-3 text-left p-3 rounded-lg transition-all group ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary-50 to-blue-100 border-2 border-primary-300 hover:from-primary-100 hover:to-blue-200 shadow-sm'
                      : 'bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-primary-300'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 border-2 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                    isSelected ? 'bg-gradient-to-br from-primary via-blue-600 to-indigo-700 border-primary' : 'border-gray-300 group-hover:border-primary'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium mb-0.5 ${
                      isSelected ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {permission.name}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight">
                      {permission.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Subcategory groups */}
        {subcategories.map((subcategory) => {
          const subcategoryPermissions = groupedBySubcategory[subcategory];
          const selectedInSubcategory = subcategoryPermissions.filter(p =>
            selectedInCategory.includes(p.id)
          );
          const isSubcategoryAllSelected = selectedInSubcategory.length === subcategoryPermissions.length;
          const hasSubcategoryPartialSelection = selectedInSubcategory.length > 0 && !isSubcategoryAllSelected;

          return (
            <div key={subcategory} className="border border-gray-200 rounded-lg p-3 bg-white/50">
              {/* Subcategory Header */}
              <button
                type="button"
                onClick={() => handleSubcategoryToggle(subcategory)}
                className={`flex items-center space-x-2 text-sm font-medium mb-3 hover:text-primary transition-colors group w-full ${
                  isSubcategoryAllSelected ? 'text-primary' : 'text-gray-700'
                }`}
              >
                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                  isSubcategoryAllSelected
                    ? 'bg-gradient-to-br from-primary via-blue-600 to-indigo-700 border-primary'
                    : hasSubcategoryPartialSelection
                    ? 'bg-primary-200 border-primary-400'
                    : 'border-gray-300 group-hover:border-primary'
                }`}>
                  {isSubcategoryAllSelected ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : hasSubcategoryPartialSelection ? (
                    <div className="w-1.5 h-1.5 bg-primary rounded-sm" />
                  ) : null}
                </div>
                <span>{subcategory}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isSubcategoryAllSelected
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {selectedInSubcategory.length}/{subcategoryPermissions.length}
                </span>
              </button>

              {/* Permissions in Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                {subcategoryPermissions.map((permission) => {
                  const isSelected = selectedInCategory.includes(permission.id);

                  return (
                    <button
                      key={permission.id}
                      type="button"
                      onClick={() => onPermissionToggle(category, permission.id)}
                      className={`flex items-start space-x-3 text-left p-2.5 rounded-lg transition-all group ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary-50 to-blue-100 border border-primary-300 hover:from-primary-100 hover:to-blue-200'
                          : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-primary-300'
                      }`}
                    >
                      <div className={`mt-0.5 w-3.5 h-3.5 border-2 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                        isSelected ? 'bg-gradient-to-br from-primary via-blue-600 to-indigo-700 border-primary' : 'border-gray-300 group-hover:border-primary'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${
                          isSelected ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {permission.name}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight truncate">
                          {permission.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
