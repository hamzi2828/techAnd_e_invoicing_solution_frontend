import React, { useRef } from 'react';
import { X, Download, Send, Printer } from 'lucide-react';
import { QuotationData, Customer } from '../types';

interface QuotationPreviewProps {
  isOpen: boolean;
  quotation: QuotationData | null;
  selectedCustomer: Customer | null;
  selectedCompany?: any;
  onClose: () => void;
  onSend?: () => void;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  isOpen,
  quotation,
  selectedCustomer,
  selectedCompany,
  onClose,
  onSend
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Quotation ${quotation.quoteNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { font-weight: 600; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .font-medium { font-weight: 500; }
                .border-t { border-top: 2px solid #ddd; }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quotation.currency || 'SAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Quotation Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div ref={printRef} className="max-w-3xl mx-auto bg-white">
            {/* Company Header */}
            <div className="mb-8 pb-6 border-b-2 border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h1>
                  <p className="font-semibold text-gray-800">{selectedCompany?.companyName || 'Your Company Name'}</p>
                  {selectedCompany?.address && (
                    <p className="text-sm text-gray-500">{selectedCompany.address}</p>
                  )}
                  {(selectedCompany?.city || selectedCompany?.country) && (
                    <p className="text-sm text-gray-500">
                      {[selectedCompany?.city, selectedCompany?.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {selectedCompany?.email && (
                    <p className="text-sm text-gray-500">{selectedCompany.email}</p>
                  )}
                  {selectedCompany?.phone && (
                    <p className="text-sm text-gray-500">{selectedCompany.phone}</p>
                  )}
                  {(selectedCompany?.vatNumber || selectedCompany?.taxIdNumber) && (
                    <p className="text-sm text-gray-500">VAT: {selectedCompany.vatNumber || selectedCompany.taxIdNumber}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Quotation Number</p>
                  <p className="text-lg font-semibold text-gray-900">{quotation.quoteNumber}</p>
                  <p className="text-sm text-gray-600 mt-2">Date</p>
                  <p className="text-sm text-gray-900">{formatDate(quotation.quoteDate)}</p>
                  <p className="text-sm text-gray-600 mt-2">Valid Until</p>
                  <p className="text-sm text-gray-900">{formatDate(quotation.validUntil)}</p>
                  {quotation.paymentTerms && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Payment Terms</p>
                      <p className="text-sm text-gray-900">{quotation.paymentTerms}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">QUOTATION TO:</h3>
              {selectedCustomer ? (
                <div>
                  <p className="font-medium text-gray-900">{selectedCustomer.companyName || selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.city}, {selectedCustomer.country}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  {selectedCustomer.taxNumber && (
                    <p className="text-sm text-gray-600">Tax ID: {selectedCustomer.taxNumber}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No customer selected</p>
              )}
            </div>

            {/* Line Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left text-sm font-semibold text-gray-700 pb-2">Description</th>
                    <th className="text-right text-sm font-semibold text-gray-700 pb-2">Qty</th>
                    <th className="text-right text-sm font-semibold text-gray-700 pb-2">Unit Price</th>
                    <th className="text-right text-sm font-semibold text-gray-700 pb-2">Tax</th>
                    <th className="text-right text-sm font-semibold text-gray-700 pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-sm text-gray-900 text-right">{item.taxRate}%</td>
                      <td className="py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(quotation.subtotal)}</span>
                </div>
                {quotation.totalDiscount > 0 && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900 font-medium">-{formatCurrency(quotation.totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(quotation.totalTax)}</span>
                </div>
                <div className="flex justify-between py-3 text-base border-t-2 border-gray-200">
                  <span className="text-gray-900 font-semibold">Grand Total:</span>
                  <span className="text-gray-900 font-bold text-lg">{formatCurrency(quotation.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Terms and Notes */}
            {(quotation.notes || quotation.termsAndConditions) && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                {quotation.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
                  </div>
                )}
                {quotation.termsAndConditions && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Terms and Conditions:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.termsAndConditions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button
            onClick={() => {
              if (onSend) {
                onSend();
                onClose();
              }
            }}
            disabled={!onSend}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Send to Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
