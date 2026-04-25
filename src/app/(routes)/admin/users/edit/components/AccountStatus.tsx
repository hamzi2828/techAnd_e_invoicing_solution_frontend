import React from 'react';
import { Key, AlertCircle } from 'lucide-react';

interface AccountStatusProps {
  userStatus: 'active' | 'inactive' | 'pending';
  onStatusChange: (status: 'active' | 'inactive' | 'pending') => void;
  showResetPassword: boolean;
  onToggleResetPassword: () => void;
}

const AccountStatus: React.FC<AccountStatusProps> = ({
  userStatus,
  onStatusChange,
  showResetPassword,
  onToggleResetPassword,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">User Status</label>
          <select 
            value={userStatus}
            onChange={(e) => onStatusChange(e.target.value as 'active' | 'inactive' | 'pending')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onToggleResetPassword}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-red-700 border-red-300 hover:bg-red-50"
          >
            <Key className="h-4 w-4 mr-2" />
            Reset Password
          </button>
        </div>
      </div>
      
      {showResetPassword && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Reset Password</span>
          </div>
          <p className="text-sm text-red-700 mb-3">
            This will send a password reset link to the user&apos;s email address. The user will need to create a new password.
          </p>
          <div className="flex space-x-3">
            <button className="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
              Send Reset Link
            </button>
            <button 
              onClick={onToggleResetPassword}
              className="px-3 py-2 border rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStatus;