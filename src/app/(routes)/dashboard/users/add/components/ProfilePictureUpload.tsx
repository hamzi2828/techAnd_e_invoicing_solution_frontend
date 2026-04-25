'use client';

import React from 'react';
import { User, Upload } from 'lucide-react';

interface ProfilePictureUploadProps {
  onUpload: (file: File) => void;
}

export default function ProfilePictureUpload({ onUpload }: ProfilePictureUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
      <div className="text-center">
        <div className="h-24 w-24 bg-gradient-to-br from-primary-400 via-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-12 w-12 text-white" />
        </div>
        <label htmlFor="profile-upload" className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary hover:text-primary-700 cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </label>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG, or GIF. Max 2MB.
        </p>
      </div>
    </div>
  );
}
