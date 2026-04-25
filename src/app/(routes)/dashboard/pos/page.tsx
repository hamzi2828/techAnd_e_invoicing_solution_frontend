'use client';

import React, { useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePOS } from './hooks/usePOS';
import { usePlan } from '@/contexts/PlanContext';
import POSService from './services/posService';
import {
  SearchBar,
  CategoryFilter,
  ProductGrid,
  Cart,
  PaymentModal,
  HeldOrdersModal
} from './components';
import type { HeldOrder } from './components';

// Toast notification component
function Toast({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Upgrade prompt component for users without POS access
function UpgradePrompt() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">POS Access Required</h2>
          <p className="text-blue-100">
            The Point of Sale module is available on Professional and Enterprise plans.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-2">What you get with POS:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Quick sales with walk-in customers
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Create invoices for registered customers
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Real-time sales tracking and reports
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Multiple payment methods support
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard/settings/billing"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Upgrade to Professional
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="text-center text-xs text-gray-500">
            Starting at SAR 299/month
          </p>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  const { hasFeature, isLoading: isPlanLoading } = usePlan();

  const {
    products,
    categories,
    customers,
    cart,
    selectedCustomer,
    selectedCategory,
    searchTerm,
    discountPercent,
    paymentMethod,
    orderSummary,
    isLoadingProducts,
    isLoadingCustomers,
    error,
    setSearchTerm,
    setSelectedCategory,
    setSelectedCustomer,
    setDiscountPercent,
    setPaymentMethod,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    searchCustomers,
    holdOrder,
    recallOrder,
    getHeldOrders,
    refreshData
  } = usePOS();

  // UI State - must be declared before any conditional returns (React hooks rules)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    orderNumber?: string;
    total: number;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide toast after 5 seconds
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Get held orders
  const heldOrders: HeldOrder[] = getHeldOrders();

  // Show loading while checking plan access
  if (isPlanLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if POS Access feature is not available
  if (!hasFeature('POS Access')) {
    return <UpgradePrompt />;
  }

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  }, [cart.length]);

  // Process payment
  const processPayment = useCallback(async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const order = await POSService.createOrder({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount,
          taxRate: item.taxRate,
          total: item.total
        })),
        subtotal: orderSummary.subtotal,
        discountPercent,
        discountAmount: orderSummary.discountAmount,
        taxAmount: orderSummary.taxAmount,
        total: orderSummary.total,
        paymentMethod
      });

      setLastOrder({
        orderNumber: order.orderNumber,
        total: order.total
      });
      setShowPaymentModal(false);
      clearCart();

      const successMsg = selectedCustomer
        ? `Invoice #${order.orderNumber} created!`
        : `Receipt #${order.orderNumber} - Walk-in sale complete!`;
      showToast(successMsg, 'success');
    } catch (err) {
      console.error('Payment failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [cart, selectedCustomer, orderSummary, discountPercent, paymentMethod, clearCart, showToast]);

  // Print receipt
  const handlePrintReceipt = useCallback(() => {
    if (!lastOrder) return;

    const receiptWindow = window.open('', '_blank', 'width=350,height=600');
    if (receiptWindow) {
      receiptWindow.document.write(POSService.generateReceiptHTML({
        orderNumber: lastOrder.orderNumber,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        items: cart,
        subtotal: orderSummary.subtotal,
        discountPercent,
        discountAmount: orderSummary.discountAmount,
        taxAmount: orderSummary.taxAmount,
        total: lastOrder.total,
        paymentMethod,
        paymentStatus: 'completed'
      }));
      receiptWindow.document.close();
      receiptWindow.print();
    }
  }, [lastOrder, selectedCustomer, cart, orderSummary, discountPercent, paymentMethod]);

  // Handle hold order
  const handleHoldOrder = useCallback(() => {
    holdOrder();
  }, [holdOrder]);

  // Handle recall order
  const handleRecallOrder = useCallback((orderId: string) => {
    recallOrder(orderId);
  }, [recallOrder]);

  // Delete held order
  const handleDeleteHeldOrder = useCallback((orderId: string) => {
    const orders = JSON.parse(localStorage.getItem('pos_held_orders') || '[]');
    const updatedOrders = orders.filter((o: HeldOrder) => o.id !== orderId);
    localStorage.setItem('pos_held_orders', JSON.stringify(updatedOrders));
    // Force re-render by updating state
    setShowHeldOrdersModal(false);
    setTimeout(() => setShowHeldOrdersModal(true), 0);
  }, []);

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-4">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          {/* Search and Controls */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isLoading={isLoadingProducts}
            onRefresh={refreshData}
            heldOrdersCount={heldOrders.length}
            onShowHeldOrders={() => setShowHeldOrdersModal(true)}
          />

          {/* Categories */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductGrid
            products={products}
            viewMode={viewMode}
            isLoading={isLoadingProducts}
            error={error}
            onAddToCart={addToCart}
            onRetry={refreshData}
          />
        </div>
      </div>

      {/* Right Panel - Cart */}
      <Cart
        cart={cart}
        customers={customers}
        selectedCustomer={selectedCustomer}
        discountPercent={discountPercent}
        paymentMethod={paymentMethod}
        orderSummary={orderSummary}
        isLoadingCustomers={isLoadingCustomers}
        onSelectCustomer={setSelectedCustomer}
        onSearchCustomers={searchCustomers}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onHoldOrder={handleHoldOrder}
        onSetDiscount={setDiscountPercent}
        onSetPaymentMethod={setPaymentMethod}
        onCheckout={handleCheckout}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        isProcessing={isProcessing}
        orderSummary={orderSummary}
        discountPercent={discountPercent}
        paymentMethod={paymentMethod}
        selectedCustomer={selectedCustomer}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={processPayment}
        onPrintReceipt={handlePrintReceipt}
      />

      {/* Held Orders Modal */}
      <HeldOrdersModal
        isOpen={showHeldOrdersModal}
        heldOrders={heldOrders}
        onClose={() => setShowHeldOrdersModal(false)}
        onRecallOrder={handleRecallOrder}
        onDeleteOrder={handleDeleteHeldOrder}
      />
    </div>
  );
}
