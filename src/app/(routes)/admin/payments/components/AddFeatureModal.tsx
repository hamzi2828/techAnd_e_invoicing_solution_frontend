import React, { useState } from 'react';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface AddFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (featureName: string) => Promise<void>;
}

export default function AddFeatureModal({ isOpen, onClose, onAdd }: AddFeatureModalProps) {
  const [featureName, setFeatureName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featureName.trim()) {
      setError(t('admin.payments.addFeatureModal.featureNameRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAdd(featureName.trim());
      setFeatureName('');
      // Don't close here - let the parent handle closing on success
    } catch (error) {
      setError(t('admin.payments.addFeatureModal.failedToAdd'));
      console.error('Error adding feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeatureName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('admin.payments.addFeatureModal.title')}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="featureName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.payments.addFeatureModal.featureName')}
          </label>
          <input
            type="text"
            id="featureName"
            value={featureName}
            onChange={(e) => {
              setFeatureName(e.target.value);
              if (error) setError('');
            }}
            className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('admin.payments.addFeatureModal.featureNamePlaceholder')}
            autoFocus
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
          >
{t('admin.payments.addFeatureModal.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:via-blue-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('admin.payments.addFeatureModal.adding')}
              </div>
            ) : (
              t('admin.payments.addFeatureModal.addFeature')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}