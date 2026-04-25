import React from 'react';
import { Filter, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  showActions?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  showActions = true,
  children,
}: PageHeaderProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-gradient-to-r from-white via-primary-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-primary-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-700 bg-clip-text text-transparent">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {children || (
            showActions && (
              <>
                <button className="inline-flex items-center px-4 py-2 border border-primary-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-primary-50 transition-all">
                  <Filter className="h-4 w-4 mr-2" />
                  {t('admin.payments.pageHeader.filter')}
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Download className="h-4 w-4 mr-2" />
                  {t('admin.payments.pageHeader.export')}
                </button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}