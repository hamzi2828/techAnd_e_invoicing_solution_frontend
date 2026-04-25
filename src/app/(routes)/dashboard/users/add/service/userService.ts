import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: string;
  companyId?: string;
  accountStatus?: string;
  language?: string;
  sendWelcomeEmail?: boolean;
  forcePasswordChange?: boolean;
  enableTwoFactor?: boolean;
  sendEmailNotifications?: boolean;
}

export interface CreateUserResponse {
  message: string;
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export class UserService {
  /**
   * Create a new user (Register user by admin)
   * Automatically includes the current user's ID as createdBy
   */
  static async createUser(userData: CreateUserData): Promise<CreateUserResponse> {
    try {
      const authHeaders = getAuthHeader();

      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      // Prepare request body
      const requestBody = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role,
        companyId: userData.companyId || undefined,
        isActive: userData.accountStatus === 'active',
      };

      const response = await fetch(`${API_BASE_URL}/user/register/created-by-me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to register user' }));
        throw new Error(errorData.message || `Failed to register user (${response.status})`);
      }

      const data: CreateUserResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Validate user data before submission
   */
  static validateUserData(userData: CreateUserData): string[] {
    const errors: string[] = [];

    if (!userData.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!userData.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!userData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(userData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!userData.password) {
      errors.push('Password is required');
    } else if (userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (userData.password !== userData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!userData.role) {
      errors.push('Please select a role');
    }

    return errors;
  }
}

export default UserService;
