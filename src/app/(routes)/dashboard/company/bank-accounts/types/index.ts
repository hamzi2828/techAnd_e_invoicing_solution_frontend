export interface BankAccount {
  _id?: string; // MongoDB ObjectId
  id?: string; // For compatibility
  userId?: string;
  companyId?: string; // Company this bank account belongs to
  accountName: string;
  accountNumber: string;
  iban: string;
  bankName: string;
  bankCode: string;
  branchName?: string;
  branchCode?: string;
  currency: string;
  accountType: 'checking' | 'savings' | 'business' | 'investment';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isDefault: boolean;
  balance?: number;
  lastTransaction?: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  metadata?: {
    swiftCode?: string;
    routingNumber?: string;
    correspondentBank?: string;
  };
  verificationDocuments?: Array<{
    documentType: 'bank_statement' | 'account_certificate' | 'iban_certificate';
    documentUrl: string;
    uploadedAt: string;
  }>;
  __v?: number; // MongoDB version field
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountForm {
  companyId: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  currency: string;
  accountType: 'checking' | 'savings' | 'business' | 'investment';
}