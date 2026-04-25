export interface CompanyData {
  basicInfo: {
    companyName: string;
    tradeName: string;
    registrationNumber: string;
    taxNumber: string;
    industry: string;
    establishedDate: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website: string;
    address: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessInfo: {
    businessType: string;
    employeeCount: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | '';
    annualRevenue: string;
    currency: 'SAR' | 'USD' | 'EUR';
  };
  documents: {
    logo: File | null;
    commercialRegister: File | null;
    taxCertificate: File | null;
  };
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidFields {
  [key: string]: boolean;
}

export interface StepConfig {
  id: number;
  name: string;
  icon: React.ElementType;
}
