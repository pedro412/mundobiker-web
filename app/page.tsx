'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth, type User } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardContent({ user }: { user: User }) {
  console.log(user);

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 pb-20">
      {/* Dashboard Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Panel de Control</h1>

      {/* Dashboard Cards */}
      <div className="grid gap-4 w-full max-w-4xl md:grid-cols-2 mb-6">
        <Link href="/clubs">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200 group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Clubes
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Gestionar clubes de motocicletas y explorar la comunidad
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/events">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-green-200 group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Eventos
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Explorar próximos eventos y reuniones de motociclistas
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* User Profile Card */}
        <Link href="/profile">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-purple-200 group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Mi Perfil
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Gestionar información personal y preferencias
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Settings Card */}
        <Link href="/settings">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-gray-200 group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Configuración
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Ajustar preferencias y configuración de la aplicación
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="w-full max-w-4xl">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Acceso Rápido
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">🏍️</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Comunidad</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">📅</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Eventos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">👥</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Miembros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">🛣️</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Rutas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function Home() {
  const { state } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  return <DashboardContent user={state.user} />;
}
