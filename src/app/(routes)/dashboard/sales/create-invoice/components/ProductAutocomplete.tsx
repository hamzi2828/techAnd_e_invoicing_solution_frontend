import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Loader2, Plus } from 'lucide-react';
import { Product } from '../types';
import { ProductService } from '../services';
import { useDebounce } from '../hooks/useDebounce';

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  onManualEntry?: (description: string) => void; // For manual item entry
  placeholder?: string;
  className?: string;
  disabled?: boolean; // Disable the component when company is not onboarded
}

const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({
  value,
  onChange,
  onProductSelect,
  onManualEntry,
  placeholder = 'Search products or type custom description...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query to avoid excessive API calls
  const debouncedSearch = useDebounce(value, 300);

  // Search products when debounced value changes
  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearch || debouncedSearch.trim().length < 2) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await ProductService.searchProducts(debouncedSearch, 10);
        setProducts(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSelectedIndex(-1);
  };

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    // Keep dropdown open for multiple selections
    // setIsOpen(false);
    // setProducts([]);
    setSelectedIndex(-1);
  };

  const handleManualEntry = () => {
    if (value.trim() && onManualEntry) {
      onManualEntry(value.trim());
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || products.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < products.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < products.length) {
          handleProductClick(products[selectedIndex]);
          // Keep dropdown open for multiple selections
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (products.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-gray-400 ${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (products.length > 0 || (value.trim().length >= 2 && onManualEntry)) && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto">
          {/* Manual entry option - always show when text is entered */}
          {value.trim().length >= 2 && onManualEntry && (
            <div
              onClick={handleManualEntry}
              className="px-4 py-3 cursor-pointer bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-b border-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Plus className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-emerald-800">Use as custom item</span>
                    <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded">Manual</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    &quot;{value.trim()}&quot; - Enter price and tax manually
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Helper text for products */}
          {products.length > 0 && (
            <div className="sticky top-0 bg-blue-50 border-b border-primary-200 px-4 py-2 text-xs text-primary-700 flex items-center gap-1">
              <Plus className="h-3 w-3" />
              <span>Click product to add, or use custom item above</span>
            </div>
          )}
          {products.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 border-l-4 border-primary'
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Package className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary-600 whitespace-nowrap">
                        {new Intl.NumberFormat('en-SA', {
                          style: 'currency',
                          currency: 'SAR'
                        }).format(product.price)}
                      </span>
                      <div className="flex items-center gap-1 bg-blue-100 text-primary-700 px-2 py-0.5 rounded text-xs font-medium">
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {product.unit}
                    </span>
                    <span className="text-xs text-gray-400">
                      Tax: {product.taxRate}%
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message - only show if manual entry is not available */}
      {isOpen && !isLoading && products.length === 0 && debouncedSearch.trim().length >= 2 && !onManualEntry && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          <div className="text-center text-sm text-gray-500">
            <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p>No products found</p>
            <p className="text-xs mt-1">Try searching by product name, category, or subcategory</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAutocomplete;
