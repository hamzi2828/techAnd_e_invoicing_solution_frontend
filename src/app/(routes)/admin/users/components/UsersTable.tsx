'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Shield,
  MoreVertical,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { User } from '../types';

interface UsersTableProps {
  users: User[];
}

const statusConfig = {
  active: { label: 'Active', icon: UserCheck, color: 'bg-primary-100 text-primary-800' },
  inactive: { label: 'Inactive', icon: UserX, color: 'bg-gray-100 text-gray-600' },
  suspended: { label: 'Suspended', icon: AlertCircle, color: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' }
};

export default function UsersTable({ users }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, role, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="inline-flex items-center px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-10">
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Suspended</option>
                        <option>Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>All Roles</option>
                        <option>Super Admin</option>
                        <option>Admin</option>
                        <option>Invoice Manager</option>
                        <option>Accountant</option>
                        <option>Sales Rep</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>All Departments</option>
                        <option>IT</option>
                        <option>Finance</option>
                        <option>Sales</option>
                        <option>Accounting</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300">
                        Apply
                      </button>
                      <button className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => {
              const statusInfo = statusConfig[user.status];
              const StatusIcon = statusInfo.icon;
              
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role.color}`}>
                        {user.role.name}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">{user.department}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{user.lastLogin}</div>
                      <div className="text-xs text-gray-500">
                        Joined {user.createdAt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        title="View User Details"
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/admin/users/edit/${user.id}`}
                        title="Edit User"
                        className="text-gray-400 hover:text-primary transition-colors duration-150"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button 
                        title="Manage Permissions"
                        className="text-gray-400 hover:text-purple-600 transition-colors duration-150"
                      >
                        <Shield className="h-4 w-4" />
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 1 to {users.length} of 125 results
          </p>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150" disabled>
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button className="px-3 py-1 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-150">
              2
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-150">
              3
            </button>
            <span className="text-gray-600">...</span>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-150">
              25
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}