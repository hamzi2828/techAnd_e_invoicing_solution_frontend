'use client';

import React from 'react';
import { POSCategory } from '../types';

interface CategoryFilterProps {
  categories: POSCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
          {category.productsCount !== undefined && category.id !== 'all' && (
            <span className="ml-1 text-xs opacity-75">({category.productsCount})</span>
          )}
        </button>
      ))}
    </div>
  );
}
