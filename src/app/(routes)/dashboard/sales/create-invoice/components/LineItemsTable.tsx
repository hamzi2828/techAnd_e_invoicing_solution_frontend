import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Trash2, Info, PlusCircle } from 'lucide-react';
import { ProductAutocompleteSkeleton } from './LoadingSkeletons';
import AddExemptionReasonModal from './AddExemptionReasonModal';
import {
  VatCategoryCode,
  TaxExemptionReasonCode,
  VAT_CATEGORY_OPTIONS
} from '../types';

// Lazy load ProductAutocomplete - only loads when user adds line items
const ProductAutocomplete = dynamic(
  () => import('./ProductAutocomplete'),
  {
    loading: () => <ProductAutocompleteSkeleton />,
    ssr: false
  }
);

// Type definitions
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  vatCategoryCode?: VatCategoryCode;
  taxExemptionReasonCode?: TaxExemptionReasonCode;
  taxExemptionReasonText?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  taxRate: number;
  category: string;
}

interface LineItemsTableProps {
  lineItems: LineItem[];
  currency: string;
  onAddLineItem: (product?: Product) => void;
  onUpdateLineItem: (id: string, updates: Partial<LineItem>) => void;
  onRemoveLineItem: (id: string) => void;
  onProductSelect: (itemId: string, product: Product) => void;
  disabled?: boolean; // Disable the component when company is not onboarded
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lineItems,
  currency,
  onAddLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
  onProductSelect,
  disabled = false,
}) => {
  // State for exemption reason modal
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeVatCategory, setActiveVatCategory] = useState<VatCategoryCode>('Z');
  const [activeReasonCode, setActiveReasonCode] = useState<string | undefined>(undefined);

  // Handle VAT category change - auto-open modal for non-S categories
  const handleVatCategoryChange = (itemId: string, categoryCode: VatCategoryCode, currentItem: LineItem) => {
    const category = VAT_CATEGORY_OPTIONS.find(c => c.code === categoryCode);

    // Update the item with new VAT category and tax rate
    onUpdateLineItem(itemId, {
      vatCategoryCode: categoryCode,
      taxRate: category?.rate ?? 15,
      // Clear exemption reason when switching categories
      taxExemptionReasonCode: undefined,
      taxExemptionReasonText: undefined
    });

    // If non-S category, open modal to select reason
    if (categoryCode !== 'S') {
      setActiveItemId(itemId);
      setActiveVatCategory(categoryCode);
      setActiveReasonCode(undefined);
      setIsReasonModalOpen(true);
    }
  };

  // Handle opening modal to change/add reason (via + button)
  const handleOpenReasonModal = (itemId: string, vatCategoryCode: VatCategoryCode, currentReasonCode?: string) => {
    setActiveItemId(itemId);
    setActiveVatCategory(vatCategoryCode);
    setActiveReasonCode(currentReasonCode);
    setIsReasonModalOpen(true);
  };

  // Handle reason selection from modal
  const handleReasonSelect = (reasonCode: string, reasonText: string) => {
    if (activeItemId) {
      onUpdateLineItem(activeItemId, {
        taxExemptionReasonCode: reasonCode as TaxExemptionReasonCode,
        taxExemptionReasonText: reasonText
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Items</h3>
          <button
            onClick={() => onAddLineItem()}
            disabled={disabled}
            className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-600 hover:to-primary text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Item</span>
          </button>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
                Product
              </th>
              <th className="text-center px-2 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                Qty
              </th>
              <th className="text-right px-2 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                Price
              </th>
              <th className="text-center px-2 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                Discount %
              </th>
              <th className="text-center px-2 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                VAT Category
              </th>
              <th className="text-center px-2 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                Tax %
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                Total
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-gray-100 p-4 mb-4">
                      <Info className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium text-lg">No items added yet</p>
                    <p className="text-sm text-gray-500 mt-2">Click &quot;Add Item&quot; to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              lineItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150 group">
                    <td className="py-3 px-2 relative z-50">
                      <Suspense fallback={<ProductAutocompleteSkeleton />}>
                        <ProductAutocomplete
                          value={item.description}
                          onChange={(value) => onUpdateLineItem(item.id, { description: value })}
                          onProductSelect={(product) => onProductSelect(item.id, product)}
                          onManualEntry={(description) => onUpdateLineItem(item.id, { description, productId: undefined, unitPrice: 0, discount: 0, taxRate: 0 })}
                          placeholder="Search products or type custom..."
                          disabled={disabled}
                        />
                      </Suspense>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                        className={`w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center transition-all duration-200 hover:border-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        min="0"
                        step="1"
                        disabled={disabled}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right transition-all duration-200 hover:border-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          // Restrict between 0 and 100
                          const clampedValue = Math.min(Math.max(value, 0), 100);
                          onUpdateLineItem(item.id, { discount: clampedValue });
                        }}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center transition-all duration-200 hover:border-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0"
                        disabled={disabled}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <select
                          value={item.vatCategoryCode || 'S'}
                          onChange={(e) => handleVatCategoryChange(item.id, e.target.value as VatCategoryCode, item)}
                          className={`flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all duration-200 hover:border-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          title="ZATCA VAT Category"
                          disabled={disabled}
                        >
                          {VAT_CATEGORY_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.code} - {option.rate}%
                            </option>
                          ))}
                        </select>
                        {/* Show + button only for Z, E, O categories to change/add reason */}
                        {item.vatCategoryCode && ['Z', 'E', 'O'].includes(item.vatCategoryCode) && (
                          <button
                            type="button"
                            onClick={() => handleOpenReasonModal(item.id, item.vatCategoryCode!, item.taxExemptionReasonCode)}
                            className={`p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Select exemption reason"
                            disabled={disabled}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {/* Show selected reason text for Z, E, O categories */}
                      {item.vatCategoryCode && ['Z', 'E', 'O'].includes(item.vatCategoryCode) && (
                        <div
                          onClick={() => handleOpenReasonModal(item.id, item.vatCategoryCode!, item.taxExemptionReasonCode)}
                          className={`mt-1 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                            item.taxExemptionReasonCode
                              ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 border border-red-300 text-red-600 hover:bg-red-100'
                          }`}
                          title={item.taxExemptionReasonCode ? 'Click to change reason' : 'Click to select reason (Required)'}
                        >
                          {item.taxExemptionReasonText || item.taxExemptionReasonCode || 'Select reason (Required)'}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        // Always derive tax rate from VAT category
                        const vatCategory = VAT_CATEGORY_OPTIONS.find(c => c.code === (item.vatCategoryCode || 'S'));
                        const displayTaxRate = vatCategory?.rate ?? 15;
                        return (
                          <input
                            type="number"
                            value={displayTaxRate}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center bg-gray-50 text-gray-600 cursor-not-allowed"
                            title="Tax rate is determined by VAT Category"
                          />
                        );
                      })()}
                    </td>
                    <td className="py-3 px-6 text-right">
                      {(() => {
                        // Always derive tax rate from VAT category for calculation
                        const vatCategory = VAT_CATEGORY_OPTIONS.find(c => c.code === (item.vatCategoryCode || 'S'));
                        const taxRate = vatCategory?.rate ?? 15;
                        return (
                          <span className="font-semibold text-gray-900 text-lg">
                            {formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100) * (1 + taxRate / 100))}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onRemoveLineItem(item.id)}
                        disabled={disabled}
                        className={`opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all duration-200 p-1 rounded-lg hover:bg-red-50 ${disabled ? 'cursor-not-allowed hover:text-gray-400 hover:bg-transparent' : ''}`}
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  {/* Spacer row only after the last item */}
                  {index === lineItems.length - 1 && (
                    <tr style={{ height: '150px' }}>
                      <td colSpan={8} className="bg-gray-50/30"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Exemption Reason Modal */}
      <AddExemptionReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => {
          setIsReasonModalOpen(false);
          setActiveItemId(null);
        }}
        onSelect={handleReasonSelect}
        vatCategoryCode={activeVatCategory}
        currentReasonCode={activeReasonCode}
      />
    </div>
  );
};

export default LineItemsTable;