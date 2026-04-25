import React from 'react';

interface QuickAction {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export default function QuickActions({
  actions,
  title = 'Quick Actions',
}: QuickActionsProps) {
  return (
    <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-primary-200">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-left hover:shadow-lg hover:bg-white transition-all duration-300 border border-primary-100 hover:border-primary-300 group"
          >
            <div className="p-2 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform">
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <p className="font-medium text-gray-900">{action.title}</p>
            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
