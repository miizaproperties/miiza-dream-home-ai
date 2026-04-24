import { useQueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Custom hook to manage featured properties cache
 * Provides methods to invalidate and refresh featured properties cache
 */
export const useFeaturedProperties = () => {
  const queryClient = useQueryClient();

  const invalidateFeaturedProperties = () => {
    // Invalidate all featured properties related queries
    queryClient.invalidateQueries({ queryKey: ['featured', 'properties'] });
    queryClient.invalidateQueries({ queryKey: ['properties', 'featured'] });
    
    // Also invalidate general properties queries as they might be affected
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  const refetchFeaturedProperties = () => {
    // Refetch featured properties specifically
    queryClient.refetchQueries({ queryKey: ['featured', 'properties'] });
    queryClient.refetchQueries({ queryKey: ['properties', 'featured'] });
  };

  return {
    invalidateFeaturedProperties,
    refetchFeaturedProperties,
  };
};
