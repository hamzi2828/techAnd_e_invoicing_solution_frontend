import { Role, Permission } from '../types';
import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Backend role data interface
interface BackendRole {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  permissions: string[];
  userCount?: number;
  color?: string;
  level?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Backend permission data interface
interface BackendPermission {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

// API response interfaces
interface RolesApiResponse {
  data?: BackendRole[];
  roles?: BackendRole[];
  success?: boolean;
  message?: string;
}

interface PermissionsApiResponse {
  data?: BackendPermission[];
  permissions?: BackendPermission[];
  success?: boolean;
  message?: string;
}

interface RoleApiResponse {
  data?: BackendRole;
  role?: BackendRole;
  success?: boolean;
  message?: string;
}

export class RolesService {
  // Get all roles
  static async getAllRoles(): Promise<Role[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch roles (${response.status}): ${errorText}`);
      }

      const data: RolesApiResponse = await response.json();
      const roles = data.data || data.roles || [];
      
      return this.transformBackendRoles(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  // Get all permissions
  static async getAllPermissions(): Promise<Permission[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/permissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch permissions (${response.status}): ${errorText}`);
      }

      const data: PermissionsApiResponse = await response.json();
      const permissions = data.data || data.permissions || [];
      
      return this.transformBackendPermissions(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  // Get role by ID
  static async getRoleById(id: string): Promise<Role> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch role');
      }

      const data: RoleApiResponse = await response.json();
      const role = data.data || data.role;
      
      if (!role) {
        throw new Error('Role not found');
      }

      return this.transformBackendRole(role);
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  // Create new role
  static async createRole(roleData: Partial<Role>): Promise<Role> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(this.transformToBackendRole(roleData)),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create role: ${errorText}`);
      }

      const data: RoleApiResponse = await response.json();
      const role = data.data || data.role;
      
      if (!role) {
        throw new Error('Failed to create role');
      }

      return this.transformBackendRole(role);
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Update role
  static async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(this.transformToBackendRole(roleData)),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update role: ${errorText}`);
      }

      const data: RoleApiResponse = await response.json();
      const role = data.data || data.role;
      
      if (!role) {
        throw new Error('Failed to update role');
      }

      return this.transformBackendRole(role);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  // Delete role
  static async deleteRole(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete role: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Transform backend role data to frontend format
  private static transformBackendRole(backendRole: BackendRole): Role {
    // Handle permissions - extract permission IDs from populated objects
    let permissions: string[] = [];
    
    if (Array.isArray(backendRole.permissions) && backendRole.permissions.length > 0) {
      // Check if permissions are populated with objects
      if (typeof backendRole.permissions[0] === 'object') {
        // Permissions are populated objects, extract IDs (ObjectId strings)
        permissions = (backendRole.permissions as Array<{_id?: string; id?: string}>).map(p => p._id || p.id).filter((id): id is string => id !== undefined);
      } else {
        // Permissions are just ObjectId strings
        permissions = backendRole.permissions as string[];
      }
    } else if ((backendRole as unknown as Record<string, unknown>).permissionIds && Array.isArray((backendRole as unknown as Record<string, unknown>).permissionIds)) {
      // Fallback to permissionIds if permissions array is not populated
      const permissionIds = (backendRole as unknown as Record<string, unknown>).permissionIds as string[];
      if (permissionIds.includes('all')) {
        // If role has "all" permissions, we need to get all available permissions
        // This will be handled in the component when loading existing role
        permissions = permissionIds;
      } else {
        permissions = permissionIds;
      }
    }

    return {
      id: backendRole._id || backendRole.id || '',
      name: backendRole.name || '',
      description: backendRole.description || '',
      permissions: permissions,
      userCount: backendRole.userCount || 0,
      color: backendRole.color || this.getDefaultRoleColor(backendRole.name),
      level: backendRole.level || this.getRoleLevel(backendRole.name),
    };
  }

  // Transform backend roles array
  private static transformBackendRoles(backendRoles: BackendRole[]): Role[] {
    return backendRoles.map(role => this.transformBackendRole(role));
  }

  // Transform backend permission data to frontend format
  private static transformBackendPermission(backendPermission: BackendPermission): Permission {
    return {
      id: backendPermission._id || backendPermission.id || '',
      name: backendPermission.name || '',
      description: backendPermission.description || '',
      category: backendPermission.category || 'General',
    };
  }

  // Transform backend permissions array
  private static transformBackendPermissions(backendPermissions: BackendPermission[]): Permission[] {
    return backendPermissions.map(permission => this.transformBackendPermission(permission));
  }

  // Transform frontend role data to backend format
  private static transformToBackendRole(role: Partial<Role>): Partial<BackendRole> {
    return {
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      color: role.color,
      level: role.level,
    };
  }

  // Get default color for role based on name
  private static getDefaultRoleColor(roleName: string): string {
    const roleColors: { [key: string]: string } = {
      'super admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'admin': 'bg-blue-100 text-blue-800 border-blue-200',
      'manager': 'bg-green-100 text-green-800 border-green-200',
      'user': 'bg-gray-100 text-gray-800 border-gray-200',
      'viewer': 'bg-slate-100 text-slate-800 border-slate-200',
    };
    
    const normalizedName = roleName.toLowerCase();
    return roleColors[normalizedName] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  // Get role level based on name
  private static getRoleLevel(roleName: string): number {
    const roleLevels: { [key: string]: number } = {
      'super admin': 1,
      'admin': 2,
      'manager': 3,
      'user': 4,
      'viewer': 5,
    };
    
    const normalizedName = roleName.toLowerCase();
    return roleLevels[normalizedName] || 4;
  }

}

export default RolesService;