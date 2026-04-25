import React from 'react';
import { CreditCard, Plus, Trash2, Building2 } from 'lucide-react';
import type { BankAccount, BankingInformationFormProps } from '../../types';

const BankingInformationForm: React.FC<BankingInformationFormProps> = ({
  bankAccounts,
  onUpdateBankAccounts,
}) => {
  const addBankAccount = () => {
    const newAccount: BankAccount = {
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
      iban: '',
      swiftCode: '',
      currency: 'SAR',
      isPrimary: bankAccounts.length === 0,
    };
    onUpdateBankAccounts([...bankAccounts, newAccount]);
  };

  const removeBankAccount = (index: number) => {
    const updatedAccounts = bankAccounts.filter((_, i) => i !== index);
    if (updatedAccounts.length > 0 && bankAccounts[index].isPrimary) {
      updatedAccounts[0].isPrimary = true;
    }
    onUpdateBankAccounts(updatedAccounts);
  };

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string | boolean) => {
    const updatedAccounts = bankAccounts.map((account, i) => {
      if (i === index) {
        if (field === 'isPrimary' && value === true) {
          return { ...account, [field]: value };
        }
        return { ...account, [field]: value };
      } else if (field === 'isPrimary' && value === true) {
        return { ...account, isPrimary: false };
      }
      return account;
    });
    onUpdateBankAccounts(updatedAccounts);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Banking Information</h2>
        </div>
        <button
          onClick={addBankAccount}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Bank Account
        </button>
      </div>

      <div className="space-y-4">
        {bankAccounts.map((account, index) => (
          <div key={index} className="border rounded-lg p-4 relative">
            {bankAccounts.length > 1 && (
              <button
                onClick={() => removeBankAccount(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Bank Account {index + 1}
                {account.isPrimary && (
                  <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                    Primary
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <select
                  value={account.bankName}
                  onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Bank</option>
                  <option value="Saudi National Bank">Saudi National Bank</option>
                  <option value="Al Rajhi Bank">Al Rajhi Bank</option>
                  <option value="Riyad Bank">Riyad Bank</option>
                  <option value="Banque Saudi Fransi">Banque Saudi Fransi</option>
                  <option value="Saudi Investment Bank">Saudi Investment Bank</option>
                  <option value="Arab National Bank">Arab National Bank</option>
                  <option value="Bank AlBilad">Bank AlBilad</option>
                  <option value="Bank AlJazira">Bank AlJazira</option>
                  <option value="Alinma Bank">Alinma Bank</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={account.accountNumber}
                  onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={account.accountType}
                  onChange={(e) => updateBankAccount(index, 'accountType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="checking">Checking Account</option>
                  <option value="savings">Savings Account</option>
                  <option value="business">Business Account</option>
                  <option value="current">Current Account</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN *
                </label>
                <input
                  type="text"
                  value={account.iban}
                  onChange={(e) => updateBankAccount(index, 'iban', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SA00 0000 0000 0000 0000 0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT/BIC Code
                </label>
                <input
                  type="text"
                  value={account.swiftCode}
                  onChange={(e) => updateBankAccount(index, 'swiftCode', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter SWIFT code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={account.currency}
                  onChange={(e) => updateBankAccount(index, 'currency', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="SAR">Saudi Riyal (SAR)</option>
                  <option value="AED">UAE Dirham (AED)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div className="flex items-center md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={account.isPrimary}
                    onChange={(e) => updateBankAccount(index, 'isPrimary', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Set as Primary Account
                </label>
              </div>
            </div>
          </div>
        ))}

        {bankAccounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No bank accounts added yet.</p>
            <p className="text-xs mt-1">Click "Add Bank Account" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankingInformationForm;