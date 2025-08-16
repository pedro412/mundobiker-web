import { chaptersApi, clubsApi, membersApi } from '@/lib/api';
import { Chapter, Club, Member } from '@/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { UserCard } from '@/components/ui/UserCard';

interface ChapterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getChapter(id: string): Promise<Chapter | null> {
  try {
    return await chaptersApi.getById(id);
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return null;
  }
}

async function getClub(clubId: number): Promise<Club | null> {
  try {
    return await clubsApi.getById(clubId.toString());
  } catch (error) {
    console.error('Failed to fetch club:', error);
    return null;
  }
}

async function getMembers(chapterId: string): Promise<Member[]> {
  try {
    return await membersApi.getByChapter(chapterId);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return [];
  }
}

export default async function ChapterDetailPage({ params }: ChapterDetailPageProps) {
  const { id } = await params;
  const [chapter, members] = await Promise.all([getChapter(id), getMembers(id)]);

  if (!chapter) {
    notFound();
  }

  const club = await getClub(chapter.club);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/clubs">Clubes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {club && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/clubs/${club.id}`}>{club.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <span className="text-gray-900 font-medium">{chapter.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        {/* Chapter details */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col space-y-2">
              <CardTitle className="text-4xl font-bold text-gray-900">{chapter.name}</CardTitle>
              <div className="flex flex-wrap gap-4 text-lg text-gray-600">
                <span>
                  📅 Fundado:{' '}
                  {new Date(chapter.foundation_date).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {chapter.location && <span>📍 {chapter.location}</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Parent Club */}
            {club && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Parte de</h2>
                <Link
                  href={`/clubs/${club.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span className="text-xl">{club.name}</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                {club.description && (
                  <p className="text-gray-600 text-sm mt-1">{club.description}</p>
                )}
              </div>
            )}

            {/* Description */}
            {chapter.description && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Acerca de este Capítulo
                </h2>
                <p className="text-gray-700 leading-relaxed">{chapter.description}</p>
              </div>
            )}

            {/* Chapter Details */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Detalles del Capítulo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">ID del Capítulo:</span> {chapter.id}
                </div>
                <div>
                  <span className="font-medium">ID del Club Padre:</span> {chapter.club}
                </div>
                <div>
                  <span className="font-medium">Creado:</span>{' '}
                  {new Date(chapter.created_at).toLocaleDateString('es-MX')}
                </div>
                <div>
                  <span className="font-medium">Última Actualización:</span>{' '}
                  {new Date(chapter.updated_at).toLocaleDateString('es-MX')}
                </div>
                {chapter.location && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Ubicación:</span> {chapter.location}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-6 border-t">
              {club && (
                <Button asChild>
                  <Link href={`/clubs/${club.id}`}>Ver Club Padre</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/clubs">Explorar Todos los Clubes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Miembros ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-gray-600">No se encontraron miembros para este capítulo.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <UserCard
                    key={member.id}
                    user={member}
                    chapter={chapter}
                    className="hover:shadow-md transition-shadow duration-200"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ChapterDetailPageProps) {
  const { id } = await params;
  const chapter = await getChapter(id);

  if (!chapter) {
    return {
      title: 'Capítulo No Encontrado',
    };
  }

  const club = await getClub(chapter.club);
  const clubName = club ? club.name : 'Club Desconocido';

  return {
    title: `${chapter.name} - Capítulo de ${clubName}`,
    description: chapter.description || `Detalles sobre el capítulo ${chapter.name} de ${clubName}`,
  };
}
