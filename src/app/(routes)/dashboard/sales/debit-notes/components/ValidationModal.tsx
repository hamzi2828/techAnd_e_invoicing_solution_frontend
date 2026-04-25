import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Loader2, Send, RefreshCw } from 'lucide-react';
import { DebitNote } from '../types';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  debitNote: DebitNote | null;
  isValidating: boolean;
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null;
  onValidate: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  debitNote,
  isValidating,
  validationResult,
  onValidate,
  onSubmit,
  isSubmitting
}) => {
  if (!isOpen || !debitNote) return null;

  // Check for previous validation stored in debit note
  const previousErrors = debitNote.zatca?.errors || [];
  const previousWarnings = debitNote.zatca?.warnings || [];
  const hasPreviousErrors = previousErrors.length > 0 || previousWarnings.length > 0;
  const lastValidatedAt = debitNote.zatca?.lastValidatedAt;
  const previousValidationStatus = debitNote.zatca?.validationStatus;
  const wasPreviouslyValidated = previousValidationStatus === 'valid' && !hasPreviousErrors;

  // Determine what to show
  const showPreviousErrors = hasPreviousErrors && !validationResult && !isValidating;
  const showValidationResult = validationResult !== null && !isValidating;
  const showPreviouslyValidated = wasPreviouslyValidated && !validationResult && !isValidating;
  const showEmptyState = !hasPreviousErrors && !wasPreviouslyValidated && !validationResult && !isValidating;

  const debitNoteNumber = debitNote.debitNoteNumber || debitNote.invoiceNumber;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                ZATCA Validation
              </h3>
              <p className="text-sm text-gray-500">
                Debit Note: {debitNoteNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isValidating || isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {/* Loading State */}
            {isValidating && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Validating debit note...</p>
                <p className="text-sm text-gray-500 mt-1">
                  This may take a few seconds
                </p>
              </div>
            )}

            {/* Empty State - No previous errors, ready to validate */}
            {showEmptyState && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-900 font-medium text-center">
                  Ready to Validate
                </p>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Click the button below to validate this debit note against ZATCA rules before submitting.
                </p>
              </div>
            )}

            {/* Previously Validated Successfully */}
            {showPreviouslyValidated && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-green-800 font-medium text-lg text-center">
                  Previously Validated
                </p>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  This debit note was validated successfully and is ready to submit to ZATCA
                </p>
                {lastValidatedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Last validated: {new Date(lastValidatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Previous Errors from DB */}
            {showPreviousErrors && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Previous Validation Issues</span>
                </div>

                {lastValidatedAt && (
                  <p className="text-xs text-gray-500">
                    Last validated: {new Date(lastValidatedAt).toLocaleString()}
                  </p>
                )}

                {previousErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Errors ({previousErrors.length})
                    </h4>
                    <ul className="space-y-2">
                      {previousErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                          <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {previousWarnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      Warnings ({previousWarnings.length})
                    </h4>
                    <ul className="space-y-2">
                      {previousWarnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-sm text-gray-600 mt-4">
                  Click &quot;Validate Again&quot; to re-check this debit note.
                </p>
              </div>
            )}

            {/* Validation Result */}
            {showValidationResult && (
              <div className="space-y-4">
                {validationResult.isValid ? (
                  <>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-green-800 font-medium text-lg">
                        Validation Passed
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        This debit note is ready to submit to ZATCA
                      </p>
                    </div>

                    {validationResult.warnings.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-amber-800 mb-2">
                          Warnings ({validationResult.warnings.length})
                        </h4>
                        <ul className="space-y-2">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Validation Failed</span>
                    </div>

                    {validationResult.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-800 mb-2">
                          Errors ({validationResult.errors.length})
                        </h4>
                        <ul className="space-y-2">
                          {validationResult.errors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-amber-800 mb-2">
                          Warnings ({validationResult.warnings.length})
                        </h4>
                        <ul className="space-y-2">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mt-2">
                      Please fix the errors above and try again.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isValidating || isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Show Validate button when: empty state, previous errors, or failed validation */}
            {(showEmptyState || showPreviousErrors || (showValidationResult && !validationResult?.isValid)) && (
              <button
                onClick={onValidate}
                disabled={isValidating || isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                {showPreviousErrors ? 'Validate Again' : 'Validate'}
              </button>
            )}

            {/* Show Submit button when validation passed or previously validated */}
            {((showValidationResult && validationResult?.isValid) || showPreviouslyValidated) && (
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit to ZATCA
                  </>
                )}
              </button>
            )}

            {/* Show Re-validate button when previously validated */}
            {showPreviouslyValidated && (
              <button
                onClick={onValidate}
                disabled={isValidating || isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                Re-validate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
