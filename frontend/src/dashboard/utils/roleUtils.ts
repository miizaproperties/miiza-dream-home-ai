import { User } from '../hooks/useAuth';

/**
 * Get the appropriate dashboard route based on user role
 */
export const getDashboardRoute = (user: User | null): string => {
  if (!user) {
    return '/admin/login';
  }

  // If user is an agent (and not superuser), redirect to agent dashboard
  if (user.is_agent && !user.is_superuser) {
    return '/admin/agent';
  }

  // Only superusers can access the admin dashboard
  if (user.is_superuser) {
    return '/admin';
  }

  // For agents (non-superuser), go to agent dashboard
  if (user.is_agent) {
    return '/admin/agent';
  }

  // Default to login if no valid role
  return '/admin/login';
};

/**
 * Check if user has admin privileges (superuser only)
 * Admin dashboard is only accessible to superusers
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.is_superuser === true;
};

/**
 * Check if user is an agent only (not admin)
 */
export const isAgentOnly = (user: User | null): boolean => {
  return user?.is_agent === true && !isAdmin(user);
};

