import React from 'react';
import { AlertCircle } from 'lucide-react';

const DangerZone: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
      <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Account Deactivation</span>
          </div>
          <p className="text-sm text-red-700 mt-1 mb-3">
            Temporarily deactivate your account. This action can be reversed.
          </p>
          <button className="px-3 py-2 bg-white border border-red-300 text-red-700 rounded text-sm font-medium hover:bg-red-50">
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;