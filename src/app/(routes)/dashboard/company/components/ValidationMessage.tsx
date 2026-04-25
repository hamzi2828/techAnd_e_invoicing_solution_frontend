import React from 'react';

interface ValidationMessageProps {
  error?: string;
  success?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ error, success }) => {
  if (error) {
    return <p className="mt-1 text-sm text-red-600">{error}</p>;
  }

  if (success) {
    return <p className="mt-1 text-sm text-green-600">{success}</p>;
  }

  return null;
};
