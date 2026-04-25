/**
 * STATIC PERMISSIONS - Matching Sidebar Navigation Exactly
 *
 * Use this instead of fetching from backend to ensure permissions
 * always match the Sidebar structure
 */

import { Permission } from '../types';

export const STATIC_PERMISSIONS: Permission[] = [
  // ============================================
  // DASHBOARD (1)
  // ============================================
  {
    id: 'dashboard-view',
    name: 'View Dashboard',
    description: 'Access to main dashboard overview and analytics',
    category: 'Dashboard',
  },

  // ============================================
  // SALES (7)
  // ============================================
  // Invoices subcategory
  {
    id: 'sales-create-invoice',
    name: 'Create Invoice',
    description: 'Ability to create new invoices',
    category: 'Sales',
    subcategory: 'Invoices',
  },
  {
    id: 'sales-view-all-invoices',
    name: 'View Invoices',
    description: 'View all invoices in the system',
    category: 'Sales',
    subcategory: 'Invoices',
  },
  {
    id: 'sales-edit-invoice',
    name: 'Edit Invoice',
    description: 'Modify existing invoices',
    category: 'Sales',
    subcategory: 'Invoices',
  },
  {
    id: 'sales-delete-invoice',
    name: 'Delete Invoice',
    description: 'Remove invoices from the system',
    category: 'Sales',
    subcategory: 'Invoices',
  },
  {
    id: 'sales-send-invoice',
    name: 'Send Invoice',
    description: 'Send invoices to customers via email',
    category: 'Sales',
    subcategory: 'Invoices',
  },
  {
    id: 'sales-download-invoice',
    name: 'Download Invoice',
    description: 'Download invoices as PDF',
    category: 'Sales',
    subcategory: 'Invoices',
  },
  // Quotations subcategory
  {
    id: 'sales-create-quotation',
    name: 'Create Quotation',
    description: 'Create new quotations',
    category: 'Sales',
    subcategory: 'Quotations',
  },
  {
    id: 'sales-view-quotations',
    name: 'View Quotations',
    description: 'View all quotations',
    category: 'Sales',
    subcategory: 'Quotations',
  },
  {
    id: 'sales-edit-quotation',
    name: 'Edit Quotation',
    description: 'Modify existing quotations',
    category: 'Sales',
    subcategory: 'Quotations',
  },
  {
    id: 'sales-delete-quotation',
    name: 'Delete Quotation',
    description: 'Remove quotations',
    category: 'Sales',
    subcategory: 'Quotations',
  },
  {
    id: 'sales-send-quotation',
    name: 'Send Quotation',
    description: 'Send quotations to customers',
    category: 'Sales',
    subcategory: 'Quotations',
  },
  {
    id: 'sales-convert-quotation',
    name: 'Convert to Invoice',
    description: 'Convert quotations to invoices',
    category: 'Sales',
    subcategory: 'Quotations',
  },
  // Reports subcategory
  {
    id: 'sales-view-reports',
    name: 'Sales Reports',
    description: 'Access sales reports and analytics',
    category: 'Sales',
    subcategory: 'Reports',
  },

  // ============================================
  // CUSTOMERS (5)
  // ============================================
  // Level 2 - standalone
  {
    id: 'customers-add',
    name: 'Add Customer',
    description: 'Create new customer records',
    category: 'Customers',
  },
  // All Customers subcategory
  {
    id: 'customers-view',
    name: 'View Customer',
    description: 'View customer list and details',
    category: 'Customers',
    subcategory: 'All Customers',
  },
  {
    id: 'customers-edit',
    name: 'Edit Customer',
    description: 'Modify existing customer information',
    category: 'Customers',
    subcategory: 'All Customers',
  },
  {
    id: 'customers-delete',
    name: 'Delete Customer',
    description: 'Remove customer records',
    category: 'Customers',
    subcategory: 'All Customers',
  },
  {
    id: 'customers-add-list',
    name: 'Add Customer',
    description: 'Add new customer from list view',
    category: 'Customers',
    subcategory: 'All Customers',
  },

  // ============================================
  // PRODUCTS & SERVICES (5)
  // ============================================
  // Level 2 - standalone
  {
    id: 'products-add',
    name: 'Add Product',
    description: 'Create new products/services',
    category: 'Products & Services',
  },
  {
    id: 'products-manage-categories',
    name: 'Categories',
    description: 'Create and manage product categories',
    category: 'Products & Services',
  },
  // All Products subcategory
  {
    id: 'products-view-all',
    name: 'View Products',
    description: 'View complete product catalog',
    category: 'Products & Services',
    subcategory: 'All Products',
  },
  {
    id: 'products-edit',
    name: 'Edit Product',
    description: 'Modify existing product information',
    category: 'Products & Services',
    subcategory: 'All Products',
  },
  {
    id: 'products-delete',
    name: 'Delete Product',
    description: 'Remove products from catalog',
    category: 'Products & Services',
    subcategory: 'All Products',
  },
  {
    id: 'products-add-list',
    name: 'Add Product',
    description: 'Add new product from list view',
    category: 'Products & Services',
    subcategory: 'All Products',
  },


  // ============================================
  // REPORTS (3)
  // ============================================
  {
    id: 'reports-sales',
    name: 'Sales Reports',
    description: 'Access sales analytics and reports',
    category: 'Reports',
  },
  {
    id: 'reports-customers',
    name: 'Customer Reports',
    description: 'Access customer analytics and reports',
    category: 'Reports',
  },
  {
    id: 'reports-products',
    name: 'Product Reports',
    description: 'Access product analytics and reports',
    category: 'Reports',
  },

  // ============================================
  // COMPANY (6)
  // ============================================
  // Level 2 - standalone
  {
    id: 'company-add',
    name: 'Add New Company',
    description: 'Create new company profiles',
    category: 'Company',
  },
  // Bank Accounts subcategory
  {
    id: 'bank-accounts-add',
    name: 'Add Bank Account',
    description: 'Add new bank accounts',
    category: 'Company',
    subcategory: 'Bank Accounts',
  },
  {
    id: 'bank-accounts-edit',
    name: 'Edit Bank Account',
    description: 'Modify bank account information',
    category: 'Company',
    subcategory: 'Bank Accounts',
  },
  {
    id: 'bank-accounts-delete',
    name: 'Delete Bank Account',
    description: 'Remove bank accounts',
    category: 'Company',
    subcategory: 'Bank Accounts',
  },
  {
    id: 'bank-accounts-default',
    name: 'Set Default',
    description: 'Set default bank account',
    category: 'Company',
    subcategory: 'Bank Accounts',
  },
  // All Companies subcategory
  {
    id: 'company-view-all',
    name: 'View Companies',
    description: 'View list of all company profiles',
    category: 'Company',
    subcategory: 'All Companies',
  },
  {
    id: 'company-edit',
    name: 'Edit Company',
    description: 'Modify company information',
    category: 'Company',
    subcategory: 'All Companies',
  },
  {
    id: 'company-delete',
    name: 'Delete Company',
    description: 'Remove company profiles',
    category: 'Company',
    subcategory: 'All Companies',
  },
  {
    id: 'company-add-list',
    name: 'Add Company',
    description: 'Add new company from list view',
    category: 'Company',
    subcategory: 'All Companies',
  },

  // ============================================
  // USERS & ROLES (7)
  // ============================================
  // Level 2 - standalone
  {
    id: 'users-add',
    name: 'Add User',
    description: 'Create new user accounts',
    category: 'Users & Roles',
  },
  {
    id: 'users-view-activity',
    name: 'Activity Log',
    description: 'Access user activity logs and audit trail',
    category: 'Users & Roles',
  },
  // Roles & Permissions subcategory
  {
    id: 'roles-create',
    name: 'Create Role',
    description: 'Create new roles',
    category: 'Users & Roles',
    subcategory: 'Roles & Permissions',
  },
  {
    id: 'roles-view',
    name: 'View Roles',
    description: 'View all roles and permissions',
    category: 'Users & Roles',
    subcategory: 'Roles & Permissions',
  },
  {
    id: 'roles-edit',
    name: 'Edit Role',
    description: 'Modify role permissions',
    category: 'Users & Roles',
    subcategory: 'Roles & Permissions',
  },
  {
    id: 'roles-delete',
    name: 'Delete Role',
    description: 'Remove roles',
    category: 'Users & Roles',
    subcategory: 'Roles & Permissions',
  },
  // All Users subcategory
  {
    id: 'users-view-all',
    name: 'View Users',
    description: 'View complete user list',
    category: 'Users & Roles',
    subcategory: 'All Users',
  },
  {
    id: 'users-edit',
    name: 'Edit User',
    description: 'Modify user information',
    category: 'Users & Roles',
    subcategory: 'All Users',
  },
  {
    id: 'users-delete',
    name: 'Delete User',
    description: 'Remove user accounts',
    category: 'Users & Roles',
    subcategory: 'All Users',
  },
  {
    id: 'users-add-list',
    name: 'Add User',
    description: 'Add new user from list view',
    category: 'Users & Roles',
    subcategory: 'All Users',
  },

  // ============================================
  // SETTINGS (2)
  // ============================================
  {
    id: 'settings-view',
    name: 'View Settings',
    description: 'Access system settings and configuration',
    category: 'Settings',
  },
  {
    id: 'settings-manage',
    name: 'Manage Settings',
    description: 'Modify system settings and configuration',
    category: 'Settings',
  },
];

