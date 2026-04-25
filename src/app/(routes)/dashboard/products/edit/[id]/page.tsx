'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '../../components';
import { ProductFormData, Product } from '../../types';
import ProductService from '../../services/productService';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  // Load product data on mount
  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const productData = await ProductService.getProductById(productId);
      setProduct(productData);
      setError(null);
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      await ProductService.updateProduct(productId, formData);

      // Redirect to products list
      window.location.href = '/dashboard/products';
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/dashboard/products';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/products'}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Convert Product to ProductFormData format
  const initialData: Partial<ProductFormData> = {
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    sku: product.sku,
    category: product.category.id,
    subcategory: product.subcategory?.id || '',
    price: product.price,
    costPrice: product.costPrice,
    unit: product.unit,
    taxRate: product.taxRate,
    stock: product.stock,
    minStock: product.minStock,
    maxStock: product.maxStock,
    status: product.status === 'out_of_stock' ? 'inactive' : product.status,
    tags: product.tags,
    barcode: product.barcode,
    weight: product.weight,
    dimensions: product.dimensions,
    attributes: product.attributes,
    images: [] // Images will need to be handled separately
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information</p>
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
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
        submitButtonText={isSaving ? 'Updating...' : 'Update Product'}
      />
    </div>
  );
}
