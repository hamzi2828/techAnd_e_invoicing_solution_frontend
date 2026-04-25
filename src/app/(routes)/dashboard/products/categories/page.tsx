'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  CategoryStatsCards,
  CategorySearch,
  CategoryList,
  CategoryModal
} from './components';
import { Category, Subcategory } from '../types';
import CategoryService from './services/categoryService';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  parentCategories: number;
  subcategories: number;
  totalProducts: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    parentCategories: 0,
    subcategories: 0,
    totalProducts: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | Subcategory | Partial<Subcategory> | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();

  // Load categories and stats on component mount
  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await CategoryService.getCategories();
      setCategories(result.categories);
      setSubcategories(result.subcategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await CategoryService.getCategoryStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleEditCategory = (category: Category | Subcategory) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        await CategoryService.deleteCategory(categoryId);
        await loadCategories();
        await loadStats();
        setShowActions(null);
      } catch (err) {
        showAlert(err instanceof Error ? err.message : 'Failed to delete category', 'error');
      }
    }
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingCategory(subcategory);
    setShowEditModal(true);
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await CategoryService.deleteCategory(subcategoryId);
        await loadCategories();
        await loadStats();
      } catch (err) {
        showAlert(err instanceof Error ? err.message : 'Failed to delete subcategory', 'error');
      }
    }
  };

  const handleAddSubcategory = (categoryId: string) => {
    // Create a partial subcategory object with the parentId set
    setEditingCategory({ parentId: categoryId });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadCategories}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <a
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
            <p className="text-gray-600">Organize your products with categories and subcategories</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Add Category</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <CategoryStatsCards
        totalCategories={stats.totalCategories}
        activeCategories={stats.activeCategories}
        totalProducts={stats.totalProducts}
        subcategoriesCount={stats.subcategories}
      />

      {/* Search */}
      <CategorySearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Categories List */}
      <CategoryList
        categories={filteredCategories}
        subcategories={subcategories}
        expandedCategories={expandedCategories}
        showActions={showActions}
        onToggleExpanded={toggleExpanded}
        onToggleActions={setShowActions}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onEditSubcategory={handleEditSubcategory}
        onDeleteSubcategory={handleDeleteSubcategory}
        onAddSubcategory={handleAddSubcategory}
      />

      {/* Add Category Modal */}
      <CategoryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        parentCategories={categories}
        onSubmit={async (data) => {
          try {
            await CategoryService.createCategory(data);
            await loadCategories();
            await loadStats();
            setShowAddModal(false);
            setEditingCategory(null);
          } catch (err) {
            showAlert(err instanceof Error ? err.message : 'Failed to create category', 'error');
          }
        }}
      />

      {/* Edit Category Modal */}
      <CategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        parentCategories={categories}
        onSubmit={async (data) => {
          if (!editingCategory || !editingCategory.id) return;
          try {
            await CategoryService.updateCategory(editingCategory.id, data);
            await loadCategories();
            await loadStats();
            setEditingCategory(null);
            setShowEditModal(false);
          } catch (err) {
            showAlert(err instanceof Error ? err.message : 'Failed to update category', 'error');
          }
        }}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}