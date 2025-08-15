import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts relative URLs to absolute URLs for image optimization
 * If the URL is already absolute, returns it as-is
 * If it's relative, prepends the API base URL
 */
export function getImageUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  
  // If already absolute URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Get API base URL from environment or use default
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${apiBaseUrl}/${cleanPath}`;
}

/**
 * Alternative approach: return a fallback static URL if the image optimization fails
 * This can be used as a backup strategy
 */
export function getStaticImageUrl(relativePath: string | null | undefined, fallbackUrl?: string): string | null {
  if (!relativePath && !fallbackUrl) return null;
  
  // If we have a fallback URL and the relative path seems problematic, use fallback
  if (fallbackUrl && relativePath && !relativePath.startsWith('http')) {
    return fallbackUrl;
  }
  
  return getImageUrl(relativePath);
}

/**
 * Creates a placeholder image URL using a simple service
 * Useful for development and testing
 */
export function getPlaceholderImageUrl(width: number = 200, height: number = 200, text: string = 'No Image'): string {
  return `https://via.placeholder.com/${width}x${height}/e5e7eb/9ca3af?text=${encodeURIComponent(text)}`;
}

/**
 * Validates if a URL is likely to be a valid image URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('image') || 
         lowerUrl.includes('img') ||
         lowerUrl.includes('placeholder');
}
