import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Calendar,
  Home,
  Phone,
  Mail,
  MessageCircle,
  Check,
  Wifi,
  Wind,
  Shield,
  Droplet,
  Zap,
  Trees,
  Dumbbell,
  Camera,
  Lock,
  Eye,
  User,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { API_BASE_URL, BACKEND_BASE_URL, getMediaUrl } from "@/config/api";

// Utility function to generate slugs from titles (matches Django's slugify behavior)
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim() // Trim whitespace first
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to format price
const formatPrice = (price: number, currency: string, type: string) => {
  const currencySymbol = currency === 'KSH' ? 'KSh' : currency;
  if (type === "rent") {
    return `${currencySymbol} ${price.toLocaleString()}/month`;
  }
  return `${currencySymbol} ${price.toLocaleString()}`;
};

// Helper function to get full image URL
const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  return getMediaUrl(imageUrl);
};

// Display area from backend: use real square_feet (sqft) from API
const getDisplayArea = (property: BackendProperty): string => {
  const sqft = property.square_feet;
  if (sqft != null && sqft > 0) return `${Number(sqft).toLocaleString()} sqft`;
  if (property.area && property.area !== 'N/A') return property.area;
  return '—';
};

// Display bedrooms/bathrooms as-is: single number or comma-separated (e.g. "6,5,6")
const getDisplayBedBath = (value: number | string | null | undefined): string => {
  if (value == null || String(value).trim() === '') return '—';
  return String(value);
};

// Interface for backend property data
interface BackendProperty {
  id: number;
  title: string;
  slug?: string;
  description: string;
  property_type: string;
  status: string;
  development_type?: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  country: string;
  location: string;
  bedrooms: number | string; // single number or comma-separated e.g. "6,5,6"
  bathrooms: number | string; // single number or comma-separated e.g. "2,4,7"
  display_bedrooms?: number | string;
  display_bathrooms?: number | string;
  square_feet: number | null;
  area: string;
  max_guests: number;
  guests?: number;
  price: string;
  rental_price_per_night: string | null;
  currency: string;
  display_price: string;
  is_for_sale: boolean;
  is_for_rent: boolean;
  type: 'sale' | 'rent';
  amenities: string[];
  main_image: string | null;
  images: Array<{
    id: number;
    image: string;
    alt_text: string;
    order: number;
  }>;
  featured: boolean;
  created_at: string;
  updated_at?: string;
}

// Generate property description based on property data
const generateDescription = (property: BackendProperty) => {
  const typeLabels: Record<string, string> = {
    apartment: "apartment",
    house: "house",
    villa: "villa",
    office: "office space",
    commercial: "commercial property",
    traditional_home: "traditional home",
  };

  const typeLabel = typeLabels[property.property_type] || property.property_type;
  const bedroomsStr = getDisplayBedBath(property.bedrooms);
  const bathroomsStr = getDisplayBedBath(property.bathrooms);
  const bedroomText = bedroomsStr !== '—' ? `${bedroomsStr} bedroom${bedroomsStr.includes(',') || Number(property.bedrooms) !== 1 ? 's' : ''}` : '';
  const bathroomText = bathroomsStr !== '—' ? `${bathroomsStr} bathroom${bathroomsStr.includes(',') || Number(property.bathrooms) !== 1 ? 's' : ''}` : '';

  return `Discover this exceptional ${typeLabel} located in the heart of ${property.location}. 
  
This ${property.featured ? 'featured ' : ''}property offers ${bedroomText ? bedroomText + ' and ' : ''}${bathroomText ? bathroomText : 'modern amenities'}, spanning ${property.area} of thoughtfully designed space.

This property combines modern design with practical functionality, making it perfect for ${property.property_type === 'office' || property.property_type === 'commercial' ? 'business' : 'comfortable living'}.

The property features high-quality finishes, ${bedroomsStr !== '—' ? 'spacious rooms' : 'flexible layouts'}, and is situated in a prime location with easy access to essential amenities, shopping centers, schools, and transportation networks.

${property.property_type === 'apartment' || property.property_type === 'house' || property.property_type === 'villa' ? 'The interior is designed for modern living with attention to detail and comfort.' : ''}
${property.property_type === 'office' || property.property_type === 'commercial' ? 'The space is ideal for businesses looking for a professional environment in a strategic location.' : ''}
${property.property_type === 'traditional_home' ? 'This traditional home offers a blend of cultural heritage and modern comfort.' : ''}

Don't miss this opportunity to ${property.type === 'sale' ? 'own' : 'rent'} this outstanding property in ${property.location}.`;
};

// Function to deduplicate amenities by mapping similar terms to canonical forms
const deduplicateAmenities = (amenities: string[]): string[] => {
  const amenityMap: Record<string, string> = {
    // Pool variations
    'pool': 'Pool',
    'swimming pool': 'Pool',
    'swimming': 'Pool',
    'swimming area': 'Pool',
    
    // Internet/WiFi variations
    'wifi': 'WiFi',
    'wi-fi': 'WiFi',
    'internet': 'WiFi',
    'high-speed internet': 'WiFi',
    'broadband': 'WiFi',
    'wireless': 'WiFi',
    
    // Gym variations
    'gym': 'Gym',
    'fitness': 'Gym',
    'fitness center': 'Gym',
    'gymnasium': 'Gym',
    'workout': 'Gym',
    'exercise': 'Gym',
    
    // Security variations
    'security': 'Security',
    '24/7 security': 'Security',
    'security guard': 'Security',
    'cctv': 'Security',
    'surveillance': 'Security',
    
    // Parking variations
    'parking': 'Parking',
    'car park': 'Parking',
    'garage': 'Parking',
    'carport': 'Parking',
    
    // Other common duplicates
    'air conditioning': 'Air Conditioning',
    'ac': 'Air Conditioning',
    'aircon': 'Air Conditioning',
    'furnished': 'Furnished',
    'fully furnished': 'Furnished',
    'pet friendly': 'Pet-friendly',
    'pet-friendly': 'Pet-friendly',
    'pets allowed': 'Pet-friendly',
  };

  const normalizedAmenities: string[] = [];
  const seen = new Set<string>();

  amenities.forEach(amenity => {
    const normalized = amenity.toLowerCase().trim();
    const canonical = amenityMap[normalized] || amenity;
    
    if (!seen.has(canonical)) {
      seen.add(canonical);
      normalizedAmenities.push(canonical);
    }
  });

  return normalizedAmenities;
};

// Generate features based on property type and amenities
const generateFeatures = (property: BackendProperty) => {
  const featureMap: Record<string, { icon: any; label: string }> = {
    'WiFi': { icon: Wifi, label: "High-Speed WiFi" },
    'Parking': { icon: Car, label: "Parking Available" },
    'Pool': { icon: Droplet, label: "Swimming Pool" },
    'Gym': { icon: Dumbbell, label: "Fitness Center" },
    'Garden': { icon: Trees, label: "Garden" },
    'Balcony': { icon: Home, label: "Balcony" },
    'Air Conditioning': { icon: Wind, label: "Air Conditioning" },
    'Security': { icon: Shield, label: "24/7 Security" },
    'Furnished': { icon: Home, label: "Fully Furnished" },
    'Pet-friendly': { icon: Home, label: "Pet-friendly" },
    'Elevator': { icon: Home, label: "Elevator" },
    'Fireplace': { icon: Home, label: "Fireplace" },
  };

  const features: Array<{ icon: any; label: string }> = [];

  // Deduplicate amenities first
  const dedupedAmenities = deduplicateAmenities(property.amenities || []);

  // Add amenities from backend
  if (dedupedAmenities.length > 0) {
    dedupedAmenities.forEach((amenity: string) => {
      if (featureMap[amenity]) {
        features.push(featureMap[amenity]);
      } else {
        features.push({ icon: Check, label: amenity });
      }
    });
  }

  // Add basic features if not already included
  if (!dedupedAmenities.includes('Security')) {
    features.push({ icon: Shield, label: "24/7 Security" });
  }
  if (!dedupedAmenities.includes('WiFi')) {
    features.push({ icon: Wifi, label: "High-Speed WiFi" });
  }

  // Add property details (support single number or comma-separated display)
  const bedroomsDisplay = getDisplayBedBath(property.bedrooms);
  if (bedroomsDisplay !== '—') {
    features.push({ icon: Bed, label: `${bedroomsDisplay} Bedroom${bedroomsDisplay.includes(',') || Number(property.bedrooms) !== 1 ? 's' : ''}` });
  }

  const bathroomsDisplay = getDisplayBedBath(property.bathrooms);
  if (bathroomsDisplay !== '—') {
    features.push({ icon: Bath, label: `${bathroomsDisplay} Bathroom${bathroomsDisplay.includes(',') || Number(property.bathrooms) !== 1 ? 's' : ''}` });
  }

  return features;
};

