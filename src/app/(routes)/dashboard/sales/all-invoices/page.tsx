'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceFilters, InvoiceList, ValidationModal } from './components';
import { Invoice, InvoiceFilters as IInvoiceFilters } from './types';
import { InvoiceService } from './services/invoiceService';
import { ChevronLeft, ChevronRight, Plus, X, ShieldCheck, Loader2, CheckCircle, XCircle, Trash2, Download, FileArchive, Send } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

export default function AllInvoicesPage() {
  const router = useRouter();
  const { user, hasPermission } = useCurrentUser();

  // Permission checks
  const permissions = {
    canCreate: !user?.createdBy || hasPermission('sales-create-invoice'),
    canView: !user?.createdBy || hasPermission('sales-view-all-invoices'),
    canEdit: !user?.createdBy || hasPermission('sales-edit-invoice'),
    canDelete: !user?.createdBy || hasPermission('sales-delete-invoice'),
    canSend: !user?.createdBy || hasPermission('sales-send-invoice'),
    canDownload: !user?.createdBy || hasPermission('sales-download-invoice'),
  };

  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState<IInvoiceFilters>({
    status: 'all',
    paymentStatus: 'all',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  // Validation modal state
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedInvoiceForValidation, setSelectedInvoiceForValidation] = useState<Invoice | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  // Bulk validation state
  const [isBulkValidating, setIsBulkValidating] = useState(false);
  const [bulkValidationProgress, setBulkValidationProgress] = useState<{
    current: number;
    total: number;
    results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }>;
  } | null>(null);

  // Bulk delete state
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState<{
    current: number;
    total: number;
    results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }>;
  } | null>(null);

  // Bulk download state
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState<{
    current: number;
    total: number;
    results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }>;
  } | null>(null);

  // Bulk submit to ZATCA state
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkSubmitProgress, setBulkSubmitProgress] = useState<{
    current: number;
    total: number;
    results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }>;
  } | null>(null);

  // Submit to ZATCA confirmation modal state
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [invoicesToSubmit, setInvoicesToSubmit] = useState<Invoice[]>([]);

  // Delete confirmation modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [invoicesToDelete, setInvoicesToDelete] = useState<Invoice[]>([]);

  // Download confirmation modal state
  const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState(false);
  const [invoicesToDownload, setInvoicesToDownload] = useState<Invoice[]>([]);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();

  // Load invoices - using useCallback to memoize the function
  const loadInvoices = React.useCallback(async () => {
    setIsLoading(true);
    setSelectedInvoices([]); // Clear selections when loading new data
    try {
      const result = await InvoiceService.getAllInvoices(filters);
      setInvoices(result.invoices);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load data when filters change
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Check if any filter is applied
  const hasActiveFilters =
    (filters.status && filters.status !== 'all') ||
    (filters.search && filters.search.trim() !== '') ||
    (filters.startDate && filters.startDate !== '') ||
    (filters.endDate && filters.endDate !== '');

  // Handle filter changes
  const handleFilterChange = (newFilters: IInvoiceFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      search: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10
    });
  };

  // Handle search
  const handleSearch = () => {
    // Trigger reload by updating filters (which will cause loadInvoices to run)
    setFilters(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle page size change
  const handlePageSizeChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 })); // Reset to page 1 when changing limit
  };

  // Page size options
  const pageSizeOptions = [10, 20, 50, 100, 500];

  // Handle invoice actions

  // Open validation modal for an invoice
  const handleOpenValidationModal = (invoice: Invoice) => {
    setSelectedInvoiceForValidation(invoice);
    setValidationResult(null); // Reset previous validation result
    setValidationModalOpen(true);
  };

  // Close validation modal
  const handleCloseValidationModal = () => {
    setValidationModalOpen(false);
    setSelectedInvoiceForValidation(null);
    setValidationResult(null);
    setIsValidating(false);
    setIsSubmitting(false);
  };

  // Validate invoice
  const handleValidateInvoice = async () => {
    if (!selectedInvoiceForValidation) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const invoiceId = selectedInvoiceForValidation._id || selectedInvoiceForValidation.id!;
      const result = await InvoiceService.validateInvoice(invoiceId);

      setValidationResult({
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings
      });

      // Refresh the invoice list to get updated validation status from DB
      loadInvoices();
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        errors: ['An unexpected error occurred during validation'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Submit invoice to ZATCA after successful validation
  const handleSubmitToZatca = async () => {
    if (!selectedInvoiceForValidation) return;

    setIsSubmitting(true);

    try {
      const invoiceId = selectedInvoiceForValidation._id || selectedInvoiceForValidation.id!;
      const success = await InvoiceService.sendInvoice(invoiceId);

      if (success) {
        handleCloseValidationModal();
        loadInvoices();
      } else {
        setValidationResult({
          isValid: false,
          errors: ['Failed to submit invoice to ZATCA'],
          warnings: []
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setValidationResult({
        isValid: false,
        errors: ['An unexpected error occurred while submitting'],
        warnings: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get pending invoices from selection (only ZATCA pending status)
  const getPendingSelectedInvoices = () => {
    return invoices.filter(invoice => {
      const invoiceId = invoice._id || invoice.id;
      const isSelected = selectedInvoices.includes(invoiceId!);
      const isPending = !invoice.zatca?.status || invoice.zatca?.status === 'pending';
      const isNotSent = invoice.status !== 'sent';
      return isSelected && isPending && isNotSent;
    });
  };

  const pendingSelectedCount = getPendingSelectedInvoices().length;

  // Bulk validate selected invoices
  const handleBulkValidate = async () => {
    const pendingInvoices = getPendingSelectedInvoices();

    if (pendingInvoices.length === 0) {
      showAlert('No pending invoices selected for validation. Only invoices with ZATCA status "Pending" can be validated.', 'warning');
      return;
    }

    setIsBulkValidating(true);
    setBulkValidationProgress({
      current: 0,
      total: pendingInvoices.length,
      results: []
    });

    const results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }> = [];

    for (let i = 0; i < pendingInvoices.length; i++) {
      const invoice = pendingInvoices[i];
      const invoiceId = invoice._id || invoice.id!;

      try {
        const result = await InvoiceService.validateInvoice(invoiceId);
        results.push({
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          success: result.isValid,
          message: result.isValid ? 'Validated successfully' : (result.errors[0] || 'Validation failed')
        });
      } catch (error) {
        results.push({
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          success: false,
          message: error instanceof Error ? error.message : 'Validation failed'
        });
      }

      setBulkValidationProgress({
        current: i + 1,
        total: pendingInvoices.length,
        results: [...results]
      });
    }

    // Refresh invoices after bulk validation
    loadInvoices();
    setSelectedInvoices([]);
  };

  // Close bulk validation progress
  const handleCloseBulkValidation = () => {
    setIsBulkValidating(false);
    setBulkValidationProgress(null);
  };

  // Get deletable invoices (only draft invoices can be deleted, not sent/cleared/reported)
  const getDeletableSelectedInvoices = () => {
    return invoices.filter(invoice => {
      const invoiceId = invoice._id || invoice.id;
      const isSelected = selectedInvoices.includes(invoiceId!);
      const isDraft = invoice.status === 'draft';
      const zatcaStatus = invoice.zatca?.status;
      const isCleared = zatcaStatus === 'cleared' || zatcaStatus === 'reported';
      // Cannot delete if: sent, cleared, or reported
      return isSelected && isDraft && !isCleared;
    });
  };

  const deletableSelectedCount = getDeletableSelectedInvoices().length;

  // Get all selected invoices for download
  const getSelectedInvoicesForDownload = () => {
    return invoices.filter(invoice => {
      const invoiceId = invoice._id || invoice.id;
      return selectedInvoices.includes(invoiceId!);
    });
  };

  const downloadSelectedCount = getSelectedInvoicesForDownload().length;

  // Show delete confirmation modal
  const handleBulkDeleteClick = () => {
    const deletableInvoices = getDeletableSelectedInvoices();

    if (deletableInvoices.length === 0) {
      showAlert('No deletable invoices selected. Only draft invoices that are not cleared by ZATCA can be deleted.', 'warning');
      return;
    }

    setInvoicesToDelete(deletableInvoices);
    setShowDeleteConfirmModal(true);
  };

  // Confirm and execute bulk delete
  const handleConfirmBulkDelete = async () => {
    setShowDeleteConfirmModal(false);

    if (invoicesToDelete.length === 0) return;

    setIsBulkDeleting(true);
    setBulkDeleteProgress({
      current: 0,
      total: invoicesToDelete.length,
      results: []
    });

    const results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }> = [];

    for (let i = 0; i < invoicesToDelete.length; i++) {
      const invoice = invoicesToDelete[i];
      const invoiceId = invoice._id || invoice.id!;

      try {
        const success = await InvoiceService.deleteInvoice(invoiceId);
        results.push({
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          success,
          message: success ? 'Deleted successfully' : 'Failed to delete'
        });
      } catch (error) {
        results.push({
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          success: false,
          message: error instanceof Error ? error.message : 'Delete failed'
        });
      }

      setBulkDeleteProgress({
        current: i + 1,
        total: invoicesToDelete.length,
        results: [...results]
      });
    }

    // Refresh invoices after bulk delete
    loadInvoices();
    setSelectedInvoices([]);
    setInvoicesToDelete([]);
  };

  // Cancel delete confirmation
  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setInvoicesToDelete([]);
  };

  // Close bulk delete progress
  const handleCloseBulkDelete = () => {
    setIsBulkDeleting(false);
    setBulkDeleteProgress(null);
  };

  // Show download confirmation modal
  const handleBulkDownloadClick = () => {
    const selectedForDownload = getSelectedInvoicesForDownload();

    if (selectedForDownload.length === 0) {
      showAlert('No invoices selected for download.', 'warning');
      return;
    }

    setInvoicesToDownload(selectedForDownload);
    setShowDownloadConfirmModal(true);
  };

  // Confirm and execute bulk download as ZIP
  const handleConfirmBulkDownload = async () => {
    setShowDownloadConfirmModal(false);

    if (invoicesToDownload.length === 0) return;

    setIsBulkDownloading(true);
    setBulkDownloadProgress({
      current: 0,
      total: invoicesToDownload.length,
      results: []
    });

    const zip = new JSZip();
    const results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }> = [];

    const token = localStorage.getItem('auth_token');

    for (let i = 0; i < invoicesToDownload.length; i++) {
      const invoice = invoicesToDownload[i];
      const invoiceId = invoice._id || invoice.id!;

      try {
        // Call the new endpoint to regenerate PDF on-the-fly with correct VAT categories
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

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.pdfBase64) {
            // Add PDF to ZIP
            zip.file(`${result.data.invoiceNumber || invoice.invoiceNumber}.pdf`, result.data.pdfBase64, { base64: true });

            results.push({
              invoiceId,
              invoiceNumber: invoice.invoiceNumber,
              success: true,
              message: 'Added to ZIP'
            });
          } else {
            results.push({
              invoiceId,
              invoiceNumber: invoice.invoiceNumber,
              success: false,
              message: 'Failed to generate PDF'
            });
          }
        } else {
          results.push({
            invoiceId,
            invoiceNumber: invoice.invoiceNumber,
            success: false,
            message: 'Failed to generate PDF'
          });
        }
      } catch (error) {
        results.push({
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          success: false,
          message: error instanceof Error ? error.message : 'Failed to fetch'
        });
      }

      setBulkDownloadProgress({
        current: i + 1,
        total: invoicesToDownload.length,
        results: [...results]
      });
    }

    // Generate and download ZIP if there are successful downloads
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      try {
        const content = await zip.generateAsync({ type: 'blob' });
        const dateStr = new Date().toISOString().split('T')[0];
        saveAs(content, `invoices-${dateStr}.zip`);
      } catch (error) {
        console.error('Failed to generate ZIP:', error);
      }
    }

    setInvoicesToDownload([]);
  };

  // Cancel download confirmation
  const handleCancelDownload = () => {
    setShowDownloadConfirmModal(false);
    setInvoicesToDownload([]);
  };

  // Close bulk download progress
  const handleCloseBulkDownload = () => {
    setIsBulkDownloading(false);
    setBulkDownloadProgress(null);
  };

  // Get validated invoices from selection (only ZATCA validationStatus "valid")
  const getValidatedSelectedInvoices = () => {
    return invoices.filter(invoice => {
      const invoiceId = invoice._id || invoice.id;
      const isSelected = selectedInvoices.includes(invoiceId!);
      const validationStatus = invoice.zatca?.validationStatus;
      const isValidated = validationStatus === 'valid';
      // Exclude invoices that are already sent/cleared/reported
      const isNotSent = invoice.status !== 'sent';
      const zatcaStatus = invoice.zatca?.status;
      const isNotCleared = zatcaStatus !== 'cleared' && zatcaStatus !== 'reported';
      return isSelected && isValidated && isNotSent && isNotCleared;
    });
  };

  const validatedSelectedCount = getValidatedSelectedInvoices().length;

  // Show submit to ZATCA confirmation modal
  const handleBulkSubmitClick = () => {
    const validatedInvoices = getValidatedSelectedInvoices();

    if (validatedInvoices.length === 0) {
      showAlert('No validated invoices selected for submission. Only invoices with ZATCA status "Validated" can be submitted.', 'warning');
      return;
    }

    setInvoicesToSubmit(validatedInvoices);
    setShowSubmitConfirmModal(true);
  };

  // Confirm and execute bulk submit to ZATCA
  const handleConfirmBulkSubmit = async () => {
    setShowSubmitConfirmModal(false);

    if (invoicesToSubmit.length === 0) return;

    setIsBulkSubmitting(true);
    setBulkSubmitProgress({
      current: 0,
      total: invoicesToSubmit.length,
      results: []
    });

    const results: Array<{
      invoiceId: string;
      invoiceNumber: string;
      success: boolean;
      message: string;
    }> = [];

    for (let i = 0; i < invoicesToSubmit.length; i++) {
      const invoice = invoicesToSubmit[i];
      const invoiceId = invoice._id || invoice.id!;

      try {
        const success = await InvoiceService.sendInvoice(invoiceId);
        results.push({
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          success,
          message: success ? 'Submitted successfully' : 'Failed to submit'
        });
      } catch (error) {
        results.push({
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          success: false,
          message: error instanceof Error ? error.message : 'Submit failed'
        });
      }

      setBulkSubmitProgress({
        current: i + 1,
        total: invoicesToSubmit.length,
        results: [...results]
      });
    }

    // Refresh invoices after bulk submit
    loadInvoices();
    setSelectedInvoices([]);
    setInvoicesToSubmit([]);
  };

  // Cancel submit confirmation
  const handleCancelSubmit = () => {
    setShowSubmitConfirmModal(false);
    setInvoicesToSubmit([]);
  };

  // Close bulk submit progress
  const handleCloseBulkSubmit = () => {
    setIsBulkSubmitting(false);
    setBulkSubmitProgress(null);
  };

  const handleSendInvoice = async (id: string) => {
    if (confirm('Are you sure you want to send this invoice?')) {
      const success = await InvoiceService.sendInvoice(id);
      if (success) {
        loadInvoices();
      }
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      const success = await InvoiceService.deleteInvoice(id);
      if (success) {
        loadInvoices(); 
      }
    }
  }; 

  const handleViewInvoice = (id: string) => {
    window.open(`/dashboard/sales/invoice/${id}`, '_blank');
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      // Call the new endpoint to regenerate PDF on-the-fly with correct VAT categories
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/invoices/${id}/download-pdf`,
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
      console.error('Error downloading invoice:', error);
      showAlert('Failed to download invoice PDF', 'error');
    }
  };

  const handleViewXml = (invoice: Invoice) => {
    if (!invoice.zatca?.signedXML) {
      showAlert('XML not available for this invoice.', 'warning');
      return;
    }

    try {
      // Decode Base64 XML
      const decodedXml = atob(invoice.zatca.signedXML);

      // Create a Blob with the XML content
      const blob = new Blob([decodedXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');

      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error viewing XML:', error);
      showAlert('Failed to decode XML', 'error');
    }
  };


  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage and track all your invoices</p>
        </div>
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => router.push('/dashboard/sales/create-invoice')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </button>
          )}
          {/* Bulk Actions - Show when invoices are selected */}
          {selectedInvoices.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600 font-medium">
                {selectedInvoices.length} selected:
              </span>

              {/* Validate Selected */}
              {permissions.canSend && (
                <button
                  onClick={handleBulkValidate}
                  disabled={isBulkValidating || pendingSelectedCount === 0}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={pendingSelectedCount === 0 ? 'No pending invoices' : `Validate ${pendingSelectedCount} pending invoice(s)`}
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  Validate
                  {pendingSelectedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                      {pendingSelectedCount}
                    </span>
                  )}
                </button>
              )}

              {/* Submit to ZATCA Selected */}
              {permissions.canSend && (
                <button
                  onClick={handleBulkSubmitClick}
                  disabled={isBulkSubmitting || validatedSelectedCount === 0}
                  className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={validatedSelectedCount === 0 ? 'No validated invoices' : `Submit ${validatedSelectedCount} validated invoice(s) to ZATCA`}
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  Submit to ZATCA
                  {validatedSelectedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                      {validatedSelectedCount}
                    </span>
                  )}
                </button>
              )}

              {/* Download Selected */}
              {permissions.canDownload && (
                <button
                  onClick={handleBulkDownloadClick}
                  disabled={isBulkDownloading || downloadSelectedCount === 0}
                  className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Download ${downloadSelectedCount} invoice(s) as ZIP`}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download
                  {downloadSelectedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                      {downloadSelectedCount}
                    </span>
                  )}
                </button>
              )}

              {/* Delete Selected */}
              {permissions.canDelete && (
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={isBulkDeleting || deletableSelectedCount === 0}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={deletableSelectedCount === 0 ? 'No deletable invoices (only drafts not cleared by ZATCA can be deleted)' : `Delete ${deletableSelectedCount} draft invoice(s)`}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                  {deletableSelectedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                      {deletableSelectedCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <InvoiceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        canCreate={permissions.canCreate}
      />

      {/* Invoice List */}
      <InvoiceList
        invoices={invoices}
        isLoading={isLoading}
        onValidateInvoice={permissions.canSend ? handleOpenValidationModal : undefined}
        onDeleteInvoice={permissions.canDelete ? handleDeleteInvoice : undefined}
        onViewInvoice={handleViewInvoice}
        onDownloadInvoice={permissions.canDownload ? handleDownloadInvoice : undefined}
        onViewXml={handleViewXml}
        onSendInvoice={permissions.canSend ? handleSendInvoice : undefined}
        permissions={permissions}
        selectedInvoices={selectedInvoices}
        onSelectionChange={setSelectedInvoices}
      />

      {/* Validation Modal */}
      <ValidationModal
        isOpen={validationModalOpen}
        onClose={handleCloseValidationModal}
        invoice={selectedInvoiceForValidation}
        isValidating={isValidating}
        validationResult={validationResult}
        onValidate={handleValidateInvoice}
        onSubmit={handleSubmitToZatca}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && invoicesToDelete.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancelDelete} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-red-50 rounded-t-xl">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  <p className="text-sm text-gray-500">
                    {invoicesToDelete.length} invoice(s) will be deleted
                  </p>
                </div>
              </div>

              {/* Content - Invoice List */}
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-3">
                  The following invoices will be permanently deleted:
                </p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {invoicesToDelete.map((invoice) => (
                    <div key={invoice._id || invoice.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {typeof invoice.customerId === 'object' ? invoice.customerId.customerName : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('en-SA', { style: 'currency', currency: invoice.currency || 'SAR' }).format(invoice.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString('en-SA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-amber-500 rounded-full"></span>
                  This action cannot be undone
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {invoicesToDelete.length} Invoice(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadConfirmModal && invoicesToDownload.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancelDownload} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-emerald-50 rounded-t-xl">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <FileArchive className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Download Invoices</h3>
                  <p className="text-sm text-gray-500">
                    {invoicesToDownload.length} invoice(s) will be downloaded as ZIP
                  </p>
                </div>
              </div>

              {/* Content - Invoice List */}
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-3">
                  The following invoices will be included in the ZIP file:
                </p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {invoicesToDownload.map((invoice) => {
                    const hasPdf = invoice.zatca?.pdfUrl || invoice.zatca?.status === 'cleared' || invoice.zatca?.status === 'reported';
                    return (
                      <div key={invoice._id || invoice.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">
                            {typeof invoice.customerId === 'object' ? invoice.customerId.customerName : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          {hasPdf ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              PDF Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                              No PDF
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Only invoices cleared by ZATCA will have PDF files in the ZIP
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={handleCancelDownload}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkDownload}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <FileArchive className="h-4 w-4" />
                  Download ZIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit to ZATCA Confirmation Modal */}
      {showSubmitConfirmModal && invoicesToSubmit.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancelSubmit} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-purple-50 rounded-t-xl">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Send className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Submit to ZATCA</h3>
                  <p className="text-sm text-gray-500">
                    {invoicesToSubmit.length} validated invoice(s) will be submitted
                  </p>
                </div>
              </div>

              {/* Content - Invoice List */}
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-3">
                  The following validated invoices will be submitted to ZATCA:
                </p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {invoicesToSubmit.map((invoice) => (
                    <div key={invoice._id || invoice.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {typeof invoice.customerId === 'object' ? invoice.customerId.customerName : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('en-SA', { style: 'currency', currency: invoice.currency || 'SAR' }).format(invoice.total)}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          Validated
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-amber-500 rounded-full"></span>
                  Invoices will be sent to ZATCA for clearance/reporting
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={handleCancelSubmit}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkSubmit}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit {invoicesToSubmit.length} Invoice(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Submit Progress Modal */}
      {isBulkSubmitting && bulkSubmitProgress && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Submitting to ZATCA</h3>
                  <p className="text-sm text-gray-500">Submitting {bulkSubmitProgress.total} invoice(s)</p>
                </div>
                {bulkSubmitProgress.current === bulkSubmitProgress.total && (
                  <button onClick={handleCloseBulkSubmit} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{bulkSubmitProgress.current} / {bulkSubmitProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkSubmitProgress.current / bulkSubmitProgress.total) * 100}%` }} />
                  </div>
                </div>
                {bulkSubmitProgress.current < bulkSubmitProgress.total && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin mr-2" />
                    <span className="text-gray-600">Submitting invoices to ZATCA...</span>
                  </div>
                )}
                {bulkSubmitProgress.results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {bulkSubmitProgress.results.map((result, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {result.success ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.invoiceNumber}</p>
                          <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {bulkSubmitProgress.current === bulkSubmitProgress.total && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Summary:</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" />{bulkSubmitProgress.results.filter(r => r.success).length} submitted</span>
                        <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" />{bulkSubmitProgress.results.filter(r => !r.success).length} failed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {bulkSubmitProgress.current === bulkSubmitProgress.total && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button onClick={handleCloseBulkSubmit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Validation Progress Modal */}
      {isBulkValidating && bulkValidationProgress && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bulk Validation</h3>
                  <p className="text-sm text-gray-500">Validating {bulkValidationProgress.total} invoice(s)</p>
                </div>
                {bulkValidationProgress.current === bulkValidationProgress.total && (
                  <button onClick={handleCloseBulkValidation} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{bulkValidationProgress.current} / {bulkValidationProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkValidationProgress.current / bulkValidationProgress.total) * 100}%` }} />
                  </div>
                </div>
                {bulkValidationProgress.current < bulkValidationProgress.total && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mr-2" />
                    <span className="text-gray-600">Validating invoices...</span>
                  </div>
                )}
                {bulkValidationProgress.results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {bulkValidationProgress.results.map((result, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {result.success ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.invoiceNumber}</p>
                          <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {bulkValidationProgress.current === bulkValidationProgress.total && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Summary:</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" />{bulkValidationProgress.results.filter(r => r.success).length} passed</span>
                        <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" />{bulkValidationProgress.results.filter(r => !r.success).length} failed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {bulkValidationProgress.current === bulkValidationProgress.total && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button onClick={handleCloseBulkValidation} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Progress Modal */}
      {isBulkDeleting && bulkDeleteProgress && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bulk Delete</h3>
                  <p className="text-sm text-gray-500">Deleting {bulkDeleteProgress.total} invoice(s)</p>
                </div>
                {bulkDeleteProgress.current === bulkDeleteProgress.total && (
                  <button onClick={handleCloseBulkDelete} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{bulkDeleteProgress.current} / {bulkDeleteProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkDeleteProgress.current / bulkDeleteProgress.total) * 100}%` }} />
                  </div>
                </div>
                {bulkDeleteProgress.current < bulkDeleteProgress.total && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-red-600 animate-spin mr-2" />
                    <span className="text-gray-600">Deleting invoices...</span>
                  </div>
                )}
                {bulkDeleteProgress.results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {bulkDeleteProgress.results.map((result, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {result.success ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.invoiceNumber}</p>
                          <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {bulkDeleteProgress.current === bulkDeleteProgress.total && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Summary:</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" />{bulkDeleteProgress.results.filter(r => r.success).length} deleted</span>
                        <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" />{bulkDeleteProgress.results.filter(r => !r.success).length} failed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {bulkDeleteProgress.current === bulkDeleteProgress.total && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button onClick={handleCloseBulkDelete} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Download Progress Modal */}
      {isBulkDownloading && bulkDownloadProgress && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bulk Download</h3>
                  <p className="text-sm text-gray-500">Downloading {bulkDownloadProgress.total} invoice(s)</p>
                </div>
                {bulkDownloadProgress.current === bulkDownloadProgress.total && (
                  <button onClick={handleCloseBulkDownload} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{bulkDownloadProgress.current} / {bulkDownloadProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkDownloadProgress.current / bulkDownloadProgress.total) * 100}%` }} />
                  </div>
                </div>
                {bulkDownloadProgress.current < bulkDownloadProgress.total && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-emerald-600 animate-spin mr-2" />
                    <span className="text-gray-600">Downloading invoices...</span>
                  </div>
                )}
                {bulkDownloadProgress.results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {bulkDownloadProgress.results.map((result, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {result.success ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.invoiceNumber}</p>
                          <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {bulkDownloadProgress.current === bulkDownloadProgress.total && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Summary:</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" />{bulkDownloadProgress.results.filter(r => r.success).length} downloaded</span>
                        <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" />{bulkDownloadProgress.results.filter(r => !r.success).length} failed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {bulkDownloadProgress.current === bulkDownloadProgress.total && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button onClick={handleCloseBulkDownload} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg border border-gray-200">
        {/* Mobile view */}
        <div className="flex flex-1 flex-col gap-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={filters.limit}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-md border border-gray-300 py-1.5 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-600">
              {pagination.total} total
            </p>
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-between">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="inline-flex items-center text-sm text-gray-600">
                Page {pagination.current} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Desktop view */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {pagination.total === 0 ? 0 : (pagination.current - 1) * pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(pagination.current * pagination.limit, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{pagination.total}</span>{' '}
              results
            </p>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={filters.limit}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-md border border-gray-300 py-1.5 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
          {pagination.pages > 1 && (
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.current - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pagination.current
                          ? 'z-10 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary shadow-md'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

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