'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  Archive,
  Tag,
} from 'lucide-react';
import { Blog, BlogAction } from '../types';

interface BlogsTableProps {
  blogs: Blog[];
  onBlogAction: (action: BlogAction, blog: Blog) => void;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-800' },
};

export default function BlogsTable({ blogs, onBlogAction }: BlogsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                placeholder="Search by title, category, or author..."
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
                        <option>Draft</option>
                        <option>Published</option>
                        <option>Scheduled</option>
                        <option>Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>All Categories</option>
                        <option>Technology</option>
                        <option>Business</option>
                        <option>E-Invoicing</option>
                        <option>Updates</option>
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
                Blog Post
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new blog post.
                  </p>
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => {
                const statusInfo = statusConfig[blog.status];

                return (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {blog.featuredImage ? (
                            <Image
                              src={blog.featuredImage}
                              alt={blog.title}
                              width={64}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{blog.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Tag className="h-3 w-3 mr-1" />
                        {blog.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium text-xs">
                          {blog.author.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{blog.author.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Eye className="h-4 w-4 mr-1 text-gray-400" />
                        {blog.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(blog.publishedAt || blog.createdAt)}
                        </div>
                        {blog.status === 'scheduled' && blog.scheduledAt && (
                          <div className="flex items-center text-xs text-blue-600 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled: {formatDate(blog.scheduledAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onBlogAction('view', blog)}
                          title="View Blog"
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/blog/edit/${blog.id}`}
                          title="Edit Blog"
                          className="text-gray-400 hover:text-primary transition-colors duration-150"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === blog.id ? null : blog.id)}
                            title="More Actions"
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openDropdownId === blog.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                              <div className="py-1">
                                {blog.status === 'draft' && (
                                  <button
                                    onClick={() => {
                                      onBlogAction('publish', blog);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Publish
                                  </button>
                                )}
                                {blog.status === 'published' && (
                                  <button
                                    onClick={() => {
                                      onBlogAction('unpublish', blog);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    onBlogAction('archive', blog);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </button>
                                <button
                                  onClick={() => {
                                    onBlogAction('delete', blog);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
            Showing 1 to {filteredBlogs.length} of {blogs.length} results
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
