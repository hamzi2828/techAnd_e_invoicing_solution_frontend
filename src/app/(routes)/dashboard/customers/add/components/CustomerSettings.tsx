import React from 'react';
import { Settings, Shield, Eye, EyeOff } from 'lucide-react';
import type { SettingsData, CustomerSettingsProps } from '../../types';

const CustomerSettings: React.FC<CustomerSettingsProps> = ({
  settings,
  onUpdateSettings,
  readOnly = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-lime-600" />
        <h2 className="text-lg font-semibold text-gray-900">Customer Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Account Status */}
        <div className="border-b pb-4">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            Account Status
          </h3>
          <div className="space-y-3">
{readOnly ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.isActive ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Customer Account Status
                  </span>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  settings.isActive
                    ? 'bg-lime-100 text-lime-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {settings.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ) : (
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.isActive ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Active Customer Account
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.isActive}
                    onChange={(e) => onUpdateSettings('isActive', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => onUpdateSettings('isActive', !settings.isActive)}
                    className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      settings.isActive ? 'bg-lime-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        settings.isActive ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>
            )}
            <p className="text-xs text-gray-500 ml-6">
              {settings.isActive
                ? "Customer account is active and can receive invoices"
                : "Customer account is inactive and cannot receive new invoices"}
            </p>
          </div>
        </div>


        {/* Privacy & Consent */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            Privacy & Consent
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.dataProcessingConsent}
                onChange={(e) => onUpdateSettings('dataProcessingConsent', e.target.checked)}
                className="rounded border-gray-300 text-lime-600 focus:ring-lime-500"
              />
              <span className="text-sm text-gray-700">
                Consent to data processing for business purposes
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.termsAccepted}
                onChange={(e) => onUpdateSettings('termsAccepted', e.target.checked)}
                className="rounded border-gray-300 text-lime-600 focus:ring-lime-500"
              />
              <span className="text-sm text-gray-700">
                Accept Terms of Service *
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacyPolicyAccepted}
                onChange={(e) => onUpdateSettings('privacyPolicyAccepted', e.target.checked)}
                className="rounded border-gray-300 text-lime-600 focus:ring-lime-500"
              />
              <span className="text-sm text-gray-700">
                Accept Privacy Policy *
              </span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Required for customer account creation
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;