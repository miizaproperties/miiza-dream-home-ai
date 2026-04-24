import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats, useRecentActivity } from '../hooks/useDashboardStats';
import { StatCard } from '../components/StatCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { useAuth } from '../hooks/useAuth';
import { isAgentOnly } from '../utils/roleUtils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

  // Redirect agents to their specific dashboard
  useEffect(() => {
    if (user && isAgentOnly(user)) {
      navigate('/admin/agent', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 min-h-full">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-2 lg:mb-3 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm sm:text-base lg:text-lg">Welcome back! Here's an overview of your operations.</p>
      </div>

      {error && (
        <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            Unable to load some dashboard data. Please refresh the page or check your connection.
          </p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        <StatCard
          title="Total Properties"
          value={stats?.properties.total || 0}
          subtitle={`${stats?.properties.available || 0} available for viewing`}
          trend={{
            value: stats?.properties.growth_percentage || 0,
            isPositive: (stats?.properties.growth_percentage || 0) > 0,
          }}
        />
        
        <StatCard
          title="Featured Properties"
          value={stats?.properties.featured || 0}
          subtitle="Highlighted listings"
        />
        
        <StatCard
          title="Total Contacts"
          value={stats?.contacts.total || 0}
          subtitle={`${stats?.contacts.pending_viewings || 0} pending viewings`}
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`KSh ${(stats?.revenue.monthly_rentals || 0).toLocaleString()}`}
          subtitle="Rental income this month"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <StatCard
          title="Properties This Month"
          value={stats?.properties.this_month || 0}
          subtitle="New listings added"
        />
        
        <StatCard
          title="Sold Properties"
          value={stats?.properties.sold || 0}
          subtitle="Completed sales"
        />
        
        <StatCard
          title="Active Agents"
          value={stats?.users.agents || 0}
          subtitle="Licensed professionals"
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        <ActivityFeed data={activity} />
        
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-xl lg:rounded-2xl border border-blue-200/60 shadow-md p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg sm:text-xl font-light text-gray-900 mb-4 sm:mb-5 lg:mb-6">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/properties/add')}
              className="w-full text-left p-4 border border-blue-200/50 rounded-xl hover:bg-blue-100/50 hover:border-blue-300/70 transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-800">Add New Property</div>
              <div className="text-sm text-gray-600 mt-1">Create a new property listing</div>
            </button>
            <button
              onClick={() => navigate('/admin/viewings')}
              className="w-full text-left p-4 border border-blue-200/50 rounded-xl hover:bg-blue-100/50 hover:border-blue-300/70 transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-800">View Pending Viewings</div>
              <div className="text-sm text-gray-600 mt-1">Manage viewing requests</div>
            </button>
            <button
              onClick={() => navigate('/admin/agents')}
              className="w-full text-left p-4 border border-blue-200/50 rounded-xl hover:bg-blue-100/50 hover:border-blue-300/70 transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-800">Manage Agents</div>
              <div className="text-sm text-gray-600 mt-1">View and edit agent profiles</div>
            </button>
            <button
              onClick={() => navigate('/admin/contacts')}
              className="w-full text-left p-4 border border-blue-200/50 rounded-xl hover:bg-blue-100/50 hover:border-blue-300/70 transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-800">View Contacts</div>
              <div className="text-sm text-gray-600 mt-1">Manage contact inquiries</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

