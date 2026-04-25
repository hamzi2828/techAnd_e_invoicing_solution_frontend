'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Eye, Save, ArrowLeft } from 'lucide-react';
import {
  CustomerSelection,
  LineItemsTable,
  InvoicePreview,
  InvoiceSummary
} from '../../create-invoice/components';
import { Product, LineItem, InvoiceData, Customer as InvoiceCustomer, ZatcaInvoiceTypeCode } from '../../create-invoice/types';
import { InvoiceService as CreateInvoiceService } from '../../create-invoice/services';
import { InvoiceService as AllInvoicesService } from '../../all-invoices/services/invoiceService';
import { CustomerService } from '../../../customers/services/customerService';
import { CustomerDetails } from '../../../customers/types';
import { CompanyService } from '../../../company/services/companyService';
import { Company } from '../../../company/types';

// Backend invoice item structure
interface BackendInvoiceItem {
  _id?: string;
  id?: string;
  product?: string;  // Product reference (MongoDB ObjectId)
  description?: string;  // Optional - can be retrieved from Product
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalPrice?: number;
  total?: number;
  // ZATCA VAT Category fields
  vatCategoryCode?: 'S' | 'Z' | 'E' | 'O';
  taxExemptionReasonCode?: string;
  taxExemptionReasonText?: string;
}

// Backend invoice data structure
interface BackendInvoiceData {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  invoiceType: string;
  zatcaInvoiceTypeCode?: string;  // ZATCA Invoice Type Code (SI/CI/SP/CP/SD/CD/SN/CN)
  isAdvancePayment?: boolean;     // True for prepayment invoices (SP/CP)
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  customerInfo?: {
    customerId: string;  // Reference only
  };
  companyId: string | { _id?: string; id?: string };
  customerId: string | {
    _id?: string;
    id?: string;
    customerName?: string;
    contactInfo?: {
      email?: string;
      phone?: string;
    };
  };
  items?: BackendInvoiceItem[];
  subtotal?: number;
  discount?: number;
  totalTax?: number;
  total?: number;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  status: string;
}

