'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Users, Shield, Eye, MoreVertical } from 'lucide-react';
import { Role } from '../types';

interface RolesTableProps {
  roles: Role[];
}

export default function RolesTable({ roles }: RolesTableProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const router = useRouter();

  const toggleRoleSelection = (id: string) => {
    setSelectedRoles(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map(r => r.id));
    }
  };

  const handleEditRole = (roleId: string) => {
    router.push(`/dashboard/users/addRole?edit=${roleId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedRoles.length === roles.length}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
      
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleRoleSelection(role.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {role.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{role.description}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">{role.userCount}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      title="View Role Details"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      title="Edit Role"
                      onClick={() => handleEditRole(role.id)}
                      className="text-gray-400 hover:text-primary transition-colors duration-150"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <button 
                        title="More Actions"
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}