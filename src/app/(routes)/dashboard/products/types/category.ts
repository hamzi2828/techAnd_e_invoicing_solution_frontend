export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  icon: string;
  productsCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId: string;
  icon: string;
  productsCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  isActive: boolean;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalProducts: number;
  subcategoriesCount: number;
}