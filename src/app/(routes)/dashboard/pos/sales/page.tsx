'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Calendar,
  RefreshCw,
  Eye,
  Printer,
  Trash2,
  Receipt,
  Banknote,
  CreditCard,
  QrCode,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { POSOrder } from '../types';
import POSService from '../services/posService';

// Receipt View Modal
function ReceiptModal({
  sale,
  isOpen,
  onClose
}: {
  sale: POSOrder | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    const receiptWindow = window.open('', '_blank', 'width=350,height=600');
    if (receiptWindow) {
      receiptWindow.document.write(POSService.generateReceiptHTML(sale));
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-gray-900">Receipt #{sale.orderNumber}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Sale Info */}
          <div className="mb-4 pb-4 border-b border-dashed">
            <p className="text-sm text-gray-600">
              Date: {new Date(sale.createdAt || '').toLocaleString('en-SA', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
            <p className="text-sm text-gray-600">Customer: {sale.customerName}</p>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4 pb-4 border-b border-dashed">
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>SAR {item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>SAR {sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({sale.discountPercent}%)</span>
                <span>-SAR {sale.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>VAT (15%)</span>
              <span>SAR {sale.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>SAR {sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-4 pt-4 border-t text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
              {sale.paymentMethod === 'cash' && <Banknote className="h-4 w-4" />}
              {sale.paymentMethod === 'card' && <CreditCard className="h-4 w-4" />}
              {sale.paymentMethod === 'transfer' && <QrCode className="h-4 w-4" />}
              {sale.paymentMethod.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  saleNumber
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saleNumber: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Delete Sale</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete receipt <strong>#{saleNumber}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function POSSalesPage() {
  const [sales, setSales] = useState<POSOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'transfer'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<POSOrder | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<POSOrder | null>(null);
  const itemsPerPage = 10;

  // Load sales from localStorage
  const loadSales = () => {
    const savedSales = localStorage.getItem('pos_sales_history');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      setSales([]);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // Filter sales
  const filteredSales = useMemo(() => {
    let result = [...sales];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(sale =>
        sale.orderNumber?.toLowerCase().includes(search) ||
        sale.customerName?.toLowerCase().includes(search) ||
        sale.items.some(item => item.name.toLowerCase().includes(search))
      );
    }

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    if (dateFilter === 'today') {
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || '');
        return saleDate >= today;
      });
    } else if (dateFilter === 'week') {
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || '');
        return saleDate >= weekAgo;
      });
    } else if (dateFilter === 'month') {
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt || '');
        return saleDate >= monthAgo;
      });
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      result = result.filter(sale => sale.paymentMethod === paymentFilter);
    }

    return result;
  }, [sales, searchTerm, dateFilter, paymentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredSales.length;
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    const cashSales = filteredSales.filter(s => s.paymentMethod === 'cash').length;
    const cardSales = filteredSales.filter(s => s.paymentMethod === 'card').length;
    const transferSales = filteredSales.filter(s => s.paymentMethod === 'transfer').length;

    return { totalRevenue, totalSales, avgSale, cashSales, cardSales, transferSales };
  }, [filteredSales]);

  // Handle view receipt
  const handleViewReceipt = (sale: POSOrder) => {
    setSelectedSale(sale);
    setShowReceiptModal(true);
  };

  // Handle print receipt
  const handlePrintReceipt = (sale: POSOrder) => {
    const receiptWindow = window.open('', '_blank', 'width=350,height=600');
    if (receiptWindow) {
      receiptWindow.document.write(POSService.generateReceiptHTML(sale));
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  // Handle delete
  const handleDeleteClick = (sale: POSOrder) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!saleToDelete) return;

    const updatedSales = sales.filter(s => s.id !== saleToDelete.id);
    localStorage.setItem('pos_sales_history', JSON.stringify(updatedSales));
    setSales(updatedSales);
    setShowDeleteModal(false);
    setSaleToDelete(null);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'transfer': return <QrCode className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS Sales</h1>
          <p className="text-gray-600 mt-1">View and manage walk-in sales receipts</p>
        </div>
        <button
          onClick={loadSales}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Receipt className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-bold text-gray-900">{summaryStats.totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Banknote className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">SAR {summaryStats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Sale</p>
              <p className="text-xl font-bold text-gray-900">SAR {summaryStats.avgSale.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <QrCode className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">By Payment</p>
              <p className="text-sm text-gray-900">
                Cash: {summaryStats.cashSales} | Card: {summaryStats.cardSales} | Transfer: {summaryStats.transferSales}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by receipt #, customer, or product..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as typeof dateFilter);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as typeof paymentFilter);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600">
              {sales.length === 0
                ? 'Walk-in sales will appear here after you make a sale from the POS Terminal.'
                : 'Try adjusting your filters to see more results.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Receipt #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary">#{sale.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(sale.createdAt || '').toLocaleString('en-SA', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className="font-medium">{sale.items.length} items</span>
                          <span className="text-gray-500 ml-2">
                            ({sale.items.reduce((sum, item) => sum + item.quantity, 0)} qty)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-sm">
                          {getPaymentIcon(sale.paymentMethod)}
                          {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-gray-900">SAR {sale.total.toFixed(2)}</span>
                        {sale.discountAmount > 0 && (
                          <span className="block text-xs text-green-600">-{sale.discountPercent}% off</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewReceipt(sale)}
                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded"
                            title="View Receipt"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(sale)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Print Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(sale)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredSales.length)} of{' '}
                  {filteredSales.length} sales
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        sale={selectedSale}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSaleToDelete(null);
        }}
        onConfirm={confirmDelete}
        saleNumber={saleToDelete?.orderNumber || ''}
      />
    </div>
  );
}
