'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function SecurityNotice() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-gray-900 mb-1">Security Notice</h3>
          <p className="text-sm text-gray-600">
            Always follow the principle of least privilege. Only grant permissions that are necessary for the user&apos;s role.
          </p>
        </div>
      </div>
    </div>
  );
}
