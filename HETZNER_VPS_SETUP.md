# Hetzner Ubuntu VPS Deployment Guide for Miiza Dream Home AI

## 🚀 Complete Production Deployment Setup

### 1. Initial Ubuntu Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y nginx postgresql postgresql-contrib python3 python3-pip python3-venv nodejs npm git curl supervisor certbot python3-certbot-nginx

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version
npm --version
python3 --version
```

### 2. Setup Application User and Directory

```bash
# Create application user
sudo useradd -m -s /bin/bash miiza
sudo usermod -aG www-data miiza

# Create application directory
sudo mkdir -p /var/www/miiza
sudo chown -R miiza:www-data /var/www/miiza
sudo chmod -R 755 /var/www/miiza
```

### 3. Clone and Setup Application

```bash
# Switch to miiza user
sudo su - miiza

# Clone the repository
cd /var/www/miiza
git clone https://github.com/YOUR_USERNAME/miiza-dream-home-ai.git .
# OR upload your files via SCP/SFTP

# Setup backend
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Additional production dependencies
pip install gunicorn psycopg2-binary

# Setup frontend
cd ../frontend
npm install
npm run build
```

### 4. PostgreSQL Database Setup

```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
psql
CREATE DATABASE miiza_db;
CREATE USER miiza_user WITH PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE miiza_db TO miiza_user;
ALTER USER miiza_user CREATEDB;
\q

# Exit postgres user
exit
```

### 5. Django Production Settings

Create production settings file:

```bash
# As miiza user
cd /var/www/miiza/backend
```

**Create `/var/www/miiza/backend/config/production.py`:**

```python
from .settings import *
import os

# SECURITY SETTINGS
DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-production-secret-key-here')

# ALLOWED HOSTS
ALLOWED_HOSTS = [
    'your-domain.com',
    'www.your-domain.com',
    'your-server-ip',
    '127.0.0.1',
    'localhost',
]

# DATABASE
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'miiza_db',
        'USER': 'miiza_user',
        'PASSWORD': 'your_strong_password_here',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# STATIC FILES
STATIC_URL = '/static/'
STATIC_ROOT = '/var/www/miiza/backend/staticfiles'

# MEDIA FILES
MEDIA_URL = '/media/'
MEDIA_ROOT = '/var/www/miiza/backend/media'

# CORS SETTINGS
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]

CORS_ALLOW_CREDENTIALS = True

# SECURITY HEADERS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# SESSION SETTINGS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# LOGGING
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/miiza/django.log',
        },
    },
    'root': {
        'handlers': ['file'],
    },
}
```

### 6. Environment Variables

Create environment file:

```bash
# Create environment file
sudo mkdir -p /etc/miiza
sudo touch /etc/miiza/environment

# Add to /etc/miiza/environment
echo "DJANGO_SETTINGS_MODULE=config.production" | sudo tee -a /etc/miiza/environment
echo "DJANGO_SECRET_KEY=your-very-secure-secret-key-here" | sudo tee -a /etc/miiza/environment
```

### 7. Setup Database and Static Files

```bash
# As miiza user
cd /var/www/miiza/backend
source venv/bin/activate

# Set environment
export DJANGO_SETTINGS_MODULE=config.production

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Create media directories
mkdir -p media/properties
sudo chown -R miiza:www-data media
sudo chmod -R 755 media
```

### 8. Gunicorn Configuration

Create Gunicorn service file:

**Create `/etc/systemd/system/miiza-gunicorn.service`:**

```ini
[Unit]
Description=Miiza Gunicorn daemon
After=network.target

[Service]
User=miiza
Group=www-data
WorkingDirectory=/var/www/miiza/backend
Environment=DJANGO_SETTINGS_MODULE=config.production
EnvironmentFile=/etc/miiza/environment
ExecStart=/var/www/miiza/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 config.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start Gunicorn:

```bash
sudo systemctl daemon-reload
sudo systemctl enable miiza-gunicorn
sudo systemctl start miiza-gunicorn
sudo systemctl status miiza-gunicorn
```

### 9. Nginx Configuration

**Create `/etc/nginx/sites-available/miiza`:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com your-server-ip;

    # Frontend (React build)
    root /var/www/miiza/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes (Django)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin "https://your-domain.com" always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With" always;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (Django)
    location /static/ {
        alias /var/www/miiza/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files (Django)
    location /media/ {
        alias /var/www/miiza/backend/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/miiza /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 10. SSL Certificate with Let's Encrypt

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 11. Create Log Directory

```bash
sudo mkdir -p /var/log/miiza
sudo chown miiza:www-data /var/log/miiza
sudo chmod 755 /var/log/miiza
```

### 12. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### 13. Frontend API Configuration

Update frontend API configuration for production:

**Edit `/var/www/miiza/frontend/src/config/api.ts`:**

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:8001/api';

const DASHBOARD_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-domain.com/api/dashboard'
  : 'http://localhost:8001/api/dashboard';

export { API_BASE_URL, DASHBOARD_API_BASE_URL };
```

Rebuild frontend:

```bash
cd /var/www/miiza/frontend
npm run build
```

### 14. Monitoring and Maintenance

**Create backup script `/var/www/miiza/backup.sh`:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/miiza/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U miiza_user -h localhost miiza_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup media files
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /var/www/miiza/backend/media/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to crontab:

```bash
chmod +x /var/www/miiza/backup.sh

# Add to crontab (daily backup at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/miiza/backup.sh") | crontab -
```

### 15. Final Checklist

- [ ] Django backend running on port 8000
- [ ] Nginx serving frontend and proxying API
- [ ] SSL certificate installed
- [ ] Database connected and migrated
- [ ] Media files accessible
- [ ] Firewall configured
- [ ] Backup script scheduled
- [ ] DNS pointing to server IP

### 🔧 Useful Commands

```bash
# Restart services
sudo systemctl restart miiza-gunicorn
sudo systemctl restart nginx

# Check logs
sudo journalctl -u miiza-gunicorn -f
sudo tail -f /var/log/nginx/error.log

# Update application
cd /var/www/miiza
git pull origin main
cd backend && source venv/bin/activate && pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
cd ../frontend && npm install && npm run build
sudo systemctl restart miiza-gunicorn
```

### 📝 Replace These Values

- `your-domain.com` - Your actual domain
- `your-server-ip` - Your Hetzner server IP
- `your_strong_password_here` - Strong PostgreSQL password
- `your-very-secure-secret-key-here` - Django secret key

### 💡 Notes

1. **Images are now properly configured** to be served from `/media/` URL
2. **CORS is properly set up** for frontend-backend communication
3. **All static assets are optimized** with proper caching headers
4. **Security headers and SSL** are configured for production
5. **Database backups** are automated