/**
 * SEO utility functions for dynamic meta tag management
 */

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

/**
 * Update document title and meta tags
 */
export const updateSEO = (data: SEOData) => {
  const {
    title,
    description,
    keywords,
    image = 'https://miizarealtors.com/logo.png',
    url = typeof window !== 'undefined' ? window.location.href : 'https://miizarealtors.com',
    type = 'website',
    noindex = false
  } = data;

  // Update title
  if (title) {
    document.title = title;
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('name', 'twitter:title', title);
  }

  // Update description
  if (description) {
    updateMetaTag('name', 'description', description);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('name', 'twitter:description', description);
  }

  // Update keywords
  if (keywords) {
    updateMetaTag('name', 'keywords', keywords);
  }

  // Update image
  updateMetaTag('property', 'og:image', image);
  updateMetaTag('name', 'twitter:image', image);

  // Update URL
  updateMetaTag('property', 'og:url', url);

  // Update type
  updateMetaTag('property', 'og:type', type);

  // Update robots
  if (noindex) {
    updateMetaTag('name', 'robots', 'noindex, nofollow');
  } else {
    updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }

  // Update canonical URL
  updateCanonical(url);
};

/**
 * Update or create a meta tag
 */
const updateMetaTag = (attribute: 'name' | 'property', name: string, content: string) => {
  if (typeof document === 'undefined') return;

  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
};

/**
 * Update canonical URL
 */
const updateCanonical = (url: string) => {
  if (typeof document === 'undefined') return;

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  
  canonical.setAttribute('href', url);
};

/**
 * Generate structured data for a property
 */
export const generatePropertyStructuredData = (property: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description || property.title,
    "url": `https://miizarealtors.com/property/${property.id}`,
    "image": property.main_image || property.image || "https://miizarealtors.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address || "",
      "addressLocality": property.city || "Nairobi",
      "addressRegion": property.state || "Nairobi County",
      "addressCountry": property.country || "KE"
    },
    "numberOfRooms": property.bedrooms || 0,
    "numberOfBathroomsTotal": property.bathrooms || 0,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.square_feet || property.area || "",
      "unitCode": "SQM"
    },
    "price": property.price || property.display_price || "",
    "priceCurrency": property.currency || "KSH"
  };
};

/**
 * Generate structured data for an article
 */
export const generateArticleStructuredData = (article: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.content?.substring(0, 200) || "",
    "image": article.featured_image || article.thumbnail || "https://miizarealtors.com/logo.png",
    "datePublished": article.created_at || article.published_at || new Date().toISOString(),
    "dateModified": article.updated_at || article.created_at || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author || "MiiZA Realtors"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MiiZA Realtors Limited",
      "logo": {
        "@type": "ImageObject",
        "url": "https://miizarealtors.com/logo.png"
      }
    }
  };
};

/**
 * Inject structured data into the page
 */
export const injectStructuredData = (data: object) => {
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  script.id = 'structured-data';
  
  // Remove existing structured data if any
  const existing = document.getElementById('structured-data');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(script);
};

