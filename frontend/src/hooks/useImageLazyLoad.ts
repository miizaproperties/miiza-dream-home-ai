import { useState, useEffect, useRef, useCallback } from 'react';

interface UseImageLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  fallbackSrc?: string;
}

interface UseImageLazyLoadReturn {
  imageRef: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
  isInView: boolean;
  hasError: boolean;
}

/**
 * Custom hook for lazy loading images with intersection observer
 * Improves performance by only loading images when they're about to be visible
 */
export const useImageLazyLoad = (
  src: string,
  options: UseImageLazyLoadOptions = {}
): UseImageLazyLoadReturn => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallbackSrc = '/property-placeholder.svg'
  } = options;

  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    if (imageRef.current && fallbackSrc) {
      imageRef.current.src = fallbackSrc;
    }
  }, [fallbackSrc]);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    // Set up intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          // Start loading the image
          if (src && !hasError) {
            imageElement.src = src;
            imageElement.addEventListener('load', handleLoad);
            imageElement.addEventListener('error', handleError);
          }
          
          // Clean up observer once image is in view
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(imageElement);

    return () => {
      observer.disconnect();
      if (imageElement) {
        imageElement.removeEventListener('load', handleLoad);
        imageElement.removeEventListener('error', handleError);
      }
    };
  }, [src, rootMargin, threshold, hasError, handleLoad, handleError]);

  return {
    imageRef,
    isLoaded,
    isInView,
    hasError
  };
};