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

  const imageUrl = getImageUrl(src);

  // If no URL available, don't render anything
  if (!imageUrl && !fallbackSrc) {
    return null;
  }

  let finalImageUrl = imageUrl || fallbackSrc;

  // If we had an error with the primary image, try with fallback
  if (imageError && fallbackSrc && finalImageUrl !== fallbackSrc) {
    finalImageUrl = fallbackSrc;
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
        if (!imageError) {
          setImageError(true);
        }
      }}
      // Always use unoptimized for external domains to avoid Next.js optimization issues
      unoptimized={true}
      // Add priority for above-the-fold images
      priority={false}
    />
  );
}
