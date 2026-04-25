import React from 'react';

interface RoleInformationFormProps {
  roleName: string;
  roleDescription: string;
  onRoleNameChange: (value: string) => void;
  onRoleDescriptionChange: (value: string) => void;
}

export const RoleInformationForm: React.FC<RoleInformationFormProps> = ({
  roleName,
  roleDescription,
  onRoleNameChange,
  onRoleDescriptionChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Name *
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => onRoleNameChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter role name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={roleDescription}
            onChange={(e) => onRoleDescriptionChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter role description"
          />
        </div>
      </div>
    </div>
  );
};
