# Backend Production Setup Guide

This guide explains how to configure your Django backend for production deployment on Railway.

## Required Environment Variables

Set these environment variables in your Railway project settings:

### 1. Basic Django Settings

```env
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=miiza-dream-home-ai-production.up.railway.app,yourdomain.com
```

**Important:** 
- Replace `yourdomain.com` with your actual frontend domain
- Never commit `SECRET_KEY` to version control
- Set `DEBUG=False` in production

### 2. CORS Configuration

Add your frontend domain(s) to CORS allowed origins:

```env
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Example:**
```env
CORS_ALLOWED_ORIGINS=https://miizarealtors.com,https://www.miizarealtors.com
```

### 3. CSRF Trusted Origins

Add your frontend domain(s) to CSRF trusted origins:

```env
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Example:**
```env
CSRF_TRUSTED_ORIGINS=https://miizarealtors.com,https://www.miizarealtors.com
```

### 4. Database Configuration

Railway automatically provides `DATABASE_URL`. Make sure it's set in your Railway environment variables.

### 5. Complete Example for Railway

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=miiza-dream-home-ai-production.up.railway.app,yourdomain.com

# CORS - Add your frontend domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# CSRF - Add your frontend domain
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database (usually auto-provided by Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# Firebase (if using)
FIREBASE_STORAGE_BUCKET=your-bucket-name
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## How to Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the "Variables" tab
4. Click "New Variable"
5. Add each environment variable with its value
6. Click "Deploy" to apply changes

## Troubleshooting 400 Bad Request Errors

If you're getting 400 Bad Request errors with HTML responses:

### 1. Check ALLOWED_HOSTS

Make sure your Railway domain is in `ALLOWED_HOSTS`:
```env
ALLOWED_HOSTS=miiza-dream-home-ai-production.up.railway.app
```

### 2. Check CORS Configuration

Make sure your frontend domain is in `CORS_ALLOWED_ORIGINS`:
```env
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 3. Check CSRF Configuration

Make sure your frontend domain is in `CSRF_TRUSTED_ORIGINS`:
```env
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

### 4. Verify Backend is Running

Test your backend directly:
```bash
curl https://miiza-dream-home-ai-production.up.railway.app/api/properties/
```

You should get a JSON response, not HTML.

### 5. Check Railway Logs

In Railway dashboard, check the logs for any Django errors or warnings.

## Testing the Configuration

1. **Test CORS:**
   ```bash
   curl -H "Origin: https://yourdomain.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://miiza-dream-home-ai-production.up.railway.app/api/properties/
   ```

2. **Test API Endpoint:**
   ```bash
   curl https://miiza-dream-home-ai-production.up.railway.app/api/properties/
   ```

3. **Test from Frontend:**
   - Open browser console
   - Check Network tab
   - Look for CORS errors or 400 errors
   - Verify response is JSON, not HTML

## Common Issues

### Issue: 400 Bad Request with HTML Response

**Cause:** Backend is rejecting the request (ALLOWED_HOSTS, CORS, or routing issue)

**Solution:**
1. Verify `ALLOWED_HOSTS` includes Railway domain
2. Verify `CORS_ALLOWED_ORIGINS` includes frontend domain
3. Check Railway logs for specific error messages

### Issue: CORS Error in Browser

**Cause:** Frontend domain not in `CORS_ALLOWED_ORIGINS`

**Solution:**
1. Add frontend domain to `CORS_ALLOWED_ORIGINS` environment variable
2. Redeploy backend
3. Clear browser cache

### Issue: CSRF Token Error

**Cause:** Frontend domain not in `CSRF_TRUSTED_ORIGINS`

**Solution:**
1. Add frontend domain to `CSRF_TRUSTED_ORIGINS` environment variable
2. Redeploy backend

### Issue: Static Files Not Loading (404 Errors, MIME Type Errors)

**Cause:** Static files not collected or not being served properly in production

**Solution:**
1. WhiteNoise is now configured in `settings.py` to serve static files
2. Railway should automatically run `collectstatic` during deployment
3. If static files still don't load, manually run collectstatic:
   ```bash
   python manage.py collectstatic --noinput
   ```
4. Verify `STATIC_ROOT` is set correctly in settings (should be `staticfiles/`)
5. Check that WhiteNoise middleware is in `MIDDLEWARE` (after SecurityMiddleware)

## Static Files Configuration

This project uses **WhiteNoise** to serve static files in production. WhiteNoise is automatically configured in `settings.py`:

- **Middleware:** `whitenoise.middleware.WhiteNoiseMiddleware` (added after SecurityMiddleware)
- **Storage:** `whitenoise.storage.CompressedManifestStaticFilesStorage`
- **Static Root:** `staticfiles/` directory

Railway will automatically run `collectstatic` during deployment. If you need to manually collect static files:

```bash
python manage.py collectstatic --noinput
```

## Security Notes

1. **Never set `DEBUG=True` in production**
2. **Use a strong `SECRET_KEY`** (generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
3. **Only allow trusted domains in CORS and CSRF settings**
4. **Use HTTPS in production** (Railway provides this automatically)

