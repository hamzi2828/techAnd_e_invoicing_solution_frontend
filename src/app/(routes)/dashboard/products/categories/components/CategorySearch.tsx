import React from 'react';
import { Search } from 'lucide-react';

interface CategorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CategorySearch: React.FC<CategorySearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  );
};

export default CategorySearch;