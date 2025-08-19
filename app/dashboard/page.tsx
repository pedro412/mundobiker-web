'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useDashboard,
  useUserClubs,
  useUserChapters,
  useUpcomingEvents,
  useDashboardStats,
} from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { UserStatusCard } from '@/components/ui/UserStatusCard';

export default function DashboardPage() {
  const { state: authState } = useAuth();
  const { dashboardOverview, isLoading, error, refreshDashboard } = useDashboard();
  const userClubs = useUserClubs();
  const userChapters = useUserChapters();
  const upcomingEvents = useUpcomingEvents();
  const stats = useDashboardStats();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authState.isLoading, authState.isAuthenticated, router]);

  // Show loading state
  if (authState.isLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!authState.isAuthenticated || !authState.user) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error al cargar el dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshDashboard}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={refreshDashboard}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* User Status Card */}
      <UserStatusCard />

      {/* Welcome Message */}
      {authState.user && (
        <div className="mb-6">
          <p className="text-lg text-gray-600">
            Bienvenido,{' '}
            <span className="font-semibold">
              {authState.user.full_name || authState.user.username}
            </span>
          </p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_clubs}</div>
            <p className="text-sm text-gray-600">Clubes Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total_chapters}</div>
            <p className="text-sm text-gray-600">Capítulos Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total_events}</div>
            <p className="text-sm text-gray-600">Eventos Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.total_members}</div>
            <p className="text-sm text-gray-600">Miembros Totales</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Clubs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Mis Clubes
              <Badge variant="secondary">{userClubs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userClubs.length === 0 ? (
              <p className="text-gray-600">No perteneces a ningún club todavía.</p>
            ) : (
              <div className="space-y-3">
                {userClubs.slice(0, 3).map((club) => (
                  <div key={club.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{club.name}</p>
                      <p className="text-sm text-gray-600">{club.total_members} miembros</p>
                    </div>
                    <Link href={`/clubs/${club.id}`} className="text-blue-600 hover:text-blue-800">
                      Ver
                    </Link>
                  </div>
                ))}
                {userClubs.length > 3 && (
                  <p className="text-sm text-gray-600">+ {userClubs.length - 3} más</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Chapters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Mis Capítulos
              <Badge variant="secondary">{userChapters.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userChapters.length === 0 ? (
              <p className="text-gray-600">No perteneces a ningún capítulo todavía.</p>
            ) : (
              <div className="space-y-3">
                {userChapters.slice(0, 3).map((chapter) => (
                  <div key={chapter.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{chapter.name}</p>
                      <p className="text-sm text-gray-600">
                        {chapter.location && `📍 ${chapter.location}`}
                      </p>
                    </div>
                    <Link
                      href={`/chapters/${chapter.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Ver
                    </Link>
                  </div>
                ))}
                {userChapters.length > 3 && (
                  <p className="text-sm text-gray-600">+ {userChapters.length - 3} más</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Próximos Eventos
              <Badge variant="secondary">{upcomingEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-600">No hay eventos próximos programados.</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      📅 {new Date(event.date).toLocaleDateString('es-MX')}
                    </p>
                    {event.location && <p className="text-sm text-gray-600">📍 {event.location}</p>}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
                {upcomingEvents.length > 3 && (
                  <div className="text-center">
                    <Link href="/events" className="text-blue-600 hover:text-blue-800 text-sm">
                      Ver todos los eventos ({upcomingEvents.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && dashboardOverview && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug: Dashboard Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(dashboardOverview, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
