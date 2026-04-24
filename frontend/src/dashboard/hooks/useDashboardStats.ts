import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboardApi';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      return await dashboardApi.getStats();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2, // Retry failed requests
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: async () => {
      return await dashboardApi.getAnalytics();
    },
    retry: 2, // Retry failed requests
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      return await dashboardApi.getRecentActivity();
    },
    refetchInterval: 60000, // Refetch every minute
    retry: 2, // Retry failed requests
  });
};

export const useTopPerformers = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-performers'],
    queryFn: async () => {
      return await dashboardApi.getTopPerformers();
    },
    retry: 2, // Retry failed requests
  });
};

