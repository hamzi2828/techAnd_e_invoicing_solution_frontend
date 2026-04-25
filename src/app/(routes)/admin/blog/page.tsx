'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import { BlogsTable, BlogStats } from './components';
import { Blog, BlogAction } from './types';
import { useBlogs } from './hooks';

export default function BlogPage() {
  const {
    blogs,
    stats,
    isLoading,
    error,
    actions: { handleBlogAction, refreshData }
  } = useBlogs();

  const onBlogAction = async (action: BlogAction, blog: Blog) => {
    if (action === 'view') {
      // Open blog in new tab
      window.open(`/blog/${blog.slug}`, '_blank');
      return;
    }

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
        return;
      }
    }

    const success = await handleBlogAction(action, blog);
    if (success) {
      // Action completed successfully
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Blogs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your blog posts and content
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/blog/add"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Blog
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <BlogStats
        totalBlogs={stats?.totalBlogs || 0}
        publishedBlogs={stats?.publishedBlogs || 0}
        totalViews={stats?.totalViews || 0}
        totalCategories={stats?.draftBlogs || 0}
      />

      {/* Loading State */}
      {isLoading && blogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      ) : (
        /* Blogs Table */
        <BlogsTable blogs={blogs} onBlogAction={onBlogAction} />
      )}
    </div>
  );
}
