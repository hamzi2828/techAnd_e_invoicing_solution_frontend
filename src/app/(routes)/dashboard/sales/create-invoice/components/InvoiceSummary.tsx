import React from 'react';

interface InvoiceSummaryProps {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  currency: string;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotal,
  totalDiscount,
  totalTax,
  grandTotal,
  currency,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{(subtotal || 0).toFixed(2)} {currency}</span>
        </div>
        {(totalDiscount || 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-red-600">-{(totalDiscount || 0).toFixed(2)} {currency}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (VAT)</span>
          <span className="font-medium">{(totalTax || 0).toFixed(2)} {currency}</span>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-indigo-700">{(grandTotal || 0).toFixed(2)} {currency}</span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default InvoiceSummary;