import React from 'react';

interface ActivityData {
  properties?: Array<{
    id: number;
    title: string;
    city: string;
    status: string;
    created_at: string;
  }>;
  contacts?: Array<{
    id: number;
    name: string;
    email: string;
    subject: string;
    created_at: string;
  }>;
  viewings?: Array<{
    id: number;
    property_title: string;
    preferred_date: string | null;
    status: string;
    created_at: string;
  }>;
}

interface ActivityFeedProps {
  data?: ActivityData;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'active':
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'sold':
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const allActivities = [
    ...(data?.properties?.map(prop => ({ ...prop, type: 'property' as const })) || []),
    ...(data?.contacts?.map(contact => ({ ...contact, type: 'contact' as const })) || []),
    ...(data?.viewings?.map(viewing => ({ ...viewing, type: 'viewing' as const })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

  return (
    <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-xl lg:rounded-2xl border border-blue-200/60 shadow-md p-4 sm:p-5 lg:p-6">
      <h2 className="text-lg sm:text-xl font-light text-gray-900 mb-4 sm:mb-5 lg:mb-6">Recent Activity</h2>
      <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
        {allActivities.length > 0 ? (
          allActivities.map((activity, index) => (
            <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-blue-200/50 rounded-lg sm:rounded-xl hover:bg-blue-100/40 hover:border-blue-300/60 transition-all duration-200">
              <div className="flex-1 min-w-0">
                {activity.type === 'property' && (
                  <>
                    <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{activity.city}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </>
                )}
                {activity.type === 'contact' && (
                  <>
                    <p className="font-medium text-gray-900 truncate">{activity.name}</p>
                    <p className="text-sm text-gray-500 truncate mt-1">{activity.email}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.subject}</p>
                  </>
                )}
                {activity.type === 'viewing' && (
                  <>
                    <p className="font-medium text-gray-900 truncate">{activity.property_title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.preferred_date && (
                        <>
                          <span className="text-sm text-gray-500">{activity.preferred_date}</span>
                          <span className="text-xs text-gray-400">•</span>
                        </>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </>
                )}
                <p className="text-xs text-gray-400 mt-2">{formatDate(activity.created_at)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};
