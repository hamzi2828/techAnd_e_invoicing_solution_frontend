'use client';

import React from 'react';
import {
  X,
  User,
  Banknote,
  CreditCard,
  QrCode,
  Loader2,
  Printer,
  Mail,
  Receipt
} from 'lucide-react';
import { POSCustomer, PaymentMethod, OrderSummary } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  orderSummary: OrderSummary;
  discountPercent: number;
  paymentMethod: PaymentMethod;
  selectedCustomer: POSCustomer | null;
  onClose: () => void;
  onConfirm: () => void;
  onPrintReceipt: () => void;
  onEmailReceipt?: () => void;
  onViewInvoice?: () => void;
}

const PAYMENT_INFO: Record<PaymentMethod, { icon: React.ElementType; title: string; description: string }> = {
  cash: {
    icon: Banknote,
    title: 'Cash Payment',
    description: 'Collect cash from customer'
  },
  card: {
    icon: CreditCard,
    title: 'Card Payment',
    description: 'Process card transaction'
  },
  transfer: {
    icon: QrCode,
    title: 'Bank Transfer',
    description: 'Scan QR code or use bank details'
  },
  credit: {
    icon: CreditCard,
    title: 'Credit',
    description: 'Add to customer credit'
  }
};

export default function PaymentModal({
  isOpen,
  isProcessing,
  orderSummary,
  discountPercent,
  paymentMethod,
  selectedCustomer,
  onClose,
  onConfirm,
  onPrintReceipt,
  onEmailReceipt,
  onViewInvoice
}: PaymentModalProps) {
  if (!isOpen) return null;

  const paymentInfo = PAYMENT_INFO[paymentMethod];
  const PaymentIcon = paymentInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Items ({orderSummary.itemCount})</span>
              <span>SAR {orderSummary.subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-2">
                <span>Discount</span>
                <span>-SAR {orderSummary.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>VAT (15%)</span>
              <span>SAR {orderSummary.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>SAR {orderSummary.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Display */}
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <PaymentIcon className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium text-gray-900">{paymentInfo.title}</p>
              <p className="text-sm text-gray-500">{paymentInfo.description}</p>
            </div>
          </div>

          {/* Customer Info */}
          {selectedCustomer && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="h-6 w-6 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>

          {/* Receipt Options */}
          <div className="flex justify-center gap-4 pt-2 border-t">
            <button
              onClick={onPrintReceipt}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            <button
              onClick={onEmailReceipt}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              Email Receipt
            </button>
            <button
              onClick={onViewInvoice}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
            >
              <Receipt className="h-4 w-4" />
              View Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
