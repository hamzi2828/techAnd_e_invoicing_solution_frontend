'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Printer, Send, Edit3, Trash2, CheckCircle, X, CreditCard } from 'lucide-react';
import { CreditNoteService } from '../../services/creditNoteService';
import { CreditNote } from '../../types';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

export default function CreditNoteViewPage() {
  const params = useParams();
  const router = useRouter();
  const creditNoteId = params.id as string;

  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Alert modal state
  const { alert, showAlert, hideAlert } = useAlertModal();
  const [invoiceId, setInvoiceId] = useState('');

  // Load credit note data
  useEffect(() => {
    const loadCreditNote = async () => {
      if (!creditNoteId) return;

      setIsLoading(true);
      try {
        const data = await CreditNoteService.getCreditNoteById(creditNoteId);
        if (data) {
          setCreditNote(data);
        } else {
          setError('Credit note not found');
        }
      } catch (err) {
        console.error('Error loading credit note:', err);
        setError(err instanceof Error ? err.message : 'Failed to load credit note');
      } finally {
        setIsLoading(false);
      }
    };

    loadCreditNote();
  }, [creditNoteId]);

  const handleSend = async () => {
    if (!creditNote) return;

    setActionLoading('send');
    try {
      const success = await CreditNoteService.sendCreditNote(creditNote._id || creditNote.id!);
      if (success) {
        const updatedCreditNote = await CreditNoteService.getCreditNoteById(creditNoteId);
        if (updatedCreditNote) {
          setCreditNote(updatedCreditNote);
        }
      }
    } catch (error) {
      console.error('Error sending credit note:', error);
      showAlert('Failed to send credit note', 'error');
    } finally {
      setActionLoading(null);
      setShowActions(false);
    }
  };

  const handleApplyCreditNote = async () => {
    if (!creditNote || !invoiceId) return;

    setActionLoading('apply');
    try {
      const success = await CreditNoteService.applyCreditNote(creditNote._id || creditNote.id!, invoiceId);
      if (success) {
        const updatedCreditNote = await CreditNoteService.getCreditNoteById(creditNoteId);
        if (updatedCreditNote) {
          setCreditNote(updatedCreditNote);
        }
        setShowApplyModal(false);
        setInvoiceId('');
      }
    } catch (error) {
      console.error('Error applying credit note:', error);
      showAlert('Failed to apply credit note', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCreditNote = async () => {
    if (!creditNote) return;

    setActionLoading('delete');
    try {
      const success = await CreditNoteService.deleteCreditNote(creditNote._id || creditNote.id!);
      if (success) {
        router.push('/dashboard/sales/credit-notes');
      }
    } catch (error) {
      console.error('Error deleting credit note:', error);
      showAlert('Failed to delete credit note', 'error');
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!creditNote) return;
    if (creditNote.zatca?.pdfUrl) {
      const pdfDataUrl = `data:application/pdf;base64,${creditNote.zatca.pdfUrl}`;
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `credit-note-${creditNote.creditNoteNumber || creditNote.invoiceNumber || creditNoteId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showAlert('PDF not available for this credit note', 'warning');
    }
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
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

  const getReasonLabel = (reason: string | undefined) => {
    const labels: Record<string, string> = {
      return: 'Return',
      discount: 'Discount',
      correction: 'Correction',
      cancellation: 'Cancellation',
      other: 'Other'
    };
    return labels[reason || ''] || reason || 'N/A';
  };

  const getCustomerData = () => {
    if (!creditNote) return null;

    if (typeof creditNote.customerId === 'object') {
      return {
        name: creditNote.customerId.customerName || 'N/A',
        email: creditNote.customerId.contactInfo?.email || '',
        phone: creditNote.customerId.contactInfo?.phone || '',
        address: creditNote.customerId.address
      };
    }

    return null;
  };

  const getCompanyData = () => {
    if (!creditNote) return null;

    if (typeof creditNote.companyId === 'object') {
      return creditNote.companyId;
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

  if (error || !creditNote) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Credit note not found'}
          </h3>
          <p className="text-gray-500 mb-6">
            The credit note you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <button
            onClick={() => router.push('/dashboard/sales/credit-notes')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Credit Notes
          </button>
        </div>
      </div>
    );
  }

  const customer = getCustomerData();
  const company = getCompanyData();
  const canEdit = creditNote.status === 'draft';
  const canSend = creditNote.status === 'draft';
  const canApply = ['sent', 'viewed'].includes(creditNote.status) && creditNote.status !== 'applied';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar - No Print */}
      <div className="bg-white border-b border-gray-200 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard/sales/credit-notes')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Credit Notes
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
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>

              {(canEdit || canSend || canApply) && (
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

      {/* Credit Note Document */}
      <div className="max-w-5xl mx-auto p-4 print:p-0">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm print:shadow-none print:border-0">
          {/* Company Header */}
          <div className="flex justify-between items-start p-8 print:p-12 border-b border-gray-200">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">CREDIT NOTE</h1>
              <p className="text-green-600 text-lg font-semibold">#{creditNote.creditNoteNumber || creditNote.invoiceNumber}</p>
              <div className="mt-4 space-x-2">
                <span className={`
                  inline-block px-4 py-1.5 text-sm font-semibold rounded-full
                  ${creditNote.status === 'applied' ? 'bg-green-100 text-green-700' :
                    creditNote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    creditNote.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    creditNote.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }
                `}>
                  {creditNote.status.charAt(0).toUpperCase() + creditNote.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="text-right">
              {company ? (
                <>
                  <div className="text-2xl font-bold text-green-600 mb-1">{company.companyName}</div>
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
                  <div className="text-2xl font-bold text-green-600">Your Company</div>
                  <p className="text-gray-600">Company Address</p>
                </>
              )}
            </div>
          </div>

          {/* Credit Note Details */}
          <div className="grid grid-cols-2 gap-8 p-8 print:p-12">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Credit To:</h3>
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
                  <span className="text-gray-900 font-semibold">{formatDate(creditNote.issueDate || creditNote.invoiceDate)}</span>
                </div>
                {creditNote.dueDate && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600 font-medium">Valid Until:</span>
                    <span className="text-gray-900 font-semibold">{formatDate(creditNote.dueDate)}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Reason:</span>
                  <span className="text-gray-900 font-semibold">{getReasonLabel(creditNote.reason)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Currency:</span>
                  <span className="text-gray-900 font-semibold">{creditNote.currency}</span>
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
                  <th className="text-right py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider w-20">
                    Tax
                  </th>
                  <th className="text-right py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider w-32">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {creditNote.items?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4 text-gray-900">{item.description}</td>
                    <td className="py-4 text-center text-gray-900">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-900">
                      {formatCurrency(item.unitPrice, creditNote.currency)}
                    </td>
                    <td className="py-4 text-right text-gray-900">
                      {formatCurrency(item.taxAmount || 0, creditNote.currency)}
                    </td>
                    <td className="py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(calculateItemTotal(item), creditNote.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 print:px-12 pb-8">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(creditNote.subtotal, creditNote.currency)}</span>
                  </div>

                  {(creditNote.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="font-medium">
                        Discount ({creditNote.discountType === 'percentage' ? `${creditNote.discount}%` : 'Fixed'}):
                      </span>
                      <span className="font-semibold">
                        -{formatCurrency(
                          creditNote.discountType === 'percentage'
                            ? (creditNote.subtotal * (creditNote.discount ?? 0)) / 100
                            : (creditNote.discount ?? 0),
                          creditNote.currency
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Tax (VAT):</span>
                    <span className="font-semibold">{formatCurrency(creditNote.totalTax, creditNote.currency)}</span>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Credit Amount:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(creditNote.total, creditNote.currency)}
                      </span>
                    </div>
                  </div>

                  {creditNote.status === 'applied' && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Applied:</span>
                      <span className="font-semibold">{formatCurrency(creditNote.total, creditNote.currency)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(creditNote.reasonDescription || creditNote.notes || creditNote.termsAndConditions) && (
            <div className="border-t border-gray-200 px-8 print:px-12 py-6">
              {(creditNote.reasonDescription || creditNote.notes) && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Reason Description:</h4>
                  <p className="text-gray-700 text-sm">{creditNote.reasonDescription || creditNote.notes}</p>
                </div>
              )}
              {creditNote.termsAndConditions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Terms and Conditions:</h4>
                  <p className="text-gray-700 text-sm">{creditNote.termsAndConditions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions Dropdown Panel */}
      {showActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Credit Note Actions</h3>
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
                  onClick={() => router.push(`/dashboard/sales/credit-notes/edit/${creditNote._id || creditNote.id}`)}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="h-5 w-5" />
                  <span className="font-medium">Edit Credit Note</span>
                </button>
              )}

              {canSend && (
                <button
                  onClick={handleSend}
                  disabled={actionLoading === 'send'}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                  <span className="font-medium">{actionLoading === 'send' ? 'Sending...' : 'Send Credit Note'}</span>
                </button>
              )}

              {canApply && (
                <button
                  onClick={() => {
                    setShowActions(false);
                    setShowApplyModal(true);
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Apply to Invoice</span>
                </button>
              )}

              {creditNote.status === 'applied' && (
                <div className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-green-700 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Applied</span>
                </div>
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
                  <span className="font-medium">Delete Credit Note</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply to Invoice Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Apply Credit Note</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice ID</label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter invoice ID to apply credit"
                />
              </div>
              <p className="text-sm text-gray-500">
                Credit Amount: {formatCurrency(creditNote.total, creditNote.currency)}
              </p>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowApplyModal(false)}
                disabled={actionLoading === 'apply'}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCreditNote}
                disabled={actionLoading === 'apply' || !invoiceId}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'apply' ? 'Applying...' : 'Apply Credit'}
              </button>
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
                <h3 className="text-lg font-medium text-gray-900">Delete Credit Note</h3>
                <p className="text-sm text-gray-500">#{creditNote.creditNoteNumber || creditNote.invoiceNumber}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this credit note? This action cannot be undone.
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
                onClick={handleDeleteCreditNote}
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
