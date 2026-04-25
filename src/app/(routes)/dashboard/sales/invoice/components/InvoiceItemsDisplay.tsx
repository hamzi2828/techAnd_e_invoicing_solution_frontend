import React from 'react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  totalPrice?: number;
  taxAmount?: number;
}

interface InvoiceItemsDisplayProps {
  items: InvoiceItem[];
  currency: string;
  subtotal: number;
  totalTax: number;
  total: number;
  discount?: number;
  discountType?: string;
}

const InvoiceItemsDisplay: React.FC<InvoiceItemsDisplayProps> = ({
  items,
  currency,
  subtotal,
  totalTax,
  total,
  discount = 0,
  discountType = 'percentage'
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const baseAmount = item.quantity * item.unitPrice;
    const taxAmount = baseAmount * ((item.taxRate || 0) / 100);
    return baseAmount + taxAmount;
  };

  const discountAmount = discountType === 'percentage'
    ? (subtotal * discount) / 100
    : discount;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Invoice Items</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                Qty
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                Unit Price
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                Tax %
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-6 py-4 text-gray-900">
                  {item.description}
                </td>
                <td className="px-4 py-4 text-center text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-4 py-4 text-right text-gray-900">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-4 text-center text-gray-900">
                  {item.taxRate || 0}%
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  {formatCurrency(calculateItemTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Summary */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-200">
        <div className="max-w-sm ml-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-red-600">
              <span>
                Discount ({discountType === 'percentage' ? `${discount}%` : formatCurrency(discount)}):
              </span>
              <span className="font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium text-gray-900">{formatCurrency(totalTax)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-300 pt-3">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-indigo-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItemsDisplay;