'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DynamicMap, { useMapLocation } from '@/components/ui/DynamicMap';
import { MapPin, Navigation, Building } from 'lucide-react';
import { clubsApi, chaptersApi } from '@/lib/api';
import { Club, Chapter } from '@/types';
import { hasValidCoordinates } from '@/lib/mapUtils';

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.6345, -102.5528]); // Default to Mexico
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCurrentLocation } = useMapLocation();

  // Fetch clubs and chapters data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all clubs and chapters
        const [clubsData, chaptersData] = await Promise.all([
          clubsApi.getAll(),
          chaptersApi.getAll(),
        ]);

        setClubs(clubsData);
        setChapters(chaptersData);

        // Filter chapters that have coordinates
        const chaptersWithCoords = chaptersData.filter(hasValidCoordinates);

        console.log(
          `Loaded ${clubsData.length} clubs and ${chaptersWithCoords.length} chapters with coordinates`
        );
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos de capítulos. Usando datos de ejemplo.');

        // Fallback to sample data if API fails
        const sampleChapters: Chapter[] = [
          {
            id: 1,
            name: 'Capítulo Madrid Centro',
            description: 'Capítulo principal en el centro de Madrid',
            foundation_date: '2020-01-15',
            club: 1,
            location: 'Madrid, España',
            latitude: 40.4168,
            longitude: -3.7038,
            created_at: '2020-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            total_members: 25,
          },
          {
            id: 2,
            name: 'Capítulo Barcelona Este',
            description: 'Capítulo en la zona este de Barcelona',
            foundation_date: '2021-03-20',
            club: 2,
            location: 'Barcelona, España',
            latitude: 41.3851,
            longitude: 2.1734,
            created_at: '2021-03-20T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            total_members: 18,
          },
          {
            id: 3,
            name: 'Capítulo Valencia Norte',
            description: 'Capítulo en la zona norte de Valencia',
            foundation_date: '2021-06-10',
            club: 1,
            location: 'Valencia, España',
            latitude: 39.4699,
            longitude: -0.3763,
            created_at: '2021-06-10T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            total_members: 12,
          },
        ];

        const sampleClubs: Club[] = [
          {
            id: 1,
            name: 'Club Bikers España',
            description: 'El club de motociclistas más grande de España',
            foundation_date: '2019-01-01',
            logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
            website: 'https://bikersespana.com',
            created_at: '2019-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            total_members: 150,
          },
          {
            id: 2,
            name: 'Riders Mediterráneo',
            description: 'Club de la costa mediterránea',
            foundation_date: '2020-05-15',
            logo: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop&crop=center',
            website: 'https://ridersmed.com',
            created_at: '2020-05-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            total_members: 80,
          },
        ];

        setChapters(sampleChapters);
        setClubs(sampleClubs);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Create markers from chapters
  const mapMarkers = chapters
    .filter((chapter) => chapter.latitude && chapter.longitude)
    .map((chapter) => {
      const club = clubs.find((c) => c.id === chapter.club);
      return {
        position: [chapter.latitude!, chapter.longitude!] as [number, number],
        popup: `
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">${chapter.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${chapter.description || 'No description available'}</p>
            <p class="text-xs text-gray-500">Club: ${club?.name || 'Unknown'}</p>
            <p class="text-xs text-gray-500">Members: ${chapter.total_members || 0}</p>
          </div>
        `,
      };
    });

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setMapCenter(location);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('No se pudo obtener tu ubicación. Asegúrate de permitir el acceso a la ubicación.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm">Cargando capítulos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mapa de Capítulos</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Descubre capítulos de clubs de motociclistas cerca de ti
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          onClick={handleGetLocation}
          disabled={isLoadingLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {isLoadingLocation ? 'Obteniendo ubicación...' : 'Mi ubicación'}
        </Button>
        {userLocation && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Ubicación encontrada
          </Badge>
        )}
        <Badge variant="outline" className="flex items-center gap-1">
          <Building className="w-3 h-3" />
          {chapters.filter(hasValidCoordinates).length} capítulos
        </Badge>
      </div>

      <div className="w-full">
        {/* Map */}
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Mapa Interactivo</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DynamicMap
                center={mapCenter}
                zoom={5} // Zoom to show Mexico overview
                markers={mapMarkers}
                height="500px"
                className="rounded-b-lg overflow-hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
