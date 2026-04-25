import React from 'react';
import { User } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface AccountDetailsProps {
  user: User;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Joined Date</span>
          <span className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Last Login</span>
          <span className="text-sm font-medium text-gray-900">{user.lastLogin}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Current Role</span>
          <span className="text-sm font-medium text-gray-900">{user.role.name}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">User ID</span>
          <span className="text-sm font-medium text-gray-900">#{user.id}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;