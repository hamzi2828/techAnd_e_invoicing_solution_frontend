'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Printer, Send, Edit3, Trash2, CheckCircle, X, Shield, Clock, XCircle, AlertTriangle, QrCode } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { InvoiceService } from '../../all-invoices/services/invoiceService';
import { Invoice } from '../../all-invoices/types';
import { VAT_CATEGORY_OPTIONS, VatCategoryCode } from '../../create-invoice/types';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

// Generate ZATCA-compliant QR code using TLV (Tag-Length-Value) format
// ZATCA requires 5 mandatory fields:
// Tag 1: Seller Name
// Tag 2: VAT Registration Number
// Tag 3: Invoice Timestamp (ISO 8601 format)
// Tag 4: Invoice Total (with VAT)
// Tag 5: VAT Amount
const generateZatcaQRData = (
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalWithVAT: number,
  vatAmount: number
): string => {
  // TLV encoding function
  const tlv = (tag: number, value: string): number[] => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(value);
    return [tag, encoded.length, ...Array.from(encoded)];
  };

  // Build the TLV payload
  const payload = new Uint8Array([
    ...tlv(1, sellerName),
    ...tlv(2, vatNumber),
    ...tlv(3, timestamp),
    ...tlv(4, totalWithVAT.toFixed(2)),
    ...tlv(5, vatAmount.toFixed(2)),
  ]);

  // Convert to Base64
  let binary = '';
  payload.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

// Helper to get tax rate from VAT category
const getTaxRateFromCategory = (categoryCode: VatCategoryCode | string | undefined): number => {
  const category = VAT_CATEGORY_OPTIONS.find(c => c.code === (categoryCode || 'S'));
  return category?.rate ?? 15;
};

