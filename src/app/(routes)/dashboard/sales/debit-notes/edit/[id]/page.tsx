'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye, Save, Send, ArrowLeft } from 'lucide-react';
import {
  CustomerSelection,
  LineItemsTable,
  InvoicePreview,
  InvoiceSummary
} from '../../../create-invoice/components';
import { Customer, Product, LineItem, InvoiceData } from '../../../create-invoice/types';
import { InvoiceService } from '../../../create-invoice/services';
import { DebitNoteService } from '../../services/debitNoteService';
import { CustomerService } from '../../../../customers/services/customerService';
import { CompanyService } from '../../../../company/services/companyService';
import { Company } from '../../../../company/types';
import Link from 'next/link';

export default function EditDebitNote() {
  const router = useRouter();
  const params = useParams();
  const debitNoteId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [reason, setReason] = useState<string>('additional_charge');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitializing(true);

        // Load companies
        const loadedCompanies = await CompanyService.getCompaniesCreatedByMe();
        const verifiedCompanies = loadedCompanies.filter(
          company => company.verificationStatus === 'verified' || company.status === 'verified'
        );
        setCompanies(verifiedCompanies);

        // Load debit note
        const debitNote = await DebitNoteService.getDebitNoteById(debitNoteId);

        if (!debitNote) {
          setMessage({ type: 'error', text: 'Debit note not found' });
          setTimeout(() => router.push('/dashboard/sales/debit-notes'), 2000);
          return;
        }

        // Check if editable
        if (debitNote.status !== 'draft') {
          setIsReadOnly(true);
          setMessage({ type: 'error', text: 'Only draft debit notes can be edited' });
        }

        // Set reason
        if (debitNote.reason) {
          setReason(debitNote.reason);
        }

        // Find and set company
        const companyId = typeof debitNote.companyId === 'object'
          ? debitNote.companyId._id
          : debitNote.companyId;
        const company = verifiedCompanies.find(c => (c._id || c.id) === companyId);
        if (company) {
          setSelectedCompany(company);
        }

        // Set customer if populated
        if (typeof debitNote.customerId === 'object' && debitNote.customerId) {
          setSelectedCustomer(debitNote.customerId as unknown as Customer);
        }

        // Transform debit note to invoice format for the form
        const lineItems: LineItem[] = (debitNote.items || []).map((item, index) => ({
          id: `item-${index}-${Date.now()}`,
          productId: '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 15,
          discount: 0,
          total: item.totalPrice || (item.quantity * item.unitPrice)
        }));

        const invoiceData: InvoiceData = {
          _id: debitNote._id,
          id: debitNote._id,
          invoiceNumber: debitNote.debitNoteNumber || debitNote.invoiceNumber || '',
          invoiceType: (debitNote.debitNoteType || 'standard') as 'standard' | 'simplified',
          issueDate: debitNote.issueDate
            ? new Date(debitNote.issueDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          dueDate: debitNote.dueDate
            ? new Date(debitNote.dueDate).toISOString().split('T')[0]
            : InvoiceService.getDefaultDueDate(),
          currency: debitNote.currency || 'SAR',
          companyId: companyId || '',
          customerId: typeof debitNote.customerId === 'object'
            ? debitNote.customerId._id
            : debitNote.customerId || '',
          lineItems,
          subtotal: debitNote.subtotal || 0,
          totalDiscount: debitNote.discount || 0,
          totalTax: debitNote.totalTax || 0,
          grandTotal: debitNote.total || 0,
          notes: debitNote.reasonDescription || debitNote.notes || '',
          termsAndConditions: debitNote.termsAndConditions || 'Payment is due within 30 days of debit note date.',
          paymentTerms: debitNote.paymentTerms || 'Net 30',
          status: debitNote.status as 'draft' | 'sent',
        };

        // Recalculate totals
        const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoiceData, lineItems);
        setInvoice(updatedInvoice);

      } catch (error) {
        console.error('Error loading debit note:', error);
        setMessage({ type: 'error', text: 'Failed to load debit note' });
      } finally {
        setIsInitializing(false);
      }
    };

    if (debitNoteId) {
      loadData();
    }
  }, [debitNoteId, router]);

  const invoiceType = invoice?.invoiceType;
  useEffect(() => {
    const filterCustomers = async () => {
      try {
        if (!invoiceType) {
          setFilteredCustomers([]);
          return;
        }

        const customerTypeFilter = invoiceType === 'simplified' ? 'individual' : 'company';

        if (customerSearch.trim()) {
          const result = await CustomerService.searchCustomers(customerSearch, { type: customerTypeFilter });
          setFilteredCustomers(result.customers);
        } else {
          const result = await CustomerService.getAllCustomers({ type: customerTypeFilter });
          setFilteredCustomers(result.customers);
        }
      } catch (error) {
        console.error('Error filtering customers:', error);
        setFilteredCustomers([]);
      }
    };

    filterCustomers();
  }, [customerSearch, invoiceType]);

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    if (!invoice || isReadOnly) return;
    const updatedLineItems = InvoiceService.updateLineItem(invoice.lineItems, id, updates);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const addLineItem = (product?: Product) => {
    if (!invoice || isReadOnly) return;
    const updatedLineItems = InvoiceService.addLineItem(invoice.lineItems, product);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const removeLineItem = (id: string) => {
    if (!invoice || isReadOnly) return;
    const updatedLineItems = InvoiceService.removeLineItem(invoice.lineItems, id);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const handleProductSelect = (currentItemId: string, product: Product) => {
    if (!invoice || isReadOnly) return;

    const currentItem = invoice.lineItems.find(item => item.id === currentItemId);

    if (currentItem && currentItem.productId === product.id) {
      const updatedLineItems = InvoiceService.updateLineItem(
        invoice.lineItems,
        currentItemId,
        { quantity: currentItem.quantity + 1 }
      );
      const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
      setInvoice(updatedInvoice);
      return;
    }

    const existingItem = invoice.lineItems.find(
      item => item.productId === product.id && item.id !== currentItemId
    );

    if (existingItem) {
      const updatedLineItems = InvoiceService.updateLineItem(
        invoice.lineItems,
        existingItem.id,
        { quantity: existingItem.quantity + 1 }
      );

      const finalLineItems = (currentItem && !currentItem.description.trim())
        ? updatedLineItems.filter(item => item.id !== currentItemId)
        : updatedLineItems;

      const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, finalLineItems);
      setInvoice(updatedInvoice);
    } else {
      updateLineItem(currentItemId, {
        productId: product.id,
        description: product.name,
        unitPrice: product.price,
        taxRate: product.taxRate,
        quantity: 1
      });
    }
  };

  const selectCustomer = (customer: Customer) => {
    if (isReadOnly) return;
    setSelectedCustomer(customer);
    if (invoice) {
      const customerId = customer._id || customer.id;
      const invoiceType = customer.type === 'individual' ? 'simplified' : 'standard';
      setInvoice(prev => prev ? { ...prev, customerId, invoiceType: invoiceType as 'standard' | 'simplified' } : prev);
    }
    setCustomerSearchOpen(false);
    setCustomerSearch('');
  };

  const clearCustomer = () => {
    if (isReadOnly) return;
    setSelectedCustomer(null);
    if (invoice) {
      setInvoice(prev => prev ? { ...prev, customerId: '' } : prev);
    }
  };

  const handleCustomerInputFocus = () => {
    if (!isReadOnly) {
      setCustomerSearchOpen(true);
    }
  };

  const handleSave = async () => {
    if (!invoice || isReadOnly) return;

    setMessage(null);

    const validation = InvoiceService.validateInvoice(invoice);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    setIsLoading(true);
    try {
      const items = invoice.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discount: item.discount || 0
      }));

      const debitNoteData = {
        companyId: invoice.companyId,
        customerId: invoice.customerId,
        debitNoteType: invoice.invoiceType === 'simplified' ? 'simplified' : 'standard',
        dueDate: invoice.dueDate,
        paymentTerms: invoice.paymentTerms,
        items,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        reason: reason,
        reasonDescription: invoice.notes
      };

      const result = await DebitNoteService.updateDebitNote(debitNoteId, debitNoteData);

      if (result?.success) {
        setMessage({ type: 'success', text: 'Debit note updated successfully!' });
        setTimeout(() => router.push('/dashboard/sales/debit-notes'), 2000);
      } else {
        setMessage({ type: 'error', text: result?.message || 'Failed to update debit note' });
      }
    } catch (error) {
      console.error('Error updating debit note:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update debit note' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!invoice || isReadOnly) return;

    setMessage(null);

    const validation = InvoiceService.validateInvoice(invoice);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    setIsLoading(true);
    try {
      // First save any changes
      const items = invoice.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discount: item.discount || 0
      }));

      const debitNoteData = {
        companyId: invoice.companyId,
        customerId: invoice.customerId,
        debitNoteType: invoice.invoiceType === 'simplified' ? 'simplified' : 'standard',
        dueDate: invoice.dueDate,
        paymentTerms: invoice.paymentTerms,
        items,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        reason: reason,
        reasonDescription: invoice.notes
      };

      await DebitNoteService.updateDebitNote(debitNoteId, debitNoteData);

      // Then send
      const sendResult = await DebitNoteService.sendDebitNote(debitNoteId);

      if (sendResult) {
        setMessage({ type: 'success', text: 'Debit note sent successfully!' });
        setTimeout(() => router.push('/dashboard/sales/debit-notes'), 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to send debit note' });
      }
    } catch (error) {
      console.error('Error sending debit note:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send debit note' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing || !invoice) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading debit note...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            <span className="font-medium">{message.type === 'success' ? '✓ ' : '⚠ '}</span>
            <div className="ml-2 flex-1">{message.text}</div>
            <button onClick={() => setMessage(null)} className="ml-4 text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>
      )}

      {/* Read-only Warning */}
      {isReadOnly && (
        <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
          <div className="flex items-center">
            <span className="font-medium">⚠ This debit note cannot be edited because it has already been sent.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/sales/debit-notes" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Debit Note</h1>
            <p className="text-gray-600">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            <span className="font-medium">Preview</span>
          </button>
          {!isReadOnly && (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span className="font-medium">{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="font-medium">{isLoading ? 'Sending...' : 'Send Debit Note'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Debit Note Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debit Note Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <select
                value={selectedCompany?._id || selectedCompany?.id || ''}
                disabled={isReadOnly}
                onChange={(e) => {
                  const company = companies.find(c => (c._id || c.id) === e.target.value);
                  setSelectedCompany(company || null);
                  if (company) {
                    const companyId = company._id || company.id || '';
                    setInvoice(prev => prev ? { ...prev, companyId } : prev);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary border-gray-300 ${isReadOnly ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company._id || company.id} value={company._id || company.id}>{company.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Type</label>
              <select
                value={invoice.invoiceType}
                disabled={isReadOnly}
                onChange={(e) => {
                  const newType = e.target.value as InvoiceData['invoiceType'];
                  setInvoice(prev => prev ? { ...prev, invoiceType: newType, customerId: '' } : prev);
                  setSelectedCustomer(null);
                }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${isReadOnly ? 'bg-gray-100' : ''}`}
              >
                <option value="standard">B2B (Business)</option>
                <option value="simplified">B2C (Individual)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Debit Note Number</label>
              <input
                type="text"
                value={invoice.invoiceNumber}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
              <input
                type="date"
                value={invoice.issueDate}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={invoice.dueDate}
                disabled={isReadOnly}
                onChange={(e) => setInvoice(prev => prev ? { ...prev, dueDate: e.target.value } : prev)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${isReadOnly ? 'bg-gray-100' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Customer, Currency, Payment Terms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CustomerSelection
            selectedCustomer={selectedCustomer}
            customerSearch={customerSearch}
            customerSearchOpen={customerSearchOpen && !isReadOnly}
            filteredCustomers={filteredCustomers}
            onCustomerSearchChange={setCustomerSearch}
            onCustomerSearchFocus={handleCustomerInputFocus}
            onCustomerSelect={selectCustomer}
            onCustomerClear={clearCustomer}
            onSearchOpenChange={setCustomerSearchOpen}
          />
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency</h3>
            <select
              value={invoice.currency}
              disabled={isReadOnly}
              onChange={(e) => setInvoice(prev => prev ? { ...prev, currency: e.target.value } : prev)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${isReadOnly ? 'bg-gray-100' : ''}`}
            >
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="AED">AED - UAE Dirham</option>
            </select>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h3>
            <select
              value={invoice.paymentTerms}
              disabled={isReadOnly}
              onChange={(e) => setInvoice(prev => prev ? { ...prev, paymentTerms: e.target.value } : prev)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${isReadOnly ? 'bg-gray-100' : ''}`}
            >
              <option value="Due on receipt">Due on receipt</option>
              <option value="Net 15">Net 15 days</option>
              <option value="Net 30">Net 30 days</option>
              <option value="Net 45">Net 45 days</option>
              <option value="Net 60">Net 60 days</option>
            </select>
          </div>
        </div>

        {/* Line Items */}
        <LineItemsTable
          lineItems={invoice.lineItems}
          currency={invoice.currency}
          onAddLineItem={isReadOnly ? () => {} : addLineItem}
          onUpdateLineItem={isReadOnly ? () => {} : updateLineItem}
          onRemoveLineItem={isReadOnly ? () => {} : removeLineItem}
          onProductSelect={isReadOnly ? () => {} : handleProductSelect}
        />

        {/* Summary and Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason Type</label>
                <select
                  value={reason}
                  disabled={isReadOnly}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  <option value="additional_charge">Additional Charge</option>
                  <option value="price_adjustment">Price Adjustment</option>
                  <option value="correction">Correction</option>
                  <option value="service_fee">Service Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason Description</label>
                <textarea
                  value={invoice.notes}
                  disabled={isReadOnly}
                  onChange={(e) => setInvoice(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Additional details about the reason..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions</label>
                <textarea
                  value={invoice.termsAndConditions}
                  disabled={isReadOnly}
                  onChange={(e) => setInvoice(prev => prev ? { ...prev, termsAndConditions: e.target.value } : prev)}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>
          </div>
          <InvoiceSummary
            subtotal={invoice.subtotal}
            totalDiscount={invoice.totalDiscount}
            totalTax={invoice.totalTax}
            grandTotal={invoice.grandTotal}
            currency={invoice.currency}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <InvoicePreview
        isOpen={showPreview}
        invoice={invoice}
        selectedCustomer={selectedCustomer}
        selectedCompany={selectedCompany}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
