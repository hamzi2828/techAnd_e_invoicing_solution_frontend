'use client';

import React from 'react';

interface QuickSettingsProps {
  sendWelcomeEmail: boolean;
  forcePasswordChange: boolean;
  enableTwoFactor: boolean;
  sendEmailNotifications: boolean;
  onSendWelcomeEmailChange: (value: boolean) => void;
  onForcePasswordChangeChange: (value: boolean) => void;
  onEnableTwoFactorChange: (value: boolean) => void;
  onSendEmailNotificationsChange: (value: boolean) => void;
}

export default function QuickSettings({
  sendWelcomeEmail,
  forcePasswordChange,
  enableTwoFactor,
  sendEmailNotifications,
  onSendWelcomeEmailChange,
  onForcePasswordChangeChange,
  onEnableTwoFactorChange,
  onSendEmailNotificationsChange,
}: QuickSettingsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Settings</h2>
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={sendWelcomeEmail}
            onChange={(e) => onSendWelcomeEmailChange(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary mr-3"
          />
          <span className="text-sm text-gray-700">Send welcome email</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={forcePasswordChange}
            onChange={(e) => onForcePasswordChangeChange(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary mr-3"
          />
          <span className="text-sm text-gray-700">Force password change on first login</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={enableTwoFactor}
            onChange={(e) => onEnableTwoFactorChange(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary mr-3"
          />
          <span className="text-sm text-gray-700">Enable two-factor authentication</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={sendEmailNotifications}
            onChange={(e) => onSendEmailNotificationsChange(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary mr-3"
          />
          <span className="text-sm text-gray-700">Send email notifications</span>
        </label>
      </div>
    </div>
  );
}
