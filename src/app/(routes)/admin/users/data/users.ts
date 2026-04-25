import {
  Users,
  UserCheck,
  Clock,
  Activity,
} from 'lucide-react';
import { UserStats, User, Role, Permission, Activity as UserActivity, Department } from '../types';

export const userStats: UserStats[] = [
  {
    title: 'Total Users',
    value: '125',
    change: 8.2,
    changeType: 'increase',
    icon: Users,
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  {
    title: 'Active Users',
    value: '98',
    change: 5.1,
    changeType: 'increase',
    icon: UserCheck,
    color: 'bg-gradient-to-br from-green-500 to-emerald-500',
  },
  {
    title: 'Pending Approval',
    value: '12',
    change: -2.3,
    changeType: 'decrease',
    icon: Clock,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
  },
  {
    title: 'Online Now',
    value: '24',
    change: 12.5,
    changeType: 'increase',
    icon: Activity,
    color: 'bg-gradient-to-br from-purple-500 to-violet-500',
  },
];

export const users: User[] = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    email: 'ahmed.rashid@company.sa',
    phone: '+966 50 123 4567',
    role: {
      name: 'Super Admin',
      color: 'bg-purple-100 text-purple-800',
      permissions: ['all']
    },
    status: 'active',
    lastLogin: '2024-01-20 14:30',
    createdAt: '2023-01-15',
    department: 'IT',
    permissions: ['all']
  },
  {
    id: '2',
    firstName: 'Sara',
    lastName: 'Abdullah',
    email: 'sara.abdullah@company.sa',
    phone: '+966 55 987 6543',
    role: {
      name: 'Admin',
      color: 'bg-blue-100 text-blue-800',
      permissions: ['invoices.create', 'invoices.edit', 'customers.manage']
    },
    status: 'active',
    lastLogin: '2024-01-20 09:15',
    createdAt: '2023-03-10',
    department: 'Finance',
    permissions: ['invoices.create', 'invoices.edit', 'customers.manage']
  },
  {
    id: '3',
    firstName: 'Mohammed',
    lastName: 'Hassan',
    email: 'mohammed.hassan@company.sa',
    phone: '+966 50 555 5555',
    role: {
      name: 'Invoice Manager',
      color: 'bg-green-100 text-green-800',
      permissions: ['invoices.create', 'invoices.edit', 'invoices.send']
    },
    status: 'active',
    lastLogin: '2024-01-19 16:45',
    createdAt: '2023-06-20',
    department: 'Sales',
    permissions: ['invoices.create', 'invoices.edit', 'invoices.send']
  },
  {
    id: '4',
    firstName: 'Fatima',
    lastName: 'Al-Zahrani',
    email: 'fatima.zahrani@company.sa',
    phone: '+966 54 222 2222',
    role: {
      name: 'Accountant',
      color: 'bg-yellow-100 text-yellow-800',
      permissions: ['invoices.view', 'reports.view', 'customers.view']
    },
    status: 'inactive',
    lastLogin: '2024-01-15 11:20',
    createdAt: '2023-08-05',
    department: 'Accounting',
    permissions: ['invoices.view', 'reports.view', 'customers.view']
  },
  {
    id: '5',
    firstName: 'Khalid',
    lastName: 'Ibrahim',
    email: 'khalid.ibrahim@company.sa',
    phone: '+966 50 777 7777',
    role: {
      name: 'Sales Rep',
      color: 'bg-orange-100 text-orange-800',
      permissions: ['invoices.create', 'customers.view', 'products.view']
    },
    status: 'pending',
    lastLogin: 'Never',
    createdAt: '2024-01-18',
    department: 'Sales',
    permissions: ['invoices.create', 'customers.view', 'products.view']
  },
  {
    id: '6',
    firstName: 'Nadia',
    lastName: 'Omar',
    email: 'nadia.omar@company.sa',
    phone: '+966 56 333 3333',
    role: {
      name: 'HR Manager',
      color: 'bg-pink-100 text-pink-800',
      permissions: ['users.view', 'users.manage', 'reports.view']
    },
    status: 'active',
    lastLogin: '2024-01-20 11:22',
    createdAt: '2023-04-12',
    department: 'HR',
    permissions: ['users.view', 'users.manage', 'reports.view']
  },
];

