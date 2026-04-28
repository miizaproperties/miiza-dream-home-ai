import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  ChevronDown,
  Building2,
  Search,
  Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { propertiesApi, viewingRequestsApi, getPropertyImageUrl, formatPropertyPrice, getDisplayArea, getDisplayBedrooms, getDisplayBathrooms, getPropertyUrl, type Property } from "@/services/api";
import { getOptimizedImageUrl, preloadImage, CDN_CONFIG } from "@/config/api";
import { BACKEND_BASE_URL } from "@/config/api";

const propertyTypes = [
  { id: "apartment", label: "Apartment" },
  { id: "house", label: "Townhouses" },
  { id: "villa", label: "Villa" },
  { id: "commercial", label: "Commercial" },
  { id: "office", label: "Office" },
  { id: "airbnb", label: "Airbnb" },
  { id: "traditional_home", label: "Traditional Home" }
];

const countries = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Ethiopia", "Somalia", "South Sudan", "Burundi",
  "United Kingdom", "UAE", "USA", "South Africa", "Nigeria", "Egypt"
];

const regions = [
  "Nairobi", "Central", "Coast", "Eastern", "North Eastern", "Nyanza", "Rift Valley", "Western"
];

// Cities will be fetched dynamically from the API based on actual properties

// City normalization map to handle typos and variations in the database
// Maps variations to the canonical city name
const cityNormalizationMap: Record<string, string> = {
  'nairobi': 'nairobi',
  'nirobi': 'nairobi',  // Typo variant
  'nairibi': 'nairobi', // Another typo variant
  'kiambu': 'kiambu',
  'thika': 'thika',
  'mombasa': 'mombasa',
  'nakuru': 'nakuru',
  'kisumu': 'kisumu',
  'eldoret': 'eldoret',
  'machakos': 'machakos',
  'kajiado': 'kajiado',
  "murang'a": "murang'a",
  'muranga': "murang'a",
};

// Helper function to normalize city names
const normalizeCity = (city: string): string => {
  const normalized = city.toLowerCase().trim();
  return cityNormalizationMap[normalized] || normalized;
};

const locations = [
  "Westlands", "Karen", "Kilimani", "CBD", "Runda", "Kileleshwa",
  "Lavington", "Muthaiga", "Spring Valley", "Nyari",
  "Mayfair", "Marina", "Manhattan", "Waterfront", "Island", "Nile View"
];

const neighbourhoods = [
  "Westlands", "Karen", "Kilimani", "CBD", "Runda", "Kileleshwa",
  "Lavington", "Muthaiga", "Spring Valley", "Nyari", "Parklands",
  "Ngong Road", "Langata", "South B", "South C", "Embakasi", "Eastleigh"
];

// Location hierarchy mapping
const locationHierarchy: {
  neighbourhoods: Record<string, { city: string; region: string }>;
  cities: Record<string, { region: string; neighbourhoods: string[] }>;
  regions: Record<string, { cities: string[]; neighbourhoods: string[] }>;
} = {
  // Neighborhood -> City -> Region mapping
  neighbourhoods: {
    "Westlands": { city: "Nairobi", region: "Nairobi" },
    "Karen": { city: "Nairobi", region: "Nairobi" },
    "Kilimani": { city: "Nairobi", region: "Nairobi" },
    "CBD": { city: "Nairobi", region: "Nairobi" },
    "Runda": { city: "Nairobi", region: "Nairobi" },
    "Kileleshwa": { city: "Nairobi", region: "Nairobi" },
    "Lavington": { city: "Nairobi", region: "Nairobi" },
    "Muthaiga": { city: "Nairobi", region: "Nairobi" },
    "Spring Valley": { city: "Nairobi", region: "Nairobi" },
    "Nyari": { city: "Nairobi", region: "Nairobi" },
    "Parklands": { city: "Nairobi", region: "Nairobi" },
    "Ngong Road": { city: "Nairobi", region: "Nairobi" },
    "Langata": { city: "Nairobi", region: "Nairobi" },
    "South B": { city: "Nairobi", region: "Nairobi" },
    "South C": { city: "Nairobi", region: "Nairobi" },
    "Embakasi": { city: "Nairobi", region: "Nairobi" },
    "Eastleigh": { city: "Nairobi", region: "Nairobi" },
  },
  // City -> Region and City -> Neighborhoods mapping
  cities: {
    "Nairobi": {
      region: "Nairobi",
      neighbourhoods: ["Westlands", "Karen", "Kilimani", "CBD", "Runda", "Kileleshwa", "Lavington", "Muthaiga", "Spring Valley", "Nyari", "Parklands", "Ngong Road", "Langata", "South B", "South C", "Embakasi", "Eastleigh"]
    },
    "Thika": { region: "Central", neighbourhoods: [] },
    "Kiambu": { region: "Central", neighbourhoods: [] },
    "Murang'a": { region: "Central", neighbourhoods: [] },
    "Machakos": { region: "Eastern", neighbourhoods: [] },
    "Kajiado": { region: "Rift Valley", neighbourhoods: [] },
    "Nakuru": { region: "Rift Valley", neighbourhoods: [] },
    "Mombasa": { region: "Coast", neighbourhoods: [] },
    "Kisumu": { region: "Nyanza", neighbourhoods: [] },
    "Eldoret": { region: "Rift Valley", neighbourhoods: [] },
    "London": { region: "United Kingdom", neighbourhoods: ["Mayfair"] },
    "Dubai": { region: "UAE", neighbourhoods: ["Marina"] },
    "New York": { region: "USA", neighbourhoods: ["Manhattan"] },
    "Cape Town": { region: "South Africa", neighbourhoods: ["Waterfront"] },
    "Lagos": { region: "Nigeria", neighbourhoods: ["Island"] },
    "Cairo": { region: "Egypt", neighbourhoods: ["Nile View"] },
  },
  // Region -> Cities and Region -> Neighborhoods mapping
  regions: {
    "Nairobi": {
      cities: ["Nairobi"],
      neighbourhoods: ["Westlands", "Karen", "Kilimani", "CBD", "Runda", "Kileleshwa", "Lavington", "Muthaiga", "Spring Valley", "Nyari", "Parklands", "Ngong Road", "Langata", "South B", "South C", "Embakasi", "Eastleigh"]
    },
    "Central": {
      cities: ["Thika", "Kiambu", "Murang'a"],
      neighbourhoods: []
    },
    "Coast": {
      cities: ["Mombasa"],
      neighbourhoods: []
    },
    "Eastern": {
      cities: ["Machakos"],
      neighbourhoods: []
    },
    "North Eastern": {
      cities: [],
      neighbourhoods: []
    },
    "Nyanza": {
      cities: ["Kisumu"],
      neighbourhoods: []
    },
    "Rift Valley": {
      cities: ["Nakuru", "Kajiado", "Eldoret"],
      neighbourhoods: []
    },
    "Western": {
      cities: [],
      neighbourhoods: []
    },
  }
};

