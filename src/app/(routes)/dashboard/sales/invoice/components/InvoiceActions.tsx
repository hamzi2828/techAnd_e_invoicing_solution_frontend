import React, { useState } from 'react';
import { Edit3, Send, Download, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InvoiceActionsProps {
  invoice: {
    _id: string;
    status: string;
    invoiceNumber: string;
  };
  onStatusUpdate: (status: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onDownload: () => void;
  isLoading: boolean;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  onStatusUpdate,
  onDelete,
  onDownload,
  isLoading
}) => {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleStatusUpdate = async (status: string) => {
    setActionLoading(status);
    try {
      await onStatusUpdate(status);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await onDelete();
      router.push('/dashboard/sales/all-invoices');
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const canEdit = invoice.status === 'draft';
  const canSend = ['draft', 'viewed'].includes(invoice.status);
  const canMarkPaid = ['sent', 'viewed', 'overdue'].includes(invoice.status);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard/sales/all-invoices')}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Invoices</span>
          </button>

          {/* Edit Button */}
          {canEdit && (
            <button
              onClick={() => router.push(`/dashboard/sales/create-invoice?edit=${invoice._id}`)}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Invoice</span>
            </button>
          )}

          {/* Send Button */}
          {canSend && (
            <button
              onClick={() => handleStatusUpdate('sent')}
              disabled={isLoading || actionLoading === 'sent'}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Send className="h-4 w-4" />
              <span>{actionLoading === 'sent' ? 'Sending...' : 'Send Invoice'}</span>
            </button>
          )}

          {/* Mark as Paid Button */}
          {canMarkPaid && (
            <button
              onClick={() => handleStatusUpdate('paid')}
              disabled={isLoading || actionLoading === 'paid'}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{actionLoading === 'paid' ? 'Updating...' : 'Mark as Paid'}</span>
            </button>
          )}

          {/* Download PDF Button */}
          <button
            onClick={onDownload}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Invoice</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceActions;