# Properties Pages API Call & Data Mapping Documentation

## Overview
This document explains how `PropertiesPage.tsx` and `PropertyDetailsPage.tsx` handle backend API calls, data mapping, and the pages involved in the flow.

---

## 1. PropertiesPage.tsx

### API Calls Made

#### A. Fetch All Properties
**Location:** Lines 135-175  
**Method:** `propertiesApi.getAll()`

```typescript
// Line 139
const fetchedProperties = await propertiesApi.getAll();
```

**Backend Endpoint:** `GET /api/properties/`  
**Service:** `frontend/src/services/api.ts` → `propertiesApi.getAll()`

**What it does:**
- Fetches all properties from the backend
- Returns an array of `Property` objects
- Handles both paginated and non-paginated responses automatically

**Data Flow:**
```
PropertiesPage → propertiesApi.getAll() → fetchAPI() → GET /api/properties/
```

#### B. Filtered Properties Fetch
**Location:** Lines 376-499  
**Method:** `propertiesApi.getAll(apiParams)`

**Backend Endpoint:** `GET /api/properties/?{filters}`

**Filter Mapping (Frontend → Backend):**
```typescript
// Lines 384-446
const apiParams: Record<string, any> = {};

// Search filter
if (filters.search) {
  apiParams.search = filters.search;  // → ?search=...
}

// Country filter
if (filters.country.length > 0) {
  apiParams.country = filters.country[0];  // → ?country=Kenya
}

// City filter
if (filters.city.length > 0) {
  apiParams.city = filters.city[0];  // → ?city=Nairobi
}

// Property type mapping
const propertyTypeMap: Record<string, string> = {
  'apartment': 'apartment',
  'house': 'house',
  'villa': 'villa',
  'commercial': 'commercial',
  'office': 'office',
  'land': 'land',
  'airbnb': 'airbnb',
};
apiParams.property_type = propertyTypeMap[filters.propertyType[0]];

// Buy/Sell filter
if (filters.buySell === "buy" || filters.buySell === "sell") {
  apiParams.is_for_sale = true;  // → ?is_for_sale=true
} else if (filters.buySell === "rent") {
  apiParams.is_for_rent = true;  // → ?is_for_rent=true
}

// Price range
if (filters.priceRange[0] > 0) {
  apiParams.min_price = filters.priceRange[0];  // → ?min_price=1000000
}
if (filters.priceRange[1] < 100000000) {
  apiParams.max_price = filters.priceRange[1];  // → ?max_price=50000000
}

// Bedrooms/Bathrooms
if (filters.bedrooms.length > 0) {
  apiParams.bedrooms = filters.bedrooms[0];  // → ?bedrooms=3
}
if (filters.bathrooms.length > 0) {
  apiParams.min_bathrooms = filters.bathrooms[0];  // → ?min_bathrooms=2
}

// Sorting
const orderingMap: Record<string, string> = {
  'price-low': 'price',           // → ?ordering=price
  'price-high': '-price',         // → ?ordering=-price
  'newest': '-created_at',        // → ?ordering=-created_at
  'featured': '-featured',         // → ?ordering=-featured
};
apiParams.ordering = orderingMap[filters.sortBy];
```

**Client-Side Filters (Not sent to API):**
- `region` - Filtered client-side (line 455-461)
- `neighbourhood` - Filtered client-side (line 464-475)
- `development` - Filtered client-side (line 478-487)

#### C. Submit Viewing Request
**Location:** Lines 258-284  
**Method:** `viewingRequestsApi.submit()`

```typescript
// Line 261
await viewingRequestsApi.submit({
  name: scheduleForm.name,
  email: scheduleForm.email,
  phone: scheduleForm.phone,
  preferred_date: scheduleForm.preferredDate,
  preferred_time: scheduleForm.preferredTime,
  message: scheduleForm.message,
});
```

**Backend Endpoint:** `POST /api/contacts/viewing-requests/`  
**Service:** `frontend/src/services/api.ts` → `viewingRequestsApi.submit()`

---

### Data Mapping & Transformation

#### Property Image URL Resolution
**Location:** Line 509  
**Method:** `getPropertyImageUrl(property, currentImage)`

```typescript
// Helper function from api.ts (lines 239-274)
export function getPropertyImageUrl(property: Property, index: number = 0): string {
  // Priority 1: property.image (from list serializer)
  // Priority 2: property.main_image
  // Priority 3: property.images[index].image
  
  // If Firebase URL (starts with http/https), return as-is
  // If relative path, construct full URL
  // Fallback: '/placeholder.svg'
}
```

**Usage in PropertiesPage:**
```typescript
// Line 509
<img src={getPropertyImageUrl(property, currentImage)} />
```

#### Price Formatting
**Location:** Line 615  
**Method:** `formatPropertyPrice(property)`

```typescript
// Helper function from api.ts (lines 279-306)
export function formatPropertyPrice(property: Property): string {
  // Uses property.display_price if available (pre-formatted by backend)
  // Otherwise formats based on type (rent/sale) and currency
}
```

**Usage:**
```typescript
// Line 615
<span>{formatPropertyPrice(property)}</span>
```

#### Property Type Display
**Location:** Line 592  
**Transformation:**
```typescript
// Line 592
{property.property_type?.replace('_', ' ') || property.type}
// Example: "apartment" → "apartment", "traditional_home" → "traditional home"
```

---

### Pages Involved

1. **PropertiesPage** (`/properties`)
   - Main listing page
   - Displays property cards in grid/list view
   - Handles filtering and search

2. **PropertyDetailsPage** (`/property/:id`)
   - Navigated to when clicking a property card (line 621)
   - Shows full property details

---

## 2. PropertyDetailsPage.tsx

### API Calls Made

#### A. Fetch Single Property
**Location:** Lines 217-230  
**Method:** Direct `fetch()` call (not using API service)

```typescript
// Lines 217-230
const { data: property, isLoading, error } = useQuery<BackendProperty>({
  queryKey: ['property', id],
  queryFn: async () => {
    const response = await fetch(`http://localhost:8000/api/properties/${id}/`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Property not found');
    }
    return response.json();
  },
  enabled: !!id,
});
```

**Backend Endpoint:** `GET /api/properties/{id}/`  
**Note:** This page uses direct `fetch()` instead of the centralized API service

#### B. Fetch Similar Properties
**Location:** Lines 233-244  
**Method:** Direct `fetch()` call

```typescript
// Lines 233-244
const { data: similarPropertiesData } = useQuery({
  queryKey: ['similar-properties', property?.property_type, property?.id],
  queryFn: async () => {
    const response = await fetch(
      `http://localhost:8000/api/properties/?property_type=${property?.property_type}&limit=4`,
      { credentials: 'include' }
    );
    const data = await response.json();
    return (data.results || data).filter((p: any) => p.id !== property?.id).slice(0, 3);
  },
  enabled: !!property,
});
```

**Backend Endpoint:** `GET /api/properties/?property_type={type}&limit=4`

#### C. Submit Viewing Request
**Location:** Lines 321-383  
**Method:** Direct `fetch()` call

```typescript
// Lines 326-345
const viewingResponse = await fetch('http://localhost:8000/api/contacts/viewing-requests/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    property: property.id,
    preferred_date: formData.viewingDate,
    preferred_time: '10:00',
    message: formData.message,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
  }),
});
```

**Backend Endpoint:** `POST /api/contacts/viewing-requests/`

#### D. Submit Contact Inquiry
**Location:** Lines 350-364  
**Method:** Direct `fetch()` call (fallback if no viewing date)

```typescript
// Lines 350-364
const contactResponse = await fetch('http://localhost:8000/api/contacts/contacts/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    subject: 'inquiry',
    message: formData.message,
    property: property.id,
  }),
});
```

**Backend Endpoint:** `POST /api/contacts/contacts/`

---

### Data Mapping & Transformation

#### Image URL Resolution
**Location:** Lines 54-66, 247-250  
**Method:** Local `getImageUrl()` function

```typescript
// Lines 54-66
const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  // If full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // If relative URL, prepend backend URL
  if (imageUrl.startsWith('/')) {
    return `http://localhost:8000${imageUrl}`;
  }
  // Otherwise, assume media path
  return `http://localhost:8000/media/${imageUrl}`;
};

// Lines 247-250 - Combine all images
const allImages = property ? [
  ...(property.main_image ? [getImageUrl(property.main_image)] : []),
  ...property.images.map(img => getImageUrl(img.image))
].filter(Boolean) : [];
```

**Note:** This is different from `getPropertyImageUrl()` used in PropertiesPage!

#### Price Formatting
**Location:** Lines 45-51, 515  
**Method:** Local `formatPrice()` function

```typescript
// Lines 45-51
const formatPrice = (price: number, currency: string, type: string) => {
  const currencySymbol = currency === 'KSH' ? 'KSh' : currency;
  if (type === "rent") {
    return `${currencySymbol} ${price.toLocaleString()}/month`;
  }
  return `${currencySymbol} ${price.toLocaleString()}`;
};

// Usage (line 515)
{formatPrice(parseFloat(property.price), property.currency, property.type)}
```

#### Property Type Display
**Location:** Line 526  
**Transformation:**
```typescript
// Line 526
{property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).replace('_', ' ')}
// Example: "apartment" → "Apartment", "traditional_home" → "Traditional home"
```

#### Similar Properties Mapping
**Location:** Lines 393-404  
**Transformation:**
```typescript
// Lines 393-404
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
```

---

### Pages Involved

1. **PropertyDetailsPage** (`/property/:id`)
   - Main detail page
   - Shows full property information, images, features, contact form

2. **PropertiesPage** (`/properties`)
   - Navigated back to via "Back to Properties" button (line 414)

3. **PropertyCard Component** (`/components/PropertyCard.tsx`)
   - Used to display similar properties (line 736)

---

## Key Differences Between Pages

### API Service Usage

| Feature | PropertiesPage | PropertyDetailsPage |
|---------|---------------|-------------------|
| **API Service** | ✅ Uses centralized `propertiesApi` from `api.ts` | ❌ Uses direct `fetch()` calls |
| **Consistency** | ✅ Consistent with other pages | ❌ Inconsistent (should use API service) |
| **Error Handling** | ✅ Centralized in `fetchAPI()` | ⚠️ Manual error handling |

### Image URL Handling

| Feature | PropertiesPage | PropertyDetailsPage |
|---------|---------------|-------------------|
| **Helper Function** | `getPropertyImageUrl()` from `api.ts` | Local `getImageUrl()` function |
| **URL Construction** | Handles Firebase URLs, relative paths | Hardcoded `localhost:8000` |
| **Flexibility** | ✅ More flexible | ⚠️ Less flexible |

### Data Fetching

| Feature | PropertiesPage | PropertyDetailsPage |
|---------|---------------|-------------------|
| **Library** | `useEffect` + `useState` | `useQuery` from `@tanstack/react-query` |
| **Caching** | ❌ No caching | ✅ Automatic caching with React Query |
| **Loading States** | Manual `loading` state | Automatic `isLoading` from React Query |

---

## Recommendations

1. **Standardize PropertyDetailsPage to use API service:**
   ```typescript
   // Instead of direct fetch, use:
   const { data: property } = useQuery({
     queryKey: ['property', id],
     queryFn: () => propertiesApi.getById(Number(id)),
   });
   ```

2. **Use consistent image URL helper:**
   - Both pages should use `getPropertyImageUrl()` from `api.ts`

3. **Use React Query in PropertiesPage:**
   - Consider migrating to React Query for better caching and state management

4. **Remove hardcoded URLs:**
   - Use `API_BASE_URL` from environment variables instead of hardcoded `localhost:8000`

---

## Backend API Endpoints Summary

| Endpoint | Method | Used By | Purpose |
|----------|--------|---------|---------|
| `/api/properties/` | GET | PropertiesPage | List all properties |
| `/api/properties/?{filters}` | GET | PropertiesPage | Filtered property list |
| `/api/properties/{id}/` | GET | PropertyDetailsPage | Single property details |
| `/api/properties/?property_type={type}` | GET | PropertyDetailsPage | Similar properties |
| `/api/contacts/viewing-requests/` | POST | Both pages | Submit viewing request |
| `/api/contacts/contacts/` | POST | PropertyDetailsPage | Submit contact inquiry |

---

## Data Flow Diagram

```
PropertiesPage
├── Initial Load
│   └── propertiesApi.getAll()
│       └── GET /api/properties/
│           └── Returns: Property[]
│
├── Filter Change
│   └── propertiesApi.getAll(apiParams)
│       └── GET /api/properties/?{filters}
│           └── Returns: Property[]
│           └── Client-side filtering (region, neighbourhood, development)
│
└── Schedule Viewing
    └── viewingRequestsApi.submit()
        └── POST /api/contacts/viewing-requests/
            └── Creates: ViewingRequest + Contact

PropertyDetailsPage
├── Load Property
│   └── fetch(`/api/properties/${id}/`)
│       └── Returns: BackendProperty
│
├── Load Similar Properties
│   └── fetch(`/api/properties/?property_type=${type}`)
│       └── Returns: Property[]
│
└── Submit Inquiry
    ├── If viewingDate provided:
    │   └── POST /api/contacts/viewing-requests/
    └── Otherwise:
        └── POST /api/contacts/contacts/
```

---

## Backend Property Model Mapping

### Backend Response Structure
```typescript
{
  id: number;
  title: string;
  description: string;
  property_type: string;  // "apartment", "house", "villa", etc.
  status: string;         // "available", "sold", "rented"
  address: string;
  city: string;
  state: string;
  country: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  area: string;
  max_guests: number;
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
}
```

### Frontend Property Interface
```typescript
// From api.ts
interface Property {
  id: number;
  title: string;
  property_type: string;
  status: string;
  city: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  price: number | string;
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
  amenities?: string[];
  currency?: string;
  created_at?: string;
  updated_at?: string;
}
```

---

## Summary

- **PropertiesPage** uses centralized API service (`propertiesApi`) with `useEffect` for data fetching
- **PropertyDetailsPage** uses direct `fetch()` calls with React Query (`useQuery`)
- Both pages handle image URLs differently (should be standardized)
- PropertiesPage has sophisticated filter mapping to backend query parameters
- PropertyDetailsPage has additional data transformations for similar properties
- Both pages submit viewing requests, but PropertyDetailsPage also has a contact inquiry fallback

---

## 3. Featured Properties on Main Page (Index.tsx)

### Overview
The main homepage (`Index.tsx`) displays featured properties through the `PropertiesSection` component. This section fetches and displays up to 8 featured properties in a grid layout.

### Component Structure

**Main Page:** `frontend/src/pages/Index.tsx`  
**Properties Section Component:** `frontend/src/components/PropertiesSection.tsx`  
**Property Card Component:** `frontend/src/components/PropertyCard.tsx`

### API Calls Made

#### A. Fetch Featured Properties
**Location:** `PropertiesSection.tsx` Lines 15-31  
**Method:** `propertiesApi.getFeatured(8)`

```typescript
// Line 20
const featuredProperties = await propertiesApi.getFeatured(8);
```

**Backend Endpoint:** `GET /api/properties/?featured=true&limit=8`  
**Service:** `frontend/src/services/api.ts` → `propertiesApi.getFeatured()`

**Service Implementation:**
```typescript
// api.ts lines 164-170
getFeatured: async (limit?: number): Promise<Property[]> => {
  const params: Record<string, any> = { featured: true };
  if (limit) {
    params.limit = limit;
  }
  return propertiesApi.getAll(params);
}
```

**What it does:**
- Calls `propertiesApi.getAll()` with `featured: true` and optional `limit` parameter
- Backend filters properties where `featured = True`
- Returns up to 8 featured properties (or all if less than 8 exist)
- Properties are ordered by `-featured` (featured first), then `-created_at` (newest first)

**Backend Processing:**
```python
# backend/properties/views.py lines 51-58
featured = self.request.query_params.get('featured', None)
if featured is not None:
    queryset = queryset.filter(featured=featured.lower() == 'true')
    # When filtering by featured, order by featured first, then by created_at
    queryset = queryset.order_by('-featured', '-created_at')
else:
    # Default ordering: featured first, then by created_at
    queryset = queryset.order_by('-featured', '-created_at')

# Handle limit parameter (lines 118-124)
limit = request.query_params.get('limit', None)
if limit:
    try:
        limit = int(limit)
        queryset = queryset[:limit]
    except ValueError:
        pass
```

**Data Flow:**
```
Index.tsx
  └── PropertiesSection.tsx
      └── propertiesApi.getFeatured(8)
          └── propertiesApi.getAll({ featured: true, limit: 8 })
              └── fetchAPI('/properties/?featured=true&limit=8')
                  └── GET /api/properties/?featured=true&limit=8
                      └── Backend filters: featured=True, orders by -featured, -created_at, limits to 8
                          └── Returns: Property[] (max 8 items)
```

---

### Data Mapping & Transformation

#### Property Image URL Resolution
**Location:** `PropertiesSection.tsx` Line 106  
**Method:** `getPropertyImageUrl(property)`

```typescript
// Line 106
<PropertyCard
  image={getPropertyImageUrl(property)}
  // ... other props
/>
```

**Helper Function:** `frontend/src/services/api.ts` → `getPropertyImageUrl()` (lines 239-274)

**Priority Order:**
1. `property.image` (from PropertyListSerializer)
2. `property.main_image`
3. `property.images[0].image` (first image from array)

**URL Handling:**
- If URL starts with `http://` or `https://` → Return as-is (Firebase Storage URLs)
- If URL starts with `/` → Prepend backend base URL
- Otherwise → Return as-is (assumes full URL)
- Fallback: `/placeholder.svg`

#### Price Formatting
**Location:** `PropertiesSection.tsx` Line 109  
**Method:** `formatPropertyPrice(property)`

```typescript
// Line 109
<PropertyCard
  price={formatPropertyPrice(property)}
  // ... other props
/>
```

**Helper Function:** `frontend/src/services/api.ts` → `formatPropertyPrice()` (lines 279-306)

**Formatting Logic:**
1. If `property.display_price` exists → Use it (pre-formatted by backend)
2. If `property.type === 'rent'` and `property.rental_price_per_night` exists:
   - Format: `{currency} {price}/night`
3. If `property.type === 'rent'`:
   - Format: `{currency} {price}/month`
4. Otherwise (sale):
   - Format: `{currency} {price}`
5. Fallback: `'Price on request'`

#### Property Type Display
**Location:** `PropertyCard.tsx` Line 74-76  
**Transformation:**
```typescript
// PropertyCard.tsx lines 73-76
{propertyType && (
  <p className="text-xs text-gray-500 mb-1 capitalize">
    {propertyType.replace('_', ' ')}
  </p>
)}
```

**Example Transformations:**
- `"apartment"` → `"apartment"`
- `"traditional_home"` → `"traditional home"`
- `"office"` → `"office"`

#### Property Data Mapping to PropertyCard
**Location:** `PropertiesSection.tsx` Lines 102-116

```typescript
// Lines 102-116
{properties.map((property) => (
  <PropertyCard
    key={property.id}
    id={property.id}
    image={getPropertyImageUrl(property)}
    title={property.title}
    location={property.location}
    price={formatPropertyPrice(property)}
    bedrooms={property.bedrooms}
    bathrooms={property.bathrooms}
    area={property.area}
    type={property.type}
    propertyType={property.property_type}
    guests={property.guests || property.max_guests}
  />
))}
```

**Mapping Table:**

| PropertyCard Prop | Source Property Field | Transformation |
|-------------------|----------------------|----------------|
| `id` | `property.id` | Direct mapping |
| `image` | `property.image` / `main_image` / `images[0]` | `getPropertyImageUrl()` |
| `title` | `property.title` | Direct mapping |
| `location` | `property.location` | Direct mapping |
| `price` | `property.price` / `display_price` | `formatPropertyPrice()` |
| `bedrooms` | `property.bedrooms` | Direct mapping |
| `bathrooms` | `property.bathrooms` | Direct mapping |
| `area` | `property.area` | Direct mapping |
| `type` | `property.type` | Direct mapping (`'sale'` or `'rent'`) |
| `propertyType` | `property.property_type` | Direct mapping (e.g., `'apartment'`, `'house'`) |
| `guests` | `property.guests` or `property.max_guests` | Fallback to `max_guests` if `guests` not available |

---

### Pages & Components Involved

1. **Index Page** (`/`)
   - Main homepage
   - Renders `PropertiesSection` component (line 16)

2. **PropertiesSection Component** (`/components/PropertiesSection.tsx`)
   - Fetches featured properties on mount
   - Displays properties in responsive grid (1-4 columns based on screen size)
   - Handles loading, error, and empty states
   - Provides "View All Properties" button that navigates to `/properties`

3. **PropertyCard Component** (`/components/PropertyCard.tsx`)
   - Displays individual property card
   - Shows image, title, location, price, bedrooms, bathrooms, area
   - "Book Now" button navigates to `/property/:id`
   - Uses Framer Motion for animations

4. **PropertiesPage** (`/properties`)
   - Navigated to when clicking "View All Properties" button
   - Shows full property listing with filters

5. **PropertyDetailsPage** (`/property/:id`)
   - Navigated to when clicking "Book Now" on a property card
   - Shows full property details

---

### State Management

**Location:** `PropertiesSection.tsx` Lines 11-13

```typescript
const [properties, setProperties] = useState<Property[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**State Flow:**
1. **Initial State:**
   - `properties`: `[]`
   - `loading`: `true`
   - `error`: `null`

2. **During Fetch:**
   - `loading`: `true`
   - `error`: `null` (reset)

3. **On Success:**
   - `properties`: `Property[]` (up to 8 featured properties)
   - `loading`: `false`
   - `error`: `null`

4. **On Error:**
   - `properties`: `[]`
   - `loading`: `false`
   - `error`: `string` (error message)

---

### UI States & Rendering

#### Loading State
**Location:** `PropertiesSection.tsx` Lines 74-77
```typescript
{loading ? (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
) : ...}
```

#### Error State
**Location:** `PropertiesSection.tsx` Lines 78-81
```typescript
{error ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">Unable to load properties. Please try again later.</p>
  </div>
) : ...}
```

#### Empty State
**Location:** `PropertiesSection.tsx` Lines 82-92
```typescript
{properties.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground mb-4">No featured properties available at the moment.</p>
    <Button onClick={() => navigate("/properties")} variant="outline">
      Browse All Properties
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
) : ...}
```

#### Success State (Properties Display)
**Location:** `PropertiesSection.tsx` Lines 94-137
```typescript
<>
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto"
  >
    {properties.map((property) => (
      <PropertyCard key={property.id} {...propertyProps} />
    ))}
  </motion.div>
  {properties.length >= 8 && (
    <motion.div className="text-center mt-12">
      <Button onClick={() => navigate("/properties")} size="lg">
        View All Properties
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  )}
</>
```

**Grid Layout:**
- Mobile: 1 column (`grid-cols-1`)
- Small screens: 2 columns (`sm:grid-cols-2`)
- Medium screens: 3 columns (`md:grid-cols-3`)
- Large screens: 4 columns (`lg:grid-cols-4`)

---

### Animations

**Library:** Framer Motion (`framer-motion`)

**Container Animation:**
```typescript
// Lines 32-40
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger children by 0.1s
    },
  },
};
```

**Individual Card Animation:**
- Handled by `PropertyCard` component
- Initial: `opacity: 0, y: 20`
- Animate: `opacity: 1, y: 0`
- Hover: `y: -8` (lift effect)
- Image hover: `scale: 1.1`

---

### Navigation Flow

```
User visits homepage (/)
  ↓
Index.tsx renders PropertiesSection
  ↓
PropertiesSection fetches featured properties
  ↓
Displays up to 8 featured properties in grid
  ↓
User clicks "Book Now" on a property card
  ↓
Navigates to /property/:id (PropertyDetailsPage)
  ↓
OR
  ↓
User clicks "View All Properties" button
  ↓
Navigates to /properties (PropertiesPage)
```

---

### Backend API Endpoint Details

**Endpoint:** `GET /api/properties/?featured=true&limit=8`

**Query Parameters:**
- `featured=true` - Filters properties where `featured = True`
- `limit=8` - Limits results to 8 properties

**Backend Processing:**
1. Filter: `Property.objects.filter(featured=True)`
2. Order: `order_by('-featured', '-created_at')`
   - Featured properties first
   - Then by creation date (newest first)
3. Limit: `queryset[:8]` (first 8 results)
4. Serialize: `PropertyListSerializer` (lightweight serializer for list view)

**Response Format:**
```json
[
  {
    "id": 1,
    "title": "Luxury Apartment in Westlands",
    "property_type": "apartment",
    "location": "Westlands, Nairobi",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": "1500 sq ft",
    "price": "15000000",
    "display_price": "KSh 15,000,000",
    "type": "sale",
    "image": "https://firebasestorage.googleapis.com/...",
    "featured": true,
    ...
  },
  // ... up to 8 properties
]
```

**Serializer Used:** `PropertyListSerializer`
- Includes: `id`, `title`, `property_type`, `location`, `bedrooms`, `bathrooms`, `area`, `price`, `display_price`, `type`, `image`, `featured`
- Excludes: Full `description`, all `images` array (only `image` field), detailed `amenities`

---

### Error Handling

**Location:** `PropertiesSection.tsx` Lines 16-28

```typescript
const fetchFeaturedProperties = async () => {
  try {
    setLoading(true);
    setError(null);
    const featuredProperties = await propertiesApi.getFeatured(8);
    setProperties(featuredProperties);
  } catch (err) {
    console.error("Error fetching featured properties:", err);
    setError(err instanceof Error ? err.message : "Failed to load properties");
  } finally {
    setLoading(false);
  }
};
```

**Error Scenarios:**
1. **Network Error:** Connection failed, timeout
2. **API Error:** Backend returns error status (4xx, 5xx)
3. **Invalid Response:** Response format doesn't match expected structure
4. **Empty Response:** No featured properties available

**Error Display:**
- Shows user-friendly message: "Unable to load properties. Please try again later."
- Logs detailed error to console for debugging

---

### Comparison with Other Pages

| Feature | PropertiesSection | PropertiesPage | PropertyDetailsPage |
|---------|------------------|----------------|-------------------|
| **API Service** | ✅ Uses `propertiesApi.getFeatured()` | ✅ Uses `propertiesApi.getAll()` | ❌ Direct `fetch()` |
| **Data Fetching** | `useEffect` + `useState` | `useEffect` + `useState` | `useQuery` (React Query) |
| **Image Helper** | ✅ `getPropertyImageUrl()` | ✅ `getPropertyImageUrl()` | ❌ Local `getImageUrl()` |
| **Price Helper** | ✅ `formatPropertyPrice()` | ✅ `formatPropertyPrice()` | ❌ Local `formatPrice()` |
| **Component** | `PropertyCard` | Custom `PropertyCard` | `PropertyCard` (similar) |
| **Limit** | ✅ 8 properties | ❌ All properties | ❌ N/A (single property) |
| **Filtering** | ✅ `featured=true` | ✅ Multiple filters | ❌ N/A |
| **Animations** | ✅ Framer Motion | ❌ No animations | ❌ No animations |

---

### Summary

- **Index Page** displays featured properties through `PropertiesSection` component
- **PropertiesSection** uses centralized API service (`propertiesApi.getFeatured()`)
- Fetches up to 8 featured properties on component mount
- Uses consistent helper functions (`getPropertyImageUrl()`, `formatPropertyPrice()`)
- Displays properties in responsive grid layout (1-4 columns)
- Handles loading, error, and empty states gracefully
- Provides navigation to full properties page and individual property details
- Uses Framer Motion for smooth animations
- Backend filters by `featured=True` and orders by featured status and creation date