// Helper to get VAT category label
const getVatCategoryLabel = (categoryCode: VatCategoryCode | string | undefined): string => {
  const category = VAT_CATEGORY_OPTIONS.find(c => c.code === (categoryCode || 'S'));
  return category ? `${category.code} - ${category.rate}%` : 'S - 15%';
};

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState<string | null>(null);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();

  // Generate QR code for Phase 1 invoices (local generation)
  const generateQRCode = useCallback(async (inv: Invoice) => {
    // Skip if invoice already has ZATCA QR code
    if (inv.zatca?.qrCode) {
      return;
    }

    const company = typeof inv.companyId === 'object' ? inv.companyId : null;
    if (!company) return;

    // Calculate totals from items
    let totalBeforeVAT = 0;
    let totalVAT = 0;

    inv.items?.forEach(item => {
      const vatCategoryCode = (item as { vatCategoryCode?: string }).vatCategoryCode || 'S';
      const category = VAT_CATEGORY_OPTIONS.find(c => c.code === vatCategoryCode);
      const taxRate = category?.rate ?? 15;
      const baseAmount = (item.quantity || 0) * (item.unitPrice || 0);
      const discountAmount = (item.discount || 0);
      const amountAfterDiscount = baseAmount - discountAmount;
      const itemVAT = amountAfterDiscount * (taxRate / 100);

      totalBeforeVAT += amountAfterDiscount;
      totalVAT += itemVAT;
    });

    const totalWithVAT = totalBeforeVAT + totalVAT;

    // Generate ZATCA TLV data
    const qrData = generateZatcaQRData(
      company.companyName || 'Unknown',
      company.taxIdNumber || company.vatNumber || '',
      new Date(inv.invoiceDate).toISOString(),
      totalWithVAT,
      totalVAT
    );

    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      setGeneratedQRCode(qrCodeDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }, []);

  // Load invoice data
  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return;

      setIsLoading(true);
      try {
        const invoiceData = await InvoiceService.getInvoiceById(invoiceId);
        if (invoiceData) {
          setInvoice(invoiceData);
          // Generate QR code for Phase 1 invoices (if no ZATCA QR exists)
          generateQRCode(invoiceData);
        } else {
          setError('Invoice not found');
        }
      } catch (err) {
        console.error('Error loading invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, generateQRCode]);

  const handleStatusUpdate = async (status: string) => {
    if (!invoice) return;

    setActionLoading(status);
    try {
      await InvoiceService.updateInvoiceStatus(invoice._id || invoice.id!, status);
      const updatedInvoice = await InvoiceService.getInvoiceById(invoiceId);
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      showAlert('Failed to update invoice status', 'error');
    } finally {
      setActionLoading(null);
      setShowActions(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice) return;

    setActionLoading('delete');
    try {
      await InvoiceService.deleteInvoice(invoice._id || invoice.id!);
      router.push('/dashboard/sales/all-invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showAlert('Failed to delete invoice', 'error');
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      // Call the new endpoint to regenerate PDF on-the-fly with correct VAT categories
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/invoices/${invoiceId}/download-pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const result = await response.json();

      if (result.success && result.data?.pdfBase64) {
        // Convert Base64 to Blob
        const byteCharacters = atob(result.data.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Create Blob URL and open in new tab
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        showAlert('Failed to generate PDF', 'error');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showAlert('Failed to download PDF. Please try again.', 'error');
    }
  };

  // Get ZATCA status info
  const getZatcaStatusInfo = () => {
    // Check if this is a Phase 1 invoice (has generated QR but no ZATCA data)
    if (!invoice?.zatca && generatedQRCode) {
      return { status: 'phase1', label: 'Phase 1 - Local Mode', color: 'amber', icon: QrCode };
    }

    if (!invoice?.zatca) {
      return { status: 'pending', label: 'Pending', color: 'gray', icon: Clock };
    }

    const zatcaStatus = invoice.zatca.status;
    const validationStatus = invoice.zatca.validationStatus;

    if (zatcaStatus === 'cleared' || zatcaStatus === 'reported') {
      return {
        status: zatcaStatus,
        label: zatcaStatus === 'cleared' ? 'Cleared by ZATCA' : 'Reported to ZATCA',
        color: 'green',
        icon: CheckCircle
      };
    }

    if (validationStatus === 'valid') {
      return { status: 'validated', label: 'Validated', color: 'yellow', icon: Shield };
    }

    if (validationStatus === 'invalid' || zatcaStatus === 'failed') {
      return { status: 'failed', label: 'Validation Failed', color: 'red', icon: XCircle };
    }

    return { status: 'pending', label: 'Pending Validation', color: 'gray', icon: Clock };
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateItemTotal = (item: {
    totalPrice?: number;
    taxAmount?: number;
  }) => {
    return (item.totalPrice || 0) + (item.taxAmount || 0);
  };

  const getCustomerData = () => {
    if (!invoice) return null;

    if (typeof invoice.customerId === 'object') {
      return {
        name: invoice.customerId.customerName || 'N/A',
        email: invoice.customerId.contactInfo?.email || '',
        phone: invoice.customerId.contactInfo?.phone || '',
        address: invoice.customerId.address
      };
    }

    return null;
  };

  const getCompanyData = () => {
    if (!invoice) return null;

    if (typeof invoice.companyId === 'object') {
      return invoice.companyId;
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Invoice not found'}
          </h3>
          <p className="text-gray-500 mb-6">
            The invoice you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <button
            onClick={() => router.push('/dashboard/sales/all-invoices')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const customer = getCustomerData();
  const company = getCompanyData();
  const canEdit = invoice.status === 'draft';
  const canSend = ['draft', 'viewed'].includes(invoice.status);
  const canMarkPaid = ['sent', 'viewed', 'overdue'].includes(invoice.status);
  const zatcaInfo = getZatcaStatusInfo();
  const ZatcaIcon = zatcaInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar - No Print */}
      <div className="bg-white border-b border-gray-200 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard/sales/all-invoices')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Invoices
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <FileText className="h-4 w-4" />
                <span>View PDF</span>
              </button>

              {(canEdit || canSend || canMarkPaid) && (
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>Actions</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ZATCA Status Banner */}
      <div className="max-w-5xl mx-auto px-4 pt-4 print:hidden">
        <div className={`rounded-lg border p-4 ${
          zatcaInfo.color === 'green'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : zatcaInfo.color === 'yellow'
            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
            : zatcaInfo.color === 'amber'
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
            : zatcaInfo.color === 'red'
            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                zatcaInfo.color === 'green' ? 'bg-green-100' :
                zatcaInfo.color === 'yellow' ? 'bg-yellow-100' :
                zatcaInfo.color === 'amber' ? 'bg-amber-100' :
                zatcaInfo.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <ZatcaIcon className={`h-6 w-6 ${
                  zatcaInfo.color === 'green' ? 'text-green-600' :
                  zatcaInfo.color === 'yellow' ? 'text-yellow-600' :
                  zatcaInfo.color === 'amber' ? 'text-amber-600' :
                  zatcaInfo.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${
                    zatcaInfo.color === 'green' ? 'text-green-800' :
                    zatcaInfo.color === 'yellow' ? 'text-yellow-800' :
                    zatcaInfo.color === 'amber' ? 'text-amber-800' :
                    zatcaInfo.color === 'red' ? 'text-red-800' : 'text-gray-800'
                  }`}>
                    {zatcaInfo.status === 'phase1' ? zatcaInfo.label : `ZATCA Status: ${zatcaInfo.label}`}
                  </h3>
                </div>

                {/* Show UUID if available */}
                {invoice.zatca?.uuid && (
                  <div className="mt-2">
                    <span className={`text-sm font-medium ${
                      zatcaInfo.color === 'green' ? 'text-green-700' : 'text-gray-700'
                    }`}>UUID: </span>
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200">
                      {invoice.zatca.uuid}
                    </code>
                  </div>
                )}

                {/* Show Invoice Hash if available */}
                {invoice.zatca?.invoiceHash && (
                  <div className="mt-1">
                    <span className={`text-sm font-medium ${
                      zatcaInfo.color === 'green' ? 'text-green-700' : 'text-gray-700'
                    }`}>Hash: </span>
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 break-all">
                      {invoice.zatca.invoiceHash.substring(0, 40)}...
                    </code>
                  </div>
                )}

                {/* Show error messages if failed */}
                {zatcaInfo.status === 'failed' && invoice.zatca?.errors && invoice.zatca.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                    <p className="text-sm font-medium text-red-800 mb-1">Validation Errors:</p>
                    <ul className="text-xs text-red-700 list-disc list-inside">
                      {invoice.zatca.errors.slice(0, 3).map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {invoice.zatca.errors.length > 3 && (
                        <li>...and {invoice.zatca.errors.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Display */}
            {(invoice.zatca?.qrCode || generatedQRCode) && (
              <div className="flex-shrink-0 ml-4">
                <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                  {invoice.zatca?.qrCode ? (
                    <Image
                      src={`data:image/png;base64,${invoice.zatca.qrCode}`}
                      alt="ZATCA QR Code"
                      width={120}
                      height={120}
                      unoptimized
                      className="rounded"
                    />
                  ) : generatedQRCode ? (
                    <Image
                      src={generatedQRCode}
                      alt="ZATCA QR Code"
                      width={120}
                      height={120}
                      unoptimized
                      className="rounded"
                    />
                  ) : null}
                  <p className="text-xs text-center text-gray-500 mt-1">
                    {invoice.zatca?.qrCode ? 'ZATCA QR' : 'Phase 1 QR'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action hint for pending invoices */}
          {zatcaInfo.status === 'pending' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                This invoice has not been validated or submitted to ZATCA yet.
              </p>
            </div>
          )}

          {zatcaInfo.status === 'validated' && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-sm text-yellow-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Invoice is validated and ready to be submitted to ZATCA.
              </p>
            </div>
          )}

          {zatcaInfo.status === 'phase1' && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                This is a Phase 1 invoice with locally generated QR code containing ZATCA-compliant TLV data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-5xl mx-auto p-4 print:p-0">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm print:shadow-none print:border-0">
          {/* Company Header */}
          <div className="flex justify-between items-start p-8 print:p-12 border-b border-gray-200">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-primary text-lg font-semibold">#{invoice.invoiceNumber}</p>
              <div className="mt-4">
                <span className={`
                  inline-block px-4 py-1.5 text-sm font-semibold rounded-full
                  ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    invoice.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }
                `}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="text-right">
              {company ? (
                <>
                  <div className="text-2xl font-bold text-primary mb-1">{company.companyName}</div>
                  {company.companyNameAr && (
                    <p className="text-gray-600 mb-2">{company.companyNameAr}</p>
                  )}
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {company.address?.street && <p>{company.address.street}</p>}
                    {company.address?.district && <p>{company.address.district}</p>}
                    <p>
                      {[company.address?.city, company.address?.postalCode].filter(Boolean).join(' ')}
                      {company.address?.country && `, ${company.address.country}`}
                    </p>
                    {company.phone && <p>{company.phone}</p>}
                    {company.email && <p>{company.email}</p>}
                    {company.taxIdNumber && (
                      <p className="font-semibold mt-2">Tax ID: {company.taxIdNumber}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">Your Company</div>
                  <p className="text-gray-600">Company Address</p>
                </>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 p-8 print:p-12">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Bill To:</h3>
              {customer && (
                <div className="text-gray-700">
                  <p className="font-semibold text-lg mb-1">{customer.name}</p>
                  {customer.address?.street && <p>{customer.address.street}</p>}
                  <p>
                    {[customer.address?.city, customer.address?.state].filter(Boolean).join(', ')}
                    {customer.address?.postalCode && ` ${customer.address.postalCode}`}
                  </p>
                  {customer.address?.country && <p>{customer.address.country}</p>}
                  {customer.email && <p className="mt-2">{customer.email}</p>}
                  {customer.phone && <p>{customer.phone}</p>}
                </div>
              )}
            </div>
            <div>
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Issue Date:</span>
                  <span className="text-gray-900 font-semibold">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Due Date:</span>
                  <span className="text-gray-900 font-semibold">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Payment Terms:</span>
                  <span className="text-gray-900 font-semibold">{invoice.paymentTerms || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Currency:</span>
                  <span className="text-gray-900 font-semibold">{invoice.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="px-8 print:px-12 pb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                    Description
                  </th>
                  <th className="text-center py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider w-20">
                    Qty
                  </th>
                  <th className="text-right py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider w-28">
                    Unit Price
                  </th>
                  <th className="text-center py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider w-24">
                    VAT
                  </th>
                  <th className="text-right py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider w-24">
                    Tax
                  </th>
                  <th className="text-right py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider w-32">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => {
                  // Derive tax rate from VAT category
                  const vatCategoryCode = (item as { vatCategoryCode?: string }).vatCategoryCode || 'S';
                  const taxRate = getTaxRateFromCategory(vatCategoryCode);
                  const baseAmount = (item.quantity || 0) * (item.unitPrice || 0);
                  const discountAmount = (item.discount || 0);
                  const amountAfterDiscount = baseAmount - discountAmount;
                  const calculatedTaxAmount = amountAfterDiscount * (taxRate / 100);
                  const calculatedTotal = amountAfterDiscount + calculatedTaxAmount;

                  return (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-4 text-gray-900">
                        <div>{item.description}</div>
                        {/* Show exemption reason for non-S categories */}
                        {vatCategoryCode !== 'S' && (item as { taxExemptionReasonText?: string }).taxExemptionReasonText && (
                          <div className="text-xs text-gray-500 mt-1">
                            Reason: {(item as { taxExemptionReasonText?: string }).taxExemptionReasonText}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-center text-gray-900">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-900">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          vatCategoryCode === 'S' ? 'bg-blue-100 text-blue-700' :
                          vatCategoryCode === 'Z' ? 'bg-green-100 text-green-700' :
                          vatCategoryCode === 'E' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getVatCategoryLabel(vatCategoryCode)}
                        </span>
                      </td>
                      <td className="py-4 text-right text-gray-900">
                        {formatCurrency(calculatedTaxAmount, invoice.currency)}
                      </td>
                      <td className="py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(calculatedTotal, invoice.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 print:px-12 pb-8">
            <div className="flex justify-end">
              <div className="w-80">
                {(() => {
                  // Recalculate totals based on VAT categories
                  let calculatedSubtotal = 0;
                  let calculatedTotalTax = 0;

                  invoice.items?.forEach(item => {
                    const vatCategoryCode = (item as { vatCategoryCode?: string }).vatCategoryCode || 'S';
                    const taxRate = getTaxRateFromCategory(vatCategoryCode);
                    const baseAmount = (item.quantity || 0) * (item.unitPrice || 0);
                    const discountAmount = (item.discount || 0);
                    const amountAfterDiscount = baseAmount - discountAmount;
                    const itemTaxAmount = amountAfterDiscount * (taxRate / 100);

                    calculatedSubtotal += amountAfterDiscount;
                    calculatedTotalTax += itemTaxAmount;
                  });

                  const calculatedTotal = calculatedSubtotal + calculatedTotalTax;

                  return (
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-gray-700">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(calculatedSubtotal, invoice.currency)}</span>
                      </div>

                      {(invoice.discount ?? 0) > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span className="font-medium">
                            Discount ({invoice.discountType === 'percentage' ? `${invoice.discount}%` : 'Fixed'}):
                          </span>
                          <span className="font-semibold">
                            -{formatCurrency(
                              invoice.discountType === 'percentage'
                                ? (calculatedSubtotal * (invoice.discount ?? 0)) / 100
                                : (invoice.discount ?? 0),
                              invoice.currency
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-700">
                        <span className="font-medium">Tax (VAT):</span>
                        <span className="font-semibold">{formatCurrency(calculatedTotalTax, invoice.currency)}</span>
                      </div>

                      <div className="border-t-2 border-gray-300 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(calculatedTotal, invoice.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.termsAndConditions) && (
            <div className="border-t border-gray-200 px-8 print:px-12 py-6">
              {invoice.notes && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                  <p className="text-gray-700 text-sm">{invoice.notes}</p>
                </div>
              )}
              {invoice.termsAndConditions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Terms and Conditions:</h4>
                  <p className="text-gray-700 text-sm">{invoice.termsAndConditions}</p>
                </div>
              )}
            </div>
          )}

          {/* ZATCA Information Footer (for print and display) */}
          {(invoice.zatca?.uuid || invoice.zatca?.qrCode || generatedQRCode) && (
            <div className="border-t border-gray-200 px-8 print:px-12 py-6 bg-gray-50 print:bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    {invoice.zatca?.qrCode ? (
                      <Shield className="h-5 w-5 text-green-600" />
                    ) : (
                      <QrCode className="h-5 w-5 text-amber-600" />
                    )}
                    {invoice.zatca?.qrCode ? 'ZATCA E-Invoice Information' : 'Phase 1 - Local QR Code'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    {invoice.zatca?.uuid && (
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-24">UUID:</span>
                        <code className="text-gray-600 font-mono text-xs">{invoice.zatca.uuid}</code>
                      </div>
                    )}
                    {invoice.zatca?.invoiceHash && (
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-24">Hash:</span>
                        <code className="text-gray-600 font-mono text-xs break-all">{invoice.zatca.invoiceHash}</code>
                      </div>
                    )}
                    {invoice.zatca?.status && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Status:</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          invoice.zatca.status === 'cleared' || invoice.zatca.status === 'reported'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {invoice.zatca.status === 'cleared' ? (
                            <><CheckCircle className="h-3 w-3" /> Cleared</>
                          ) : invoice.zatca.status === 'reported' ? (
                            <><CheckCircle className="h-3 w-3" /> Reported</>
                          ) : (
                            invoice.zatca.status.charAt(0).toUpperCase() + invoice.zatca.status.slice(1)
                          )}
                        </span>
                      </div>
                    )}
                    {/* Phase 1 info when no ZATCA data */}
                    {!invoice.zatca?.qrCode && generatedQRCode && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>Phase 1 QR Code</strong> - This QR code contains ZATCA-compliant TLV data:
                        </p>
                        <ul className="text-xs text-amber-700 mt-2 space-y-1">
                          <li>• Seller Name: {company?.companyName}</li>
                          <li>• VAT Number: {company?.taxIdNumber || company?.vatNumber || 'N/A'}</li>
                          <li>• Invoice Date: {formatDate(invoice.invoiceDate)}</li>
                          <li>• Total with VAT: {formatCurrency(invoice.totalAmount || 0, invoice.currency)}</li>
                          <li>• VAT Amount: {formatCurrency(invoice.taxAmount || 0, invoice.currency)}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                {(invoice.zatca?.qrCode || generatedQRCode) && (
                  <div className="flex-shrink-0 ml-6">
                    <div className="text-center">
                      {invoice.zatca?.qrCode ? (
                        <Image
                          src={`data:image/png;base64,${invoice.zatca.qrCode}`}
                          alt="ZATCA QR Code"
                          width={140}
                          height={140}
                          unoptimized
                          className="border border-gray-200 rounded-lg"
                        />
                      ) : generatedQRCode ? (
                        <Image
                          src={generatedQRCode}
                          alt="Phase 1 QR Code"
                          width={140}
                          height={140}
                          unoptimized
                          className="border border-amber-200 rounded-lg"
                        />
                      ) : null}
                      <p className="text-xs text-gray-500 mt-2">
                        {invoice.zatca?.qrCode ? 'Scan to verify' : 'Phase 1 QR'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Dropdown Panel */}
      {showActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invoice Actions</h3>
              <button
                onClick={() => setShowActions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              {canEdit && (
                <button
                  onClick={() => router.push(`/dashboard/sales/edit-invoice/${invoice._id || invoice.id}`)}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="h-5 w-5" />
                  <span className="font-medium">Edit Invoice</span>
                </button>
              )}

              {canSend && (
                <button
                  onClick={() => handleStatusUpdate('sent')}
                  disabled={actionLoading === 'sent'}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                  <span className="font-medium">{actionLoading === 'sent' ? 'Sending...' : 'Send Invoice'}</span>
                </button>
              )}

              {canMarkPaid && (
                <button
                  onClick={() => handleStatusUpdate('paid')}
                  disabled={actionLoading === 'paid'}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{actionLoading === 'paid' ? 'Updating...' : 'Mark as Paid'}</span>
                </button>
              )}

              {canEdit && (
                <button
                  onClick={() => {
                    setShowActions(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-medium">Delete Invoice</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Invoice</h3>
                <p className="text-sm text-gray-500">Invoice #{invoice.invoiceNumber}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading === 'delete'}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInvoice}
                disabled={actionLoading === 'delete'}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
