'use client';

import React from 'react';
import { Package, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '../../products/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  error: string | null;
  onAddToCart: (product: Product) => void;
  onRetry: () => void;
}

export default function ProductGrid({
  products,
  viewMode,
  isLoading,
  error,
  onAddToCart,
  onRetry
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Try adjusting your search or category filter</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
