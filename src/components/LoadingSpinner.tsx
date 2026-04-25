'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
        <div className="mt-4 text-gray-600 font-medium">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;