'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    password_confirm: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// Function to parse Django REST Framework error format
const parseDjangoErrors = (errorData: any): string => {
  // Handle field-specific errors (like {email: ['A user with this email already exists.']})
  const fieldErrors: string[] = [];

  if (errorData && typeof errorData === 'object') {
    // Check for email errors
    if (errorData.email && Array.isArray(errorData.email)) {
      const emailError = errorData.email[0];
      if (emailError === 'A user with this email already exists.') {
        fieldErrors.push('Este correo electrónico ya está siendo usado.');
      } else {
        fieldErrors.push(`Correo: ${emailError}`);
      }
    }

    // Check for password errors
    if (errorData.password && Array.isArray(errorData.password)) {
      fieldErrors.push(`Contraseña: ${errorData.password[0]}`);
    }

    // Check for password_confirm errors
    if (errorData.password_confirm && Array.isArray(errorData.password_confirm)) {
      fieldErrors.push(`Confirmar contraseña: ${errorData.password_confirm[0]}`);
    }

    // Check for non_field_errors (general errors)
    if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
      fieldErrors.push(errorData.non_field_errors[0]);
    }

    // Check for detail message (common in DRF)
    if (errorData.detail && typeof errorData.detail === 'string') {
      fieldErrors.push(errorData.detail);
    }

    // Check for message field
    if (errorData.message && typeof errorData.message === 'string') {
      fieldErrors.push(errorData.message);
    }
  }

  // Return the first field error or a generic message
  return fieldErrors.length > 0 ? fieldErrors[0] : 'Error al procesar la solicitud';
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError('');

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register/`;

      const requestBody = {
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        // Use the Django error parser
        const errorMessage = parseDjangoErrors(errorData);
        throw new Error(errorMessage);
      }

      // Registro exitoso - redirigir a login con mensaje de éxito
      router.push('/auth/login?success=registration');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la cuenta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Crear Cuenta
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              Únete a la comunidad MundoBiker
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
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

                <FormField
                  control={form.control}
                  name="password_confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                ¿Ya tienes cuenta? Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
