'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelText?: string;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    titleColor: 'text-green-800',
    buttonBg: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    titleColor: 'text-red-800',
    buttonBg: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    titleColor: 'text-amber-800',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    titleColor: 'text-blue-800',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
};

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
  showCancel = false,
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  const config = alertConfig[type];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const defaultTitles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className={`flex items-center gap-3 px-6 py-4 border-b ${config.borderColor}`}>
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <h3 className={`text-lg font-semibold ${config.titleColor}`}>
              {title || defaultTitles[type]}
            </h3>
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${config.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

// Hook for easier usage
export interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title?: string;
  message: string;
}

export const useAlertModal = () => {
  const [alert, setAlert] = React.useState<AlertState>({
    isOpen: false,
    type: 'info',
    message: '',
  });

  const showAlert = (message: string, type: AlertType = 'info', title?: string) => {
    setAlert({ isOpen: true, type, message, title });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  return { alert, showAlert, hideAlert };
};
