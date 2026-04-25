'use client';

import React from 'react';

// Reusable skeleton base component
const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Invoice Preview Modal Skeleton
export const PreviewModalSkeleton: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <SkeletonBox className="h-6 w-40" />
        <div className="flex space-x-2">
          <SkeletonBox className="h-10 w-32" />
          <SkeletonBox className="h-10 w-24" />
          <SkeletonBox className="h-10 w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Company Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <SkeletonBox className="h-10 w-40" />
              <SkeletonBox className="h-4 w-24" />
            </div>
            <div className="text-right space-y-2">
              <SkeletonBox className="h-8 w-48 ml-auto" />
              <SkeletonBox className="h-4 w-40 ml-auto" />
              <SkeletonBox className="h-4 w-36 ml-auto" />
              <SkeletonBox className="h-4 w-32 ml-auto" />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <SkeletonBox className="h-5 w-20" />
              <SkeletonBox className="h-4 w-40" />
              <SkeletonBox className="h-4 w-36" />
              <SkeletonBox className="h-4 w-32" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <SkeletonBox className="h-4 w-20" />
                <SkeletonBox className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <SkeletonBox className="h-4 w-28" />
                <SkeletonBox className="h-4 w-20" />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="flex border-b-2 border-gray-200 pb-3">
              <SkeletonBox className="h-4 w-1/3" />
              <SkeletonBox className="h-4 w-16 mx-4" />
              <SkeletonBox className="h-4 w-20 mx-4" />
              <SkeletonBox className="h-4 w-16 mx-4" />
              <SkeletonBox className="h-4 w-20 ml-auto" />
            </div>
            {/* Table Rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex border-b border-gray-100 py-3">
                <SkeletonBox className="h-4 w-1/3" />
                <SkeletonBox className="h-4 w-12 mx-4" />
                <SkeletonBox className="h-4 w-16 mx-4" />
                <SkeletonBox className="h-4 w-14 mx-4" />
                <SkeletonBox className="h-4 w-20 ml-auto" />
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <SkeletonBox className="h-4 w-20" />
                <SkeletonBox className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <SkeletonBox className="h-4 w-16" />
                <SkeletonBox className="h-4 w-24" />
              </div>
              <div className="border-t pt-2 flex justify-between">
                <SkeletonBox className="h-6 w-16" />
                <SkeletonBox className="h-6 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Customer Modal Skeleton
export const CustomerModalSkeleton: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-lg w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <SkeletonBox className="h-6 w-40" />
        <SkeletonBox className="h-8 w-8 rounded-full" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-10 w-full" />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-10 w-full" />
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-10 w-full" />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-16" />
            <SkeletonBox className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-10 w-full" />
          </div>
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-20 w-full" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <SkeletonBox className="h-10 w-24" />
        <SkeletonBox className="h-10 w-32" />
      </div>
    </div>
  </div>
);

// Product Autocomplete Skeleton
export const ProductAutocompleteSkeleton: React.FC = () => (
  <div className="relative w-full">
    <div className="relative">
      <SkeletonBox className="h-10 w-full rounded-lg" />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <SkeletonBox className="h-4 w-4 rounded" />
      </div>
    </div>
  </div>
);

// Line Items Table Row Skeleton
export const LineItemRowSkeleton: React.FC = () => (
  <tr className="border-b border-gray-100">
    <td className="py-3 px-2">
      <SkeletonBox className="h-10 w-full" />
    </td>
    <td className="py-3 px-2">
      <SkeletonBox className="h-10 w-full" />
    </td>
    <td className="py-3 px-2">
      <SkeletonBox className="h-10 w-full" />
    </td>
    <td className="py-3 px-4">
      <SkeletonBox className="h-10 w-full" />
    </td>
    <td className="py-3 px-4">
      <SkeletonBox className="h-10 w-full" />
    </td>
    <td className="py-3 px-6 text-right">
      <SkeletonBox className="h-6 w-24 ml-auto" />
    </td>
    <td className="py-3 px-2">
      <SkeletonBox className="h-8 w-8 rounded" />
    </td>
  </tr>
);

export default {
  PreviewModalSkeleton,
  CustomerModalSkeleton,
  ProductAutocompleteSkeleton,
  LineItemRowSkeleton
};
