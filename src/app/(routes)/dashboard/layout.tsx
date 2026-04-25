'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import UserProfileNav from './components/UserProfileNav';
import Sidebar from './components/Sidebar';
import { PlanProvider } from '@/contexts/PlanContext';
import { PlanBadge } from '@/components/PlanGate';
import {
  Menu,
  Bell
} from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Page Title or Breadcrumb can go here */}
              <h1 className="text-lg font-semibold text-gray-900">
                {pathname === '/admin' ? 'Dashboard' : 
                 pathname?.includes('/profile') ? 'My Profile' :
                 pathname?.includes('/invoices') ? 'Invoices' :
                 pathname?.includes('/customers') ? 'Customers' :
                 pathname?.includes('/products') ? 'Products' :
                 pathname?.includes('/tax') ? 'Tax & Compliance' :
                 pathname?.includes('/reports') ? 'Reports' :
                 pathname?.includes('/payments') ? 'Payments & Billing' :
                 pathname?.includes('/users') ? 'Users' :
                 pathname?.includes('/settings') ? 'Settings' : 'Admin Panel'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Current Plan Badge */}
              <PlanBadge />

              {/* Notifications */}
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-white text-xs flex items-center justify-center shadow-md">
                  3
                </span>
              </button>

              {/* Profile Dropdown */}
              <UserProfileNav />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </PlanProvider>
  );
}