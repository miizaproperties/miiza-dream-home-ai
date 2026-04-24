# Bunny CDN Integration Guide for Miiza Realtors

## 🚀 Why Use Bunny CDN?

- **Global Performance**: Reduce load times by 60-80%
- **Cost Effective**: Much cheaper than CloudFront/CloudFlare
- **Image Optimization**: Automatic WebP conversion, resizing
- **Media Storage**: Efficient storage for property images/videos
- **Security**: DDoS protection and edge security

## 📋 Setup Instructions

### 1. Create Bunny CDN Account
- Sign up at https://bunny.net
- Create a Pull Zone for your website
- Create a Storage Zone for media files

### 2. Pull Zone Configuration
```
Zone Name: miiza-main
Origin URL: https://miizarealtors.com
Custom Hostname: cdn.miizarealtors.com
```

### 3. Storage Zone Configuration  
```
Zone Name: miiza-media
Region: Europe (closest to Kenya)
Usage: Property images, event thumbnails, documents
```

### 4. DNS Configuration
Add CNAME record in your domain:
```
cdn.miizarealtors.com → miiza-main.b-cdn.net
media.miizarealtors.com → miiza-media.b-cdn.net
```

### 5. Django Settings Update

Add to `backend/config/settings.py`:

```python
# Bunny CDN Configuration
BUNNY_CDN_ENABLED = True
BUNNY_CDN_ZONE_URL = 'https://cdn.miizarealtors.com'
BUNNY_STORAGE_ZONE_NAME = 'miiza-media'
BUNNY_STORAGE_PASSWORD = 'your-storage-password'
BUNNY_STORAGE_REGION = 'de'  # Europe region

# Media URLs with CDN
if BUNNY_CDN_ENABLED:
    MEDIA_URL = 'https://media.miizarealtors.com/'
    STATIC_URL = 'https://cdn.miizarealtors.com/static/'
else:
    MEDIA_URL = '/media/'
    STATIC_URL = '/static/'
```

### 6. Image Optimization Middleware

Create `backend/config/bunny_storage.py`:

```python
from django.core.files.storage import Storage
import requests

class BunnyStorage(Storage):
    def __init__(self):
        self.zone_name = settings.BUNNY_STORAGE_ZONE_NAME
        self.password = settings.BUNNY_STORAGE_PASSWORD
        self.region = settings.BUNNY_STORAGE_REGION
        
    def _save(self, name, content):
        # Upload to Bunny Storage
        url = f"https://{self.region}.storage.bunnycdn.com/{self.zone_name}/{name}"
        headers = {
            'AccessKey': self.password,
            'Content-Type': content.content_type
        }
        
        response = requests.put(url, headers=headers, data=content.read())
        if response.status_code == 201:
            return name
        raise Exception(f"Upload failed: {response.status_code}")
    
    def url(self, name):
        return f"https://media.miizarealtors.com/{name}"
```

### 7. Frontend Configuration

Update `frontend/src/config/api.ts`:

```typescript
// CDN Configuration
export const CDN_CONFIG = {
  enabled: true,
  staticUrl: 'https://cdn.miizarealtors.com',
  mediaUrl: 'https://media.miizarealtors.com',
  imageTransforms: {
    thumbnail: '?width=300&height=200&format=webp',
    medium: '?width=800&height=600&format=webp', 
    large: '?width=1200&height=900&format=webp',
    hero: '?width=1920&height=1080&format=webp'
  }
};

// Image URL helper with CDN
export const getOptimizedImageUrl = (
  originalUrl: string, 
  size: 'thumbnail' | 'medium' | 'large' | 'hero' = 'medium'
): string => {
  if (!CDN_CONFIG.enabled || !originalUrl) return originalUrl;
  
  const transform = CDN_CONFIG.imageTransforms[size];
  return originalUrl.includes('http') 
    ? `${originalUrl}${transform}`
    : `${CDN_CONFIG.mediaUrl}${originalUrl}${transform}`;
};
```

### 8. Update Property Components

Update `frontend/src/components/PropertyCard.tsx`:

```typescript
import { getOptimizedImageUrl } from '@/config/api';

// In component:
const thumbnailUrl = getOptimizedImageUrl(property.main_image, 'thumbnail');
const heroUrl = getOptimizedImageUrl(property.main_image, 'hero');

<img 
  src={thumbnailUrl}
  alt={property.title}
  className="w-full h-48 object-cover"
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = '/placeholder.svg';
  }}
/>
```

## 🎯 Performance Benefits

### Before CDN:
- Images: 2-5MB each
- Load Time: 8-12 seconds  
- Server Bandwidth: High cost
- Global Speed: Slow from Kenya server

### After Bunny CDN:
- Images: 200-500KB (WebP)
- Load Time: 2-4 seconds
- Server Bandwidth: 80% reduction
- Global Speed: Fast worldwide

## 💰 Cost Comparison

**Current (Direct serving):**
- Bandwidth: $50-100/month
- Storage: $20/month
- Total: $70-120/month

**With Bunny CDN:**
- CDN Bandwidth: $1-5/month
- Storage: $10/month
- Total: $11-15/month
- **Savings: 80-90%**

## 🔧 Migration Plan

1. **Phase 1**: Set up CDN for static files (CSS, JS)
2. **Phase 2**: Migrate existing images to Bunny Storage
3. **Phase 3**: Update all image references
4. **Phase 4**: Enable automatic image optimization

## 📊 Monitoring

Track performance with:
- Google PageSpeed Insights
- Bunny CDN Analytics
- Django logging for CDN requests

## 🚀 Ready to Implement?

Send me your Bunny CDN credentials and I'll help you set it up!

**Next Steps:**
1. Create Bunny CDN account
2. Get zone credentials  
3. Share access details
4. I'll implement the integration