export default function EditInvoice() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data from services
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerDetails[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Load invoice data
  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        setIsInitializing(true);

        // Load customers
        const result = await CustomerService.getAllCustomers();
        const loadedCustomers = result.customers;
        setCustomers(loadedCustomers);
        setFilteredCustomers(loadedCustomers);

        // Load companies
        const loadedCompanies = await CompanyService.getCompaniesCreatedByMe();
        const verifiedCompanies = loadedCompanies.filter(
          company => company.verificationStatus === 'verified' || company.status === 'verified'
        );
        setCompanies(verifiedCompanies);

        // Load the invoice
        console.log('Loading invoice with ID:', invoiceId);
        const invoiceData = await AllInvoicesService.getInvoiceById(invoiceId) as BackendInvoiceData;
        console.log('Invoice data received:', invoiceData);

        if (!invoiceData) {
          console.error('Invoice not found for ID:', invoiceId);
          setMessage({ type: 'error', text: 'Invoice not found' });
          setTimeout(() => router.push('/dashboard/sales/all-invoices'), 2000);
          return;
        }

        // Check if invoice is draft
        if (invoiceData.status !== 'draft') {
          setMessage({ type: 'error', text: 'Only draft invoices can be edited' });
          setTimeout(() => router.push('/dashboard/sales/all-invoices'), 2000);
          return;
        }

        // Extract IDs from potentially populated fields
        const companyIdValue = typeof invoiceData.companyId === 'string'
          ? invoiceData.companyId
          : invoiceData.companyId?._id || '';

        const customerIdValue = typeof invoiceData.customerId === 'string'
          ? invoiceData.customerId
          : invoiceData.customerId?._id || '';

        // Convert invoice data to InvoiceData format
        // Validate invoice type - only allow supported types
        const validInvoiceTypes: InvoiceData['invoiceType'][] = ['standard', 'simplified', 'credit_note', 'debit_note'];
        const invoiceType: InvoiceData['invoiceType'] = (validInvoiceTypes as readonly string[]).includes(invoiceData.invoiceType)
          ? (invoiceData.invoiceType as InvoiceData['invoiceType'])
          : 'standard';

        // Determine if it's an advance payment based on ZATCA type code
        const isAdvancePayment = invoiceData.isAdvancePayment ||
          ['SP', 'CP'].includes(invoiceData.zatcaInvoiceTypeCode || '');

        const formattedInvoice: InvoiceData = {
          invoiceNumber: invoiceData.invoiceNumber || '',
          invoiceType: invoiceType,
          zatcaInvoiceTypeCode: (invoiceData.zatcaInvoiceTypeCode || '') as ZatcaInvoiceTypeCode,
          isAdvancePayment: isAdvancePayment,
          issueDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString().split('T')[0] : '',
          dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : '',
          currency: invoiceData.currency || 'SAR',
          companyId: companyIdValue,
          customerId: customerIdValue,
          lineItems: invoiceData.items?.map((item: BackendInvoiceItem): LineItem => {
            const vatCategoryCode = item.vatCategoryCode || 'S';
            // Derive tax rate from VAT category to ensure consistency
            const taxRate = CreateInvoiceService.getTaxRateFromCategory(vatCategoryCode);
            const quantity = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const discount = item.discount || 0;
            const amount = quantity * unitPrice * (1 - discount / 100);
            const taxAmount = amount * (taxRate / 100);
            const total = amount + taxAmount;

            return {
              id: item._id || item.id || Math.random().toString(),
              productId: item.product || '',
              description: item.description || '',
              quantity,
              unitPrice,
              discount,
              discountType: 'percentage',
              taxRate,
              vatCategoryCode,
              taxExemptionReasonCode: item.taxExemptionReasonCode,
              taxExemptionReasonText: item.taxExemptionReasonText,
              amount,
              taxAmount,
              total
            };
          }) || [],
          subtotal: invoiceData.subtotal || 0,
          totalDiscount: invoiceData.discount || 0,
          totalTax: invoiceData.totalTax || 0,
          grandTotal: invoiceData.total || 0,
          notes: invoiceData.notes || '',
          termsAndConditions: invoiceData.termsAndConditions || 'Payment is due within 30 days of invoice date.',
          paymentTerms: invoiceData.paymentTerms || 'Net 30',
          status: 'draft',
        };

        setInvoice(formattedInvoice);

        // Set selected company
        const company = verifiedCompanies.find(c => (c._id || c.id) === companyIdValue);
        if (company) {
          setSelectedCompany(company);
        }

        // Set selected customer
        const customer = loadedCustomers.find(c => c.id === customerIdValue);
        if (customer) {
          setSelectedCustomer(customer);
        }

      } catch (error) {
        console.error('Error loading invoice:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load invoice';
        setMessage({ type: 'error', text: `Failed to load invoice: ${errorMessage}` });
        setTimeout(() => router.push('/dashboard/sales/all-invoices'), 3000);
      } finally {
        setIsInitializing(false);
      }
    };

    if (invoiceId) {
      loadInvoiceData();
    }
  }, [invoiceId, router]);

  // Filter customers based on search
  useEffect(() => {
    const filterCustomers = async () => {
      try {
        if (customerSearch.trim()) {
          const result = await CustomerService.searchCustomers(customerSearch);
          const filtered = result.customers;
          setFilteredCustomers(filtered);
        } else {
          setFilteredCustomers(customers);
        }
      } catch (error) {
        console.error('Error filtering customers:', error);
        setFilteredCustomers(customers);
      }
    };

    filterCustomers();
  }, [customerSearch, customers]);

  // Handle customer selection - accepts Customer type from component
  const handleCustomerSelect = (customer: InvoiceCustomer) => {
    // Find the full CustomerDetails from our loaded customers by id
    const fullCustomer = customers.find(c => c.id === customer.id);

    if (fullCustomer) {
      setSelectedCustomer(fullCustomer);
    }

    setCustomerSearchOpen(false);
    setCustomerSearch('');
    if (invoice) {
      // Use id from the selected customer
      const customerId = customer.id;
      setInvoice({
        ...invoice,
        customerId
      });
    }
  };

  // Reload customers when customer input is focused
  const handleCustomerInputFocus = async () => {
    setCustomerSearchOpen(true);

    try {
      // Fetch latest customers from API
      const result = await CustomerService.getAllCustomers();
      const loadedCustomers = result.customers;
      setCustomers(loadedCustomers);
      setFilteredCustomers(loadedCustomers);
    } catch (error) {
      console.error('Error reloading customers:', error);
    }
  };

  // Invoice operations using services
  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    if (!invoice) return;
    const updatedLineItems = CreateInvoiceService.updateLineItem(invoice.lineItems, id, updates);
    const updatedInvoice = CreateInvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const addLineItem = (product?: Product) => {
    if (!invoice) return;
    const updatedLineItems = CreateInvoiceService.addLineItem(invoice.lineItems, product);
    const updatedInvoice = CreateInvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  const removeLineItem = (id: string) => {
    if (!invoice) return;
    const updatedLineItems = CreateInvoiceService.removeLineItem(invoice.lineItems, id);
    const updatedInvoice = CreateInvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
  };

  // Handle product selection - check for duplicates and increment quantity
  const handleProductSelect = (currentItemId: string, product: Product) => {
    if (!invoice) return;

    // Get the current line item
    const currentItem = invoice.lineItems.find(item => item.id === currentItemId);

    // Check if this is the same product being clicked again in the same line
    if (currentItem && currentItem.productId === product.id) {
      // Same product in same line - increment quantity
      const updatedLineItems = CreateInvoiceService.updateLineItem(
        invoice.lineItems,
        currentItemId,
        { quantity: currentItem.quantity + 1 }
      );
      const updatedInvoice = CreateInvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
      setInvoice(updatedInvoice);
      return;
    }

    // Find if this product already exists in another line item
    const existingItem = invoice.lineItems.find(
      item => item.productId === product.id && item.id !== currentItemId
    );

    if (existingItem) {
      // Product already exists in different line - increment quantity there
      const updatedLineItems = CreateInvoiceService.updateLineItem(
        invoice.lineItems,
        existingItem.id,
        { quantity: existingItem.quantity + 1 }
      );

      // Remove the current empty line item if it has no description
      const finalLineItems = (currentItem && !currentItem.description.trim())
        ? updatedLineItems.filter(item => item.id !== currentItemId)
        : updatedLineItems;

      const updatedInvoice = CreateInvoiceService.updateInvoiceWithLineItems(invoice, finalLineItems);
      setInvoice(updatedInvoice);
    } else {
      // Product doesn't exist anywhere - update current line item with product details
      updateLineItem(currentItemId, {
        productId: product.id,
        description: product.name,
        unitPrice: product.price,
        taxRate: product.taxRate,
        quantity: 1
      });
    }
  };

  // Handle company change
  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => (c._id || c.id) === companyId);
    setSelectedCompany(company || null);
    if (invoice) {
      setInvoice({
        ...invoice,
        companyId
      });
    }
  };

  // Handle field changes
  const handleFieldChange = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    if (invoice) {
      setInvoice({
        ...invoice,
        [field]: value
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!invoice) return;

    // Clear previous messages
    setMessage(null);

    // Validate invoice using InvoiceService
    const validation = CreateInvoiceService.validateInvoice(invoice);
    if (!validation.isValid) {
      setMessage({
        type: 'error',
        text: validation.errors.join('; ')
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format the invoice data for the API
      const invoicePayload = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType,
        zatcaInvoiceTypeCode: invoice.zatcaInvoiceTypeCode,
        invoiceDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        customerId: invoice.customerId,
        companyId: invoice.companyId,
        items: invoice.lineItems.map(item => ({
          product: item.productId,  // Product reference for analytics
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 15,
          discount: item.discount || 0,
          vatCategoryCode: item.vatCategoryCode || 'S',
          ...(item.taxExemptionReasonCode && { taxExemptionReasonCode: item.taxExemptionReasonCode }),
          ...(item.taxExemptionReasonText && { taxExemptionReasonText: item.taxExemptionReasonText })
        })),
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        discount: invoice.totalDiscount,
        discountType: 'percentage',
        isVatApplicable: true,
        status: invoice.status
      };

      const success = await AllInvoicesService.updateInvoice(invoiceId, invoicePayload);
      if (success) {
        setMessage({ type: 'success', text: 'Invoice updated successfully!' });
        setTimeout(() => {
          router.push('/dashboard/sales/all-invoices');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Failed to update invoice' });
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      setMessage({ type: 'error', text: 'Failed to update invoice' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Invoice Details Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Settings Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Line Items Table Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 w-44 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/sales/all-invoices')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
            <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            <span className="font-medium">
              {message.type === 'success' ? '✓ ' : '⚠ '}
            </span>
            <div className="ml-2 flex-1">
              {message.text.includes(';') ? (
                <ul className="list-disc list-inside space-y-1">
                  {message.text.split(';').map((error, index) => (
                    <li key={index}>{error.trim()}</li>
                  ))}
                </ul>
              ) : (
                <span>{message.text}</span>
              )}
            </div>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Company Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Company *
        </label>
        <select
          value={invoice.companyId}
          onChange={(e) => handleCompanyChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-70"
          disabled
          required
        >
          <option value="">Select a company</option>
          {companies.map((company) => (
            <option key={company._id || company.id} value={company._id || company.id}>
              {company.companyName}
            </option>
          ))}
        </select>
        {companies.length === 0 && (
          <p className="text-sm text-red-600 mt-2">
            No verified companies found. Please verify a company first.
          </p>
        )}
      </div>

      {/* Customer Selection */}
      <CustomerSelection
        selectedCustomer={selectedCustomer as InvoiceCustomer | null}
        customerSearchOpen={customerSearchOpen}
        customerSearch={customerSearch}
        filteredCustomers={filteredCustomers as InvoiceCustomer[]}
        onCustomerSearchChange={setCustomerSearch}
        onCustomerSearchFocus={handleCustomerInputFocus}
        onCustomerSelect={handleCustomerSelect}
        onCustomerClear={() => {
          setSelectedCustomer(null);
          if (invoice) {
            setInvoice({ ...invoice, customerId: '' });
          }
        }}
        onSearchOpenChange={setCustomerSearchOpen}
      />

      {/* Invoice Details */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Type
            </label>
            <select
              value={invoice.invoiceType}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            >
              <option value="standard">B2B (Business)</option>
              <option value="simplified">B2C (Individual)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {invoice.invoiceType === 'standard'
                ? 'Business-to-Business transactions'
                : 'Business-to-Consumer transactions'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Type <span className="text-xs text-gray-500">(ZATCA)</span> <span className="text-red-500">*</span>
            </label>
            <select
              value={invoice.zatcaInvoiceTypeCode}
              onChange={(e) => {
                const newCode = e.target.value as ZatcaInvoiceTypeCode;
                const isAdvancePayment = ['SP', 'CP'].includes(newCode);
                setInvoice(prev => prev ? { ...prev, zatcaInvoiceTypeCode: newCode, isAdvancePayment } : prev);
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                !invoice.zatcaInvoiceTypeCode ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Invoice Type</option>
              {invoice.invoiceType === 'simplified' ? (
                <>
                  <option value="SI">SI - Simplified Tax Invoice (B2C)</option>
                  <option value="SP">SP - Simplified Prepayment (B2C)</option>
                  <option value="SD">SD - Simplified Debit Note (B2C)</option>
                  <option value="SN">SN - Simplified Credit Note (B2C)</option>
                </>
              ) : (
                <>
                  <option value="CI">CI - Tax Invoice (B2B)</option>
                  <option value="CP">CP - Prepayment (B2B)</option>
                  <option value="CD">CD - Tax Debit Note (B2B)</option>
                  <option value="CN">CN - Tax Credit Note (B2B)</option>
                </>
              )}
            </select>
            {!invoice.zatcaInvoiceTypeCode && (
              <p className="mt-1 text-xs text-red-500">Invoice type is required</p>
            )}
            {invoice.zatcaInvoiceTypeCode && (
              <p className="mt-1 text-xs text-gray-500">
                {invoice.isAdvancePayment && (
                  <span className="text-amber-600 font-medium">Advance Payment Invoice - </span>
                )}
                {invoice.invoiceType === 'standard'
                  ? 'Requires ZATCA clearance before sending'
                  : 'Reported to ZATCA within 24 hours'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Invoice number cannot be changed</p>
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={invoice.issueDate}
              onChange={(e) => handleFieldChange('issueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => handleFieldChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={invoice.currency}
              onChange={(e) => handleFieldChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="AED">AED - UAE Dirham</option>
            </select>
          </div>
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

      {/* Invoice Summary */}
      <InvoiceSummary
        subtotal={invoice.subtotal}
        totalDiscount={invoice.totalDiscount}
        totalTax={invoice.totalTax}
        grandTotal={invoice.grandTotal}
        currency={invoice.currency}
      />

      {/* Notes and Terms */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={invoice.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add any additional notes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms and Conditions
            </label>
            <textarea
              value={invoice.termsAndConditions}
              onChange={(e) => handleFieldChange('termsAndConditions', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter terms and conditions..."
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <InvoicePreview
        isOpen={showPreview}
        invoice={invoice}
        selectedCustomer={selectedCustomer as InvoiceCustomer | null}
        selectedCompany={selectedCompany}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
