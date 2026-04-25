'use client';

import React, { useEffect, useState } from 'react';

/**
 * Hook to ensure safe hydration by only rendering after client mount
 * Useful for preventing hydration mismatches caused by browser extensions or client-only features
 */
export const useHydrationSafe = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};

/**
 * Component wrapper for hydration-safe rendering
 */
export const HydrationSafe = ({
  children,
  fallback = null
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const isHydrated = useHydrationSafe();

  if (!isHydrated) {
    return React.createElement(React.Fragment, null, fallback);
  }

  return React.createElement(React.Fragment, null, children);
};