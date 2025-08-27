'use client';

import { clubsApi } from '@/lib/api';
import { Club } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReadMoreText } from '@/components/ui/ReadMoreText';
import { useUserClubs, useIsMemberOfClub, useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Component that uses useSearchParams - needs to be wrapped in Suspense
function SearchParamsHandler({
  onSuccess,
  onRefreshClubs,
}: {
  onSuccess: () => void;
  onRefreshClubs: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessedSuccess = useRef(false);

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created' && !hasProcessedSuccess.current) {
      hasProcessedSuccess.current = true;
      onSuccess();
      onRefreshClubs();

      // Clear the success parameter from URL to prevent reprocessing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, onSuccess, onRefreshClubs, router]);

  return null;
}

function ClubsPageContent() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const userClubs = useUserClubs(); // Get user's clubs from dashboard context
  const isMemberOfClub = useIsMemberOfClub(); // Hook to check membership
  const { refreshDashboard } = useDashboard(); // Hook to refresh dashboard data
  const { state: authState } = useAuth();

  const handleSuccess = useCallback(() => {
    setShowSuccessMessage(true);
    // Auto-hide success message after 5 seconds
    setTimeout(() => setShowSuccessMessage(false), 5000);
  }, []);

  const handleRefreshClubs = useCallback(async () => {
    try {
      const clubsData = await clubsApi.getAll();
      setClubs(clubsData);
      // Also refresh dashboard to ensure userClubs is updated
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to refresh clubs:', err);
    }
  }, [refreshDashboard]);

  useEffect(() => {
    async function fetchClubs() {
      try {
        setLoading(true);
        const clubsData = await clubsApi.getAll();
        setClubs(clubsData);
      } catch (err) {
        console.error('Failed to fetch clubs:', err);
        setError('Failed to fetch clubs');
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, []);

  // Check if user is a member of a specific club
  const isUserMember = (clubId: number) => {
    return isMemberOfClub(clubId);
  };

  // Filter out user's clubs from the main clubs list
  const filteredClubs = clubs.filter((club) => !isUserMember(club.id));

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Clubes</h1>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando clubes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Clubes</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-800 font-medium">¡Club creado exitosamente!</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-600 hover:text-green-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Clubes</h1>
            {authState.isAuthenticated && (
              <Link href="/clubs/create">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Crear Club
                </button>
              </Link>
            )}
          </div>
          {authState.isAuthenticated && userClubs.length > 0 && (
            <p className="text-gray-600">
              Eres miembro de {userClubs.length} club{userClubs.length !== 1 ? 'es' : ''}
            </p>
          )}

          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && authState.isAuthenticated && (
            <div className="text-xs text-gray-400 mt-2">
              Debug: {userClubs.length} clubs from dashboard, {clubs.length} total clubs loaded,{' '}
              {filteredClubs.length} clubs after filtering
            </div>
          )}

          {/* Empty state for authenticated users with no clubs */}
          {authState.isAuthenticated && userClubs.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-yellow-800">
                  Aún no perteneces a ningún club. ¡Explora los clubes disponibles o crea uno nuevo!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Show user's clubs first if logged in */}
        {authState.isAuthenticated && userClubs.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-blue-800">Mis Clubes</h2>
                  <p className="text-blue-600">Clubes donde eres miembro o administrador</p>
                </div>
                <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                  {userClubs.length}
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userClubs.map((club) => (
                  <Link key={`user-${club.id}`} href={`/clubs/${club.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border-blue-300 bg-white">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center justify-between">
                          {club.name}
                          <Badge className="bg-blue-100 text-blue-800">Miembro</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {club.description && (
                          <ReadMoreText
                            text={club.description}
                            maxLength={120}
                            className="text-gray-600 mb-3 text-sm"
                          />
                        )}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 flex items-center">
                            📅 Fundado: {new Date(club.foundation_date).toLocaleDateString('es-MX')}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            👥 {club.total_members} miembros
                          </p>
                          {club.website && (
                            <Badge variant="secondary" className="text-xs">
                              🌐 Sitio web disponible
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All clubs section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {authState.isAuthenticated && userClubs.length > 0
              ? 'Otros Clubes'
              : 'Clubes Disponibles'}
          </h2>

          {filteredClubs.length === 0 ? (
            <p className="text-gray-600">
              {authState.isAuthenticated && userClubs.length > 0
                ? 'No hay otros clubes disponibles.'
                : 'No se encontraron clubes.'}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club) => (
                <Link key={club.id} href={`/clubs/${club.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-xl">{club.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {club.description && (
                        <ReadMoreText
                          text={club.description}
                          maxLength={120}
                          className="text-gray-600 mb-3 text-sm"
                        />
                      )}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 flex items-center">
                          📅 Fundado: {new Date(club.foundation_date).toLocaleDateString('es-MX')}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          👥 {club.total_members} miembros
                        </p>
                        {club.website && (
                          <Badge variant="secondary" className="text-xs">
                            🌐 Sitio web disponible
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <SearchParamsHandler onSuccess={handleSuccess} onRefreshClubs={handleRefreshClubs} />
      </Suspense>
    </>
  );
}

export default function ClubsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Clubes</h1>
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        </div>
      }
    >
      <ClubsPageContent />
    </Suspense>
  );
}
