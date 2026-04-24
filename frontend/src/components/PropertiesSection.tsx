import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import PropertyCard from "./PropertyCard";
import { motion } from "framer-motion";
import { propertiesApi, getPropertyImageUrl, formatPropertyPrice, getDisplayArea, getDisplayBedrooms, getDisplayBathrooms, getPropertyUrl, type Property } from "@/services/api";
import { Loader2, ArrowRight, Filter, MapPin, Star, TrendingUp, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const PropertiesSection = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('featured');

  // Fetch featured properties
  const { data: featuredProperties = [], isLoading: featuredLoading, error: featuredError } = useQuery({
    queryKey: ['featured', 'properties'],
    queryFn: () => propertiesApi.getFeatured(12),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Fetch recent properties
  const { data: recentProperties = [], isLoading: recentLoading } = useQuery({
    queryKey: ['recent', 'properties'],
    queryFn: () => propertiesApi.getAll({ limit: 8, ordering: '-created_at' }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: viewMode === 'recent',
  });

  // Fetch rent properties
  const { data: rentProperties = [], isLoading: rentLoading } = useQuery({
    queryKey: ['rent', 'properties'],
    queryFn: () => propertiesApi.getAll({ is_for_rent: true, limit: 8 }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: viewMode === 'rent',
  });

  // Fetch sale properties
  const { data: saleProperties = [], isLoading: saleLoading } = useQuery({
    queryKey: ['sale', 'properties'],
    queryFn: () => propertiesApi.getAll({ is_for_sale: true, limit: 8 }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: viewMode === 'sale',
  });

  const getCurrentProperties = () => {
    switch (viewMode) {
      case 'recent': return recentProperties;
      case 'rent': return rentProperties;
      case 'sale': return saleProperties;
      default: return featuredProperties;
    }
  };

  const getCurrentLoading = () => {
    switch (viewMode) {
      case 'recent': return recentLoading;
      case 'rent': return rentLoading;
      case 'sale': return saleLoading;
      default: return featuredLoading;
    }
  };

  const properties = getCurrentProperties();
  const isLoading = getCurrentLoading();
  const error = featuredError;

  const categories = [
    { id: 'featured', label: 'Featured', icon: Star, count: featuredProperties.length, description: 'Handpicked premium properties' },
    { id: 'recent', label: 'Latest', icon: TrendingUp, count: recentProperties.length, description: 'Newly added properties' },
    { id: 'rent', label: 'For Rent', icon: MapPin, count: rentProperties.length, description: 'Rental properties available' },
    { id: 'sale', label: 'For Sale', icon: Eye, count: saleProperties.length, description: 'Properties for purchase' },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="properties" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4" />
            Premium Property Collection
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600"> Dream Home</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Browse through our carefully curated collection of premium properties across Kenya. 
            From luxury villas to modern apartments, find your perfect space.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">{featuredProperties.length + recentProperties.length} Total Properties</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Verified Listings</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </motion.div>

        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = viewMode === category.id;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setViewMode(category.id)}
                  className={`group relative overflow-hidden px-6 py-4 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-lg border-2 border-blue-200 text-blue-600' 
                      : 'bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-md text-gray-600 hover:text-blue-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                    }`} />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{category.label}</span>
                        {category.count > 0 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {category.count}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{category.description}</span>
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading amazing properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium mb-2">Unable to load properties</p>
              <p className="text-red-600 text-sm mb-4">Please check your connection and try again</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 max-w-lg mx-auto">
              <div className="text-gray-400 mb-6">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No {viewMode} properties available
              </h3>
              <p className="text-gray-600 mb-6">Check back soon for new listings, or browse all our properties</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate("/properties")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Browse All Properties
                </Button>
                <Button
                  onClick={() => setViewMode('featured')}
                  variant="outline"
                >
                  View Featured
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Properties Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 max-w-full mx-auto mb-12 px-2 sm:px-0"
            >
              {properties.slice(0, 12).map((property, index) => (
                <motion.div
                  key={`${property.id}-${viewMode}`}
                  variants={cardVariants}
                  className="h-full"
                >
                  <PropertyCard
                    id={property.id}
                    image={getPropertyImageUrl(property)}
                    title={property.title}
                    location={property.location}
                    price={formatPropertyPrice(property)}
                    bedrooms={getDisplayBedrooms(property)}
                    bathrooms={property.bathrooms}
                    area={getDisplayArea(property)}
                    type={property.type}
                    propertyType={property.property_type}
                    guests={property.guests || property.max_guests}
                    slug={property.slug}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => navigate(`/properties${viewMode === 'featured' ? '?featured=true' : ''}`)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="mr-2">Explore All {categories.find(c => c.id === viewMode)?.label} Properties</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => navigate("/properties")}
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-300 px-8 py-3 rounded-xl transition-all duration-300"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Browse with Filters
                </Button>
              </div>
              
              {properties.length > 12 && (
                <p className="text-sm text-gray-500 mt-4">
                  Showing 12 of {properties.length} {categories.find(c => c.id === viewMode)?.label.toLowerCase()} properties
                </p>
              )}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default PropertiesSection;
