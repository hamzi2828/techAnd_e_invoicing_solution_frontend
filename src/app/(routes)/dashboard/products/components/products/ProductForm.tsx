import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package,
  DollarSign,
  Tag,
  FileText,
  Settings,
  Plus,
  X,
  Upload,
  AlertCircle
} from 'lucide-react';
import { ProductFormData, Category, Subcategory } from '../../types';
import CategoryService from '../../categories/services/categoryService';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = 'Save Product'
}) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    category: '',
    subcategory: '',
    price: 0,
    costPrice: 0,
    unit: 'piece',
    taxRate: 15,
    stock: 0,
    status: 'active',
    tags: [],
    barcode: '',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    images: [],
    attributes: [],
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [newTag, setNewTag] = useState('');
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Package },
    { id: 'pricing', name: 'Pricing & Tax', icon: DollarSign },
    { id: 'inventory', name: 'Inventory', icon: Tag },
    { id: 'details', name: 'Details', icon: FileText },
    { id: 'advanced', name: 'Advanced', icon: Settings }
  ];

  // Load categories and subcategories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await CategoryService.getCategories();
        setCategories(result.categories);
        setSubcategories(result.subcategories);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const filtered = subcategories.filter(sub => sub.parentId === formData.category);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category, subcategories]);

  const updateForm = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateForm('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateForm('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      updateForm('attributes', [...formData.attributes, { ...newAttribute }]);
      setNewAttribute({ name: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    updateForm('attributes', formData.attributes.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateForm('images', [...formData.images, ...files]);
  };

  const removeImage = (index: number) => {
    updateForm('images', formData.images.filter((_, i) => i !== index));
  };

  const validateStep = (step: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'basic') {
      if (!formData.name.trim()) newErrors.name = 'Product name is required';
      if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
      if (!formData.category) newErrors.category = 'Category is required';
    }

    if (step === 'pricing') {
      if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    }

    if (step === 'inventory') {
      if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentTab)) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set(prev).add(currentTab));

      const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
      if (currentIndex < tabs.length - 1) {
        setCurrentTab(tabs[currentIndex + 1].id);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const currentStepIndex = tabs.findIndex(tab => tab.id === currentTab);
  const progress = ((currentStepIndex + 1) / tabs.length) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStepIndex + 1} of {tabs.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab, index) => {
            const isCompleted = completedSteps.has(tab.id);
            const isCurrent = currentTab === tab.id;
            const isPast = tabs.findIndex(t => t.id === currentTab) > index;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  // Only allow clicking on completed steps or current step
                  if (isCompleted || isCurrent || isPast) {
                    setCurrentTab(tab.id);
                  }
                }}
                disabled={!isCompleted && !isCurrent && !isPast}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap relative ${
                  isCurrent
                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                    : isCompleted || isPast
                    ? 'text-primary-600 hover:text-primary-700 hover:bg-blue-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {isCompleted && (
                  <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Basic Info Tab */}
          {currentTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => updateForm('sku', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.sku ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.sku}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => updateForm('shortDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Brief description for listings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Detailed product description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      updateForm('category', e.target.value);
                      updateForm('subcategory', ''); // Reset subcategory when category changes
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter(cat => cat.status === 'active')
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => updateForm('subcategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    disabled={!formData.category}
                  >
                    <option value="">
                      {formData.category ? 'Select subcategory' : 'Select category first'}
                    </option>
                    {filteredSubcategories
                      .filter(sub => sub.status === 'active')
                      .map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to upload images</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative w-full h-20">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`Product ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {currentTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (SAR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateForm('price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (SAR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => updateForm('costPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => updateForm('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="piece">Piece</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                    <option value="project">Project</option>
                    <option value="kg">Kilogram</option>
                    <option value="liter">Liter</option>
                    <option value="meter">Meter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => updateForm('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="15.00"
                  />
                </div>
              </div>

              {/* Profit Analysis */}
              {formData.price > 0 && formData.costPrice > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Profit Analysis</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Profit: </span>
                      <span className="font-medium">SAR {(formData.price - formData.costPrice).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Margin: </span>
                      <span className="font-medium">
                        {(((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Markup: </span>
                      <span className="font-medium">
                        {(((formData.price - formData.costPrice) / formData.costPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {currentTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => updateForm('stock', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.stock}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => updateForm('barcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={(e) => updateForm('status', e.target.value as 'active' | 'inactive')}
                      className="mr-2 text-primary focus:ring-lime-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={(e) => updateForm('status', e.target.value as 'active' | 'inactive')}
                      className="mr-2 text-primary focus:ring-lime-500"
                    />
                    Inactive
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {currentTab === 'details' && (
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-primary-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:bg-blue-200 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => updateForm('weight', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="0.00"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dimensions.length}
                    onChange={(e) => updateForm('dimensions', {
                      ...formData.dimensions,
                      length: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Length"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dimensions.width}
                    onChange={(e) => updateForm('dimensions', {
                      ...formData.dimensions,
                      width: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Width"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dimensions.height}
                    onChange={(e) => updateForm('dimensions', {
                      ...formData.dimensions,
                      height: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Height"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {currentTab === 'advanced' && (
            <div className="space-y-6">
              {/* Custom Attributes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Attributes
                </label>

                {/* Attributes Table */}
                {formData.attributes.length > 0 && (
                  <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Attribute Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.attributes.map((attr, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {attr.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {attr.value}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeAttribute(index)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add New Attribute */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttribute())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Attribute name"
                  />
                  <input
                    type="text"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttribute())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Attribute value"
                  />
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <div>
          {currentTab !== 'basic' && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}

          {currentTab !== 'advanced' ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-lime-600 hover:to-yellow-600 transition-all duration-300"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-lime-600 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitButtonText}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ProductForm;