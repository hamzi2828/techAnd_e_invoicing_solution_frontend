import React from 'react';
import { Crown, Shield, User as UserIcon, CheckCircle } from 'lucide-react';
import { Role } from '../../types';

interface RoleAssignmentProps {
  availableRoles: Role[];
  selectedRole: string;
  onRoleChange: (roleId: string) => void;
}

// Helper function to get role icon
const getRoleIcon = (roleName: string) => {
  const lowerName = roleName.toLowerCase();
  if (lowerName.includes('admin') || lowerName.includes('super')) return Crown;
  if (lowerName.includes('moderator') || lowerName.includes('manager')) return Shield;
  return UserIcon;
};

const RoleAssignment: React.FC<RoleAssignmentProps> = ({
  availableRoles,
  selectedRole,
  onRoleChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Assignment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableRoles.map((role) => {
          const RoleIcon = getRoleIcon(role.name);
          const roleIdentifier = role.id || role.name.toLowerCase();
          const isSelected = selectedRole === roleIdentifier;
          
          return (
            <div
              key={role.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onRoleChange(roleIdentifier)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <RoleIcon className={`h-5 w-5 mr-2 ${
                    isSelected ? 'text-primary' : 'text-gray-400'
                  }`} />
                </div>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <h3 className="font-medium mb-1 text-gray-900">
                {role.name}
              </h3>
              <p className="text-xs text-gray-600">
                {role.description || `${role.name} role with specific permissions`}
              </p>
              <div className={`mt-2 inline-flex px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                {role.name}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {role.userCount ? `${role.userCount} users` : '0 users'}
              </div>
            </div>
          );
        })}
      </div>
      {availableRoles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No roles available</p>
        </div>
      )}
    </div>
  );
};

export default RoleAssignment;