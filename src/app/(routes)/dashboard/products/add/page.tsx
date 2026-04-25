'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '../components';
import { ProductFormData } from '../types';
import ProductService from '../services/productService';

export default function AddProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ProductFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await ProductService.createProduct(formData);

      // Redirect to products list
      window.location.href = '/admin/products';
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to create product');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Create a new product or service for your catalog</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Product Form */}
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText={isLoading ? 'Creating...' : 'Create Product'}
      />
    </div>
  );
}