// Generate neighborhood info
const generateNeighborhood = (property: BackendProperty) => {
  return {
    description: `Located in ${property.location}, this property is situated in a prime area with excellent connectivity and access to essential services. The neighborhood offers a perfect blend of convenience and lifestyle amenities.`,
    nearby: [
      { name: "Shopping Centers", distance: "2-5 km", type: "shopping" },
      { name: "Schools & Universities", distance: "3-7 km", type: "education" },
      { name: "Hospitals & Clinics", distance: "2-4 km", type: "healthcare" },
      { name: "Public Transport", distance: "500 m - 1 km", type: "transport" },
      { name: "Restaurants & Cafes", distance: "1-3 km", type: "dining" },
      { name: "Parks & Recreation", distance: "2-5 km", type: "recreation" },
    ],
  };
};

const PropertyDetailsPage = () => {
  const { identifier: identifierParam } = useParams<{ identifier: string }>();
  const identifier = identifierParam ?? '';
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I'm interested in this property. Please contact me with more details.",
    viewingDate: "",
  });

  // Fetch property data from backend (by slug or numeric id)
  const isNumeric = identifier ? /^\d+$/.test(identifier) : false;
  const { data: rawProperty, isLoading, error, isError } = useQuery<BackendProperty>({
    queryKey: ['property', identifier],
    queryFn: async () => {
      if (!identifier) throw new Error('Property identifier is required');

      // Non-numeric: use slug endpoint (canonical for /property/<slug>)
      if (!isNumeric) {
        const slugValue = identifier;
        const response = await fetch(
          `${API_BASE_URL}/properties/slug/${encodeURIComponent(slugValue)}/`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          // Ensure we got a single property, not a list (e.g. wrong endpoint)
          if (Array.isArray(data) || data == null || (typeof data === 'object' && data.id == null)) {
            throw new Error('Property not found');
          }
          return data as BackendProperty;
        }

        if (response.status === 404) {
          // Fallback: search by title and match frontend-generated slug
          const searchResponse = await fetch(
            `${API_BASE_URL}/properties/?search=${encodeURIComponent(slugValue)}`,
            { credentials: 'include' }
          );

          if (searchResponse.ok) {
            const data = await searchResponse.json();
            const list = data.results || data;
            const match = Array.isArray(list) ? list.find((p: any) => generateSlug(p.title) === slugValue) : null;
            if (match && match.id != null) {
              return match as BackendProperty;
            }
          }

          throw new Error('Property not found');
        }

        throw new Error(`Request failed: ${response.status}`);
      }

      // Numeric id: use detail endpoint
      const response = await fetch(`${API_BASE_URL}/properties/${identifier}/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) || data == null || data.id == null) {
          throw new Error('Property not found');
        }
        return data as BackendProperty;
      }
      if (response.status === 404) throw new Error('Property not found');
      throw new Error(`Request failed: ${response.status}`);
    },
    enabled: !!identifier,
    retry: false, // Do not retry on 404 to avoid spamming the API
  });

  // Only treat as a valid single property (reject list/array or malformed response)
  const property =
    rawProperty != null && !Array.isArray(rawProperty) && rawProperty.id != null
      ? (rawProperty as BackendProperty)
      : undefined;

  // Get similar properties (same type, different ID) - MUST be before early returns
  const { data: similarPropertiesData } = useQuery({
    queryKey: ['similar-properties', property?.property_type, property?.id],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/properties/?property_type=${property?.property_type}&limit=4`,
        { credentials: 'include' }
      );
      const data = await response.json();
      return (data.results || data).filter((p: any) => p.id !== property?.id).slice(0, 3);
    },
    enabled: !!property,
  });

  // Get all images (main_image + additional images) with full URLs
  const allImages = property ? [
    ...(property.main_image ? [getImageUrl(property.main_image)] : []),
    ...property.images.map(img => getImageUrl(img.image))
  ].filter(Boolean) : [];

  const allImagesRef = useRef<string[]>([]);
  allImagesRef.current = allImages;

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentImageIndex(0); // Reset to first image when property changes
    setMainImageLoaded(false);
  }, [identifier, property]);

  // Preconnect to media origin so hero image loads faster
  useEffect(() => {
    try {
      const origin = new URL(BACKEND_BASE_URL).origin;
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
      return () => link.remove();
    } catch {
      return undefined;
    }
  }, []);

  // Preload first image and adjacent carousel images for instant display
  useEffect(() => {
    const images = allImagesRef.current;
    if (!property?.id || images.length === 0) return;
    const links: HTMLLinkElement[] = [];
    const addPreload = (url: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
      links.push(link);
    };
    addPreload(images[0]);
    const nextIdx = (currentImageIndex + 1) % images.length;
    const prevIdx = (currentImageIndex - 1 + images.length) % images.length;
    if (images[nextIdx] && nextIdx !== 0) addPreload(images[nextIdx]);
    if (images[prevIdx] && prevIdx !== 0 && prevIdx !== nextIdx) addPreload(images[prevIdx]);
    return () => links.forEach((link) => link.remove());
  }, [property?.id, currentImageIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Property not found</h1>
            <p className="text-gray-600">
              The property you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => navigate("/properties")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const nextImage = () => {
    if (allImages.length > 0) {
      setMainImageLoaded(false);
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 0) {
      setMainImageLoaded(false);
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Always create a viewing request so it appears in the admin Viewing section
      const viewingResponse = await fetch(`${API_BASE_URL}/contacts/viewing-requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          property: property.id,
          preferred_date: formData.viewingDate || null,
          preferred_time: formData.viewingDate ? '10:00' : null,
          message: formData.message,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!viewingResponse.ok) {
        throw new Error('Failed to submit viewing request');
      }

      toast.success("Your inquiry has been submitted! We'll get back to you soon.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "I'm interested in this property. Please contact me with more details.",
        viewingDate: "",
      });
    } catch (error) {
      toast.error("Failed to send inquiry. Please try again.");
    }
  };

  const handleWhatsApp = () => {
    const whatsappNumber = "+254717334422";
    const message = encodeURIComponent(
      `Hi, I'm interested in ${property.title} located in ${property.location}. Can you provide more information?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const similarProperties = similarPropertiesData?.map((p: any) => ({
    id: p.id,
    image: getImageUrl(p.main_image || p.image || ''),
    title: p.title,
    location: p.location,
    price: p.display_price || formatPrice(parseFloat(p.price), p.currency || 'KSH', p.type),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    type: p.type as "sale" | "rent",
    propertyType: p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1),
  })) || [];

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <Navigation />

      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/properties")}
          className="text-gray-600 hover:text-gray-900 transition-colors duration-150"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
      </div>

      {/* Image Gallery / Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 pb-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
          {/* Main Image */}
          <div className="relative h-[400px] md:h-[600px]">
            {allImages.length > 0 ? (
              <>
                {/* Skeleton placeholder - static, no animation to avoid glitching */}
                <div
                  className={`absolute inset-0 bg-gray-200 ${
                    mainImageLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                  style={{ transition: "opacity 0.2s ease-out" }}
                  aria-hidden
                />
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className={`w-full h-full object-cover ${
                    mainImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transition: "opacity 0.25s ease-out" }}
                  loading="eager"
                  decoding="async"
                  {...{ fetchpriority: "high" as const }}
                  onLoad={() => setMainImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Camera className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors duration-150"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors duration-150"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>

            {/* Image Counter */}
            {allImages.length > 0 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleSave}
                className={`bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors duration-150 ${
                  isSaved ? "text-red-500" : "text-gray-700"
                }`}
              >
                <Heart className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors duration-150 text-gray-700"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip - lazy load thumbnails beyond first 4 for faster initial paint */}
          {allImages.length > 0 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-white">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMainImageLoaded(false);
                    setCurrentImageIndex(index);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                    currentImageIndex === index ? "border-blue-600 ring-2 ring-blue-600/30" : "border-gray-200"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Title & Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 text-lg">
                    <MapPin className="h-5 w-5 mr-2" />
                    {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">
                    {formatPrice(parseFloat(property.price), property.currency, property.type)}
                  </div>
                  {property.type === "rent" && (
                    <div className="text-sm text-gray-500">per month</div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm">
                  {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).replace('_', ' ')}
                </Badge>
                {property.featured && (
                  <Badge className="bg-yellow-500 text-white text-sm">
                    Featured
                  </Badge>
                )}
                {property.status && (
                  <Badge className={`text-sm ${
                    property.status === 'available' ? 'bg-green-500 text-white' :
                    property.status === 'sold' ? 'bg-red-500 text-white' :
                    property.status === 'rented' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </Badge>
                )}
                {property.status === 'development' && property.development_type && (
                  <Badge className="bg-purple-500 text-white text-sm">
                    {property.development_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Facts */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Quick Facts</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Bed className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{getDisplayBedBath(property.bedrooms)}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Bath className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{getDisplayBedBath(property.bathrooms)}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Square className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{getDisplayArea(property)}</div>
                  <div className="text-sm text-gray-600">Total Area</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{property.max_guests}</div>
                  <div className="text-sm text-gray-600">Max Guests</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t">
                <div>
                  <div className="text-sm text-gray-600">Property Type</div>
                  <div className="text-lg font-semibold capitalize">{property.property_type.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-lg font-semibold capitalize">{property.status}</div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">About This Property</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description || generateDescription(property)}
              </div>
            </Card>

            {/* Full property payload details */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Property Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Address</div>
                  <div className="text-base font-semibold text-gray-900">{property.address || "—"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">City / State</div>
                  <div className="text-base font-semibold text-gray-900">{property.city || "—"} / {property.state || "—"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">ZIP Code</div>
                  <div className="text-base font-semibold text-gray-900">{property.zip_code || "—"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Country</div>
                  <div className="text-base font-semibold text-gray-900">{property.country || "—"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Display Bedrooms / Bathrooms</div>
                  <div className="text-base font-semibold text-gray-900">
                    {property.display_bedrooms ?? getDisplayBedBath(property.bedrooms)} / {property.display_bathrooms ?? getDisplayBedBath(property.bathrooms)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Guests / Max Guests</div>
                  <div className="text-base font-semibold text-gray-900">{property.guests ?? "—"} / {property.max_guests ?? "—"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Raw Price</div>
                  <div className="text-base font-semibold text-gray-900">{property.currency} {property.price}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Display Price</div>
                  <div className="text-base font-semibold text-gray-900">{property.display_price || "—"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Rental Price Per Night</div>
                  <div className="text-base font-semibold text-gray-900">{property.currency} {property.rental_price_per_night ?? "0.00"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Listing Type</div>
                  <div className="text-base font-semibold text-gray-900 capitalize">{property.type || "—"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">For Sale</div>
                  <div className="text-base font-semibold text-gray-900">{property.is_for_sale ? "Yes" : "No"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-gray-500">For Rent</div>
                  <div className="text-base font-semibold text-gray-900">{property.is_for_rent ? "Yes" : "No"}</div>
                </div>
              </div>
            </Card>

            {/* Features & Amenities */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generateFeatures(property).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{feature.label}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Primary CTA Card */}
              <Card className="p-6 hidden lg:block">
                <Button 
                  className="w-full mb-3 bg-blue-600 hover:bg-blue-700" 
                  size="lg" 
                  onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Viewing
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg" 
                  onClick={handleSave}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isSaved ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                  {isSaved ? "Property Saved" : "Save Property"}
                </Button>
              </Card>

              {/* Agent Card */}
              <Card className="p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold">MiiZA Realtors</h3>
                  <p className="text-sm text-gray-600">Licensed Real Estate Agent</p>
                </div>

                {/* Quick Contact Buttons */}
                <div className="space-y-3 mb-6">
                  <Button className="w-full" size="lg" onClick={handleWhatsApp}>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <a href="tel:+254717334422">
                      <Phone className="mr-2 h-5 w-5" />
                      Call Now
                    </a>
                  </Button>
                </div>
              </Card>

              {/* Inquiry Form */}
              <Card id="inquiry-form" className="p-6">
                <h3 className="text-xl font-bold mb-4">Request Information</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email Address *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Preferred Viewing Date</label>
                    <Input
                      type="date"
                      value={formData.viewingDate}
                      onChange={(e) => setFormData({ ...formData, viewingDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      placeholder="Tell us about your requirements..."
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Send Inquiry
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>

      </div>

      <Footer />

      {/* Mobile Fixed CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 z-[100] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)]">
        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700" 
          size="lg" 
          onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Viewing
        </Button>
        <Button 
          variant="outline" 
          className="px-4" 
          size="lg" 
          onClick={handleSave}
          aria-label="Save Property"
        >
          <Heart className={`h-5 w-5 ${isSaved ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;

