import React from 'react';

interface CheckBoxProps {
  onChange: (checked: boolean) => void;
  checked: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CheckBox: React.FC<CheckBoxProps> = ({ onChange, checked, children, className }) => {
  return (
    <label className={`flex items-center cursor-pointer ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
      />
      <span className={className || 'text-xs text-gray-600'}>{children}</span>
    </label>
  );
};