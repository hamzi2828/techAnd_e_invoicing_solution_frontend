import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

export const BestPracticesGuide: React.FC = () => {
  const practices = [
    "Use descriptive role names that clearly indicate the role's purpose",
    "Follow the principle of least privilege - grant only necessary permissions",
    "Align permissions with Sidebar navigation sections for clarity",
    "Test roles thoroughly before assigning them to users",
  ];

  return (
    <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 rounded-lg shadow-sm border border-primary-200 p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-white" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-semibold text-gray-900 mb-3">Best Practices</h3>
          <ul className="space-y-2">
            {practices.map((practice, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
