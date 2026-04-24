import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Login } from '../pages/Login';
import { getDashboardRoute, isAgentOnly } from '../utils/roleUtils';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    } else if (!isLoading && isAuthenticated && user?.must_change_password) {
      // If password change is required and not already on change password page, redirect
      if (location.pathname !== '/admin/change-password') {
        navigate('/admin/change-password');
      }
    } else if (!isLoading && isAuthenticated && !user?.must_change_password) {
      // Routes that agents can access
      const agentAllowedRoutes = [
        '/admin/agent',
        '/admin/properties',
        '/admin/viewings',
        '/admin/contacts',
      ];
      
      // Check if the current route is an agent-allowed route
      const isAgentAllowedRoute = agentAllowedRoutes.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
      );
      
      // Admin-only routes (superusers only)
      const adminOnlyRoutes = [
        '/admin/analytics',
        '/admin/users',
        '/admin/agents',
        '/admin/careers',
        '/admin/articles',
        '/admin/legal',
        '/admin/announcements',
        '/admin/testimonials',
        '/admin/events',
        '/admin/pages',
      ];
      
      const isAdminOnlyRoute = adminOnlyRoutes.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
      );
      
      // If user is an agent-only (not superuser)
      if (isAgentOnly(user)) {
        // If agent tries to access admin dashboard root, redirect to agent dashboard
        if (location.pathname === '/admin') {
          navigate('/admin/agent', { replace: true });
        }
        // If agent tries to access admin-only routes, redirect to agent dashboard
        else if (isAdminOnlyRoute) {
          navigate('/admin/agent', { replace: true });
        }
        // Allow agents to access agent-allowed routes (no redirect needed)
      }
      // If user is a superuser
      else if (user?.is_superuser) {
        // If superuser tries to access agent dashboard, redirect to admin dashboard
        if (location.pathname === '/admin/agent') {
          navigate('/admin', { replace: true });
        }
      }
      // If user is neither agent nor superuser, redirect to login
      else if (!user?.is_agent && !user?.is_superuser) {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // If password change is required and not on change password page, show loading while redirecting
  if (user?.must_change_password && location.pathname !== '/admin/change-password') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

