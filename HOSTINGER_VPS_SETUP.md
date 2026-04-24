# Hostinger VPS Hosting Setup for MiiZA Realtors

## 🚀 **Recommended VPS Plan**

### **Hostinger VPS Plan 2 (Recommended)**
- **2 vCPU cores**
- **8 GB RAM** 
- **100 GB NVMe SSD storage**
- **Unmetered bandwidth**
- **1 Gbps network speed**
- **Price: ~$7.99/month** (with promotional pricing)

### **Why This Plan?**
- ✅ Sufficient resources for Django + React + Database
- ✅ Room for growth (can handle 1000+ concurrent users)
- ✅ Fast NVMe SSD for quick database queries
- ✅ Unmetered bandwidth for image-heavy real estate site
- ✅ Excellent price-to-performance ratio

## 🛠️ **Technical Specifications Needed**

### **Server Requirements:**
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Python**: 3.9+ (for Django)
- **Node.js**: 18+ (for React build)
- **Database**: PostgreSQL 14+ (production ready)
- **Web Server**: Nginx (reverse proxy + static files)
- **SSL**: Let's Encrypt (free SSL certificates)

### **Estimated Resource Usage:**
- **Django Backend**: ~1GB RAM, ~30% CPU
- **PostgreSQL**: ~1GB RAM, ~20% CPU  
- **React Frontend**: Static files (served by Nginx)
- **Media Files**: ~10-20GB initially (property images)
- **Database**: ~1-5GB (properties, users, etc.)

## 💰 **Pricing Breakdown**

### **Hostinger VPS Plan 2:**
- **Monthly**: $7.99/month
- **12 months**: $5.99/month ($71.88/year) 💰 **BEST VALUE**
- **24 months**: $4.99/month ($119.76/2 years) 💰 **MAXIMUM SAVINGS**

### **Additional Costs:**
- **Domain**: $10-15/year (if not owned)
- **SSL Certificate**: FREE (Let's Encrypt)
- **Backup Service**: $2-4/month (optional but recommended)
- **Total Monthly**: ~$6-12/month

## 🔧 **Server Setup Process**

### **1. VPS Purchase & Setup**
1. Visit [Hostinger VPS](https://hostinger.com/vps-hosting)
2. Select **VPS Plan 2** (8GB RAM recommended)
3. Choose **Ubuntu 22.04 LTS**
4. Add **domain** if needed
5. Select **12-month plan** for best price

### **2. Initial Server Access**
```bash
ssh root@your-server-ip
```

### **3. System Updates**
```bash
apt update && apt upgrade -y
apt install curl wget git nginx postgresql postgresql-contrib
```

### **4. User Setup**
```bash
adduser miiza
usermod -aG sudo miiza
su - miiza
```

## 🐍 **Django Backend Deployment**

### **1. Python Environment**
```bash
sudo apt install python3.9 python3.9-venv python3-pip
python3.9 -m venv /home/miiza/venv
source /home/miiza/venv/bin/activate
```

### **2. Backend Code Deployment**
```bash
cd /home/miiza
git clone [YOUR-REPO] miiza-backend
cd miiza-backend
pip install -r requirements.txt
```

### **3. Database Setup**
```bash
sudo -u postgres psql
CREATE DATABASE miiza_db;
CREATE USER miiza_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE miiza_db TO miiza_user;
```

### **4. Django Configuration**
```python
# settings.py production updates
ALLOWED_HOSTS = ['your-domain.com', 'server-ip']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'miiza_db',
        'USER': 'miiza_user',
        'PASSWORD': 'secure_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### **5. Static Files & Media**
```bash
python manage.py collectstatic
python manage.py migrate
```

## ⚛️ **React Frontend Deployment**

### **1. Node.js Setup**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **2. Frontend Build**
```bash
cd /home/miiza/miiza-frontend
npm install
npm run build
```

### **3. Static File Serving**
```bash
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
```

## 🌐 **Nginx Configuration**

### **1. Site Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (React)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (Django)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Media files
    location /media/ {
        alias /home/miiza/miiza-backend/media/;
    }

    # Static files
    location /static/ {
        alias /home/miiza/miiza-backend/static/;
    }
}
```

## 🔒 **SSL & Security Setup**

### **1. SSL Certificate (Free)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### **2. Firewall Configuration**
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432  # PostgreSQL (only if remote access needed)
```

## 🔄 **Process Management**

### **1. Django Service (Gunicorn)**
```bash
sudo nano /etc/systemd/system/miiza.service

[Unit]
Description=MiiZA Django app
After=network.target

[Service]
User=miiza
Group=www-data
WorkingDirectory=/home/miiza/miiza-backend
Environment="PATH=/home/miiza/venv/bin"
ExecStart=/home/miiza/venv/bin/gunicorn --workers 3 --bind unix:/home/miiza/miiza-backend/miiza.sock config.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable miiza
sudo systemctl start miiza
```

## 📊 **Monitoring & Maintenance**

### **1. System Monitoring**
```bash
# Check services
systemctl status miiza
systemctl status nginx
systemctl status postgresql

# Check logs
journalctl -u miiza -f
tail -f /var/log/nginx/error.log
```

### **2. Automated Backups**
```bash
# Database backup script
#!/bin/bash
pg_dump -U miiza_user miiza_db > backup_$(date +%Y%m%d).sql
```

## 🎯 **Performance Optimization**

### **1. Database Indexing**
```sql
-- Add indexes for better performance
CREATE INDEX ON properties_property(city);
CREATE INDEX ON properties_property(property_type);
CREATE INDEX ON properties_property(is_for_sale);
CREATE INDEX ON properties_property(is_for_rent);
```

### **2. Nginx Caching**
```nginx
# Add to nginx config
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## ✅ **Go-Live Checklist**

### **Before Launch:**
- [ ] Domain pointed to server IP
- [ ] SSL certificate installed
- [ ] Database migrated
- [ ] Static files collected
- [ ] Media files uploaded
- [ ] Admin user created
- [ ] Email SMTP configured
- [ ] Backup system setup

### **Post-Launch:**
- [ ] Test all routes (/, /properties, /services, etc.)
- [ ] Verify forms submission
- [ ] Check mobile responsiveness
- [ ] Monitor server resources
- [ ] Setup Google Analytics
- [ ] Configure SEO meta tags

## 🆘 **Support & Maintenance**

### **24/7 Monitoring:**
- Server uptime monitoring
- SSL certificate auto-renewal
- Automated security updates
- Database performance monitoring

### **Monthly Tasks:**
- Security updates
- Database optimization
- Backup verification
- Performance analysis

---

## 💡 **Quick Start Command**

Once you purchase the VPS, send me:
1. **Server IP address**
2. **Root password** 
3. **Domain name** (if you have one)

I'll set up the entire stack for you! 🚀

**Estimated Setup Time:** 2-4 hours for complete deployment

**Expected Performance:** 
- Page load time: 1-3 seconds
- Concurrent users: 500-1000+
- Image loading: Optimized lazy loading
- Database queries: <100ms average