'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { StatsCards, ProductFilters, ProductTable } from './components';
import { Product, ProductStats } from './types';
import ProductService from './services/productService';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await ProductService.getProducts({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });

      setProducts(result.products);
      if (result.pagination) {
        setTotalPages(result.pagination.pages);
        setTotalProducts(result.pagination.total);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, selectedStatus]);

  // Fetch products when filters or pagination changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Fetch stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await ProductService.getProductStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedProducts([]); // Clear selections when changing page
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
    setSelectedProducts([]);
  };


  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id && p.id !== productId));
        loadStats(); // Refresh stats
      } catch (err) {
        console.error('Error deleting product:', err);
        showAlert(err instanceof Error ? err.message : 'Failed to delete product', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await ProductService.bulkDeleteProducts(selectedProducts);
        setProducts(prev => prev.filter(p => p.id && !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        loadStats(); // Refresh stats
      } catch (err) {
        console.error('Error deleting products:', err);
        showAlert(err instanceof Error ? err.message : 'Failed to delete products', 'error');
      }
    }
  };

  const handleEditProduct = (productId: string) => {
    window.location.href = `/dashboard/products/edit/${productId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products & Services</h1>
          <p className="text-gray-600">Manage your products and services catalog</p>
        </div>
        <div>
          <a
            href="/admin/products/add"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add Product</span>
          </a>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <StatsCards
          totalProducts={stats.totalProducts}
          activeProducts={stats.activeProducts}
          totalValue={stats.totalValue}
          categories={stats.totalCategories}
        />
      )}

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Products Table */}
      <ProductTable
        products={products}
        selectedProducts={selectedProducts}
        onSelectProduct={handleSelectProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        currentPage={currentPage}
        totalPages={totalPages}
        totalProducts={totalProducts}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm">{selectedProducts.length} products selected</span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
            >
              Delete Selected
            </button>
            <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
              Export Selected
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="text-sm hover:underline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

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