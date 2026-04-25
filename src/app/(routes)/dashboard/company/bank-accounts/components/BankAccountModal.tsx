import React from 'react';
import { X, Shield } from 'lucide-react';
import { BankAccount, BankAccountForm } from '../types';

interface Company {
  _id?: string;
  id?: string;
  companyName: string;
}

interface BankAccountModalProps {
  isOpen: boolean;
  editingAccount: BankAccount | null;
  formData: BankAccountForm;
  saudiBanks: { name: string; code: string }[];
  companies: Company[];
  loading?: boolean;
  submitting?: boolean;
  validationErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: keyof BankAccountForm, value: string) => void;
}

const BankAccountModal: React.FC<BankAccountModalProps> = ({
  isOpen,
  editingAccount,
  formData,
  saudiBanks,
  companies,
  loading = false,
  submitting = false,
  validationErrors = {},
  onClose,
  onSubmit,
  onInputChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary-200 shadow-2xl">
        <div className="px-6 py-4 border-b border-primary-200 bg-gradient-to-r from-white via-primary-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-primary via-blue-600 to-indigo-700 bg-clip-text text-transparent">
              {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                required
                value={formData.companyId}
                onChange={(e) => onInputChange('companyId', e.target.value)}
                disabled={loading || submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.companyId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company._id || company.id} value={company._id || company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
              {validationErrors.companyId && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.companyId}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={formData.accountName}
                onChange={(e) => onInputChange('accountName', e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.accountName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Company Main Account"
              />
              {validationErrors.accountName && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.accountName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <select
                required
                value={formData.bankName}
                onChange={(e) => onInputChange('bankName', e.target.value)}
                disabled={loading || submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.bankName ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Bank</option>
                {saudiBanks.map((bank) => (
                  <option key={bank.code} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
              {validationErrors.bankName && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.bankName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Code
              </label>
              <input
                type="text"
                value={formData.bankCode}
                onChange={(e) => onInputChange('bankCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
                placeholder="Auto-filled"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={formData.accountNumber}
                onChange={(e) => onInputChange('accountNumber', e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.accountNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter account number"
              />
              {validationErrors.accountNumber && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.accountNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IBAN *
              </label>
              <input
                type="text"
                required
                value={formData.iban}
                onChange={(e) => onInputChange('iban', e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.iban ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="SA00 0000 0000 0000 0000 0000"
              />
              {validationErrors.iban && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.iban}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name
              </label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => onInputChange('branchName', e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Branch name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Code
              </label>
              <input
                type="text"
                value={formData.branchCode}
                onChange={(e) => onInputChange('branchCode', e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.branchCode ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Branch code"
              />
              {validationErrors.branchCode && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.branchCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type *
              </label>
              <select
                required
                value={formData.accountType}
                onChange={(e) => onInputChange('accountType', e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.accountType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="business">Business Account</option>
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
                <option value="investment">Investment Account</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                required
                value={formData.currency}
                onChange={(e) => onInputChange('currency', e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.currency ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="p-2 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg mr-3">
                <Shield className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary-800">Security Notice</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Bank account information is encrypted and stored securely. Only authorized personnel can access this data.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{editingAccount ? 'Update Account' : 'Add Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountModal;