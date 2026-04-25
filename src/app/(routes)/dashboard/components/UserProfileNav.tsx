'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { getAuthHeader, getCurrentUser, removeToken } from '@/helper/helper';
import { useTheme } from '@/contexts/ThemeContext';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  role?: {
    name: string;
  };
}

export default function UserProfileNav() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { gradientFrom, gradientTo } = useTheme();

  useEffect(() => {
    // Get immediate data from token
    const userFromToken = getCurrentUser();
    if (userFromToken) {
      setProfile({
        firstName: userFromToken.firstName,
        lastName: userFromToken.lastName,
        email: userFromToken.email,
        avatar: null,
        role: { name: 'User' }
      });
    }

    const fetchUserProfile = async () => {
      try {
        const authHeaders = getAuthHeader();
        if (!authHeaders.Authorization) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setProfile({
              firstName: data.data.firstName || '',
              lastName: data.data.lastName || '',
              email: data.data.email || '',
              avatar: data.data.avatarUrl || data.data.avatar || null,
              role: data.data.role || { name: 'User' }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const getUserDisplayName = () => {
    if (!profile) return 'Loading...';
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile.email || 'User';
  };

  const getUserInitials = () => {
    if (!profile) return 'U';
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    return profile.email ? profile.email.charAt(0).toUpperCase() : 'U';
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/authentication';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
      >
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` }}
        >
          {profile?.avatar && !avatarError ? (
            <Image
              src={profile.avatar}
              alt="Profile"
              width={32}
              height={32}
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {getUserInitials()}
            </span>
          )}
        </div>
        <div className="text-left">
          <span className="font-medium block text-sm">{getUserDisplayName()}</span>
          {profile?.role?.name && (
            <span className="text-xs text-gray-500">{profile.role.name}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>

      {profileDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setProfileDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
            {profile && (
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-gray-900">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile.email}
                </p>
              </div>
            )}
            <Link
              href="/dashboard/user-detail"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <User className="h-4 w-4 mr-3" />
              My Profile
            </Link>
            <Link
              href="/dashboard/settings?tab=appearance"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Link>
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
