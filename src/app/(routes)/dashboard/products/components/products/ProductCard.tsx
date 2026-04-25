import React from 'react';
import { Edit, Trash2, MoreVertical, Package } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onSelect?: (productId: string) => void;
  isSelected?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg border ${isSelected ? 'border-primary ring-2 ring-blue-200' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(product.id)}
              className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            />
          )}

          <div className="p-3 bg-gray-100 rounded-lg">
            <Package className="h-6 w-6 text-gray-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                  <span className="text-sm text-gray-500">Category: {product.category.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    SAR {product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">/{product.unit}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Stock: {product.stock}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(product.status)}`}>
                  {product.status.replace('_', ' ')}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEdit(product.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit product"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;