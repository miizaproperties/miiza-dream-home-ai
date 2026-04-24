import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash';

// Debounced search hook
export function useDebouncedSearch<T>(
  searchFn: (query: string) => T,
  delay: number = 300
) {
  const debouncedSearch = useMemo(
    () => debounce(searchFn, delay),
    [searchFn, delay]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return debouncedSearch;
}

// Throttled scroll hook
export function useThrottledScroll<T>(
  scrollFn: (event: Event) => T,
  delay: number = 100
) {
  const throttledScroll = useMemo(
    () => throttle(scrollFn, delay),
    [scrollFn, delay]
  );

  useEffect(() => {
    return () => {
      throttledScroll.cancel();
    };
  }, [throttledScroll]);

  return throttledScroll;
}

// Memoized list filter hook
export function useFilteredItems<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
) {
  return useMemo(() => {
    return items.filter(filterFn);
  }, [items, filterFn, ...dependencies]);
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

// Performance monitoring hook
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>();

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      startTime.current = undefined;
    }
  }, [name]);

  return { start, end };
}

// Memoized component wrapper
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, areEqual);
}
