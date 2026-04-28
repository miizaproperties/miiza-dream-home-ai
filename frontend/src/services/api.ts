/**
 * Centralized API service for frontend-backend communication
 */

import { API_BASE_URL, BACKEND_BASE_URL, getMediaUrl, getOptimizedImageUrl, CDN_CONFIG } from '../config/api';
const API_DEBUG = Boolean(import.meta.env.DEV);

type FetchApiOptions = RequestInit & {
  cacheTTLms?: number;
};

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export interface Property {
  id: number;
  title: string;
  slug?: string;
  property_type: string;
  status: string;
  development_type?: string;
  city: string;
  location: string;
  bedrooms: number | string; // single number or comma-separated e.g. "6,5,6"
  bathrooms: number | string; // single number or comma-separated e.g. "2,4,7"
  display_bedrooms?: string;
  display_bathrooms?: string;
  area: string;
  square_feet?: number | null;
  price: number | string; // Can be number or string from API
  rental_price_per_night?: number | string;
  display_price: string;
  is_for_sale: boolean;
  is_for_rent: boolean;
  type: 'rent' | 'sale';
  image?: string;
  main_image?: string;
  images?: Array<{ id: number; image: string; alt_text?: string; order: number }>;
  featured: boolean;
  guests?: number;
  max_guests?: number;
  description?: string;
  address?: string;
  state?: string; // Suburb/Neighbourhood
  amenities?: string[];
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  propertyType?: string;
  message: string;
  subject?: string;
  property?: number;
}

export interface ViewingRequestData {
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  property?: number | null; // Optional - can be null for general viewings
}

export interface ViewingRequestResponse {
  id: number;
  reference_number: string;
  contact: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  property?: number | null;
  property_title?: string | null;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

/**
 * Helper functions for property data
 */

// getPropertyImageUrl function is defined below after the API endpoints

// Helper functions are defined below after the interfaces

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Display area from API in square feet (area string or square_feet); for use in cards and lists. */
export function getDisplayArea(p: Property): string {
  if (p.area && p.area !== 'N/A') return p.area;
  const sqft = p.square_feet;
  if (sqft != null && sqft > 0) return `${Number(sqft).toLocaleString()} sqft`;
  return '—';
}

/** Display bedrooms from API (display_bedrooms or bedrooms); single number or comma-separated as-is. */
export function getDisplayBedrooms(p: Property): string {
  if (p.display_bedrooms) return p.display_bedrooms;
  const b = p.bedrooms;
  if (b != null && String(b).trim() !== '') return String(b);
  return '—';
}

/** Display bathrooms from API (display_bathrooms or bathrooms); single number or comma-separated as-is. */
export function getDisplayBathrooms(p: Property): string {
  if (p.display_bathrooms) return p.display_bathrooms;
  const b = p.bathrooms;
  if (b != null && String(b).trim() !== '') return String(b);
  return '—';
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const cacheTTLms = options.cacheTTLms ?? 0;
  const cacheKey = method === 'GET' ? url : '';
  const now = Date.now();

  if (cacheKey && cacheTTLms > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.value as T;
    }
    responseCache.delete(cacheKey);
  }

