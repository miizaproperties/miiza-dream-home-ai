#!/bin/bash

# VPS Deployment Script for Miiza Dream Home
# Domain: miizarealtors.com
# VPS: 178.104.220.231 (Hetzner)

set -e

echo "🚀 Starting VPS deployment for miizarealtors.com..."

# Variables
DOMAIN="miizarealtors.com"
VPS_IP="178.104.220.231"
VPS_USER="miiza"
APP_DIR="/home/miiza/app"
REPO_URL="https://github.com/miizaproperties/miiza-dream-home-ai.git"
DB_PASSWORD="$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-25)"
ADMIN_PASSWORD="$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-25)"
SECRET_KEY="$(openssl rand -base64 64 | tr -d '=+/' | cut -c1-50)"

echo "📋 Deployment Configuration:"
echo "   Domain: $DOMAIN"
echo "   VPS IP: $VPS_IP"
echo "   User: $VPS_USER"
echo "   App Directory: $APP_DIR"
echo "   Repository: $REPO_URL"
echo ""

# Function to run commands on VPS
run_on_vps() {
    ssh $VPS_USER@$VPS_IP "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    scp "$1" $VPS_USER@$VPS_IP:"$2"
}

echo "🔄 Step 1: Updating system and installing dependencies..."
run_on_vps "
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib nginx redis-server git curl
"

echo "🔧 Step 2: Setting up PostgreSQL database..."
echo "   Database Password: $DB_PASSWORD"
run_on_vps "
    sudo -u postgres createdb miiza_db || true
    sudo -u postgres createuser miiza_user || true
    sudo -u postgres psql -c \"ALTER USER miiza_user WITH PASSWORD '$DB_PASSWORD';\"
    sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE miiza_db TO miiza_user;\"
"

echo "📁 Step 3: Creating application directory..."
run_on_vps "
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # Clone repository if not exists, otherwise pull latest
    if [ ! -d \".git\" ]; then
        git clone $REPO_URL .
    else
        git pull origin main
    fi
"

echo "🐍 Step 4: Setting up Python virtual environment..."
run_on_vps "
    cd $APP_DIR
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r backend/requirements.txt
"

echo "📝 Step 5: Configuring Django settings..."
# Create production environment file with secure passwords
cat << EOF | ssh $VPS_USER@$VPS_IP "tee $APP_DIR/backend/.env"
DEBUG=False
SECRET_KEY=$SECRET_KEY
ALLOWED_HOSTS=miizarealtors.com,www.miizarealtors.com,$VPS_IP

DATABASE_URL=postgres://miiza_user:$DB_PASSWORD@localhost:5432/miiza_db

SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS=DENY
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

CORS_ALLOWED_ORIGINS=https://miizarealtors.com,https://www.miizarealtors.com
CORS_ALLOW_CREDENTIALS=True

SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SAMESITE=Lax
CSRF_COOKIE_SAMESITE=Lax

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=miizaproperties51@gmail.com
DEFAULT_FROM_EMAIL=miizaproperties51@gmail.com
SERVER_EMAIL=miizaproperties51@gmail.com

STATIC_URL=/static/
STATIC_ROOT=/home/miiza/app/staticfiles
MEDIA_URL=/media/
MEDIA_ROOT=/home/miiza/app/media

LOGGING_LEVEL=INFO
EOF

echo "🗄️  Step 6: Setting up database..."
run_on_vps "
    cd $APP_DIR
    source venv/bin/activate
    cd backend
    python manage.py makemigrations
    python manage.py migrate
    
    # Create superuser if not exists
    python manage.py shell -c \"
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'miizaproperties51@gmail.com', '$ADMIN_PASSWORD')
    print('Superuser created with password: $ADMIN_PASSWORD')
else:
    print('Superuser already exists')
\"
"

echo "🎨 Step 7: Collecting static files..."
run_on_vps "
    cd $APP_DIR
    source venv/bin/activate
    cd backend
    python manage.py collectstatic --noinput
"

echo "⚡ Step 8: Setting up Gunicorn service..."
cat << 'EOF' | ssh $VPS_USER@$VPS_IP "sudo tee /etc/systemd/system/miiza.service"
[Unit]
Description=Miiza Dream Home Django App
After=network.target

[Service]
User=miiza
Group=miiza
WorkingDirectory=/home/miiza/app/backend
Environment="PATH=/home/miiza/app/venv/bin"
ExecStart=/home/miiza/app/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/home/miiza/app/backend/miiza.sock config.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

run_on_vps "
    sudo systemctl daemon-reload
    sudo systemctl enable miiza
    sudo systemctl start miiza
    sudo systemctl status miiza
"

echo "🌐 Step 9: Configuring Nginx..."
cat << EOF | ssh $VPS_USER@$VPS_IP "sudo tee /etc/nginx/sites-available/miizarealtors.com"
server {
    listen 80;
    server_name miizarealtors.com www.miizarealtors.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /home/miiza/app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /home/miiza/app/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/miiza/app/backend/miiza.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 50M;
}
EOF

run_on_vps "
    sudo ln -sf /etc/nginx/sites-available/miizarealtors.com /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
"

echo "🔒 Step 10: Setting up SSL with Let's Encrypt..."
run_on_vps "
    sudo apt install -y certbot python3-certbot-nginx
    
    # Generate SSL certificate
    sudo certbot --nginx -d miizarealtors.com -d www.miizarealtors.com --non-interactive --agree-tos --email miizaproperties51@gmail.com
    
    # Set up auto-renewal
    sudo crontab -l | grep -q certbot || echo '0 12 * * * /usr/bin/certbot renew --quiet' | sudo crontab -
"

echo "🔥 Step 11: Setting up firewall..."
run_on_vps "
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
"

echo "📱 Step 12: Building frontend..."
run_on_vps "
    cd $APP_DIR/frontend
    npm install
    npm run build
    
    # Copy build files to nginx directory
    sudo rm -rf /var/www/html/*
    sudo cp -r dist/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
"

echo "🎉 Deployment completed successfully!"
echo ""
echo "🔐 IMPORTANT - Save these secure credentials:"
echo "   📊 Database Password: $DB_PASSWORD"
echo "   🔑 Admin Password: $ADMIN_PASSWORD"
echo "   🛡️  Secret Key: $SECRET_KEY"
echo ""
echo "📋 Deployment Summary:"
echo "   🌐 Website: https://miizarealtors.com"
echo "   🔧 Admin Panel: https://miizarealtors.com/admin"
echo "   📊 Dashboard: https://miizarealtors.com/dashboard"
echo "   🔑 Admin User: admin"
echo ""
echo "🔧 Management Commands:"
echo "   Check Django status: ssh $VPS_USER@$VPS_IP 'sudo systemctl status miiza'"
echo "   Check Nginx status: ssh $VPS_USER@$VPS_IP 'sudo systemctl status nginx'"
echo "   View Django logs: ssh $VPS_USER@$VPS_IP 'sudo journalctl -u miiza -f'"
echo "   Restart Django: ssh $VPS_USER@$VPS_IP 'sudo systemctl restart miiza'"
echo "   Restart Nginx: ssh $VPS_USER@$VPS_IP 'sudo systemctl restart nginx'"
echo ""
echo "🚀 Your Miiza Dream Home platform is now live!"
EOF