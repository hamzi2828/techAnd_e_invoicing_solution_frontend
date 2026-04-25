'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Twitter,
  Linkedin,
  Globe,
} from 'lucide-react';
import { BlogAuthor, AuthorAction } from '../types';

interface AuthorsTableProps {
  authors: BlogAuthor[];
  onAuthorAction: (action: AuthorAction, author: BlogAuthor) => void;
  onEditAuthor: (author: BlogAuthor) => void;
}

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
  editor: { label: 'Editor', color: 'bg-blue-100 text-blue-800' },
  author: { label: 'Author', color: 'bg-green-100 text-green-800' },
  contributor: { label: 'Contributor', color: 'bg-gray-100 text-gray-800' },
};

export default function AuthorsTable({ authors, onAuthorAction, onEditAuthor }: AuthorsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const filteredAuthors = authors.filter(author =>
    `${author.firstName} ${author.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                placeholder="Search by name or email..."
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Author</option>
                        <option>Contributor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300">
                        Apply
                      </button>
                      <button
                        onClick={() => setShowFilterDropdown(false)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
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
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Views
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Social
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredAuthors.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No authors found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding a new author.
                  </p>
                </td>
              </tr>
            ) : (
              filteredAuthors.map((author) => {
                const roleInfo = roleConfig[author.role];

                return (
                  <tr key={author.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {author.avatar ? (
                            <img
                              src={author.avatar}
                              alt={`${author.firstName} ${author.lastName}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            getInitials(author.firstName, author.lastName)
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {author.firstName} {author.lastName}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {author.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <FileText className="h-4 w-4 mr-1 text-gray-400" />
                        {author.blogCount} posts
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Eye className="h-4 w-4 mr-1 text-gray-400" />
                        {author.totalViews.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {author.socialLinks.twitter && (
                          <a
                            href={author.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {author.socialLinks.linkedin && (
                          <a
                            href={author.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {author.socialLinks.website && (
                          <a
                            href={author.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                        {!author.socialLinks.twitter && !author.socialLinks.linkedin && !author.socialLinks.website && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={author.status === 'active'}
                          onChange={(e) => {
                            const action = e.target.checked ? 'activate' : 'deactivate';
                            onAuthorAction(action, author);
                          }}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {author.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(author.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditAuthor(author)}
                          title="Edit Author"
                          className="text-gray-400 hover:text-primary transition-colors duration-150"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onAuthorAction('delete', author)}
                          title="Delete Author"
                          className="text-gray-400 hover:text-red-600 transition-colors duration-150"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 1 to {filteredAuthors.length} of {authors.length} results
          </p>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150" disabled>
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button className="px-3 py-1 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium">
              1
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
