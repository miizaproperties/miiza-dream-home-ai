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

// Helper function to get media URL
export const getMediaUrl = (path: string): string => {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path starting with /, prepend backend base URL
  if (path.startsWith('/')) {
    return `${BACKEND_BASE_URL}${path}`;
  }
  
  // Otherwise, assume it's a media path
  return `${BACKEND_BASE_URL}/media/${path}`;
};

