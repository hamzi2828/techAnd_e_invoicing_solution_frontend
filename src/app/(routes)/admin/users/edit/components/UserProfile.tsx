import React from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';
import { User } from '../../types';

interface UserProfileProps {
  user: User;
  userStatus: 'active' | 'inactive' | 'pending';
}

const UserProfile: React.FC<UserProfileProps> = ({ user, userStatus }) => {
  const getStatusIcon = () => {
    switch (userStatus) {
      case 'active': return UserCheck;
      case 'inactive': return UserX;
      default: return Clock;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h2>
      <div className="text-center">
        <div className="h-24 w-24 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-semibold">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </span>
        </div>
        <p className="font-medium text-gray-900 mb-1">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-gray-600 mb-2">{user.email}</p>
        <div className="flex items-center justify-center">
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            userStatus === 'active' 
              ? 'bg-primary-100 text-primary-800'
              : userStatus === 'inactive'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {React.createElement(getStatusIcon(), { className: 'h-3 w-3 mr-1' })}
            {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;