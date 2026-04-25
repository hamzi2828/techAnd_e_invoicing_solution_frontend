'use client';

import React from 'react';
import { Search, X, RefreshCw, Grid3X3, List, Pause } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isLoading: boolean;
  onRefresh: () => void;
  heldOrdersCount: number;
  onShowHeldOrders: () => void;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isLoading,
  onRefresh,
  heldOrdersCount,
  onShowHeldOrders
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        onClick={onRefresh}
        className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
        title="Refresh products"
      >
        <RefreshCw className={`h-5 w-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
      </button>

      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <Grid3X3 className="h-5 w-5" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2.5 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {heldOrdersCount > 0 && (
        <button
          onClick={onShowHeldOrders}
          className="relative p-2.5 border border-orange-300 bg-orange-50 rounded-lg hover:bg-orange-100"
          title="Held orders"
        >
          <Pause className="h-5 w-5 text-orange-600" />
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {heldOrdersCount}
          </span>
        </button>
      )}
    </div>
  );
}
