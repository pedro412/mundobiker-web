'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface AuthenticatedActionsProps {
  chapterId: number;
}

export function AuthenticatedActions({ chapterId }: AuthenticatedActionsProps) {
  const { state } = useAuth();
  
  // Only render the button if user is authenticated
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  return (
    <Button asChild>
      <Link href={`/chapters/${chapterId}/members/create`}>Agregar Miembros</Link>
    </Button>
  );
}
