# cPanel Deployment Guide

This guide explains how to deploy your React application to cPanel.

## Step 1: Build Your Application

Before uploading to cPanel, build your production-ready application:

```bash
cd frontend
npm run build
```

This creates a `dist` folder with all the optimized files.

## Step 2: Upload Files to cPanel

1. **Log into cPanel**
2. **Open File Manager**
3. **Navigate to your domain's public_html folder** (or subdomain folder)
4. **Upload the contents of the `dist` folder** (not the folder itself)
   - All files and folders from `dist/` should be in `public_html/`
   - This includes: `index.html`, `assets/` folder, and any other files

## Step 3: Upload .htaccess File

1. **Upload the `.htaccess` file** to the same directory as `index.html` (usually `public_html/`)
2. Make sure the file is named exactly `.htaccess` (with the dot at the beginning)
3. If you can't see hidden files in File Manager, enable "Show Hidden Files" in settings

## Step 4: Set Environment Variables

Since environment variables are embedded at build time, you need to:

1. **Create a `.env` file** in your `frontend/` directory before building:
   ```env
   VITE_API_BASE_URL=https://miiza-dream-home-ai-production.up.railway.app/api
   ```

2. **Rebuild the application**:
   ```bash
   npm run build
   ```

3. **Upload the new build** to cPanel

## Step 5: Verify .htaccess is Working

1. Visit your website: `https://yourdomain.com`
2. Try navigating to a route like: `https://yourdomain.com/properties`
3. The page should load correctly (not show a 404 error)
4. Refresh the page - it should still work (this confirms routing is working)

## Troubleshooting

### Routes Not Working (404 Errors)

- **Check .htaccess is uploaded**: Make sure `.htaccess` is in the same folder as `index.html`
- **Check file permissions**: `.htaccess` should have 644 permissions
- **Check mod_rewrite is enabled**: Contact your hosting provider if routes still don't work
- **Check RewriteBase**: If your site is in a subdirectory, update `RewriteBase /` to `RewriteBase /subdirectory/`

### API Calls Not Working

- **Check environment variables**: Make sure `VITE_API_BASE_URL` is set correctly before building
- **Check CORS**: Your backend must allow requests from your domain
- **Check API URL**: Verify the production API URL is correct

### Force HTTPS

If you have an SSL certificate, uncomment the HTTPS redirect section in `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

## File Structure in cPanel

After deployment, your `public_html/` should look like:

```
public_html/
├── .htaccess
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── logo.png
├── robots.txt
└── ... (other static files)
```

## Important Notes

1. **Build before upload**: Always run `npm run build` before uploading
2. **Environment variables**: Set them before building, not after
3. **.htaccess location**: Must be in the same directory as `index.html`
4. **API proxy**: If your backend is on a different domain, make sure CORS is configured correctly
5. **Cache clearing**: After updates, users may need to clear browser cache or do a hard refresh (Ctrl+F5)

