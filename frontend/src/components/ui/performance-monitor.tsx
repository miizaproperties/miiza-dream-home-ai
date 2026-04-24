import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const ttfb = navigation.responseStart - navigation.requestStart;

      // First Contentful Paint
      const fcpEntries = performance.getEntriesByName('first-contentful-paint');
      const fcp = fcpEntries.length > 0 ? fcpEntries[0].startTime : null;

      // Largest Contentful Paint (needs observer)
      let lcp = null;
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry.startTime;
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.log('LCP not supported');
        }
      }

      // Cumulative Layout Shift
      let cls = 0;
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.log('CLS not supported');
        }
      }

      setMetrics({
        fcp: fcp ? Math.round(fcp) : null,
        lcp: lcp ? Math.round(lcp) : null,
        fid: null, // Requires user interaction
        cls: cls ? Math.round(cls * 1000) / 1000 : null,
        ttfb: Math.round(ttfb),
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      setTimeout(measurePerformance, 0);
    } else {
      window.addEventListener('load', () => {
        setTimeout(measurePerformance, 0);
      });
    }

    // Toggle visibility with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible || process.env.NODE_ENV === 'production') return null;

  const getMetricColor = (value: number | null, good: number, needsImprovement: number) => {
    if (value === null) return 'text-gray-500';
    if (value <= good) return 'text-green-600';
    if (value <= needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg z-50 font-mono text-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={getMetricColor(metrics.fcp, 1800, 3000)}>
            {metrics.fcp ? `${metrics.fcp}ms` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={getMetricColor(metrics.lcp, 2500, 4000)}>
            {metrics.lcp ? `${metrics.lcp}ms` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={getMetricColor(metrics.cls, 0.1, 0.25)}>
            {metrics.cls !== null ? metrics.cls.toFixed(3) : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={getMetricColor(metrics.ttfb, 800, 1800)}>
            {metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;
