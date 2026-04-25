import React, { useState } from 'react';
import { Key, Shield, Eye, EyeOff } from 'lucide-react';

interface SecuritySettingsProps {
  onPasswordChange: (passwordData: {
    newPassword: string;
    confirmPassword: string;
  }) => Promise<boolean>;
  changingPassword?: boolean;
  twoFactorEnabled?: boolean;
  lastPasswordChange?: string;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ 
  onPasswordChange,
  changingPassword = false,
  twoFactorEnabled = false,
  lastPasswordChange = '30 days ago'
}) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordSubmit = async () => {
    const success = await onPasswordChange({
      newPassword,
      confirmPassword
    });
    
    if (success) {
      // Clear form and close
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center">
            <Key className="h-5 w-5 text-gray-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-600">Last changed {lastPasswordChange}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="text-primary hover:text-primary-700 font-medium"
          >
            Change Password
          </button>
        </div>

        {showPasswordChange && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={handlePasswordSubmit}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  onClick={() => setShowPasswordChange(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-medium mr-3 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button className="text-primary hover:text-primary-700 font-medium">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;