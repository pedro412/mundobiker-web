'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { clubsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';

interface ClubFormData {
  name: string;
  description: string;
  foundation_date: string;
  website: string;
  logo: File | null;
}

export default function CreateClubPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { refreshDashboard } = useDashboard();

  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    description: '',
    foundation_date: '',
    website: '',
    logo: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  if (!authState.isAuthenticated) {
    router.push('/auth/login');
    return null;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del club es requerido';
    }

    if (!formData.foundation_date) {
      newErrors.foundation_date = 'La fecha de fundación es requerida';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'La URL del sitio web no es válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('foundation_date', formData.foundation_date);

      if (formData.website) {
        submitData.append('website', formData.website);
      }

      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      await clubsApi.create(submitData, authState.tokens.access!);

      // Refresh dashboard to get updated user clubs
      await refreshDashboard();

      // Redirect to clubs page with success message
      router.push('/clubs?success=created');
    } catch (error: any) {
      console.error('Error creating club:', error);

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
        general: error instanceof Error ? error.message : 'Error al crear el club',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/clubs"
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
          Volver a Clubes
        </Link>
        <h1 className="text-3xl font-bold">Crear Nuevo Club</h1>
        <p className="text-gray-600 mt-2">
          Completa la información para crear tu nuevo club de motociclistas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Club</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Club Name */}
            <div>
              <Label htmlFor="name">Nombre del Club *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Águilas del Asfalto"
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
                placeholder="Describe tu club, sus valores y actividades..."
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

            {/* Website */}
            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
            </div>

            {/* Logo Upload */}
            <div>
              <Label htmlFor="logo">Logo del Club</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
              </p>
              {errors.logo && <p className="text-red-600 text-sm mt-1">{errors.logo}</p>}
            </div>

            {/* Logo Preview */}
            {formData.logo && (
              <div>
                <Label>Vista Previa del Logo</Label>
                <div className="mt-2">
                  <Image
                    src={URL.createObjectURL(formData.logo)}
                    alt="Vista previa del logo"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            )}

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
                  'Crear Club'
                )}
              </Button>

              <Link href="/clubs" className="flex-1">
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
