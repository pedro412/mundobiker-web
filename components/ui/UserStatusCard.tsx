'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useDashboard,
  useUserClubs,
  useUserChapters,
  useUpcomingEvents,
  useDashboardStats,
  useIsMemberOfClub,
  useIsMemberOfChapter,
  useUserRoleInChapter,
} from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';

interface UserStatusCardProps {
  clubId?: number;
  chapterId?: number;
}

export function UserStatusCard({ clubId, chapterId }: UserStatusCardProps) {
  const { state: authState } = useAuth();
  const { dashboardOverview, isLoading, error } = useDashboard();
  const userClubs = useUserClubs();
  const userChapters = useUserChapters();
  const upcomingEvents = useUpcomingEvents();
  const stats = useDashboardStats();
  const isMemberOfClub = useIsMemberOfClub();
  const isMemberOfChapter = useIsMemberOfChapter();
  const getUserRoleInChapter = useUserRoleInChapter();

  if (!authState.isAuthenticated) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-gray-600">Inicia sesión para ver tu estado de membresía</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">Cargando información del usuario...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 border-red-200">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardOverview) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Estado del Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User info */}
        <div>
          <p className="font-medium">{authState.user?.full_name || authState.user?.username}</p>
          <p className="text-sm text-gray-600">{authState.user?.email}</p>
        </div>

        {/* Membership overview */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {userClubs.length} Club{userClubs.length !== 1 ? 'es' : ''}
          </Badge>
          <Badge variant="outline">
            {userChapters.length} Capítulo{userChapters.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline">
            {upcomingEvents.length} Evento{upcomingEvents.length !== 1 ? 's' : ''} próximos
          </Badge>
        </div>

        {/* Specific club/chapter membership status */}
        {(clubId || chapterId) && (
          <div className="border-t pt-4">
            {clubId && (
              <div className="mb-2">
                <span className="text-sm text-gray-600">Estado en este club: </span>
                {isMemberOfClub(clubId) ? (
                  <Badge className="bg-green-100 text-green-800">Miembro</Badge>
                ) : (
                  <Badge variant="outline">No es miembro</Badge>
                )}
              </div>
            )}

            {chapterId && (
              <div>
                <span className="text-sm text-gray-600">Estado en este capítulo: </span>
                {isMemberOfChapter(chapterId) ? (
                  <div className="inline-flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Miembro</Badge>
                    {getUserRoleInChapter(chapterId) && (
                      <Badge variant="secondary">{getUserRoleInChapter(chapterId)}</Badge>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">No es miembro</Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick stats */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Estadísticas generales:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Total clubes:</span> {stats.total_clubs}
            </div>
            <div>
              <span className="text-gray-500">Total capítulos:</span> {stats.total_chapters}
            </div>
            <div>
              <span className="text-gray-500">Total eventos:</span> {stats.total_events}
            </div>
            <div>
              <span className="text-gray-500">Total miembros:</span> {stats.total_members}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
