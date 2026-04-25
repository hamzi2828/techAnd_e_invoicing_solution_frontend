import React from 'react';
import { Mail, Phone, FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { CompanyProfile } from '../types';

interface VerificationTabProps {
  profile: CompanyProfile;
}

const VerificationTab: React.FC<VerificationTabProps> = ({ profile }) => {
  const VerificationBadge = ({ verified, label }: { verified: boolean; label: string }) => (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      verified
        ? 'bg-green-100 text-green-800'
        : 'bg-orange-100 text-orange-800'
    }`}>
      {verified ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : (
        <AlertCircle className="h-3 w-3 mr-1" />
      )}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Account Verification</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Email Verification</p>
                  <p className="text-sm text-gray-600">Verify your email address</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <VerificationBadge verified={profile.verification.emailVerified} label={profile.verification.emailVerified ? "Verified" : "Pending"} />
                {!profile.verification.emailVerified && (
                  <button className="text-sm text-primary hover:text-primary-700 font-medium">
                    Verify Now
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Phone Verification</p>
                  <p className="text-sm text-gray-600">Verify your phone number</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <VerificationBadge verified={profile.verification.phoneVerified} label={profile.verification.phoneVerified ? "Verified" : "Pending"} />
                {!profile.verification.phoneVerified && (
                  <button className="text-sm text-primary hover:text-primary-700 font-medium">
                    Verify Now
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Document Verification</p>
                  <p className="text-sm text-gray-600">Commercial registration and certificates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <VerificationBadge verified={profile.verification.documentsVerified} label={profile.verification.documentsVerified ? "Verified" : "Pending"} />
                {!profile.verification.documentsVerified && (
                  <button className="text-sm text-primary hover:text-primary-700 font-medium">
                    Upload Documents
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Tax Registration</p>
                  <p className="text-sm text-gray-600">ZATCA tax authority verification</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <VerificationBadge verified={profile.verification.taxVerified} label={profile.verification.taxVerified ? "Verified" : "Pending"} />
                {!profile.verification.taxVerified && (
                  <button className="text-sm text-primary hover:text-primary-700 font-medium">
                    Verify Tax Registration
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Complete Your Verification</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Complete all verification steps to unlock full platform features and increase your account security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationTab;