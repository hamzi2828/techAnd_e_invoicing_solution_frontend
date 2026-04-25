import React from 'react';
import { Eye, Edit, Send, Download, Trash2, FileText, ShieldCheck, Clock, XCircle, CheckCircle, Code } from 'lucide-react';
import { Invoice } from '../types';
import Link from 'next/link';

interface InvoicePermissions {
  canCreate?: boolean;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSend?: boolean;
  canDownload?: boolean;
}

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  onSendInvoice?: (id: string) => void;
  onValidateInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (id: string) => void;
  onViewInvoice: (id: string) => void;
  onDownloadInvoice?: (id: string) => void;
  onViewXml?: (invoice: Invoice) => void;
  permissions?: InvoicePermissions;
  selectedInvoices?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

const InvoiceListComponent: React.FC<InvoiceListProps> = ({
  invoices,
  isLoading,
  onSendInvoice,
  onValidateInvoice,
  onDeleteInvoice,
  onViewInvoice,
  onDownloadInvoice,
  onViewXml,
  permissions = {},
  selectedInvoices = [],
  onSelectionChange
}) => {
  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    const allIds = invoices.map(inv => inv._id || inv.id!);
    if (selectedInvoices.length === invoices.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  };

  const handleSelectOne = (id: string) => {
    if (!onSelectionChange) return;

    if (selectedInvoices.includes(id)) {
      onSelectionChange(selectedInvoices.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedInvoices, id]);
    }
  };

  const isAllSelected = invoices.length > 0 && selectedInvoices.length === invoices.length;
  const isSomeSelected = selectedInvoices.length > 0 && selectedInvoices.length < invoices.length;
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      viewed: 'bg-indigo-100 text-indigo-700',
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

  const getZatcaStatusBadge = (invoice: Invoice) => {
    // If invoice is already sent/cleared by ZATCA, show cleared status
    // Check multiple conditions: status === 'sent' with uuid, or zatca.status is 'cleared'/'reported'
    const zatcaStatus = invoice.zatca?.status;
    const isCleared = zatcaStatus === 'cleared' || zatcaStatus === 'reported';
    const hasSentWithUuid = invoice.status === 'sent' && invoice.zatca?.uuid;

    if (isCleared || hasSentWithUuid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" />
          {zatcaStatus === 'reported' ? 'Reported' : 'Cleared'}
        </span>
      );
    }

    // Check validation status
    const validationStatus = invoice.zatca?.validationStatus;

    if (validationStatus === 'valid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
          <CheckCircle className="h-3 w-3" />
          Validated
        </span>
      );
    }

    if (validationStatus === 'invalid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      );
    }

    // Default: pending/not validated
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };


  if (isLoading) {
    return (
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
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500 mb-6">
            {permissions.canCreate !== false
              ? 'Get started by creating your first invoice'
              : 'No invoices available'}
          </p>
          {permissions.canCreate !== false && (
            <Link
              href="/dashboard/sales/create-invoice"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Invoice
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Hash Chain Number">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ZATCA
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => {
              const invoiceId = invoice._id || invoice.id!;
              const isSelected = selectedInvoices.includes(invoiceId);
              return (
              <tr key={invoiceId} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(invoiceId)}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  {invoice.zatca?.hashChainNumber ? (
                    <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold" title="Hash Chain Number">
                      {invoice.zatca.hashChainNumber}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.items?.length || 0} items
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {typeof invoice.customerId === 'object' ? invoice.customerId.customerName : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {typeof invoice.customerId === 'object' ? invoice.customerId.contactInfo?.email || '' : ''}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.invoiceDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </div>
                    {invoice.paidAmount > 0 && (
                      <div className="text-xs text-gray-500">
                        Paid: {formatCurrency(invoice.paidAmount, invoice.currency)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getZatcaStatusBadge(invoice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewInvoice(invoice._id || invoice.id!)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      title="View Invoice"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {permissions.canEdit !== false && (
                      invoice.status === 'sent' ? (
                        <span
                          className="text-gray-300 cursor-not-allowed"
                          title="Cannot edit sent invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </span>
                      ) : (
                        <Link
                          href={`/dashboard/sales/edit-invoice/${invoice._id || invoice.id}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )
                    )}
                    {onValidateInvoice && invoice.status !== 'sent' && (
                      <button
                        onClick={() => onValidateInvoice(invoice)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="Validate & Submit to ZATCA"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    )}
                    {invoice.status === 'sent' && (
                      <span
                        className="text-green-500 cursor-default"
                        title="Already Sent to ZATCA"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    )}
                    {onSendInvoice && invoice.status !== 'sent' && (
                      <button
                        onClick={() => onSendInvoice(invoice._id || invoice.id!)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Send Invoice"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    {onDownloadInvoice && (
                      <button
                        onClick={() => onDownloadInvoice(invoice._id || invoice.id!)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    {onViewXml && invoice.zatca?.signedXML && (
                      <button
                        onClick={() => onViewXml(invoice)}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="View XML"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                    )}
                    {onDeleteInvoice && (
                      (() => {
                        const isDraft = invoice.status === 'draft';
                        const zatcaStatus = invoice.zatca?.status;
                        const isCleared = zatcaStatus === 'cleared' || zatcaStatus === 'reported';
                        const canDelete = isDraft && !isCleared;

                        return canDelete ? (
                          <button
                            onClick={() => onDeleteInvoice(invoice._id || invoice.id!)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span
                            className="text-gray-300 cursor-not-allowed"
                            title={isCleared ? "Cannot delete ZATCA cleared invoice" : "Only draft invoices can be deleted"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </span>
                        );
                      })()
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
  );
};

export default InvoiceListComponent;