'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TopNavigation() {
  const { state, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="flex justify-between items-center h-16 px-4 max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">🏍️ Mundo Biker</h1>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {state.isAuthenticated && state.user ? (
            <>
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {state.user.full_name || state.user.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">
                    {(state.user.full_name || state.user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Mobile User Info */}
              <div className="sm:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">
                    {(state.user.full_name || state.user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {state.user.full_name?.split(' ')[0] || 'Usuario'}
                </Badge>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
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
