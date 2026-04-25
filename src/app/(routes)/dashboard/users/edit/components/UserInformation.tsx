import React from 'react';
import { Mail, Phone, Building, Calendar, Clock } from 'lucide-react';
import { User } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface UserInformationProps {
  user: User;
}

const UserInformation: React.FC<UserInformationProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              {user.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              {user.phone}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
              <Building className="h-4 w-4 mr-2 text-gray-400" />
              {user.department}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {user.lastLogin}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInformation;