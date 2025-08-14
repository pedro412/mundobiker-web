'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, login, clearError } = useAuth();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (searchParams.get('success') === 'registration') {
      setShowSuccessMessage(true);
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      router.push('/');
    }
  }, [state.isAuthenticated, router]);

  // Clear error when component mounts (only once)
  useEffect(() => {
    clearError();
  }, []); // Empty dependency array - only run once on mount

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      // Successful login will trigger redirect via useEffect above
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
            <p className="text-gray-600 text-sm mt-2">Accede a tu cuenta de MundoBiker</p>
          </CardHeader>
          <CardContent>
            {showSuccessMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  ¡Cuenta creada exitosamente! Ya puedes iniciar sesión.
                </p>
              </div>
            )}

            {state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={state.isLoading}>
                  {state.isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/register"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
