'use client';

import { useRef, useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Dynamic imports to prevent SSR issues
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, L: any;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
  className?: string;
  height?: string;
}

export default function Map({
  center = [23.6345, -102.5528], // Default to Mexico
  zoom = 10,
  markers = [],
  className = '',
  height = '400px',
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import Leaflet components only in browser
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Import react-leaflet components
        const reactLeaflet = await import('react-leaflet');
        MapContainer = reactLeaflet.MapContainer;
        TileLayer = reactLeaflet.TileLayer;
        Marker = reactLeaflet.Marker;
        Popup = reactLeaflet.Popup;

        // Import Leaflet
        const leaflet = await import('leaflet');
        L = leaflet.default;

        // Fix for default markers in react-leaflet
        if (L && L.Icon && L.Icon.Default) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });
        }

        setComponentsLoaded(true);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  // Show loading state while components are loading
  if (!componentsLoaded) {
    return (
      <div
        className={`relative ${className} flex items-center justify-center bg-gray-100 rounded-lg`}
        style={{ height }}
      >
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer center={center} zoom={zoom} className="w-full h-full rounded-lg" ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render markers with default icons */}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {marker.popup && (
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Custom hook for map functionality
export function useMapLocation() {
  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
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
}
