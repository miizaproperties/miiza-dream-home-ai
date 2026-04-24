import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  ChevronDown,
  Building2,
  Search,
  Filter
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
import OptimizedPropertyGrid from "@/components/ui/optimized-property-grid";
import { useInfiniteProperties } from "@/hooks/use-infinite-properties";
import { propertiesApi, type Property } from "@/services/api";
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

const OptimizedPropertiesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    country: [] as string[],
    region: [] as string[],
    city: [] as string[],
    propertyType: [] as string[],
    status: [] as string[],
    priceRange: [0, 100000000] as [number, number],
    bedrooms: [] as number[],
    bathrooms: [] as number[],
    amenities: [] as string[],
    sortBy: "newest",
    buySell: "" as "" | "buy" | "sell" | "rent",
    neighbourhood: [] as string[],
    development: [] as string[]
  });

  const [showFilters, setShowFilters] = useState(false);
  const [savedProperties, setSavedProperties] = useState<number[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [suburbs, setSuburbs] = useState<string[]>([]);

  // Create API params from filters
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (filters.search) params.search = filters.search;
    if (filters.country.length === 1) params.country = filters.country[0];
    if (filters.propertyType.length === 1) {
      const propertyTypeMap: Record<string, string> = {
        apartment: "apartment",
        house: "house",
        commercial: "commercial",
        office: "office",
        airbnb: "airbnb",
        traditional_home: "traditional_home",
      };
      params.property_type = propertyTypeMap[filters.propertyType[0]] || filters.propertyType[0];
    }
    if (filters.status.length === 1) params.status = filters.status[0];
    if (filters.buySell === "buy" || filters.buySell === "sell") params.is_for_sale = true;
    if (filters.buySell === "rent") params.is_for_rent = true;
    if (filters.priceRange[0] > 0) params.min_price = filters.priceRange[0];
    if (filters.priceRange[1] < 100000000) params.max_price = filters.priceRange[1];
    if (filters.bedrooms.length > 0) params.bedrooms = filters.bedrooms[0];
    if (filters.bathrooms.length > 0) params.min_bathrooms = filters.bathrooms[0];
    
    const orderingMap: Record<string, string> = {
      "price-low": "price",
      "price-high": "-price",
      newest: "-created_at",
      featured: "-featured",
    };
    params.ordering = orderingMap[filters.sortBy] || "-created_at";
    
    return params;
  }, [filters]);

  // Use infinite query hook
  const {
    properties,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    loadMore,
    refetch,
    totalCount,
  } = useInfiniteProperties({
    filters: apiParams,
    limit: 24, // Load more properties per page for better UX
  });

  // Initialize Buy / Rent / Sell filter from URL
  useEffect(() => {
    const type = searchParams.get("type");
    const pathType = location.pathname.split("/").pop();

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
      setFilters(prev => ({
        ...prev,
        buySell: "",
      }));
    }
  }, [searchParams, location.pathname]);

  // Fetch dynamic cities and suburbs
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const [citiesData, suburbsData] = await Promise.all([
          propertiesApi.getCities(),
          propertiesApi.getSuburbs()
        ]);
        setCities(citiesData);
        setSuburbs(suburbsData);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocationData();
  }, []);

  // Preconnect to media origin
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

  // Handle property save/unsave
  const handleSaveProperty = useCallback((propertyId: number) => {
    setSavedProperties(prev => {
      const isCurrentlySaved = prev.includes(propertyId);
      if (isCurrentlySaved) {
        toast.success("Removed from saved properties");
        return prev.filter(id => id !== propertyId);
      } else {
        toast.success("Added to saved properties");
        return [...prev, propertyId];
      }
    });
  }, []);

  // Handle property click
  const handlePropertyClick = useCallback((property: Property) => {
    const propertyDetailUrl = `/property/${property.slug || property.id}`;
    navigate(propertyDetailUrl);
  }, [navigate]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
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
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(f => 
      Array.isArray(f) ? f.length > 0 : f !== "" && f !== "newest" && 
      !(Array.isArray(f) && f.length === 2 && f[0] === 0 && f[1] === 100000000)
    );
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {searchParams.get("featured") === "true" 
                ? "Featured Properties" 
                : "Find Your Perfect Property"
              }
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-6">
              {searchParams.get("featured") === "true"
                ? "Discover our handpicked selection of premium featured properties"
                : "Discover premium properties with advanced search and performance-optimized browsing"
              }
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-blue-100">
              <span>✓ {totalCount.toLocaleString()} Properties</span>
              <span>✓ Optimized Performance</span>
              <span>✓ Real-time Updates</span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search properties by location, type, or features..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="h-12 text-gray-900"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className={cn(
                    "h-12 px-6",
                    hasActiveFilters ? "bg-blue-600 text-white border-blue-600" : ""
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-2 bg-white text-blue-600">
                      Active
                    </Badge>
                  )}
                </Button>
                <Button
                  onClick={() => refetch()}
                  className="h-12 px-6 bg-teal-600 hover:bg-teal-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <section className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <Select
                  value={filters.propertyType[0] || ""}
                  onValueChange={(value) => {
                    setFilters(prev => ({
                      ...prev,
                      propertyType: value ? [value] : []
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Type</SelectItem>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Select
                  value={filters.city[0] || ""}
                  onValueChange={(value) => {
                    setFilters(prev => ({
                      ...prev,
                      city: value ? [value] : []
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any City" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="">Any City</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => {
                    setFilters(prev => ({ ...prev, sortBy: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="featured">Featured First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0] || ""}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                    }))}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1] !== 100000000 ? filters.priceRange[1] : ""}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value) || 100000000]
                    }))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
              >
                Clear All Filters
              </Button>
              <span className="text-sm text-gray-600">
                {isLoading ? "Loading..." : `Showing ${properties.length} of ${totalCount.toLocaleString()} properties`}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-6">
              {error.message || "Failed to load properties. Please try again."}
            </p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Performance Stats */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>🚀 Performance Optimized</span>
                <span>📱 Responsive Design</span>
                <span>♾️ Infinite Scroll</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '#saved'}
                >
                  Saved ({savedProperties.length})
                </Button>
              </div>
            </div>

            {/* Properties Grid */}
            {isLoading && properties.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-600">Loading properties...</span>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <OptimizedPropertyGrid
                  properties={properties}
                  className="mb-8"
                  gridHeight={800}
                  onPropertyClick={handlePropertyClick}
                  onSaveProperty={handleSaveProperty}
                  savedProperties={savedProperties}
                  loadingMore={isLoadingMore}
                  onLoadMore={hasNextPage ? loadMore : undefined}
                />

                {/* Load More Section */}
                {hasNextPage && (
                  <div className="text-center py-8">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      size="lg"
                      variant="outline"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading More Properties...
                        </>
                      ) : (
                        `Load More Properties (${totalCount - properties.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}

                {!hasNextPage && properties.length > 20 && (
                  <div className="text-center py-8 text-gray-600">
                    <p>🎉 You've seen all {totalCount.toLocaleString()} properties!</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OptimizedPropertiesPage;