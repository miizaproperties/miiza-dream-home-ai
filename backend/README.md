# MiiZA Realtors Backend

Django REST API backend for MiiZA Realtors real estate platform.

## Setup Instructions

### Prerequisites
- Python 3.10 or higher
- pip

### Installation

1. Create a virtual environment:
```bash

python -m venv venv
```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt.
```

4. Copy environment variables:
```bash
copy env.example .env
```
   - On macOS/Linux: `cp env.example .env`

5. Edit `.env` file and set your `SECRET_KEY`

6. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

7. Create a superuser:
```bash
python manage.py createsuperuser
```

8. Run the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `/api/properties/` - Property listings
- `/api/accounts/users/` - User accounts
- `/api/accounts/agents/` - Real estate agents
- `/api/contacts/contacts/` - Contact form submissions
- `/api/contacts/viewing-requests/` - Property viewing requests
- `/admin/` - Django admin panel

## Database

This project uses SQLite by default. For production, consider using PostgreSQL or MySQL.

## Project Structure

```
backend/
├── config/          # Django project settings
├── properties/      # Property listings app
├── accounts/        # User and agent accounts app
├── contacts/        # Contact and viewing requests app
├── media/           # Uploaded files (created after first upload)
├── staticfiles/     # Static files (created after collectstatic)
└── manage.py        # Django management script
```

