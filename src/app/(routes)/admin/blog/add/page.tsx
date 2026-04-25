'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  X,
  Calendar,
  Tag,
  FileText,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { BlogCategoryService } from '../services/blogCategoryService';
import { BlogAuthorService } from '../services/blogAuthorService';
import { BlogService } from '../services/blogService';
import { RichTextEditor } from '../components';

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  authorId: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featuredImage: string | null;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AddBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    authorId: '',
    status: 'draft',
    scheduledAt: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    featuredImage: null,
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Authors state
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await BlogCategoryService.getCategories({ status: 'active' });
        if (response.categories) {
          setCategories(response.categories.map((cat: any) => ({
            id: cat._id || cat.id,
            name: cat.name,
            slug: cat.slug,
            status: cat.status,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch authors on component mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setIsLoadingAuthors(true);
        const response = await BlogAuthorService.getActiveAuthors();
        if (response) {
          setAuthors(response.map((author: any) => ({
            id: author._id || author.id,
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch authors:', error);
      } finally {
        setIsLoadingAuthors(false);
      }
    };

    fetchAuthors();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.slug.trim()) return 'Slug is required';
    if (!formData.excerpt.trim()) return 'Excerpt is required';
    if (!formData.content.trim()) return 'Content is required';
    if (!formData.categoryId) return 'Please select a category';
    if (!formData.authorId) return 'Please select an author';
    if (formData.status === 'scheduled' && !formData.scheduledAt) {
      return 'Please set a schedule date for scheduled posts';
    }
    return null;
  };

  const handleSubmit = async (status: 'draft' | 'published' | 'scheduled') => {
    setError(null);
    setSuccess(null);

    // Update status in form data
    const submitData = { ...formData, status };

    // Validate
    const validationError = validateForm();
    if (validationError && status !== 'draft') {
      setError(validationError);
      return;
    }

    // For draft, only require title and content
    if (status === 'draft') {
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.content.trim()) {
        setError('Content is required');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const blogData = {
        title: submitData.title,
        excerpt: submitData.excerpt || undefined,
        content: submitData.content,
        category: submitData.categoryId,
        author: submitData.authorId,
        tags: submitData.tags,
        status: submitData.status,
        scheduledAt: submitData.status === 'scheduled' ? submitData.scheduledAt : null,
        metaTitle: submitData.metaTitle || undefined,
        metaDescription: submitData.metaDescription || undefined,
        featuredImage: submitData.featuredImage || undefined,
        isFeatured: submitData.isFeatured,
      };

      await BlogService.createBlog(blogData);

      setSuccess(status === 'published'
        ? 'Blog published successfully!'
        : status === 'scheduled'
          ? 'Blog scheduled successfully!'
          : 'Draft saved successfully!');

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/blog');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = () => {
    const status = formData.status === 'scheduled' ? 'scheduled' : 'published';
    handleSubmit(status);
  };

  const handleSaveDraft = () => {
    handleSubmit('draft');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/blog"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Blog Post</h1>
            <p className="text-sm text-gray-600 mt-1">Create a new blog post for your website</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {formData.status === 'scheduled' ? 'Schedule' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter blog title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">/blog/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    placeholder="blog-post-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt *
                </label>
                <textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Brief summary of the blog post (shown in listings)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/160 characters recommended
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your blog content here..."
              />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SEO title (leave empty to use post title)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 characters recommended
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="SEO description (leave empty to use excerpt)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 characters recommended
                </p>
              </div>

              {/* SEO Preview */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <p className="text-xs text-gray-500 mb-2">Search Engine Preview</p>
                <div className="space-y-1">
                  <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {formData.metaTitle || formData.title || 'Blog Post Title'}
                  </p>
                  <p className="text-green-700 text-sm">
                    yoursite.com/blog/{formData.slug || 'blog-post-slug'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {formData.metaDescription || formData.excerpt || 'Blog post description will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as FormData['status'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Date & Time *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                </label>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category *</h2>
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {!isLoadingCategories && categories.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                No categories found. Please create a category first.
              </p>
            )}
            <Link
              href="/admin/blog/categories"
              className="inline-flex items-center text-sm text-primary hover:text-primary-700 mt-2"
            >
              + Add new category
            </Link>
          </div>

          {/* Author */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Author *</h2>
            {isLoadingAuthors ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-gray-500">Loading authors...</span>
              </div>
            ) : (
              <select
                required
                value={formData.authorId}
                onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select an author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.firstName} {author.lastName}
                  </option>
                ))}
              </select>
            )}
            {!isLoadingAuthors && authors.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                No authors found. Please create an author first.
              </p>
            )}
            <Link
              href="/admin/blog/authors"
              className="inline-flex items-center text-sm text-primary hover:text-primary-700 mt-2"
            >
              + Add new author
            </Link>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h2>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById('featured-image-input')?.click()}
            >
              {formData.featuredImage ? (
                <div className="relative">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, featuredImage: null });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 2MB
                  </p>
                </>
              )}
              <input
                id="featured-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, featuredImage: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Tag className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-primary hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {formData.tags.length === 0 && (
                <p className="text-sm text-gray-500">No tags added yet</p>
              )}
            </div>
          </div>

          {/* Writing Tips */}
          <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-lg p-6 border border-primary-200">
            <div className="flex items-center mb-3">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Writing Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                Use clear, descriptive headlines
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                Keep paragraphs short and scannable
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                Include relevant images and media
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                Add meta descriptions for SEO
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
