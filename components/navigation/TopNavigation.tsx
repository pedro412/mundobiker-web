'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TopNavigation() {
  const { state, logout } = useAuth();
  const router = useRouter();

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Ignore localStorage errors
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    try {
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', theme);
    } catch {
      // ignore localStorage errors
    }
  }, [theme]);

  const handleToggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-50 shadow-sm">
      <div className="flex justify-between items-center h-16 px-4 max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-300">🏍️ Mundo Biker</h1>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {state.isAuthenticated && state.user ? (
            <>
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {state.user.full_name || state.user.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 text-sm font-semibold">
                    {(state.user?.full_name || state.user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Mobile User Info */}
              <div className="sm:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 text-sm font-semibold">
                    {(state.user?.full_name || state.user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {state.user.full_name?.split(' ')[0] || 'Usuario'}
                </Badge>
              </div>

              {/* Theme toggle */}
              <Button variant="ghost" size="sm" onClick={handleToggleTheme} className="px-2">
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m8-9h1M3 12H2m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m8-9h1M3 12H2m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7"
                    />
                    <circle cx="12" cy="12" r="5" strokeWidth={2} />
                  </svg>
                )}
              </Button>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </>
          ) : (
            // Not authenticated - show login hint
            <div className="text-gray-500 text-sm">¡Bienvenido a la comunidad!</div>
          )}
        </div>
      </div>
    </nav>
  );
}
