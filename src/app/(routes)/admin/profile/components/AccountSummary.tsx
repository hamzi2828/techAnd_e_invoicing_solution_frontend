import React from 'react';
import Image from 'next/image';
import { Crown, User } from 'lucide-react';

interface AccountSummaryProps {
  profile: {
    id: string;
    firstName?: string;
    lastName?: string;
    joinedDate: string;
    lastLogin: string;
    role: string;
  };
  avatar?: string | null;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ profile, avatar }) => {
  const [avatarLoadError, setAvatarLoadError] = React.useState(false);

  const handleAvatarError = () => {
    setAvatarLoadError(true);
  };

  const handleAvatarLoad = () => {
    setAvatarLoadError(false);
  };

  // Reset error state when avatar URL changes
  React.useEffect(() => {
    setAvatarLoadError(false);
  }, [avatar]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h2>
      
      {/* Avatar Display */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="h-32 w-32 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
            {avatar && avatar.trim() !== '' && !avatarLoadError ? (
              <Image
                src={avatar}
                alt="Profile Avatar"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                onError={handleAvatarError}
                onLoad={handleAvatarLoad}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center">
                {profile.firstName && profile.lastName ? (
                  <span className="text-white text-3xl font-semibold">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </span>
                ) : (
                  <User className="h-16 w-16 text-white" />
                )}
              </div>
            )}
          </div>
          {avatarLoadError && avatar && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded text-center whitespace-nowrap">
                Failed to load
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">User ID</span>
          <span className="text-sm font-medium text-gray-900">#{profile.id}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Joined</span>
          <span className="text-sm font-medium text-gray-900">{profile.joinedDate}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Last Login</span>
          <span className="text-sm font-medium text-gray-900">{profile.lastLogin}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">Role</span>
          <span className="text-sm font-medium text-purple-600 flex items-center">
            <Crown className="h-3 w-3 mr-1" />
            {profile.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;