// Total count for validation
export const TOTAL_STATIC_PERMISSIONS = 49;

// Categories summary
export const STATIC_PERMISSIONS_BY_CATEGORY = {
  'Dashboard': 1,
  'Sales': 13,
  'Customers': 5,
  'Products & Services': 6,
  'Reports': 3,
  'Company': 9,
  'Users & Roles': 10,
  'Settings': 2,
};

// Category order for sorting (matches Sidebar navigation order)
const CATEGORY_ORDER = {
  'Dashboard': 1,
  'Sales': 2,
  'Customers': 3,
  'Products & Services': 4,
  'Reports': 5,
  'Company': 6,
  'Users & Roles': 7,
  'Settings': 8,
};

// Category name normalization map
const CATEGORY_NORMALIZATION_MAP: { [key: string]: string } = {
  'dashboard': 'Dashboard',
  'sales': 'Sales',
  'customers': 'Customers',
  'products & services': 'Products & Services',
  'products': 'Products & Services',
  'reports': 'Reports',
  'company': 'Company',
  'users & roles': 'Users & Roles',
  'users': 'Users & Roles',
  'settings': 'Settings',
  'general': 'General',
};

/**
 * Get the sort order for a category
 */
export const getCategoryOrder = (category: string): number => {
  const normalized = normalizeCategoryName(category);
  return CATEGORY_ORDER[normalized as keyof typeof CATEGORY_ORDER] || 999;
};

/**
 * Normalize category name to match standard naming
 */
export const normalizeCategoryName = (category: string): string => {
  const lowerCategory = category.toLowerCase().trim();
  return CATEGORY_NORMALIZATION_MAP[lowerCategory] || category;
};
