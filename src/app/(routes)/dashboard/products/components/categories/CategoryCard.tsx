import React from 'react';
import { Edit, Trash2, MoreVertical, FolderOpen, Hash } from 'lucide-react';
import { Category, Subcategory } from '../../types';

interface CategoryCardProps {
  category: Category;
  subcategories: Subcategory[];
  isExpanded: boolean;
  onToggleExpanded: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  showActions: string | null;
  onToggleActions: (categoryId: string | null) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  subcategories,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  showActions,
  onToggleActions
}) => {
  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Category Header */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50">
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => onToggleExpanded(category.id)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <FolderOpen className={`h-4 w-4 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`} />
          </button>

          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>

          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(category.status)}`}>
                {category.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{category.productsCount} products</p>
            <p className="text-xs text-gray-500">Updated {category.updatedAt}</p>
          </div>
        </div>

        <div className="relative ml-4">
          <button
            onClick={() => onToggleActions(showActions === category.id ? null : category.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </button>
          {showActions === category.id && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => onEdit(category)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {isExpanded && subcategories.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            {subcategories.map((subcategory) => (
              <div key={subcategory.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{subcategory.name}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(subcategory.status)}`}>
                    {subcategory.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{subcategory.productsCount} products</span>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="h-3 w-3 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;