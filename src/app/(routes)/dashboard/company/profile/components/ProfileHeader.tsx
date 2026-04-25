import React from 'react';
import { Edit3, Save, X, Loader2 } from 'lucide-react';

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isEditing,
  onEditToggle,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-600">Manage your company information and settings</p>
      </div>
      {isEditing ? (
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="text-sm font-medium">Cancel</span>
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={onEditToggle}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
          <span className="text-sm font-medium">Edit Profile</span>
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;