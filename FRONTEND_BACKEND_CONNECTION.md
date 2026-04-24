# Frontend-Backend Connection Guide

This document describes how the frontend and backend are connected in the MiiZA Dream Home AI project.

## Overview

The frontend (React + Vite) communicates with the backend (Django REST Framework) through a centralized API service layer.

## Architecture   

### Frontend API Service
- **Location**: `frontend/src/services/api.ts`
- **Purpose**: Centralized API client for all backend communication
- **Base URL**: Configurable via `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:8000/api`)

### Backend API
- **Base URL**: `http://localhost:8000/api`
- **Framework**: Django REST Framework
- **CORS**: Configured to allow requests from `http://localhost:8080` (frontend dev server)

## API Endpoints

### Properties
- `GET /api/properties/` - List all properties (supports filtering)
- `GET /api/properties/{id}/` - Get property details
- `GET /api/properties/featured/` - Get featured properties
- `GET /api/properties/search/?q={query}` - Search properties

**Query Parameters:**
- `property_type` - Filter by property type
- `city` - Filter by city
- `country` - Filter by country
- `featured` - Filter featured properties (true/false)
- `is_for_sale` - Filter sale properties (true/false)
- `is_for_rent` - Filter rent properties (true/false)
- `min_price` - Minimum price
- `max_price` - Maximum price
- `bedrooms` - Number of bedrooms
- `min_bedrooms` - Minimum bedrooms
- `min_bathrooms` - Minimum bathrooms
- `search` - Search query
- `ordering` - Sort order (e.g., `-created_at`, `price`, `-price`)

### Contacts
- `POST /api/contacts/contacts/` - Submit contact form

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000",
  "message": "I'm interested in...",
  "subject": "general",
  "property": 1  // Optional
}
```

### Viewing Requests
- `POST /api/contacts/viewing-requests/` - Submit viewing request

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000",
  "preferred_date": "2024-01-15",
  "preferred_time": "14:00",
  "message": "Optional message",
  "property": 1  // Optional but recommended
}
```

## Components Using Backend API

### 1. PropertiesSection (`frontend/src/components/PropertiesSection.tsx`)
- **Fetches**: Featured properties on component mount
- **API Call**: `propertiesApi.getFeatured(12)`
- **Displays**: Up to 12 featured properties in a grid

### 2. PropertiesPage (`frontend/src/pages/PropertiesPage.tsx`)
- **Fetches**: All properties with filtering
- **API Call**: `propertiesApi.getAll(params)` with dynamic filters
- **Features**: 
  - Real-time filtering
  - Search functionality
  - Sorting options
  - Property details navigation

### 3. ContactForm (`frontend/src/components/ContactForm.tsx`)
- **Submits**: Contact form data
- **API Call**: `contactsApi.submit(formData)`
- **Handles**: Form validation and error handling

### 4. PropertyDetailsPage (`frontend/src/pages/PropertyDetailsPage.tsx`)
- **Fetches**: Individual property details
- **API Call**: `propertiesApi.getById(id)`
- **Also**: Submits viewing requests via `viewingRequestsApi.submit()`

## Development Setup

### Backend
1. Navigate to `backend/` directory
2. Activate virtual environment
3. Run migrations: `python manage.py migrate`
4. Start server: `python manage.py runserver`
5. Backend runs on `http://localhost:8000`

### Frontend
1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Frontend runs on `http://localhost:8080`

### Vite Proxy Configuration
The frontend is configured with a proxy in `vite.config.ts` to forward `/api` requests to the backend during development. This allows you to use relative URLs in the API service.

## Environment Variables

### Frontend
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend
Create a `.env` file in the `backend/` directory (see `env.example`):
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## CORS Configuration

The backend CORS settings in `backend/config/settings.py` allow requests from:
- `http://localhost:8080` (Vite dev server)
- `http://localhost:5173` (Alternative Vite port)
- `http://localhost:3000` (Alternative React port)
- `http://127.0.0.1:8080`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

## Error Handling

The API service includes comprehensive error handling:
- Network errors are caught and displayed to users
- HTTP errors return meaningful error messages
- Loading states are managed in components
- Toast notifications provide user feedback

## Data Flow

1. **User Action** → Component triggers API call
2. **API Service** → Formats request and sends to backend
3. **Backend** → Processes request and returns JSON response
4. **API Service** → Parses response and returns typed data
5. **Component** → Updates state and re-renders UI

## Type Safety

The API service uses TypeScript interfaces to ensure type safety:
- `Property` - Property data structure
- `ContactFormData` - Contact form data
- `ViewingRequestData` - Viewing request data

## Helper Functions

The API service includes helper functions:
- `getPropertyImageUrl()` - Formats property image URLs
- `formatPropertyPrice()` - Formats property prices for display

## Testing the Connection

1. Start both backend and frontend servers
2. Open browser console to check for API errors
3. Navigate to properties page - should load from backend
4. Submit contact form - should save to backend database
5. Check Django admin at `http://localhost:8000/admin/` to verify data

## Troubleshooting

### CORS Errors
- Ensure backend CORS settings include your frontend URL
- Check that `corsheaders` middleware is enabled
- Verify `CORS_ALLOWED_ORIGINS` in `settings.py`

### Connection Refused
- Verify backend is running on port 8000
- Check firewall settings
- Ensure `ALLOWED_HOSTS` includes your host

### 404 Errors
- Verify API endpoint URLs match backend routes
- Check `backend/config/urls.py` for correct URL patterns
- Ensure app URLs are included in main URL config

### Data Not Loading
- Check browser console for errors
- Verify backend has data (use Django admin)
- Check network tab for API responses
- Verify API response format matches expected structure



















