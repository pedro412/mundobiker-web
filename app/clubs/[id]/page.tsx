'use client';

import { useState, useEffect } from 'react';
import { clubsApi, chaptersApi } from '@/lib/api';
import { Club, Chapter } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ReadMoreText } from '@/components/ui/ReadMoreText';
import { sortMembersByRole } from '@/components/ui/RoleBadge';
import { UserCard } from '@/components/ui/UserCard';
import { ChapterList } from '@/components/ui/ChapterList';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ClubDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getClub(id: string): Promise<Club | null> {
  try {
    return await clubsApi.getById(id);
  } catch (error) {
    console.error('Failed to fetch club:', error);
    return null;
  }
}

async function getChapters(clubId: string): Promise<Chapter[]> {
  try {
    return await chaptersApi.getByClub(clubId);
  } catch (error) {
    console.error('Failed to fetch chapters:', error);
    return [];
  }
}

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  const [club, setClub] = useState<Club | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { state: authState } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setClubId(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!clubId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const [clubData, chaptersData] = await Promise.all([getClub(clubId), getChapters(clubId)]);

        if (!clubData) {
          setError('Club no encontrado');
          return;
        }

        setClub(clubData);
        setChapters(chaptersData);
      } catch (err) {
        console.error('Failed to fetch club data:', err);
        setError('Error al cargar los datos del club');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clubId]);

  // Check for success message from chapter creation
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'chapter-created') {
      setShowSuccessMessage(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);

      // Refresh chapters list to show the new chapter
      if (clubId) {
        getChapters(clubId)
          .then((chaptersData) => {
            setChapters(chaptersData);
          })
          .catch((error) => {
            console.error('Failed to refresh chapters:', error);
          });
      }
    }
  }, [searchParams, clubId]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando club...</span>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || 'Club no encontrado'}</p>
        </div>
      </div>
    );
  }

  // Helper function to find chapter by member's chapter_id
  const findMemberChapter = (member: any) => {
    if (!member.chapter_id) return undefined;
    return chapters.find((chapter) => String(chapter.id) === String(member.chapter_id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
              <p className="text-green-800 font-medium">¡Capítulo creado exitosamente!</p>
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

      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/clubs">Clubes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-gray-900 font-medium">{club.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Club details */}
      <Card className="shadow-lg" data-testid="card-header-club">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-4xl font-bold text-gray-900 mb-2">{club.name}</CardTitle>
              <p className="text-lg text-gray-600">
                Fundado:{' '}
                {new Date(club.foundation_date).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p>👤 {club.total_members}</p>
            </div>
            <OptimizedImage
              src={club.logo}
              alt={`${club.name} logo`}
              width={96}
              height={96}
              className="w-24 h-24 object-contain rounded-lg"
            />
          </div>
        </CardHeader>
        {/* Featured Members */}
        {Array.isArray((club as any).featured_members) &&
          (club as any).featured_members.length > 0 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Miembros Destacados ({(club as any).featured_members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortMembersByRole((club as any).featured_members).map((member: any) => {
                    const memberChapter = findMemberChapter(member);
                    return (
                      <UserCard
                        key={member.id}
                        user={member}
                        chapter={memberChapter}
                        showBirthDate={true}
                        showJoinDate={false}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </>
          )}
        <CardContent className="space-y-6">
          {/* Description */}
          {club.description && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Acerca de</h2>
              <ReadMoreText
                text={club.description}
                maxLength={300}
                className="text-gray-700 leading-relaxed"
              />
            </div>
          )}

          {/* Website link */}
          {club.website && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sitio Web</h2>
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                🌐 {club.website}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}

          {/* Chapters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Capítulos ({chapters.length})
              </h2>
              {authState.isAuthenticated && (
                <Link href={`/clubs/${clubId}/chapters/create`}>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Crear Capítulo
                  </button>
                </Link>
              )}
            </div>
            <ChapterList chapters={chapters} />
          </div>

          {/* Metadata */}
          <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Detalles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">ID del Club:</span> {club.id}
              </div>
              <div>
                <span className="font-medium">Creado:</span>{' '}
                {new Date(club.created_at).toLocaleDateString('es-MX')}
              </div>
              <div>
                <span className="font-medium">Última Actualización:</span>{' '}
                {new Date(club.updated_at).toLocaleDateString('es-MX')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
