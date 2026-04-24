"""
Django settings for miizarealtors project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# ALLOWED_HOSTS - split by comma, strip whitespace
ALLOWED_HOSTS_STR = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,miiza-dream-home-ai-production.up.railway.app')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(',') if host.strip()]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    # Local apps
    'properties',
    'accounts',
    'contacts',
    'dashboard',
    'pages',
    'announcements',
    'testimonials',
    'news',
    'careers',
    'events',
]

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Must be after SecurityMiddleware
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

# Use PostgreSQL if configured, otherwise fall back to SQLite for development
if os.environ.get('DATABASE_URL'):
    # Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
    import urllib.parse
    database_url = os.environ.get('DATABASE_URL')
    result = urllib.parse.urlparse(database_url)
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': result.path[1:],  # Remove leading '/'
            'USER': result.username,
            'PASSWORD': result.password,
            'HOST': result.hostname,
            'PORT': result.port or '5432',
        }
    }
elif os.environ.get('DATABASE_ENGINE') == 'django.db.backends.postgresql':
    # Alternative: Use individual environment variables
    DATABASES = {
        'default': {
            'ENGINE': os.environ.get('DATABASE_ENGINE', 'django.db.backends.postgresql'),
            'NAME': os.environ.get('DATABASE_NAME', 'railway'),
            'USER': os.environ.get('DATABASE_USER', 'postgres'),
            'PASSWORD': os.environ.get('DATABASE_PASSWORD', ''),
            'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
            'PORT': os.environ.get('DATABASE_PORT', '5432'),
        }
    }
else:
    # Default to SQLite for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise configuration for serving static files in production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Ensure media directories exist
import os
os.makedirs(MEDIA_ROOT / 'properties', exist_ok=True)

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# CORS settings
# Default CORS origins for development
DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
    "http://localhost:8080",  # Alternative frontend port
    "http://localhost:8081",  # Current frontend port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "https://miizarealtors.com",  # Default production domain
    "https://www.miizarealtors.com",  # www version
    "https://miiza-dream-home-ai-production.up.railway.app",  # Railway production domain
]

# Get CORS origins from environment variable (comma-separated)
# If not set, use defaults
CORS_ORIGINS_STR = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if CORS_ORIGINS_STR:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(',') if origin.strip()]
    # Always include defaults for development and production
    CORS_ALLOWED_ORIGINS = list(set(CORS_ALLOWED_ORIGINS + DEFAULT_CORS_ORIGINS))
else:
    CORS_ALLOWED_ORIGINS = DEFAULT_CORS_ORIGINS

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Explicitly set to False for security
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF settings for API endpoints
# Get CSRF trusted origins from environment variable
CSRF_ORIGINS_STR = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
# Default production origins
DEFAULT_CSRF_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:5173",
    "https://miizarealtors.com",  # Default production domain
    "https://www.miizarealtors.com",  # www version
    "https://miiza-dream-home-ai-production.up.railway.app",  # Railway production domain
]

if CSRF_ORIGINS_STR:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in CSRF_ORIGINS_STR.split(',') if origin.strip()]
    # Always include defaults for development and production
    CSRF_TRUSTED_ORIGINS = list(set(CSRF_TRUSTED_ORIGINS + DEFAULT_CSRF_ORIGINS))
else:
    CSRF_TRUSTED_ORIGINS = DEFAULT_CSRF_ORIGINS

# Session cookie settings for cross-origin authentication
# In production (HTTPS), cookies need Secure=True and SameSite=None for cross-origin
# Check if we're in production by checking if Railway domain is in ALLOWED_HOSTS
is_production = any('railway.app' in host or 'miizarealtors.com' in host for host in ALLOWED_HOSTS) if ALLOWED_HOSTS else False

# Force Secure=True in production (HTTPS only) - required for SameSite=None
SESSION_COOKIE_SECURE = is_production or not DEBUG
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access for security
SESSION_COOKIE_SAMESITE = 'None' if (is_production or not DEBUG) else 'Lax'  # None for cross-origin in production
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = True  # Extend session on each request
# Don't set domain - cookies should be set for the backend domain
SESSION_COOKIE_DOMAIN = None
# Set path to root so cookie is available for all paths
SESSION_COOKIE_PATH = '/'

# CSRF cookie settings (must match session cookie settings for cross-origin)
CSRF_COOKIE_SECURE = is_production or not DEBUG  # True in production (HTTPS only)
CSRF_COOKIE_HTTPONLY = False  # Must be False for JavaScript to read CSRF token
CSRF_COOKIE_SAMESITE = 'None' if (is_production or not DEBUG) else 'Lax'  # None for cross-origin in production
CSRF_USE_SESSIONS = False  # Use cookie-based CSRF tokens
# Don't set domain - cookies should be set for the backend domain
CSRF_COOKIE_DOMAIN = None
CSRF_COOKIE_PATH = '/'

# Firebase Configuration
FIREBASE_STORAGE_BUCKET = os.environ.get('FIREBASE_STORAGE_BUCKET', 'automotive-5f3b5.firebasestorage.app')
FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')

# Email Configuration
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'Miizarealtors@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'oeyfcuagcikrmeke')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
