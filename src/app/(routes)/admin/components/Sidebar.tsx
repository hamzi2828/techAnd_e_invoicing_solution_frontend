'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  // Package,
  Settings,
  BarChart3,
  // Building2,
  Shield,
  X,
  ChevronDown,
  HelpCircle,
  CreditCard,
  // TrendingUp
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    children: [
      { name: 'All Customers', href: '/admin/customers' },
      { name: 'Add Customer', href: '/admin/customers/add' },
    ],
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
    children: [
      { name: 'Sales Reports', href: '/admin/reports/sales' },
      { name: 'Customer Reports', href: '/admin/reports/customers' },
      { name: 'Product Reports', href: '/admin/reports/products' },
    ],
  },
  {
    name: 'Payments & Billing',
    href: '/admin/payments',
    icon: CreditCard,
    children: [
      { name: 'All Payments', href: '/admin/payments' },
      { name: 'Subscriptions', href: '/admin/payments/subscriptions' },
      { name: 'Plan Management', href: '/admin/payments/plans' },
      { name: 'Assign Subscription', href: '/admin/payments/assign' },
      { name: 'Billing History', href: '/admin/payments/billing' },
    ],
  },
  {
    name: 'Users & Roles',
    href: '/admin/users',
    icon: Shield,
    children: [
      { name: 'All Users', href: '/admin/users' },
      { name: 'Roles & Permissions', href: '/admin/users/roles' },
      { name: 'Activity Log', href: '/admin/users/activity' },
    ],
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: FileText,
    children: [
      { name: 'All Blogs', href: '/admin/blog' },
      { name: 'All Categories', href: '/admin/blog/categories' },
      { name: 'All Authors', href: '/admin/blog/authors' },
    ],
  },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

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
          {navigation.map((item) => (
            <div key={item.name} className="mb-1">
              <button
                onClick={() => item.children && toggleExpanded(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary-50 to-blue-50 text-primary border-l-4 border-primary'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Link href={item.href} className="flex items-center flex-1">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
                {item.children && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedItems.includes(item.name) ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {item.children && expandedItems.includes(item.name) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        pathname === child.href
                          ? 'bg-gradient-to-r from-primary-50 to-blue-50 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
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
          <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 rounded-lg p-4 border border-primary-200 shadow-sm">
            <div className="flex items-center text-primary mb-2">
              <HelpCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Need Help?</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Get support from our team
            </p>
            <button className="w-full bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
