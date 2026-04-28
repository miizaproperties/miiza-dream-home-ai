import React from 'react';
import { getOptimizedImageUrl, CDN_CONFIG } from '@/config/api';
import { useImageLazyLoad } from '@/hooks/useImageLazyLoad';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: keyof typeof CDN_CONFIG.imageTransforms;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  [key: string]: any;
}

/**
 * Optimized image component with CDN, WebP, lazy loading, and placeholder support
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  size = 'medium',
  className = '',
  priority = false,
  sizes,
  placeholder = true,
  onLoad,
  onError,
  ...props
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, size);
  const { imageRef, isLoaded, isInView } = useImageLazyLoad(optimizedSrc, {
    rootMargin: '100px',
    threshold: 0.1
  });

  const defaultSizes = {
    thumbnail: '300px',
    card: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    medium: '(max-width: 768px) 100vw, 800px',
    large: '(max-width: 1024px) 100vw, 1200px',
    hero: '100vw',
    gallery: '(max-width: 1200px) 90vw, 1200px'
  };

  const imageSizes = sizes || defaultSizes[size] || defaultSizes.medium;

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder/Loading state */}
      {placeholder && !isLoaded && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} 
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imageRef}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        sizes={imageSizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority && { fetchpriority: 'high' as const })}
        onLoad={() => {
          onLoad?.();
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== '/property-placeholder.svg' && !target.src.includes('placeholder')) {
            target.src = '/property-placeholder.svg';
          }
          onError?.(e);
        }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;