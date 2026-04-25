import React from 'react';
import { Info } from 'lucide-react';

const SecurityNotice: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 rounded-lg p-6 border border-primary-200">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-gray-900 mb-1">Security Reminder</h3>
          <p className="text-sm text-gray-600">
            Changes to user role and status take effect immediately. Always verify changes before saving.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;