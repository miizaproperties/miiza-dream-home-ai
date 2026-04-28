/**
 * Centralized API configuration
 * Uses environment variables for both development and production
 */

// Base API URL - can be overridden via VITE_API_BASE_URL
// Defaults to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Dashboard API URL - derived from base URL
export const DASHBOARD_API_BASE_URL = import.meta.env.VITE_DASHBOARD_API_BASE_URL || 
  (API_BASE_URL.endsWith('/api') 
    ? `${API_BASE_URL}/dashboard` 
    : `${API_BASE_URL.replace('/api', '')}/api/dashboard`);

// Backend base URL (without /api) - useful for media URLs and admin links
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 
  API_BASE_URL.replace('/api', '');

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Helper function to get full dashboard API URL
export const getDashboardApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${DASHBOARD_API_BASE_URL}/${cleanEndpoint}`;
};

// CDN Configuration for optimized image delivery
export const CDN_CONFIG = {
  enabled: true,
  staticUrl: 'https://cdn.miizarealtors.com',
  mediaUrl: 'https://media.miizarealtors.com',
  fallbackToBackend: true,
  imageTransforms: {
    thumbnail: '?width=300&height=200&format=webp&quality=80',
    card: '?width=400&height=300&format=webp&quality=85',
    medium: '?width=800&height=600&format=webp&quality=85', 
    large: '?width=1200&height=900&format=webp&quality=90',
    hero: '?width=1920&height=1080&format=webp&quality=90',
    gallery: '?width=1600&height=1200&format=webp&quality=95'
  }
};

// Helper function to get optimized image URL with CDN and WebP support
export const getOptimizedImageUrl = (
  originalUrl: string | null | undefined, 
  size: keyof typeof CDN_CONFIG.imageTransforms = 'medium',
  enableTransforms = true
): string => {
  if (!originalUrl) return '/property-placeholder.svg';
  
  // If it's already a placeholder or external URL, return as is
  if (originalUrl.includes('placeholder') || 
      originalUrl.includes('unsplash') ||
      originalUrl.includes('pexels') ||
      (originalUrl.startsWith('http') && !originalUrl.includes('miizarealtors.com'))) {
    return originalUrl;
  }
  
  let baseUrl = originalUrl;
  
  // Convert relative paths to absolute URLs
  if (!baseUrl.startsWith('http')) {
    if (baseUrl.startsWith('/')) {
      baseUrl = `${BACKEND_BASE_URL}${baseUrl}`;
    } else {
      baseUrl = `${BACKEND_BASE_URL}/media/${baseUrl}`;
    }
  }
  
  // If CDN is not enabled or transforms are disabled, return the backend URL
  if (!CDN_CONFIG.enabled || !enableTransforms) {
    return baseUrl;
  }
  
  // Replace backend URL with CDN URL for media files
  if (baseUrl.includes('/media/')) {
    const mediaPath = baseUrl.split('/media/')[1];
    const transform = CDN_CONFIG.imageTransforms[size];
    return `${CDN_CONFIG.mediaUrl}/${mediaPath}${transform}`;
  }
  
  // Fallback to original URL with potential CDN replacement
  return baseUrl.replace(BACKEND_BASE_URL, CDN_CONFIG.staticUrl);
};

// Helper function to get media URL (legacy support)
export const getMediaUrl = (path: string): string => {
  return getOptimizedImageUrl(path, 'medium', false);
};

// Preload critical images for better performance
export const preloadImage = (url: string, priority: 'high' | 'low' = 'low'): void => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
};

// Lazy load images with intersection observer
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

