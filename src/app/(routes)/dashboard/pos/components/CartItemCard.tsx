'use client';

import React from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { CartItem } from '../types';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
          <p className="text-xs text-gray-500">{item.sku}</p>
          <p className="text-primary font-medium mt-1">SAR {item.price.toFixed(2)}</p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-500 p-1"
          aria-label="Remove item"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="font-bold text-gray-900">
          SAR {item.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
