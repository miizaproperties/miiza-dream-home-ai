import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getPropertyUrl, type Property } from "@/services/api";
import { MapPin, Bed, Bath, Maximize, Star } from "lucide-react";

interface PropertyCardProps {
  id?: number;
  image: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number | string;
  bathrooms: number | string; // single number or comma-separated e.g. "2,4,7"
  area: string;
  type: "sale" | "rent";
  propertyType?: string;
  guests?: number;
  slug?: string;
}

const PropertyCard = ({
  id = 1,
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  type,
  propertyType,
  guests,
  slug,
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const property: Property = {
    id,
    title,
    slug,
    property_type: propertyType || '',
    status: '',
    city: 'Nairobi',
    location,
    bedrooms: bedrooms ?? '',
    bathrooms: bathrooms ?? '',
    area,
    price,
    display_price: price,
    is_for_sale: type === 'sale',
    is_for_rent: type === 'rent',
    type,
    image,
    guests,
    featured: false,
  };

  const handleCardClick = () => {
    navigate(getPropertyUrl(property));
  };

  const propertyDetailUrl = getPropertyUrl(property);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card 
        className="group overflow-hidden shadow-lg hover:shadow-xl rounded-lg h-full flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden h-48 bg-gray-200">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden />
          )}
          
          <img
            src={image || '/placeholder.svg'}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-105`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageLoaded(true);
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder.svg' && !target.src.includes('placeholder')) {
                target.src = '/placeholder.svg';
              }
            }}
          />
          
          {/* Property type badge */}
          {propertyType && (
            <Badge className="absolute top-3 left-3 bg-gray-700 text-white text-xs px-2 py-1 rounded">
              {propertyType}
            </Badge>
          )}
          
          {/* For sale/rent badge */}
          <Badge className={`absolute top-3 right-3 text-xs px-2 py-1 rounded ${
            type === 'rent' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            For {type === 'rent' ? 'Rent' : 'Sale'}
          </Badge>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title.toUpperCase()}
          </h3>
          
          {/* Location */}
          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm">{location}</span>
          </div>
          
          {/* Property Features */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-4">
            {bedrooms != null && String(bedrooms).trim() !== "" && (
              <div className="flex items-center gap-1">
                <Bed className="h-3 w-3" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms != null && String(bathrooms).trim() !== "" && (
              <div className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                <span>{bathrooms}</span>
              </div>
            )}
            {area && area !== "—" && (
              <div className="flex items-center gap-1">
                <Maximize className="h-3 w-3" />
                <span>{area}</span>
              </div>
            )}
            {guests && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{guests} guests</span>
              </div>
            )}
          </div>
          
          {/* Price and Button */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <div className="text-xl font-bold text-gray-900">
                {price}
              </div>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = propertyDetailUrl;
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PropertyCard;
