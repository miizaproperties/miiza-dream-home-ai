#!/bin/bash

# Miiza Dream Home AI Deployment Script
# Run this script on your Hetzner VPS after setting up the server

set -e  # Exit on any error

echo "🚀 Starting Miiza Dream Home AI Deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as miiza user
if [ "$USER" != "miiza" ]; then
    print_error "This script should be run as the 'miiza' user"
    print_warning "Switch to miiza user: sudo su - miiza"
    exit 1
fi

# Set working directory
cd /var/www/miiza

print_status "Pulling latest code from repository..."
git pull origin main

print_status "Setting up backend environment..."
cd backend

# Activate virtual environment
source venv/bin/activate

# Install/update Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set production environment
export DJANGO_SETTINGS_MODULE=config.production

# Run database migrations
print_status "Running database migrations..."
python manage.py migrate

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput

# Create media directories if they don't exist
print_status "Creating media directories..."
mkdir -p media/properties
chmod -R 755 media

print_status "Setting up frontend..."
cd ../frontend

# Install/update Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build frontend for production
print_status "Building frontend..."
npm run build

print_status "Restarting services..."

# Restart Gunicorn
sudo systemctl restart miiza-gunicorn

# Restart Nginx
sudo systemctl reload nginx

# Check service status
print_status "Checking service status..."
if systemctl is-active --quiet miiza-gunicorn; then
    print_status "✅ Gunicorn service is running"
else
    print_error "❌ Gunicorn service is not running"
    sudo systemctl status miiza-gunicorn
    exit 1
fi

if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx service is running"
else
    print_error "❌ Nginx service is not running"
    sudo systemctl status nginx
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
print_status "Your application should now be live at your domain"

# Optional: Show recent logs
print_status "Recent application logs:"
sudo journalctl -u miiza-gunicorn --since "5 minutes ago" --no-pager -n 10