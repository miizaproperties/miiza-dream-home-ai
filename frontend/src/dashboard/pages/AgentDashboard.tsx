import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Building2, Users } from 'lucide-react';
import { useDashboardStats, useRecentActivity } from '../hooks/useDashboardStats';
import { StatCard } from '../components/StatCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { useAuth } from '../hooks/useAuth';

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 min-h-full bg-gradient-to-b from-gray-50 to-white">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-2 lg:mb-3 tracking-tight">Agent Dashboard</h1>
        <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ''}! Here's your overview.
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-xl p-3 sm:p-4">
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
          title="Pending Viewings"
          value={stats?.contacts.pending_viewings || 0}
          subtitle="Awaiting confirmation"
        />
        
        <StatCard
          title="Confirmed Viewings"
          value={stats?.contacts.confirmed_viewings || 0}
          subtitle="Scheduled viewings"
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
          title="Total Contacts"
          value={stats?.contacts.total || 0}
          subtitle="Inquiries received"
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        <ActivityFeed data={activity} />
        
        {/* Quick Actions for Agents */}
        <div className="bg-white rounded-xl lg:rounded-lg shadow p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/properties/add')}
              className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Home className="text-blue-600" />
              <div>
                <div className="font-semibold">Add New Property</div>
                <div className="text-sm text-gray-500">Create a new property listing</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/viewings')}
              className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Calendar className="text-green-600" />
              <div>
                <div className="font-semibold">View Pending Viewings</div>
                <div className="text-sm text-gray-500">Manage viewing requests</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/properties')}
              className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Building2 className="text-purple-600" />
              <div>
                <div className="font-semibold">View All Properties</div>
                <div className="text-sm text-gray-500">Browse and manage properties</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/contacts')}
              className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Users className="text-orange-600" />
              <div>
                <div className="font-semibold">View Contacts</div>
                <div className="text-sm text-gray-500">Manage contact inquiries</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

