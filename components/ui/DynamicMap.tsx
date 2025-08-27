'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

interface DynamicMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
  className?: string;
  height?: string;
}

// Dynamically import the Map component to avoid SSR issues
const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
      style={{ height: '400px' }}
    >
      <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
        <MapPin className="w-8 h-8 animate-pulse" />
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
});

// Also dynamically import the hook
const useMapLocationDynamic = () => {
  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  };

  return { getCurrentLocation };
};

export default function DynamicMap(props: DynamicMapProps) {
  return <MapComponent {...props} />;
}

export { useMapLocationDynamic as useMapLocation };
