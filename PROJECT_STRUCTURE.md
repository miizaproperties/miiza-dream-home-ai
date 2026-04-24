# MiiZA Realtors - Project Structure

This document outlines the complete project structure after organization.

## Directory Structure

```
miizarealtors/
├── frontend/              # React/TypeScript frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── assets/        # Images and static assets
│   ├── public/            # Public static files
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
│
└── backend/               # Django REST API backend
    ├── config/            # Django project settings
    │   ├── settings.py    # Main settings file
    │   ├── urls.py        # Root URL configuration
    │   ├── wsgi.py        # WSGI configuration
    │   └── asgi.py        # ASGI configuration
    │
    ├── properties/        # Property listings app
    │   ├── models.py      # Property models
    │   ├── views.py       # API views
    │   ├── serializers.py # DRF serializers
    │   ├── urls.py        # App URLs
    │   └── admin.py       # Admin configuration
    │
    ├── accounts/          # User and agent accounts app
    │   ├── models.py      # User and Agent models
    │   ├── views.py       # API views
    │   ├── serializers.py # DRF serializers
    │   ├── urls.py        # App URLs
    │   └── admin.py       # Admin configuration
    │
    ├── contacts/          # Contact and viewing requests app
    │   ├── models.py      # Contact and ViewingRequest models
    │   ├── views.py       # API views
    │   ├── serializers.py # DRF serializers
    │   ├── urls.py        # App URLs
    │   └── admin.py       # Admin configuration
    │
    ├── media/             # User-uploaded files
    ├── staticfiles/       # Collected static files
    ├── templates/         # Django templates
    ├── manage.py          # Django management script
    ├── requirements.txt   # Python dependencies
    └── README.md          # Backend setup instructions
```

## Frontend Structure

The frontend is a modern React application built with:
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **TanStack Query** - Data fetching and state management

### Key Frontend Features:
- Property listings and search
- Property details pages
- Contact forms
- AI-powered chatbot
- Responsive design

## Backend Structure

The backend is a Django REST Framework API with:

### Django Apps:

1. **properties** - Property management
   - Property listings (apartments, houses, villas, commercial, offices)
   - Property images
   - Search and filtering
   - Featured properties

2. **accounts** - User and agent management
   - Custom User model
   - Agent profiles
   - User authentication

3. **contacts** - Contact management
   - Contact form submissions
   - Viewing request scheduling
   - Inquiry tracking

### API Endpoints:

- `GET /api/properties/` - List all properties
- `GET /api/properties/{id}/` - Property details
- `GET /api/properties/featured/` - Featured properties
- `GET /api/accounts/users/` - List users
- `GET /api/accounts/agents/` - List agents
- `POST /api/contacts/contacts/` - Submit contact form
- `POST /api/contacts/viewing-requests/` - Request property viewing

### Database:
- **SQLite** (default) - Development database
- Can be configured for PostgreSQL/MySQL in production

## Getting Started

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Development Notes

- Frontend runs on `http://localhost:5173` (Vite default)
- Backend runs on `http://localhost:8000`
- CORS is configured to allow frontend-backend communication
- Media files are served from `/media/` in development
