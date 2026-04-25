import { useState, useEffect, useCallback } from 'react';
import { User, UserStats } from '../types';
import { UserService } from '../services/userService';

interface UseUsersReturn {
  users: User[];
  userStats: UserStats[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  updateUserStatus: (id: string, status: 'active' | 'inactive' | 'pending') => Promise<void>;
  updateUserRole: (id: string, role: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users (only users created by the logged-in user)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, statsData] = await Promise.all([
        UserService.getUsersCreatedByMe(), // Use new endpoint to get only users created by me
        UserService.getUserStats()
      ]);

      setUsers(usersData);
      setUserStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh users data
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Update user status
  const updateUserStatus = useCallback(async (id: string, status: 'active' | 'inactive' | 'pending') => {
    try {
      setError(null);
      await UserService.updateUserStatus(id, status);
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id ? { ...user, status } : user
        )
      );

      // Refresh stats
      const newStats = await UserService.getUserStats();
      setUserStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      throw err;
    }
  }, []);

  // Update user role
  const updateUserRole = useCallback(async (id: string, role: string) => {
    try {
      setError(null);
      await UserService.updateUserRole(id, role);
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id 
            ? { 
                ...user, 
                role: { 
                  ...user.role, 
                  name: role,
                  color: getRoleColor(role)
                }
              } 
            : user
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err;
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: string) => {
    try {
      setError(null);
      await UserService.deleteUser(id);

      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

      // Refresh stats
      const newStats = await UserService.getUserStats();
      setUserStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, []);

  // Helper function to get role color
  const getRoleColor = (role: string): string => {
    const roleColors: { [key: string]: string } = {
      'Super Admin': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-blue-100 text-blue-800',
      'Invoice Manager': 'bg-green-100 text-green-800',
      'Accountant': 'bg-yellow-100 text-yellow-800',
      'Sales Rep': 'bg-orange-100 text-orange-800',
      'HR Manager': 'bg-pink-100 text-pink-800',
      'User': 'bg-gray-100 text-gray-800',
    };
    
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    userStats,
    loading,
    error,
    refreshUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
  };
};

export default useUsers;