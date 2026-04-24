# Fix for DisallowedHost Error

## The Problem.

You're seeing this error:
```
DisallowedHost at /api/dashboard/testimonials/public/
```

This means Django is rejecting requests because the `Host` header doesn't match `ALLOWED_HOSTS`.

## The Solution

Add the Railway domain to `ALLOWED_HOSTS` in your Railway environment variables.

### Step-by-Step Fix:

1. **Go to Railway Dashboard**
   - Navigate to your backend service
   - Click on the "Variables" tab

2. **Add/Update ALLOWED_HOSTS**
   - Look for `ALLOWED_HOSTS` variable
   - If it doesn't exist, click "New Variable"
   - Set the value to:
     ```
     miiza-dream-home-ai-production.up.railway.app
     ```
   - If you have a custom domain, add it too (comma-separated):
     ```
     miiza-dream-home-ai-production.up.railway.app,yourdomain.com
     ```

3. **Also Add CORS Configuration** (if not already set)
   - Add `CORS_ALLOWED_ORIGINS` variable
   - Set it to your frontend domain(s):
     ```
     https://your-frontend-domain.com,https://www.your-frontend-domain.com
     ```
   - Replace with your actual frontend domain

4. **Add CSRF Configuration** (if not already set)
   - Add `CSRF_TRUSTED_ORIGINS` variable
   - Set it to your frontend domain(s):
     ```
     https://your-frontend-domain.com,https://www.your-frontend-domain.com
     ```


,
5. **Redeploy**
   - After adding/updating variables, Railway will automatically redeploy
   - Or manually trigger a redeploy if needed

## Quick Copy-Paste for Railway Variables

Add these environment variables in Railway:

```env
ALLOWED_HOSTS=miiza-dream-home-ai-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com
DEBUG=False
```

**Important:** Replace `your-frontend-domain.com` with your actual frontend domain (where your React app is hosted).

## Verify the Fix

After redeploying, test the API:

```bash
curl https://miiza-dream-home-ai-production.up.railway.app/api/properties/
```

You should get JSON response, not HTML error page.

## If You Still Get Errors

1. **Check Railway Logs**
   - Go to Railway dashboard → Your service → Deployments → View logs
   - Look for any Django errors

2. **Verify Environment Variables**
   - Make sure variables are set correctly
   - No extra spaces or quotes
   - Comma-separated for multiple values

3. **Check Domain Format**
   - No `http://` or `https://` in `ALLOWED_HOSTS`
   - Just the domain: `miiza-dream-home-ai-production.up.railway.app`

4. **Wait for Redeploy**
   - Changes take a few minutes to apply
   - Check deployment status in Railway


