import React from 'react';
import CategoryListItem from './CategoryListItem';
import { Category, Subcategory } from '../../types';

interface CategoryListProps {
  categories: Category[];
  subcategories: Subcategory[];
  expandedCategories: string[];
  showActions: string | null;
  onToggleExpanded: (categoryId: string) => void;
  onToggleActions: (categoryId: string | null) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategoryId: string) => void;
  onAddSubcategory: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  subcategories,
  expandedCategories,
  showActions,
  onToggleExpanded,
  onToggleActions,
  onEditCategory,
  onDeleteCategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onAddSubcategory
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="space-y-4">
          {categories.map((category) => {
            const categorySubcategories = subcategories.filter(sub => sub.parentId === category.id);

            return (
              <CategoryListItem
                key={category.id}
                category={category}
                subcategories={categorySubcategories}
                isExpanded={expandedCategories.includes(category.id)}
                showActions={showActions}
                onToggleExpanded={onToggleExpanded}
                onToggleActions={onToggleActions}
                onEdit={onEditCategory}
                onDelete={onDeleteCategory}
                onEditSubcategory={onEditSubcategory}
                onDeleteSubcategory={onDeleteSubcategory}
                onAddSubcategory={onAddSubcategory}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;