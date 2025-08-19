'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { clubsApi, chaptersApi } from '@/lib/api';
import { Club } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface ChapterFormData {
  name: string;
  description: string;
  foundation_date: string;
  location: string;
}

interface CreateChapterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CreateChapterPage({ params }: CreateChapterPageProps) {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { refreshDashboard } = useDashboard();

  const [clubId, setClubId] = useState<string>('');
  const [club, setClub] = useState<Club | null>(null);
  const [loadingClub, setLoadingClub] = useState(true);

  const [formData, setFormData] = useState<ChapterFormData>({
    name: '',
    description: '',
    foundation_date: '',
    location: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load club ID from params
  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setClubId(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  // Load club data
  useEffect(() => {
    if (!clubId) return;

    async function fetchClub() {
      try {
        setLoadingClub(true);
        const clubData = await clubsApi.getById(clubId);
        setClub(clubData);
      } catch (error) {
        console.error('Failed to fetch club:', error);
        setErrors({ general: 'Error al cargar la información del club' });
      } finally {
        setLoadingClub(false);
      }
    }

    fetchClub();
  }, [clubId]);

  // Redirect if not authenticated
  if (!authState.isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  if (loadingClub) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando información del club...</span>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Club no encontrado</p>
          <Link href="/clubs" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Volver a Clubes
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del capítulo es requerido';
    }

    if (!formData.foundation_date) {
      newErrors.foundation_date = 'La fecha de fundación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        foundation_date: formData.foundation_date,
        location: formData.location,
        club: parseInt(clubId), // Include the club ID in the payload
      };

      await chaptersApi.create(submitData, authState.tokens.access!);

      // Refresh dashboard to get updated user chapters
      await refreshDashboard();

      // Redirect to club page with success message
      router.push(`/clubs/${clubId}?success=chapter-created`);
    } catch (error: any) {
      console.error('Error creating chapter:', error);

      // Handle API validation errors
      if (error.status === 400 && error.data) {
        const fieldErrors: Record<string, string> = {};

        Object.keys(error.data).forEach((field) => {
          if (Array.isArray(error.data[field])) {
            fieldErrors[field] = error.data[field][0];
          } else if (typeof error.data[field] === 'string') {
            fieldErrors[field] = error.data[field];
          }
        });

        setErrors(fieldErrors);
        return;
      }

      setErrors({
        general: error instanceof Error ? error.message : 'Error al crear el capítulo',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/clubs/${clubId}`}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a {club.name}
        </Link>
        <h1 className="text-3xl font-bold">Crear Nuevo Capítulo</h1>
        <p className="text-gray-600 mt-2">
          Agregar un nuevo capítulo al club <span className="font-semibold">{club.name}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Capítulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Chapter Name */}
            <div>
              <Label htmlFor="name">Nombre del Capítulo *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Capítulo Ciudad de México"
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el capítulo, su área de cobertura y actividades..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Foundation Date */}
            <div>
              <Label htmlFor="foundation_date">Fecha de Fundación *</Label>
              <Input
                id="foundation_date"
                name="foundation_date"
                type="date"
                value={formData.foundation_date}
                onChange={handleInputChange}
                className={errors.foundation_date ? 'border-red-500' : ''}
                required
              />
              {errors.foundation_date && (
                <p className="text-red-600 text-sm mt-1">{errors.foundation_date}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej: Ciudad de México, CDMX"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Club Info Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Club:</p>
              <p className="text-blue-600">{club.name}</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </div>
                ) : (
                  'Crear Capítulo'
                )}
              </Button>

              <Link href={`/clubs/${clubId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
