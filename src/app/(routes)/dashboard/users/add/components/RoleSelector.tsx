'use client';

import React from 'react';
import { Shield, Check, AlertCircle } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

interface RoleSelectorProps {
  roles: Role[];
  selectedRole: string;
  customPermissions: boolean;
  onRoleSelect: (roleId: string) => void;
}

export default function RoleSelector({
  roles,
  selectedRole,
  customPermissions,
  onRoleSelect,
}: RoleSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Assignment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedRole === role.id
                ? 'border-primary bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100'
                : customPermissions
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => !customPermissions && onRoleSelect(role.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <Shield className={`h-5 w-5 ${
                selectedRole === role.id ? 'text-primary' : 'text-gray-400'
              }`} />
              {selectedRole === role.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <h3 className={`font-medium mb-1 ${
              customPermissions ? 'text-gray-400' : 'text-gray-900'
            }`}>
              {role.name}
            </h3>
            <p className={`text-xs ${
              customPermissions ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {role.description}
            </p>
          </div>
        ))}
      </div>

      {customPermissions && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Custom permissions are selected. Choose a role above to reset.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
