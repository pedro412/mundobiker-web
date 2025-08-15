'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 96,
  height = 96,
  className = '',
  fallbackSrc,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const imageUrl = getImageUrl(src);

  // If no URL available and no fallback, show a placeholder
  if (!imageUrl && !fallbackSrc) {
    return (
      <div
        className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded`}
        style={{ width, height }}
      >
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  // Determine which URL to use
  let finalImageUrl = imageUrl;
  if (imageError && fallbackSrc && !fallbackError) {
    finalImageUrl = fallbackSrc;
  } else if ((imageError && !fallbackSrc) || (imageError && fallbackError)) {
    // If both original and fallback failed, show placeholder
    return (
      <div
        className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded`}
        style={{ width, height }}
      >
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  if (!finalImageUrl) {
    finalImageUrl = fallbackSrc || null;
  }

  // Use Next.js Image with appropriate configuration
  return (
    <Image
      src={finalImageUrl!}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        console.warn(`Image failed to load: ${finalImageUrl}`);
        if (finalImageUrl === imageUrl && !imageError) {
          setImageError(true);
        } else if (finalImageUrl === fallbackSrc && !fallbackError) {
          setFallbackError(true);
        }
      }}
      // Always use unoptimized for external domains to avoid Next.js optimization issues
      unoptimized={true}
      // Add priority for above-the-fold images
      priority={false}
    />
  );
}
