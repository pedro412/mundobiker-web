# Image Handling in MundoBiker Web

## Problem Solved

The Next.js Image component was having issues with:

1. Relative URLs from the API (e.g., `/media/logo.jpg`)
2. Domain restrictions for image optimization
3. 400 Bad Request errors when trying to optimize external images

## Solution

### OptimizedImage Component

Created `components/ui/OptimizedImage.tsx` that:

- ✅ Converts relative URLs to absolute URLs automatically
- ✅ Handles image loading errors gracefully
- ✅ Shows SVG placeholder when images fail to load
- ✅ Uses `unoptimized={true}` to bypass Next.js domain restrictions
- ✅ Supports fallback URLs

### Usage Examples

```tsx
// Basic usage - handles relative URLs from API
<OptimizedImage
  src={club.logo}  // Can be "/media/logo.jpg" or "https://example.com/logo.jpg"
  alt="Club logo"
  width={96}
  height={96}
  className="w-24 h-24 object-contain rounded-lg"
/>

// With reliable fallback (using placeholder service)
<OptimizedImage
  src={club.logo}
  alt="Club logo"
  width={96}
  height={96}
  className="w-24 h-24 object-contain rounded-lg"
  fallbackSrc="https://via.placeholder.com/96x96/e5e7eb/9ca3af?text=Club+Logo"
/>
```

### Configuration

1. **Environment Variables** (`.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
# or for production:
# NEXT_PUBLIC_API_URL=https://api.mundobiker.com
```

2. **Next.js Config** (`next.config.ts`):

- Added image domains for localhost and production
- Configured remote patterns for common image services
- Enabled SVG support

### Fallback Strategy

1. **Primary**: Use the provided image URL (converted to absolute if relative)
2. **Secondary**: Use fallback URL if provided and primary fails
3. **Tertiary**: Show SVG placeholder with image icon

### Utilities Available

- `getImageUrl()` - Converts relative to absolute URLs
- `getPlaceholderImageUrl()` - Creates placeholder URLs
- `isValidImageUrl()` - Validates image URLs

## Recommended Fallback URLs

For reliable fallbacks, use simple services:

```tsx
// Good fallback options:
fallbackSrc = 'https://via.placeholder.com/96x96/e5e7eb/9ca3af?text=Logo';
```

Avoid complex URLs with multiple parameters or Next.js optimization chains as they can cause 400 errors.
