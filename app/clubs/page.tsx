import { clubsApi } from '@/lib/api';
import { Club } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getClubs(): Promise<Club[]> {
  try {
    return await clubsApi.getAll();
  } catch (error) {
    console.error('Failed to fetch clubs:', error);
    return [];
  }
}

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Clubes</h1>

      {clubs.length === 0 ? (
        <p className="text-gray-600">No se encontraron clubes o falló la carga de clubes.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl">{club.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {club.description && (
                    <p className="text-gray-600 mb-3 text-sm">{club.description}</p>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 flex items-center">
                      📅 Fundado: {new Date(club.foundation_date).toLocaleDateString('es-MX')}
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
  );
}