const developments = [
  "New Development", "Off-Plan", "Pre-Launch", "Under Construction",
  "Completed", "Gated Community", "Mixed-Use Development"
];

const amenities = [
  "Security", "Parking", "Pool", "Gym", "Garden", "Balcony",
  "Pet-friendly", "Air Conditioning", "Furnished", "WiFi"
];

const PropertiesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [savedProperties, setSavedProperties] = useState<number[]>([]);
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<number | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    country: [] as string[],
    region: [] as string[],
    city: [] as string[],
    propertyType: [] as string[],
    status: [] as string[],
    priceRange: [0, 100000000],
    bedrooms: [] as number[],
    bathrooms: [] as number[],
    amenities: [] as string[],
    sortBy: "newest",
    buySell: "" as "" | "buy" | "sell" | "rent",
    neighbourhood: [] as string[],
    development: [] as string[]
  });

  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
  const [showQuickView, setShowQuickView] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    message: ""
  });
  const [showPhotoGallery, setShowPhotoGallery] = useState<number | null>(null);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [loadedImageIds, setLoadedImageIds] = useState<Set<number>>(new Set());
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Dynamic cities and suburbs state - fetched from API
  const [cities, setCities] = useState<string[]>([]);
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [loadingSuburbs, setLoadingSuburbs] = useState(true);

  // Available options based on current selections (for cascading dropdowns)
  const [availableRegions, setAvailableRegions] = useState<string[]>(regions);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableNeighbourhoods, setAvailableNeighbourhoods] = useState<string[]>(neighbourhoods);

  // Update available options based on current selections (cascading dropdowns)
  useEffect(() => {
    const selectedRegion = filters.region[0];
    const selectedCity = filters.city[0];
    const selectedNeighbourhood = filters.neighbourhood[0];

    // Priority: Neighborhood > City > Region
    // If neighborhood is selected, show its city's neighborhoods, but filter region and city options
    if (selectedNeighbourhood && locationHierarchy.neighbourhoods[selectedNeighbourhood]) {
      const neighbourhoodInfo = locationHierarchy.neighbourhoods[selectedNeighbourhood];
      const cityInfo = locationHierarchy.cities[neighbourhoodInfo.city];
      setAvailableRegions([neighbourhoodInfo.region]);
      setAvailableCities([neighbourhoodInfo.city]);
      // Show all neighborhoods in the city (not just the selected one)
      setAvailableNeighbourhoods(cityInfo?.neighbourhoods.length > 0 ? cityInfo.neighbourhoods : [selectedNeighbourhood]);
    }
    // If city is selected (but no neighborhood), filter regions and show city's neighborhoods
    else if (selectedCity && locationHierarchy.cities[selectedCity]) {
      const cityInfo = locationHierarchy.cities[selectedCity];
      setAvailableRegions([cityInfo.region]);
      setAvailableCities([selectedCity]);
      setAvailableNeighbourhoods(cityInfo.neighbourhoods.length > 0 ? cityInfo.neighbourhoods : neighbourhoods);
    }
    // If region is selected (but no city/neighborhood), filter cities and neighborhoods
    else if (selectedRegion && locationHierarchy.regions[selectedRegion]) {
      const regionInfo = locationHierarchy.regions[selectedRegion];
      setAvailableRegions([selectedRegion]);
      setAvailableCities(regionInfo.cities.length > 0 ? regionInfo.cities : cities);
      setAvailableNeighbourhoods(regionInfo.neighbourhoods.length > 0 ? regionInfo.neighbourhoods : neighbourhoods);
    }
    // No selection - show all options
    else {
      setAvailableRegions(regions);
      setAvailableCities(cities);
      setAvailableNeighbourhoods(neighbourhoods);
    }
  }, [filters.region, filters.city, filters.neighbourhood]);

  // Initialize Buy / Rent / Sell filter from URL query param or route path
  // If on main /properties route, don't set any filter (show all properties)
  useEffect(() => {
    const type = searchParams.get("type");
    const pathType = location.pathname.split("/").pop(); // Get last segment of path

    // Only set filter if we're on a specific category page (rent, buy, sell)
    // If on main /properties route, buySell should remain empty to show all properties
    if (pathType === "rent" || pathType === "buy" || pathType === "sell") {
      setFilters(prev => ({
        ...prev,
        buySell: pathType as "buy" | "sell" | "rent",
      }));
    } else if (type === "buy" || type === "rent" || type === "sell") {
      setFilters(prev => ({
        ...prev,
        buySell: type as "buy" | "sell" | "rent",
      }));
    } else if (location.pathname === "/properties") {
      // Main properties page - clear any buySell filter to show all properties
      setFilters(prev => ({
        ...prev,
        buySell: "",
      }));
    }
  }, [searchParams, location.pathname]);

  // Preconnect to media origin so image requests start faster
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

  // Preload first 6 property images so they start loading before cards render
  useEffect(() => {
    const toPreload = filteredProperties.slice(0, 6);
    toPreload.forEach((p) => {
      const url = getPropertyImageUrl(p, 0, 'card', true);
      if (url && url.startsWith("http")) {
        preloadImage(url, 'high');
      }
    });
  }, [filteredProperties]);

  // Fetch all suburbs from API for the Select Suburb dropdown (runs on mount)
  useEffect(() => {
    const fetchSuburbs = async () => {
      try {
        setLoadingSuburbs(true);
        const fetchedSuburbs = await propertiesApi.getSuburbs();
        setSuburbs(fetchedSuburbs);
      } catch (error) {
        console.error("Error fetching suburbs:", error);
        toast.error("Failed to load suburbs.");
        setSuburbs([]);
      } finally {
        setLoadingSuburbs(false);
      }
    };
    fetchSuburbs();
  }, []);

  // Fetch dynamic cities once on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const fetchedCities = await propertiesApi.getCities();
        setCities(fetchedCities);
        setAvailableCities(fetchedCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      }
    };
    fetchCities();
  }, []);

  // Handle image carousel
  const nextImage = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (property && property.images && property.images.length > 0) {
      setCurrentImageIndex(prev => ({
        ...prev,
        [propertyId]: ((prev[propertyId] || 0) + 1) % property.images!.length
      }));
    }
  };

  const prevImage = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (property && property.images && property.images.length > 0) {
      setCurrentImageIndex(prev => ({
        ...prev,
        [propertyId]: prev[propertyId] === 0 ? property.images!.length - 1 : (prev[propertyId] || 0) - 1
      }));
    }
  };

  // Toggle saved property
  const toggleSaved = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    setSavedProperties(prev => {
      const isCurrentlySaved = prev.includes(propertyId);
      if (isCurrentlySaved) {
        toast.success(`Removed "${property?.title}" from saved properties`);
        return prev.filter(id => id !== propertyId);
      } else {
        toast.success(`Added "${property?.title}" to saved properties`);
        return [...prev, propertyId];
      }
    });
  };

  // Handle property actions
  const handleCallAgent = (property: Property) => {
    toast.success(`Calling agent for "${property.title}"...`);
    // In a real app, this would initiate a phone call
    window.open(`tel:+254717334422`, '_self');
  };

  const handleChatAgent = (property: Property) => {
    toast.success(`Opening chat for "${property.title}"...`);
    // In a real app, this would open a chat interface
    setShowQuickView(property.id);
  };

  const handleShareProperty = async (property: Property) => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} in ${property.location}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Property shared successfully!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} ${shareData.url}`);
        toast.success("Property link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Failed to share property");
    }
  };

  const handleQuickView = (propertyId: number) => {
    setShowPhotoGallery(propertyId);
    setGalleryImageIndex(0);
    toast.info("Opening photo gallery...");
  };

  const handleScheduleViewing = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await viewingRequestsApi.submit({
        name: scheduleForm.name,
        email: scheduleForm.email,
        phone: scheduleForm.phone,
        preferred_date: scheduleForm.preferredDate,
        preferred_time: scheduleForm.preferredTime,
        message: scheduleForm.message,
      });

      toast.success("Viewing scheduled successfully! We'll contact you soon to confirm.");
      setShowScheduleModal(false);
      setScheduleForm({
        name: "",
        email: "",
        phone: "",
        preferredDate: "",
        preferredTime: "",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting viewing request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule viewing. Please try again.");
    }
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduleForm({
      name: "",
      email: "",
      phone: "",
      preferredDate: "",
      preferredTime: "",
      message: ""
    });
  };

  const handleViewSavedProperties = () => {
    setShowSavedModal(true);
    toast.info("Opening saved properties...");
  };

  const handlePriceRangeQuickSelect = (range: string) => {
    let newRange: [number, number];
    switch (range) {
      case "Under 10M":
        newRange = [0, 10000000];
        break;
      case "10-25M":
        newRange = [10000000, 25000000];
        break;
      case "25-50M":
        newRange = [25000000, 50000000];
        break;
      case "50M+":
        newRange = [50000000, 100000000];
        break;
      default:
        newRange = [0, 100000000];
    }
    setFilters(prev => ({ ...prev, priceRange: newRange }));
    toast.success(`Price range set to ${range}`);
  };

  const handleMobileSearch = () => {
    toast.info("Opening search...");
    setShowFilters(true);
  };

  const handleMobileSaved = () => {
    handleViewSavedProperties();
  };

  const handleMobileCall = () => {
    window.open(`tel:+254717334422`, '_self');
    toast.success("Calling MiiZA Realtors...");
  };

  const handleMobileChat = () => {
    toast.info("Opening chat...");
    // In a real app, this would open a chat interface
  };

  // Photo gallery handlers
  const nextGalleryImage = () => {
    const property = properties.find(p => p.id === showPhotoGallery);
    if (property && property.images && property.images.length > 0) {
      setGalleryImageIndex(prev => (prev + 1) % property.images!.length);
    }
  };

  const prevGalleryImage = () => {
    const property = properties.find(p => p.id === showPhotoGallery);
    if (property && property.images && property.images.length > 0) {
      setGalleryImageIndex(prev => prev === 0 ? property.images!.length - 1 : prev - 1);
    }
  };

  const closePhotoGallery = () => {
    setShowPhotoGallery(null);
    setGalleryImageIndex(0);
  };

  const fetchPage = useCallback(async (page: number, append: boolean, apiParams: Record<string, any>) => {
    const response = await propertiesApi.getAllPaginated({ ...apiParams, page });
    setTotalCount(response.count || 0);
    setNextPageUrl(response.next);
    setProperties((prev) => (append ? [...prev, ...response.results] : response.results));
    return response.results;
  }, []);

  const activeApiParams = useMemo(() => {
    const apiParams: Record<string, any> = {};
    if (filters.search) apiParams.search = filters.search;
    if (filters.country.length === 1) apiParams.country = filters.country[0];
    if (filters.propertyType.length === 1) {
      const propertyTypeMap: Record<string, string> = {
        apartment: "apartment",
        house: "house",
        commercial: "commercial",
        office: "office",
        airbnb: "airbnb",
        traditional_home: "traditional_home",
      };
      apiParams.property_type = propertyTypeMap[filters.propertyType[0]] || filters.propertyType[0];
    }
    if (filters.status.length === 1) apiParams.status = filters.status[0];
    if (filters.buySell === "buy" || filters.buySell === "sell") apiParams.is_for_sale = true;
    if (filters.buySell === "rent") apiParams.is_for_rent = true;
    if (filters.priceRange[0] > 0) apiParams.min_price = filters.priceRange[0];
    if (filters.priceRange[1] < 100000000) apiParams.max_price = filters.priceRange[1];
    if (filters.bedrooms.length > 0) apiParams.bedrooms = filters.bedrooms[0];
    if (filters.bathrooms.length > 0) apiParams.min_bathrooms = filters.bathrooms[0];
    const orderingMap: Record<string, string> = {
      "price-low": "price",
      "price-high": "-price",
      newest: "-created_at",
      featured: "-featured",
    };
    apiParams.ordering = orderingMap[filters.sortBy] || "-created_at";
    return apiParams;
  }, [filters]);

  const handleLoadMore = useCallback(async () => {
    if (!nextPageUrl || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const response = await propertiesApi.getAllPaginatedByUrl(nextPageUrl);
      setTotalCount(response.count || 0);
      setNextPageUrl(response.next);
      setProperties((prev) => [...prev, ...response.results]);
      setFilteredProperties((prev) => [...prev, ...response.results]);
    } catch (error) {
      toast.error("Failed to load more properties.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageUrl, isLoadingMore]);

  // Infinite scroll trigger (with manual button fallback below)
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const target = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && nextPageUrl && !loading && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(target);
    return () => observer.unobserve(target);
  }, [nextPageUrl, loading, isLoadingMore, handleLoadMore]);

  // Apply filters and fetch from API
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        const featuredOnly = searchParams.get("featured") === "true";
        let filtered: Property[] = [];
        if (featuredOnly) {
          filtered = await propertiesApi.getFeatured();
          setProperties(filtered);
          setTotalCount(filtered.length);
          setNextPageUrl(null);
        } else {
          filtered = await fetchPage(1, false, activeApiParams);
        }
        setInitialLoad(false);

        // Apply client-side filters that aren't supported by API
        let finalFiltered = filtered;

        // Search is already handled server-side via apiParams.search.

        // Property Type filter (client-side for multiple selections)
        if (filters.propertyType.length > 0) {
          finalFiltered = finalFiltered.filter(property =>
            filters.propertyType.includes(property.property_type)
          );
        }

        // City filter (client-side for all selections to handle data variations)
        if (filters.city.length > 0) {
          finalFiltered = finalFiltered.filter(property => {
            const propertyCity = property.city?.toLowerCase().trim() || '';
            const propertyLocation = property.location?.toLowerCase().trim() || '';

            // Normalize property city to handle typos
            const normalizedPropertyCity = normalizeCity(propertyCity);

            return filters.city.some(selectedCity => {
              const selectedCityLower = selectedCity.toLowerCase().trim();
              const normalizedSelectedCity = normalizeCity(selectedCityLower);

              // Match using normalized city names (handles typos like "Nirobi" -> "Nairobi")
              if (normalizedPropertyCity === normalizedSelectedCity) return true;

              // Exact match with original names
              if (propertyCity === selectedCityLower) return true;

              // Location field contains selected city
              if (propertyLocation.includes(selectedCityLower)) return true;

              // Property city contains selected city (partial match)
              if (propertyCity.includes(selectedCityLower)) return true;

              // Selected city contains property city (reverse partial match)
              if (selectedCityLower.includes(propertyCity)) return true;

              return false;
            });
          });
        }

        // Status filter (client-side for multiple selections)
        if (filters.status.length > 0) {
          finalFiltered = finalFiltered.filter(property =>
            filters.status.includes(property.status)
          );
        }

        // Region filter (client-side as it's not in API)
        // Check if region name appears in location, city, or address fields
        if (filters.region.length > 0) {
          finalFiltered = finalFiltered.filter(property =>
            filters.region.some(region => {
              const regionLower = region.toLowerCase();
              const locationLower = property.location?.toLowerCase() || '';
              const cityLower = property.city?.toLowerCase() || '';
              const addressLower = property.address?.toLowerCase() || '';
              return (
                locationLower.includes(regionLower) ||
                cityLower.includes(regionLower) ||
                addressLower.includes(regionLower)
              );
            })
          );
        }

        // Neighbourhood filter (client-side refinement)
        // Check address and location fields for neighborhood name
        // This is the most specific filter, so it's always applied when selected
        if (filters.neighbourhood.length > 0) {
          finalFiltered = finalFiltered.filter(property =>
            filters.neighbourhood.some(neighbourhood => {
              const neighbourhoodLower = neighbourhood.toLowerCase().trim();
              const addressLower = (property.address?.toLowerCase() || '').trim();
              const locationLower = (property.location?.toLowerCase() || '').trim();
              const stateLower = (property.state?.toLowerCase() || '').trim();
              // Check if neighborhood name appears in address, location, or state (suburb/neighbourhood) field
              // Match as substring for flexibility (e.g., "Ngong Road" matches "123 Ngong Road, Nairobi")
              return (
                addressLower.includes(neighbourhoodLower) ||
                locationLower.includes(neighbourhoodLower) ||
                stateLower.includes(neighbourhoodLower) ||
                stateLower === neighbourhoodLower // Exact match for state field
              );
            })
          );
        }

        // Development filter (client-side refinement)
        if (filters.development.length > 0) {
          finalFiltered = finalFiltered.filter(property => {
            const titleLower = property.title?.toLowerCase() || '';
            const descLower = property.description?.toLowerCase() || '';
            return filters.development.some(development => {
              const devLower = development.toLowerCase();
              return titleLower.includes(devLower) || descLower.includes(devLower);
            });
          });
        }

        // Buy/Rent/Sell filter (client-side backup to ensure backend categories are respected)
        // This ensures properties match the category from backend (is_for_rent, is_for_sale)
        if (filters.buySell) {
          finalFiltered = finalFiltered.filter(property => {
            if (filters.buySell === "rent") {
              // For rent: property must have is_for_rent = true
              return property.is_for_rent === true;
            } else if (filters.buySell === "buy" || filters.buySell === "sell") {
              // For buy/sell: property must have is_for_sale = true
              return property.is_for_sale === true;
            }
            return true; // No filter applied
          });
        }

        setFilteredProperties(finalFiltered);
      } catch (error) {
        console.error("Error filtering properties:", error);
        toast.error("Failed to filter properties. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [activeApiParams, fetchPage, filters.city, filters.region, filters.neighbourhood, filters.development, filters.propertyType, filters.status, filters.buySell, filters.search]);

  const PropertyCard = ({ property, index = 0 }: { property: Property; index?: number }) => {
    const currentImage = currentImageIndex[property.id] || 0;
    const isSaved = savedProperties.includes(property.id);
    const isAboveFold = index < 8;
    const propertyDetailUrl = getPropertyUrl(property);

    return (
      <Card 
        className="group overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 rounded-lg"
        onClick={() => { window.location.href = propertyDetailUrl; }}
      >
        <div className="relative overflow-hidden h-32 sm:h-36 bg-gray-200">
          {!loadedImageIds.has(property.id) && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-[0]" aria-hidden />
          )}
          <img
            src={getPropertyImageUrl(property, currentImage, 'card', true)}
            alt={property.title}
            className={`relative z-[1] w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loadedImageIds.has(property.id) ? "opacity-100" : "opacity-0"}`}
            loading={isAboveFold ? "eager" : "lazy"}
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            {...(isAboveFold ? { fetchpriority: "high" as const } : {})}
            onLoad={() => setLoadedImageIds((prev) => new Set(prev).add(property.id))}
            onError={(e) => {
              setLoadedImageIds((prev) => new Set(prev).add(property.id));
              const target = e.target as HTMLImageElement;
              if (target.src !== '/property-placeholder.svg' && !target.src.includes('placeholder')) {
                target.src = '/property-placeholder.svg';
              }
            }}
          />

          {/* Image navigation dots */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentImage ? "bg-white" : "bg-white/50"
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => ({ ...prev, [property.id]: index }));
                  }}
                />
              ))}
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.featured && (
              <Badge className="bg-yellow-500 text-white">
                Featured
              </Badge>
            )}
            {/* Check if property was created recently (within last 7 days) */}
            {property.created_at && new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <Badge className="bg-green-500 text-white">New</Badge>
            )}
          </div>

          {/* Heart icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaved(property.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            {isSaved ? "✓" : "Save"}
          </button>

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickView(property.id);
              }}
            >
              Quick View
            </Button>
          </div>
        </div>

        <div className="p-3">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-xs text-gray-500 capitalize">
                {property.property_type?.replace('_', ' ') || property.type}
              </p>
              {property.status === 'development' && property.development_type && (
                <Badge variant="outline" className="text-xs">
                  {property.development_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 flex items-center">
              {property.location}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            {getDisplayBedrooms(property) !== "—" && (
              <span className="flex items-center">
                {getDisplayBedrooms(property)} beds
              </span>
            )}
            {getDisplayBathrooms(property) !== "—" && (
              <span className="flex items-center">
                {getDisplayBathrooms(property)} baths
              </span>
            )}
            <span className="flex items-center">
              {getDisplayArea(property)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm font-bold text-blue-600">
              {formatPropertyPrice(property)}
            </span>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.location.href = propertyDetailUrl;
              }}
              className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700"
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Ensure we always have a selected property when in map view
  const activeMapProperty: Property | undefined = (() => {
    if (viewMode !== 'map' || filteredProperties.length === 0) return undefined;

    const existing =
      selectedMapPropertyId &&
      filteredProperties.find((property) => property.id === selectedMapPropertyId);

    return existing || filteredProperties[0];
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {searchParams.get("featured") === "true" 
                ? "Featured Properties" 
                : "Find Your Perfect Property"
              }
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {searchParams.get("featured") === "true"
                ? "Discover our handpicked selection of premium featured properties"
                : "Discover premium properties across Nairobi with our advanced search and filter system"
              }
            </p>
          </div>

          {/* Search Bar - Horizontal Filter Layout */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-3 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                {/* Property Type Filter */}
                <div className="lg:col-span-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative flex items-center border border-gray-300 rounded-lg bg-white h-12 hover:border-gray-400 transition-colors cursor-pointer w-full">
                        <Building2 className="h-5 w-5 ml-3 text-teal-600 flex-shrink-0" />
                        <div className="flex-1 px-2 text-sm text-gray-900 font-medium">
                          {filters.propertyType.length > 0
                            ? filters.propertyType.length === 1
                              ? propertyTypes.find(t => t.id === filters.propertyType[0])?.label || "Selected"
                              : `${filters.propertyType.length} selected`
                            : "Select Property Type"}
                        </div>
                        <ChevronDown className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2" align="start">
                      <div className="space-y-2">
                        {propertyTypes.map(type => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`property-type-${type.id}`}
                              checked={filters.propertyType.includes(type.id)}
                              onCheckedChange={(checked) => {
                                setFilters(prev => ({
                                  ...prev,
                                  propertyType: checked
                                    ? [...prev.propertyType, type.id]
                                    : prev.propertyType.filter(t => t !== type.id)
                                }));
                              }}
                            />
                            <label
                              htmlFor={`property-type-${type.id}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              {type.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* City Filter */}
                <div className="lg:col-span-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative flex items-center border border-gray-300 rounded-lg bg-white h-12 hover:border-gray-400 transition-colors cursor-pointer w-full">
                        <MapPin className="h-5 w-5 ml-3 text-teal-600 flex-shrink-0" />
                        <div className="flex-1 px-2 text-sm text-gray-900 font-medium">
                          {filters.city.length > 0
                            ? filters.city.length === 1
                              ? filters.city[0]
                              : `${filters.city.length} selected`
                            : "Select City"}
                        </div>
                        <ChevronDown className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2 max-h-[300px] overflow-y-auto" align="start">
                      <div className="space-y-2">
                        {cities.map(city => (
                          <div key={city} className="flex items-center space-x-2">
                            <Checkbox
                              id={`city-${city}`}
                              checked={filters.city.includes(city)}
                              onCheckedChange={(checked) => {
                                const cityInfo = locationHierarchy.cities[city];
                                setFilters(prev => {
                                  const newCities = checked
                                    ? [...prev.city, city]
                                    : prev.city.filter(c => c !== city);

                                  // Update regions based on selected cities
                                  const newRegions = new Set<string>();
                                  newCities.forEach(c => {
                                    const info = locationHierarchy.cities[c];
                                    if (info) newRegions.add(info.region);
                                  });

                                  // Filter neighborhoods to only those in selected cities
                                  const validNeighborhoods = prev.neighbourhood.filter(n => {
                                    const nInfo = locationHierarchy.neighbourhoods[n];
                                    return nInfo && newCities.includes(nInfo.city);
                                  });

                                  return {
                                    ...prev,
                                    city: newCities,
                                    region: Array.from(newRegions),
                                    neighbourhood: validNeighborhoods
                                  };
                                });
                              }}
                            />
                            <label
                              htmlFor={`city-${city}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              {city}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Suburb/Neighbourhood Filter */}
                <div className="lg:col-span-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative flex items-center border border-gray-300 rounded-lg bg-white h-12 hover:border-gray-400 transition-colors cursor-pointer w-full">
                        <MapPin className="h-5 w-5 ml-3 text-teal-600 flex-shrink-0" />
                        <div className="flex-1 px-2 text-sm text-gray-900 font-medium">
                          {filters.neighbourhood.length > 0
                            ? filters.neighbourhood.length === 1
                              ? filters.neighbourhood[0]
                              : `${filters.neighbourhood.length} selected`
                            : "Select Suburb"}
                        </div>
                        <ChevronDown className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2 max-h-[300px] overflow-y-auto" align="start">
                      <div className="space-y-2">
                        {loadingSuburbs ? (
                          <p className="text-sm text-gray-500 py-2 text-center">Loading suburbs...</p>
                        ) : suburbs.length === 0 ? (
                          <p className="text-sm text-gray-500 py-2 text-center">No suburbs found</p>
                        ) : (
                        suburbs.map(suburb => (
                          <div key={suburb} className="flex items-center space-x-2">
                            <Checkbox
                              id={`suburb-${suburb}`}
                              checked={filters.neighbourhood.includes(suburb)}
                              onCheckedChange={(checked) => {
                                setFilters(prev => ({
                                  ...prev,
                                  neighbourhood: checked
                                    ? [...prev.neighbourhood, suburb]
                                    : prev.neighbourhood.filter(s => s !== suburb)
                                }));
                              }}
                            />
                            <label
                              htmlFor={`suburb-${suburb}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              {suburb}
                            </label>
                          </div>
                        ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Property Status Filter */}
                <div className="lg:col-span-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative flex items-center border border-gray-300 rounded-lg bg-white h-12 hover:border-gray-400 transition-colors cursor-pointer w-full">
                        <Building2 className="h-5 w-5 ml-3 text-teal-600 flex-shrink-0" />
                        <div className="flex-1 px-2 text-sm text-gray-900 font-medium">
                          {filters.status.length > 0
                            ? filters.status.length === 1
                              ? filters.status[0].charAt(0).toUpperCase() + filters.status[0].slice(1)
                              : `${filters.status.length} selected`
                            : "Select Status"}
                        </div>
                        <ChevronDown className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2" align="start">
                      <div className="space-y-2">
                        {["available", "sold", "rented", "pending", "development"].map(status => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={filters.status.includes(status)}
                              onCheckedChange={(checked) => {
                                setFilters(prev => ({
                                  ...prev,
                                  status: checked
                                    ? [...prev.status, status]
                                    : prev.status.filter(s => s !== status)
                                }));
                              }}
                            />
                            <label
                              htmlFor={`status-${status}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1 capitalize"
                            >
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Additional Filters Button */}
                <div className="lg:col-span-1">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className={`w-full h-12 px-4 md:px-6 transition-colors whitespace-nowrap rounded-lg ${showFilters || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== "" && f !== "newest")
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50 hover:border-blue-300"
                      }`}
                  >
                    <span className="hidden sm:inline">Filters</span>
                    <span className="sm:hidden">Filter</span>
                    {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== "" && f !== "newest") && (
                      <Badge className="ml-2 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs">Active</Badge>
                    )}
                  </Button>
                </div>

                {/* Search Button */}
                <div className="lg:col-span-1">
                  <Button
                    onClick={() => {
                      // Trigger filter refresh
                      setFilters(prev => ({ ...prev }));
                    }}
                    className="w-full h-12 px-4 md:px-6 bg-teal-600 hover:bg-teal-700 text-white whitespace-nowrap rounded-lg"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Search Properties</span>
                    <span className="sm:hidden">Search</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <span>Verified Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Filters Section */}
      {showFilters && (
        <section className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-6">
            {/* Text Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Property Details
              </label>
              <Input
                placeholder="Search by status, property name, property location, property features, or development..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="h-10 text-black"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Property Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypes.map(type => {
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          const newTypes = filters.propertyType.includes(type.id)
                            ? filters.propertyType.filter(t => t !== type.id)
                            : [...filters.propertyType, type.id];
                          setFilters(prev => ({ ...prev, propertyType: newTypes }));
                        }}
                        className={`p-2 rounded-lg text-sm transition-colors flex items-center ${filters.propertyType.includes(type.id)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                      }))}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value) || 100000000]
                      }))}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-1">
                    {["Under 10M", "10-25M", "25-50M", "50M+"].map(range => (
                      <button
                        key={range}
                        onClick={() => handlePriceRangeQuickSelect(range)}
                        className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="most-viewed">Most Viewed</option>
                  <option value="featured">Featured First</option>
                </select>
              </div>
            </div>

            {/* Additional Filters Row: Buy/Sell, Development */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Buy/Sell Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buy / Sell / Rent
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "buy", label: "Buy" },
                    { id: "sell", label: "Sell" },
                    { id: "rent", label: "Rent" }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          buySell: prev.buySell === option.id ? "" : option.id as "buy" | "sell" | "rent"
                        }));
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${filters.buySell === option.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Development Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Development
                </label>
                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white px-3 py-2 hover:border-gray-400 transition-colors">
                    <Building2 className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0" />
                    <select
                      value={filters.development[0] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilters(prev => ({
                          ...prev,
                          development: value ? [value] : []
                        }));
                      }}
                      className="flex-1 bg-transparent text-gray-900 text-sm font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Development</option>
                      {developments.map(development => (
                        <option key={development} value={development}>
                          {development}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: "",
                  country: [],
                  region: [],
                  city: [],
                  propertyType: [],
                  status: [],
                  priceRange: [0, 100000000],
                  bedrooms: [],
                  bathrooms: [],
                  amenities: [],
                  sortBy: "newest",
                  buySell: "",
                  neighbourhood: [],
                  development: []
                })}
              >
                Clear All Filters
              </Button>
              <span className="text-sm text-gray-600">
                Showing {filteredProperties.length} of {totalCount || filteredProperties.length} properties
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* View Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                Map
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewSavedProperties}
            >
              Saved ({savedProperties.length})
            </Button>
            <Button
              size="sm"
              onClick={handleScheduleViewing}
            >
              Schedule Viewing
            </Button>
          </div>
        </div>

        {/* Properties Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-lg">
                <div className="h-32 sm:h-36 bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {filteredProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4 max-w-5xl mx-auto">
              {filteredProperties.map((property) => {
                const isSaved = savedProperties.includes(property.id);

                return (
                  <Card
                    key={property.id}
                    className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => { window.location.href = getPropertyUrl(property); }}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-64 h-40 md:h-44 flex-shrink-0 bg-gray-200">
                        <img
                          src={getPropertyImageUrl(property, 0, 'medium', true)}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 768px) 100vw, 300px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/property-placeholder.svg' && !target.src.includes('placeholder')) {
                              target.src = '/property-placeholder.svg';
                            }
                          }}
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaved(property.id);
                          }}
                          className="absolute top-3 right-3 px-3 py-1 text-xs rounded-full bg-white/90 hover:bg-white text-gray-800"
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </button>

                        {property.featured && (
                          <span className="absolute top-3 left-3 px-2 py-1 text-xs rounded-full bg-yellow-500 text-white">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="flex-1 p-4 flex flex-col gap-2">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {property.title}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize">
                              {property.property_type?.replace('_', ' ') || property.type}
                              {property.status === 'development' && property.development_type
                                ? ` • ${property.development_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`
                                : ''}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{property.location}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">
                              {formatPropertyPrice(property)}
                            </p>
                            {property.type === 'rent' && property.rental_price_per_night && (
                              <p className="text-xs text-gray-500">
                                From {property.rental_price_per_night} / night
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-1">
                          {getDisplayBedrooms(property) !== "—" && <span>{getDisplayBedrooms(property)} beds</span>}
                          {getDisplayBathrooms(property) !== "—" && <span>{getDisplayBathrooms(property)} baths</span>}
                          <span>{getDisplayArea(property)}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = getPropertyUrl(property);
                            }}
                            className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700"
                          >
                            View Details
                          </Button>
                          <span className="text-xs text-gray-500">
                            ID: {property.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 max-w-7xl mx-auto">
              <div className="h-[420px] bg-gray-200 rounded-lg overflow-hidden">
                {activeMapProperty ? (
                  <iframe
                    title={`Map view for ${activeMapProperty.title}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      activeMapProperty.address ||
                      activeMapProperty.location ||
                      activeMapProperty.city ||
                      'Nairobi, Kenya'
                    )}&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                    Select a property on the right to view it on the map.
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredProperties.map((property) => {
                  const isActive = activeMapProperty && activeMapProperty.id === property.id;

                  return (
                    <button
                      key={property.id}
                      onClick={() => setSelectedMapPropertyId(property.id)}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-sm bg-white hover:bg-blue-50 transition-colors ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {property.title}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="line-clamp-1">
                              {property.location || property.city}
                            </span>
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-blue-600 whitespace-nowrap ml-2">
                          {formatPropertyPrice(property)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button
              onClick={() => setFilters({
                search: "",
                country: [],
                region: [],
                city: [],
                propertyType: [],
                status: [],
                priceRange: [0, 100000000],
                bedrooms: [],
                bathrooms: [],
                amenities: [],
                sortBy: "newest",
                buySell: "",
                neighbourhood: [],
                development: []
              })}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {filteredProperties.length > 0 && (
          <div className="text-center mt-12">
            <div ref={loadMoreRef} className="h-1" />
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={!nextPageUrl || isLoadingMore}
            >
              {isLoadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : nextPageUrl ? (
                "Load More Properties"
              ) : (
                "All Properties Loaded"
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Sticky Quick Actions (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleMobileSearch}
          >
            Search
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleMobileSaved}
          >
            Saved
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleMobileCall}
          >
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleMobileChat}
          >
            Chat
          </Button>
        </div>
      </div>

      {/* Schedule Viewing Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Schedule Property Viewing</h2>
                <button
                  onClick={closeScheduleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={scheduleForm.email}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={scheduleForm.phone}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254 700 000 000"
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date *
                    </label>
                    <Input
                      type="date"
                      value={scheduleForm.preferredDate}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                      required
                      className="w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time *
                    </label>
                    <select
                      value={scheduleForm.preferredTime}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Message
                  </label>
                  <textarea
                    value={scheduleForm.message}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Any specific requirements or questions..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeScheduleModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Schedule Viewing
                  </Button>
                </div>
              </form>

              {/* Contact Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Need immediate assistance?</h3>
                <div className="text-sm text-gray-600">
                  <p>Call us: <a href="tel:+254717334422" className="text-blue-600 hover:underline">+254-717-334-422</a></p>
                  <p>Email: <a href="mailto:info@miizarealtors.com" className="text-blue-600 hover:underline">info@miizarealtors.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Close button */}
            <button
              onClick={closePhotoGallery}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              ✕
            </button>

            {/* Navigation arrows */}
            {properties.find(p => p.id === showPhotoGallery)?.images && properties.find(p => p.id === showPhotoGallery)!.images!.length > 1 && (
              <>
                <button
                  onClick={prevGalleryImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={nextGalleryImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Next
                </button>
              </>
            )}

            {/* Main image */}
            <div className="relative">
              <img
                src={getPropertyImageUrl(properties.find(p => p.id === showPhotoGallery)!, galleryImageIndex, 'gallery', true)}
                alt={`Property ${showPhotoGallery} - Image ${galleryImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                loading="eager"
                decoding="async"
                sizes="(max-width: 1200px) 90vw, 1200px"
                {...{ fetchpriority: "high" as const }}
              />

              {/* Image counter */}
              {properties.find(p => p.id === showPhotoGallery)?.images && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {galleryImageIndex + 1} / {properties.find(p => p.id === showPhotoGallery)!.images!.length}
                </div>
              )}
            </div>

            {/* Thumbnail navigation */}
            {properties.find(p => p.id === showPhotoGallery)?.images && properties.find(p => p.id === showPhotoGallery)!.images!.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
                {properties.find(p => p.id === showPhotoGallery)!.images!.map((imageObj, index) => (
                  <button
                    key={index}
                    onClick={() => setGalleryImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === galleryImageIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-80"
                      }`}
                  >
                    <img
                      src={imageObj.image || getPropertyImageUrl(properties.find(p => p.id === showPhotoGallery)!, index)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index < 4 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property info */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">
                {properties.find(p => p.id === showPhotoGallery)?.title}
              </h3>
              <p className="text-gray-300">
                {properties.find(p => p.id === showPhotoGallery)?.location}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertiesPage;
