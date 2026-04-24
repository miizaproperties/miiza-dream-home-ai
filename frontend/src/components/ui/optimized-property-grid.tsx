import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Grid } from 'react-window';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPropertyImageUrl, formatPropertyPrice, getDisplayArea, getDisplayBedrooms, getDisplayBathrooms, getPropertyUrl, type Property } from '@/services/api';

interface OptimizedPropertyGridProps {
  properties: Property[];
  className?: string;
  gridHeight?: number;
  onPropertyClick?: (property: Property) => void;
  onSaveProperty?: (propertyId: number) => void;
  savedProperties?: number[];
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

// Constants for responsive grid
const GRID_CONFIG = {
  MOBILE_COLS: 1,
  TABLET_COLS: 2,
  DESKTOP_COLS: 3,
  LARGE_COLS: 4,
  CARD_HEIGHT: 320,
  GAP: 24,
  MOBILE_BREAKPOINT: 640,
  TABLET_BREAKPOINT: 768,
  DESKTOP_BREAKPOINT: 1024,
};

// Memoized property card component
const PropertyCard = React.memo(({ 
  property, 
  index, 
  onPropertyClick, 
  onSaveProperty, 
  isSaved,
  style 
}: {
  property: Property;
  index: number;
  onPropertyClick?: (property: Property) => void;
  onSaveProperty?: (propertyId: number) => void;
  isSaved: boolean;
  style: React.CSSProperties;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isAboveFold = index < 8;

  const handleClick = useCallback(() => {
    if (onPropertyClick) {
      onPropertyClick(property);
    } else {
      window.location.href = getPropertyUrl(property);
    }
  }, [property, onPropertyClick]);

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveProperty?.(property.id);
  }, [property.id, onSaveProperty]);

  const imageUrl = useMemo(() => getPropertyImageUrl(property), [property]);

  return (
    <div style={style} className="p-3">
      <Card 
        className="group overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 rounded-lg h-full"
        onClick={handleClick}
      >
        <div className="relative overflow-hidden h-48 bg-gray-200">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-[0]" aria-hidden />
          )}
          
          <img
            src={imageUrl}
            alt={property.title}
            className={cn(
              "relative z-[1] w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading={isAboveFold ? "eager" : "lazy"}
            decoding="async"
            {...(isAboveFold ? { fetchpriority: "high" as const } : {})}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.featured && (
              <Badge className="bg-yellow-500 text-white text-xs">
                Featured
              </Badge>
            )}
            {property.created_at && new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <Badge className="bg-green-500 text-white text-xs">New</Badge>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveClick}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors text-xs"
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
                handleClick();
              }}
            >
              Quick View
            </Button>
          </div>
        </div>

        <div className="p-4 flex flex-col h-[calc(100%-12rem)]">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <p className="text-xs text-gray-500 capitalize">
                {property.property_type?.replace('_', ' ') || property.type}
              </p>
              {property.status === 'development' && property.development_type && (
                <Badge variant="outline" className="text-xs">
                  {property.development_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-3 line-clamp-1">
              {property.location}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            {getDisplayBedrooms(property) !== "—" && (
              <span>{getDisplayBedrooms(property)} beds</span>
            )}
            {getDisplayBathrooms(property) !== "—" && (
              <span>{getDisplayBathrooms(property)} baths</span>
            )}
            <span>{getDisplayArea(property)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm font-bold text-blue-600">
              {formatPropertyPrice(property)}
            </span>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700"
            >
              View
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export const OptimizedPropertyGrid: React.FC<OptimizedPropertyGridProps> = ({
  properties,
  className,
  gridHeight = 600,
  onPropertyClick,
  onSaveProperty,
  savedProperties = [],
  loadingMore,
  onLoadMore
}) => {
  const gridRef = useRef<Grid>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate responsive columns
  const columnCount = useMemo(() => {
    if (containerWidth < GRID_CONFIG.MOBILE_BREAKPOINT) return GRID_CONFIG.MOBILE_COLS;
    if (containerWidth < GRID_CONFIG.TABLET_BREAKPOINT) return GRID_CONFIG.TABLET_COLS;
    if (containerWidth < GRID_CONFIG.DESKTOP_BREAKPOINT) return GRID_CONFIG.DESKTOP_COLS;
    return GRID_CONFIG.LARGE_COLS;
  }, [containerWidth]);

  // Calculate dimensions
  const columnWidth = useMemo(() => {
    const totalGaps = (columnCount - 1) * GRID_CONFIG.GAP;
    return Math.floor((containerWidth - totalGaps) / columnCount);
  }, [containerWidth, columnCount]);

  const rowCount = Math.ceil(properties.length / columnCount);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize(); // Initial measurement
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset grid when column count changes (FixedSizeGrid auto-handles this)

  const itemWidth = columnWidth + GRID_CONFIG.GAP;
  const itemHeight = GRID_CONFIG.CARD_HEIGHT + GRID_CONFIG.GAP;

  const Cell = useCallback(({
    columnIndex,
    rowIndex,
    style
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const itemIndex = rowIndex * columnCount + columnIndex;
    const property = properties[itemIndex];

    if (!property) {
      // Handle load more trigger
      if (itemIndex === properties.length && onLoadMore && !loadingMore) {
        return (
          <div style={style} className="p-3">
            <div className="h-full flex items-center justify-center">
              <Button
                onClick={onLoadMore}
                variant="outline"
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          </div>
        );
      }
      return null;
    }

    const isSaved = savedProperties.includes(property.id);
    
    return (
      <PropertyCard
        property={property}
        index={itemIndex}
        onPropertyClick={onPropertyClick}
        onSaveProperty={onSaveProperty}
        isSaved={isSaved}
        style={style}
      />
    );
  }, [properties, columnCount, onPropertyClick, onSaveProperty, savedProperties, onLoadMore, loadingMore]);

  if (!containerWidth) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-lg">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <Grid
        ref={gridRef}
        height={gridHeight}
        columnCount={columnCount}
        columnWidth={itemWidth}
        rowCount={Math.max(1, rowCount + (onLoadMore ? 1 : 0))}
        rowHeight={itemHeight}
        overscanRowCount={2}
        overscanColumnCount={1}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {Cell}
      </Grid>
    </div>
  );
};

export default OptimizedPropertyGrid;