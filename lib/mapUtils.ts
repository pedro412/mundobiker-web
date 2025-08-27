// Utility functions for the chapter discovery map

/**
 * Validates if a chapter has valid coordinates for map display
 */
export function hasValidCoordinates(chapter: { latitude?: number; longitude?: number }): boolean {
  return (
    typeof chapter.latitude === 'number' &&
    typeof chapter.longitude === 'number' &&
    !isNaN(chapter.latitude) &&
    !isNaN(chapter.longitude) &&
    chapter.latitude >= -90 &&
    chapter.latitude <= 90 &&
    chapter.longitude >= -180 &&
    chapter.longitude <= 180
  );
}

/**
 * Calculates the distance between two geographic points using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Finds chapters within a certain radius from a given location
 */
export function findNearbyChapters(
  userLat: number,
  userLon: number,
  chapters: Array<{ latitude?: number; longitude?: number }>,
  radiusKm: number = 50
) {
  return chapters.filter((chapter) => {
    if (!hasValidCoordinates(chapter)) return false;
    
    const distance = calculateDistance(
      userLat,
      userLon,
      chapter.latitude!,
      chapter.longitude!
    );
    
    return distance <= radiusKm;
  });
}

/**
 * Calculates the center point and zoom level for displaying multiple chapters
 */
export function calculateMapBounds(chapters: Array<{ latitude?: number; longitude?: number }>) {
  const validChapters = chapters.filter(hasValidCoordinates);
  
  if (validChapters.length === 0) {
    // Default to Mexico center
    return {
      center: [23.6345, -102.5528] as [number, number],
      zoom: 6
    };
  }
  
  if (validChapters.length === 1) {
    return {
      center: [validChapters[0].latitude!, validChapters[0].longitude!] as [number, number],
      zoom: 10
    };
  }
  
  // Calculate bounds
  const lats = validChapters.map(c => c.latitude!);
  const lngs = validChapters.map(c => c.longitude!);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  
  // Simple zoom calculation based on bounds
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoom = 10;
  if (maxDiff > 10) zoom = 5;
  else if (maxDiff > 5) zoom = 6;
  else if (maxDiff > 2) zoom = 7;
  else if (maxDiff > 1) zoom = 8;
  else if (maxDiff > 0.5) zoom = 9;
  
  return {
    center: [centerLat, centerLng] as [number, number],
    zoom
  };
}
