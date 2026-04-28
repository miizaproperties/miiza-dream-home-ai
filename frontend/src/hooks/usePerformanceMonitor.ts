import { useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

/**
 * Hook to monitor Core Web Vitals and performance metrics
 * Useful for tracking image optimization improvements
 */
export const usePerformanceMonitor = (enabled: boolean = false) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const metrics: PerformanceMetrics = {};

    // Measure LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
      metrics.lcp = lastEntry.startTime;
      
      console.log('🎯 LCP:', metrics.lcp.toFixed(2) + 'ms');
    });

    // Measure FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          console.log('🎨 FCP:', metrics.fcp.toFixed(2) + 'ms');
        }
      }
    });

    // Measure CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      metrics.cls = clsValue;
      console.log('📐 CLS:', metrics.cls.toFixed(4));
    });

    // Measure TTFB (Time to First Byte)
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      metrics.ttfb = nav.responseStart - nav.requestStart;
      console.log('⚡ TTFB:', metrics.ttfb.toFixed(2) + 'ms');
    }

    // Start observing
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      fcpObserver.observe({ entryTypes: ['paint'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Performance Observer not supported:', e);
    }

    // Performance summary after page load
    const reportPerformance = () => {
      console.group('📊 Performance Metrics Summary');
      console.log('TTFB:', metrics.ttfb?.toFixed(2) + 'ms');
      console.log('FCP:', metrics.fcp?.toFixed(2) + 'ms');
      console.log('LCP:', metrics.lcp?.toFixed(2) + 'ms');
      console.log('CLS:', metrics.cls?.toFixed(4));
      
      // Performance assessment
      const assessment = getPerformanceAssessment(metrics);
      console.log('Overall:', assessment.overall);
      console.log('Image Loading:', assessment.imageLoading);
      console.groupEnd();
    };

    // Report after 5 seconds to capture most metrics
    const timeoutId = setTimeout(reportPerformance, 5000);

    return () => {
      observer.disconnect();
      fcpObserver.disconnect();
      clsObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [enabled]);
};

/**
 * Assess performance metrics and provide recommendations
 */
const getPerformanceAssessment = (metrics: PerformanceMetrics) => {
  const assessment = {
    overall: 'Good',
    imageLoading: 'Good',
    recommendations: [] as string[]
  };

  // Assess LCP (should be < 2.5s for good)
  if (metrics.lcp && metrics.lcp > 4000) {
    assessment.overall = 'Poor';
    assessment.imageLoading = 'Poor';
    assessment.recommendations.push('Optimize image sizes and enable CDN');
  } else if (metrics.lcp && metrics.lcp > 2500) {
    assessment.overall = 'Needs Improvement';
    assessment.imageLoading = 'Needs Improvement';
    assessment.recommendations.push('Consider image preloading for above-fold content');
  }

  // Assess CLS (should be < 0.1 for good)
  if (metrics.cls && metrics.cls > 0.25) {
    assessment.overall = 'Poor';
    assessment.recommendations.push('Add explicit dimensions to images');
  } else if (metrics.cls && metrics.cls > 0.1) {
    assessment.overall = 'Needs Improvement';
    assessment.recommendations.push('Improve layout stability');
  }

  // Assess TTFB (should be < 200ms for good)
  if (metrics.ttfb && metrics.ttfb > 600) {
    assessment.overall = 'Poor';
    assessment.recommendations.push('Optimize server response time');
  }

  return assessment;
};