import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MundoBiker - Comunidad de Motociclistas',
  description: 'Aplicación para la comunidad de motociclistas mexicanos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className={`${geistSans.variable} ${geistMono.variable} pt-16 pb-16`}>
        <AuthProvider>
          <TopNavigation />
          <main className="min-h-screen">{children}</main>
          <BottomNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
