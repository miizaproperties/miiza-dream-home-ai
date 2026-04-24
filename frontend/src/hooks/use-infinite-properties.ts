import { useCallback, useState, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { propertiesApi, type Property, type PaginatedResponse } from '@/services/api';

interface UseInfinitePropertiesProps {
  filters?: Record<string, any>;
  limit?: number;
  enabled?: boolean;
}

interface UseInfinitePropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: Error | null;
  loadMore: () => void;
  refetch: () => void;
  totalCount: number;
  isFetchingNextPage: boolean;
}

export const useInfiniteProperties = ({
  filters = {},
  limit = 20,
  enabled = true
}: UseInfinitePropertiesProps): UseInfinitePropertiesReturn => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<boolean>(false);

  const queryKey = ['properties', 'infinite', filters, limit];

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        ...filters,
        page: pageParam,
        limit,
      };
      return propertiesApi.getAllPaginated(params);
    },
    getNextPageParam: (lastPage: PaginatedResponse<Property>) => {
      if (!lastPage.next) return undefined;
      
      try {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get('page');
        return page ? parseInt(page, 10) : undefined;
      } catch {
        return undefined;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array
  const properties = data?.pages?.flatMap(page => page.results) ?? [];
  const totalCount = data?.pages?.[0]?.count ?? 0;

  const loadMore = useCallback(async () => {
    if (loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;
    
    loadMoreRef.current = true;
    setIsLoadingMore(true);
    
    try {
      await fetchNextPage();
    } finally {
      setIsLoadingMore(false);
      loadMoreRef.current = false;
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Auto-load when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Load more when within 1000px of bottom
      if (scrollHeight - scrollTop - clientHeight < 1000) {
        loadMore();
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 200);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [loadMore, hasNextPage, isFetchingNextPage]);

  return {
    properties,
    isLoading,
    isLoadingMore: isLoadingMore || isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    error: isError ? (error as Error) : null,
    loadMore,
    refetch,
    totalCount,
    isFetchingNextPage,
  };
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(null, args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func.apply(null, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}