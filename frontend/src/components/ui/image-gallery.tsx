import React, { useState, useCallback, useMemo } from 'react';
import OptimizedImage from './optimized-image';
import { cn } from '@/lib/utils';
import LoadingSpinner from './loading-spinner';

interface ImageGalleryProps {
  images: string[];
  className?: string;
  imageClassName?: string;
  thumbnailSize?: number;
  lazy?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  imageClassName,
  thumbnailSize = 100,
  lazy = true,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  const visibleImages = useMemo(() => {
    if (!lazy) return images;
    return images.slice(0, Math.min(loadedImages.size + 3, images.length));
  }, [images, lazy, loadedImages.size]);

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedImage(prev => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setSelectedImage(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-100', className)}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
        <OptimizedImage
          src={images[selectedImage]}
          alt={`Gallery image ${selectedImage + 1}`}
          className={cn('w-full h-full object-cover', imageClassName)}
          priority={selectedImage === 0}
          onLoad={() => handleImageLoad(selectedImage)}
        />
        
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous image"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next image"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {visibleImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative flex-shrink-0 overflow-hidden rounded-md border-2 transition-all',
                selectedImage === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              style={{ width: thumbnailSize, height: thumbnailSize }}
            >
              <OptimizedImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                priority={index < 6} // Load first 6 thumbnails eagerly
              />
              {selectedImage === index && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
            </button>
          ))}
          {lazy && visibleImages.length < images.length && (
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-md border-2 border-gray-200"
              style={{ width: thumbnailSize, height: thumbnailSize }}
            >
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ImageGallery);
