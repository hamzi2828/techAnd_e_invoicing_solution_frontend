import React from 'react';
import { Edit, Save } from 'lucide-react';

interface ProfileHeaderProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave?: () => void;
  saving?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  isEditing, 
  onToggleEdit, 
  onSave,
  saving = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>
      <div className="flex space-x-3">
        {isEditing ? (
          <>
            <button 
              onClick={onToggleEdit}
              className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button 
            onClick={onToggleEdit}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;