export interface UserStats {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assignedCompanyId?: string; // Company ID assigned to this user by their creator
  role: {
    name: string;
    color: string;
    permissions: string[];
  };
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
  avatar?: string;
  department: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
  level: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
}

export interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  ip?: string;
  status: 'success' | 'failed' | 'warning';
}

export interface Department {
  id: string;
  name: string;
  userCount: number;
  head?: string;
}