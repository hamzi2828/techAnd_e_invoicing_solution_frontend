import React from 'react';
import {
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Edit3,
  Trash2,
  Star,
  StarOff,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BankAccount } from '../types';

interface BankAccountCardProps {
  account: BankAccount;
  showAccountNumber: boolean;
  onToggleVisibility: (id: string) => void;
  onEdit: (account: BankAccount) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onCopyAccountNumber: (accountNumber: string) => void;
  onCopyIBAN: (iban: string) => void;
}

const BankAccountCard: React.FC<BankAccountCardProps> = ({
  account,
  showAccountNumber,
  onToggleVisibility,
  onEdit,
  onDelete,
  onSetDefault,
  onCopyAccountNumber,
  onCopyIBAN,
}) => {
  const maskAccountNumber = (accountNumber: string, show: boolean) => {
    if (show) return accountNumber;
    return accountNumber.slice(0, 4) + '*'.repeat(accountNumber.length - 8) + accountNumber.slice(-4);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
      inactive: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200',
      pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200',
      suspended: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getVerificationBadge = (status: string) => {
    const styles = {
      verified: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
      pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200',
      failed: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl border border-primary-200 overflow-hidden hover:shadow-xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        {/* Account Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
              <p className="text-sm text-primary-600 font-medium">{account.bankName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {account.isDefault && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 via-blue-100 to-indigo-100 text-primary-800 border border-primary-200 shadow-sm">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                Default
              </span>
            )}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3 bg-white/60 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Account Number</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-800">
                {maskAccountNumber(account.accountNumber, showAccountNumber)}
              </span>
              <button
                onClick={() => onToggleVisibility(account._id || account.id)}
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onCopyAccountNumber(account.accountNumber)}
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">IBAN</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-800">{account.iban}</span>
              <button
                onClick={() => onCopyIBAN(account.iban)}
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Branch</span>
            <span className="text-sm text-gray-800">{account.branchName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Currency</span>
            <span className="text-sm font-semibold text-primary-700">{account.currency}</span>
          </div>

          {account.balance !== undefined && (
            <div className="flex items-center justify-between pt-2 border-t border-primary-100">
              <span className="text-sm text-gray-600">Balance</span>
              <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {account.balance.toLocaleString()} {account.currency}
              </span>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-100">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(account.status)}`}>
              {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getVerificationBadge(account.verificationStatus)}`}>
              {account.verificationStatus === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
              {account.verificationStatus === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
              {account.verificationStatus === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
              {account.verificationStatus.charAt(0).toUpperCase() + account.verificationStatus.slice(1)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {!account.isDefault && (
              <button
                onClick={() => onSetDefault(account._id || account.id)}
                className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all"
                title="Set as default"
              >
                <StarOff className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(account)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit account"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(account._id || account.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete account"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountCard;
