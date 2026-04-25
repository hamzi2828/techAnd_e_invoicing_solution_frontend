'use client';

import { useEffect, useState } from 'react';

interface NoSSRWrapperProps {
  children: React.ReactNode;
}

const NoSSRWrapper: React.FC<NoSSRWrapperProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
};

export default NoSSRWrapper;