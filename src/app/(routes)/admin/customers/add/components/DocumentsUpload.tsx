import React from 'react';
import { Upload, File, X } from 'lucide-react';
import type { Document, DocumentsUploadProps } from '../../types';

const DocumentsUpload: React.FC<DocumentsUploadProps> = ({
  documents,
  onUpdateDocuments,
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments: Document[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      }));
      onUpdateDocuments([...documents, ...newDocuments]);
    }
  };

  const removeDocument = (id: string) => {
    onUpdateDocuments(documents.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Documents Upload</h2>
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
            </p>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div>
            <h4 className="font-medium mb-2">Required Documents</h4>
            <ul className="space-y-1">
              <li>• Commercial Registration</li>
              <li>• VAT Certificate</li>
              <li>• Tax Registration</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Banking Documents</h4>
            <ul className="space-y-1">
              <li>• Bank Account Statement</li>
              <li>• IBAN Certificate</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Optional Documents</h4>
            <ul className="space-y-1">
              <li>• Company Profile</li>
              <li>• Authorization Letter</li>
              <li>• Other Certificates</li>
            </ul>
          </div>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Uploaded Documents</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsUpload;