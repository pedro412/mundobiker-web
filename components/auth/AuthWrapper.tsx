'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser, type User } from '@/lib/auth';

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        // Redirect to login if no user data
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children(user)}</>;
}
