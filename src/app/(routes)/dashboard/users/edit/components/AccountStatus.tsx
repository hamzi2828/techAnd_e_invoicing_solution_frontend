import React, { useState } from 'react';
import { Key, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface AccountStatusProps {
  userStatus: 'active' | 'inactive' | 'pending';
  onStatusChange: (status: 'active' | 'inactive' | 'pending') => void;
  showResetPassword: boolean;
  onToggleResetPassword: () => void;
  onUpdatePassword?: (newPassword: string) => void;
}

const AccountStatus: React.FC<AccountStatusProps> = ({
  userStatus,
  onStatusChange,
  showResetPassword,
  onToggleResetPassword,
  onUpdatePassword,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = () => {
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setPasswordError('');
    onUpdatePassword?.(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };
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

      {/* Direct Password Update */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center mb-3">
          <Lock className="h-5 w-5 text-gray-600 mr-2" />
          <span className="font-medium text-gray-800">Update Password Directly</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        {passwordError && (
          <p className="text-sm text-red-600 mb-3">{passwordError}</p>
        )}
        <button
          onClick={handleUpdatePassword}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default AccountStatus;