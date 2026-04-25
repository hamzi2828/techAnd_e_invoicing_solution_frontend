'use client';

import React from 'react';
import { X, Play, Trash2 } from 'lucide-react';
import { CartItem, POSCustomer } from '../types';

export interface HeldOrder {
  id: string;
  cart: CartItem[];
  customer: POSCustomer | null;
  discountPercent: number;
  createdAt: string;
}

interface HeldOrdersModalProps {
  isOpen: boolean;
  heldOrders: HeldOrder[];
  onClose: () => void;
  onRecallOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export default function HeldOrdersModal({
  isOpen,
  heldOrders,
  onClose,
  onRecallOrder,
  onDeleteOrder
}: HeldOrdersModalProps) {
  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
    }
  };

  const getOrderTotal = (cart: CartItem[]) => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getItemCount = (cart: CartItem[]) => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Held Orders</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {heldOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No held orders</p>
          ) : (
            heldOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors group"
                onClick={() => {
                  onRecallOrder(order.id);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customer?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getItemCount(order.cart)} items
                    </p>
                  </div>
                  <div className="text-right flex items-start gap-2">
                    <div>
                      <p className="font-bold text-primary">
                        SAR {getOrderTotal(order.cart).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(order.createdAt)}
                      </p>
                    </div>
                    {onDeleteOrder && (
                      <button
                        onClick={(e) => handleDelete(e, order.id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete held order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                  <Play className="h-4 w-4" />
                  <span>Click to recall</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
