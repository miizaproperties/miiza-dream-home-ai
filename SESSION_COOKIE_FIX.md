# Session Cookie 403 Error Fix

## Problem
After successful login, subsequent API requests return `403 Forbidden` with "Authentication credentials were not provided". This indicates the session cookie isn't being sent with requests.

## Root Cause
Cross-origin cookie issues between:
- Frontend: `https://miizarealtors.com`
- Backend: `https://miiza-dream-home-ai-production.up.railway.app`

## Solution Applied

### 1. Updated Cookie Settings (`backend/config/settings.py`)
- Explicitly set `SESSION_COOKIE_DOMAIN = None` (don't restrict domain)
- Ensured `SESSION_COOKIE_SAMESITE = 'None'` in production
- Ensured `SESSION_COOKIE_SECURE = True` in production (HTTPS only)
- Same settings for CSRF cookies

### 2. Enhanced Login Function (`backend/dashboard/views.py`)
- Added explicit session save after login
- Ensured CORS credentials header is set

## Additional Checks Needed in Production

### 1. Verify Environment Variables on Railway

Make sure these are set in your Railway environment:

```env
DEBUG=False
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_SAMESITE=None
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_SAMESITE=None
CORS_ALLOW_CREDENTIALS=True
```

### 2. Verify CORS Configuration

Ensure `https://miizarealtors.com` is in `CORS_ALLOWED_ORIGINS`:

```env
CORS_ALLOWED_ORIGINS=https://miizarealtors.com,https://www.miizarealtors.com
```

### 3. Check Railway Proxy Settings

Railway might have a proxy that strips cookies. Check:
- Railway dashboard → Settings → Environment variables
- Ensure no proxy is modifying cookie headers

### 4. Browser Developer Tools Check

1. Open browser DevTools → Network tab
2. Try logging in
3. Check the login response headers:
   - Should see `Set-Cookie: sessionid=...`
   - Cookie should have `Secure; SameSite=None`
4. Check subsequent requests:
   - Should see `Cookie: sessionid=...` in request headers
   - If not, the cookie isn't being sent

### 5. Test Cookie Settings

Run this in browser console after login:

```javascript
// Check if cookies are set
document.cookie

// Should see sessionid cookie
// If not, cookies aren't being set
```

## Alternative Solution: Use Token-Based Auth

If cookies continue to fail, consider switching to token-based authentication (JWT) instead of session-based auth. This avoids cross-origin cookie issues entirely.

## Testing Steps

1. **Clear browser cookies** for both domains
2. **Login** at `https://miizarealtors.com/admin/login`
3. **Check Network tab**:
   - Login request should return `Set-Cookie` header
   - Subsequent requests should include `Cookie` header
4. **If cookies aren't being sent**:
   - Check browser console for CORS errors
   - Verify Railway environment variables
   - Check Railway logs for cookie-related errors

## Files Modified

- `backend/config/settings.py` - Cookie domain settings
- `backend/dashboard/views.py` - Explicit session save

## Next Steps

1. Deploy the updated code to Railway
2. Verify environment variables are set correctly
3. Test login and check if cookies are being set/sent
4. If still failing, check Railway logs for errors
5. Consider switching to JWT tokens if cookies continue to fail

