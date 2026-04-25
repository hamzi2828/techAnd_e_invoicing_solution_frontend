import React from 'react';
import { Upload, Camera, Shield } from 'lucide-react';
import { CompanyData } from './types';

interface DocumentsStepProps {
  data: CompanyData['documents'];
  onFileUpload: (field: keyof CompanyData['documents'], file: File | null) => void;
}

interface FileUploadFieldProps {
  label: string;
  field: keyof CompanyData['documents'];
  accept?: string;
  icon?: React.ElementType;
  file: File | null;
  onUpload: (field: keyof CompanyData['documents'], file: File | null) => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  field,
  accept = "*/*",
  icon: Icon = Upload,
  file,
  onUpload,
}) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
      <input
        type="file"
        id={field}
        accept={accept}
        onChange={(e) => onUpload(field, e.target.files?.[0] || null)}
        className="hidden"
      />
      <label htmlFor={field} className="cursor-pointer">
        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        {file ? (
          <p className="text-sm text-green-600">✓ {file.name}</p>
        ) : (
          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
        )}
      </label>
    </div>
  );
};

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ data, onFileUpload }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadField
          label="Company Logo"
          field="logo"
          accept="image/*"
          icon={Camera}
          file={data.logo}
          onUpload={onFileUpload}
        />
        <FileUploadField
          label="Commercial Register"
          field="commercialRegister"
          accept=".pdf,.jpg,.jpeg,.png"
          file={data.commercialRegister}
          onUpload={onFileUpload}
        />
        <FileUploadField
          label="Tax Certificate"
          field="taxCertificate"
          accept=".pdf,.jpg,.jpeg,.png"
          file={data.taxCertificate}
          onUpload={onFileUpload}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Document Security</h4>
            <p className="text-sm text-blue-700 mt-1">
              All uploaded documents are encrypted and stored securely. Only authorized personnel can access these files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
