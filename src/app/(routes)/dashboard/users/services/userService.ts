import { User, UserStats } from '../types';
import { getAuthHeader } from '@/helper/helper';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Backend user data interface
interface BackendUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string | {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    level?: number;
  };
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  company?: string;
  createdBy?: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// API response interfaces
interface UsersApiResponse {
  data?: BackendUser[];
  users?: BackendUser[];
}



export class UserService {


  // Get users created by the logged-in user (new endpoint)
  static async getUsersCreatedByMe(): Promise<User[]> {
    try {
      // Check if we have authentication token
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Fetching users created by me from:', `${API_BASE_URL}/users/created-by-me`);

      const response = await fetch(`${API_BASE_URL}/users/created-by-me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch users created by you (${response.status}): ${errorText}`);
      }

      const data: UsersApiResponse = await response.json();
      console.log('API Response data:', data);

      const users = data.data || data.users || [];
      console.log('Extracted users created by me:', users);

      return this.transformBackendUsers(users);
    } catch (error) {
      console.error('Error fetching users created by me:', error);
      throw error;
    }
  }

  // Get user by ID (only users created by logged-in user)
  static async getUserById(id: string): Promise<User> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      console.log('Fetching user with ID:', id);

      const response = await fetch(`${API_BASE_URL}/users/created-by-me/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);

        if (response.status === 404) {
          throw new Error('User not found');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to view this user');
        }
        throw new Error(`Failed to fetch user (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      const backendUser = data.data;
      if (!backendUser) {
        throw new Error('User not found in response');
      }

      // Transform single backend user
      const users = this.transformBackendUsers([backendUser]);
      return users[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Update user status
  static async updateUserStatus(id: string, status: 'active' | 'inactive' | 'pending'): Promise<void> {
    try {
      const isActive = status === 'active';
      const response = await fetch(`${API_BASE_URL}/user/update/status/${id}/created-by-me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Update user role - now expects role ID
  static async updateUserRole(id: string, roleId: string): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      // Send the role ID directly to the backend
      const payload = { roleId };

      console.log('Role update details:', {
        userId: id,
        roleId,
        payload: JSON.stringify(payload)
      });

      const response = await fetch(`${API_BASE_URL}/user/update/role/${id}/created-by-me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Failed to update user role (${response.status})`);
        } catch {
          throw new Error(`Failed to update user role (${response.status}): ${errorText}`);
        }
      }

      console.log('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Assign company to user (from companies created by logged-in user)
  static async updateUserCompany(id: string, companyId: string | null): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const payload = { companyId };

      console.log('Assigning company to user:', {
        userId: id,
        companyId,
        payload: JSON.stringify(payload)
      });

      const response = await fetch(`${API_BASE_URL}/user/update/company/${id}/created-by-me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Failed to assign company to user (${response.status})`);
        } catch {
          throw new Error(`Failed to assign company to user (${response.status}): ${errorText}`);
        }
      }

      console.log('Company assigned to user successfully');
    } catch (error) {
      console.error('Error assigning company to user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/delete/${id}/created-by-me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Update user password
  static async updateUserPassword(id: string, newPassword: string): Promise<void> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/user/update/password/${id}/created-by-me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Failed to update password (${response.status})`);
        } catch {
          throw new Error(`Failed to update password (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }

  // Get all available roles
  static async getAllRoles(): Promise<string[]> {
    try {
      // Get all users to extract unique roles
      const users = await this.getUsersCreatedByMe();
      const rolesSet = new Set<string>();
      
      // Add default roles
      rolesSet.add('admin');
      rolesSet.add('moderator');
      rolesSet.add('user');
      
      // Add any other roles found in users
      users.forEach(user => {
        if (user.role && user.role.name) {
          rolesSet.add(user.role.name.toLowerCase());
        }
      });
      
      return Array.from(rolesSet);
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Return default roles on error
      return ['admin', 'moderator', 'user'];
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<UserStats[]> {
    try {
      const users = await this.getUsersCreatedByMe();
      
      // Calculate statistics based on users data
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const inactiveUsers = users.filter(u => u.status === 'inactive').length;
      const pendingUsers = users.filter(u => u.status === 'pending').length;
      
      // Calculate percentage changes (mock data for now)
      const stats: UserStats[] = [
        {
          title: 'Total Users',
          value: totalUsers.toString(),
          change: 12.5,
          changeType: 'increase',
          icon: Users,
          color: 'blue'
        },
        {
          title: 'Active Users',
          value: activeUsers.toString(),
          change: 8.3,
          changeType: 'increase',
          icon: UserCheck,
          color: 'green'
        },
        {
          title: 'Inactive Users',
          value: inactiveUsers.toString(),
          change: 2.1,
          changeType: 'decrease',
          icon: UserX,
          color: 'gray'
        },
        {
          title: 'Pending Users',
          value: pendingUsers.toString(),
          change: 5.4,
          changeType: 'increase',
          icon: Clock,
          color: 'yellow'
        }
      ];
      
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return default stats on error
      return [
        {
          title: 'Total Users',
          value: '0',
          change: 0,
          changeType: 'increase',
          icon: Users,
          color: 'blue'
        },
        {
          title: 'Active Users',
          value: '0',
          change: 0,
          changeType: 'increase',
          icon: UserCheck,
          color: 'green'
        },
        {
          title: 'Inactive Users',
          value: '0',
          change: 0,
          changeType: 'decrease',
          icon: UserX,
          color: 'gray'
        },
        {
          title: 'Pending Users',
          value: '0',
          change: 0,
          changeType: 'increase',
          icon: Clock,
          color: 'yellow'
        }
      ];
    }
  }



  // Transform backend user data to frontend format
  private static transformBackendUser(backendUser: BackendUser): User {
    const status = backendUser.isActive === false ? 'inactive' :
                  backendUser.isActive === true ? 'active' : 'pending';

    // Extract role information - handle both string and object types
    const roleInfo = this.extractRoleInfo(backendUser.role);

    // Extract assigned company ID (handle both populated object and string ID)
    let assignedCompanyId: string | undefined;
    const assignedCompanyField = (backendUser as any).assignedCompanyId;
    if (assignedCompanyField) {
      if (typeof assignedCompanyField === 'object') {
        // Populated company object
        assignedCompanyId = assignedCompanyField._id || assignedCompanyField.id;
      } else {
        // String ID
        assignedCompanyId = assignedCompanyField;
      }
    }

    return {
      id: backendUser._id || backendUser.id || '',
      firstName: backendUser.firstName || '',
      lastName: backendUser.lastName || '',
      email: backendUser.email || '',
      phone: backendUser.phone || '',
      assignedCompanyId: assignedCompanyId,
      role: {
        name: roleInfo.displayName,
        color: roleInfo.color,
        permissions: roleInfo.permissions,
      },
      status,
      lastLogin: backendUser.lastLogin ? formatDateTime(backendUser.lastLogin) : 'Never',
      createdAt: backendUser.createdAt || new Date().toISOString(),
      department: backendUser.company || 'General',
      permissions: roleInfo.permissions,
    };
  }

  // Transform backend users array
  private static transformBackendUsers(backendUsers: BackendUser[]): User[] {
    return backendUsers.map(user => this.transformBackendUser(user));
  }

  // Extract role information from backend role data (handles both string and object)
  private static extractRoleInfo(role: BackendUser['role']) {
    if (!role) {
      return {
        displayName: 'User',
        color: 'bg-gray-100 text-gray-800',
        permissions: ['profile.edit']
      };
    }

    // Handle populated role object
    if (typeof role === 'object' && role.name) {
      return {
        displayName: role.name,
        color: role.color || this.getRoleColorByName(role.name),
        permissions: this.getRolePermissionsByName(role.name)
      };
    }

    // Handle string role (legacy)
    if (typeof role === 'string') {
      return {
        displayName: this.formatRole(role),
        color: this.getRoleColor(role),
        permissions: this.getRolePermissions(role)
      };
    }

    // Fallback
    return {
      displayName: 'User',
      color: 'bg-gray-100 text-gray-800',
      permissions: ['profile.edit']
    };
  }

  // Format role name for display
  private static formatRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      'user': 'User',
      'admin': 'Admin', 
      'moderator': 'Moderator',
    };
    return roleMap[role.toLowerCase()] || 'User';
  }

  // Get role color based on role name
  private static getRoleColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      'admin': 'bg-purple-100 text-purple-800',
      'moderator': 'bg-blue-100 text-blue-800',
      'user': 'bg-gray-100 text-gray-800',
    };
    
    return roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  // Get permissions based on role
  private static getRolePermissions(role: string): string[] {
    const rolePermissions: { [key: string]: string[] } = {
      'admin': ['all'],
      'moderator': ['users.view', 'users.manage', 'invoices.view', 'reports.view'],
      'user': ['invoices.view', 'profile.edit'],
    };
    
    return rolePermissions[role.toLowerCase()] || ['profile.edit'];
  }

  // Get role color based on role name (for populated role objects)
  private static getRoleColorByName(roleName: string): string {
    const roleColors: { [key: string]: string } = {
      'super admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-blue-100 text-blue-800',
      'invoice manager': 'bg-green-100 text-green-800',
      'accountant': 'bg-yellow-100 text-yellow-800',
      'sales rep': 'bg-orange-100 text-orange-800',
      'hr manager': 'bg-pink-100 text-pink-800',
      'viewer': 'bg-gray-100 text-gray-800',
      'customer service': 'bg-cyan-100 text-cyan-800',
      'user': 'bg-gray-100 text-gray-800',
    };
    
    return roleColors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  // Get permissions based on role name (for populated role objects)
  private static getRolePermissionsByName(roleName: string): string[] {
    const rolePermissions: { [key: string]: string[] } = {
      'super admin': ['all'],
      'admin': ['all'],
      'invoice manager': ['invoices.manage', 'invoices.view', 'reports.view'],
      'accountant': ['invoices.view', 'reports.view', 'financial.manage'],
      'sales rep': ['invoices.create', 'invoices.view', 'customers.manage'],
      'hr manager': ['users.view', 'users.manage', 'reports.view'],
      'viewer': ['invoices.view', 'reports.view'],
      'customer service': ['customers.view', 'customers.manage', 'invoices.view'],
      'user': ['invoices.view', 'profile.edit'],
    };
    
    return rolePermissions[roleName.toLowerCase()] || ['profile.edit'];
  }

}

export default UserService;