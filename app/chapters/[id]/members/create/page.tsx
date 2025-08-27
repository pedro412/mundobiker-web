'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { membersApi, chaptersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Validation schema
const memberSchema = z.object({
  chapter: z.string().min(1, 'Chapter ID is required'),
  first_name: z.string().min(1, 'Nombre es requerido'),
  last_name: z.string().min(1, 'Apellido es requerido'),
  nickname: z.string().optional(),
  date_of_birth: z.string().optional(),
  role: z.enum([
    'president',
    'vice_president',
    'secretary',
    'treasurer',
    'road_captain',
    'sergeant_at_arms',
    'member',
  ]),
  member_type: z.enum(['pilot', 'copilot', 'prospect']),
  national_role: z.string().optional(),
  joined_at: z.string().optional(),
  is_active: z.boolean(),
  // Metadata fields
  is_vested: z.boolean().optional(),
  linked_to: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

// Role options
const ROLE_OPTIONS = [
  { value: 'president', label: 'President' },
  { value: 'vice_president', label: 'Vice President' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'road_captain', label: 'Road Captain' },
  { value: 'sergeant_at_arms', label: 'Sergeant at Arms' },
  { value: 'member', label: 'Member' },
];

// Member type options
const MEMBER_TYPE_OPTIONS = [
  { value: 'pilot', label: 'Pilot' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'prospect', label: 'Prospect' },
];

// National role options
const NATIONAL_ROLE_OPTIONS = [
  { value: '', label: '-- Sin rol nacional --' },
  { value: 'national_president', label: 'National President' },
  { value: 'national_vice_president', label: 'National Vice President' },
  { value: 'national_secretary', label: 'National Secretary' },
  { value: 'national_counselor', label: 'National Counselor' },
  { value: 'zone_vp_south', label: 'Zone Vice President South' },
  { value: 'zone_vp_center', label: 'Zone Vice President Center' },
  { value: 'zone_vp_north', label: 'Zone Vice President North' },
];

interface CreateMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CreateMemberPage({ params }: CreateMemberPageProps) {
  const router = useRouter();
  const [chapterId, setChapterId] = useState<string>('');
  const { state: authState } = useAuth();
  const { refreshDashboard } = useDashboard();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chapterName, setChapterName] = useState<string>('');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      chapter: '',
      first_name: '',
      last_name: '',
      nickname: '',
      date_of_birth: '',
      role: 'member' as const,
      member_type: 'pilot' as const,
      national_role: '',
      joined_at: '',
      is_active: true,
      is_vested: false,
      linked_to: '',
    },
  });

  // Load chapter info on mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setChapterId(id);

        // Set chapter ID in form data
        setValue('chapter', id);

        // Load chapter info and existing members
        const [chapter, members] = await Promise.all([
          chaptersApi.getById(id),
          membersApi.getByChapter(id),
        ]);

        setChapterName(chapter.name);
        setExistingMembers(members);
      } catch (error) {
        console.error('Failed to load chapter info:', error);
        setError('Error al cargar la información del capítulo');
      }
    };
    initializeComponent();
  }, [params, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      if (!authState.tokens.access) {
        throw new Error('No estás autenticado');
      }

      // Create FormData to handle file upload
      const submitData = new FormData();
      submitData.append('chapter', data.chapter);
      submitData.append('first_name', data.first_name.trim());
      submitData.append('last_name', data.last_name.trim());
      submitData.append('role', data.role);
      submitData.append('member_type', data.member_type);
      submitData.append('is_active', data.is_active.toString());

      // Handle metadata
      const metadata: any = {};
      if (data.is_vested !== undefined) {
        metadata.is_vested = data.is_vested;
      }
      if (data.linked_to && data.linked_to.trim()) {
        metadata.linked_to = parseInt(data.linked_to);
      }

      if (Object.keys(metadata).length > 0) {
        submitData.append('metadata', JSON.stringify(metadata));
      }

      // Log the chapter ID being sent
      console.log('Creating member for chapter ID:', data.chapter);

      // Optional fields
      if (data.nickname?.trim()) {
        submitData.append('nickname', data.nickname.trim());
      }
      if (data.date_of_birth) {
        submitData.append('date_of_birth', data.date_of_birth);
      }
      if (data.national_role) {
        submitData.append('national_role', data.national_role);
      }
      if (data.joined_at) {
        submitData.append('joined_at', data.joined_at);
      }

      // Handle profile picture upload
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        submitData.append('profile_picture', fileInput.files[0]);
      }

      await membersApi.create(submitData, authState.tokens.access);
      console.log('Member created successfully');

      // Refresh dashboard data to update member counts and statistics
      console.log('Refreshing dashboard data after member creation...');
      try {
        await refreshDashboard();
        console.log('Dashboard data refreshed successfully - member counts should be updated');
      } catch (dashboardError) {
        console.warn('Failed to refresh dashboard data:', dashboardError);
        // Don't fail the entire operation if dashboard refresh fails
      }

      // Redirect back to chapter page with success message
      router.push(`/chapters/${chapterId}?memberCreated=true`);
    } catch (error: any) {
      console.error('Error creating member:', error);
      if (error.status && error.data) {
        // Handle API validation errors
        const errorMessages = Object.entries(error.data)
          .map(([field, messages]: [string, any]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages[0]}`;
            }
            return `${field}: ${messages}`;
          })
          .join(', ');
        setError(errorMessages);
      } else {
        setError(error.message || 'Error al crear el miembro');
      }
    } finally {
      setIsLoading(false);
    }
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
            <BreadcrumbLink asChild>
              <Link href={`/chapters/${chapterId}`}>{chapterName || 'Capítulo'}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-gray-900 font-medium">Agregar Miembro</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">Agregar Nuevo Miembro</CardTitle>
          <p className="text-gray-600">
            Agrega un nuevo miembro al capítulo {chapterName}
            {chapterId && <span className="text-sm text-gray-500 ml-2">(ID: {chapterId})</span>}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Form validation errors */}
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium mb-2">Errores de validación:</p>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {error?.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chapter ID is handled by the form state */}
            <input type="hidden" {...register('chapter')} />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input id="first_name" type="text" {...register('first_name')} className="mt-1" />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input id="last_name" type="text" {...register('last_name')} className="mt-1" />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="nickname">Apodo</Label>
                <Input id="nickname" type="text" {...register('nickname')} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register('date_of_birth')}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Role Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información de Roles</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Rol en el Capítulo *</Label>
                  <select
                    id="role"
                    {...register('role')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="member_type">Tipo de Miembro *</Label>
                  <select
                    id="member_type"
                    {...register('member_type')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {MEMBER_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.member_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.member_type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="national_role">Rol Nacional (Opcional)</Label>
                <select
                  id="national_role"
                  {...register('national_role')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {NATIONAL_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Foto de Perfil (Opcional)</h3>

              <div>
                <Label htmlFor="profile_picture">Subir Foto</Label>
                <Input
                  ref={fileInputRef}
                  id="profile_picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Máximo 5MB. Formatos soportados: JPG, PNG, GIF
                </p>
              </div>

              {/* Profile Picture Preview */}
              {profilePreview && (
                <div className="flex justify-center">
                  <div className="text-center">
                    <OptimizedImage
                      src={profilePreview}
                      alt="Preview"
                      width={120}
                      height={120}
                      className="w-30 h-30 rounded-full object-cover border-2 border-gray-200 mx-auto"
                    />
                    <p className="text-sm text-gray-600 mt-2">Vista previa</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información Adicional</h3>

              <div>
                <Label htmlFor="joined_at">Fecha de Ingreso</Label>
                <Input id="joined_at" type="date" {...register('joined_at')} className="mt-1" />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  {...register('is_active')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Miembro Activo
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Los miembros activos aparecen en las listas de miembros y pueden participar en
                actividades del capítulo.
              </p>
            </div>

            {/* Metadata Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información Especial</h3>

              <div className="flex items-center space-x-2">
                <input
                  id="is_vested"
                  type="checkbox"
                  {...register('is_vested')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="is_vested" className="text-sm font-medium text-gray-700">
                  Miembro Investido (Vested)
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Los miembros investidos tienen privilegios especiales y aparecen con una marca
                distintiva.
              </p>

              <div>
                <Label htmlFor="linked_to">Vinculado a Miembro</Label>
                <select
                  id="linked_to"
                  {...register('linked_to')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Sin vinculación --</option>
                  {existingMembers.map((member) => (
                    <option key={member.id} value={member.id.toString()}>
                      {member.first_name} {member.last_name}
                      {member.nickname && ` "${member.nickname}"`}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Si este miembro está vinculado a otro (pareja, copiloto, etc.), selecciona el
                  miembro principal. Aparecerán juntos en la misma tarjeta.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? 'Creando...' : 'Crear Miembro'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/chapters/${chapterId}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
