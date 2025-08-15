'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Icons using simple SVGs for better mobile performance
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const ClubsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const LoginIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

interface BottomNavigationProps {}

export default function BottomNavigation({}: BottomNavigationProps) {
  const pathname = usePathname();
  const { state } = useAuth();
  const isLoggedIn = state.isAuthenticated;

  const navigationItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: HomeIcon,
      isActive: pathname === '/',
    },
    {
      href: '/clubs',
      label: 'Clubes',
      icon: ClubsIcon,
      isActive: pathname.startsWith('/clubs') || pathname.startsWith('/chapters'),
    },
    {
      href: isLoggedIn ? '/profile' : '/auth/login',
      label: isLoggedIn ? 'Perfil' : 'Entrar',
      icon: isLoggedIn ? UserIcon : LoginIcon,
      isActive: pathname.startsWith('/auth') || pathname.startsWith('/profile'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className={cn(
                  'flex flex-col items-center justify-center h-full w-full gap-1 p-2',
                  'hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
                  item.isActive
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900'
                    : 'text-gray-700 dark:text-gray-200'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Safe area utility for iOS devices
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen pb-16">{children}</div>;
}
