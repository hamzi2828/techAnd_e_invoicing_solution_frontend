'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Save, Send, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  CustomerSelection,
  CompanySelection,
  LineItemsTable,
  QuotationPreview,
  QuotationSummary
} from './components';
import { Customer, Product, LineItem, QuotationData } from './types';
import { QuotationService } from './services';
import { CustomerService } from '../../../customers/services/customerService';
import { CompanyService } from '../../../company/services/companyService';
import { Company } from '../../../company/types';

export default function CreateQuotation() {
  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingNumber, setIsRefreshingNumber] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);

  // Data from services
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Load initial data including quotation number
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitializing(true);

        // Load customers
        const result = await CustomerService.getAllCustomers();
        const loadedCustomers = result.customers;
        setCustomers(loadedCustomers);
        setFilteredCustomers(loadedCustomers);

        // Load ALL companies (quotations don't require ZATCA verification)
        const loadedCompanies = await CompanyService.getCompaniesCreatedByMe();
        setCompanies(loadedCompanies);

        // Check for default company first, then fall back to single company selection
        const defaultCompany = loadedCompanies.find(company => company.isDefault);
        const companyToSelect = defaultCompany || (loadedCompanies.length === 1 ? loadedCompanies[0] : null);

        if (companyToSelect) {
          const company = companyToSelect;
          const companyId = company._id || company.id || '';
          setSelectedCompany(company);

          // Fetch quotation number with company ID
          const quoteNumber = await QuotationService.fetchNextQuoteNumber(companyId);

          // Create initial quotation data with the fetched quotation number
          const initialQuotationData = {
            quoteNumber: quoteNumber,
            quoteDate: new Date().toISOString().split('T')[0],
            validUntil: QuotationService.getDefaultValidUntil(),
            currency: 'SAR',
            companyId: companyId,
            customerId: '',
            lineItems: [],
            subtotal: 0,
            totalDiscount: 0,
            totalTax: 0,
            grandTotal: 0,
            notes: '',
            termsAndConditions: 'This quotation is valid for 30 days from the date of issue.',
            paymentTerms: 'Net 30',
            status: 'draft' as const,
          };
          console.log('[CREATE QUOTATION] Initial quotation data:', {
            companyId: companyId,
            companyName: company.companyName,
            quoteNumber: quoteNumber
          });
          setQuotation(initialQuotationData);
        } else {
          // No company or multiple companies - create quotation without number
          const initialQuotationData = {
            quoteNumber: '',
            quoteDate: new Date().toISOString().split('T')[0],
            validUntil: QuotationService.getDefaultValidUntil(),
            currency: 'SAR',
            companyId: '',
            customerId: '',
            lineItems: [],
            subtotal: 0,
            totalDiscount: 0,
            totalTax: 0,
            grandTotal: 0,
            notes: '',
            termsAndConditions: 'This quotation is valid for 30 days from the date of issue.',
            paymentTerms: 'Net 30',
            status: 'draft' as const,
          };
          setQuotation(initialQuotationData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // If error, create quotation with fallback number
        const fallbackQuotation = {
          quoteNumber: QuotationService.generateQuoteNumber(),
          quoteDate: new Date().toISOString().split('T')[0],
          validUntil: QuotationService.getDefaultValidUntil(),
          currency: 'SAR',
          companyId: '',
          customerId: '',
          lineItems: [],
          subtotal: 0,
          totalDiscount: 0,
          totalTax: 0,
          grandTotal: 0,
          notes: '',
          termsAndConditions: 'This quotation is valid for 30 days from the date of issue.',
          paymentTerms: 'Net 30',
          status: 'draft' as const,
        };
        setQuotation(fallbackQuotation);
      } finally {
        setIsInitializing(false);
      }
    };

    loadData();
  }, []);

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

  // Function to refresh quotation number
  const refreshQuoteNumber = async () => {
    if (!quotation) return;

    const companyId = selectedCompany?._id || selectedCompany?.id;
    if (!companyId) {
      setMessage({ type: 'error', text: 'Please select a company first' });
      return;
    }

    setIsRefreshingNumber(true);
    try {
      const newQuoteNumber = await QuotationService.fetchNextQuoteNumber(companyId);
      setQuotation(prev => prev ? { ...prev, quoteNumber: newQuoteNumber } : prev);
      setMessage({ type: 'success', text: 'Quotation number refreshed' });
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error refreshing quotation number:', error);
      setMessage({ type: 'error', text: 'Failed to refresh quotation number' });
    } finally {
      setIsRefreshingNumber(false);
    }
  };

  // Quotation operations using services
  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    if (!quotation) return;
    const updatedLineItems = QuotationService.updateLineItem(quotation.lineItems, id, updates);
    const updatedQuotation = QuotationService.updateQuotationWithLineItems(quotation, updatedLineItems);
    setQuotation(updatedQuotation);
  };

  const addLineItem = (product?: Product) => {
    if (!quotation) return;
    const updatedLineItems = QuotationService.addLineItem(quotation.lineItems, product);
    const updatedQuotation = QuotationService.updateQuotationWithLineItems(quotation, updatedLineItems);
    setQuotation(updatedQuotation);
  };

  const removeLineItem = (id: string) => {
    if (!quotation) return;
    const updatedLineItems = QuotationService.removeLineItem(quotation.lineItems, id);
    const updatedQuotation = QuotationService.updateQuotationWithLineItems(quotation, updatedLineItems);
    setQuotation(updatedQuotation);
  };

  const handleProductSelect = (currentItemId: string, product: Product) => {
    if (!quotation) return;
    const currentItem = quotation.lineItems.find(item => item.id === currentItemId);

    if (currentItem && currentItem.productId === product.id) {
      // If product is already selected for this line, increment quantity
      const updatedLineItems = QuotationService.updateLineItem(
        quotation.lineItems,
        currentItemId,
        { quantity: currentItem.quantity + 1 }
      );
      const updatedQuotation = QuotationService.updateQuotationWithLineItems(quotation, updatedLineItems);
      setQuotation(updatedQuotation);
      return;
    }

    // Check if product exists in other line items
    const existingItem = quotation.lineItems.find(
      item => item.productId === product.id && item.id !== currentItemId
    );

    if (existingItem) {
      // Product exists in another line, increment its quantity and remove current line
      const updatedLineItems = QuotationService.updateLineItem(
        quotation.lineItems,
        existingItem.id,
        { quantity: existingItem.quantity + 1 }
      );
      const withoutCurrent = updatedLineItems.filter(item => item.id !== currentItemId);
      const updatedQuotation = QuotationService.updateQuotationWithLineItems(quotation, withoutCurrent);
      setQuotation(updatedQuotation);
    } else {
      // Product doesn't exist, update current line with product data
      const updatedLineItems = QuotationService.updateLineItem(
        quotation.lineItems,
        currentItemId,
        {
          productId: product.id,
          description: product.name,
          unitPrice: product.price,
          taxRate: product.taxRate,
          quantity: 1
        }
      );
      const updatedQuotation = QuotationService.updateQuotationWithLineItems(quotation, updatedLineItems);
      setQuotation(updatedQuotation);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    if (quotation) {
      // Use _id if available, otherwise use id
      const customerId = customer._id || customer.id;
      setQuotation(prev => prev ? { ...prev, customerId } : prev);
    }
    setCustomerSearchOpen(false);
    setCustomerSearch('');
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    if (quotation) {
      setQuotation(prev => prev ? { ...prev, customerId: '' } : prev);
    }
  };

  // Handle actions using services
  const handleSave = async (asDraft = true) => {
    if (!quotation) return;

    // Clear previous messages
    setMessage(null);

    // Check if company is selected
    if (!selectedCompany) {
      setMessage({ type: 'error', text: 'Please select a company' });
      return;
    }

    console.log('[CREATE QUOTATION] handleSave - Current state:', {
      selectedCompany: {
        id: selectedCompany._id || selectedCompany.id,
        name: selectedCompany.companyName
      },
      quotation: {
        companyId: quotation.companyId,
        quoteNumber: quotation.quoteNumber,
        customerId: quotation.customerId,
        lineItemsCount: quotation.lineItems.length
      }
    });

    // Ensure quotation has the correct companyId from selectedCompany
    const selectedCompanyId = selectedCompany._id || selectedCompany.id || '';
    if (quotation.companyId !== selectedCompanyId) {
      console.warn('[CREATE QUOTATION] CompanyId mismatch detected! Fixing:', {
        quotationCompanyId: quotation.companyId,
        selectedCompanyId: selectedCompanyId
      });
      quotation.companyId = selectedCompanyId;
    }

    // Validate quotation before saving
    const validation = QuotationService.validateQuotation(quotation);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    setIsLoading(true);
    try {
      console.log('[CREATE QUOTATION] About to save quotation with companyId:', quotation.companyId);
      await QuotationService.saveQuotation(quotation);
      const savedQuoteNumber = quotation.quoteNumber;

      // Reset the form for a new quotation
      const companyId = selectedCompany?._id || selectedCompany?.id || '';
      let newQuoteNumber = '';

      if (companyId) {
        try {
          newQuoteNumber = await QuotationService.fetchNextQuoteNumber(companyId);
        } catch (error) {
          console.error('Error fetching new quotation number:', error);
          newQuoteNumber = QuotationService.generateQuoteNumber();
        }
      }

      // Reset to a fresh quotation form
      setQuotation({
        quoteNumber: newQuoteNumber,
        quoteDate: new Date().toISOString().split('T')[0],
        validUntil: QuotationService.getDefaultValidUntil(),
        currency: 'SAR',
        companyId: companyId,
        customerId: '',
        lineItems: [],
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0,
        notes: '',
        termsAndConditions: 'This quotation is valid for 30 days from the date of issue.',
        paymentTerms: 'Net 30',
        status: 'draft' as const,
      });

      // Clear customer selection
      setSelectedCustomer(null);
      setCustomerSearch('');

      setMessage({ type: 'success', text: `Quotation ${savedQuoteNumber} saved as draft successfully! Form has been reset for a new quotation.` });
    } catch (error) {
      console.error('Error saving quotation:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save quotation' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!quotation) return;

    // Clear previous messages
    setMessage(null);

    // Check if company is selected
    if (!selectedCompany) {
      setMessage({ type: 'error', text: 'Please select a company' });
      return;
    }

    const validation = QuotationService.validateQuotation(quotation);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    setIsLoading(true);
    try {
      await QuotationService.sendQuotation(quotation);
      const sentQuoteNumber = quotation.quoteNumber;

      setMessage({ type: 'success', text: `Quotation ${sentQuoteNumber} sent successfully!` });

      // Reset the form for a new quotation
      const companyId = selectedCompany?._id || selectedCompany?.id || '';
      let newQuoteNumber = '';

      if (companyId) {
        try {
          newQuoteNumber = await QuotationService.fetchNextQuoteNumber(companyId);
        } catch (error) {
          console.error('Error fetching new quotation number:', error);
          newQuoteNumber = QuotationService.generateQuoteNumber();
        }
      }

      // Reset to a fresh quotation form
      setQuotation({
        quoteNumber: newQuoteNumber,
        quoteDate: new Date().toISOString().split('T')[0],
        validUntil: QuotationService.getDefaultValidUntil(),
        currency: 'SAR',
        companyId: companyId,
        customerId: '',
        lineItems: [],
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0,
        notes: '',
        termsAndConditions: 'This quotation is valid for 30 days from the date of issue.',
        paymentTerms: 'Net 30',
        status: 'draft' as const,
      });

      // Clear customer selection
      setSelectedCustomer(null);
      setCustomerSearch('');
    } catch (error) {
      console.error('Error sending quotation:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send quotation' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initializing - Skeleton UI
  if (isInitializing || !quotation) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Quotation Details Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer, Currency, Payment Terms Skeleton */}
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
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : message.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : message.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            <span className="font-medium">
              {message.type === 'success' ? '✓ ' : message.type === 'warning' ? '⚠ ' : message.type === 'info' ? 'ℹ ' : '✕ '}
            </span>
            <div className="ml-2 flex-1">
              {message.text.includes(', ') && message.text.split(', ').length > 1 ? (
                <ul className="list-disc list-inside space-y-1">
                  {message.text.split(', ').map((error, index) => (
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/sales/quotations"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Quotation</h1>
            <p className="text-gray-600">Create and send professional quotations to your customers</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="h-4 w-4" />
            <span className="font-medium">Preview</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span className="font-medium">{isLoading ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span className="font-medium">{isLoading ? 'Sending...' : 'Send Quotation'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quotation Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <CompanySelection
                companies={companies}
                selectedCompany={selectedCompany}
                onCompanySelect={async (company) => {
                  setSelectedCompany(company);
                  if (company) {
                    const companyId = company._id || company.id || '';
                    try {
                      const newQuoteNumber = await QuotationService.fetchNextQuoteNumber(companyId);
                      setQuotation(prev => prev ? {
                        ...prev,
                        companyId: companyId,
                        quoteNumber: newQuoteNumber
                      } : prev);
                    } catch (error) {
                      console.error('Error fetching quotation number:', error);
                      setQuotation(prev => prev ? { ...prev, companyId: companyId } : prev);
                    }
                  } else {
                    setQuotation(prev => prev ? { ...prev, companyId: '', quoteNumber: '' } : prev);
                  }
                }}
                showZatcaStatus={true}
                required={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quotation Number
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={quotation.quoteNumber}
                    onChange={(e) => setQuotation(prev => prev ? { ...prev, quoteNumber: e.target.value } : prev)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
                    placeholder="Quotation number"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs text-primary font-medium" title="Auto-generated">
                      Auto
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshQuoteNumber}
                  disabled={isRefreshingNumber}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Get new quotation number"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshingNumber ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Date
              </label>
              <input
                type="date"
                value={quotation.quoteDate}
                onChange={(e) => setQuotation(prev => prev ? { ...prev, quoteDate: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <input
                type="date"
                value={quotation.validUntil}
                onChange={(e) => setQuotation(prev => prev ? { ...prev, validUntil: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Customer, Currency and Payment Terms in one row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
          <CustomerSelection
            selectedCustomer={selectedCustomer}
            customerSearch={customerSearch}
            customerSearchOpen={customerSearchOpen}
            filteredCustomers={filteredCustomers}
            onCustomerSearchChange={setCustomerSearch}
            onCustomerSearchFocus={() => setCustomerSearchOpen(true)}
            onCustomerSelect={selectCustomer}
            onCustomerClear={clearCustomer}
            onSearchOpenChange={setCustomerSearchOpen}
          />

          {/* Currency Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency</h3>
            <select
              value={quotation.currency}
              onChange={(e) => setQuotation(prev => prev ? { ...prev, currency: e.target.value } : prev)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="AED">AED - UAE Dirham</option>
            </select>
          </div>

          {/* Payment Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h3>
            <select
              value={quotation.paymentTerms}
              onChange={(e) => setQuotation(prev => prev ? { ...prev, paymentTerms: e.target.value } : prev)}
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
          lineItems={quotation.lineItems}
          currency={quotation.currency}
          onAddLineItem={addLineItem}
          onUpdateLineItem={updateLineItem}
          onRemoveLineItem={removeLineItem}
          onProductSelect={handleProductSelect}
        />

        {/* Summary and Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Additional Information */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={quotation.notes}
                  onChange={(e) => setQuotation(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Add any additional notes or comments..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  value={quotation.termsAndConditions}
                  onChange={(e) => setQuotation(prev => prev ? { ...prev, termsAndConditions: e.target.value } : prev)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>
          </div>

          {/* Quotation Summary */}
          <QuotationSummary
            subtotal={quotation.subtotal}
            totalDiscount={quotation.totalDiscount}
            totalTax={quotation.totalTax}
            grandTotal={quotation.grandTotal}
            currency={quotation.currency}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <QuotationPreview
        isOpen={showPreview}
        quotation={quotation}
        selectedCustomer={selectedCustomer}
        selectedCompany={selectedCompany}
        onClose={() => setShowPreview(false)}
        onSend={handleSend}
      />

    </div>
  );
}
