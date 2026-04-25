'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CreditNote, CreditNoteFilters as ICreditNoteFilters, CreditNoteStats as ICreditNoteStats } from './types';
import { CreditNoteService } from './services/creditNoteService';
import { ValidationModal } from './components';
import { ChevronLeft, ChevronRight, Plus, FileText, Eye, Edit, Send, Download, Trash2, Search, RefreshCw, TrendingDown, Clock, CheckCircle, RotateCcw, ShieldCheck, Loader2, X, XCircle, FileArchive } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Link from 'next/link';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

export default function CreditNotesPage() {
  const router = useRouter();
  const { user, hasPermission } = useCurrentUser();

  const permissions = {
    canCreate: !user?.createdBy || hasPermission('sales-create-invoice'),
    canView: !user?.createdBy || hasPermission('sales-view-all-invoices'),
    canEdit: !user?.createdBy || hasPermission('sales-edit-invoice'),
    canDelete: !user?.createdBy || hasPermission('sales-delete-invoice'),
    canSend: !user?.createdBy || hasPermission('sales-send-invoice'),
    canDownload: !user?.createdBy || hasPermission('sales-download-invoice'),
  };

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [stats, setStats] = useState<ICreditNoteStats>({
    totalCreditNotes: 0,
    draftCreditNotes: 0,
    sentCreditNotes: 0,
    paidCreditNotes: 0,
    overdueCreditNotes: 0,
    totalAmount: 0,
    totalOutstanding: 0,
    averageValue: 0
  });
  const [filters, setFilters] = useState<ICreditNoteFilters>({
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
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [selectedCreditNotes, setSelectedCreditNotes] = useState<string[]>([]);

  // Validation modal state
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedCreditNoteForValidation, setSelectedCreditNoteForValidation] = useState<CreditNote | null>(null);
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
      creditNoteId: string;
      creditNoteNumber: string;
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
      creditNoteId: string;
      creditNoteNumber: string;
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
      creditNoteId: string;
      creditNoteNumber: string;
      success: boolean;
      message: string;
    }>;
  } | null>(null);

  // Delete confirmation modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [creditNotesToDelete, setCreditNotesToDelete] = useState<CreditNote[]>([]);

  // Download confirmation modal state
  const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState(false);
  const [creditNotesToDownload, setCreditNotesToDownload] = useState<CreditNote[]>([]);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();

  const loadCreditNotes = useCallback(async () => {
    setIsLoading(true);
    setSelectedCreditNotes([]);
    try {
      const result = await CreditNoteService.getAllCreditNotes(filters);
      setCreditNotes(result.creditNotes);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading credit notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadStats = async () => {
    setIsStatsLoading(true);
    try {
      const statsData = await CreditNoteService.getCreditNoteStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    loadCreditNotes();
  }, [loadCreditNotes]);

  useEffect(() => {
    loadStats();
  }, []);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCreditNotes(creditNotes.map(cn => cn._id || cn.id!));
    } else {
      setSelectedCreditNotes([]);
    }
  };

  const handleSelectCreditNote = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCreditNotes(prev => [...prev, id]);
    } else {
      setSelectedCreditNotes(prev => prev.filter(cnId => cnId !== id));
    }
  };

  // Validation modal handlers
  const handleOpenValidationModal = (creditNote: CreditNote) => {
    setSelectedCreditNoteForValidation(creditNote);
    setValidationResult(null);
    setValidationModalOpen(true);
  };

  const handleCloseValidationModal = () => {
    setValidationModalOpen(false);
    setSelectedCreditNoteForValidation(null);
    setValidationResult(null);
    setIsValidating(false);
    setIsSubmitting(false);
  };

  const handleValidateCreditNote = async () => {
    if (!selectedCreditNoteForValidation) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const creditNoteId = selectedCreditNoteForValidation._id || selectedCreditNoteForValidation.id!;
      const result = await CreditNoteService.validateCreditNote(creditNoteId);

      setValidationResult({
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings
      });

      loadCreditNotes();
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

  const handleSubmitToZatca = async () => {
    if (!selectedCreditNoteForValidation) return;

    setIsSubmitting(true);

    try {
      const creditNoteId = selectedCreditNoteForValidation._id || selectedCreditNoteForValidation.id!;
      const result = await CreditNoteService.sendCreditNote(creditNoteId);

      if (result.success) {
        handleCloseValidationModal();
        loadCreditNotes();
        loadStats();
      } else {
        setValidationResult({
          isValid: false,
          errors: [result.message || 'Failed to submit credit note to ZATCA'],
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

  // Get pending credit notes from selection
  const getPendingSelectedCreditNotes = () => {
    return creditNotes.filter(cn => {
      const creditNoteId = cn._id || cn.id;
      const isSelected = selectedCreditNotes.includes(creditNoteId!);
      const isPending = !cn.zatca?.status || cn.zatca?.status === 'pending';
      const isNotSent = cn.status !== 'sent' && cn.status !== 'applied';
      return isSelected && isPending && isNotSent;
    });
  };

  const pendingSelectedCount = getPendingSelectedCreditNotes().length;

  // Bulk validate
  const handleBulkValidate = async () => {
    const pendingCreditNotes = getPendingSelectedCreditNotes();

    if (pendingCreditNotes.length === 0) {
      showAlert('No pending credit notes selected for validation. Only credit notes with ZATCA status "Pending" can be validated.', 'warning');
      return;
    }

    setIsBulkValidating(true);
    setBulkValidationProgress({
      current: 0,
      total: pendingCreditNotes.length,
      results: []
    });

    const results: Array<{
      creditNoteId: string;
      creditNoteNumber: string;
      success: boolean;
      message: string;
    }> = [];

    for (let i = 0; i < pendingCreditNotes.length; i++) {
      const creditNote = pendingCreditNotes[i];
      const creditNoteId = creditNote._id || creditNote.id!;
      const creditNoteNumber = creditNote.creditNoteNumber || creditNote.invoiceNumber || creditNoteId;

      try {
        const result = await CreditNoteService.validateCreditNote(creditNoteId);
        results.push({
          creditNoteId,
          creditNoteNumber,
          success: result.isValid,
          message: result.isValid ? 'Validated successfully' : (result.errors[0] || 'Validation failed')
        });
      } catch (error) {
        results.push({
          creditNoteId,
          creditNoteNumber,
          success: false,
          message: error instanceof Error ? error.message : 'Validation failed'
        });
      }

      setBulkValidationProgress({
        current: i + 1,
        total: pendingCreditNotes.length,
        results: [...results]
      });
    }

    loadCreditNotes();
    setSelectedCreditNotes([]);
  };

  const handleCloseBulkValidation = () => {
    setIsBulkValidating(false);
    setBulkValidationProgress(null);
  };

  // Get deletable credit notes
  const getDeletableSelectedCreditNotes = () => {
    return creditNotes.filter(cn => {
      const creditNoteId = cn._id || cn.id;
      const isSelected = selectedCreditNotes.includes(creditNoteId!);
      const isDraft = cn.status === 'draft';
      const zatcaStatus = cn.zatca?.status;
      const isCleared = zatcaStatus === 'cleared' || zatcaStatus === 'reported';
      return isSelected && isDraft && !isCleared;
    });
  };

  const deletableSelectedCount = getDeletableSelectedCreditNotes().length;

  // Get downloadable credit notes
  const getSelectedCreditNotesForDownload = () => {
    return creditNotes.filter(cn => {
      const creditNoteId = cn._id || cn.id;
      return selectedCreditNotes.includes(creditNoteId!);
    });
  };

  const downloadSelectedCount = getSelectedCreditNotesForDownload().length;

  // Bulk delete handlers
  const handleBulkDeleteClick = () => {
    const deletableCreditNotes = getDeletableSelectedCreditNotes();

    if (deletableCreditNotes.length === 0) {
      showAlert('No deletable credit notes selected. Only draft credit notes that are not cleared by ZATCA can be deleted.', 'warning');
      return;
    }

    setCreditNotesToDelete(deletableCreditNotes);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    setShowDeleteConfirmModal(false);

    if (creditNotesToDelete.length === 0) return;

    setIsBulkDeleting(true);
    setBulkDeleteProgress({
      current: 0,
      total: creditNotesToDelete.length,
      results: []
    });

    const results: Array<{
      creditNoteId: string;
      creditNoteNumber: string;
      success: boolean;
      message: string;
    }> = [];

    for (let i = 0; i < creditNotesToDelete.length; i++) {
      const creditNote = creditNotesToDelete[i];
      const creditNoteId = creditNote._id || creditNote.id!;
      const creditNoteNumber = creditNote.creditNoteNumber || creditNote.invoiceNumber || creditNoteId;

      try {
        const success = await CreditNoteService.deleteCreditNote(creditNoteId);
        results.push({
          creditNoteId,
          creditNoteNumber,
          success,
          message: success ? 'Deleted successfully' : 'Failed to delete'
        });
      } catch (error) {
        results.push({
          creditNoteId,
          creditNoteNumber,
          success: false,
          message: error instanceof Error ? error.message : 'Delete failed'
        });
      }

      setBulkDeleteProgress({
        current: i + 1,
        total: creditNotesToDelete.length,
        results: [...results]
      });
    }

    loadCreditNotes();
    loadStats();
    setSelectedCreditNotes([]);
    setCreditNotesToDelete([]);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setCreditNotesToDelete([]);
  };

  const handleCloseBulkDelete = () => {
    setIsBulkDeleting(false);
    setBulkDeleteProgress(null);
  };

  // Bulk download handlers
  const handleBulkDownloadClick = () => {
    const selectedForDownload = getSelectedCreditNotesForDownload();

    if (selectedForDownload.length === 0) {
      showAlert('No credit notes selected for download.', 'warning');
      return;
    }

    setCreditNotesToDownload(selectedForDownload);
    setShowDownloadConfirmModal(true);
  };

  const handleConfirmBulkDownload = async () => {
    setShowDownloadConfirmModal(false);

    if (creditNotesToDownload.length === 0) return;

    setIsBulkDownloading(true);
    setBulkDownloadProgress({
      current: 0,
      total: creditNotesToDownload.length,
      results: []
    });

    const zip = new JSZip();
    const results: Array<{
      creditNoteId: string;
      creditNoteNumber: string;
      success: boolean;
      message: string;
    }> = [];

    for (let i = 0; i < creditNotesToDownload.length; i++) {
      const creditNote = creditNotesToDownload[i];
      const creditNoteId = creditNote._id || creditNote.id!;
      const creditNoteNumber = creditNote.creditNoteNumber || creditNote.invoiceNumber || creditNoteId;

      try {
        const fullCreditNote = await CreditNoteService.getCreditNoteById(creditNoteId);

        if (fullCreditNote?.zatca?.pdfUrl) {
          const pdfData = fullCreditNote.zatca.pdfUrl;
          zip.file(`${creditNoteNumber}.pdf`, pdfData, { base64: true });

          results.push({
            creditNoteId,
            creditNoteNumber,
            success: true,
            message: 'Added to ZIP'
          });
        } else {
          results.push({
            creditNoteId,
            creditNoteNumber,
            success: false,
            message: 'PDF not available (not cleared by ZATCA)'
          });
        }
      } catch (error) {
        results.push({
          creditNoteId,
          creditNoteNumber,
          success: false,
          message: error instanceof Error ? error.message : 'Failed to fetch'
        });
      }

      setBulkDownloadProgress({
        current: i + 1,
        total: creditNotesToDownload.length,
        results: [...results]
      });
    }

    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      try {
        const content = await zip.generateAsync({ type: 'blob' });
        const dateStr = new Date().toISOString().split('T')[0];
        saveAs(content, `credit-notes-${dateStr}.zip`);
      } catch (error) {
        console.error('Failed to generate ZIP:', error);
      }
    }

    setCreditNotesToDownload([]);
  };

  const handleCancelDownload = () => {
    setShowDownloadConfirmModal(false);
    setCreditNotesToDownload([]);
  };

  const handleCloseBulkDownload = () => {
    setIsBulkDownloading(false);
    setBulkDownloadProgress(null);
  };

  // Individual actions
  const handleSendCreditNote = async (id: string) => {
    if (confirm('Are you sure you want to send this credit note?')) {
      const result = await CreditNoteService.sendCreditNote(id);
      if (result.success) {
        loadCreditNotes();
        loadStats();
      }
    }
  };

  const handleDeleteCreditNote = async (id: string) => {
    if (confirm('Are you sure you want to delete this credit note? This action cannot be undone.')) {
      const success = await CreditNoteService.deleteCreditNote(id);
      if (success) {
        loadCreditNotes();
        loadStats();
      }
    }
  };

  const handleViewCreditNote = (id: string) => {
    router.push(`/dashboard/sales/credit-notes/view/${id}`);
  };

  const handleDownloadCreditNote = async (id: string) => {
    try {
      const creditNote = await CreditNoteService.getCreditNoteById(id);
      if (!creditNote) {
        showAlert('Credit note not found', 'error');
        return;
      }
      if (creditNote.zatca?.pdfUrl) {
        const pdfDataUrl = `data:application/pdf;base64,${creditNote.zatca.pdfUrl}`;
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = `credit-note-${creditNote.creditNoteNumber || creditNote.invoiceNumber || id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showAlert('PDF not available for this credit note.', 'warning');
      }
    } catch (error) {
      console.error('Error downloading credit note:', error);
      showAlert('Failed to download credit note PDF', 'error');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Unknown</span>;
    const statusStyles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      viewed: 'bg-indigo-100 text-indigo-700',
      applied: 'bg-green-100 text-green-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getZatcaStatusBadge = (zatca: CreditNote['zatca']) => {
    const status = zatca?.status || 'pending';
    const validationStatus = zatca?.validationStatus;

    // If status is pending but validation passed, show "Validated"
    if (status === 'pending' && validationStatus === 'valid') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700">
          Validated
        </span>
      );
    }

    // If status is pending but validation failed, show "Invalid"
    if (status === 'pending' && validationStatus === 'invalid') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          Invalid
        </span>
      );
    }

    const statusStyles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      cleared: 'bg-green-100 text-green-700',
      reported: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      cleared: 'Cleared',
      reported: 'Reported',
      rejected: 'Rejected'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Notes</h1>
          <p className="text-gray-600">Manage credit notes for refunds and adjustments</p>
        </div>
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => router.push('/dashboard/sales/credit-notes/create')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-primary text-white rounded-lg text-sm font-medium hover:from-primary hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Credit Note
            </button>
          )}
          {/* Bulk Actions */}
          {selectedCreditNotes.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600 font-medium">
                {selectedCreditNotes.length} selected:
              </span>

              {/* Validate Selected */}
              {permissions.canSend && (
                <button
                  onClick={handleBulkValidate}
                  disabled={isBulkValidating || pendingSelectedCount === 0}
                  className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={pendingSelectedCount === 0 ? 'No pending credit notes' : `Validate ${pendingSelectedCount} pending credit note(s)`}
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

              {/* Download Selected */}
              {permissions.canDownload && (
                <button
                  onClick={handleBulkDownloadClick}
                  disabled={isBulkDownloading || downloadSelectedCount === 0}
                  className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Download ${downloadSelectedCount} credit note(s) as ZIP`}
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
                  title={deletableSelectedCount === 0 ? 'No deletable credit notes' : `Delete ${deletableSelectedCount} draft credit note(s)`}
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credit Notes</p>
              <p className="text-2xl font-bold text-gray-900">
                {isStatsLoading ? '...' : stats.totalCreditNotes}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">
                {isStatsLoading ? '...' : stats.draftCreditNotes}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applied</p>
              <p className="text-2xl font-bold text-green-600">
                {isStatsLoading ? '...' : stats.paidCreditNotes}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-purple-600">
                {isStatsLoading ? '...' : formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search credit notes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Applied</option>
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value, page: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Payment Status</option>
            <option value="unpaid">Pending</option>
            <option value="paid">Applied</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            onClick={() => { loadCreditNotes(); loadStats(); }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Credit Notes List */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="animate-pulse">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : creditNotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credit notes found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first credit note</p>
            {permissions.canCreate && (
              <Link
                href="/dashboard/sales/credit-notes/create"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-primary text-white rounded-lg hover:from-primary hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create Credit Note
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCreditNotes.length === creditNotes.length && creditNotes.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Note</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ZATCA</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditNotes.map((creditNote) => {
                  const creditNoteId = creditNote._id || creditNote.id!;
                  const isPending = !creditNote.zatca?.status || creditNote.zatca?.status === 'pending';
                  const isDraft = creditNote.status === 'draft';

                  return (
                    <tr key={creditNoteId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCreditNotes.includes(creditNoteId)}
                          onChange={(e) => handleSelectCreditNote(creditNoteId, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{creditNote.creditNoteNumber || creditNote.invoiceNumber}</div>
                          <div className="text-xs text-gray-500">{creditNote.items?.length || 0} items</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {typeof creditNote.customerId === 'object' ? creditNote.customerId.customerName : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {typeof creditNote.customerId === 'object' ? creditNote.customerId.contactInfo?.email || '' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(creditNote.issueDate || creditNote.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-purple-600">
                          -{formatCurrency(creditNote.total, creditNote.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(creditNote.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getZatcaStatusBadge(creditNote.zatca)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleViewCreditNote(creditNoteId)} className="text-gray-600 hover:text-gray-900" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          {permissions.canEdit && isDraft && (
                            <Link href={`/dashboard/sales/credit-notes/edit/${creditNoteId}`} className="text-gray-600 hover:text-gray-900" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          {permissions.canSend && isDraft && isPending && (
                            <button onClick={() => handleOpenValidationModal(creditNote)} className="text-purple-600 hover:text-purple-800" title="Validate & Send">
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.canSend && isDraft && !isPending && creditNote.zatca?.validationStatus === 'valid' && (
                            <button onClick={() => handleSendCreditNote(creditNoteId)} className="text-blue-600 hover:text-blue-800" title="Send">
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.canDownload && (
                            <button onClick={() => handleDownloadCreditNote(creditNoteId)} className="text-gray-600 hover:text-gray-900" title="Download">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.canDelete && isDraft && !creditNote.zatca?.status?.match(/cleared|reported/) && (
                            <button onClick={() => handleDeleteCreditNote(creditNoteId)} className="text-red-600 hover:text-red-800" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      <ValidationModal
        isOpen={validationModalOpen}
        onClose={handleCloseValidationModal}
        creditNote={selectedCreditNoteForValidation}
        isValidating={isValidating}
        validationResult={validationResult}
        onValidate={handleValidateCreditNote}
        onSubmit={handleSubmitToZatca}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && creditNotesToDelete.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancelDelete} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-red-50 rounded-t-xl">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  <p className="text-sm text-gray-500">{creditNotesToDelete.length} credit note(s) will be deleted</p>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-3">The following credit notes will be permanently deleted:</p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {creditNotesToDelete.map((cn) => (
                    <div key={cn._id || cn.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cn.creditNoteNumber || cn.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {typeof cn.customerId === 'object' ? cn.customerId.customerName : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">-{formatCurrency(cn.total, cn.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-amber-500 rounded-full"></span>
                  This action cannot be undone
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button onClick={handleCancelDelete} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmBulkDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete {creditNotesToDelete.length} Credit Note(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadConfirmModal && creditNotesToDownload.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancelDownload} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-emerald-50 rounded-t-xl">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <FileArchive className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Download Credit Notes</h3>
                  <p className="text-sm text-gray-500">{creditNotesToDownload.length} credit note(s) will be downloaded as ZIP</p>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-3">The following credit notes will be included in the ZIP file:</p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {creditNotesToDownload.map((cn) => {
                    const hasPdf = cn.zatca?.pdfUrl || cn.zatca?.status === 'cleared' || cn.zatca?.status === 'reported';
                    return (
                      <div key={cn._id || cn.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cn.creditNoteNumber || cn.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">
                            {typeof cn.customerId === 'object' ? cn.customerId.customerName : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          {hasPdf ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">PDF Ready</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">No PDF</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">Only credit notes cleared by ZATCA will have PDF files in the ZIP</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button onClick={handleCancelDownload} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmBulkDownload} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                  <FileArchive className="h-4 w-4" />
                  Download ZIP
                </button>
              </div>
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
                  <p className="text-sm text-gray-500">Validating {bulkValidationProgress.total} credit note(s)</p>
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
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkValidationProgress.current / bulkValidationProgress.total) * 100}%` }} />
                  </div>
                </div>
                {bulkValidationProgress.current < bulkValidationProgress.total && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin mr-2" />
                    <span className="text-gray-600">Validating credit notes...</span>
                  </div>
                )}
                {bulkValidationProgress.results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {bulkValidationProgress.results.map((result, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {result.success ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.creditNoteNumber}</p>
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
                  <p className="text-sm text-gray-500">Deleting {bulkDeleteProgress.total} credit note(s)</p>
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
                    <span className="text-gray-600">Deleting credit notes...</span>
                  </div>
                )}
                {bulkDeleteProgress.results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {bulkDeleteProgress.results.map((result, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {result.success ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.creditNoteNumber}</p>
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
                  <p className="text-sm text-gray-500">Downloading {bulkDownloadProgress.total} credit note(s)</p>
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
                    <span className="text-gray-600">Downloading credit notes...</span>
                  </div>
                )}
                {bulkDownloadProgress.results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {bulkDownloadProgress.results.map((result, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {result.success ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.creditNoteNumber}</p>
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
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg border border-gray-200">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.current - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.current * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) pageNum = i + 1;
                  else if (pagination.current <= 3) pageNum = i + 1;
                  else if (pagination.current >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                  else pageNum = pagination.current - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pagination.current
                          ? 'z-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-primary text-white'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
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
