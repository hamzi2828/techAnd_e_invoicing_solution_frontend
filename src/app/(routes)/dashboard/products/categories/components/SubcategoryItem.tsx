import React from 'react';
import { Edit, Trash2, Hash, Plus } from 'lucide-react';
import { Subcategory } from '../../types';

interface SubcategoryItemProps {
  subcategory: Subcategory;
  onEdit: (subcategory: Subcategory) => void;
  onDelete: (subcategoryId: string) => void;
}

interface AddSubcategoryButtonProps {
  onAdd: () => void;
}

const SubcategoryItem: React.FC<SubcategoryItemProps> = ({
  subcategory,
  onEdit,
  onDelete
}) => {
  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <Hash className="h-4 w-4 text-gray-400" />
        <span className="font-medium text-gray-900">{subcategory.name}</span>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(subcategory.status)}`}>
          {subcategory.status}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{subcategory.productsCount} products</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(subcategory)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="h-3 w-3 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(subcategory.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 className="h-3 w-3 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddSubcategoryButton: React.FC<AddSubcategoryButtonProps> = ({ onAdd }) => {
  return (
    <button
      onClick={onAdd}
      className="flex items-center space-x-2 p-3 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 w-full text-primary"
    >
      <Plus className="h-4 w-4" />
      <span className="font-medium">Add Subcategory</span>
    </button>
  );
};

export default SubcategoryItem;