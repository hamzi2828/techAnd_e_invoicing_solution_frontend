'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  removeToken,
  getAuthToken,
  getRoleId,
  decodeJwt,
  JwtBasePayload,
  ROLE_IDS,
  refreshTokenCookie
} from '@/helper/helper';
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  show: boolean;
}

// Public routes that don't require authentication (moved outside component)
const publicRoutes = ['/authentication', '/main', '/', '/auth/callback'];

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    show: false
  });
  
  const router = useRouter();
  const pathname = usePathname();
  

  const showNotification = (message: string, type: NotificationState['type']) => {
    setNotification({ message, type, show: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const checkAuth = useCallback(async () => {
    try {
      // Special handling for login page
      if (pathname === '/authentication') {
        const token = getAuthToken();
        if (token) {
          try {
            const decoded = decodeJwt<JwtBasePayload>(token);
            if (decoded && decoded.exp && Date.now() < decoded.exp * 1000) {
              // Valid token exists, redirect based on role
              const roleId = getRoleId();
              if (roleId === ROLE_IDS.ADMIN || roleId === ROLE_IDS.SUPER_ADMIN) {
                router.push('/admin');
              } else {
                router.push('/dashboard');
              }
              return;
            } else {
              // Expired token, remove it
              removeToken();
            }
          } catch (error) {
            console.error('Token decode error:', error);
            removeToken();
          }
        }
        setIsLoading(false);
        return;
      }

      // Check if current route is public
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false);
        return;
      }

      // For protected routes, check authentication
      const token = getAuthToken();

      if (!token) {
        showNotification('Authentication required. Please log in.', 'error');
        setTimeout(() => router.push('/main'), 1000);
        return;
      }

      try {
        const decoded = decodeJwt<JwtBasePayload>(token);

        if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
          removeToken();
          showNotification('Session expired. Please log in again.', 'error');
          setTimeout(() => router.push('/main'), 1000);
          return;
        }

        // Refresh token cookie with proper settings
        refreshTokenCookie(token);

        const roleId = getRoleId();

        // Check role-based access for admin routes
        if (pathname.startsWith('/admin')) {
          // Only allow ADMIN and SUPER_ADMIN roles for admin routes
          if (roleId !== ROLE_IDS.ADMIN && roleId !== ROLE_IDS.SUPER_ADMIN) {
            showNotification('Unauthorized access. Redirecting to dashboard.', 'error');
            setTimeout(() => router.push('/dashboard'), 1500);
            return;
          }
        }

        // Check role-based access for dashboard routes
        if (pathname.startsWith('/dashboard')) {
          // Authenticated users can access dashboard
          // But if they're admin/super_admin, they might want to use /admin instead
          // (We'll allow access but you can add restrictions here if needed)
          setIsLoading(false);
          return;
        }

        // Additional permission checks can be added here
        // For now, we'll allow access if role check passes
        setIsLoading(false);

      } catch (error) {
        console.error('Authentication error:', error);
        removeToken();
        showNotification('Authentication error. Please log in again.', 'error');
        setTimeout(() => router.push('/main'), 1000);
      }

    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      {children}
    </>
  );
};

export default AuthMiddleware;