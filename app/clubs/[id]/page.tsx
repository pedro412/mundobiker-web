import { clubsApi, chaptersApi } from '@/lib/api';
import { Club, Chapter } from '@/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { sortMembersByRole } from '@/components/ui/RoleBadge';
import { UserCard } from '@/components/ui/UserCard';
import { ChapterList } from '@/components/ui/ChapterList';
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

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { id } = await params;
  const [club, chapters] = await Promise.all([getClub(id), getChapters(id)]);

  if (!club) {
    notFound();
  }

  // Helper function to find chapter by member's chapter_id
  const findMemberChapter = (member: any) => {
    if (!member.chapter_id) return undefined;
    return chapters.find((chapter) => String(chapter.id) === String(member.chapter_id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
              <p>👤: {club.total_members}</p>
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
              <p className="text-gray-700 leading-relaxed">{club.description}</p>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Capítulos ({chapters.length})
            </h2>
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
export async function generateMetadata({ params }: ClubDetailPageProps) {
  const { id } = await params;
  const club = await getClub(id);

  if (!club) {
    return {
      title: 'Club No Encontrado',
    };
  }

  return {
    title: `${club.name} - Detalles del Club`,
    description: club.description || `Detalles sobre ${club.name}`,
  };
}
