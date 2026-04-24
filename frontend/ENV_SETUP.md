# Environment Variables Setup

This project uses environment variables to configure the backend API URL for both development and production environments.

## Required Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

### For Development:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### For Production:
```env
VITE_API_BASE_URL=https://miiza-dream-home-ai-production.up.railway.app/api
```

## Optional Environment Variables

You can also set these if you need more control:

- `VITE_DASHBOARD_API_BASE_URL` - Dashboard API URL (defaults to `${VITE_API_BASE_URL}/dashboard`)
- `VITE_BACKEND_BASE_URL` - Backend base URL without `/api` (defaults to `${VITE_API_BASE_URL}` without `/api`)

## How It Works

The application uses a centralized API configuration file (`src/config/api.ts`) that:
- Reads environment variables at build time
- Provides default values for development (localhost)
- Exports constants that all components can import and use

## Usage in Code

Instead of hardcoding URLs, import from the config:

```typescript
import { API_BASE_URL, DASHBOARD_API_BASE_URL, BACKEND_BASE_URL, getMediaUrl } from '@/config/api';

// Use API_BASE_URL for regular API calls
fetch(`${API_BASE_URL}/properties/`)

// Use DASHBOARD_API_BASE_URL for dashboard API calls
fetch(`${DASHBOARD_API_BASE_URL}/login/`)

// Use BACKEND_BASE_URL for admin links or media
window.open(`${BACKEND_BASE_URL}/admin/`)

// Use getMediaUrl helper for media files
const imageUrl = getMediaUrl(property.image)
```

## Important Notes

1. **Vite Environment Variables**: All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

2. **Build Time**: Environment variables are embedded at build time, not runtime. You need to rebuild the application if you change them.

3. **Development Proxy**: The Vite dev server proxy (in `vite.config.ts`) is only used during development. In production, the app will use the `VITE_API_BASE_URL` you set.

4. **No Hardcoded URLs**: All hardcoded `localhost:8000` URLs have been replaced with environment variable references.

