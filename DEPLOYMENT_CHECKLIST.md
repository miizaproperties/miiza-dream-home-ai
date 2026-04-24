# 🚀 Miiza Dream Home AI - Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Domain & DNS Setup
- [ ] Domain purchased and configured
- [ ] DNS A record pointing to Hetzner VPS IP
- [ ] SSL certificate ready (Let's Encrypt via Certbot)

### 2. Server Requirements Met
- [ ] Ubuntu 20.04+ server
- [ ] Minimum 2GB RAM, 1 CPU, 20GB disk space
- [ ] Root/sudo access

### 3. Application Configuration
- [ ] Update `.env.production` with your domain
- [ ] Update `production.py` with your database credentials
- [ ] Replace all `your-domain.com` placeholders
- [ ] Generate secure Django secret key

## 🔧 Quick Setup Commands

### Step 1: Initial Server Setup
```bash
# Run as root user first
apt update && apt upgrade -y
apt install -y nginx postgresql postgresql-contrib python3 python3-pip python3-venv nodejs npm git curl supervisor certbot python3-certbot-nginx

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

### Step 2: Create Application User
```bash
# Create miiza user
useradd -m -s /bin/bash miiza
usermod -aG www-data miiza
mkdir -p /var/www/miiza
chown -R miiza:www-data /var/www/miiza
```

### Step 3: Deploy Application
```bash
# Switch to miiza user
su - miiza
cd /var/www/miiza

# Clone your repository
git clone https://github.com/your-username/miiza-dream-home-ai.git .

# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

## 🗄️ Database Setup
```bash
# As postgres user
su - postgres
createdb miiza_db
createuser -P miiza_user  # Enter password when prompted
psql
GRANT ALL PRIVILEGES ON DATABASE miiza_db TO miiza_user;
ALTER USER miiza_user CREATEDB;
\q
```

## 🔐 Security Configuration

### Environment Variables
Create `/etc/miiza/environment`:
```bash
DJANGO_SETTINGS_MODULE=config.production
DJANGO_SECRET_KEY=your-very-secure-secret-key-here
```

### SSL Certificate
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🎯 Files to Update

### 1. Backend Production Settings
File: `backend/config/production.py`
- Update `ALLOWED_HOSTS` with your domain
- Set secure database credentials
- Configure CORS for your domain

### 2. Frontend Environment
File: `frontend/.env.production`
- Replace `your-domain.com` with actual domain
- Ensure API URLs match your setup

### 3. Nginx Configuration
File: `/etc/nginx/sites-available/miiza`
- Replace all `your-domain.com` with your actual domain
- Update SSL certificate paths if needed

### 4. Systemd Service
File: `/etc/systemd/system/miiza-gunicorn.service`
- Verify paths and user settings
- Check environment file path

## 🔍 Testing & Verification

### After Deployment
```bash
# Check services
systemctl status miiza-gunicorn
systemctl status nginx

# Test API endpoints
curl https://your-domain.com/api/properties/
curl https://your-domain.com/api/properties/featured/

# Check logs
journalctl -u miiza-gunicorn -f
tail -f /var/log/nginx/error.log
```

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] Properties display with images
- [ ] Navigation works
- [ ] Contact form submits
- [ ] Admin dashboard accessible

### Backend Tests
- [ ] Django admin accessible
- [ ] API endpoints respond
- [ ] Database queries work
- [ ] Media files serve correctly
- [ ] CORS configured properly

## 🔧 Common Issues & Solutions

### 1. Images Not Loading
**Problem**: Broken image icons in dashboard/frontend
**Solution**: 
- Check `MEDIA_URL` and `MEDIA_ROOT` settings
- Verify nginx media location configuration
- Ensure proper file permissions (755 for directories, 644 for files)

### 2. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**:
- Add your domain to `CORS_ALLOWED_ORIGINS`
- Check nginx proxy headers
- Verify API URLs in frontend config

### 3. Database Connection Failed
**Problem**: Django can't connect to PostgreSQL
**Solution**:
- Check database credentials in `production.py`
- Verify PostgreSQL is running
- Test connection manually

### 4. Gunicorn Won't Start
**Problem**: Django application doesn't start
**Solution**:
- Check syntax errors: `python manage.py check`
- Verify environment variables
- Check file permissions

## 📊 Performance Optimization

### Frontend
```bash
# Optimize build
cd frontend
npm run build
# Verify gzip compression in nginx config
```

### Backend
```bash
# Collect and compress static files
cd backend
python manage.py collectstatic --noinput
```

## 🔄 Maintenance Tasks

### Daily
- Monitor server resources
- Check error logs
- Verify backup completion

### Weekly
- Update system packages
- Review security logs
- Test backup restoration

### Monthly
- Update application dependencies
- Review SSL certificate expiry
- Performance optimization

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
# If something goes wrong
cd /var/www/miiza
git log --oneline  # Find last working commit
git reset --hard <commit-hash>
./deploy.sh
```

### Service Recovery
```bash
# Restart all services
systemctl restart miiza-gunicorn
systemctl restart nginx
systemctl restart postgresql
```

### Database Restore
```bash
# Restore from backup
pg_restore -U miiza_user -d miiza_db backup_file.sql
```

## 📝 Final Verification

After completing deployment, test these URLs:

- [ ] `https://your-domain.com` - Homepage loads
- [ ] `https://your-domain.com/properties` - Properties page works
- [ ] `https://your-domain.com/admin` - Django admin accessible
- [ ] `https://your-domain.com/api/properties/` - API responds
- [ ] `https://your-domain.com/media/` - Media files accessible

## 🎉 Post-Deployment

1. **Create superuser**: `python manage.py createsuperuser`
2. **Upload some test properties** via admin
3. **Test all functionality** thoroughly
4. **Set up monitoring** and alerts
5. **Configure automated backups**

---

**Need Help?** Check logs and service status:
```bash
# View application logs
sudo journalctl -u miiza-gunicorn -n 50

# Check nginx logs  
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
python manage.py check
```