  if (cacheKey && inFlightRequests.has(cacheKey)) {
    return (await inFlightRequests.get(cacheKey)) as T;
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const { cacheTTLms: _cacheTTLms, ...requestOptions } = options;
  void _cacheTTLms;

  const config: RequestInit = {
    ...requestOptions,
    headers: {
      ...defaultHeaders,
      ...requestOptions.headers,
    },
    credentials: 'include', // Include cookies for session-based auth
    cache: method === 'GET' ? 'default' : 'no-store',
  };

  try {
    if (API_DEBUG) {
      console.log(`[API] Making request to: ${url}`);
    }
    const requestPromise = fetch(url, config).then(async (response) => {
      if (API_DEBUG) {
        console.log(`[API] Response status: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // Check if response is HTML (error page) instead of JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          console.error(`[API] Server returned HTML error page (status ${response.status}):`, text.substring(0, 500));
          throw new Error(
            `Server error (${response.status}): The backend returned an HTML error page. ` +
            `This usually means: 1) CORS is not configured correctly, 2) ALLOWED_HOSTS is missing your domain, ` +
            `or 3) The endpoint doesn't exist. Check backend logs for details.`
          );
        }

        // Try to parse JSON error response
        const errorData = await response.json().catch(() => ({
          error: `HTTP error! status: ${response.status}`,
        }));
        console.error(`[API] Request failed:`, errorData);
        throw new Error(errorData.error || errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (API_DEBUG) {
        console.log(`[API] Response content-type: ${contentType}`);
      }
      let data: T;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = {} as T;
      }

      if (cacheKey && cacheTTLms > 0) {
        responseCache.set(cacheKey, {
          value: data,
          expiresAt: Date.now() + cacheTTLms,
        });
      }

      return data;
    });

    if (cacheKey) {
      inFlightRequests.set(cacheKey, requestPromise);
    }
    return await requestPromise;
  } catch (error) {
    console.error(`[API] Request error for ${url}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  } finally {
    if (cacheKey) {
      inFlightRequests.delete(cacheKey);
    }
  }
}

/**
 * Properties API
 */
export const propertiesApi = {
  /**
   * Get all properties with optional filters
   */
  getAll: async (params?: {
    property_type?: string;
    city?: string;
    country?: string;
    featured?: boolean;
    is_for_sale?: boolean;
    is_for_rent?: boolean;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    min_bedrooms?: number;
    min_bathrooms?: number;
    search?: string;
    limit?: number;
    ordering?: string;
  }): Promise<Property[]> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/properties/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchAPI<ApiResponse<Property> | Property[]>(endpoint, {
      cacheTTLms: 30_000,
    });

    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  },

  /**
   * Get paginated properties response
   */
  getAllPaginated: async (params?: {
    property_type?: string;
    city?: string;
    country?: string;
    featured?: boolean;
    is_for_sale?: boolean;
    is_for_rent?: boolean;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    min_bedrooms?: number;
    min_bathrooms?: number;
    search?: string;
    limit?: number;
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<Property>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/properties/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchAPI<ApiResponse<Property> | Property[]>(endpoint, {
      cacheTTLms: 30_000,
    });

    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      };
    }

    return {
      count: response.count || 0,
      next: response.next ?? null,
      previous: response.previous ?? null,
      results: response.results || [],
    };
  },

  /**
   * Follow backend-provided pagination URL directly
   */
  getAllPaginatedByUrl: async (nextUrl: string): Promise<PaginatedResponse<Property>> => {
    try {
      const parsedUrl = new URL(nextUrl);
      const apiBase = new URL(API_BASE_URL);
      let endpoint = `${parsedUrl.pathname}${parsedUrl.search}`;

      // Convert absolute API URL into fetchAPI endpoint path
      if (endpoint.startsWith(apiBase.pathname)) {
        endpoint = endpoint.slice(apiBase.pathname.length) || '/';
      }
      if (!endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
      }

      const response = await fetchAPI<ApiResponse<Property> | Property[]>(endpoint, {
        cacheTTLms: 30_000,
      });
      if (Array.isArray(response)) {
        return {
          count: response.length,
          next: null,
          previous: null,
          results: response,
        };
      }

      return {
        count: response.count || 0,
        next: response.next ?? null,
        previous: response.previous ?? null,
        results: response.results || [],
      };
    } catch (error) {
      console.error('Error following paginated URL:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
  },

  /**
   * Get a single property by ID
   */
  getById: async (id: number): Promise<Property> => {
    return fetchAPI<Property>(`/properties/${id}/`);
  },

  /**
   * Get featured properties
   */
  getFeatured: async (limit?: number): Promise<Property[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (limit) {
        queryParams.append('limit', String(limit));
      }
      const endpoint = `/properties/featured/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetchAPI<Property[] | ApiResponse<Property>>(endpoint, {
        cacheTTLms: 5 * 60_000,
      });
      if (Array.isArray(response)) {
        return response;
      }
      return response.results || [];
    } catch (error) {
      console.error('Error in getFeatured:', error);
      return [];
    }
  },

  /**
   * Get unique cities from all properties (only cities that have properties)
   */
  getCities: async (): Promise<string[]> => {
    try {
      const cities = await fetchAPI<string[]>('/properties/cities/', {
        cacheTTLms: 30 * 60_000,
      });
      return Array.isArray(cities) ? cities : [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Fallback to client-side extraction if endpoint fails
      try {
        const properties = await propertiesApi.getAll();
        const fallbackCities = [...new Set(properties.map(p => p.city).filter(city => city && city.trim() !== ''))].sort();
        return fallbackCities;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  },

  /**
   * Get unique suburbs/neighbourhoods from all properties (only suburbs that have properties)
   */
  getSuburbs: async (): Promise<string[]> => {
    try {
      const suburbs = await fetchAPI<string[]>('/properties/suburbs/', {
        cacheTTLms: 30 * 60_000,
      });
      return Array.isArray(suburbs) ? suburbs : [];
    } catch (error) {
      console.error('Error fetching suburbs:', error);
      // Fallback to client-side extraction if endpoint fails
      try {
        const properties = await propertiesApi.getAll();
        const fallbackSuburbs = [...new Set(properties.map(p => p.address?.split(',')[0] || (p as any).state).filter(suburb => suburb && suburb.trim() !== ''))].sort();
        return fallbackSuburbs;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  },

  /**
   * Search properties
   */
  search: async (query: string, params?: Record<string, any>): Promise<Property[]> => {
    const queryParams = new URLSearchParams({ q: query });

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetchAPI<Property[]>(`/properties/search/?${queryParams.toString()}`);
    return Array.isArray(response) ? response : [];
  },
};

/**
 * Contacts API
 */
export const contactsApi = {
  /**
   * Submit a contact form
   */
  submit: async (data: ContactFormData): Promise<{ success: boolean; message?: string }> => {
    // Map frontend form fields to backend model fields
    const payload: Record<string, any> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      subject: data.subject || 'general',
    };

    // Add property if provided
    if (data.property) {
      payload.property = data.property;
    }

    return fetchAPI<{ success: boolean; message?: string }>('/contacts/contacts/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

/**
 * Viewing Requests API
 */
export const viewingRequestsApi = {
  /**
   * Submit a viewing request
   */
  submit: async (data: ViewingRequestData): Promise<ViewingRequestResponse> => {
    return fetchAPI<ViewingRequestResponse>('/contacts/viewing-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Chatbot API
 */
export interface ChatbotMessageRequest {
  message: string;
  context?: string;
  preferences?: Record<string, any>;
  conversation_history?: Array<{
    sender: 'user' | 'bot';
    text: string;
    timestamp?: string;
  }>;
}

export interface ChatbotMessageResponse {
  text: string;
  context?: string;
  quick_replies?: string[];
  property_cards?: Property[];
  show_budget_selector?: boolean;
  show_location_chips?: boolean;
  show_time_slots?: boolean;
  show_bedroom_selector?: boolean;
  show_property_selection?: boolean;
  preferences?: Record<string, any>;
}

export const chatbotApi = {
  /**
   * Send a message to the chatbot
   */
  sendMessage: async (data: ChatbotMessageRequest): Promise<ChatbotMessageResponse> => {
    return fetchAPI<ChatbotMessageResponse>('/contacts/chatbot/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Helper function to get optimized property image URL with CDN and WebP support
 * @param property - Property object containing image information
 * @param index - Index of image in images array (default: 0)
 * @param size - Image size for optimization (default: 'card' for property cards)
 * @param enableTransforms - Whether to apply CDN image transforms (default: true)
 */
export function getPropertyImageUrl(
  property: Property, 
  index: number = 0, 
  size: keyof typeof CDN_CONFIG.imageTransforms = 'card',
  enableTransforms: boolean = true
): string {
  let imageUrl: string | null = null;

  // Priority 1: Check for direct image field (from list serializer) - most common
  if (property.image) {
    imageUrl = String(property.image).trim();
  }
  // Priority 2: Check for main_image field
  else if (property.main_image) {
    imageUrl = String(property.main_image).trim();
  }
  // Priority 3: If property has images array, use that
  else if (property.images && property.images.length > 0) {
    const image = property.images[index] || property.images[0];
    if (image?.image) {
      imageUrl = String(image.image).trim();
    }
  }

  // Use optimized image URL with CDN and WebP support
  return getOptimizedImageUrl(imageUrl, size, enableTransforms);
}

/**
 * Legacy function for backward compatibility
 */
export function getPropertyImageUrlLegacy(property: Property, index: number = 0): string {
  return getPropertyImageUrl(property, index, 'card', false);
}

/**
 * Helper function to format price for display
 */
export function formatPropertyPrice(property: Property): string {
  // Use display_price if available (pre-formatted by backend)
  if (property.display_price) {
    // Check if display_price already has commas, if not, add them
    if (property.display_price.match(/\d{4,}/)) {
      // Find numbers with 4+ digits and add commas
      return property.display_price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return property.display_price;
  }

  // Handle rental price per night
  if (property.type === 'rent' && property.rental_price_per_night) {
    const price = typeof property.rental_price_per_night === 'string'
      ? parseFloat(property.rental_price_per_night)
      : property.rental_price_per_night;
    return `${property.currency || 'KSh'} ${price.toLocaleString()}/night`;
  }

  // Handle regular price
  if (property.price) {
    const price = typeof property.price === 'string'
      ? parseFloat(property.price)
      : property.price;
    const currency = property.currency || 'KSh';
    if (property.type === 'rent') {
      return `${currency} ${price.toLocaleString()}/month`;
    }
    return `${currency} ${price.toLocaleString()}`;
  }

  return 'Price on request';
}

// Pages API
export interface Page {
  id: number;
  title: string;
  slug: string;
  page_type: 'careers' | 'articles' | 'legal' | 'help_center' | 'faq' | 'forum' | 'custom';
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  published_at: string;
  updated_at: string;
  order: number;
}

export const pagesApi = {
  getAll: async (): Promise<Page[]> => {
    const response = await fetch(`${API_BASE_URL}/pages/pages/`);
    if (!response.ok) throw new Error('Failed to fetch pages');
    return response.json();
  },

  getBySlug: async (slug: string): Promise<Page> => {
    const response = await fetch(`${API_BASE_URL}/pages/pages/${slug}/`);
    if (!response.ok) throw new Error('Failed to fetch page');
    return response.json();
  },

  getByType: async (type: string): Promise<Page[]> => {
    const response = await fetch(`${API_BASE_URL}/pages/pages/by_type/?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch pages');
    return response.json();
  },
};

// Articles API
export interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  category: string;
  thumbnail?: string | null;
  content: string;
  excerpt: string;
  tags: string;
  tags_list: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Article[];
}

export const articlesApi = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    tags?: string;
    search?: string;
  }): Promise<ArticleListResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    // Always filter for published articles for public access
    queryParams.append('published', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/news/articles/${queryString ? `?${queryString}` : ''}`;
    return fetchAPI<ArticleListResponse>(endpoint);
  },

  getBySlug: async (slug: string): Promise<Article> => {
    return fetchAPI<Article>(`/news/articles/${slug}/`);
  },

  getLatest: async (): Promise<Article[]> => {
    return fetchAPI<Article[]>(`/news/articles/latest/`);
  },
};

/**
 * Testimonial interface
 */
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string | null;
  company?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Testimonials API
 */
export const testimonialsApi = {
  /**
   * Get all active testimonials (public endpoint)
   */
  getAll: async (): Promise<Testimonial[]> => {
    return fetchAPI<Testimonial[]>(`/dashboard/testimonials/public/`);
  },
};

/**
 * Job and Application interfaces
 */
export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  job_type: 'Full-Time' | 'Part-Time' | 'Internship' | 'Contract';
  description: string;
  responsibilities: string;
  requirements: string;
  deadline: string | null;
  created_at: string;
}

export interface ApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  cv: File;
  cover_letter: string;
  expected_salary?: string;
  availability?: string;
}

/**
 * Jobs API
 */
export const jobsApi = {
  /**
   * Get all jobs
   */
  getAll: async (params?: { department?: string; job_type?: string }): Promise<Job[]> => {
    const queryParams = new URLSearchParams();
    if (params?.department) queryParams.append('department', params.department);
    if (params?.job_type) queryParams.append('job_type', params.job_type);

    const queryString = queryParams.toString();
    const endpoint = `/jobs/${queryString ? `?${queryString}` : ''}`;
    const result = await fetchAPI<Job[]>(endpoint);
    // Handle paginated response
    return Array.isArray(result) ? result : (result as any).results || [];
  },

  /**
   * Get a single job by ID
   */
  getById: async (id: number): Promise<Job> => {
    return fetchAPI<Job>(`/jobs/${id}/`);
  },

  /**
   * Submit job application
   */
  apply: async (jobId: number, formData: ApplicationFormData): Promise<{ success: boolean; message?: string; application?: any }> => {
    const data = new FormData();
    data.append('job', jobId.toString());
    data.append('full_name', formData.full_name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('location', formData.location);
    data.append('cv', formData.cv);
    data.append('cover_letter', formData.cover_letter);
    if (formData.expected_salary) {
      data.append('expected_salary', formData.expected_salary);
    }
    if (formData.availability) {
      data.append('availability', formData.availability);
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply/`, {
      method: 'POST',
      credentials: 'include',
      body: data, // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
};

/**
 * Event interface
 */
export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  event_date: string;
  event_time: string;
  location: string;
  location_url?: string | null;
  featured_image?: string | null;
  featured_image_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  registration_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Events API
 */
export const eventsApi = {
  /**
   * Get all published events (public endpoint)
   */
  getAll: async (): Promise<Event[]> => {
    return fetchAPI<Event[]>(`/dashboard/events/public/`);
  },

  /**
   * Get a single event by ID (public endpoint)
   */
  getById: async (id: number): Promise<Event> => {
    return fetchAPI<Event>(`/dashboard/events/public/${id}/`);
  },
};

/**
 * Utility functions for SEO-friendly URLs
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const getPropertyUrl = (property: Property): string => {
  // Prefer slug for SEO; fall back to id so detail page can load by id
  const slug = property.slug || (property.title ? createSlug(property.title) : '');
  const segment = slug || (property.id != null ? String(property.id) : '');
  return `/property/${segment}`;
};

