'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Pause,
  Tag,
  Percent,
  Banknote,
  CreditCard,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { CartItem, POSCustomer, PaymentMethod, OrderSummary } from '../types';
import CartItemCard from './CartItemCard';
import CustomerSelector from './CustomerSelector';

interface CartProps {
  cart: CartItem[];
  customers: POSCustomer[];
  selectedCustomer: POSCustomer | null;
  discountPercent: number;
  paymentMethod: PaymentMethod;
  orderSummary: OrderSummary;
  isLoadingCustomers: boolean;
  onSelectCustomer: (customer: POSCustomer | null) => void;
  onSearchCustomers: (query: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onHoldOrder: () => void;
  onSetDiscount: (percent: number) => void;
  onSetPaymentMethod: (method: PaymentMethod) => void;
  onCheckout: () => void;
}

const PAYMENT_METHODS: { method: PaymentMethod; icon: React.ElementType; label: string }[] = [
  { method: 'cash', icon: Banknote, label: 'Cash' },
  { method: 'card', icon: CreditCard, label: 'Card' },
  { method: 'transfer', icon: QrCode, label: 'Transfer' }
];

export default function Cart({
  cart,
  customers,
  selectedCustomer,
  discountPercent,
  paymentMethod,
  orderSummary,
  isLoadingCustomers,
  onSelectCustomer,
  onSearchCustomers,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onHoldOrder,
  onSetDiscount,
  onSetPaymentMethod,
  onCheckout
}: CartProps) {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState(discountPercent);

  const handleApplyDiscount = () => {
    onSetDiscount(Math.min(100, Math.max(0, discountValue)));
    setShowDiscountInput(false);
  };

  return (
    <div className="w-[420px] flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Cart Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-gray-900">Current Order</h2>
            {cart.length > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {orderSummary.itemCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <>
                <button
                  onClick={onHoldOrder}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                  title="Hold order for later"
                >
                  <Pause className="h-4 w-4" />
                  Hold
                </button>
                <button
                  onClick={onClearCart}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Customer Selection */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Customer</span>
            {!selectedCustomer && cart.length > 0 && (
              <span className="text-xs text-blue-600">
                Walk-in (no invoice)
              </span>
            )}
          </div>
          <CustomerSelector
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={onSelectCustomer}
            onSearchCustomers={onSearchCustomers}
            isLoading={isLoadingCustomers}
          />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium">Cart is empty</p>
            <p className="text-sm">Add products to start a sale</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer - Totals & Actions */}
      <div className="border-t bg-gray-50 p-4 space-y-3">
        {/* Discount */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setDiscountValue(discountPercent);
              setShowDiscountInput(!showDiscountInput);
            }}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            <Tag className="h-4 w-4" />
            <span>Add Discount</span>
          </button>
          {discountPercent > 0 && (
            <span className="text-sm text-green-600 font-medium">-{discountPercent}%</span>
          )}
        </div>

        {showDiscountInput && (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-8"
                placeholder="0"
                min="0"
                max="100"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={handleApplyDiscount}
              className="px-3 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Apply
            </button>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>SAR {orderSummary.subtotal.toFixed(2)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discountPercent}%)</span>
              <span>-SAR {orderSummary.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>VAT (15%)</span>
            <span>SAR {orderSummary.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>SAR {orderSummary.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Quick Select */}
        <div className="flex gap-2">
          {PAYMENT_METHODS.map(({ method, icon: Icon, label }) => (
            <button
              key={method}
              onClick={() => onSetPaymentMethod(method)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                paymentMethod === method
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>

        {/* Walk-in Info */}
        {!selectedCustomer && cart.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Walk-in sale - receipt only, no invoice created</span>
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          Charge SAR {orderSummary.total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
