import { Permission } from '../../types';

export interface SelectedPermissions {
  [category: string]: string[];
}

export interface RoleFormData {
  roleName: string;
  roleDescription: string;
  selectedPermissions: SelectedPermissions;
}

export interface CategoryPermissions {
  [category: string]: Permission[];
}
