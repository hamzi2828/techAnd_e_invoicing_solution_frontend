'use client';

import React, { useState } from 'react';
import {
  Plus,
  X,
  Save,
  User,
  Users,
  Eye,
  FileText,
  Twitter,
  Linkedin,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { AuthorsTable } from '../components';
import { BlogAuthor, AuthorAction } from '../types';
import { useBlogAuthors } from '../hooks';

export default function AuthorsPage() {
  const {
    authors,
    stats,
    isLoading,
    error,
    actions: { createAuthor, updateAuthor, handleAuthorAction, refreshData }
  } = useBlogAuthors();

  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<BlogAuthor | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    role: 'author' as BlogAuthor['role'],
    twitter: '',
    linkedin: '',
    website: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenModal = (author?: BlogAuthor) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        firstName: author.firstName,
        lastName: author.lastName,
        email: author.email,
        bio: author.bio,
        role: author.role,
        twitter: author.socialLinks.twitter || '',
        linkedin: author.socialLinks.linkedin || '',
        website: author.socialLinks.website || '',
      });
    } else {
      setEditingAuthor(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        role: 'author',
        twitter: '',
        linkedin: '',
        website: '',
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAuthor(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      bio: '',
      role: 'author',
      twitter: '',
      linkedin: '',
      website: '',
    });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const authorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bio: formData.bio,
        role: formData.role,
        socialLinks: {
          twitter: formData.twitter || undefined,
          linkedin: formData.linkedin || undefined,
          website: formData.website || undefined,
        },
      };

      if (editingAuthor) {
        await updateAuthor(editingAuthor.id, authorData);
      } else {
        await createAuthor({
          ...authorData,
          status: 'active',
        });
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save author');
    } finally {
      setIsSaving(false);
    }
  };

  const onAuthorAction = async (action: AuthorAction, author: BlogAuthor) => {
    if (action === 'view') {
      // View author details - could open a modal or navigate
      console.log('View author:', author.id);
      return;
    }

    if (action === 'delete') {
      if (author.blogCount > 0) {
        alert(`Cannot delete "${author.firstName} ${author.lastName}" because they have ${author.blogCount} blog posts. Please reassign or delete their posts first.`);
        return;
      }
      if (!window.confirm(`Are you sure you want to delete "${author.firstName} ${author.lastName}"?`)) {
        return;
      }
    }

    await handleAuthorAction(action, author);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Authors</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage authors who can write and publish blog posts
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
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Author
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Authors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalAuthors || authors.length}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Authors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.activeAuthors || authors.filter(a => a.status === 'active').length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalBlogs || authors.reduce((sum, auth) => sum + auth.blogCount, 0)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{(stats?.totalViews || authors.reduce((sum, auth) => sum + auth.totalViews, 0)).toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && authors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authors...</p>
        </div>
      ) : (
        /* Authors Table */
        <AuthorsTable
          authors={authors}
          onAuthorAction={onAuthorAction}
          onEditAuthor={handleOpenModal}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={handleCloseModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingAuthor ? 'Edit Author' : 'Add New Author'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {formError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="author@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as BlogAuthor['role'] })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="author">Author</option>
                      <option value="contributor">Contributor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Brief biography of the author"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Social Links</p>

                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Twitter profile URL"
                      />
                    </div>

                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="LinkedIn profile URL"
                      />
                    </div>

                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Personal website URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingAuthor ? 'Update Author' : 'Create Author'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
