'use client';

import React from 'react';
import {
  FileText,
  Eye,
  FolderOpen,
  TrendingUp,
} from 'lucide-react';

interface BlogStatsProps {
  totalBlogs: number;
  publishedBlogs: number;
  totalViews: number;
  totalCategories: number;
}

export default function BlogStats({ totalBlogs, publishedBlogs, totalViews, totalCategories }: BlogStatsProps) {
  const stats = [
    {
      name: 'Total Blogs',
      value: totalBlogs,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Published',
      value: publishedBlogs,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Categories',
      value: totalCategories,
      icon: FolderOpen,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
