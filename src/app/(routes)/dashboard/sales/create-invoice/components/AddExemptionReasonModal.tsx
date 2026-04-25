import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { VatCategoryCode, TaxExemptionReasonCode, TAX_EXEMPTION_REASONS } from '../types';

interface CustomExemptionReason {
  id: string;
  code: string;
  label: string;
  applicableTo: VatCategoryCode[];
  createdAt: string;
}

interface AddExemptionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (reasonCode: string, reasonText: string) => void;
  vatCategoryCode: VatCategoryCode;
  currentReasonCode?: string;
}

const STORAGE_KEY = 'custom_tax_exemption_reasons';

// Get custom reasons from localStorage
export const getCustomExemptionReasons = (): CustomExemptionReason[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save custom reasons to localStorage
export const saveCustomExemptionReason = (reason: CustomExemptionReason): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomExemptionReasons();
    // Check if reason with same code already exists
    const filtered = existing.filter(r => r.code !== reason.code);
    filtered.push(reason);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save custom exemption reason:', error);
  }
};

const AddExemptionReasonModal: React.FC<AddExemptionReasonModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  vatCategoryCode,
  currentReasonCode
}) => {
  const [activeTab, setActiveTab] = useState<'select' | 'add'>('select');
  const [selectedReason, setSelectedReason] = useState<string>(currentReasonCode || '');
  const [customReasons, setCustomReasons] = useState<CustomExemptionReason[]>([]);

  // Add new reason form state
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [applicableTo, setApplicableTo] = useState<VatCategoryCode[]>([vatCategoryCode]);
  const [error, setError] = useState('');

  // Load custom reasons on mount
  useEffect(() => {
    setCustomReasons(getCustomExemptionReasons());
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason(currentReasonCode || '');
      setActiveTab('select');
      setCode('');
      setLabel('');
      setApplicableTo([vatCategoryCode]);
      setError('');
    }
  }, [isOpen, currentReasonCode, vatCategoryCode]);

  // Get predefined reasons for current VAT category
  const predefinedReasons = TAX_EXEMPTION_REASONS.filter(
    reason => reason.applicableTo.includes(vatCategoryCode)
  );

  // Get custom reasons for current VAT category
  const customReasonsFiltered = customReasons.filter(
    reason => reason.applicableTo.includes(vatCategoryCode)
  );

  const allReasons = [
    ...predefinedReasons.map(r => ({ ...r, isCustom: false })),
    ...customReasonsFiltered.map(r => ({ ...r, isCustom: true }))
  ];

  const handleSelectReason = () => {
    if (!selectedReason) {
      setError('Please select a reason');
      return;
    }

    const reason = allReasons.find(r => r.code === selectedReason);
    if (reason) {
      onSelect(reason.code, reason.label);
      onClose();
    }
  };

  const handleAddNewReason = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!code.trim()) {
      setError('Reason code is required');
      return;
    }
    if (!label.trim()) {
      setError('Reason description is required');
      return;
    }

    // Check if code already exists
    const existing = getCustomExemptionReasons();
    const predefinedExists = TAX_EXEMPTION_REASONS.some(
      r => r.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (predefinedExists || existing.some(r => r.code.toLowerCase() === code.trim().toLowerCase())) {
      setError('A reason with this code already exists');
      return;
    }

    const newReason: CustomExemptionReason = {
      id: `custom-${Date.now()}`,
      code: code.trim().toUpperCase(),
      label: label.trim(),
      applicableTo: [vatCategoryCode, ...applicableTo.filter(c => c !== vatCategoryCode)],
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    saveCustomExemptionReason(newReason);
    setCustomReasons(prev => [...prev, newReason]);

    // Select the new reason and close
    onSelect(newReason.code, newReason.label);
    onClose();
  };

  const getCategoryLabel = (cat: VatCategoryCode) => {
    switch (cat) {
      case 'Z': return 'Zero Rate (0%)';
      case 'E': return 'Exempt from VAT';
      case 'O': return 'Not Subject to VAT';
      default: return cat;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-blue-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tax Exemption Reason</h3>
            <p className="text-sm text-gray-500">
              Required for <span className="font-medium text-primary">{getCategoryLabel(vatCategoryCode)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('select')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'select'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Select Reason
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <Plus className="h-4 w-4" />
              Add New Reason
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'select' ? (
            <div className="p-4">
              {allReasons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No reasons available for this category.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-2 text-primary hover:underline"
                  >
                    Add a custom reason
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Predefined Reasons */}
                  {predefinedReasons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
                        ZATCA Standard Reasons
                      </p>
                      {predefinedReasons.map((reason) => (
                        <button
                          key={reason.code}
                          onClick={() => setSelectedReason(reason.code)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            selectedReason === reason.code
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedReason === reason.code
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {selectedReason === reason.code && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reason.label}
                            </p>
                            <p className="text-xs text-gray-500">{reason.code}</p>
                          </div>
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 ${
                            selectedReason === reason.code ? 'text-primary' : 'text-gray-400'
                          }`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom Reasons */}
                  {customReasonsFiltered.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
                        Custom Reasons
                      </p>
                      {customReasonsFiltered.map((reason) => (
                        <button
                          key={reason.code}
                          onClick={() => setSelectedReason(reason.code)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            selectedReason === reason.code
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedReason === reason.code
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {selectedReason === reason.code && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reason.label}
                            </p>
                            <p className="text-xs text-gray-500">{reason.code}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Custom
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddNewReason} className="p-6 space-y-4">
              {/* Reason Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., CUSTOM-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">A unique identifier for this reason</p>
              </div>

              {/* Reason Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Special exemption for specific goods"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Submit Button for Add Tab */}
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-primary transition-all shadow-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add & Select Reason
              </button>
            </form>
          )}
        </div>

        {/* Footer - Only for Select Tab */}
        {activeTab === 'select' && allReasons.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleSelectReason}
              disabled={!selectedReason}
              className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                selectedReason
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-600 hover:to-primary shadow-sm'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Check className="h-4 w-4" />
              Confirm Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExemptionReasonModal;
