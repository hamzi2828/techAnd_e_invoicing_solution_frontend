'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  // FileText,
  Users,
  Package,
  Settings,
  BarChart3,
  Building2,
  Shield,
  X,
  ChevronDown,
  HelpCircle,
  // CreditCard,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { usePlan } from '@/contexts/PlanContext';
import { useTheme } from '@/contexts/ThemeContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: string; // Permission ID required to view this item
  requiredFeature?: string; // Feature name required (from plan) to view this item
  children?: { name: string; href: string; requiredPermission?: string; requiredFeature?: string }[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiredPermission: 'dashboard-view'
  },
  {
    name: 'POS',
    href: '/dashboard/pos',
    icon: ShoppingCart,
    requiredFeature: 'POS Access', // Hides if feature not available in plan
    children: [
      { name: 'POS Terminal', href: '/dashboard/pos', requiredPermission: 'pos-view' },
      { name: 'POS Sales', href: '/dashboard/pos/sales', requiredPermission: 'pos-view-sales' },
      { name: 'POS Reports', href: '/dashboard/pos/reports', requiredPermission: 'pos-view-reports' },
    ],
  },
  {
    name: 'Sales',
    href: '/dashboard/sales/all-invoices',
    icon: TrendingUp,
    children: [
      { name: 'Invoices', href: '/dashboard/sales/all-invoices', requiredPermission: 'sales-view-all-invoices' },
      { name: 'Bulk Import', href: '/dashboard/sales/bulk-import', requiredPermission: 'sales-create-invoice' },
      { name: 'Credit Notes', href: '/dashboard/sales/credit-notes', requiredPermission: 'sales-view-credit-notes' },
      { name: 'Debit Notes', href: '/dashboard/sales/debit-notes', requiredPermission: 'sales-view-debit-notes' },
      { name: 'Quotations', href: '/dashboard/sales/quotations', requiredPermission: 'sales-view-quotations' },
    ],
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    children: [
      { name: 'Add Customer', href: '/dashboard/customers/add', requiredPermission: 'customers-add' },
      { name: 'All Customers', href: '/dashboard/customers', requiredPermission: 'customers-view' },
    ],
  },
  {
    name: 'Products & Services',
    href: '/dashboard/products',
    icon: Package,
    children: [
      { name: 'Add Product', href: '/dashboard/products/add', requiredPermission: 'products-add' },
      { name: 'Categories', href: '/dashboard/products/categories', requiredPermission: 'products-manage-categories' },
      { name: 'All Products', href: '/dashboard/products', requiredPermission: 'products-view-all' },
    ],
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    children: [
      { name: 'Sales Reports', href: '/dashboard/reports/sales', requiredPermission: 'reports-sales' },
      { name: 'Customer Reports', href: '/dashboard/reports/customers', requiredPermission: 'reports-customers' },
      { name: 'Product Reports', href: '/dashboard/reports/products', requiredPermission: 'reports-products' },
    ],
  },
  {
    name: 'Company',
    href: '/dashboard/company',
    icon: Building2,
    children: [
      { name: 'Add New Company', href: '/dashboard/company', requiredPermission: 'company-add' },
      { name: 'Bank Accounts', href: '/dashboard/company/bank-accounts', requiredPermission: 'bank-accounts-add' },
      { name: 'All Companies', href: '/dashboard/company/list', requiredPermission: 'company-view-all' },
    ],
  },
  {
    name: 'Users & Roles',
    href: '/dashboard/users',
    icon: Shield,
    children: [
      { name: 'Add User', href: '/dashboard/users/add', requiredPermission: 'users-add' },
      { name: 'Roles & Permissions', href: '/dashboard/users/roles', requiredPermission: 'roles-view' },
      { name: 'Activity Log', href: '/dashboard/users/activity', requiredPermission: 'users-view-activity' },
      { name: 'All Users', href: '/dashboard/users', requiredPermission: 'users-view-all' },
    ],
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    requiredPermission: 'settings-view'
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, hasPermission } = useCurrentUser();
  const { hasFeature } = usePlan();
  const { gradientFrom, gradientTo } = useTheme();

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  // Check if user should see a navigation item
  const canViewItem = (item: NavItem): boolean => {
    // If user is not loaded yet or has no createdBy, show everything (admin/super admin)
    if (!user || !user.createdBy) {
      return true;
    }

    // If item has no required permission, show it
    if (!item.requiredPermission) {
      return true;
    }

    // Check permission
    return hasPermission(item.requiredPermission);
  };

  // Check if parent should be shown (has at least one visible child)
  const canViewParent = (item: NavItem): boolean => {
    // Check feature availability first (applies to ALL users, including admins)
    if (item.requiredFeature && !hasFeature(item.requiredFeature)) {
      return false;
    }

    // If user is not loaded yet or has no createdBy (admin/super admin), show everything else
    if (!user || !user.createdBy) {
      return true;
    }

    // If item has no children, check its own permission
    if (!item.children || item.children.length === 0) {
      return canViewItem(item);
    }

    // If parent has children, show it if at least one child is visible
    return item.children.some(child => {
      // Check feature first
      if (child.requiredFeature && !hasFeature(child.requiredFeature)) {
        return false;
      }
      if (!child.requiredPermission) return true;
      return hasPermission(child.requiredPermission);
    });
  };

  // Filter visible navigation items
  const visibleNavigation = navigation.filter(canViewParent).map(item => {
    // If item has children, filter them too
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => {
          // Check feature first
          if (child.requiredFeature && !hasFeature(child.requiredFeature)) {
            return false;
          }
          if (!user || !user.createdBy) return true;
          if (!child.requiredPermission) return true;
          return hasPermission(child.requiredPermission);
        }),
      };
    }
    return item;
  });

  return (
    <div
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <div className="flex items-center">
            <div className="relative h-10 w-auto" style={{ width: '170px' }}>
              <Image
                src="/Logo/header-logo.svg"
                alt="E-Invoice Pro"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {visibleNavigation.map((item) => (
            <div key={item.name} className="mb-1">
              <button
                onClick={() => item.children && toggleExpanded(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'border-l-4'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={isActive(item.href) ? {
                  backgroundColor: `${gradientFrom}10`,
                  color: gradientFrom,
                  borderLeftColor: gradientFrom,
                } : undefined}
              >
                <Link href={item.href} className="flex items-center flex-1">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
                {item.children && item.children.length > 0 && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedItems.includes(item.name) ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {item.children && item.children.length > 0 && expandedItems.includes(item.name) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        pathname === child.href
                          ? 'font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      style={pathname === child.href ? {
                        backgroundColor: `${gradientFrom}10`,
                        color: gradientFrom,
                      } : undefined}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Help Section */}
        <div className="border-t p-4">
          <div
            className="rounded-lg p-4 border shadow-sm"
            style={{ backgroundColor: `${gradientFrom}08`, borderColor: `${gradientFrom}30` }}
          >
            <div className="flex items-center mb-2" style={{ color: gradientFrom }}>
              <HelpCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Need Help?</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Get support from our team
            </p>
            <button
              className="w-full text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
