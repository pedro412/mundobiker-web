# Chapter Discovery Map Feature Documentation

## Overview

The map feature provides an interactive OpenStreetMap integration for discovering motorcycle club chapters across Spain. Users can explore chapters from different clubs, view their locations, member counts, and get detailed information about each chapter.

## Components

### 1. Map Component (`/components/ui/Map.tsx`)

- Core map functionality using Leaflet and react-leaflet
- Includes marker support, popups, and location services
- Handles map initialization and default markers

### 2. DynamicMap Component (`/components/ui/DynamicMap.tsx`)

- Wrapper component that handles SSR (Server-Side Rendering) issues
- Dynamically imports the Map component to avoid window/browser API conflicts
- Includes loading state and error handling

### 3. Chapter Discovery Page (`/app/map/page.tsx`)

- Full-featured map page displaying all motorcycle club chapters
- Shows chapters with geographic coordinates on an interactive map
- Includes chapter filtering, selection, and detailed information panel
- Integrates with the existing club and chapter API endpoints

## Features

### ✅ Implemented Features

- **Chapter Discovery**: Interactive map showing all chapters with coordinates
- **Real API Integration**: Fetches data from `/api/clubs/` and `/api/chapters/` endpoints
- **Chapter Information**: Displays chapter details, member counts, foundation dates
- **Club Association**: Shows which club each chapter belongs to
- **Location Detection**: User can find their current location
- **Interactive Selection**: Click chapters in sidebar to center map on them
- **Responsive Design**: Works on mobile and desktop devices
- **Error Handling**: Graceful fallback to sample data if API fails
- **Chapter Navigation**: Direct links to individual chapter detail pages

### 📍 Data Structure

Each chapter requires the following coordinate fields:

```typescript
interface Chapter {
  id: number;
  name: string;
  description?: string;
  foundation_date: string;
  club: number;
  location?: string;
  latitude?: number; // Required for map display
  longitude?: number; // Required for map display
  created_at: string;
  updated_at: string;
  total_members: number;
}
```

### 🚀 Future Enhancements

- Search and filter chapters by club, location, or member count
- Distance calculation from user location
- Chapter event calendar integration
- Member photos and testimonials
- Route planning between chapters
- Social features (chapter reviews, ratings)
- Offline map caching for mobile users

## Dependencies

```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.x.x",
  "@types/leaflet": "^1.9.x"
}
```

## Usage

### Basic Map Usage

```tsx
import DynamicMap from '@/components/ui/DynamicMap';

<DynamicMap
  center={[40.4168, -3.7038]} // Madrid coordinates
  zoom={13}
  markers={[
    {
      position: [40.4168, -3.7038],
      popup: 'Event in Madrid',
    },
  ]}
  height="400px"
/>;
```

### Location Hook Usage

```tsx
import { useMapLocation } from '@/components/ui/DynamicMap';

function LocationComponent() {
  const { getCurrentLocation } = useMapLocation();

  const handleGetLocation = async () => {
    try {
      const [lat, lng] = await getCurrentLocation();
      console.log('User location:', lat, lng);
    } catch (error) {
      console.error('Location error:', error);
    }
  };
}
```

## API Integration

To integrate with a real API, replace the `sampleEvents` array in `/app/map/page.tsx` with:

```tsx
// Replace sample data with API call
useEffect(() => {
  async function fetchEvents() {
    try {
      const response = await fetch('/api/events');
      const events = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }

  fetchEvents();
}, []);
```

## Styling

The map uses Tailwind CSS for styling and follows the existing design system:

- Card components for event listings
- Consistent color scheme with blue accents
- Responsive grid layout
- Dark mode support

## Performance Considerations

- Dynamic imports prevent SSR issues
- Leaflet CSS is only loaded when needed
- Map component is lazy-loaded for better initial page performance
- Markers are efficiently rendered using react-leaflet

## Browser Support

- Modern browsers with geolocation API support
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Security & Privacy

- Geolocation requires user permission
- Location data is not stored permanently
- Map tiles are served from OpenStreetMap (open source)
