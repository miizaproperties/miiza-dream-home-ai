# Performance Optimization Guide

## Image Optimization
- Use the `OptimizedImage` component for all images
- Images are lazy-loaded by default unless `priority={true}`
- Responsive images with automatic srcset generation
- Blur placeholder support for better UX

## Code Splitting
- All routes are lazy-loaded with React.lazy()
- Components are split into logical chunks
- Manual chunk splitting for vendor libraries

## Caching Strategy
- Service Worker with Workbox for offline support
- Images cached for 30 days (CacheFirst strategy)
- Static resources cached with StaleWhileRevalidate
- PWA manifest for better mobile experience

## Bundle Optimization
- Terser minification in production
- Console logs removed in production builds
- Tree shaking enabled
- Dependency optimization configured

## Build Performance
- Vite's optimized dev server
- Fast HMR with SWC compiler
- Pre-bundling of dependencies
- Efficient source maps

## Monitoring
- Use browser DevTools Performance tab
- Monitor bundle size with `npm run build -- --analyze`
- Check Lighthouse scores regularly
- Monitor Core Web Vitals

## Best Practices
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Debounce search and filter inputs
- Use CSS containment where appropriate
- Minimize re-renders with proper key props
