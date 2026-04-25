'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Save, RefreshCw, ArrowLeft } from 'lucide-react';
import {
  CustomerSelection,
  LineItemsTable,
  InvoicePreview,
  InvoiceSummary
} from '../../create-invoice/components';
import { Customer, Product, LineItem, InvoiceData } from '../../create-invoice/types';
import { InvoiceService } from '../../create-invoice/services';
import { DebitNoteService } from '../services/debitNoteService';
import { CustomerService } from '../../../customers/services/customerService';
import { CompanyService } from '../../../company/services/companyService';
import { Company } from '../../../company/types';
import Link from 'next/link';

// Phase types for ZATCA compliance
type ZatcaPhase = 'phase1' | 'phase2' | 'not_onboarded';

export default function CreateDebitNote() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingNumber, setIsRefreshingNumber] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [reason, setReason] = useState<string>('additional_charge');

  // Determine current ZATCA phase based on selected company
  const currentPhase: ZatcaPhase = useMemo(() => {
    if (!selectedCompany) return 'not_onboarded';
    if (selectedCompany.zatcaCredentials?.status === 'verified') return 'phase2';
    return 'phase1';
  }, [selectedCompany]);

  // Reference Invoice state
  const [referenceInvoices, setReferenceInvoices] = useState<Array<{
    _id: string;
    id?: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    invoiceType?: string;
    status: string;
    paymentStatus: string;
    total: number;
    currency: string;
    subtotal: number;
    totalTax: number;
    notes?: string;
    termsAndConditions?: string;
    paymentTerms?: string;
    companyId: string | { _id: string; companyName?: string };
    customerId: string | {
      _id: string;
      customerName?: string;
      name?: string;
      email?: string;
      phone?: string;
      contactInfo?: { email?: string; phone?: string; contactPerson?: string };
      address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
      type?: string;
      customerType?: string;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      taxRate: number;
      taxAmount: number;
      discount?: number;
    }>;
  }>>([]);
  const [selectedReferenceInvoiceId, setSelectedReferenceInvoiceId] = useState<string>('');
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [referenceInvoiceSearch, setReferenceInvoiceSearch] = useState<string>('');
  const [referenceInvoiceDropdownOpen, setReferenceInvoiceDropdownOpen] = useState(false);
  const referenceInvoiceRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (referenceInvoiceRef.current && !referenceInvoiceRef.current.contains(event.target as Node)) {
        setReferenceInvoiceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitializing(true);

        // Load ALL companies (for Phase 1 support)
        const loadedCompanies = await CompanyService.getCompaniesCreatedByMe();
        setAllCompanies(loadedCompanies);

        const defaultCompany = loadedCompanies.find(company => company.isDefault);
        const companyToSelect = defaultCompany || (loadedCompanies.length === 1 ? loadedCompanies[0] : null);

        if (companyToSelect) {
          const companyId = companyToSelect._id || companyToSelect.id || '';
          setSelectedCompany(companyToSelect);

          const debitNoteNumber = await DebitNoteService.fetchNextDebitNoteNumber(companyId);

          // Load reference invoices for the selected company
          const invoicesResult = await DebitNoteService.getInvoicesForReference(companyId);
          setReferenceInvoices(invoicesResult.invoices);

          const initialInvoiceData: InvoiceData = {
            invoiceNumber: debitNoteNumber,
            invoiceType: '' as const,
            zatcaInvoiceTypeCode: '' as const,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: InvoiceService.getDefaultDueDate(),
            currency: 'SAR',
            companyId: companyId,
            customerId: '',
            lineItems: [],
            subtotal: 0,
            totalDiscount: 0,
            totalTax: 0,
            grandTotal: 0,
            notes: '',
            termsAndConditions: 'Payment is due within 30 days of debit note date.',
            paymentTerms: 'Net 30',
            status: 'draft' as const,
          };
          setInvoice(initialInvoiceData);
        } else {
          const initialInvoiceData: InvoiceData = {
            invoiceNumber: '',
            invoiceType: '' as const,
            zatcaInvoiceTypeCode: '' as const,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: InvoiceService.getDefaultDueDate(),
            currency: 'SAR',
            companyId: '',
            customerId: '',
            lineItems: [],
            subtotal: 0,
            totalDiscount: 0,
            totalTax: 0,
            grandTotal: 0,
            notes: '',
            termsAndConditions: 'Payment is due within 30 days of debit note date.',
            paymentTerms: 'Net 30',
            status: 'draft' as const,
          };
          setInvoice(initialInvoiceData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        const fallbackInvoice: InvoiceData = {
          invoiceNumber: `DN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
          invoiceType: '' as const,
          zatcaInvoiceTypeCode: '' as const,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: InvoiceService.getDefaultDueDate(),
          currency: 'SAR',
          companyId: '',
          customerId: '',
          lineItems: [],
          subtotal: 0,
          totalDiscount: 0,
          totalTax: 0,
          grandTotal: 0,
          notes: '',
          termsAndConditions: 'Payment is due within 30 days of debit note date.',
          paymentTerms: 'Net 30',
          status: 'draft' as const,
        };
        setInvoice(fallbackInvoice);
      } finally {
        setIsInitializing(false);
      }
    };

    loadData();
  }, []);

  // Load reference invoices when company changes
  const loadReferenceInvoices = async (companyId: string) => {
    setIsLoadingInvoices(true);
    try {
      const result = await DebitNoteService.getInvoicesForReference(companyId);
      setReferenceInvoices(result.invoices);
    } catch (error) {
      console.error('Error loading reference invoices:', error);
      setReferenceInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  // Filter reference invoices based on search input
  const filteredReferenceInvoices = referenceInvoices.filter(inv => {
    if (!referenceInvoiceSearch.trim()) return true;

    const searchLower = referenceInvoiceSearch.toLowerCase();
    const companyName = typeof inv.companyId === 'object'
      ? (inv.companyId.companyName || '').toLowerCase()
      : '';
    const customerName = typeof inv.customerId === 'object'
      ? (inv.customerId.customerName || inv.customerId.name || '').toLowerCase()
      : '';
    const invoiceNumber = (inv.invoiceNumber || '').toLowerCase();
    const total = inv.total.toString();

    return (
      invoiceNumber.includes(searchLower) ||
      companyName.includes(searchLower) ||
      customerName.includes(searchLower) ||
      total.includes(searchLower)
    );
  });

  // Handle reference invoice selection - populate all form data
  const handleReferenceInvoiceSelect = (invoiceId: string) => {
    setSelectedReferenceInvoiceId(invoiceId);
    setReferenceInvoiceDropdownOpen(false);

    if (!invoiceId) {
      setReferenceInvoiceSearch('');
      return;
    }

    const selectedInvoice = referenceInvoices.find(inv => (inv._id || inv.id) === invoiceId);
    if (!selectedInvoice || !invoice) return;

    // Set the search text to show selected invoice with company and customer
    const companyName = typeof selectedInvoice.companyId === 'object'
      ? selectedInvoice.companyId.companyName
      : '';
    const customerName = typeof selectedInvoice.customerId === 'object'
      ? (selectedInvoice.customerId.customerName || selectedInvoice.customerId.name)
      : 'Unknown';
    const displayText = companyName
      ? `${selectedInvoice.invoiceNumber} - ${companyName} - ${customerName}`
      : `${selectedInvoice.invoiceNumber} - ${customerName}`;
    setReferenceInvoiceSearch(displayText);

    // Get customer data
    const customerId = typeof selectedInvoice.customerId === 'object'
      ? selectedInvoice.customerId._id
      : selectedInvoice.customerId;

    const customerData = typeof selectedInvoice.customerId === 'object'
      ? selectedInvoice.customerId
      : null;

    // Determine invoice type based on customer type
    const customerType = customerData?.type;
    const invoiceType = customerType === 'individual' ? 'simplified' : 'standard';

    // Transform items to line items format
    const lineItems: LineItem[] = selectedInvoice.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      productId: '',
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      taxRate: item.taxRate,
      amount: item.quantity * item.unitPrice,
      taxAmount: item.taxAmount,
      total: item.totalPrice
    }));

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + (item.amount * (item.discount || 0) / 100), 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotal - totalDiscount + totalTax;

    // Set customer if found - map API fields to Customer interface
    // Handle multiple possible field names from different API responses
    const mappedName = customerData?.customerName || customerData?.name || '';
    const mappedEmail = customerData?.email || customerData?.contactInfo?.email || '';
    const mappedPhone = customerData?.phone || customerData?.contactInfo?.phone || '';
    const mappedType = customerData?.type || customerData?.customerType || 'company';

    if (customerData && (mappedName || customerData._id)) {
      const mappedCustomer: Customer = {
        _id: customerData._id,
        id: customerData._id,
        name: mappedName || 'Unknown Customer',
        email: mappedEmail,
        phone: mappedPhone,
        address: customerData?.address?.street || '',
        city: customerData?.address?.city || '',
        country: customerData?.address?.country || '',
        companyName: mappedName,
        type: (mappedType === 'individual' ? 'individual' : 'business') as 'business' | 'individual'
      };
      console.log('Setting customer from reference invoice:', mappedCustomer);
      setSelectedCustomer(mappedCustomer);
    } else {
      console.warn('Customer data not found or incomplete in reference invoice:', customerData);
    }

    // Update invoice with all data from reference invoice
    setInvoice(prev => prev ? {
      ...prev,
      invoiceType: invoiceType as 'standard' | 'simplified',
      customerId: customerId,
      currency: selectedInvoice.currency,
      paymentTerms: selectedInvoice.paymentTerms || prev.paymentTerms,
      lineItems: lineItems,
      subtotal: subtotal,
      totalDiscount: totalDiscount,
      totalTax: totalTax,
      grandTotal: grandTotal,
      notes: selectedInvoice.notes || '',
      termsAndConditions: selectedInvoice.termsAndConditions || prev.termsAndConditions,
    } : prev);

    setMessage({ type: 'success', text: `Data populated from invoice ${selectedInvoice.invoiceNumber}` });
    setTimeout(() => setMessage(null), 3000);
  };

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

  const refreshInvoiceNumber = async () => {
    if (!invoice) return;

    const companyId = selectedCompany?._id || selectedCompany?.id;
    if (!companyId) {
      setMessage({ type: 'error', text: 'Please select a company first' });
      return;
    }

    setIsRefreshingNumber(true);
    try {
      const newDebitNoteNumber = await DebitNoteService.fetchNextDebitNoteNumber(companyId);
      setInvoice(prev => prev ? { ...prev, invoiceNumber: newDebitNoteNumber } : prev);
      setMessage({ type: 'success', text: 'Debit note number refreshed' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error refreshing debit note number:', error);
      setMessage({ type: 'error', text: 'Failed to refresh debit note number' });
    } finally {
      setIsRefreshingNumber(false);
    }
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    if (!invoice) return;
    const updatedLineItems = InvoiceService.updateLineItem(invoice.lineItems, id, updates);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const addLineItem = (product?: Product) => {
    if (!invoice) return;
    const updatedLineItems = InvoiceService.addLineItem(invoice.lineItems, product);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const removeLineItem = (id: string) => {
    if (!invoice) return;
    const updatedLineItems = InvoiceService.removeLineItem(invoice.lineItems, id);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const handleProductSelect = (currentItemId: string, product: Product) => {
    if (!invoice) return;

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
    setSelectedCustomer(null);
    if (invoice) {
      setInvoice(prev => prev ? { ...prev, customerId: '' } : prev);
    }
  };

  const handleCustomerInputFocus = () => {
    setCustomerSearchOpen(true);
  };

  const handleSave = async (asDraft = true) => {
    if (!invoice) return;

    setMessage(null);

    // ZATCA REQUIREMENT: Reference invoice is MANDATORY
    if (!selectedReferenceInvoiceId) {
      setMessage({ type: 'error', text: 'Original invoice reference is required for debit notes (ZATCA requirement)' });
      return;
    }

    const validation = InvoiceService.validateInvoice(invoice);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    setIsLoading(true);
    try {
      // Transform line items to debit note format
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
        debitNoteNumber: invoice.invoiceNumber,
        debitNoteType: invoice.invoiceType === 'simplified' ? 'simplified' : 'standard',
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        paymentTerms: invoice.paymentTerms,
        items,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        reason: reason,
        reasonDescription: invoice.notes,
        status: 'draft',
        originalInvoiceId: selectedReferenceInvoiceId // Required
      };

      const result = await DebitNoteService.createDebitNote(debitNoteData);

      if (result?.debitNote) {
        setMessage({ type: 'success', text: 'Debit note saved as draft successfully! Redirecting...' });

        // Redirect to debit notes list after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/sales/debit-notes');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving debit note:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save debit note' });
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/sales/debit-notes" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Debit Note</h1>
            <p className="text-gray-600">Issue additional charges to customers</p>
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
          <button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span className="font-medium">{isLoading ? 'Saving...' : 'Save Debit Note'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Debit Note Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debit Note Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company <span className="text-red-500">*</span></label>
              <select
                value={selectedCompany?._id || selectedCompany?.id || ''}
                onChange={async (e) => {
                  const company = allCompanies.find(c => (c._id || c.id) === e.target.value);
                  setSelectedCompany(company || null);
                  setSelectedReferenceInvoiceId(''); // Reset reference invoice when company changes
                  setReferenceInvoiceSearch(''); // Reset search text
                  if (company) {
                    const companyId = company._id || company.id || '';
                    try {
                      const newNumber = await DebitNoteService.fetchNextDebitNoteNumber(companyId);
                      setInvoice(prev => prev ? { ...prev, companyId, invoiceNumber: newNumber } : prev);
                      // Load reference invoices for this company
                      loadReferenceInvoices(companyId);
                    } catch {
                      setInvoice(prev => prev ? { ...prev, companyId } : prev);
                    }
                  } else {
                    setReferenceInvoices([]);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${!selectedCompany ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select Company</option>
                {allCompanies.map((company) => {
                  const isZatcaVerified = company.zatcaCredentials?.status === 'verified';
                  return (
                    <option key={company._id || company.id} value={company._id || company.id}>
                      {company.companyName} {isZatcaVerified ? '✓ Phase 2' : '○ Phase 1'}
                    </option>
                  );
                })}
              </select>
              {selectedCompany && (
                <p className={`mt-1 text-xs ${currentPhase === 'phase2' ? 'text-green-600' : 'text-amber-600'}`}>
                  {currentPhase === 'phase2' ? '✓ ZATCA verified (Phase 2)' : '○ Local mode (Phase 1)'}
                </p>
              )}
              {/* Show reference invoice info when company is from a reference invoice */}
              {selectedCompany && selectedReferenceInvoiceId && (() => {
                const refInvoice = referenceInvoices.find(inv => (inv._id || inv.id) === selectedReferenceInvoiceId);
                if (!refInvoice) return null;
                return (
                  <p className="mt-1 text-xs text-blue-600">
                    From Reference Invoice: <span className="font-semibold">{refInvoice.invoiceNumber}</span>
                  </p>
                );
              })()}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                value={invoice.invoiceType}
                onChange={(e) => {
                  const newType = e.target.value as InvoiceData['invoiceType'];
                  setInvoice(prev => prev ? { ...prev, invoiceType: newType, customerId: '', zatcaInvoiceTypeCode: '' } : prev);
                  setSelectedCustomer(null);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  !invoice.invoiceType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Customer Type</option>
                <option value="standard">B2B (Business)</option>
                <option value="simplified">B2C (Individual)</option>
              </select>
              {!invoice.invoiceType && (
                <p className="mt-1 text-xs text-red-500">Customer type is required</p>
              )}
              {invoice.invoiceType && (
                <p className="mt-1 text-xs text-gray-500">
                  {invoice.invoiceType === 'standard'
                    ? 'Business-to-Business debit note'
                    : 'Business-to-Consumer debit note'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Type <span className="text-xs text-gray-500">(ZATCA)</span> <span className="text-red-500">*</span>
              </label>
              <select
                value={invoice.zatcaInvoiceTypeCode}
                onChange={(e) => {
                  const newCode = e.target.value as InvoiceData['zatcaInvoiceTypeCode'];
                  setInvoice(prev => prev ? { ...prev, zatcaInvoiceTypeCode: newCode } : prev);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  !invoice.zatcaInvoiceTypeCode ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!invoice.invoiceType}
              >
                <option value="">Select Invoice Type</option>
                {invoice.invoiceType === 'simplified' ? (
                  <option value="SD">SD - Simplified Debit Note (B2C)</option>
                ) : invoice.invoiceType === 'standard' ? (
                  <option value="CD">CD - Tax Debit Note (B2B)</option>
                ) : null}
              </select>
              {!invoice.zatcaInvoiceTypeCode && invoice.invoiceType && (
                <p className="mt-1 text-xs text-red-500">Invoice type is required</p>
              )}
              {!invoice.invoiceType && (
                <p className="mt-1 text-xs text-gray-500">Select customer type first</p>
              )}
              {invoice.zatcaInvoiceTypeCode && (
                <p className="mt-1 text-xs text-gray-500">
                  {currentPhase === 'phase2'
                    ? (invoice.invoiceType === 'standard'
                        ? 'Requires ZATCA clearance before sending'
                        : 'Reported to ZATCA within 24 hours')
                    : 'Local generation (Phase 1)'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Debit Note Number</label>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice(prev => prev ? { ...prev, invoiceNumber: e.target.value } : prev)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
                />
                <button
                  type="button"
                  onClick={refreshInvoiceNumber}
                  disabled={isRefreshingNumber}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshingNumber ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
              <input
                type="date"
                value={invoice.issueDate}
                onChange={(e) => setInvoice(prev => prev ? { ...prev, issueDate: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice(prev => prev ? { ...prev, dueDate: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Invoice <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(Required - ZATCA compliance)</span>
              </label>
              <div className="relative" ref={referenceInvoiceRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={referenceInvoiceSearch}
                    onChange={(e) => {
                      setReferenceInvoiceSearch(e.target.value);
                      setReferenceInvoiceDropdownOpen(true);
                      // Clear selection when user types
                      if (selectedReferenceInvoiceId) {
                        setSelectedReferenceInvoiceId('');
                      }
                    }}
                    onFocus={() => setReferenceInvoiceDropdownOpen(true)}
                    placeholder={
                      !selectedCompany
                        ? 'Select a company first'
                        : isLoadingInvoices
                        ? 'Loading invoices...'
                        : 'Search by invoice number, customer name, or amount...'
                    }
                    disabled={!selectedCompany || isLoadingInvoices}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {referenceInvoiceSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceInvoiceSearch('');
                        setSelectedReferenceInvoiceId('');
                        setReferenceInvoiceDropdownOpen(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dropdown List */}
                {referenceInvoiceDropdownOpen && selectedCompany && !isLoadingInvoices && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredReferenceInvoices.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        {referenceInvoices.length === 0
                          ? 'No invoices found for this company'
                          : 'No invoices match your search'}
                      </div>
                    ) : (
                      filteredReferenceInvoices.map((inv) => {
                        const companyName = typeof inv.companyId === 'object'
                          ? inv.companyId.companyName
                          : '';
                        const customerName = typeof inv.customerId === 'object'
                          ? (inv.customerId.customerName || inv.customerId.name)
                          : 'Unknown';
                        const formattedDate = new Date(inv.invoiceDate).toLocaleDateString('en-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                        const formattedTotal = new Intl.NumberFormat('en-SA', {
                          style: 'currency',
                          currency: inv.currency || 'SAR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2
                        }).format(inv.total);
                        const isSelected = selectedReferenceInvoiceId === (inv._id || inv.id);

                        return (
                          <button
                            key={inv._id || inv.id}
                            type="button"
                            onClick={() => handleReferenceInvoiceSelect(inv._id || inv.id || '')}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                              isSelected ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{inv.invoiceNumber}</div>
                                {companyName && (
                                  <div className="text-sm text-blue-600">{companyName}</div>
                                )}
                                <div className="text-sm text-gray-500">{customerName}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">{formattedTotal}</div>
                                <div className="text-xs text-gray-400">{formattedDate}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {selectedReferenceInvoiceId && (
                <p className="mt-1 text-xs text-green-600">
                  Data populated from selected invoice. You can modify any field as needed.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customer, Currency, Payment Terms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <CustomerSelection
              selectedCustomer={selectedCustomer}
              customerSearch={customerSearch}
              customerSearchOpen={customerSearchOpen}
              filteredCustomers={filteredCustomers}
              onCustomerSearchChange={setCustomerSearch}
              onCustomerSearchFocus={handleCustomerInputFocus}
              onCustomerSelect={selectCustomer}
              onCustomerClear={clearCustomer}
              onSearchOpenChange={setCustomerSearchOpen}
            />
            {/* Show reference invoice info when customer is populated from a reference invoice */}
            {selectedCustomer && selectedReferenceInvoiceId && (() => {
              const refInvoice = referenceInvoices.find(inv => (inv._id || inv.id) === selectedReferenceInvoiceId);
              if (!refInvoice) return null;
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">From Reference Invoice:</span>{' '}
                    <span className="font-semibold">{refInvoice.invoiceNumber}</span>
                  </p>
                </div>
              );
            })()}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency</h3>
            <select
              value={invoice.currency}
              onChange={(e) => setInvoice(prev => prev ? { ...prev, currency: e.target.value } : prev)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
              onChange={(e) => setInvoice(prev => prev ? { ...prev, paymentTerms: e.target.value } : prev)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
          onAddLineItem={addLineItem}
          onUpdateLineItem={updateLineItem}
          onRemoveLineItem={removeLineItem}
          onProductSelect={handleProductSelect}
        />

        {/* Summary and Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason Type <span className="text-red-500">*</span></label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                  onChange={(e) => setInvoice(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Additional details about the reason..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions</label>
                <textarea
                  value={invoice.termsAndConditions}
                  onChange={(e) => setInvoice(prev => prev ? { ...prev, termsAndConditions: e.target.value } : prev)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
