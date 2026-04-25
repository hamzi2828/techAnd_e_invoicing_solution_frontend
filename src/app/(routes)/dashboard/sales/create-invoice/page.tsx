'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Eye, Save, Send, RefreshCw, Printer, Shield, AlertTriangle, CheckCircle2, Info, CheckCircle, XCircle, Loader2, Lock, Zap, Crown } from 'lucide-react';
import {
  CustomerSelection,
  CompanySelection,
  LineItemsTable,
  InvoiceSummary
} from './components';
import { PreviewModalSkeleton } from './components/LoadingSkeletons';
import { UsageLimitWarning } from '@/components/PlanGate';
import { usePlan } from '@/contexts/PlanContext';

// Lazy load heavy modal components
const InvoicePreview = dynamic(
  () => import('./components/InvoicePreview'),
  {
    loading: () => <PreviewModalSkeleton />,
    ssr: false
  }
);
import { Customer, Product, LineItem, InvoiceData } from './types';
import { InvoiceService } from './services';
import { CustomerService } from '../../customers/services/customerService';
import { CompanyService } from '../../company/services/companyService';
import { Company } from '../../company/types';

// Phase types for ZATCA compliance
type ZatcaPhase = 'phase1' | 'phase2' | 'not_onboarded';

export default function CreateInvoice() {
  // ==================== PLAN/SUBSCRIPTION HOOKS ====================
  // These hooks connect to the PlanContext to check user's subscription limits
  const { canCreate, incrementLocalUsage, planInfo, isLoading: isPlanLoading } = usePlan();

  // Check invoice usage limit
  // Returns: { allowed: boolean, current: number, limit: number | null, remaining: number | null, percentage: number | null, unlimited: boolean }
  const invoiceLimitCheck = canCreate('invoice');

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingNumber, setIsRefreshingNumber] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);
  const [zatcaData, setZatcaData] = useState<{ uuid?: string; qrCode?: string; pdfUrl?: string } | null>(null);
  const [phase1QrCode, setPhase1QrCode] = useState<string | null>(null);

  // Validation state for ZATCA workflow
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[]; warnings: string[] } | null>(null);

  // Reset validation when invoice changes
  const resetValidation = () => {
    setIsValidated(false);
    setValidationResult(null);
  };

  // Data from services
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // All companies including non-verified
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Determine current ZATCA phase based on selected company
  const currentPhase: ZatcaPhase = useMemo(() => {
    if (!selectedCompany) return 'not_onboarded';

    const creds = selectedCompany.zatcaCredentials;

    // No ZATCA credentials at all = not onboarded
    if (!creds) return 'not_onboarded';

    // No onboarding phase selected = fresh/reset state (not onboarded)
    if (!creds.onboardingPhase) return 'not_onboarded';

    // Check if company is in Phase 2 and has completed onboarding
    if (creds.onboardingPhase === 'phase2_integration') {
      // Check if any environment has verified status
      const envs = creds.environments;
      if (envs) {
        const hasVerified = Object.values(envs).some(
          (e) => e && (e as { status?: string }).status === 'verified'
        );
        if (hasVerified) return 'phase2';

        // Check if any environment has progress (in-progress Phase 2)
        const hasProgress = Object.values(envs).some(
          (e) => e && (e as { status?: string }).status && (e as { status?: string }).status !== 'not_started'
        );
        if (hasProgress) return 'phase2';
      }
      // Phase 2 selected but no environment progress yet - treat as pending
      return 'phase1'; // Allow basic functionality while setting up
    }

    // Check if company has completed Phase 1 onboarding
    if (creds.onboardingPhase === 'phase1_generation') {
      if (creds.onboardingDetails || creds.businessType) {
        return 'phase1';
      }
      // Phase 1 selected but not configured yet - still allow basic usage
      return 'phase1';
    }

    // Company exists but hasn't completed onboarding
    return 'not_onboarded';
  }, [selectedCompany]);

  // Check if company needs onboarding
  const needsOnboarding = currentPhase === 'not_onboarded' && selectedCompany !== null;

  // Load initial data including invoice number
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitializing(true);

        // Customers will be loaded when invoice type is selected (in useEffect)

        // Load ALL companies (for Phase 1 support - companies don't need to be ZATCA verified)
        const loadedCompanies = await CompanyService.getCompaniesCreatedByMe();
        setAllCompanies(loadedCompanies);

        // Check for default company first, then fall back to single company selection
        // For Phase 1/2 flexibility, prefer any company (not just ZATCA verified)
        const defaultCompany = loadedCompanies.find(company => company.isDefault);
        const companyToSelect = defaultCompany || (loadedCompanies.length === 1 ? loadedCompanies[0] : null);

        if (companyToSelect) {
          const companyId = companyToSelect._id || companyToSelect.id || '';
          setSelectedCompany(companyToSelect);

          // Fetch invoice number with company ID
          const invoiceNumber = await InvoiceService.fetchNextInvoiceNumber(companyId);

          // Create initial invoice data with the fetched invoice number
          const initialInvoiceData = {
            invoiceNumber: invoiceNumber,
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
            termsAndConditions: 'Payment is due within 30 days of invoice date.',
            paymentTerms: 'Net 30',
            status: 'draft' as const,
          };
          setInvoice(initialInvoiceData);
        } else {
          // No default company and multiple companies - create invoice without number
          const initialInvoiceData = {
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
            termsAndConditions: 'Payment is due within 30 days of invoice date.',
            paymentTerms: 'Net 30',
            status: 'draft' as const,
          };
          setInvoice(initialInvoiceData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // If error, create invoice with fallback number
        const fallbackInvoice = {
          invoiceNumber: InvoiceService.generateInvoiceNumber(),
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
          termsAndConditions: 'Payment is due within 30 days of invoice date.',
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

  // Filter customers based on search and invoice type
  const invoiceType = invoice?.invoiceType;
  useEffect(() => {
    const filterCustomers = async () => {
      try {
        // Only filter if invoice type is selected
        if (!invoiceType) {
          setFilteredCustomers([]);
          return;
        }

        // Map invoice type to customer type for filtering
        // B2B (standard) -> company, B2C (simplified) -> individual
        const customerTypeFilter = invoiceType === 'simplified' ? 'individual' : 'company';

        if (customerSearch.trim()) {
          const result = await CustomerService.searchCustomers(customerSearch, { type: customerTypeFilter });
          const filtered = result.customers;
          setFilteredCustomers(filtered);
        } else {
          // Fetch customers filtered by type
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


  // Function to refresh invoice number
  const refreshInvoiceNumber = async () => {
    if (!invoice) return;

    const companyId = selectedCompany?._id || selectedCompany?.id;
    if (!companyId) {
      setMessage({ type: 'error', text: 'Please select a company first' });
      return;
    }

    setIsRefreshingNumber(true);
    try {
      const newInvoiceNumber = await InvoiceService.fetchNextInvoiceNumber(companyId);
      setInvoice(prev => prev ? { ...prev, invoiceNumber: newInvoiceNumber } : prev);
      setMessage({ type: 'success', text: 'Invoice number refreshed' });
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error refreshing invoice number:', error);
      setMessage({ type: 'error', text: 'Failed to refresh invoice number' });
    } finally {
      setIsRefreshingNumber(false);
    }
  };

  // Invoice operations using services
  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    if (!invoice) return;
    const updatedLineItems = InvoiceService.updateLineItem(invoice.lineItems, id, updates);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
    resetValidation(); // Reset validation when invoice changes
  };

  const addLineItem = (product?: Product) => {
    if (!invoice) return;
    const updatedLineItems = InvoiceService.addLineItem(invoice.lineItems, product);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
    resetValidation(); // Reset validation when invoice changes
  };

  const removeLineItem = (id: string) => {
    if (!invoice) return;
    const updatedLineItems = InvoiceService.removeLineItem(invoice.lineItems, id);
    const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
    setInvoice(updatedInvoice);
    resetValidation(); // Reset validation when invoice changes
  };

  // Handle product selection - check for duplicates and increment quantity
  const handleProductSelect = (currentItemId: string, product: Product) => {
    if (!invoice) return;

    // Get the current line item
    const currentItem = invoice.lineItems.find(item => item.id === currentItemId);

    // Check if this is the same product being clicked again in the same line
    if (currentItem && currentItem.productId === product.id) {
      // Same product in same line - increment quantity
      const updatedLineItems = InvoiceService.updateLineItem(
        invoice.lineItems,
        currentItemId,
        { quantity: currentItem.quantity + 1 }
      );
      const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, updatedLineItems);
      setInvoice(updatedInvoice);
      return;
    }

    // Find if this product already exists in another line item
    const existingItem = invoice.lineItems.find(
      item => item.productId === product.id && item.id !== currentItemId
    );

    if (existingItem) {
      // Product already exists in different line - increment quantity there
      const updatedLineItems = InvoiceService.updateLineItem(
        invoice.lineItems,
        existingItem.id,
        { quantity: existingItem.quantity + 1 }
      );

      // Remove the current empty line item if it has no description
      const finalLineItems = (currentItem && !currentItem.description.trim())
        ? updatedLineItems.filter(item => item.id !== currentItemId)
        : updatedLineItems;

      const updatedInvoice = InvoiceService.updateInvoiceWithLineItems(invoice, finalLineItems);
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

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    if (invoice) {
      // Use _id if available, otherwise use id
      const customerId = customer._id || customer.id;
      // Auto-select invoice type based on customer type
      // B2B (standard) for business customers, B2C (simplified) for individual customers
      const invoiceType = customer.type === 'individual' ? 'simplified' : 'standard';
      setInvoice(prev => prev ? { ...prev, customerId, invoiceType: invoiceType as 'standard' | 'simplified' } : prev);
    }
    setCustomerSearchOpen(false);
    setCustomerSearch('');
    resetValidation(); // Reset validation when customer changes
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    if (invoice) {
      setInvoice(prev => prev ? { ...prev, customerId: '' } : prev);
    }
  };

  // Open customer dropdown when input is focused
  const handleCustomerInputFocus = () => {
    setCustomerSearchOpen(true);
    // Customers are already loaded by the useEffect when invoice type is selected
  };

  // Handle actions using services
  const handleSave = async () => {
    if (!invoice) return;

    // ==================== PLAN LIMIT CHECK ====================
    // Check if user can create more invoices before saving
    const currentCheck = canCreate('invoice');
    if (!currentCheck.allowed && !currentCheck.unlimited) {
      setMessage({
        type: 'error',
        text: `Invoice limit reached (${currentCheck.current}/${currentCheck.limit}). Please upgrade your plan to create more invoices.`
      });
      return;
    }

    // Clear previous messages
    setMessage(null);

    // Validate invoice before saving
    const validation = InvoiceService.validateInvoice(invoice);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    setIsLoading(true);
    try {
      await InvoiceService.saveInvoice(invoice);
      const savedInvoiceNumber = invoice.invoiceNumber;

      // ==================== INCREMENT USAGE ====================
      // Optimistically update the local usage counter for instant UI feedback
      incrementLocalUsage('invoice');

      // Reset the form for a new invoice
      const companyId = selectedCompany?._id || selectedCompany?.id || '';
      let newInvoiceNumber = '';

      if (companyId) {
        try {
          newInvoiceNumber = await InvoiceService.fetchNextInvoiceNumber(companyId);
        } catch (error) {
          console.error('Error fetching new invoice number:', error);
          newInvoiceNumber = InvoiceService.generateInvoiceNumber();
        }
      }

      // Reset to a fresh invoice form
      setInvoice({
        invoiceNumber: newInvoiceNumber,
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
        termsAndConditions: 'Payment is due within 30 days of invoice date.',
        paymentTerms: 'Net 30',
        status: 'draft' as const,
      });

      // Clear customer selection
      setSelectedCustomer(null);
      setCustomerSearch('');

      setMessage({ type: 'success', text: `Invoice ${savedInvoiceNumber} saved as draft successfully! Form has been reset for a new invoice.` });
    } catch (error) {
      console.error('Error saving invoice:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save invoice' });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Phase 1 QR Code (TLV format - local generation)
  const generatePhase1QRCode = async (): Promise<string | null> => {
    if (!invoice || !selectedCompany) return null;

    try {
      // Create TLV data for ZATCA Phase 1 QR Code
      // Tag 1: Seller Name, Tag 2: VAT Number, Tag 3: Timestamp, Tag 4: Total, Tag 5: VAT Amount
      const sellerName = selectedCompany.companyName || '';
      const vatNumber = selectedCompany.taxIdNumber || selectedCompany.vatNumber || '';
      const timestamp = new Date().toISOString();
      const total = invoice.grandTotal.toFixed(2);
      const vatAmount = invoice.totalTax.toFixed(2);

      // Create TLV buffer
      const createTLV = (tag: number, value: string): number[] => {
        const valueBytes = new TextEncoder().encode(value);
        return [tag, valueBytes.length, ...valueBytes];
      };

      const tlvData = [
        ...createTLV(1, sellerName),
        ...createTLV(2, vatNumber),
        ...createTLV(3, timestamp),
        ...createTLV(4, total),
        ...createTLV(5, vatAmount)
      ];

      // Convert to Base64
      const qrText = btoa(String.fromCharCode(...tlvData));

      // Generate QR code using a simple canvas approach or return the text for QR generation
      // For now, we'll store the TLV data and let the backend/preview generate the actual QR
      return qrText;
    } catch (error) {
      console.error('Error generating Phase 1 QR code:', error);
      return null;
    }
  };

  // Handle opening preview - generate QR code for Phase 1 if not already generated
  const handleOpenPreview = async () => {
    // For Phase 1, generate QR code if not already available
    if (currentPhase === 'phase1' && !phase1QrCode && invoice && selectedCompany) {
      const qrCode = await generatePhase1QRCode();
      if (qrCode) {
        setPhase1QrCode(qrCode);
      }
    }
    setShowPreview(true);
  };

  // Phase 1: Save and generate invoice locally (no ZATCA API)
  const handlePhase1Save = async () => {
    if (!invoice) return;

    // ==================== PLAN LIMIT CHECK ====================
    // Check if user can create more invoices before saving
    const currentCheck = canCreate('invoice');
    if (!currentCheck.allowed && !currentCheck.unlimited) {
      setMessage({
        type: 'error',
        text: `Invoice limit reached (${currentCheck.current}/${currentCheck.limit}). Please upgrade your plan to create more invoices.`
      });
      return;
    }

    setMessage(null);
    setPhase1QrCode(null);

    // Validate invoice before saving
    const validation = InvoiceService.validateInvoice(invoice);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    setIsLoading(true);
    try {
      // Save invoice to database
      const result = await InvoiceService.saveInvoice(invoice);

      // ==================== INCREMENT USAGE ====================
      // Optimistically update the local usage counter for instant UI feedback
      incrementLocalUsage('invoice');

      // Generate QR code locally for Phase 1 (especially for B2C/simplified invoices)
      const qrCode = await generatePhase1QRCode();
      if (qrCode) {
        setPhase1QrCode(qrCode);
      }

      setMessage({
        type: 'success',
        text: 'Invoice saved successfully! You can now print or download it.'
      });

      // Update invoice with the ID from the backend
      if (result?.invoice) {
        const savedInvoice = result.invoice;
        const invoiceId = savedInvoice._id || savedInvoice.id;
        if (invoiceId) {
          setInvoice(prev => prev ? {
            ...prev,
            _id: savedInvoice._id,
            id: invoiceId,
            status: 'sent' as const
          } : prev);
        }
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save invoice' });
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 2: Send invoice with ZATCA integration
  const handleSend = async () => {
    if (!invoice) return;

    // ==================== PLAN LIMIT CHECK ====================
    // Check if user can create more invoices before sending
    const currentCheck = canCreate('invoice');
    if (!currentCheck.allowed && !currentCheck.unlimited) {
      setMessage({
        type: 'error',
        text: `Invoice limit reached (${currentCheck.current}/${currentCheck.limit}). Please upgrade your plan to create more invoices.`
      });
      return;
    }

    // Clear previous messages and ZATCA data
    setMessage(null);
    setZatcaData(null);

    // Validate invoice before sending
    const validation = InvoiceService.validateInvoice(invoice);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') });
      return;
    }

    // Check company ZATCA verification
    if (!selectedCompany) {
      setMessage({ type: 'error', text: 'Please select a company first' });
      return;
    }

    // For Phase 1 companies, use the Phase 1 flow instead
    if (currentPhase === 'phase1') {
      setMessage({
        type: 'info',
        text: 'This company is operating in Phase 1 mode. Use "Save & Print" to create invoices without ZATCA integration.'
      });
      return;
    }

    if (selectedCompany.zatcaCredentials?.status !== 'verified') {
      setMessage({
        type: 'warning',
        text: 'Company is not ZATCA verified. Complete ZATCA onboarding for Phase 2, or use Phase 1 mode.'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send invoice (ZATCA integration happens in backend)
      const result = await InvoiceService.sendInvoice(invoice);

      if (result.success) {
        // Store ZATCA data for display
        setZatcaData({
          uuid: result.zatcaUuid,
          qrCode: result.qrCode,
          pdfUrl: result.pdfUrl
        });

        // ==================== INCREMENT USAGE ====================
        // Optimistically update the local usage counter for instant UI feedback
        incrementLocalUsage('invoice');

        const sentInvoiceNumber = invoice.invoiceNumber;

        setMessage({
          type: 'success',
          text: result.message || `Invoice ${sentInvoiceNumber} sent successfully and cleared by ZATCA!`
        });

        // Reset the form for a new invoice
        const companyId = selectedCompany?._id || selectedCompany?.id || '';
        let newInvoiceNumber = '';

        if (companyId) {
          try {
            newInvoiceNumber = await InvoiceService.fetchNextInvoiceNumber(companyId);
          } catch (error) {
            console.error('Error fetching new invoice number:', error);
            newInvoiceNumber = InvoiceService.generateInvoiceNumber();
          }
        }

        // Reset to a fresh invoice form
        setInvoice({
          invoiceNumber: newInvoiceNumber,
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
          termsAndConditions: 'Payment is due within 30 days of invoice date.',
          paymentTerms: 'Net 30',
          status: 'draft' as const,
        });

        // Clear customer selection
        setSelectedCustomer(null);
        setCustomerSearch('');

        // Reset validation state
        resetValidation();
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send invoice'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validate invoice before sending to ZATCA (Phase 2)
  const handleValidate = async () => {
    if (!invoice) return;

    // Clear previous messages and validation results
    setMessage(null);
    setValidationResult(null);
    setIsValidated(false);

    // Validate invoice locally first
    const localValidation = InvoiceService.validateInvoice(invoice);
    if (!localValidation.isValid) {
      setMessage({ type: 'error', text: localValidation.errors.join(', ') });
      return;
    }

    // Check company ZATCA verification
    if (!selectedCompany) {
      setMessage({ type: 'error', text: 'Please select a company first' });
      return;
    }

    if (selectedCompany.zatcaCredentials?.status !== 'verified') {
      setMessage({
        type: 'warning',
        text: 'Company is not ZATCA verified. Complete ZATCA onboarding for Phase 2.'
      });
      return;
    }

    setIsValidating(true);
    try {
      // First save the invoice if it doesn't have an ID
      let invoiceId = invoice.id || invoice._id;

      if (!invoiceId) {
        // Save the invoice first to get an ID
        const result = await InvoiceService.saveInvoice(invoice);
        if (result?.invoice) {
          const savedInvoice = result.invoice;
          invoiceId = savedInvoice._id || savedInvoice.id;
          // Update the invoice with the ID
          setInvoice(prev => prev ? {
            ...prev,
            _id: savedInvoice._id,
            id: invoiceId,
          } : prev);
        }
      }

      if (!invoiceId) {
        throw new Error('Failed to save invoice for validation');
      }

      // Call ZATCA validation API
      const result = await InvoiceService.validateInvoiceWithZatca(invoiceId);

      setValidationResult({
        isValid: result.isValid,
        errors: result.errors || [],
        warnings: result.warnings || []
      });

      if (result.isValid) {
        setIsValidated(true);
        setMessage({
          type: 'success',
          text: 'Invoice validated successfully! You can now send it to ZATCA.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Validation failed. Please fix the errors and try again.'
        });
      }
    } catch (error) {
      console.error('Error validating invoice:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to validate invoice'
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Show loading state while initializing - Skeleton UI
  if (isInitializing || !invoice) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
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

  // ==================== INVOICE LIMIT CHECK ====================
  // If the user has reached their invoice limit, show upgrade prompt instead of the form
  // This check runs AFTER loading is complete to ensure we have accurate plan data
  if (!isPlanLoading && !invoiceLimitCheck.allowed && !invoiceLimitCheck.unlimited) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-gray-600">Create and send professional invoices to your customers</p>
          </div>
        </div>

        {/* Limit Reached - Full Page Upgrade Prompt */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full">
            {/* Upgrade Card */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-center shadow-lg">
              <div className="p-4 bg-amber-100 rounded-full mb-6">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Invoice Limit Reached
              </h3>

              <p className="text-gray-600 mb-6">
                You&apos;ve used all {invoiceLimitCheck.limit} invoices included in your monthly plan.
                Upgrade to create more invoices.
              </p>

              {/* Usage Progress Bar */}
              <div className="w-full max-w-xs mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Monthly Usage</span>
                  <span className="font-medium">{invoiceLimitCheck.current} / {invoiceLimitCheck.limit}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-xs text-red-600 mt-1 font-medium">100% used - No invoices remaining</p>
              </div>

              {/* Plan Info */}
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                <span>Current Plan: <span className="font-semibold text-gray-700">{planInfo?.currentPlan?.name || 'Free'}</span></span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Suggested: <span className="font-semibold text-amber-600">
                    {planInfo?.currentPlan?.name === 'Free' ? 'Basic' :
                     planInfo?.currentPlan?.name === 'Basic' ? 'Professional' : 'Enterprise'}
                  </span>
                </span>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={() => window.location.href = '/dashboard/settings?tab=subscription'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Zap className="h-5 w-5" />
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Alternative Action */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">or</p>
            <button
              onClick={() => window.location.href = '/dashboard/sales/all-invoices'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Existing Invoices
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Invoice Usage Warning - Shows when approaching limit (80%+) */}
      <UsageLimitWarning resourceType="invoice" showAt={80} />

      {/* ==================== INVOICE USAGE STATS BAR ==================== */}
      {/* Shows current invoice usage so user knows their remaining quota */}
      {!isPlanLoading && planInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Plan Badge & Info */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                planInfo.currentPlan?.name === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                planInfo.currentPlan?.name === 'Professional' ? 'bg-green-100 text-green-700' :
                planInfo.currentPlan?.name === 'Basic' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <span className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {planInfo.currentPlan?.name || 'Free'} Plan
                </span>
              </div>
            </div>

            {/* Invoice Usage Stats */}
            <div className="flex items-center gap-4">
              {/* Invoice Count */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  invoiceLimitCheck.unlimited ? 'bg-purple-500' :
                  (invoiceLimitCheck.percentage ?? 0) >= 100 ? 'bg-red-500' :
                  (invoiceLimitCheck.percentage ?? 0) >= 80 ? 'bg-amber-500' :
                  'bg-green-500'
                }`} />
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {invoiceLimitCheck.current}
                  </span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-gray-500">
                    {invoiceLimitCheck.unlimited ? '∞' : invoiceLimitCheck.limit}
                  </span>
                  <span className="text-gray-400 ml-1">invoices this month</span>
                </span>
              </div>

              {/* Remaining Count */}
              {!invoiceLimitCheck.unlimited && invoiceLimitCheck.remaining !== null && (
                <div className={`text-xs px-2 py-1 rounded-full ${
                  invoiceLimitCheck.remaining === 0 ? 'bg-red-100 text-red-700' :
                  invoiceLimitCheck.remaining <= 5 ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {invoiceLimitCheck.remaining === 0
                    ? 'No invoices remaining'
                    : `${invoiceLimitCheck.remaining} remaining`}
                </div>
              )}

              {/* Upgrade Link */}
              {planInfo.currentPlan?.name !== 'Enterprise' && (
                <button
                  onClick={() => window.location.href = '/dashboard/settings?tab=subscription'}
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                >
                  <Zap className="h-3 w-3" />
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase Indicator Banner */}
      {selectedCompany && (
        <div className={`p-4 rounded-lg border ${
          currentPhase === 'phase2'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : currentPhase === 'phase1'
            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentPhase === 'phase2' ? (
                <>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-800">Phase 2 - ZATCA Integration</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700">
                      Invoices will be {invoice?.invoiceType === 'standard' ? 'cleared' : 'reported'} with ZATCA automatically
                    </p>
                  </div>
                </>
              ) : currentPhase === 'phase1' ? (
                <>
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-800">Phase 1 - Local Generation</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      Invoices will be generated locally with QR code. No ZATCA API integration.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Info className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Select a company to continue</span>
                  </div>
                </>
              )}
            </div>
            {currentPhase === 'phase1' && (
              <button
                onClick={() => {
                  const companyId = selectedCompany._id || selectedCompany.id;
                  window.location.href = `/dashboard/company/zatca-onboarding?companyId=${companyId}`;
                }}
                className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                Upgrade to Phase 2
              </button>
            )}
          </div>
        </div>
      )}

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

      {/* Validation Result Display (Phase 2) */}
      {validationResult && currentPhase === 'phase2' && (
        <div className={`p-4 rounded-lg border ${
          validationResult.isValid
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            {validationResult.isValid ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <div className="ml-3 flex-1">
              <h3 className={`text-lg font-semibold ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                {validationResult.isValid ? 'Validation Passed' : 'Validation Failed'}
              </h3>

              {validationResult.errors.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Errors ({validationResult.errors.length})
                  </h4>
                  <ul className="space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">
                    Warnings ({validationResult.warnings.length})
                  </h4>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.isValid && (
                <p className="mt-2 text-sm text-green-700">
                  Invoice is ready to be sent to ZATCA. Click &quot;Send to ZATCA&quot; to proceed.
                </p>
              )}

              {!validationResult.isValid && (
                <p className="mt-2 text-sm text-red-700">
                  Please fix the errors above and validate again.
                </p>
              )}
            </div>
            <button
              onClick={() => setValidationResult(null)}
              className={`ml-4 ${validationResult.isValid ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
              title="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Phase 1 Success Display */}
      {phase1QrCode && currentPhase === 'phase1' && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-300 rounded-lg p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Invoice Created (Phase 1)
              </h3>

              <p className="text-sm text-amber-800 mb-4">
                Invoice <strong>{invoice?.invoiceNumber}</strong> has been saved locally.
                {invoice?.invoiceType === 'simplified' && ' QR code has been generated for B2C compliance.'}
              </p>

              <div className="space-y-3 text-sm text-amber-700">
                {/* QR Code Display for B2C */}
                {invoice?.invoiceType === 'simplified' && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <span className="font-medium block mb-2">Phase 1 QR Code (TLV Format):</span>
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <p className="text-xs font-mono break-all text-gray-600">{phase1QrCode}</p>
                      <p className="text-xs text-amber-600 mt-2">
                        This TLV-encoded data should be rendered as a QR code on printed invoices.
                      </p>
                    </div>
                  </div>
                )}

                {/* Phase 1 Info */}
                <div className="mt-4 p-3 bg-amber-100/50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Phase 1 Mode:</strong> This invoice is stored locally and not submitted to ZATCA.
                      To enable automatic ZATCA submission, complete the Phase 2 onboarding process.
                    </span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-amber-200">
                  <p className="font-medium mb-3">What would you like to do next?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Preview/Print */}
                    <button
                      onClick={handleOpenPreview}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm"
                    >
                      <Printer className="h-4 w-4" />
                      Preview & Print
                    </button>

                    {/* View Invoice */}
                    <button
                      onClick={() => {
                        if (invoice?.id) {
                          window.location.href = `/dashboard/sales/invoice/${invoice.id}`;
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors shadow-sm hover:shadow font-medium text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      View Invoice
                    </button>

                    {/* Create Another */}
                    <button
                      onClick={() => {
                        window.location.href = '/dashboard/sales/create-invoice';
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors shadow-sm hover:shadow font-medium text-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Another
                    </button>

                    {/* Upgrade to Phase 2 */}
                    <button
                      onClick={() => {
                        const companyId = selectedCompany?._id || selectedCompany?.id;
                        window.location.href = `/dashboard/company/zatca-onboarding?companyId=${companyId}`;
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors shadow-sm hover:shadow font-medium text-sm"
                    >
                      <Shield className="h-4 w-4" />
                      Upgrade to Phase 2
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setPhase1QrCode(null)}
              className="text-amber-600 hover:text-amber-700 ml-4"
              title="Close this message"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ZATCA Success Display (Phase 2) */}
      {zatcaData && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-primary-100 border border-primary-300 rounded-lg p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                ✅ Invoice Sent & Cleared by ZATCA Successfully!
              </h3>

              <p className="text-sm text-primary-800 mb-4">
                Invoice <strong>{invoice.invoiceNumber}</strong> has been successfully cleared by ZATCA and is ready to send to your customer.
              </p>

              <div className="space-y-3 text-sm text-primary-700">
                {zatcaData.uuid && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium min-w-[100px]">ZATCA UUID:</span>
                    <code className="bg-white px-2 py-1 rounded border border-primary-200 text-xs font-mono">
                      {zatcaData.uuid}
                    </code>
                  </div>
                )}

                {/* QR Code Display */}
                {zatcaData.qrCode && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="font-medium block mb-2">ZATCA QR Code:</span>
                    <Image
                      src={`data:image/png;base64,${zatcaData.qrCode}`}
                      alt="ZATCA QR Code"
                      width={192}
                      height={192}
                      unoptimized
                      className="border-2 border-primary-300 rounded-lg shadow-sm bg-white p-2"
                    />
                    <p className="text-xs text-primary-600 mt-2">
                      This QR code will be included in the PDF invoice for customer verification.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-primary-200">
                  <p className="font-medium mb-3">What would you like to do next?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                    {/* Download PDF */}
                    {zatcaData.pdfUrl && (
                      <a
                        href={`data:application/pdf;base64,${zatcaData.pdfUrl}`}
                        download={`invoice-${invoice.invoiceNumber || 'ZATCA'}.pdf`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </a>
                    )}

                    {/* View Invoice */}
                    <button
                      onClick={() => {
                        if (invoice.id) {
                          window.location.href = `/dashboard/sales/invoice/${invoice.id}`;
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow font-medium text-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Invoice
                    </button>

                    {/* Create Another */}
                    <button
                      onClick={() => {
                        window.location.href = '/dashboard/sales/create-invoice';
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow font-medium text-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Another
                    </button>

                    {/* View All Invoices */}
                    <button
                      onClick={() => {
                        window.location.href = '/dashboard/sales/all-invoices';
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow font-medium text-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      All Invoices
                    </button>

                  </div>

                  {/* Email Option - Coming Soon */}
                  <div className="mt-4 p-3 bg-white/50 rounded-lg border border-primary-200/50">
                    <p className="text-xs text-primary-600 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Tip:</strong> Download the PDF and send it to your customer via email or WhatsApp. Email integration coming soon!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setZatcaData(null)}
              className="text-primary-600 hover:text-indigo-700 ml-4"
              title="Close this message"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">
            {currentPhase === 'phase2'
              ? 'Create and send ZATCA-compliant invoices'
              : currentPhase === 'phase1'
              ? 'Create invoices with local QR code generation (Phase 1)'
              : 'Create and send professional invoices to your customers'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {/* Preview Button - Always visible */}
          <button
            onClick={handleOpenPreview}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="h-4 w-4" />
            <span className="font-medium">Preview</span>
          </button>

          {/* Save Draft - Always visible */}
          <button
            onClick={() => handleSave()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span className="font-medium">{isLoading ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Phase-specific action buttons */}
          {currentPhase === 'phase1' ? (
            // Phase 1: Save & Print button
            <button
              onClick={handlePhase1Save}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:via-orange-500 hover:to-amber-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4" />
              <span className="font-medium">{isLoading ? 'Processing...' : 'Save & Print'}</span>
            </button>
          ) : currentPhase === 'phase2' ? (
            // Phase 2: Two-step workflow - Validate first, then Send to ZATCA
            <>
              {/* Validate Button - Always show until validated */}
              {!isValidated && (
                <button
                  onClick={handleValidate}
                  disabled={isLoading || isValidating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-medium">Validating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Validate</span>
                    </>
                  )}
                </button>
              )}

              {/* Send to ZATCA Button - Only show after successful validation */}
              {isValidated && (
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:via-green-600 hover:to-green-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span className="font-medium">{isLoading ? 'Sending...' : 'Send to ZATCA'}</span>
                </button>
              )}
            </>
          ) : (
            // No company selected OR company not onboarded - disabled button
            <button
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              {needsOnboarding ? (
                <>
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Complete Onboarding</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="font-medium">Select Company</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Invoice Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-3">
              <CompanySelection
                companies={allCompanies}
                selectedCompany={selectedCompany}
                onCompanySelect={async (company) => {
                  setSelectedCompany(company);
                  if (company) {
                    const companyId = company._id || company.id || '';
                    try {
                      const newInvoiceNumber = await InvoiceService.fetchNextInvoiceNumber(companyId);
                      setInvoice(prev => prev ? {
                        ...prev,
                        companyId: companyId,
                        invoiceNumber: newInvoiceNumber
                      } : prev);
                    } catch (error) {
                      console.error('Error fetching invoice number:', error);
                      setInvoice(prev => prev ? { ...prev, companyId: companyId } : prev);
                    }
                  } else {
                    setInvoice(prev => prev ? { ...prev, companyId: '', invoiceNumber: '' } : prev);
                  }
                }}
                showZatcaStatus={true}
                required={true}
              />
              {/* Alert for non-onboarded company */}
              {needsOnboarding && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">Company Not Onboarded</p>
                      <p className="text-xs text-amber-700 mt-1">
                        This company has not completed ZATCA onboarding. Please complete Phase 1 or Phase 2 onboarding to create invoices.
                      </p>
                      <a
                        href={`/dashboard/company/zatca-onboarding?companyId=${selectedCompany?._id || selectedCompany?.id}`}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-800 hover:text-amber-900 underline"
                      >
                        <Shield className="h-3 w-3" />
                        Complete ZATCA Onboarding
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                value={invoice.invoiceType}
                onChange={(e) => {
                  const newType = e.target.value as InvoiceData['invoiceType'];
                  setInvoice(prev => prev ? { ...prev, invoiceType: newType, customerId: '', zatcaInvoiceTypeCode: '' } : prev);
                  // Clear selected customer when customer type changes
                  setSelectedCustomer(null);
                }}
                disabled={needsOnboarding}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  !invoice.invoiceType ? 'border-red-300' : 'border-gray-300'
                } ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    ? 'Business-to-Business transactions'
                    : 'Business-to-Consumer transactions'}
                </p>
              )}
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Type <span className="text-xs text-gray-500">(ZATCA)</span> <span className="text-red-500">*</span>
              </label>
              <select
                value={invoice.zatcaInvoiceTypeCode}
                onChange={(e) => {
                  const newCode = e.target.value as InvoiceData['zatcaInvoiceTypeCode'];
                  // Auto-set isAdvancePayment flag for prepayment invoice types (SP, CP)
                  const isAdvancePayment = newCode === 'SP' || newCode === 'CP';
                  setInvoice(prev => prev ? { ...prev, zatcaInvoiceTypeCode: newCode, isAdvancePayment } : prev);
                  resetValidation();
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  !invoice.zatcaInvoiceTypeCode ? 'border-red-300' : 'border-gray-300'
                } ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={needsOnboarding || !invoice.invoiceType}
              >
                <option value="">Select Invoice Type</option>
                {invoice.invoiceType === 'simplified' ? (
                  <>
                    <option value="SI">SI - Simplified Tax Invoice (B2C)</option>
                    <option value="SP">SP - Simplified Prepayment (B2C)</option>
                    <option value="SD">SD - Simplified Debit Note (B2C)</option>
                    <option value="SN">SN - Simplified Credit Note (B2C)</option>
                  </>
                ) : invoice.invoiceType === 'standard' ? (
                  <>
                    <option value="CI">CI - Tax Invoice (B2B)</option>
                    <option value="CP">CP - Prepayment (B2B)</option>
                    <option value="CD">CD - Tax Debit Note (B2B)</option>
                    <option value="CN">CN - Tax Credit Note (B2B)</option>
                  </>
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
                  {invoice.isAdvancePayment && (
                    <span className="text-amber-600 font-medium">Advance Payment Invoice - </span>
                  )}
                  {currentPhase === 'phase2'
                    ? (invoice.invoiceType === 'standard'
                        ? 'Requires ZATCA clearance before sending'
                        : 'Reported to ZATCA within 24 hours')
                    : 'Local generation (Phase 1)'}
                </p>
              )}
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => prev ? { ...prev, invoiceNumber: e.target.value } : prev)}
                    disabled={needsOnboarding}
                    className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 ${needsOnboarding ? 'cursor-not-allowed' : ''}`}
                    placeholder="Invoice number"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs text-primary font-medium" title="Auto-generated">
                      Auto
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshInvoiceNumber}
                  disabled={needsOnboarding || isRefreshingNumber}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Get new invoice number"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshingNumber ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={invoice.issueDate}
                onChange={(e) => setInvoice(prev => prev ? { ...prev, issueDate: e.target.value } : prev)}
                disabled={needsOnboarding}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice(prev => prev ? { ...prev, dueDate: e.target.value } : prev)}
                disabled={needsOnboarding}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Customer, Payment Terms, Currency in one row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
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
            isB2C={invoice?.invoiceType === 'simplified'}
            disabled={needsOnboarding}
          />

          {/* Currency Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency</h3>
            <select
              value={invoice.currency}
              onChange={(e) => setInvoice(prev => prev ? { ...prev, currency: e.target.value } : prev)}
              disabled={needsOnboarding}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
              value={invoice.paymentTerms}
              onChange={(e) => setInvoice(prev => prev ? { ...prev, paymentTerms: e.target.value } : prev)}
              disabled={needsOnboarding}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
          disabled={needsOnboarding}
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
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={3}
                  disabled={needsOnboarding}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Add any additional notes or comments..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  value={invoice.termsAndConditions}
                  onChange={(e) => setInvoice(prev => prev ? { ...prev, termsAndConditions: e.target.value } : prev)}
                  rows={3}
                  disabled={needsOnboarding}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${needsOnboarding ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter payment terms and conditions..."
                />
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <InvoiceSummary
            subtotal={invoice.subtotal}
            totalDiscount={invoice.totalDiscount}
            totalTax={invoice.totalTax}
            grandTotal={invoice.grandTotal}
            currency={invoice.currency}
          />
        </div>
      </div>

      {/* Preview Modal - Lazy Loaded */}
      {showPreview && (
        <Suspense fallback={<PreviewModalSkeleton />}>
          <InvoicePreview
            isOpen={showPreview}
            invoice={invoice}
            selectedCustomer={selectedCustomer}
            selectedCompany={selectedCompany}
            onClose={() => setShowPreview(false)}
            qrCodeData={phase1QrCode}
            zatcaQrCode={zatcaData?.qrCode}
            currentPhase={currentPhase}
          />
        </Suspense>
      )}

    </div>
  );
}