'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';

const profileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { state, updateUser } = useAuth();
  const user = state.user;

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successChanges, setSuccessChanges] = useState<string[]>([]);

  useEffect(() => {
    // keep form values in sync if user object updates
    form.reset({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    });
  }, [user]);
  // debug: normalized user available as `user`
  const onSubmit = (data: ProfileForm) => {
    (async () => {
      setIsSaving(true);
      setMessage(null);
      try {
        const updated = await updateUser({
          first_name: data.first_name,
          last_name: data.last_name,
        });
        if (updated) {
          // Reset form values immediately with updated data so inputs stay in sync
          form.reset({
            first_name: updated.first_name ?? '',
            last_name: updated.last_name ?? '',
          });

          // Build a list of changed fields for a clearer confirmation
          const changes: string[] = [];
          const prevFirst = user?.first_name ?? '';
          const prevLast = user?.last_name ?? '';
          if ((updated.first_name ?? '') !== prevFirst) {
            changes.push(`Nombre: ${prevFirst || '(vacío)'} → ${updated.first_name || '(vacío)'} `);
          }
          if ((updated.last_name ?? '') !== prevLast) {
            changes.push(`Apellido: ${prevLast || '(vacío)'} → ${updated.last_name || '(vacío)'} `);
          }

          setSuccessChanges(changes);
          setMessage('Perfil actualizado correctamente.');
        } else {
          setMessage('No se pudo actualizar el perfil.');
        }
      } catch (e) {
        setMessage('Error al actualizar.');
      } finally {
        setIsSaving(false);
        setTimeout(() => {
          setMessage(null);
          setSuccessChanges([]);
        }, 4000);
      }
    })();
  };

  // Mocked clubs and achievements for display
  const clubs = [
    { id: 1, name: 'Los Vientos', role: 'Miembro' },
    { id: 2, name: 'Rutas de Plata', role: 'Coordinador' },
  ];

  const achievements = [
    { id: 'a1', label: '1000 km recorridos', color: 'bg-blue-100', emoji: '🛣️' },
    { id: 'a2', label: 'Evento organizado', color: 'bg-green-100', emoji: '📅' },
    { id: 'a3', label: 'Miembro veterano', color: 'bg-purple-100', emoji: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 pb-20">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              {/* Avatar: show image if available, otherwise initial */}
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {/* No avatar field in the User type yet — fallback to initial */}
                <span className="text-lg font-semibold text-blue-600">
                  {(user?.first_name || user?.full_name || user?.email || 'M')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle>Mi Perfil</CardTitle>
                {user?.email && <p className="text-xs text-gray-500">{user.email}</p>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-gray-600">Datos personales y preferencias.</div>

            {successChanges.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
                <p className="font-medium text-sm">Cambios guardados:</p>
                <ul className="mt-1 text-sm list-disc list-inside space-y-1">
                  {successChanges.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit">Guardar cambios</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clubes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Clubes de los que formas parte.</p>
              <ul className="space-y-3">
                {clubs.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-white border rounded"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-gray-500">Rol: {c.role}</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        Ver
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Insignias y logros obtenidos.</p>
              <div className="flex flex-wrap gap-3">
                {achievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-2 bg-white border rounded">
                    <div className="text-2xl">{a.emoji}</div>
                    <div className="text-sm font-medium">{a.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
