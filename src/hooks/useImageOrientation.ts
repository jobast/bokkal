'use client';

import { useState, useEffect } from 'react';

export type ImageOrientation = 'portrait' | 'landscape' | 'square' | null;

/**
 * Hook to detect image orientation (portrait, landscape, or square)
 * Loads the image and calculates aspect ratio
 */
export function useImageOrientation(imageUrl: string | null | undefined): ImageOrientation {
  const [orientation, setOrientation] = useState<ImageOrientation>(null);

  useEffect(() => {
    if (!imageUrl) {
      setOrientation(null);
      return;
    }

    const img = new window.Image();

    img.onload = () => {
      const ratio = img.width / img.height;

      // Portrait: taller than wide (ratio < 0.8)
      // Landscape: wider than tall (ratio > 1.2)
      // Square: roughly equal (0.8 - 1.2)
      if (ratio < 0.8) {
        setOrientation('portrait');
      } else if (ratio > 1.2) {
        setOrientation('landscape');
      } else {
        setOrientation('square');
      }
    };

    img.onerror = () => {
      setOrientation(null);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return orientation;
}
