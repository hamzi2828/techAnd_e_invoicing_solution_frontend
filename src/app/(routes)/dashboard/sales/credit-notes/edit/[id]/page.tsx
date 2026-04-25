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
import { CreditNoteService } from '../../services/creditNoteService';
import { CustomerService } from '../../../../customers/services/customerService';
import { CompanyService } from '../../../../company/services/companyService';
import { Company } from '../../../../company/types';
import Link from 'next/link';

export default function EditCreditNote() {
  const router = useRouter();
  const params = useParams();
  const creditNoteId = params.id as string;

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
  const [reason, setReason] = useState<string>('return');

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

        // Load credit note
        const creditNote = await CreditNoteService.getCreditNoteById(creditNoteId);

        if (!creditNote) {
          setMessage({ type: 'error', text: 'Credit note not found' });
          setTimeout(() => router.push('/dashboard/sales/credit-notes'), 2000);
          return;
        }

        // Check if editable
        if (creditNote.status !== 'draft') {
          setIsReadOnly(true);
          setMessage({ type: 'error', text: 'Only draft credit notes can be edited' });
        }

        // Set reason
        if (creditNote.reason) {
          setReason(creditNote.reason);
        }

        // Find and set company
        const companyId = typeof creditNote.companyId === 'object'
          ? creditNote.companyId._id
          : creditNote.companyId;
        const company = verifiedCompanies.find(c => (c._id || c.id) === companyId);
        if (company) {
          setSelectedCompany(company);
        }

        // Set customer if populated
        if (typeof creditNote.customerId === 'object' && creditNote.customerId) {
          setSelectedCustomer(creditNote.customerId as unknown as Customer);
        }

        // Transform credit note to invoice format for the form
        const lineItems: LineItem[] = (creditNote.items || []).map((item, index) => ({
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
          _id: creditNote._id,
          id: creditNote._id,
          invoiceNumber: creditNote.creditNoteNumber || creditNote.invoiceNumber || '',
          invoiceType: (creditNote.creditNoteType || 'standard') as 'standard' | 'simplified',
          issueDate: creditNote.issueDate
            ? new Date(creditNote.issueDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          dueDate: creditNote.dueDate
            ? new Date(creditNote.dueDate).toISOString().split('T')[0]
            : InvoiceService.getDefaultDueDate(),
          currency: creditNote.currency || 'SAR',
          companyId: companyId || '',
          customerId: typeof creditNote.customerId === 'object'
            ? creditNote.customerId._id
            : creditNote.customerId || '',
          lineItems,
          subtotal: creditNote.subtotal || 0,
          totalDiscount: creditNote.discount || 0,
          totalTax: creditNote.totalTax || 0,
          grandTotal: creditNote.total || 0,
          notes: creditNote.reasonDescription || creditNote.notes || '',
          termsAndConditions: creditNote.termsAndConditions || 'This credit note is valid for 30 days.',
          paymentTerms: creditNote.paymentTerms || 'Net 30',
          status: creditNote.status as 'draft' | 'sent',
        };

        // Recalculate totals
        const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoiceData, lineItems);
        setInvoice(updatedInvoice);

      } catch (error) {
        console.error('Error loading credit note:', error);
        setMessage({ type: 'error', text: 'Failed to load credit note' });
      } finally {
        setIsInitializing(false);
      }
    };

    if (creditNoteId) {
      loadData();
    }
  }, [creditNoteId, router]);

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

      const creditNoteData = {
        companyId: invoice.companyId,
        customerId: invoice.customerId,
        items,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        reason: reason,
        reasonDescription: invoice.notes
      };

      const result = await CreditNoteService.updateCreditNote(creditNoteId, creditNoteData);

      if (result?.success) {
        setMessage({ type: 'success', text: 'Credit note updated successfully!' });
        setTimeout(() => router.push('/dashboard/sales/credit-notes'), 2000);
      } else {
        setMessage({ type: 'error', text: result?.message || 'Failed to update credit note' });
      }
    } catch (error) {
      console.error('Error updating credit note:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update credit note' });
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

      const creditNoteData = {
        companyId: invoice.companyId,
        customerId: invoice.customerId,
        items,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        reason: reason,
        reasonDescription: invoice.notes
      };

      await CreditNoteService.updateCreditNote(creditNoteId, creditNoteData);

      // Then send
      const sendResult = await CreditNoteService.sendCreditNote(creditNoteId);

      if (sendResult) {
        setMessage({ type: 'success', text: 'Credit note sent successfully!' });
        setTimeout(() => router.push('/dashboard/sales/credit-notes'), 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to send credit note' });
      }
    } catch (error) {
      console.error('Error sending credit note:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send credit note' });
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
            <p className="mt-4 text-gray-600">Loading credit note...</p>
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
            <span className="font-medium">This credit note cannot be edited because it has already been sent.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/sales/credit-notes" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Credit Note</h1>
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
                <span className="font-medium">{isLoading ? 'Sending...' : 'Send Credit Note'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Credit Note Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Note Details</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Note Number</label>
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
          </div>
        </div>

        {/* Customer and Currency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <option value="return">Return</option>
                  <option value="discount">Discount</option>
                  <option value="correction">Correction</option>
                  <option value="cancellation">Cancellation</option>
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
