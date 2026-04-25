'use client';

import React from 'react';
import { Package, Barcode } from 'lucide-react';
import { Product } from '../../products/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  viewMode: 'grid' | 'list';
}

export default function ProductCard({ product, onAddToCart, viewMode }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  const isLowStock = product.stock > 0 && product.stock <= 10;

  const getStockClass = () => {
    if (product.stock === 0) return 'bg-red-500 text-white';
    if (product.stock <= 5) return 'bg-red-100 text-red-700';
    if (product.stock <= 10) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const getStockTextClass = () => {
    if (product.stock > 20) return 'text-green-600';
    if (product.stock > 5) return 'text-yellow-600';
    if (product.stock === 0) return 'text-red-600';
    return 'text-orange-600';
  };

  const getStockLabel = () => {
    if (product.stock === 0) return 'Out of stock';
    return viewMode === 'grid' ? `${product.stock} in stock` : `Stock: ${product.stock}`;
  };

  if (viewMode === 'grid') {
    return (
      <button
        onClick={() => onAddToCart(product)}
        disabled={isOutOfStock}
        className={`bg-white border rounded-xl p-4 text-left transition-all group ${
          isOutOfStock
            ? 'border-gray-200 opacity-50 cursor-not-allowed'
            : 'border-gray-200 hover:border-primary hover:shadow-md'
        }`}
      >
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-12 w-12 text-gray-300 group-hover:text-primary/50 transition-colors" />
          )}
          {/* Stock Badge */}
          <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm ${getStockClass()}`}>
            {product.stock === 0 ? 'Out of Stock' : isLowStock ? `Low: ${product.stock}` : product.stock}
          </span>
        </div>
        <h3 className="font-medium text-gray-900 text-sm truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Barcode className="h-3 w-3" />
          {product.sku}
        </p>
        <div className="mt-2">
          <span className="text-primary font-bold">SAR {product.price.toFixed(2)}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onAddToCart(product)}
      disabled={isOutOfStock}
      className={`w-full bg-white border rounded-lg p-3 flex items-center gap-4 transition-all ${
        isOutOfStock
          ? 'border-gray-200 opacity-50 cursor-not-allowed'
          : 'border-gray-200 hover:border-primary hover:shadow-md'
      }`}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-gray-300" />
        )}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.sku}</p>
      </div>
      <div className="text-right">
        <span className="text-primary font-bold">SAR {product.price.toFixed(2)}</span>
        <p className={`text-xs mt-1 ${getStockTextClass()}`}>
          {getStockLabel()}
        </p>
      </div>
    </button>
  );
}
