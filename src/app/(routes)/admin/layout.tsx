'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import UserProfileNav from './components/UserProfileNav';
import Sidebar from './components/Sidebar';
import { LanguageProvider, useLanguage } from './payments/contexts/LanguageContext';
import {
  Menu,
  Bell,
  Languages,
  ChevronDown
} from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const pathname = usePathname();
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const handleLanguageChange = (languageCode: 'en' | 'ar') => {
    setLanguage(languageCode);
    setLanguageDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                 pathname?.includes('/blog') ? 'Blog' :
                 pathname?.includes('/settings') ? 'Settings' : 'Admin Panel'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Languages className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium mr-1">
                    {languages.find(lang => lang.code === language)?.flag}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Language Dropdown */}
                {languageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code as 'en' | 'ar')}
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            language === lang.code
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700'
                          }`}
                        >
                          <span className="mr-3 text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                          {language === lang.code && (
                            <span className="ml-auto text-primary">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
    <LanguageProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </LanguageProvider>
  );
}