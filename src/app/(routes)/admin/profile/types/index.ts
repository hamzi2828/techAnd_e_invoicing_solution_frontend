export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  bio?: string;
  role: {
    id: string;
    name: string;
    color: string;
  };
  avatar?: string | null;
  isActive: boolean;
  joinedDate: string;
  lastLogin: string;
  preferences: {
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  connectedAccounts: {
    google: {
      connected: boolean;
      email?: string;
      id?: string;
    };
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  preferences?: {
    timezone?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
  };
}

export interface ChangePasswordData {
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: BackendProfileData;
  error?: string;
}

export interface BackendProfileData {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  bio?: string;
  role?: {
    _id?: string;
    id?: string;
    name?: string;
    color?: string;
  };
  avatarUrl?: string | null;
  avatar?: string | null;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
  preferences?: {
    timezone?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
  };
  twoFactorEnabled?: boolean;
  lastPasswordChange?: string;
  provider?: string;
  googleId?: string;
}