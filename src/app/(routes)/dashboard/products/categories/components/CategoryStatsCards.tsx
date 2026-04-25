import React from 'react';
import { Tag, TrendingUp, Package, FolderOpen } from 'lucide-react';
import { CategoryStats } from '../../types';

interface CategoryStatsCardsProps {
  totalCategories: number;
  activeCategories: number;
  totalProducts: number;
  subcategoriesCount: number;
}

const CategoryStatsCards: React.FC<CategoryStatsCardsProps> = ({
  totalCategories,
  activeCategories,
  totalProducts,
  subcategoriesCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCategories}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Tag className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Categories</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeCategories}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Package className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Subcategories</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{subcategoriesCount}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <FolderOpen className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryStatsCards;