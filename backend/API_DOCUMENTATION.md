# MiiZA Realtors API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
Currently, the API allows public access. Authentication will be added in future updates.

---

## Properties Endpoints

### 1. List All Properties
**GET** `/api/properties/`

Returns a paginated list of all properties.

**Query Parameters:**
- `property_type` - Filter by type (apartment, house, villa, commercial, office, traditional_home)
- `status` - Filter by status (available, sold, rented, pending)
- `city` - Filter by city (case-insensitive contains)
- `country` - Filter by country
- `is_for_sale` - Filter by sale status (true/false)
- `is_for_rent` - Filter by rental status (true/false)
- `featured` - Filter featured properties (true/false)
- `bedrooms` - Exact number of bedrooms
- `min_bedrooms` - Minimum number of bedrooms
- `min_bathrooms` - Minimum number of bathrooms
- `min_price` - Minimum price
- `max_price` - Maximum price
- `min_guests` - Minimum guest capacity
- `search` - Search in title, description, address, city
- `ordering` - Sort by field (price, -price, created_at, -created_at, bedrooms, bathrooms)

**Example:**
```
GET /api/properties/?city=Nairobi&is_for_rent=true&min_bedrooms=2&ordering=-price
```

**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Langata Heritage House",
      "property_type": "house",
      "status": "available",
      "city": "Nairobi",
      "location": "Nairobi, Kenya",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": "1,800 sqft",
      "price": "19500000.00",
      "display_price": "USD 150 /night",
      "is_for_sale": false,
      "is_for_rent": true,
      "type": "rent",
      "image": "/media/properties/image.jpg",
      "main_image": "/media/properties/image.jpg",
      "featured": true,
      "guests": 6
    }
  ]
}
```

---

### 2. Get Property Details
**GET** `/api/properties/{id}/`

Returns detailed information about a specific property.

**Response:**
```json
{
  "id": 1,
  "title": "Langata Heritage House",
  "description": "Beautiful heritage house...",
  "property_type": "house",
  "status": "available",
  "address": "123 Langata Road",
  "city": "Nairobi",
  "state": "",
  "zip_code": "",
  "country": "Kenya",
  "location": "Nairobi, Kenya",
  "bedrooms": 3,
  "bathrooms": 2,
  "square_feet": 1800,
  "area": "1,800 sqft",
  "max_guests": 6,
  "guests": 6,
  "price": "19500000.00",
  "rental_price_per_night": "150.00",
  "currency": "USD",
  "display_price": "USD 150 /night",
  "is_for_sale": false,
  "is_for_rent": true,
  "type": "rent",
  "amenities": ["WiFi", "Parking", "Garden", "Security"],
  "main_image": "/media/properties/image.jpg",
  "images": [
    {
      "id": 1,
      "image": "/media/properties/images/img1.jpg",
      "alt_text": "Living room",
      "order": 0
    }
  ],
  "featured": true,
  "created_at": "2024-12-02T10:30:00Z",
  "updated_at": "2024-12-02T10:30:00Z"
}
```

---

### 3. Featured Properties
**GET** `/api/properties/featured/`

Returns only featured properties.

**Response:** Same format as list endpoint

---

### 4. Advanced Search
**GET** `/api/properties/search/?q={query}`

Search properties by keyword in title, description, address, or city.

**Query Parameters:**
- `q` - Search query (required)

---

### 5. Properties by Location
**GET** `/api/properties/by_location/?city={city}`

Get all properties in a specific city.

**Query Parameters:**
- `city` - City name (required, case-insensitive)

---

## Contacts Endpoints

### 1. Submit Contact Form
**POST** `/api/contacts/contacts/`

Submit a contact inquiry.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000",
  "subject": "inquiry",
  "message": "I'm interested in...",
  "property": 1
}
```

**Subject Choices:**
- `inquiry` - Property Inquiry
- `viewing` - Schedule Viewing
- `general` - General Question
- `mortgage` - Mortgage Information
- `other` - Other

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000",
  "subject": "inquiry",
  "message": "I'm interested in...",
  "property": 1,
  "created_at": "2024-12-02T10:30:00Z"
}
```

---

### 2. Request Property Viewing
**POST** `/api/contacts/viewing-requests/`

Schedule a property viewing.

**Request Body:**
```json
{
  "property": 1,
  "preferred_date": "2024-12-15",
  "preferred_time": "14:00:00",
  "message": "I'd like to view this property",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000"
}
```

**Response:**
```json
{
  "id": 1,
  "contact": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254700000000",
    "subject": "viewing",
    "message": "",
    "property": 1,
    "created_at": "2024-12-02T10:30:00Z"
  },
  "property": 1,
  "property_title": "Langata Heritage House",
  "preferred_date": "2024-12-15",
  "preferred_time": "14:00:00",
  "message": "I'd like to view this property",
  "status": "pending",
  "reference_number": "VW-A1B2C3D4",
  "created_at": "2024-12-02T10:30:00Z"
}
```

---

## Accounts Endpoints

### 1. List Users
**GET** `/api/accounts/users/`

Returns list of users (read-only).

---

### 2. List Agents
**GET** `/api/accounts/agents/`

Returns list of real estate agents.

**Response:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "agent1",
      "email": "agent@miiza.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "phone_number": "+254700000000",
      "is_agent": true
    },
    "license_number": "RE-12345",
    "years_experience": 5,
    "specialization": "Residential Properties"
  }
]
```

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Format:**
```json
{
  "error": "Error message description"
}
```

---

## Pagination

List endpoints return paginated results:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/properties/?page=2",
  "previous": null,
  "results": [...]
}
```

Default page size: 20 items

---

## CORS

The API is configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

---

## Media Files

Property images are served from `/media/` in development mode.

Example: `http://localhost:8000/media/properties/image.jpg`