export const roles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: ['all'],
    userCount: 2,
    color: 'bg-purple-100 text-purple-800',
    level: 1,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access to most features',
    permissions: ['invoices.create', 'invoices.edit', 'customers.manage', 'users.view'],
    userCount: 8,
    color: 'bg-blue-100 text-blue-800',
    level: 2,
  },
  {
    id: '3',
    name: 'Invoice Manager',
    description: 'Full invoice management capabilities',
    permissions: ['invoices.create', 'invoices.edit', 'invoices.send', 'customers.view'],
    userCount: 15,
    color: 'bg-green-100 text-green-800',
    level: 3,
  },
  {
    id: '4',
    name: 'Accountant',
    description: 'View and report on financial data',
    permissions: ['invoices.view', 'reports.view', 'customers.view'],
    userCount: 12,
    color: 'bg-yellow-100 text-yellow-800',
    level: 4,
  },
  {
    id: '5',
    name: 'Sales Rep',
    description: 'Create invoices and manage customer relationships',
    permissions: ['invoices.create', 'customers.view', 'products.view'],
    userCount: 25,
    color: 'bg-orange-100 text-orange-800',
    level: 5,
  },
  {
    id: '6',
    name: 'HR Manager',
    description: 'Manage users and access HR reports',
    permissions: ['users.view', 'users.manage', 'reports.view'],
    userCount: 3,
    color: 'bg-pink-100 text-pink-800',
    level: 3,
  },
];

export const permissions: Permission[] = [
  {
    id: 'invoices.create',
    name: 'Create Invoices',
    description: 'Ability to create new invoices',
    category: 'Invoices',
  },
  {
    id: 'invoices.edit',
    name: 'Edit Invoices',
    description: 'Ability to modify existing invoices',
    category: 'Invoices',
  },
  {
    id: 'invoices.view',
    name: 'View Invoices',
    description: 'Ability to view invoice data',
    category: 'Invoices',
  },
  {
    id: 'invoices.send',
    name: 'Send Invoices',
    description: 'Ability to send invoices to customers',
    category: 'Invoices',
  },
  {
    id: 'customers.manage',
    name: 'Manage Customers',
    description: 'Full customer management access',
    category: 'Customers',
  },
  {
    id: 'customers.view',
    name: 'View Customers',
    description: 'Ability to view customer information',
    category: 'Customers',
  },
  {
    id: 'users.manage',
    name: 'Manage Users',
    description: 'Create, edit, and delete user accounts',
    category: 'Users',
  },
  {
    id: 'users.view',
    name: 'View Users',
    description: 'Ability to view user information',
    category: 'Users',
  },
  {
    id: 'reports.view',
    name: 'View Reports',
    description: 'Access to system reports and analytics',
    category: 'Reports',
  },
  {
    id: 'products.view',
    name: 'View Products',
    description: 'Ability to view product catalog',
    category: 'Products',
  },
];

export const recentActivity: UserActivity[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'Ahmed Al-Rashid',
    },
    action: 'Created new invoice',
    target: 'INV-2024-001',
    timestamp: '2024-01-20 14:30',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Sara Abdullah',
    },
    action: 'Updated customer information',
    target: 'Customer: ABC Corp',
    timestamp: '2024-01-20 13:45',
    ip: '192.168.1.101',
    status: 'success',
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Mohammed Hassan',
    },
    action: 'Failed login attempt',
    timestamp: '2024-01-20 12:30',
    ip: '192.168.1.102',
    status: 'failed',
  },
  {
    id: '4',
    user: {
      id: '4',
      name: 'Fatima Al-Zahrani',
    },
    action: 'Generated monthly report',
    target: 'Report: January 2024',
    timestamp: '2024-01-20 11:15',
    ip: '192.168.1.103',
    status: 'success',
  },
  {
    id: '5',
    user: {
      id: '5',
      name: 'Khalid Ibrahim',
    },
    action: 'Password reset requested',
    timestamp: '2024-01-20 10:00',
    ip: '192.168.1.104',
    status: 'warning',
  },
];

export const departments: Department[] = [
  {
    id: '1',
    name: 'IT',
    userCount: 8,
    head: 'Ahmed Al-Rashid',
  },
  {
    id: '2',
    name: 'Finance',
    userCount: 15,
    head: 'Sara Abdullah',
  },
  {
    id: '3',
    name: 'Sales',
    userCount: 32,
    head: 'Mohammed Hassan',
  },
  {
    id: '4',
    name: 'Accounting',
    userCount: 12,
    head: 'Fatima Al-Zahrani',
  },
  {
    id: '5',
    name: 'HR',
    userCount: 6,
    head: 'Nadia Omar',
  },
];