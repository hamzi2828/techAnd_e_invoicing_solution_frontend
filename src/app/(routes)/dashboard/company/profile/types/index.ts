export interface CompanyProfile {
  basicInfo: {
    companyName: string;
    tradeName: string;
    registrationNumber: string;
    taxNumber: string;
    industry: string;
    establishedDate: string;
    description: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessInfo: {
    businessType: string;
    employeeCount: string;
    annualRevenue: string;
    currency: string;
    businessHours: string;
    timezone: string;
  };
  branding: {
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
    companyTagline: string;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    documentsVerified: boolean;
    taxVerified: boolean;
  };
}

export interface TabItem {
  id: string;
  name: string;
  icon: React.ElementType;
}